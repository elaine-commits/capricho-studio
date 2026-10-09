// Disposable HTTPS proxy for testing the compiled production app, never deployment.
import https from "node:https";
import http from "node:http";
import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, cpSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const target = new URL(process.env.APP_URL ?? "https://localhost:3000");
if (
  target.protocol !== "https:" ||
  !["localhost", "127.0.0.1"].includes(target.hostname)
)
  throw new Error("Test server requires HTTPS loopback APP_URL");
const dir = mkdtempSync(join(tmpdir(), "studio-test-tls-"));
execFileSync(
  "openssl",
  [
    "req",
    "-x509",
    "-newkey",
    "rsa:2048",
    "-nodes",
    "-keyout",
    join(dir, "key.pem"),
    "-out",
    join(dir, "cert.pem"),
    "-days",
    "1",
    "-subj",
    "/CN=localhost",
    "-addext",
    "subjectAltName=DNS:localhost,IP:127.0.0.1",
  ],
  { stdio: "ignore" },
);
cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });
const child = spawn(process.execPath, [".next/standalone/server.js"], {
  env: {
    ...process.env,
    NODE_ENV: "production",
    HOSTNAME: "127.0.0.1",
    PORT: "3001",
  },
  stdio: "inherit",
});
const server = https.createServer(
  {
    key: readFileSync(join(dir, "key.pem")),
    cert: readFileSync(join(dir, "cert.pem")),
  },
  (request, response) => {
    const upstream = http.request(
      {
        hostname: "127.0.0.1",
        port: 3001,
        path: request.url,
        method: request.method,
        headers: { ...request.headers, "x-forwarded-proto": "https" },
      },
      (result) => {
        response.writeHead(result.statusCode ?? 503, result.headers);
        result.pipe(response);
      },
    );
    upstream.on("error", () => {
      if (!response.headersSent) response.writeHead(503);
      response.end();
    });
    request.pipe(upstream);
  },
);
server.listen(Number(target.port || 443), "127.0.0.1");
function stop() {
  child.kill();
  server.close();
  rmSync(dir, { recursive: true, force: true });
  process.exit(0);
}
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
child.on("exit", (code) => {
  server.close();
  rmSync(dir, { recursive: true, force: true });
  process.exit(code ?? 1);
});

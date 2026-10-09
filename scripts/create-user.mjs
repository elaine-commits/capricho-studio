import pg from "pg";
import { hash } from "bcryptjs";
const {
  DATABASE_URL,
  STUDIO_USER_EMAIL,
  STUDIO_USER_PASSWORD,
  STUDIO_USER_ROLE = "viewer",
} = process.env;
if (
  !DATABASE_URL ||
  !STUDIO_USER_EMAIL ||
  !STUDIO_USER_PASSWORD ||
  STUDIO_USER_PASSWORD.length < 14 ||
  !["admin", "editor", "reviewer", "viewer"].includes(STUDIO_USER_ROLE)
)
  throw new Error(
    "Configure banco, e-mail, senha de 14+ caracteres e papel válido via ambiente",
  );
const client = new pg.Client({ connectionString: DATABASE_URL });
await client.connect();
try {
  await client.query(
    "INSERT INTO studio_users(email,display_name,role,password_hash) VALUES($1,$2,$3,$4)",
    [
      STUDIO_USER_EMAIL.toLowerCase(),
      STUDIO_USER_EMAIL,
      STUDIO_USER_ROLE,
      await hash(STUDIO_USER_PASSWORD, 12),
    ],
  );
  console.log("Usuário criado");
} finally {
  await client.end();
}

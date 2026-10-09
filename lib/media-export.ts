export async function exportProductPng(
  url: string,
  width: number,
  height: number,
  filename: string,
) {
  if (width * height > 16_000_000)
    throw new Error("Exportação limitada a 16 megapixels.");
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.referrerPolicy = "no-referrer";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () =>
      reject(
        new Error("A origem precisa permitir leitura CORS da fotografia."),
      );
    image.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas indisponível");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  const scale = Math.min(
    (width * 0.9) / image.naturalWidth,
    (height * 0.9) / image.naturalHeight,
  );
  const w = image.naturalWidth * scale,
    h = image.naturalHeight * scale;
  context.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (v) =>
        v ? resolve(v) : reject(new Error("Falha ao exportar fotografia.")),
      "image/png",
    );
  });
  const link = document.createElement("a");
  const objectUrl = URL.createObjectURL(blob);
  link.href = objectUrl;
  link.download = filename + ".png";
  link.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
export function factualDescription(product: Record<string, unknown>) {
  const lines = [
    String(product.description ?? ""),
    "Marca: " + String(product.brand ?? ""),
    "SKU: " + String(product.sku ?? ""),
  ];
  if (product.applicationsVerified && product.applications)
    lines.push("Aplicações confirmadas: " + String(product.applications));
  return lines.join("\n");
}

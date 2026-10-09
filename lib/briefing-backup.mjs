export function validateBackup(input) {
  if (
    !input ||
    typeof input !== "object" ||
    input.version !== 1 ||
    !Array.isArray(input.briefings)
  )
    throw new Error("Formato de backup inválido");
  if (input.briefings.length > 10000)
    throw new Error("Limite de registros excedido");
  for (const item of input.briefings) {
    if (!item || typeof item !== "object") throw new Error("Registro inválido");
    for (const key of [
      "id",
      "title",
      "brand",
      "channel",
      "sku",
      "objective",
      "createdAt",
    ]) {
      if (typeof item[key] !== "string")
        throw new Error("Campo inválido: " + key);
    }
    if (!item.id || !item.title.trim() || !item.objective.trim())
      throw new Error("Campos obrigatórios ausentes");
  }
  return input.briefings;
}
export function mergeBriefings(current, incoming) {
  const ids = new Set(current.map((item) => item.id));
  return [
    ...current,
    ...incoming.filter((item) => {
      if (ids.has(item.id)) return false;
      ids.add(item.id);
      return true;
    }),
  ];
}

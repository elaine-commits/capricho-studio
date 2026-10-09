"use client";
import { useEffect, useState, useRef } from "react";
import { exportProductPng, factualDescription } from "../lib/media-export";
type Item = {
  id: string;
  title: string;
  status: string;
  updated_at: string;
  data: Record<string, unknown>;
};
const modules: Record<
  string,
  { name: string; fields: Record<string, string> }
> = {
  products: {
    name: "Produtos e SKUs",
    fields: {
      sku: "SKU",
      brand: "Marca",
      description: "Descrição técnica",
      supplierCode: "Código do fornecedor",
      applications: "Aplicações confirmadas",
      applicationsVerified: "Aplicações verificadas",
    },
  },
  assets: {
    name: "Biblioteca de imagens",
    fields: {
      productId: "Produto",
      url: "URL HTTPS da fotografia",
      source: "Origem da fotografia",
      rightsConfirmed: "Direitos de uso confirmados",
      realPhoto: "Fotografia real do produto",
    },
  },
  pieces: {
    name: "Peças para marketplaces",
    fields: {
      productId: "Produto",
      assetId: "Fotografia",
      channel: "Canal",
      width: "Largura em pixels",
      height: "Altura em pixels",
      copy: "Texto da peça",
    },
  },
  descriptions: {
    name: "Descrições",
    fields: {
      productId: "Produto",
      channel: "Canal",
      content: "Descrição validada",
    },
  },
  campaigns: {
    name: "Campanhas",
    fields: {
      objective: "Objetivo",
      channel: "Canal",
      startDate: "Início",
      endDate: "Fim",
    },
  },
  videos: {
    name: "Vídeos",
    fields: {
      productId: "Produto",
      assetId: "Fotografia de referência",
      script: "Roteiro",
      url: "URL HTTPS do vídeo (opcional)",
    },
  },
};
const checks = {
  fidelity: "Fidelidade ao produto real",
  portuguese: "Português e acentuação",
  brand: "Identidade preto, prata, branco e vermelho",
  rights: "Direitos de uso e origem",
  dimensions: "Formato e área segura",
};
export default function Home() {
  const [user, setUser] = useState<{
      display_name: string;
      role: string;
    } | null>(null),
    [kind, setKind] = useState("products"),
    [items, setItems] = useState<Item[]>([]),
    [products, setProducts] = useState<Item[]>([]),
    [assets, setAssets] = useState<Item[]>([]),
    [editing, setEditing] = useState<Item | null>(null),
    [title, setTitle] = useState(""),
    [data, setData] = useState<Record<string, unknown>>({}),
    [message, setMessage] = useState(""),
    [review, setReview] = useState<Item | null>(null),
    [qa, setQa] = useState<Record<string, boolean>>({}),
    [notes, setNotes] = useState("");
  const generation = useRef(0);
  async function api(url: string, body?: unknown, method = "POST") {
    const result = await fetch(
      url,
      body
        ? {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        : undefined,
    );
    const json = await result.json();
    if (!result.ok) {
      if (result.status === 401) location.href = "/login";
      throw new Error(json.error);
    }
    return json;
  }
  async function refresh() {
    const current = ++generation.current;
    try {
      const [records, productList, assetList] = await Promise.all([
        api("/api/records/" + kind),
        api("/api/records/products"),
        api("/api/records/assets"),
      ]);
      if (current !== generation.current) return;
      setItems(records);
      setProducts(productList);
      setAssets(assetList);
    } catch (e) {
      if (current === generation.current) setMessage((e as Error).message);
    }
  }
  useEffect(() => {
    api("/api/auth/me")
      .then(setUser)
      .catch((e) => setMessage(e.message));
  }, []);
  useEffect(() => {
    setData({});
    setTitle("");
    setReview(null);
    setEditing(null);
    void refresh();
  }, [kind]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...data };
      for (const field of Object.keys(modules[kind].fields)) {
        if (
          ["rightsConfirmed", "realPhoto", "applicationsVerified"].includes(
            field,
          )
        )
          payload[field] = !!data[field];
        else if (["width", "height"].includes(field))
          payload[field] = Number(data[field]);
        else if (!(field === "url" && kind === "videos" && !data[field]))
          payload[field] = data[field] ?? "";
      }
      await api(
        "/api/records/" + kind,
        {
          title,
          data: payload,
          ...(editing ? { id: editing.id, updatedAt: editing.updated_at } : {}),
        },
        editing ? "PATCH" : "POST",
      );
      setEditing(null);
      setTitle("");
      setData({});
      setMessage("Registro salvo no PostgreSQL.");
      await refresh();
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  return (
    <div className="shell">
      <aside className="side">
        <div className="logo">
          STUDIO<span>.</span>
        </div>
        <small>Capricho Imports</small>
        <nav>
          {Object.entries(modules).map(([id, m]) => (
            <button
              key={id}
              disabled={!user}
              onClick={() => setKind(id)}
              aria-current={kind === id ? "page" : undefined}
            >
              {m.name}
            </button>
          ))}
        </nav>
        <a href="/legacy">Briefings locais anteriores</a>
        <small className="foot">Marketing → STUDIO · QORE</small>
      </aside>
      <main>
        <header>
          <div>
            <div className="eyebrow">Marketing / STUDIO</div>
            <h1>{modules[kind].name}</h1>
            <p>
              {user?.display_name} · {user?.role}
            </p>
          </div>
          <button
            disabled={!user}
            onClick={async () => {
              await api("/api/auth/logout", {});
              location.href = "/login";
            }}
          >
            Sair
          </button>
        </header>
        <div className="hero">
          <h2>Produção com dados reais</h2>
          <p>
            Cadastre informações verificadas e fotografias com origem. A
            aprovação exige revisão independente.
          </p>
        </div>
        <p role="status">{message}</p>
        {["admin", "editor"].includes(user?.role ?? "") && (
          <form onSubmit={save}>
            <label>
              Título
              <input
                required
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            {Object.entries(modules[kind].fields).map(([field, label]) => (
              <label key={field}>
                {label}
                {["productId", "assetId"].includes(field) ? (
                  <select
                    required
                    value={String(data[field] ?? "")}
                    onChange={(e) =>
                      setData({
                        ...data,
                        [field]: e.target.value,
                        ...(field === "productId" ? { assetId: "" } : {}),
                      })
                    }
                  >
                    <option value="">Selecione</option>
                    {(field === "productId"
                      ? products
                      : assets.filter(
                          (a) => a.data.productId === data.productId,
                        )
                    ).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                ) : [
                    "rightsConfirmed",
                    "realPhoto",
                    "applicationsVerified",
                  ].includes(field) ? (
                  <input
                    type="checkbox"
                    checked={!!data[field]}
                    onChange={(e) =>
                      setData({ ...data, [field]: e.target.checked })
                    }
                  />
                ) : field === "channel" && kind === "pieces" ? (
                  <select
                    required
                    value={String(data[field] ?? "")}
                    onChange={(e) =>
                      setData({
                        ...data,
                        [field]: e.target.value,
                      })
                    }
                  >
                    <option value="">Selecione</option>
                    {[
                      "Mercado Livre",
                      "Shopee",
                      "Amazon",
                      "Instagram",
                      "WhatsApp",
                      "Site",
                    ].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                ) : [
                    "description",
                    "applications",
                    "copy",
                    "content",
                    "objective",
                    "script",
                  ].includes(field) ? (
                  <textarea
                    required={!["applications", "copy"].includes(field)}
                    rows={4}
                    maxLength={3000}
                    value={String(data[field] ?? "")}
                    onChange={(e) =>
                      setData({ ...data, [field]: e.target.value })
                    }
                  />
                ) : (
                  <input
                    required={
                      !(field === "url" && kind === "videos") &&
                      !["supplierCode", "applications"].includes(field)
                    }
                    type={
                      field.endsWith("Date")
                        ? "date"
                        : ["width", "height"].includes(field)
                          ? "number"
                          : field === "url"
                            ? "url"
                            : "text"
                    }
                    value={String(data[field] ?? "")}
                    onChange={(e) =>
                      setData({
                        ...data,
                        [field]: e.target.value,
                        ...(field === "productId" ? { assetId: "" } : {}),
                      })
                    }
                  />
                )}
              </label>
            ))}
            {kind === "descriptions" && (
              <button
                type="button"
                onClick={() => {
                  const product = products.find((p) => p.id === data.productId);
                  if (product)
                    setData({
                      ...data,
                      content: factualDescription(product.data),
                    });
                  else setMessage("Selecione um produto primeiro.");
                }}
              >
                Preencher com dados do produto
              </button>
            )}
            <button className="primary">
              {editing ? "Salvar alterações" : "Salvar registro"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setTitle("");
                  setData({});
                }}
              >
                Cancelar edição
              </button>
            )}
          </form>
        )}
        {kind === "assets" &&
          ["admin", "editor"].includes(user?.role ?? "") && (
            <section>
              <h2>Enviar fotografia real</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  try {
                    const response = await fetch("/api/assets/upload", {
                      method: "POST",
                      body: new FormData(form),
                    });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.error);
                    form.reset();
                    setMessage("Fotografia salva em armazenamento privado.");
                    await refresh();
                  } catch (error) {
                    setMessage((error as Error).message);
                  }
                }}
              >
                <label>
                  Produto da fotografia
                  <select name="productId" required>
                    <option value="">Selecione</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Origem do arquivo
                  <input name="source" required maxLength={3000} />
                </label>
                <label>
                  Arquivo PNG, JPEG ou WebP
                  <input
                    type="file"
                    name="file"
                    accept="image/png,image/jpeg,image/webp"
                    required
                  />
                </label>
                <label>
                  Autorização de uso confirmada
                  <input
                    name="rightsConfirmed"
                    type="checkbox"
                    value="true"
                    required
                  />
                </label>
                <label>
                  Fotografia original do produto
                  <input
                    name="realPhoto"
                    type="checkbox"
                    value="true"
                    required
                  />
                </label>
                <button className="primary">Enviar fotografia</button>
              </form>
            </section>
          )}
        <section className="list">
          <h2>Registros ({items.length})</h2>
          {items.map((item) => (
            <article key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <p>Estado: {item.status}</p>
                {["admin", "editor"].includes(user?.role ?? "") &&
                  ["draft", "rejected"].includes(item.status) && (
                    <button
                      onClick={() => {
                        setEditing(item);
                        setTitle(item.title);
                        setData(item.data);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Editar
                    </button>
                  )}
                {kind === "assets" && (
                  <img
                    src={String(item.data.url)}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    style={{
                      maxWidth: 240,
                      maxHeight: 240,
                      objectFit: "contain",
                    }}
                  />
                )}
                {kind === "pieces" && (
                  <button
                    disabled={item.status !== "approved"}
                    onClick={async () => {
                      try {
                        const asset = assets.find(
                          (a) => a.id === item.data.assetId,
                        );
                        if (!asset)
                          throw new Error("Fotografia não encontrada");
                        if (item.data.copy)
                          throw new Error(
                            "Este exportador prepara a foto principal sem texto. Use texto vazio para exportar.",
                          );
                        await exportProductPng(
                          String(asset.data.url),
                          Number(item.data.width),
                          Number(item.data.height),
                          "studio-" + item.id,
                        );
                      } catch (e) {
                        setMessage((e as Error).message);
                      }
                    }}
                  >
                    Exportar fotografia PNG aprovada
                  </button>
                )}
                {Object.entries(item.data).map(([key, value]) => (
                  <p key={key}>
                    {modules[kind].fields[key] ?? key}:{" "}
                    {typeof value === "boolean"
                      ? value
                        ? "Sim"
                        : "Não"
                      : String(value)}
                  </p>
                ))}
                {["admin", "reviewer"].includes(user?.role ?? "") && (
                  <button
                    onClick={() => {
                      setReview(item);
                      setQa({});
                      setNotes("");
                    }}
                  >
                    QA Guardian
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
        {review && (
          <section>
            <h2>Auditoria: {review.title}</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api("/api/reviews", {
                    recordId: review.id,
                    decision: "approved",
                    checklist: qa,
                    notes,
                  });
                  setReview(null);
                  setMessage("Aprovação registrada.");
                  await refresh();
                } catch (e) {
                  setMessage((e as Error).message);
                }
              }}
            >
              {Object.entries(checks).map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    type="checkbox"
                    checked={!!qa[key]}
                    onChange={(e) => setQa({ ...qa, [key]: e.target.checked })}
                  />
                </label>
              ))}
              <label>
                Evidências e observações
                <textarea
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>
              <button className="primary">Aprovar</button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await api("/api/reviews", {
                      recordId: review.id,
                      decision: "rejected",
                      checklist: qa,
                      notes,
                    });
                    setReview(null);
                    await refresh();
                  } catch (e) {
                    setMessage((e as Error).message);
                  }
                }}
              >
                Reprovar
              </button>
            </form>
          </section>
        )}
        <section>
          <h2>Integrações</h2>
          <p>
            QORE, Google Drive, marketplaces e geração de mídia: não conectados.
            Dependem de homologação de API e credenciais.
          </p>
          <p>
            Peças e vídeos armazenam especificações, roteiro e referências.
            Exportação PNG disponível para fotografia principal aprovada, sem
            texto e com origem CORS autorizada. Edição de camadas e renderização
            de vídeo pendentes.
          </p>
        </section>
      </main>
    </div>
  );
}

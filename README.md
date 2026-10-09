# STUDIO — Capricho Imports

Aplicativo Next.js para QORE → Marketing → STUDIO. Fundação empresarial em desenvolvimento; **não homologado para produção**.

Inclui login, sessões PostgreSQL, papéis admin/editor/reviewer/viewer, produtos/SKUs, referências de fotografias reais, especificações de peças, descrições, campanhas, roteiros/vídeos e checklist QA independente. Leia [auditoria e limitações](docs/AUDIT.md), [autenticação](docs/AUTH_DATABASE.md) e [Hostinger](docs/HOSTINGER.md).

## Executar

Node 22 e PostgreSQL 15+. Configurar DATABASE_URL e APP_URL usando `.env.example` como referência. Scripts Node precisam das variáveis exportadas no ambiente; Next carrega `.env.local`.

```sh
npm ci
npm run migrate
npm run user:create
npm run dev
```

O script de usuário exige STUDIO_USER_EMAIL, STUDIO_USER_PASSWORD e STUDIO_USER_ROLE. Nunca enviar segredos ao Git. Não há senha padrão, cadastro público ou integração externa ativa.

## Validar

```sh
npm test
npm run typecheck
npm run build
npm audit --omit=dev
npx playwright install chromium
npm run test:e2e
```

Testes de banco exigem DATABASE_URL de banco descartável já migrado. Sem banco, são explicitamente ignorados. CI utiliza PostgreSQL real e Chromium. Nenhum teste ignorado conta como aprovação.

Repositório público: apenas código, configuração exemplo e fixtures sintéticas. Fotografias e dados empresariais devem ficar no armazenamento privado, fora do repositório.

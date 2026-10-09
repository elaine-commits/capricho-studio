# Resultados de validação — 09/10/2026

## Local
- npm ci/install: dependências instaladas e lockfile versionado.
- npm run typecheck: aprovado.
- npm test: 16 aprovados, zero ignorados.
- npm run build: aprovado; 13 rotas/páginas.
- npm audit --omit=dev: zero vulnerabilidades.
- Testes HTTP: saúde/login, acesso anônimo e origem inválida aprovados. JSON inválido/grande também aprovado (4 testes HTTP no total).
- Os quatro testes HTTP também passaram no build de produção servido por HTTPS com certificado descartável. PostgreSQL e Chromium indisponíveis neste ambiente local; testes completos transferidos para CI, sem considerar skips como aprovação.

## GitHub Actions
Primeira execução (commit 26bfcc7063706e0f603c4edd419cdd92aab1b687): build, auditoria, testes unitários e duas execuções de migração PostgreSQL 16 aprovadas. Fluxo autenticado de API aprovado. Interface falhou no login; política CSP incompatível com avaliação de scripts do modo de desenvolvimento foi corrigida. Reexecução passou pelo login, mas mostrou clique na navegação antes da hidratação. Navegação foi desabilitada até carregar a identidade. Cobertura ampliada de API com uploads e QA passou; interface/exportação ainda em revalidação contra build de produção com HTTPS e cookies Secure, sem Fast Refresh.

A suíte atual cobre PostgreSQL, login/logout, viewer bloqueado para escrita, SKU duplicado, edição concorrente, módulos, associação incorreta de foto, upload/consulta privada, revisão independente inclusive admin, dependências antes da aprovação, navegação no navegador e exportação PNG 1200×1200 com fundo branco. Todos os dados de teste são sintéticos.

Deploy, restauração, QORE e APIs externas: não testados. Nenhuma publicação em produção.

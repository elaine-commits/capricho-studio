# Resultados de validação — 09/10/2026

Código validado: `c4ce152e1c1ac7c6d749fdb420ff75f283177623`.

[Execução aprovada no GitHub Actions](https://github.com/elaine-commits/capricho-studio/actions/runs/37955433473).

| Verificação | Resultado |
| --- | --- |
| npm ci | Aprovado com lockfile |
| npm run typecheck | Aprovado |
| npm test | 16 aprovados, zero ignorados |
| npm run build | Aprovado; 13 rotas/páginas |
| npm audit --omit=dev | Zero vulnerabilidades |
| PostgreSQL 16: migrações | Primeira execução e repetição aprovadas |
| Playwright API e navegador Chromium | 6 aprovados, zero ignorados |
| Aplicativo compilado, modo produção e HTTPS | Aprovado em ambiente de teste isolado |

## Cobertura real

A suíte usa banco PostgreSQL descartável e dados sintéticos. Valida:

- Login/logout e cookie HttpOnly/Secure sobre HTTPS.
- Acesso anônimo negado; viewer sem escrita; editor sem aprovação.
- SKU duplicado, atualização de rascunho e rejeição de versão desatualizada.
- Criação de produtos, referências de fotos, peças, descrições, campanhas e roteiros/vídeos.
- Rejeição de fotografia vinculada ao produto errado.
- Upload PNG privado, leitura autenticada e recusa de leitura anônima.
- Checklist incompleto rejeitado e revisão independente, inclusive proibição de autoaprovação pelo admin.
- Produto/fotografia precisam de aprovação anterior à peça.
- Navegação e duas sessões no navegador (viewer e editor).
- Exportação PNG aprovada, com dimensões 1200×1200 e pixels de fundo branco conferidos com Sharp.
- Recusa de origem não autorizada, JSON inválido e corpo maior que 32 KB.

## Falhas encontradas e corrigidas

A primeira suíte de navegador falhou por incompatibilidade de CSP com o modo de desenvolvimento. Reexecuções revelaram interações antes da hidratação e recarga Fast Refresh entre sessões. Os controles aguardam hidratação/identidade; a homologação automatizada passou a usar build de produção com proxy HTTPS e certificado descartável exclusivo de teste. Nenhum relaxamento de verificação TLS foi introduzido no aplicativo ou na implantação real: a exceção pertence somente ao Playwright de teste.

Localmente, TypeScript, build, 16 testes unitários, quatro testes HTTP sobre HTTPS e auditoria de dependências passaram. PostgreSQL e navegador foram validados no CI, onde os recursos estavam disponíveis.

## Limites da validação

Não foram testados: dados reais, volume empresarial, cargas concorrentes extensas, pen-test, Docker/Hostinger em infraestrutura real, restauração de backups, QORE ou APIs externas. Fotografias sintéticas confirmam o fluxo e o arquivo exportado, não substituem auditoria visual de produtos reais. Edição/renderização de vídeo, editor de camadas e SSO continuam pendentes. Consulte AUDIT.md.

Nenhuma publicação em produção. Alterações posteriores exclusivamente neste relatório não modificam o código testado acima.

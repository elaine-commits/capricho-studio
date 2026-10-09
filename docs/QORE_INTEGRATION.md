# QORE → Marketing → STUDIO

## Integração inicial preparada
Configurar o menu Marketing → STUDIO no QORE para abrir a URL HTTPS homologada. Login STUDIO separado; nenhuma sessão QORE é confiada automaticamente e nenhuma senha do ERP é armazenada no STUDIO. Iframe bloqueado por CSP e X-Frame-Options.

## Antes de conectar APIs
Solicitar documentação/versionamento das APIs QORE, base URL de homologação, escopos de leitura de produtos e fotografias, vínculo SKU/código fornecedor, empresa/filial, regras de aplicações e autenticação suportada. Credenciais ficam somente no servidor/secret manager.

Validar resposta real em homologação: SKU estável, descrição, marca, código fornecedor, aplicações explicitamente confirmadas e URL/foto autorizada. Confirmar isolamento entre empresas e se uma mesma peça pode ter mais de um SKU. Nenhum sincronismo foi implementado sem esse contrato.

SSO futuro exige issuer, audience, JWKS, redirects e mapeamento de identidade e papéis. Não aceitar role, e-mail ou user_id enviados pelo QORE no navegador sem validação de assinatura e finalidade. Integração existente no código é apenas indicação de menu/link; não há SSO ou sincronização ativa.

## API STUDIO disponível
Todos os endpoints de negócio exigem sessão. Escrita exige Origin igual a APP_URL. Não são endpoints públicos para uso por terceiros com uma simples API key.

| Método / endpoint | Operação |
| --- | --- |
| POST /api/auth/login | Iniciar sessão |
| POST /api/auth/logout | Revogar sessão |
| GET /api/auth/me | Identidade e papel atual |
| GET /api/records/{kind} | Listar até 500 registros |
| POST /api/records/{kind} | Criar registro validado |
| PATCH /api/records/{kind} | Editar rascunho/reprovado com updatedAt |
| POST /api/assets/upload | Upload privado multipart até 10 MB |
| GET /api/assets/{id} | Ler arquivo privado autenticado |
| POST /api/reviews | Aprovar/reprovar com checklist e evidências |
| GET /api/health | Liveness |
| GET /api/ready | PostgreSQL/migrações disponíveis |

Kinds: products, assets, pieces, descriptions, campaigns, videos. Aprovação exige pessoa diferente do autor e aprovação anterior de produto/fotografia vinculados. Registros aprovados não são editados; crie nova versão.

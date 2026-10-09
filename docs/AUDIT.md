# Auditoria e escopo

## Base auditada
Protótipo 0.3: diretiva use client depois de import; persistência apenas local; módulos estáticos; permissões sem integração com rotas; SQL não aplicado; ausência de lockfile; CI instalava dependências após testes; testes de contrato verificavam apenas texto SQL. Backup local validava dados sem persistência central. Nenhuma API externa conectada.

## Implementação
Sessões opacas aleatórias, hash SHA-256 do token no banco, senha bcrypt custo 12, cookie HttpOnly/SameSite Strict/Secure em produção, expiração de oito horas, logout revoga token. Limitação de login persistida por e-mail. Origem de escrita verificada por APP_URL. APIs negam usuários inativos e validam papéis no servidor. PostgreSQL parametrizado; criações e revisões com trilha de auditoria transacional. Schema Zod, SKU único, vínculo foto/produto, referência HTTPS e declaração de origem/direitos/foto real. QA exige cinco critérios e autor diferente do revisor; nenhuma nota automática 10/10.

Produtos, biblioteca, especificações de peças, descrições, campanhas e roteiros/vídeos têm formulários e listagem persistente. Identidade preservada em preto/prata/branco/vermelho. Nenhuma característica de produto gerada automaticamente. Testes usam somente fixtures sintéticas.

## Limitações e pendências
- Biblioteca registra URLs; ainda não faz upload, versionamento, armazenamento privado ou verificação visual da fotografia.
- Peças registram formato, canal, fotografia e texto; exportação gráfica, editor de camadas e integração Canva pendentes.
- Descrições são inseridas por usuário; enriquecimento externo e geração assistida pendentes.
- Vídeos registram roteiro e referência/link; renderização/edição pendentes.
- Listagem limitada aos 500 registros recentes; paginação, busca, edição e arquivamento pendentes.
- Briefings locais antigos continuam no navegador, mas interface anterior foi substituída. Importação para banco ainda pendente. Não apagar localStorage; utilizar backup JSON da versão anterior para migração posterior.
- QA humano: checklist não comprova sozinho fidelidade/português, precisa de evidência e inspeção real.
- Cadastro/gestão de usuários por script administrativo; redefinição de senha, MFA e SSO ainda pendentes. Rate limit por IP/proxy e limpeza periódica de sessões/limites pendentes.
- QORE, Drive, marketplaces, IA e redes sociais não conectados. Nenhuma credencial solicitada ou API de negócio assumida.
- Docker/Hostinger, restauração e segurança em infraestrutura real ainda não homologados.

Não classificar o aplicativo como pronto para produção enquanto essas pendências e testes de homologação estiverem abertos.

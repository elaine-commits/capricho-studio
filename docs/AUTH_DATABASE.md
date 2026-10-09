# STUDIO — autenticação e persistência (fundação, não implantada)

## Situação

O projeto ainda não possui autenticação funcional nem banco de dados conectado. A migração SQL em `db/migrations/001_studio_foundation.sql` é uma proposta de esquema PostgreSQL, **não executada** em nenhum servidor.

## Fluxo planejado

1. STUDIO inicia independente do QORE.
2. Configurar provedor de identidade seguro (OIDC/OAuth) com validação server-side, sessão HttpOnly Secure e proteção CSRF.
3. Associar identidade autenticada ao `studio_users` por ID estável; nunca confiar em role enviada pelo navegador.
4. Autorizar cada operação de briefings no servidor: `admin` e `editor` criam/editam; `reviewer` aprova/rejeita; `viewer` apenas consulta, conforme matriz a homologar.
5. Registrar alterações em `studio_audit_log` dentro de transações.
6. Somente depois, substituir localStorage por APIs autenticadas e migrar rascunhos com confirmação do usuário.
7. Integração posterior: vincular `external_qore_user_id` ao cadastro de usuários do QORE sem armazenar senhas do QORE no STUDIO.

## Requisitos de segurança

- Não publicar dados empresariais reais no repositório público.
- Credenciais exclusivamente em variáveis de ambiente do servidor ou secret manager.
- Nunca disponibilizar conexão PostgreSQL diretamente ao cliente.
- Validar permissões em todas as rotas, não apenas ocultar botões.
- Usar TLS, backups testados, logs com retenção definida, limites de requisição e revisão de privacidade/LGPD.
- Não executar migração no banco do ERP sem aprovação e plano de rollback.

## Homologação

Pendente: definir hospedagem, provedor de autenticação, configuração do PostgreSQL, backups, matriz de permissões e testes de ponta a ponta.

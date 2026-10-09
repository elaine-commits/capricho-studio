# Autenticação e PostgreSQL

Migrações 001 e 002 são aplicadas via npm run migrate em banco dedicado. Login utiliza bcrypt, sessões opacas armazenadas somente por hash, cookies HttpOnly, SameSite Strict e Secure em produção. Papéis e estado ativo são obtidos do banco a cada operação. Senhas do QORE não são copiadas.

Matriz: admin/editor criam registros; todos os usuários ativos consultam; admin/reviewer podem aprovar/reprovar, desde que diferentes do autor. Papéis não são aceitos do cliente. Aprovação exige checklist completo. Criação e auditoria são transacionais.

Usuários são provisionados por npm run user:create, sem senha padrão. Ativação/desativação e mudança de papel requerem administração do banco por responsável autorizado até existir tela própria. Desativação tem efeito na próxima requisição.

Antes de produção: confirmar matriz empresarial, fluxo de recuperação, MFA/SSO, política de retenção, TLS, backups restauráveis e configuração do proxy. Nenhuma alteração foi feita no banco ou autenticação do QORE.

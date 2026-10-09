# Implantação preparada, não executada

Confirmar plano Hostinger: esta aplicação exige Node.js persistente e PostgreSQL (VPS/Docker ou serviço compatível). Hospedagem somente PHP/estática não atende.

1. Criar ambiente de homologação isolado e banco exclusivo STUDIO. Não aplicar migrações no QORE.
2. Configurar DATABASE_URL e APP_URL no ambiente seguro, fora do Git. Usar senha forte e TLS se banco remoto.
3. Instalar Node 22, executar npm ci, npm run migrate, npm run build. Criar usuário inicial pelo script user:create com variáveis STUDIO_USER_EMAIL, STUDIO_USER_PASSWORD (14+ caracteres), STUDIO_USER_ROLE=admin. Não colocar senha na linha de comando/histórico.
4. Executar npm start atrás de proxy HTTPS, bind privado e firewall. Alternativa: Dockerfile e deploy/compose.yml. Migrações e criação de usuário executadas a partir de checkout administrativo antes de iniciar app; imagem standalone não contém ferramentas administrativas.
5. Validar login, logout, viewer bloqueado para escrita, produtos, fotos e auditoria independente. Confirmar cookies Secure/HttpOnly. Testar backup pg_dump e restauração em banco isolado.
6. Definir retenção, recuperação de senha, MFA/SSO, papéis, responsáveis e monitoramento antes de uso empresarial.
7. Publicar apenas após autorização expressa. Nenhum deploy automático está configurado.

QORE: usar link autenticado para / no menu Marketing → STUDIO. Sessões são independentes. SSO/OIDC exige contrato homologado (issuer, audience, redirect URI, mapeamento de usuários). A aplicação bloqueia iframe por segurança; alterar somente após decisão de segurança explícita.

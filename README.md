# STUDIO — Capricho Imports

Aplicação web independente para produção de marketing, planejada para integração futura ao **QORE ERP → Marketing → STUDIO**.

## Versão atual: 0.3 (protótipo)

- Interface responsiva com identidade Capricho Imports (preto, prata, branco e vermelho).
- Cadastro de briefings por marca, canal, SKU e objetivo.
- Pesquisa, exclusão com confirmação e exportação JSON.
- Dados persistidos **apenas no navegador** (localStorage).
- Endpoint de saúde: `GET /api/health`.
- Workflow GitHub Actions para verificar TypeScript e build.

**Não implementado:** autenticação, banco de dados, geração de imagens, QA Guardian, integrações QORE/Drive/marketplaces, hospedagem em produção.

## Executar localmente

Requisitos: Node.js 22 e npm.

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Abra http://localhost:3000.

## Segurança

Este repositório foi identificado como **público**. Não adicione tokens, segredos, dados internos, imagens proprietárias ou dados de clientes. O arquivo `.env.example` contém somente exemplos de variáveis, sem credenciais. Arquivos `.env` reais são ignorados pelo Git.

## Próximas etapas

1. Verificar CI e corrigir erros reais de build.
2. Criar persistência em banco de dados e autenticação.
3. Implementar biblioteca de ativos e cadastro de produtos.
4. Implementar fluxos de produção e auditoria visual.
5. Conectar ao QORE ERP após homologação das APIs.

Nenhuma funcionalidade deve ser marcada como homologada sem testes reais.

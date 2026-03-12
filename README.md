# Winthor Internal API

API interna somente leitura em Node.js + TypeScript para consumir VIEWs Oracle do schema `WINTHOR` e expor endpoints REST para integrações com `n8n` e portal logístico.

## Stack

- Node.js
- TypeScript
- Fastify
- Oracle Database Driver (`oracledb`)
- Zod
- dotenv
- Pino (logger nativo do Fastify)
- Helmet
- CORS

## Endpoints

- `GET /health`
- `GET /api/pedidos`
- `GET /api/pedidos/:id`
- `GET /api/cargas`
- `GET /api/cargas/:id`
- `GET /api/cargas/:id/pedidos`
- `GET /api/entregas`
- `GET /api/entregas/:nota`

## Estrutura

```text
src/
  app.ts
  server.ts
  config/
    env.ts
    oracle.ts
  lib/
    pagination.ts
    sql.ts
  middlewares/
    apiKey.ts
    errorHandler.ts
  routes/
    health.ts
    pedidos.ts
    cargas.ts
    entregas.ts
  services/
    pedidos.service.ts
    cargas.service.ts
    entregas.service.ts
  types/
    api.ts
```

## Requisitos

- Node.js 20+
- Acesso ao Oracle via `ORACLE_CONNECT_STRING`
- Permissão de leitura nas VIEWs:
  - `WINTHOR.VW_VEXOR_PEDIDOS`
  - `WINTHOR.VW_VEXOR_CARGAS`
  - `WINTHOR.VW_VEXOR_CARGA_PEDIDOS`
  - `WINTHOR.VW_VEXOR_ENTREGAS`

## Configuração

1. Instale as dependências:

```bash
npm install
```

2. Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

3. Preencha as variáveis:

```env
API_KEY=SUA_CHAVE_AQUI
ORACLE_USER=WINTHOR
ORACLE_PASSWORD=SUA_SENHA_AQUI
ORACLE_CONNECT_STRING=WINT
```

## Execução

Modo desenvolvimento:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Produção:

```bash
npm start
```

## Docker

O projeto já está preparado para subir em container Linux usando o `Dockerfile` deste repositório.

### Build da imagem

```bash
docker build -t winthor-internal-api .
```

### Rodar localmente com Docker

```bash
docker run --env-file .env -p 3000:3000 winthor-internal-api
```

### Rodar com Docker Compose

```bash
docker compose up --build -d
```

### Como publicar no GitHub e usar no Hostinger

1. Suba este projeto completo para um repositório no GitHub.
2. No Hostinger, crie a aplicação/container apontando para o repositório.
3. Informe que o projeto usa o arquivo `Dockerfile` na raiz.
4. Configure as variáveis de ambiente no painel do Hostinger.
5. Publique a aplicação.

Variáveis mínimas no Hostinger:

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
API_KEY=SUA_CHAVE_REAL
ORACLE_USER=WINTHOR
ORACLE_PASSWORD=SUA_SENHA_REAL
ORACLE_CONNECT_STRING=WINT
ORACLE_POOL_MIN=1
ORACLE_POOL_MAX=10
ORACLE_POOL_INCREMENT=1
ORACLE_QUEUE_TIMEOUT_MS=5000
ORACLE_CALL_TIMEOUT_MS=15000
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
```

Observação:

- A imagem não grava senha nem token internamente.
- Tudo entra por variáveis de ambiente no Hostinger.
- O driver `oracledb` está operando em modo Thin, ideal para container sem Oracle Instant Client.

## GitHub Actions

O repositório agora inclui o workflow [docker.yml](C:\Users\ADM\Documents\Playground\.github\workflows\docker.yml).

Esse workflow faz:

- `npm ci`
- `npm run typecheck`
- `npm run build`
- `docker build` da imagem
- push automático para `GHCR` em `push` para `main` ou `master`

Imagem publicada no GitHub Container Registry:

```text
ghcr.io/SEU_USUARIO_OU_ORG/SEU_REPOSITORIO
```

Para usar no Hostinger, você pode escolher um destes caminhos:

1. Build pelo próprio `Dockerfile` a partir do GitHub.
2. Publicar a imagem no `GHCR` e mandar o Hostinger puxar a imagem pronta.

Se usar `GHCR`, talvez seja necessário liberar o pacote como público no GitHub, dependendo da forma como o Hostinger vai puxar a imagem.

## Autenticação

Todos os endpoints sob `/api` exigem o header:

```http
x-api-key: SUA_CHAVE_AQUI
```

O endpoint `/health` é público para facilitar monitoramento.

## Exemplos com curl

Healthcheck:

```bash
curl http://localhost:3000/health
```

Listar pedidos:

```bash
curl -H "x-api-key: SUA_CHAVE_AQUI" "http://localhost:3000/api/pedidos?page=1&limit=20&filial=1&status=FATURADO"
```

Buscar pedido:

```bash
curl -H "x-api-key: SUA_CHAVE_AQUI" "http://localhost:3000/api/pedidos/12345"
```

Listar cargas:

```bash
curl -H "x-api-key: SUA_CHAVE_AQUI" "http://localhost:3000/api/cargas?page=1&limit=20&motoristaId=99"
```

Buscar carga:

```bash
curl -H "x-api-key: SUA_CHAVE_AQUI" "http://localhost:3000/api/cargas/876"
```

Pedidos por carga:

```bash
curl -H "x-api-key: SUA_CHAVE_AQUI" "http://localhost:3000/api/cargas/876/pedidos?page=1&limit=50"
```

Listar entregas:

```bash
curl -H "x-api-key: SUA_CHAVE_AQUI" "http://localhost:3000/api/entregas?page=1&limit=20&numNota=998877"
```

Buscar entrega por nota:

```bash
curl -H "x-api-key: SUA_CHAVE_AQUI" "http://localhost:3000/api/entregas/998877"
```

## Paginação

A API usa `OFFSET ... FETCH NEXT ... ROWS ONLY` no Oracle.

Resposta paginada:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

Resposta unitária:

```json
{
  "success": true,
  "data": {}
}
```

Resposta de erro:

```json
{
  "success": false,
  "message": "mensagem de erro"
}
```

## Observações Oracle

- Todas as queries usam bind params.
- Nenhum filtro é concatenado diretamente com valor vindo da requisição.
- O pool é criado com `oracledb.createPool`.
- O pool é encerrado quando a aplicação recebe `SIGINT` ou `SIGTERM`.
- O driver opera em modo Thin por padrão, o que facilita deploy em Linux/Hostinger. Se seu ambiente exigir Instant Client depois, a estrutura atual continua compatível para adaptação.

## Deploy Linux/Hostinger

- Defina as variáveis de ambiente no painel do servidor.
- Rode `npm ci` ou `npm install`.
- Gere build com `npm run build`.
- Suba com `npm start`.
- Garanta conectividade do servidor Linux com o Oracle `WINT`.
- Se for usar container no Hostinger, basta apontar para o `Dockerfile` deste repositório e cadastrar as variáveis no painel.

## Ajustes de aliases

O projeto assume que as VIEWs já expõem aliases compatíveis com os nomes citados no escopo, como `PEDIDO_ID`, `NUMPED`, `CARGA_ID`, `NUMCAR`, `NOTA_FISCAL` e `NUMNOTA`.

Se algum alias real da VIEW for diferente, ajuste apenas os filtros em:

- `src/services/pedidos.service.ts`
- `src/services/cargas.service.ts`
- `src/services/entregas.service.ts`

# Winthor Internal API

API interna somente leitura em `Node.js + TypeScript + Fastify` para expor dados do Oracle Winthor em endpoints REST.

## Status atual

- Oracle 11g validado
- `VW_VEXOR_PEDIDOS` validada e compatível com a API
- autenticação por `x-api-key`
- resposta JSON padronizada
- build local funcionando
- deploy preparado para Hostinger com modo `thick`

## Endpoints

- `GET /health`
- `GET /api/pedidos`
- `GET /api/pedidos/:id`
- `GET /api/cargas`
- `GET /api/cargas/:id`
- `GET /api/cargas/:id/pedidos`
- `GET /api/entregas`
- `GET /api/entregas/:nota`

## Oracle validado

Aliases reais encontrados no banco:

- `VW_VEXOR_PEDIDOS`: `NUMCAR`, `NUMPED`, `POSICAO`, `CODFILIAL`, `CODCLI`, `DTFAT`, `VLTOTAL`, `CLIENTE`, `CGCENT`, `TELENT`, `ENDERENT`, `BAIRROENT`, `MUNICENT`, `ESTENT`, `CEPENT`
- `VW_VEXOR_CARGAS`: `CARGA_ID`, `FILIAL`, `MOTORISTA_ID`, `DATA_SAIDA`
- `VW_VEXOR_ENTREGAS`: `NUMNOTA`, `NUMPED`, `NUMCAR`, `CODMOTORISTA`

Observacao:

- `WINTHOR.VW_VEXOR_CARGA_PEDIDOS` nao existe atualmente nesse banco, entao `GET /api/cargas/:id/pedidos` responde `503`.

## Desenvolvimento local

1. Instale dependencias:

```bash
npm install
```

2. Ajuste o `.env`

Exemplo local no Windows:

```env
NODE_ENV=development
HOST=0.0.0.0
PORT=3000
LOG_LEVEL=info
CORS_ORIGIN=*
API_KEY=change-me

ORACLE_DRIVER_MODE=thick
ORACLE_USER=WINTHOR
ORACLE_PASSWORD=change-me
ORACLE_CONNECT_STRING=WINT
ORACLE_CONFIG_DIR=C:\app\ADM\product\11.2.0\client_1\network\admin
ORACLE_CLIENT_LIB_DIR=C:\Oracle\instantclient_19_30
ORACLE_POOL_MIN=1
ORACLE_POOL_MAX=10
ORACLE_POOL_INCREMENT=1
ORACLE_QUEUE_TIMEOUT_MS=5000
ORACLE_CONNECT_TIMEOUT_MS=10000
ORACLE_CALL_TIMEOUT_MS=15000

DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
```

3. Rode:

```bash
npm run dev
```

## Testes

Health:

- [http://localhost:3000/health](http://localhost:3000/health)

Em `development`, a API aceita `apiKey` na query string para facilitar teste pelo navegador:

- [Pedidos](http://localhost:3000/api/pedidos?page=1&limit=20&apiKey=VEXOR-API-KEY-6f2d91c84a3b4e9fbb7a52d4e0c31a78)
- [Cargas](http://localhost:3000/api/cargas?page=1&limit=20&apiKey=VEXOR-API-KEY-6f2d91c84a3b4e9fbb7a52d4e0c31a78)
- [Entregas](http://localhost:3000/api/entregas?page=1&limit=20&apiKey=VEXOR-API-KEY-6f2d91c84a3b4e9fbb7a52d4e0c31a78)

Exemplo com `curl`:

```bash
curl -H "x-api-key: SUA_CHAVE" "http://localhost:3000/api/pedidos?page=1&limit=20"
```

## Docker

O projeto esta preparado para container Linux com Oracle 11g usando `thick mode`.

### Importante

Antes do build para Hostinger, coloque os arquivos extraidos do Oracle Instant Client 19+ Linux x64 em:

`oracle/instantclient/`

Esse conteudo sera copiado para:

`/opt/oracle/instantclient`

### Build local da imagem

```bash
docker build -t winthor-internal-api .
```

## Hostinger

Use o arquivo [`.env.hostinger.example`](C:\Users\ADM\Documents\Playground\.env.hostinger.example) como base.

Configuracao recomendada para producao:

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
LOG_LEVEL=info
CORS_ORIGIN=*
API_KEY=SUA_CHAVE_REAL

ORACLE_DRIVER_MODE=thick
ORACLE_USER=WINTHOR
ORACLE_PASSWORD=SUA_SENHA_REAL
ORACLE_CONNECT_STRING=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=santosdistribuidor.ddns.net)(PORT=1521))(CONNECT_DATA=(SID=WINT)))
ORACLE_CONFIG_DIR=
ORACLE_CLIENT_LIB_DIR=/opt/oracle/instantclient
ORACLE_POOL_MIN=1
ORACLE_POOL_MAX=10
ORACLE_POOL_INCREMENT=1
ORACLE_QUEUE_TIMEOUT_MS=5000
ORACLE_CONNECT_TIMEOUT_MS=10000
ORACLE_CALL_TIMEOUT_MS=15000

DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
```

Passos:

1. Coloque o Oracle Instant Client Linux 19+ em `oracle/instantclient/`
2. Suba o projeto para o GitHub
3. Aponte o Hostinger para o `Dockerfile` da raiz
4. Cadastre as variaveis de ambiente
5. Publique a aplicacao

## Observacoes

- Todas as queries usam bind params
- Nenhum filtro concatena valor vindo da requisicao
- A paginacao foi adaptada para Oracle 11g com `ROW_NUMBER()`
- Em producao, prefira sempre `x-api-key` via header

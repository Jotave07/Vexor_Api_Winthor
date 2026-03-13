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
- [Pedidos por carga](http://localhost:3000/api/pedidos?page=1&limit=20&cargaId=999999&apiKey=VEXOR-API-KEY-6f2d91c84a3b4e9fbb7a52d4e0c31a78)
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
npm run docker:build
```

Isso gera a imagem:

```text
ghcr.io/jotave07/vexor_api_winthor:latest
```

### Push da imagem para o GHCR

Primeiro faca login no registro:

```bash
docker login ghcr.io -u Jotave07
```

Depois publique:

```bash
npm run docker:push
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
2. Rode `npm run docker:build`
3. Rode `docker login ghcr.io -u Jotave07`
4. Rode `npm run docker:push`
5. No Hostinger, crie a aplicacao por imagem Docker
6. Informe a imagem `ghcr.io/jotave07/vexor_api_winthor:latest`
7. Cadastre as variaveis de ambiente
8. Publique a aplicacao

### Sem :3000 no dominio

Se quiser acessar a API como:

```text
https://api.vexortech.cloud/health
```

em vez de:

```text
http://api.vexortech.cloud:3000/health
```

use um proxy reverso Nginx na frente da API.

Arquivos prontos no projeto:

- [hostinger-stack.example.yml](C:\Users\ADM\Documents\Playground\hostinger-stack.example.yml)
- [default.conf](C:\Users\ADM\Documents\Playground\nginx\default.conf)
- [Dockerfile](C:\Users\ADM\Documents\Playground\nginx\Dockerfile)

Como a Hostinger pode falhar ao montar arquivo de configuracao via volume, o projeto usa uma imagem propria de Nginx.

Build da imagem do Nginx:

```bash
npm run docker:build:nginx
```

Push da imagem do Nginx:

```bash
npm run docker:push:nginx
```

Com esse stack:

- `api_santos` fica interno, exposto somente para o Nginx
- `nginx` publica a porta `80`
- o dominio `api.vexortech.cloud` pode apontar para o IP do servidor sem usar `:3000`

Depois do deploy com Nginx, o teste esperado passa a ser:

- `http://api.vexortech.cloud/health`

## GitHub

O repositório no GitHub agora roda somente validacao de codigo via Actions:

- `npm ci`
- `npm run typecheck`
- `npm run build`

O build da imagem ficou fora do GitHub porque os binarios do Oracle Instant Client Linux nao sao versionados no repositório.

## Observacoes

- Todas as queries usam bind params
- Nenhum filtro concatena valor vindo da requisicao
- A paginacao foi adaptada para Oracle 11g com `ROW_NUMBER()`
- Em producao, prefira sempre `x-api-key` via header

FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV LD_LIBRARY_PATH=/opt/oracle/instantclient
ENV OCI_LIB_DIR=/opt/oracle/instantclient

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends libaio1 libnsl2 \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY oracle/instantclient /tmp/oracle-instantclient

RUN mkdir -p /opt/oracle/instantclient \
  && src_dir="$(find /tmp/oracle-instantclient -type f -name 'libclntsh.so.19.1' -printf '%h\n' | head -n 1)" \
  && if [ -z "$src_dir" ]; then echo "Oracle Instant Client Linux libraries not found in oracle/instantclient" && exit 1; fi \
  && cp -a "$src_dir"/. /opt/oracle/instantclient/ \
  && rm -f /opt/oracle/instantclient/libclntsh.so /opt/oracle/instantclient/libclntsh.so.18.1 /opt/oracle/instantclient/libocci.so /opt/oracle/instantclient/libocci.so.18.1 /opt/oracle/instantclient/libocci_gcc53.so \
  && ln -sf libclntsh.so.19.1 /opt/oracle/instantclient/libclntsh.so \
  && ln -sf libclntsh.so.19.1 /opt/oracle/instantclient/libclntsh.so.18.1 \
  && ln -sf libocci.so.19.1 /opt/oracle/instantclient/libocci.so \
  && ln -sf libocci.so.19.1 /opt/oracle/instantclient/libocci.so.18.1 \
  && ln -sf libocci_gcc53.so.19.1 /opt/oracle/instantclient/libocci_gcc53.so \
  && rm -rf /tmp/oracle-instantclient

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "const http=require('http');const req=http.get('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health',res=>process.exit(res.statusCode===200?0:1));req.on('error',()=>process.exit(1));"

CMD ["node", "dist/server.js"]

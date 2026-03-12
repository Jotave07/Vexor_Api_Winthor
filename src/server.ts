import { buildApp } from "./app";
import { env } from "./config/env";
import { closeOraclePool, initOraclePool } from "./config/oracle";

async function start(): Promise<void> {
  await initOraclePool();

  const app = await buildApp();

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info({ signal }, "Shutting down application");
    await app.close();
    await closeOraclePool();
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  try {
    await app.listen({
      host: env.HOST,
      port: env.PORT
    });
  } catch (error) {
    app.log.error({ err: error }, "Failed to start server");
    await closeOraclePool();
    process.exit(1);
  }
}

void start();

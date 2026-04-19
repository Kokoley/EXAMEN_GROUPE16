import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { formatDbError, testDatabaseConnection } from "./config/db.js";
import { initializeSocket } from "./config/socket.js";

const app = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
  }
});

initializeSocket(io);

const startServer = async () => {
  try {
    await testDatabaseConnection();
    // eslint-disable-next-line no-console
    console.log("MySQL connecté avec succès.");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `Échec connexion MySQL (${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}) :`,
      formatDbError(error)
    );
    // On ne démarre pas une API "fonctionnelle" sans DB : ça masque les erreurs et casse des features silencieusement.
    process.exit(1);
  }

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      // eslint-disable-next-line no-console
      console.error(
        `EADDRINUSE: le port ${env.PORT} est deja utilise. Fermez l'autre terminal (npm run dev) ou changez PORT dans BACK-END/.env.`
      );
    } else {
      // eslint-disable-next-line no-console
      console.error("Erreur serveur HTTP:", err);
    }
    process.exit(1);
  });

  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API en ligne sur http://localhost:${env.PORT}`);
  });
};

startServer();

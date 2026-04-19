import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { signalementRouter } from "./signalement.routes.js";
import { collecteRouter } from "./collecte.routes.js";
import { resourcesRouter } from "./resources.routes.js";
import { gpsRouter } from "./gps.routes.js";
import { notificationsRouter } from "./notifications.routes.js";
import { adminRouter } from "./admin.routes.js";
import { dbRouter } from "./db.routes.js";
import { statsRouter } from "./stats.routes.js";

export const apiRouter = Router();

apiRouter.use(authRouter);
apiRouter.use("/signalement", signalementRouter);
apiRouter.use("/collecte", collecteRouter);
apiRouter.use("/gps", gpsRouter);
apiRouter.use("/notifications", notificationsRouter);
apiRouter.use(resourcesRouter);
apiRouter.use(adminRouter);
apiRouter.use("/db", dbRouter);
apiRouter.use(statsRouter);

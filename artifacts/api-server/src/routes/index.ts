import { Router, type IRouter } from "express";
import healthRouter from "./health";
import settingsRouter from "./settings";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(settingsRouter);
router.use(analyticsRouter);

export default router;

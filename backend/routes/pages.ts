import express, { Router, Request, Response } from "express";
import path from "path";

const router = Router();

// Serve the React app
router.use(express.static(path.resolve("../build")));

router.get(/^\/(account|play)/i, (_req: Request, res: Response) => {
	res.sendFile(path.resolve("../build/index.html"));
});

console.log("\tServing React application.");

export default router;
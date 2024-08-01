import { Router, Request, Response } from "express";

import { getAllBoards, getAllUsers, db } from "Database";

import LogIn from "./api/Login";
import SignUp from "./api/Signup";
import LogOut from "./api/Logout";
import { GetOwnedBoards } from "./api/GetOwnedBoards";
import { GetParticipatingBoards } from "./api/GetParticipatingBoards";

import { CreateBoard } from "../routes/api/CreateBoard";
import { BoardLookup } from "../routes/api/BoardLookup";
import { doubleCsrfProtection, generateToken } from "../src/Authentication";

// Initialize the router
const router = Router();

// Initialize CSRF protection
router.use(doubleCsrfProtection);
console.log("\tCSRF protection initialized.");

// Generate CSRF tokens
router.get("/api/csrf", (req: Request, res) => {
	const csrf = generateToken(req, res);
	res.json({ csrf });
});
console.log("\tDouble CSRF authentication initialized.");

// TODO REMOVE THEM LATER
router.get("/api/sessions", (_req: Request, res: Response) => {
	const sessions = db.prepare("SELECT * FROM sessions").all();
	res.json(sessions);
});
router.get("/api/users", (_req: Request, res: Response) => {
	res.json(getAllUsers());
});
router.get("/api/boards", (_req: Request, res: Response) => {
	res.json(getAllBoards());
});

// Initialize API routes
router.get("/api/bingo/:id", BoardLookup);

router.get("/api/getParticipatingBoards", GetParticipatingBoards);
router.get("/api/getOwnedBoards", GetOwnedBoards);

router.post("/api/createBoard", CreateBoard);

router.post("/api/login", LogIn);
router.post("/api/signup", SignUp);
router.post("/api/logout", LogOut);

console.log("\tInitialized authentication routes.");

export default router;
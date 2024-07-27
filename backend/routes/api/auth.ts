import { Router } from "express";

import LogIn from "../../routes/api/login";
import SignUp from "../../routes/api/signup";
import LogOut from "../../routes/api/logout";
import { GetOwnedBoards } from "./GetOwnedBoards";
import { GetBoards } from "../../routes/api/GetBoards";
import { CreateBoard } from "../../routes/api/CreateBoard";
import { generateToken, verifyAuthentication } from "src/Authentication";

import { Request, Response } from "express";
import { AuthenticatedRequest } from "src/Server";
import { getAllBoards, getAllUsers } from "Database";

// Initialize the router
const router = Router();

const verifyAuth = verifyAuthentication({ setReturnTo: false });

// Generate CSRF tokens
router.get("/api/csrf", (req: Request, res) => {
	const csrf = generateToken(req, res);
	res.json({ csrf });
});
console.log("\tDouble CSRF authentication initialized.");

// TODO REMOVE THEM LATER
router.get("/api/users", (req: Request, res: Response) => {
	res.json(getAllUsers());
});
router.get("/api/boards", (req: Request, res: Response) => {
	res.json(getAllBoards());
});

// Initialize API routes
router.get("/api/getParticipatingBoards", verifyAuth, GetBoards);
router.get("/api/getOwnedBoards", verifyAuth, GetOwnedBoards);

router.post("/api/createBoard", verifyAuth, CreateBoard);

router.post("/api/login", LogIn);
router.post("/api/signup", SignUp);
router.post("/api/logout", LogOut);

console.log("\tInitialized authentication routes.");

export default router;
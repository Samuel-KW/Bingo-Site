import express, { Router, Request, Response, NextFunction } from "express";
import expressSession from "express-session";
import cookieParser from "cookie-parser";

import { getAllBoards, getAllUsers, getUserByUUID, db } from "Database";

import LogIn from "./api/Login";
import SignUp from "./api/Signup";
import LogOut from "./api/Logout";

import { GetOwnedBoards } from "./api/GetOwnedBoards";
import { GetParticipatingBoards } from "./api/GetParticipatingBoards";

import { CreateBoard } from "../routes/api/CreateBoard";
import { BoardLookup } from "../routes/api/BoardLookup";

import { User } from "../src/User";
import { AuthenticatedRequest, SessionRequest } from "../src/Server";
import { doubleCsrfProtection, generateToken, sessionOptions } from "../src/Authentication";

declare module "express-session" {
  interface SessionData {
    user: {
			id: string;
		};
  }

	interface Locals {
		user: User;
		csrfToken: string;
	}
}

// Initialize the router
const router = Router();

// Initialize request handlers
router.use(cookieParser(sessionOptions.secret));
router.use(expressSession(sessionOptions));
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
console.log("\tInitialized Express middleware.");

// Initialize CSRF protection
router.use(doubleCsrfProtection);
console.log("\tDouble CSRF authentication initialized.");

// Generate CSRF tokens
router.get("/api/csrf", (req: Request, res) => {
	const csrf = generateToken(req, res);
	res.json({ csrf });
});

// Initialize session authentication, add user object to request
router.use(function (req: Request | SessionRequest, res: Response, next: NextFunction) {

	const uuid = req.session.user?.id;

	// If the user is authenticated, set the user object
	if (uuid) {
		const user = getUserByUUID(uuid);
		if (user)
			(req as AuthenticatedRequest).user = user;
	}

	// Generate CSRF token
	res.locals["csrfToken"] = generateToken(req, res);

	next();
});
console.log("\tSession authentication initialized.");

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

router.get("/api/logout", LogOut);

console.log("\tInitialized API routes.");

export default router;
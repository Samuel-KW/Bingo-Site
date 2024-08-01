import express, { Request, Response, NextFunction, Router } from "express";
import expressSession from "express-session";
import cookieParser from "cookie-parser";
import path from "path";

import { generateToken, sessionOptions } from "../src/Authentication";
import { getUserByUUID } from "../Database";
import { User } from "../src/User";
import { AuthenticatedRequest, SessionRequest } from "src/Server";

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

const router = Router();

// Serve the React app
router.use(express.static(path.resolve("../build")));
console.log("\tServing React application.");

// Initialize request handlers
router.use(cookieParser(sessionOptions.secret));
router.use(expressSession(sessionOptions));
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
console.log("\tInitialized Express middleware.");

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

export default router;
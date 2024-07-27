import express, { Request, Response, NextFunction, Router } from "express";
import { doubleCsrf } from "csrf-csrf";
import expressSession from "express-session";
import cookieParser from "cookie-parser";
import path from "path";

import { csrfOptions, doubleCsrfProtection, sessionOptions, verifyAuthentication } from "../../src/Authentication";
import { getUserByUUID, User } from "../../Database";
import { AuthenticatedRequest } from "src/Server";

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

const verifyAuth = verifyAuthentication();



// Initialize request handlers
router.use(cookieParser(sessionOptions.secret));
router.use(expressSession(sessionOptions));
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
console.log("\tInitialized Express middleware.");


// Initialize CSRF protection
router.use(doubleCsrfProtection);


// Initialize session authentication
router.use(function (req: Request, res: Response, next: NextFunction) {

	const authenticatedRequest = req as AuthenticatedRequest;
	const user = authenticatedRequest.session.user;

	if (user?.id !== undefined)
		authenticatedRequest.user = getUserByUUID(user.id);

	res.locals.csrfToken = authenticatedRequest.csrfToken();
	next();
});
console.log("\tSession authentication initialized.");


// Serve the React app
router.use(express.static(path.resolve("../build")));
console.log("\tServing React application.");

export default router;
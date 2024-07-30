import express, { Request, Response, NextFunction, Router } from "express";
import { doubleCsrf } from "csrf-csrf";
import expressSession from "express-session";
import cookieParser from "cookie-parser";
import path from "path";

import { csrfOptions, doubleCsrfProtection, generateToken, sessionOptions } from "../../src/Authentication";
import { getUserByUUID, User } from "../../Database";
import { SessionRequest } from "src/Server";

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

// Initialize request handlers
router.use(cookieParser(sessionOptions.secret));
router.use(expressSession(sessionOptions));
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
console.log("\tInitialized Express middleware.");


// Initialize CSRF protection
router.use(doubleCsrfProtection);


// Serve the React app
router.use(express.static(path.resolve("../build")));
console.log("\tServing React application.");


// Initialize session authentication, add user object to request
router.use(function (req: Request, res: Response, next: NextFunction) {

		const request = req as SessionRequest;
		const user = request.session.user;

		// If the user is authenticated, set the user object
		if (user?.id !== undefined) {
			const dbUser = getUserByUUID(user.id);

			if (dbUser !== undefined)
				request.user = User.new(dbUser);
		}

		// Generate CSRF token
		res.locals.csrfToken = generateToken(req, res);

		next();
});
console.log("\tSession authentication initialized.");




export default router;
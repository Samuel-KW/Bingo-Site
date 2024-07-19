import express, { Request, Response, NextFunction, Router } from "express";
import { doubleCsrf } from "csrf-csrf";
import expressSession from "express-session";
import cookieParser from "cookie-parser";
import path from "path";

import { csrfOptions, sessionOptions, verifyAuthentication } from "../../src/Authentication";
import { getUserByUUID, User } from "../../Database";


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

// https://github.com/Psifi-Solutions/csrf-csrf
const {
	invalidCsrfTokenError, // This is just for convenience if you plan on making your own middleware.
	generateToken, // Use this in your routes to provide a CSRF hash + token cookie and token.
	validateRequest, // Also a convenience if you plan on making your own middleware.
	doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf(csrfOptions);

// Initialize request handlers
router.use(cookieParser(sessionOptions.secret));
router.use(expressSession(sessionOptions));
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
console.log("\tInitialized Express middleware.");


// Initialize CSRF protection
router.use(doubleCsrfProtection);

router.use(function (req: Request, res: Response, next: NextFunction) {

	const user = req.session.user;
	if (user?.id !== undefined)
		req.user = getUserByUUID(user.id);

	res.locals.csrfToken = req.csrfToken();
	next();
});
console.log("\tSession authentication initialized.");

// Serve the React app
router.use(express.static(path.resolve("../build")));
console.log("\tServing React application.");


// Generate CSRF tokens
router.get("/api/csrf", (req, res) => {
	const csrf = generateToken(req, res);
	res.json({ csrf });
});
console.log("\tDouble CSRF authentication initialized.");

router.get("/admin", verifyAuth, (req: Request, res: Response) => {
	res.send("Hello, admin!");
});

export default router;
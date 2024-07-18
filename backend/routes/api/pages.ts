import express, {Express, Request, Response, NextFunction, Router } from "express";
import { doubleCsrf } from "csrf-csrf";
import session from "express-session";
import passport from "passport";

import { verifyAuthentication } from "../../src/Authentication";
import { csrfOptions } from "../../src/Authentication";
import BingoDB from "../../Database";

import BunStoreClass from "../../src/BunStore";
const BunStore = BunStoreClass(session);

const verifyAuth = verifyAuthentication();

const router = Router();


// https://github.com/Psifi-Solutions/csrf-csrf
const {
	invalidCsrfTokenError, // This is just for convenience if you plan on making your own middleware.
	generateToken, // Use this in your routes to provide a CSRF hash + token cookie and token.
	validateRequest, // Also a convenience if you plan on making your own middleware.
	doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf(csrfOptions);

const parseForm = express.urlencoded({ extended: false });

// Generate CSRF tokens
router.get("/api/csrf", (req, res) => {
	const csrf = generateToken(req, res);
	res.json({ csrf });
});

const SESSION_SECRET = process.env.SESSION_SECRETS?.split(" ");
if (!SESSION_SECRET)
	throw new Error("No session secrets provided.");

// Initialize session management
router.use(session({
	secret: SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	store: new BunStore({
		client: BingoDB,
		expired: {
			clear: true,
			intervalMs: 900000 //ms = 15min
		}
	})
}));

router.use(doubleCsrfProtection);

router.use(passport.authenticate('session'));
console.log("\tPassport session authentication initialized.");

// index
router.use(function (req: Request, res: Response, next: NextFunction) {
	res.locals.csrfToken = req.csrfToken();
	next();
});

router.get("/admin", verifyAuth, (req: Request, res: Response) => {
	console.log(req.isAuthenticated());
	res.send("Hello, admin!");
});

export default router;
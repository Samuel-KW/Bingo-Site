import { IStrategyOptions, Strategy as LocalStrategy } from "passport-local";
import { Router } from "express";
import passport from "passport";

import { Verify, Hash, hashOptions } from "../../src/Authentication";
import { Board, User, DatabaseUser, getUserByEmail } from "../../Database";
import { Server, AuthenticatedRequest } from "../../src/Server";

import LogIn from "../../routes/api/login";
import SignUp from "../../routes/api/signup";

// @format
const noop = () => { };

/* Configure password authentication strategy.
 *
 * The `LocalStrategy` authenticates users by verifying an email and password.
 * The strategy parses the email and password from the request and calls the
 * `Verify` function.
 *
 * The `Verify` function queries the database for the user record and verifies
 * the password by hashing the password supplied by the user and comparing it to
 * the hashed password stored in the database. If the comparison succeeds, the
 * user is authenticated; otherwise, not.
 */
const strategyOptions: IStrategyOptions = {
	usernameField: "email",
	passwordField: "password",
};

passport.use(new LocalStrategy(strategyOptions, (email: string, password: string, cb: Function = noop) => {
	const user = getUserByEmail(email);

	if (user === undefined)
		return cb("Email does not exist.");

	Verify(password, user.password, hashOptions)
		.then((valid: boolean) => {
			if (!valid)
				return cb("Invalid email or password.");

			return cb(null, User.fromDB(user));
		})
		.catch((e: any) => cb(e));
}));
console.log("\tPassport login authentication initialized.");

/* Configure session management.
 *
 * When a login session is established, information about the user will be
 * stored in the session.  This information is supplied by the `serializeUser`
 * function, which is yielding the user information.
 *
 * As the user interacts with the app, subsequent requests will be authenticated
 * by verifying the session. The same user information that was serialized at
 * session establishment will be restored when the session is authenticated by
 * the `deserializeUser` function.
 */
passport.serializeUser(function(user: Express.User, cb: Function = noop) {
	console.log("serialize", user);
	if (user instanceof User) {
		process.nextTick(function() {
			return cb(null, { id: user.uuid });
		});
	}
});

passport.deserializeUser(function(user: User, cb: Function = noop) {
	console.log("deserialize", user);
	process.nextTick(function() {
		return cb(null, user);
	});
});


// Initialize the router
const router = Router();

router.post("/api/login", LogIn);
router.post("/api/signup", SignUp);

router.post('/api/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

export default router;
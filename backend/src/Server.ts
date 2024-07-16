import {Express, Request, Response, NextFunction } from "express";
import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import { doubleCsrf, DoubleCsrfConfigOptions } from "csrf-csrf";
import * as path from "path";

import { IStrategyOptions, Strategy } from "passport-local";

import BingoDatabase, { Board, User, BingoCard } from "./Database";
import { Verify, Hash, HashOptions } from "./Authentication";

import BunStoreClass from "./BunStore";
const BunStore = BunStoreClass(session);

import LogIn from "../routes/api/login";
import SignUp from "../routes/api/signup";

// @format
const noop = () => { };

export interface HttpError extends Error {
  status: number;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  server: Server;
}

export class Server {

    private db: BingoDatabase;
    private hashOptions: HashOptions = {
        algorithm: "argon2id",
        timeCost: Number(process.env.HASH_TIME_COST),
        memoryCost: Number(process.env.HASH_MEMORY_COST),
        saltLength: Number(process.env.HASH_SALT_LENGTH),
        pepper: process.env.PEPPER,
        pepperVersion: process.env.PEPPER_VERSION
    };

		private csrfOptions: DoubleCsrfConfigOptions = {
			getSecret: () => process.env.CSRF_SECRETS.split(" "), // A function that optionally takes the request and returns a secret
			cookieName: "CSRF", // __Host-CSRF The name of the cookie to be used, recommend using Host prefix.
			cookieOptions: {
				sameSite: "lax",  // Recommend you make this strict if posible
				path: "/",
				secure: true,
			},
			size: 64, // The size of the generated tokens in bits
			ignoredMethods: ["GET", "HEAD", "OPTIONS"], // A list of request methods that will not be protected.
			getTokenFromRequest: (req: Request) => req.headers["x-csrf-token"], // A function that returns the token from the request
		};

    constructor(private app: Express) {
        this.db = new BingoDatabase("./db/bingo.sqlite");

				console.log("\nInitializing server...");
				const timeStart = Date.now();

				this.init();
				this.initRoutes();

				const dt = Date.now() - timeStart;
				console.log(`\tServer initialized in ${dt}ms.\n`);
    }

		async logIn (email: string, password: string): Promise<User> {
			const user = this.db.getUserByEmail(email);

			if (user === undefined)
					throw "Invalid email or password.";

			const valid = await Verify(password, user.password, this.hashOptions);

			if (!valid)
					throw "Invalid email or password.";

			return user;
		}

    async createUser (password: string, firstName: string, lastName: string, email: string, birthday: string, avatarUrl: string): Promise<User> {

			// Verify email isn't already in use
			const existingUser = this.db.getUserByEmail(email);
			if (existingUser !== undefined)
				throw new Error("Email already in use.");

			const hash = await Hash(password, this.hashOptions);
      const user = User.createUser(hash, firstName, lastName, email, birthday, avatarUrl);

      this.db.addUser(user);
      return user;
    }

    createBoard(user: User, title: string, editors: string[], cards: BingoCard[]): Board {
      const board = user.createBoard(title, editors, cards);
      this.db.addBoard(board);
      return board;
    }

    private init (): void {
      this.db.openDatabase();
      this.db.openQueries();
			console.log("\tDatabase opened and queries initialized.");
		}

		private initRoutes (): void {

			const parseForm = express.urlencoded({ extended: false });

			// https://github.com/Psifi-Solutions/csrf-csrf
			const {
				invalidCsrfTokenError, // This is just for convenience if you plan on making your own middleware.
				generateToken, // Use this in your routes to provide a CSRF hash + token cookie and token.
				validateRequest, // Also a convenience if you plan on making your own middleware.
				doubleCsrfProtection, // This is the default CSRF protection middleware.
			} = doubleCsrf(this.csrfOptions);

			// Serve the React app
			this.app.use(express.static(path.resolve("../build")));

			// Initialize request handlers
			this.app.use(express.json());
			this.app.use(cookieParser());
			console.log("\tExpress request handlers initialized.");


			this.app.get("/api/csrf", (req: Request, res: Response) => {
				const csrf = generateToken(req, res);
				res.json({ csrf });
			});

			// Initialize session management
			this.app.use(session({
				secret: process.env.SESSION_SECRETS.split(" "),
				resave: false,
				saveUninitialized: false,
				store: new BunStore({
					client: this.db.getDatabase(),
					expired: {
						clear: true,
						intervalMs: 900000 //ms = 15min
					}
				})
			}));

			this.app.use(passport.authenticate('session'));
			console.log("\tPassport session authentication initialized.");

			// index


			// auth
			const strategyOptions: IStrategyOptions = {
				usernameField: "email",
				passwordField: "password",
			};

			// Initialize Passport authentication
			passport.use(new Strategy(strategyOptions, (email: string, password: string, cb: Function = noop) => {
				try {
					this.logIn(email, password)
						.then((user: User) => cb(null, user))
						.catch((err: any) => cb(err));
				} catch (e) {
					cb(e);
				}
			}));
			console.log("\tPassport login authentication initialized.");

			passport.serializeUser(function(user: User, cb: Function = noop) {
				console.log("serialize", user);
				process.nextTick(function() {
					cb(null, { id: user.uuid, email: user.email });
				});
			});

			passport.deserializeUser(function(user: User, cb: Function = noop) {
				console.log("deserialize", user);
				process.nextTick(function() {
					return cb(null, user);
				});
			});

			this.app.get("/admin", (req: AuthenticatedRequest, res: Response) => {
				console.log(req.isAuthenticated());
				res.send("Hello, admin!");
			});

			// Enable API access for following API routes
			this.app.all("/api/*", (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
				req.server = this;
				next();
			});

			// Handle unauthenticated API routes
			this.app.post("/api/login", doubleCsrfProtection, parseForm, LogIn);
			this.app.post("/api/signup", doubleCsrfProtection, SignUp);

			// Enable authenticated API routes
			this.app.all("/api/*", (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

				const accessToken = req.cookies["access_token"];
				if (accessToken === undefined) {
						res.status(401).send("Unauthorized");
						return;
				}

				const user = this.db.getUser(accessToken);
				if (user === undefined) {
						res.status(401).send("Unauthorized");
						return;
				}

				req.user = user;
				console.log(req.user);

				next();
			});

			// Handle all other requests by serving the React app
			this.app.get("*", (req: Request, res: Response) => {
					res.sendFile(path.resolve("../build/index.html"));
			});
		}

    start(port: number): void {
        this.app.listen(port, () => console.log(`Server listening on port ${port}!`));
    }
}
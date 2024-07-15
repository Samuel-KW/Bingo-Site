import {Express, Request, Response, NextFunction, RequestParamHandler } from "express";
import express from "express";
import * as path from "path";
import cookieParser from "cookie-parser";
import session from "express-session";

import BingoDatabase, { Board, User, BingoCard } from "./Database";
import { Verify, Hash, HashOptions } from "./Authentication";

import BunStoreClass from "./BunStore";
const BunStore = BunStoreClass(session);

import LogIn from "../routes/api/login";
import SignUp from "../routes/api/signup";


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

    constructor(private app: Express) {
        this.db = new BingoDatabase("./db/bingo.sqlite");
				this.init();

				// Enable API access for following API routes
        this.app.all("/api/*", (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
          req.server = this;
          next();
        });

				// Handle unauthenticated API routes
        this.app.post("/api/login", LogIn);
        this.app.post("/api/signup", SignUp);

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

		async logIn (email: string, password: string): Promise<User> {
			const user = this.db.getUserByEmail(email);

			if (user === undefined)
					throw new Error("Invalid email or password.");

			const valid = await Verify(password, user.password, this.hashOptions);

			if (!valid)
					throw new Error("Invalid email or password.");

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

			console.log("\nInitializing server...");
			const timeStart = Date.now();

      this.db.openDatabase();
      this.db.openQueries();
			console.log("\tDatabase opened and queries initialized.");

			this.app.use(express.json());
			this.app.use(express.urlencoded({ extended: false }));
			this.app.use(cookieParser());

			this.app.use(express.static(path.resolve("../build")));

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

			console.log("\tExpress request handlers initialized.");

			const dt = Date.now() - timeStart;
			console.log(`\tServer initialized in ${dt}ms.\n`);

		}

    start(port: number): void {
        this.app.listen(port, () => console.log(`Server listening on port ${port}!`));
    }
}
import express, {Express, Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import session from "express-session";

import * as path from "path";

import BingoDatabase, { Board, User, BingoCard, getBoard, getUserByEmail, getUserByUUID, addBoard, addUser, DatabaseUser } from "../Database";
import { Verify, Hash, hashOptions, csrfOptions } from "./Authentication";

import pageRouter from "../routes/api/pages";
import authRouter from "../routes/api/auth";

import BunStoreClass from "./BunStore";
const BunStore = BunStoreClass(session);

// @format
const noop = () => { };

export interface HttpError extends Error {
  status: number;
}

export interface AuthenticatedRequest extends Request {
  user: DatabaseUser;
  server: Server;
}

export class Server {

    constructor(private app: Express) {

				console.log("\nInitializing server...");
				const timeStart = Date.now();

				this.init();
				this.initRoutes();

				const dt = Date.now() - timeStart;
				console.log(`\tServer initialized in ${dt}ms.\n`);
    }

		async logIn (email: string, password: string): Promise<User> {
			const user = getUserByEmail(email);

			if (user === undefined)
					throw "Invalid email or password.";

			const valid = await Verify(password, user.password, hashOptions);

			if (!valid)
					throw "Invalid email or password.";

			return User.fromDB(user);
		}

    async createUser (password: string, firstName: string, lastName: string, email: string, birthday: string, avatarUrl: string): Promise<User> {

			// Verify email isn't already in use
			const existingUser = getUserByEmail(email);
			if (existingUser !== undefined)
				throw "Email already in use.";

			const hash = await Hash(password, hashOptions);
      const user = User.new(hash, firstName, lastName, email, birthday, avatarUrl);

      addUser(user.toDB());
      return user;
    }

    createBoard(user: User, title: string, description: string, editors: string[], cards: BingoCard[]): Board {
      const board = user.createBoard(title, description, editors, cards);
      addBoard(board.toDB());
      return board;
    }

    private init (): void {
			console.log("\tNothing to initialize here .-.");
		}

		private initRoutes (): void {

			// Ensure requests are secure in production
			if (process.env.NODE_ENV === "production")
				this.app.enable("trust proxy");

			this.app.use(pageRouter);
			this.app.use(authRouter);
			console.log("\tAPI routes initialized.");

			// Handle all other requests by serving the React app
			this.app.get("*", (req: Request, res: Response) => {
					res.sendFile(path.resolve("../build/index.html"));
			});
		}

    start(port: number): void {
        this.app.listen(port, () => console.log(`Server listening on port ${port}!`));
    }
}
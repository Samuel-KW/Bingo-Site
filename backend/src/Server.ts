import {Express, Request, Response } from "express";

import * as path from "path";

import { Board } from "./Board";
import { DatabaseUser, User } from "./User";

import { getUserByEmail, addBoard, addUser } from "../Database";
import { Verify, Hash, hashOptions } from "./Authentication";
import { BingoBoard, BingoUser } from "routes/api/validation";

import pageRouter from "../routes/api/pages";
import authRouter from "../routes/api/auth";

export interface HttpError extends Error {
  status: number;
}

export interface SessionRequest extends Request {
  user: DatabaseUser | undefined;
}

export interface AuthenticatedRequest extends Request {
  user: DatabaseUser;
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

	async logIn (email: string, password: string): Promise<DatabaseUser> {
		const user = getUserByEmail(email);

		if (user === null)
			throw "Invalid email or password.";

		const valid = await Verify(password, user.password, hashOptions);

		if (!valid)
			throw "Invalid email or password.";

		return user;
	}

	async createUser (params: Partial<BingoUser>={}): Promise<User> {
		const { password, firstName, lastName, email, birthday, avatarUrl } = params;

		if (!password || !email)
			throw "Password and email are required fields";

		// Verify email isn't already in use
		const existingUser = getUserByEmail(email);
		if (existingUser)
			throw "Email already in use.";

		const hash = await Hash(password, hashOptions);
		const user = User.new({ email, password: hash, firstName, lastName, birthday, avatarUrl });

		addUser(user);
		return user;
	}

	createBoard(user: User, params: Partial<BingoBoard>={}): Board {
		const { title, description, editors, cards } = params;

		if (!title || !description)
			throw "Title and description are required.";

		const board = user.createBoard({ title, description, editors, cards });
		addBoard(board);
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
		this.app.get("*", (_req: Request, res: Response) => {
				res.sendFile(path.resolve("../build/index.html"));
		});
	}

	start(port: number): void {
		this.app.listen(port, () => console.log(`Server listening on port ${port}!`));
	}
}
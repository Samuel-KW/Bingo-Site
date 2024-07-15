import {Express, Request, Response, NextFunction, RequestParamHandler } from "express";
import express from "express";
import * as path from "path";
import cookieParser from "cookie-parser";

import BingoDatabase, { Board, User, BingoCard } from "./Database";
import { Verify, Hash, HashOptions } from "./Authentication";

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

				this.app.use(express.json());
				this.app.use(express.urlencoded({ extended: false }));
				this.app.use(cookieParser());

				this.app.use(express.static(path.resolve("../build")));

        this.app.all("/api/*", (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
          req.server = this;
          next();
        });

        this.app.post("/api/login", LogIn);
        this.app.post("/api/signup", SignUp);

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

        this.app.get("*", (req: Request, res: Response) => {
            res.sendFile(path.resolve("../build/index.html"));
        });

				// error handler
				this.app.use(function(err: HttpError, req: Request, res: Response, next: NextFunction) {

					console.error(err.message);

					// render the error page
					res.status(err.status || 500);
					res.render('error');
				});
    }

    async createUser (password: string, firstName: string, lastName: string, email: string, birthday: string, avatarUrl: string): Promise<User> {
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

    init (): void {
      this.db.openDatabase();
      this.db.openQueries();
    }

    start(port: number): void {
        this.app.listen(port, () => console.log(`Server listening on port ${port}!`));
    }
}
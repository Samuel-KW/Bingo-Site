import {Express, Request, Response, NextFunction, RequestParamHandler } from "express";
import express from "express";
import * as path from "path";
import cookieParser from "cookie-parser";

import LogIn from "../routes/api/login";
import SignUp from "../routes/api/signup";

interface HttpError extends Error {
  status?: number;
}

export class Server {

    private app: Express;

    constructor(app: Express) {
        this.app = app;

				this.app.use(express.json());
				this.app.use(express.urlencoded({ extended: false }));
				this.app.use(cookieParser());

				this.app.use(express.static(path.resolve("../build")));

        this.app.get("/api/login", LogIn);
        this.app.get("/api/signup", SignUp);

        this.app.get("*", (req: Request, res: Response): void => {
            res.sendFile(path.resolve("../build/index.html"));
        });

				// error handler
				this.app.use(function(err: HttpError, req: Request, res: Response, next: NextFunction): void {

					console.error(err.message);

					// render the error page
					res.status(err.status || 500);
					res.render('error');
				});
    }

    public start(port: number): void {
        this.app.listen(port, () => console.log(`Server listening on port ${port}!`));
    }
}
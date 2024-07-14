import {Express, Request, Response} from "express";
import express from "express";
import * as path from "path";

import LogIn from "../routes/api/login";
import SignUp from "../routes/api/signup";


export class Server {

    private app: Express;

    constructor(app: Express) {
        this.app = app;

				this.app.use(express.static(path.resolve("../build")));

        this.app.get("/api/login", LogIn);
        this.app.get("/api/signup", SignUp);

        this.app.get("*", (req: Request, res: Response): void => {
            res.sendFile(path.resolve("../build/index.html"));
        });
    }

    public start(port: number): void {
        this.app.listen(port, () => console.log(`Server listening on port ${port}!`));
    }
}
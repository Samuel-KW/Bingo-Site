import {Server} from "./src/Server";
import express from "express";
const app = express();

const port = 8080;

Bun.password.hash("password", {
	algorithm: "argon2id",
	memoryCost: 2**8,
	timeCost: 1,
});

const server = new Server(app);
server.start(port);
import { Server } from "./src/Server";
import express from "express";

export const port = 8080;

const app = express();
const server = new Server(app);

server.start(port);
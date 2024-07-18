import { Router } from "express";
import { verifyAuthentication } from "../../src/Authentication";

const verifyAuth = verifyAuthentication();

const router = Router();
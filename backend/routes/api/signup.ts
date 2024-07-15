import {Request, Response} from "express";
import BingoDatabase, { User } from "../../src/Database";
import { Verify, Hash, HashOptions } from "../../src/Authentication";
import { AuthenticatedRequest } from "../../src/Server";

export default function SignUp (req: AuthenticatedRequest, res: Response): void {
	const body = req.body;
	const password = body.password;
	const firstName = body.firstName;
	const lastName = body.lastName;
	const email = body.email;
	const birthday = body.birthday;
	const avatarUrl = body.avatarUrl;

	if (password === undefined || firstName === undefined || lastName === undefined || email === undefined || birthday === undefined || avatarUrl === undefined) {
		res.status(400).send("Bad Request");
		return;
	}

	req.server.createUser(password, firstName, lastName, email, birthday, avatarUrl)

	res.status(200).send("OK");
};

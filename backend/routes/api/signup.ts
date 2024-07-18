import { Request, Response } from "express";
import BingoDatabase, { User } from "../../Database";
import { Verify, Hash, hashOptions } from "../../src/Authentication";
import { AuthenticatedRequest } from "../../src/Server";

export default function SignUp (req: Request, res: Response): Promise<void> {
	const request = req as AuthenticatedRequest;

	const body = req.body;
	const password:  string | undefined = body.password;
	const firstName: string | undefined = body.firstName;
	const lastName:  string | undefined = body.lastName;
	const email: 	   string | undefined = body.email;
	const birthday:  string | undefined = body.birthday;
	const avatarUrl: string | undefined = body.avatarUrl;
	const captcha:   string | undefined = body.captcha;

	if (password === undefined || firstName === undefined || lastName === undefined || email === undefined || birthday === undefined || avatarUrl === undefined) {
		console.error("Error creating user (" + email + "): Missing required fields");
		res.status(400).send("Bad Request");
		return;
	}

	request.server.createUser(password, firstName, lastName, email, birthday, avatarUrl)
		.then((user: User) => {
			console.log("User created:", user.email);
			res.status(200).send({
				user: {
					email: user.email,
					id: user.uuid,
					metadata: {
						firstName: user.firstName,
						lastName: user.lastName,
						birthday: user.birthday,
						accountType: user.accountType,
						avatarUrl: user.avatarUrl,
						boards: user.boards
					}
				}
			});
		})
		.catch((e: any) => {
			console.error("Error creating user (" + email + "):", e);
			res.status(401).send("Unauthorized");
		});
};

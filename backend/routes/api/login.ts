
import { Response, Request } from "express";
import { getUserByEmail } from "../../Database";
import { hashOptions, Verify } from "src/Authentication";

export default function LogIn (req: Request, res: Response) {

	const body = req.body;
	const email: string = body.email;
	const password: string = body.password;

	const user = getUserByEmail(email);

	if (!user) {
		console.error("Invalid login: User not found");
		return res.status(401).send("Unauthorized");
	}

	Verify(password, user.password, hashOptions)
		.then((valid: boolean) => {

			if (!valid) {
				console.error("Invalid login: Incorrect password");
				return res.status(401).send("Unauthorized");
			}

			console.info("User logged in:", user.email);

			if (req.session.user === undefined) req.session.user = { id: user.uuid };
			else req.session.user.id = user.uuid;

			return res.status(200).send({
				user: {
					email: user.email,
					uuid: user.uuid,
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
		.catch((err: unknown) => {
			console.error("-------------------\nInternal Server Error:\n\n", err, "\n-------------------");
			return res.status(500).send("Internal Server Error");
		});
}
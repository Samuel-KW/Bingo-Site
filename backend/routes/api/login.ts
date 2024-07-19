
import { Response, Request } from "express";
import { User } from "../../Database";
import passport from "passport";

export default function LogIn (req: Request, res: Response) {
	passport.authenticate('local', function(err: any, user: User, info: object, status: number) {

		if (err) {
			console.error("Invalid login: Internal Server Error\n", err);
			return res.status(500).send("Internal Server Error");
		}

		if (!user) {
			console.error("Invalid login: Incorrect credentials", info);
			return res.status(401).send("Unauthorized");
		}

		console.info("User logged in:", user.email);
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
	})(req, res);
}
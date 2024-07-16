
import { Response } from "express";
import { AuthenticatedRequest } from "../../src/Server";
import passport from "passport";
import { User } from "../../src/Database";

export default function LogIn (req: AuthenticatedRequest, res: Response): void {
	passport.authenticate('local', function(err: any, user: User, info: object, status: number) {

		if (err)
			return res.status(500).send("Internal Server Error");

		if (!user)
			return res.status(401).send("Unauthorized");

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
import { Response, Request } from "express";
import { getOwnedBoards } from "../../Database";
import { isAuthenticated } from "src/Authentication";

export function GetOwnedBoards (req: Request, res: Response) {

	if (!isAuthenticated(req)) {
		res.status(401).send("Unauthorized");
		return;
	}

	const body = req.body;
	const limit: number = body.limit ?? 10;

	const uuid = req.user.uuid;
	const boards = getOwnedBoards(uuid, limit);

	res.json(boards);
}
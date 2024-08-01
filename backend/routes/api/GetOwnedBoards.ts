import { Response, Request } from "express";
import { getOwnedBoards } from "../../Database";
import { isAuthenticated } from "src/Authentication";

const MAX_BOARDS: number = 50;

export function GetOwnedBoards (req: Request, res: Response) {

	if (!isAuthenticated(req))
		return res.status(401).send("Unauthorized");

	let limit: number = parseInt(req.body, 10);
	limit = isNaN(limit) ? 10 : Math.min(limit, MAX_BOARDS);

	const uuid = req.user.uuid;
	const boards = getOwnedBoards(uuid, limit);

	return res.json(boards);
}
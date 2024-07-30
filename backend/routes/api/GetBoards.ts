import { Response, Request } from "express";
import { getBoards } from "../../Database";
import { isAuthenticated } from "src/Authentication";

const limit = 10;

export function GetBoards (req: Request, res: Response) {

	if (!isAuthenticated(req)) {
		res.status(401).send("Unauthorized");
		return;
	}

	const boards = req.user.boards.slice(0, limit);
	const boardData = getBoards(boards);

	res.json(boardData);
}
import { Response, Request } from "express";
import { getBoards } from "../../Database";
import { isAuthenticated } from "src/Authentication";

const MAX_BOARDS = 10;

export function GetBoards (req: Request, res: Response) {

	if (!isAuthenticated(req))
		return res.status(401).send("Unauthorized");

	const boards = req.user.boards.slice(0, MAX_BOARDS);
	const boardData = getBoards(boards);

	return res.json(boardData);
}
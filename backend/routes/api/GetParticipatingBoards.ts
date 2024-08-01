import { Response, Request } from "express";
import { getBoards } from "../../Database";
import { isAuthenticated } from "src/Authentication";

const MAX_BOARDS = 10;

export function GetParticipatingBoards (req: Request, res: Response) {

	if (!isAuthenticated(req))
		return res.status(401).send("Unauthorized");

	const boards: string[] = req.user.boards ? JSON.parse(req.user.boards) : [];
	const boardData = getBoards(boards.slice(0, MAX_BOARDS));

	return res.json(boardData);
}
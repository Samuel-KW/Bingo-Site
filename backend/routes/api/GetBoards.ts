import { Response } from "express";
import { AuthenticatedRequest } from "../../src/Server";
import { getBoards } from "../../Database";

export function GetBoards (req: AuthenticatedRequest, res: Response) {
	const limit = 10;

	const boards = req.user.boards.split(",").slice(0, limit);
	const boardData = getBoards(boards);

	res.json(boardData);
}
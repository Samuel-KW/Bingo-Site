import { Response } from "express";
import { AuthenticatedRequest } from "../../src/Server";
import { getBoard } from "../../Database";

export function BoardLookup (req: AuthenticatedRequest, res: Response) {
	const board = getBoard(req.params.id);
	if (board === undefined) {
		res.status(404).send("Board not found");
		return;
	}

	res.json(board);
}
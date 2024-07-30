import { Response, Request } from "express";
import { AuthenticatedRequest } from "../../src/Server";
import { getBoard } from "../../Database";

export function BoardLookup (req: Request | AuthenticatedRequest, res: Response) {

	if ("params" in req === false) {
		res.status(404).send("Invalid board.");
		return;
	}

	const board = getBoard(req.params.id);
	if (board === undefined) {
		res.status(404).send("Board not found");
		return;
	}

	res.json(board);
}
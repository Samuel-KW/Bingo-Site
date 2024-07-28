import { Response } from "express";
import { AuthenticatedRequest } from "../../src/Server";
import { deleteBoard, getBoard } from "../../Database";

export function BoardLookup (req: AuthenticatedRequest, res: Response) {

	const id = req.body.board;

	if (id === undefined) {
		res.status(404).send("Invalid board.");
		return;
	}

	const board = getBoard(req.params.id);

	if (board === undefined) {
		res.status(404).send("Board not found");
		return;
	}

	if (req.user.uuid !== id) {
		res.status(403).send("You do not have permission to delete this board.");
		return;
	}

	deleteBoard(id);
	res.json({ success: true });
}
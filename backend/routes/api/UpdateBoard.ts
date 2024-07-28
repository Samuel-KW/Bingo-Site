import { Response } from "express";
import { AuthenticatedRequest } from "../../src/Server";
import { getBoard, updateBoard } from "../../Database";

export function UpdateBoard (req: AuthenticatedRequest, res: Response) {

	const id = req.body.board;
	const data = req.body.data;

	if (id === undefined || data === undefined) {
		res.status(404).send("Invalid board.");
		return;
	}

	const board = getBoard(req.params.id);

	if (board === undefined) {
		res.status(404).send("Board not found");
		return;
	}

	const editors = board.editors;
	if (req.user.uuid !== id && board.editors) {
		res.status(403).send("You do not have permission to delete this board.");
		return;
	}

	updateBoard(id);
	res.json({ success: true });
}
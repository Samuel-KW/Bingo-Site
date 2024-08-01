import { Response } from "express";
import { AuthenticatedRequest } from "../../src/Server";
import { deleteBoard, getBoard } from "../../Database";

export function BoardLookup (req: AuthenticatedRequest, res: Response) {

	const id = req.params.board;
	if (!id) {
		res.status(404).send("Invalid board.");
		return;
	}

	const board = getBoard(id);
	if (!board) {
		res.status(404).send("Board not found");
		return;
	}

	if (req.user.uuid !== board.owner) {
		res.status(403).send("You do not have permission to delete this board.");
		return;
	}

	deleteBoard(id);
	res.json({ success: true });
}
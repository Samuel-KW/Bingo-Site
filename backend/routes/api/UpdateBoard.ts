import { Response } from "express";
import { AuthenticatedRequest } from "../../src/Server";
import { getBoard, updateBoard } from "../../Database";
import { DatabaseBoard } from "../../src/Board";
import { UserCreateBingoBoard } from "./Validation";

export function UpdateBoard (req: AuthenticatedRequest, res: Response) {

	const id: string = req.body.board;
	const data: unknown = req.body.data;

	// TODO Check the data type of the body and handle JSON/stringify handling
	console.log("UpdateBoard", id, data);

	if (!id || !data) {
		res.status(404).send("Invalid board.");
		return;
	}

	const board: DatabaseBoard | null = getBoard(req.params.id);
	if (!board) {
		res.status(404).send("Board not found");
		return;
	}

	const user: string = req.user.uuid;
	const editors: string[] = board.editors ? JSON.parse(board.editors) : [];

	if (user === board.owner || editors.includes(user)) {

		const parsed = UserCreateBingoBoard.safeParse(data);

		if (!parsed.success) {
			console.error("Error updating board:", parsed.error.errors);
			res.status(400).send("Bad Request");
			return;
		}

		updateBoard(id, parsed.data);
		res.json({ success: true });

	} else {
		res.status(403).send("You do not have permission to delete this board.");
	}
}
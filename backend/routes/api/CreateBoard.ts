import { Response, Request } from "express";
import { addBoard, Board, updateUserBoards } from "../../Database";

import { UserCreateBingoBoard } from "./Validation";
import { isAuthenticated } from "src/Authentication";

export function CreateBoard (req: Request, res: Response) {

	if (!isAuthenticated(req)) {
		res.status(401).send("Unauthorized");
		return;
	}

	const result = UserCreateBingoBoard.safeParse(req.body);

	if (!result.success) {
		console.error("Error creating board:");
		console.log(req.body);
		console.log(result.error);
		res.status(400).send("Bad Request");
		return;
	}

	const { title, description, editors, cards } = result.data;
	const uuid = req.user.uuid;

	// Create new board
	const board = Board.new({ title, description, owner: uuid, editors, cards });

	// Add board to user profile
	const ids = req.user.boards;
	ids.push(board.id);

	// Save board
	updateUserBoards(uuid, ids);
	addBoard(board);
	console.log("User ", uuid, " created board ", board.id);
	res.json(board);

}
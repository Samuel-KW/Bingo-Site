import { Response, Request } from "express";
import { addBoard, updateUserBoards } from "../../Database";
import { Board } from "../../src/Board";
import { UserCreateBingoBoard } from "../validation";
import { isAuthenticated } from "src/Authentication";

export function CreateBoard (req: Request, res: Response) {

	if (!isAuthenticated(req))
		return res.status(401).send("Unauthorized");

	const result = UserCreateBingoBoard.safeParse(req.body);

	if (!result.success) {
		console.error("Error creating board:");
		console.log(req.body);
		console.log(result.error);
		return res.status(400).send("Bad Request");
	}

	const uuid = req.user.uuid;
	const { title, description, editors, cards } = result.data;

	// Create new board
	const board = Board.new({ owner: uuid, title, description, editors, cards });

	// Add board to user profile
	const ids = req.user.boards ? JSON.parse(req.user.boards) : [];
	ids.push(board.id);

	// Save board
	updateUserBoards(uuid, ids);
	addBoard(board);

	console.log("User", uuid, "created board", board.id);
	return res.json(board);
}
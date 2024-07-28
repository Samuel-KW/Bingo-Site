import { Response } from "express";
import { AuthenticatedRequest } from "../../src/Server";
import { addBoard, Board, updateUserBoards } from "../../Database";

import { z } from "zod";
import { BingoBoardSchema } from "./Validation";

export function CreateBoard (req: AuthenticatedRequest, res: Response) {
	const body = req.body;

	const result = BingoBoardSchema.safeParse(body);

	if (!result.success) {
		console.error("Error creating board:", result.error);
		res.status(400).send("Bad Request");
		return;
	}

	const { title, description, editors, cards } = result.data;
	const uuid = req.user.uuid;

	// Create new board
	const board = Board.new({ title, description, owner: uuid, editors, cards });

	// Add board to user profile
	const ids = JSON.parse(req.user.boards);
	ids.push(board.id);

	// Save board
	updateUserBoards(uuid, ids);
	addBoard(board.toDB());

	res.json(board);

}
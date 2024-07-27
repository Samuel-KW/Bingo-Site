import { Response } from "express";
import { AuthenticatedRequest } from "../../src/Server";
import { addBoard, Board, updateUserBoards } from "../../Database";

export function CreateBoard (req: AuthenticatedRequest, res: Response) {
	const body = req.body;

	const title: any = body.title;
	const description: any = body.description;
	const editors: any = body.editors;
	const cards: any = body.cards;

	// Verify that all required fields are present
	if (title === undefined || description === undefined || editors === undefined || cards === undefined) {
		console.error("Error creating board (" + title + "): Missing required fields");
		res.status(400).send("Bad Request");
		return;
	}

	// Verify that fields are the correct type
	if (typeof title !== "string" || typeof description !== "string" || !Array.isArray(editors) || !Array.isArray(cards)) {
		console.error("Error creating board (" + title + "): Invalid field types");
		res.status(400).send("Bad Request");
		return;
	}

	// Verify that the number of cards is a perfect square
	if (Math.sqrt(cards.length) % 1 !== 0) {
		console.error("Error creating board (" + title + "): Invalid number of cards");
		res.status(400).send("Bad Request");
		return;
	}

	// Verify that all cards are valid
	const invalidCards = cards.some((card: any) => {
		const [title, description, required, type] = card;

		if (title === undefined || description === undefined || required === undefined || type === undefined) {
			console.error("Error creating board (" + title + "): Missing required card fields");
			return false;
		}

		if (typeof title !== "string" || typeof description !== "string" || typeof required !== "boolean" || typeof type !== "string") {
			console.error("Error creating board (" + title + "): Invalid card field types");
			return false;
		}

		if (!["QR Code", "Honor System", "Given", "User Input"].includes(type)) {
			console.error("Error creating board (" + title + "): Invalid card type");
			return false;
		}
	});

	if (invalidCards) {
		console.error("Error creating board (" + title + "): Invalid card");
		res.status(400).send("Bad Request");
		return;
	}

	const uuid = req.user.uuid;

	console.log(editors);

	// Create new board
	const board = Board.new(title, description, uuid, editors, cards);

	// Add board to user profile
	const ids = req.user.boards ? req.user.boards.split(",") : [];
	ids.push(board.id);

	// Save board
	updateUserBoards(uuid, ids);
	addBoard(board.toDB());

	res.json(board);

}
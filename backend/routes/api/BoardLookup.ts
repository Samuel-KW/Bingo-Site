import { Response, Request } from "express";
import { getBoard } from "../../Database";

export function BoardLookup (req: Request, res: Response) {

	const id = req.params["id"];
	if (typeof id !== "string")
		return res.status(404).send("Invalid board.");

	const board = getBoard(id);
	if (!board)
		return res.status(404).send("Board not found");

	return res.json(board);
}
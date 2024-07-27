import { Response } from "express";
import { AuthenticatedRequest } from "../../src/Server";
import { getOwnedBoards } from "../../Database";

export function GetOwnedBoards (req: AuthenticatedRequest, res: Response) {
	const body = req.body;
	const limit: number = body.limit ?? 10;

	const uuid = req.user.uuid;
	const boards = getOwnedBoards(uuid, limit);

	res.json(boards);
}
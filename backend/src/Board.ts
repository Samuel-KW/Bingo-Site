import { randomUUID } from "crypto";
import { BingoBoard, BingoCard, BoardPlayerStats, DatabaseBingoBoard } from "routes/api/Validation";

export class DatabaseBoard {
	public id!: string;
	public title!: string;
	public description!: string;
	public created_at!: number;
	public updated_at!: number;
	public owner!: string;
	public editors: string | undefined;
	public cards: string | undefined;
	public players: string | undefined;

	public toBoard(): BingoBoard {
		return {
			id: this.id,
			title: this.title,
			description: this.description,
			created_at: this.created_at,
			updated_at: this.updated_at,
			owner: this.owner,
			editors: this.editors ? JSON.parse(this.editors) : [],
			cards: this.cards ? JSON.parse(this.cards) : [],
			players: this.players ? JSON.parse(this.players) : []
		};
	}
}

export class Board implements BingoBoard {
	constructor(
		public id: string,
		public title: string,
		public description: string,
		public created_at: number,
		public updated_at: number,
		public owner: string,
		public editors: string[],
		public cards: BingoCard[],
		public players: BoardPlayerStats[]
	) { }

	toDB(): DatabaseBingoBoard {
		return {
			id: this.id,
			title: this.title,
			description: this.description,
			created_at: this.created_at,
			updated_at: this.updated_at,
			owner: this.owner,
			editors: JSON.stringify(this.editors),
			cards: JSON.stringify(this.cards),
			players: JSON.stringify(this.players)
		};
	}

	static fromDB(board: DatabaseBingoBoard): Board {
		return new Board(
			board.id,
			board.title,
			board.description,
			board.created_at,
			board.updated_at,
			board.owner,
			JSON.parse(board.editors),
			JSON.parse(board.cards),
			JSON.parse(board.players)
		);
	}

	static new(params: Partial<BingoBoard>): Board {
		const { title, description, owner, editors=[], cards=[] } = params;

		if (title === undefined || description === undefined || owner === undefined)
			throw new Error("Title, description, and owner are required to create a new board.");

		const now = Date.now();
		return new Board(randomUUID(), title, description, now, now, owner, editors, cards, []);
	}
}
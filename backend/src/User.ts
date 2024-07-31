import { randomUUID } from "crypto";
import { BingoBoard, BingoUser, BoardPlayerStats, DatabaseBingoUser } from "routes/api/Validation";
import { Board } from "./Board";

export class DatabaseUser {
	public uuid!: string;
	public password!: string;
	public firstName: string | undefined;
	public lastName: string | undefined;
	public email!: string;
	public birthday: string | undefined;
	public avatarUrl: string | undefined;
	public accountType!: "user" | "admin";
	public boards: string | undefined;
	public games: string | undefined;

	public toUser(): BingoUser {
		return {
			uuid: this.uuid,
			password: this.password,
			firstName: this.firstName,
			lastName: this.lastName,
			email: this.email,
			birthday: this.birthday,
			avatarUrl: this.avatarUrl,
			accountType: this.accountType,
			boards: this.boards ? JSON.parse(this.boards) : [],
			games: this.games ? JSON.parse(this.games) : []
		};
	}
}

export class User implements BingoUser {
	constructor(
		public uuid: string,
		public password: string,
		public firstName: string | undefined,
		public lastName: string | undefined,
		public email: string,
		public birthday: string | undefined,
		public avatarUrl: string | undefined,
		public accountType: "user" | "admin",
		public boards: string[],
		public games: BoardPlayerStats[]
	) { }

	static new(params: Partial<User>={}): User {
		const { password, firstName, lastName, email, birthday, avatarUrl } = params;

		if (password === undefined || email === undefined)
			throw new Error("Password and email are required to create a new user.");

		return new User(randomUUID(), password, firstName, lastName, email, birthday, avatarUrl, "user", [], []);
	}

	toDB(): DatabaseBingoUser {
		return {
			uuid: this.uuid,
			password: this.password,
			firstName: this.firstName,
			lastName: this.lastName,
			email: this.email,
			birthday: this.birthday,
			avatarUrl: this.avatarUrl,
			accountType: this.accountType,
			boards: JSON.stringify(this.boards),
			games: JSON.stringify(this.games)
		};
	}

	createBoard(params: Partial<BingoBoard>={}): Board {
		const { title, description, editors=[], cards=[] } = params;

		const board = Board.new({ title, description, owner: this.uuid, editors, cards });
		this.boards.push(board.id);
		return board;
	}
}
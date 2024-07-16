import { Database, Statement } from "bun:sqlite";
import { Request, Response, NextFunction } from "express";

export type BingoCard = [
	string, // Title
	string, // Description
	boolean, // Required
	"QR Code" | "Honor System" | "Given" | "User Input" // Type
];

export type UserDB = {
	uuid: string;
	password: string;
	firstName: string;
	lastName: string;
	email: string;
	birthday: string;
	avatarUrl: string;
	accountType: string;
	boards: string;
};

export type BoardDB = {
	id: string;
	title: string;
	created_at: number;
	updated_at: number;
	owner: string;
	editors: string;
	cards: string;
};

export class Board {
	constructor(
		public id: string,
		public title: string,
		public createdAt: number,
		public updatedAt: number,
		public owner: string,
		public editors: string[],
		public cards: BingoCard[]
	) { }

	static fromDB(board: BoardDB): Board {
		return new Board(
			board.id,
			board.title,
			board.created_at,
			board.updated_at,
			board.owner,
			board.editors.split(","),
			JSON.parse(board.cards)
		);
	}

	toDB(): any {
		return {
			id: this.id,
			title: this.title,
			created_at: this.createdAt,
			updated_at: this.updatedAt,
			owner: this.owner,
			editors: this.editors.join(","),
			cards: JSON.stringify(this.cards)
		};
	}

	static createBoard(title: string, owner: string, editors: string[], cards: BingoCard[]): Board {
		return new Board(crypto.randomUUID(), title, Date.now(), Date.now(), owner, editors, cards);
	}
}

export class User {
	constructor(
		public uuid: string,
		public password: string,
		public firstName: string,
		public lastName: string,
		public email: string,
		public birthday: string,
		public avatarUrl: string,
		public accountType: string,
		public boards: string[]
	) { }

	static createUser(
		password: string,
		firstName: string,
		lastName: string,
		email: string,
		birthday: string,
		avatarUrl: string,
	): User {
		return new User(crypto.randomUUID(), password, firstName, lastName, email, birthday, avatarUrl, "user", []);
	}

	static fromDB(user: UserDB): User {
		return new User(
			user.uuid,
			user.password,
			user.firstName,
			user.lastName,
			user.email,
			user.birthday,
			user.avatarUrl,
			user.accountType,
			user.boards.split(",")
		);
	}

	toDB(): any {
		return {
			uuid: this.uuid,
			password: this.password,
			firstName: this.firstName,
			lastName: this.lastName,
			email: this.email,
			birthday: this.birthday,
			avatarUrl: this.avatarUrl,
			accountType: this.accountType,
			boards: this.boards.join(",")
		};
	}

	createBoard(title: string, editors: string[], cards: BingoCard[]): Board {
		const board = Board.createBoard(title, this.uuid, editors, cards);
		this.boards.push(board.id);
		return board;
	}
}

export default class BingoDatabase {

	private db: Database;

	public queryGetUserByEmail: Statement
	public queryGetUserByUUID: Statement;
	public queryGetBoardByID: Statement;

	public queryCreateUser: Statement;
	public queryCreateBoard: Statement;

	constructor(private dbFile: string) {
	}

	getDatabase(): Database {
		return this.db;
	}

	addBoard(board: Board) {
		this.queryCreateBoard.run(board.toDB());
	}

	addUser(user: User) {
		this.queryCreateUser.run(user.toDB());
	}

	getBoard(id: string): Board | undefined {
		const response: unknown = this.queryGetBoardByID.get({ id });

		if (response === undefined || response === null)
			return undefined;

		const board = response as BoardDB;
		return Board.fromDB(board);
	}

	getUserByEmail(email: string): User | undefined {
		const response: unknown = this.queryGetUserByEmail.get({ email });

		if (response === undefined || response === null)
			return undefined;

		const user = response as UserDB;
		return User.fromDB(user);
	}

	getUser(uuid: string): User | undefined {
		const response: unknown = this.queryGetUserByUUID.get({ uuid });

		if (response === undefined || response === null)
			return undefined;

		const user = response as UserDB;
		return User.fromDB(user);
	}

	openQueries() {
		this.queryGetUserByEmail = this.db.prepare("SELECT * FROM users WHERE email = $email");
		this.queryGetUserByUUID = this.db.prepare("SELECT * FROM users WHERE uuid = $uuid");
		this.queryGetBoardByID = this.db.prepare("SELECT * FROM boards WHERE id = $id");

		this.queryCreateUser = this.db.prepare("INSERT OR IGNORE INTO users (uuid, password, firstName, lastName, email, birthday, avatarUrl, accountType, boards) VALUES ($uuid, $password, $firstName, $lastName, $email, $birthday, $avatarUrl, $accountType, $boards)");
		this.queryCreateBoard = this.db.prepare("INSERT OR IGNORE INTO boards (id, title, created_at, updated_at, owner, editors, cards) VALUES ($id, $title, $created_at, $updated_at, $owner, $editors, $cards)");
	}

	closeQueries() {
		this.queryGetUserByEmail.finalize();
		this.queryGetUserByUUID.finalize();
		this.queryGetBoardByID.finalize();

		this.queryCreateUser.finalize();
		this.queryCreateBoard.finalize();
	}

	openDatabase() {
		const BingoDB = new Database(this.dbFile, {
			create: true,
			strict: true
		});

		// Enable Write-Ahead Logging
		BingoDB.exec("PRAGMA journal_mode = WAL;");

		// Create default tables if they don't exist
		BingoDB.run("CREATE TABLE IF NOT EXISTS users (uuid TEXT PRIMARY KEY, password TEXT, firstName TEXT, lastName TEXT, email TEXT, birthday TEXT, avatarUrl TEXT, accountType TEXT, boards TEXT)");
		BingoDB.run("CREATE TABLE IF NOT EXISTS boards (id TEXT PRIMARY KEY, title TEXT, created_at INTEGER, updated_at INTEGER, owner TEXT, editors TEXT, cards TEXT, FOREIGN KEY(owner) REFERENCES users(uuid))");

		this.db = BingoDB;
	}

	closeDatabase() {
		this.db.close();
	}
}

// const board = user.createBoard("Testing Board", [], [
//     ["Test Card 1", "This is a test card", false, "User Input"],
//     ["Test Card 2", "This is a test card", true, "QR Code"],
//     ["Test Card 3", "This is a test card", false, "User Input"],
//     ["Test Card 4", "This is a test card", false, "Given"],
//     ["Test Card 5", "This is a test card", true, "QR Code"],
//     ["Test Card 6", "This is a test card", false, "Honor System"],
//     ["Test Card 7", "This is a test card", true, "User Input"],
//     ["Test Card 8", "This is a test card", false, "QR Code"],
//     ["Test Card 9", "This is a test card", true, "QR Code"],
//     ["Test Card 10", "This is a test card", false, "QR Code"],
//     ["Test Card 11", "This is a test card", false, "User Input"],
//     ["Test Card 12", "This is a test card", true, "Honor System"],
//     ["Test Card 13", "This is a test card", false, "User Input"],
//     ["Test Card 14", "This is a test card", false, "Given"],
//     ["Test Card 15", "This is a test card", true, "Honor System"],
//     ["Test Card 16", "This is a test card", false, "QR Code"]
// ]);

// Session.addUser(user);
// Session.addBoard(board);

// const retrievedUser = Session.getUser(user.uuid);
// const retrievedBoard = Session.getBoard(board.id);

// console.log(retrievedUser);
// console.log(retrievedBoard);

// Session.closeQueries();
// Session.closeDatabases();
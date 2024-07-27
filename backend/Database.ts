import { Database, Statement } from "bun:sqlite";
import { randomUUID } from "crypto";

export interface BoardPlayerStats {

	/* UUID of the player */
	player: string;

	/* Bingo card details */
	cards: boolean[]
}

export interface DatabaseUser {
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

export interface DatabaseBoard {
	id: string;
	title: string;
	description: string;
	created_at: number;
	updated_at: number;
	owner: string;
	editors: string;
	cards: string;
	players: string;
};

export type BingoCard = [
	string, // Title
	string, // Description
	boolean, // Required
	"QR Code" | "Honor System" | "Given" | "User Input" // Type
];

export class Board {
	constructor(
		public id: string,
		public title: string,
		public description: string,
		public createdAt: number,
		public updatedAt: number,
		public owner: string,
		public editors: string[],
		public cards: BingoCard[],
		public players: BoardPlayerStats[]
	) { }

	toDB(): DatabaseBoard {
		return {
			id: this.id,
			title: this.title,
			description: this.description,
			created_at: this.createdAt,
			updated_at: this.updatedAt,
			owner: this.owner,
			editors: this.editors.join(","),
			cards: JSON.stringify(this.cards),
			players: JSON.stringify(this.players)
		};
	}

	static fromDB(board: DatabaseBoard): Board {
		return new Board(
			board.id,
			board.title,
			board.description,
			board.created_at,
			board.updated_at,
			board.owner,
			board.editors.split(","),
			JSON.parse(board.cards),
			JSON.parse(board.players)
		);
	}

	static new(title: string, description: string, owner: string, editors: string[], cards: BingoCard[]): Board {
		const now = Date.now();
		return new Board(randomUUID(), title, description, now, now, owner, editors, cards, []);
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

	static new(password: string, firstName: string, lastName: string, email: string, birthday: string, avatarUrl: string): User {
		return new User(randomUUID(), password, firstName, lastName, email, birthday, avatarUrl, "user", []);
	}

	static fromDB(user: DatabaseUser): User {
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

	toDB(): DatabaseUser {
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

	createBoard(title: string, description: string, editors: string[], cards: BingoCard[]): Board {
		const board = Board.new(title, description, this.uuid, editors, cards);
		this.boards.push(board.id);
		return board;
	}
}

const DATABASE_FILE = "./db/" + (process.env.DATABASE_FILE ?? "db.sqlite");
const DB_USERS = "users";
const DB_BOARDS = "boards";
console.log("Writing to database file:", DATABASE_FILE);

const db = new Database(DATABASE_FILE, {
	create: true,
	strict: true
});

// Enable Write-Ahead Logging
db.exec("PRAGMA journal_mode = WAL;");

// Create default tables if they don't exist
db.run(`CREATE TABLE IF NOT EXISTS ${DB_USERS} (uuid TEXT NOT NULL PRIMARY KEY, password TEXT NOT NULL, firstName TEXT, lastName TEXT, email TEXT NOT NULL, birthday TEXT, avatarUrl TEXT, accountType TEXT NOT NULL, boards JSON NOT NULL)`);
db.run(`CREATE TABLE IF NOT EXISTS ${DB_BOARDS} (id TEXT NOT NULL PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, owner TEXT NOT NULL, editors JSON NOT NULL, cards JSON NOT NULL, players JSON NOT NULL, FOREIGN KEY(owner) REFERENCES ${DB_USERS}(uuid))`);

export class Query {

	public static getUserByEmail: Statement;
	public static getUserByUUID: Statement;
	public static getBoardByID: Statement;
	public static createUser: Statement;
	public static createBoard: Statement;

	public static isOpen = false;

	/**
	 * Prepares common SQL queries
	 * @returns void
	 * @static
	 */
	public static open () {
		Query.getUserByEmail = db.prepare(`SELECT * FROM ${DB_USERS} WHERE email = $email`);
		Query.getUserByUUID = db.prepare(`SELECT * FROM ${DB_USERS} WHERE uuid = $uuid`);
		Query.getBoardByID = db.prepare(`SELECT * FROM ${DB_BOARDS} WHERE id = $id`);
		Query.createUser = db.prepare(`INSERT OR IGNORE INTO ${DB_USERS} (uuid, password, firstName, lastName, email, birthday, avatarUrl, accountType, boards) VALUES ($uuid, $password, $firstName, $lastName, $email, $birthday, $avatarUrl, $accountType, $boards)`);
		Query.createBoard = db.prepare(`INSERT OR IGNORE INTO ${DB_BOARDS} (id, title, description, created_at, updated_at, owner, editors, cards, players) VALUES ($id, $title, $description, $created_at, $updated_at, $owner, $editors, $cards, $players)`);

		Query.isOpen = true;
	}

	/**
	 * Finalizes the prepared SQL queries which clears up memeory
	 * @returns void
	 * @static
	 */
	public static close () {
		Query.getUserByEmail.finalize();
		Query.getUserByUUID.finalize();
		Query.getBoardByID.finalize();
		Query.createUser.finalize();
		Query.createBoard.finalize();

		Query.isOpen = false;
	}
};

Query.open();

/**
 * Add a board to the database
 * @param board Board object to add
 * @returns void
 */
export const addBoard = (board: DatabaseBoard) => {
	Query.createBoard.run(board);
};

/**
 * Add a user to the database
 * @param user User object to add
 * @returns void
 */
export const addUser = (user: DatabaseUser) => {
	Query.createUser.run(user);
};

/**
 * Get a board by its ID
 * @param id Board ID to search for
 * @returns DatabaseBoard object if found, otherwise undefined
 */
export const getBoard = (id: string): DatabaseBoard | undefined => {
	const response: unknown = Query.getBoardByID.get({ id });

	if (response === undefined || response === null)
		return undefined;

	return response as DatabaseBoard;
};

/**
 * Get a list of boards by their IDs
 * @param ids Array of board IDs to search for
 * @returns Array of DatabaseBoard objects
 */
export const getBoards = (ids: string[]): DatabaseBoard[] => {
	const list = ids.map(() => "?").join(",");
	console.log(list);
	const response: unknown = db.prepare(`SELECT * FROM ${DB_BOARDS} WHERE id IN (${list})`).all(...ids);

	if (response === undefined || response === null)
		return [];

	return response as DatabaseBoard[];
};


/**
 * Get a list of boards owned by a user
 * @param owner User UUID to search for
 * @param limit Maximum number of boards to return
 * @returns Array of DatabaseBoard objects
 */
export const getOwnedBoards = (owner: string, limit: number = 10): DatabaseBoard[] => {
	const response: unknown = db.prepare(`SELECT * FROM ${DB_BOARDS} WHERE owner = $owner LIMIT $limit`).all({ owner, limit });

	if (response === undefined || response === null)
		return [];

	return response as DatabaseBoard[];
}

/**
 * Get a user by their email
 * @param email Email to search for
 * @returns DatabaseUser object if found, otherwise undefined
 */
export const getUserByEmail = (email: string): DatabaseUser | undefined => {
	const response: unknown = Query.getUserByEmail.get({ email });

	if (response === undefined || response === null)
		return undefined;

	return response as DatabaseUser;
};

/**
 * Updates a user's owned boards
 * @param uuid User UUID to update
 * @param boards New list of board IDs
 */
export const updateUserBoards = (uuid: string, boards: string[]) => {
	const str = boards.join(",");
	db.prepare(`UPDATE ${DB_USERS} SET boards = $boards WHERE uuid = $uuid`).run({ uuid, boards: str });
};

/**
 * Get all boards in the database
 * @returns Array of DatabaseBoard objects
 */
export const getAllBoards = (): DatabaseBoard[] => {
	const response: unknown = db.prepare(`SELECT * FROM ${DB_BOARDS}`).all();

	if (response === undefined || response === null)
		return [];

	return response as DatabaseBoard[];
};

export const getAllUsers = (): DatabaseUser[] => {

	const response: unknown = db.prepare(`SELECT * FROM ${DB_USERS}`).all();

	if (response === undefined || response === null)
		return [];

	return response as DatabaseUser[];
}

/**
 * Get a user by their UUID
 * @param uuid User UUID to search for
 * @returns DatabaseUser object if found, otherwise undefined
 */
export const getUserByUUID = (uuid: string): DatabaseUser | undefined => {
	const response: unknown = Query.getUserByUUID.get({ uuid });

	if (response === undefined || response === null)
		return undefined;

	return response as DatabaseUser;
};

export default db;


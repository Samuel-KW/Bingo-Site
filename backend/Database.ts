import { Database, Statement } from "bun:sqlite";
import { BingoUser, BingoBoard, DatabaseBingoBoard } from "routes/api/Validation";
import { DatabaseBoard } from "src/Board";
import { DatabaseUser } from "src/User";

const DATABASE_FILE = "./db/" + (process.env.DATABASE_FILE ?? "db.sqlite");
const DB_USERS = "users";
const DB_BOARDS = "boards";
console.log("Writing to database file:", DATABASE_FILE);

interface TableDefinition {
  name: string;
  columns: {
    [key: string]: {
      type: string;
      primaryKey?: boolean;
      notNull?: boolean;
    };
  };
}

function generateTableQuery(params: TableDefinition): string {
  const columnsDef = Object.entries(params.columns)
    .map(([columnName, columnDef]) => {
      const type = columnDef.type;
      const primaryKey = columnDef.primaryKey ? " PRIMARY KEY" : "";
      const notNull = columnDef.notNull ? " NOT NULL" : "";

      return `${columnName} ${type}${primaryKey}${notNull}`;
    })
    .join(", ");

  return `CREATE TABLE IF NOT EXISTS ${params.name} (${columnsDef})`;
}

const tableUsers: TableDefinition = {
  name: DB_USERS,
  columns: {
    uuid:					{ type: "TEXT", notNull: true, primaryKey: true, },
    password:			{ type: "TEXT", notNull: true },
    firstName:		{ type: "TEXT" },
    lastName:			{ type: "TEXT" },
    email:				{ type: "TEXT", notNull: true },
    birthday:			{ type: "TEXT" },
    avatarUrl:		{ type: "TEXT" },
    accountType:	{ type: "TEXT" },
    boards: 			{ type: "JSON" },
    games:				{ type: "JSON" }
  }
};

const tableBoards: TableDefinition = {
  name: DB_BOARDS,
  columns: {
		id:						{ type: "TEXT", 		notNull: true, primaryKey: true, },
    title:				{ type: "TEXT", 		notNull: true },
    description:	{ type: "TEXT", 		notNull: true },
    created_at:		{ type: "INTEGER",	notNull: true },
    updated_at:		{ type: "INTEGER",	notNull: true },
    owner:				{ type: "TEXT", 		notNull: true },
    editors:			{ type: "JSON" },
    cards:				{ type: "JSON", 		notNull: true },
    players:			{ type: "JSON" }
  }
};

const db = new Database(DATABASE_FILE, {
	create: true,
	strict: true
});

// Enable Write-Ahead Logging
db.exec("PRAGMA journal_mode = WAL;");

// Create default tables if they don't exist
db.run(generateTableQuery(tableUsers));
db.run(generateTableQuery(tableBoards));

export class Query {

	public static getUserByEmail: Statement<DatabaseUser>;
	public static getUserByUUID: Statement<DatabaseUser>;
	public static getBoardByID: Statement<DatabaseBoard>;
	public static createUser: Statement;
	public static createBoard: Statement;

	public static isOpen = false;
	public static db = db;

	/**
	 * Prepares common SQL queries
	 * @returns void
	 * @static
	 */
	public static open () {

		const tablesUsers = Object.keys(tableUsers.columns);
		const tablesBoards = Object.keys(tableBoards.columns);

		Query.getUserByEmail = db.prepare(`SELECT * FROM ${DB_USERS} WHERE email = $email`).as(DatabaseUser);
		Query.getUserByUUID = db.prepare(`SELECT * FROM ${DB_USERS} WHERE uuid = $uuid`).as(DatabaseUser);
		Query.getBoardByID = db.prepare(`SELECT * FROM ${DB_BOARDS} WHERE id = $id`).as(DatabaseBoard);
		Query.createUser = db.prepare(`INSERT OR IGNORE INTO ${DB_USERS} (${tablesUsers.join(", ")}) VALUES (${tablesUsers.map(v => "$" + v).join(", ")})`);
		Query.createBoard = db.prepare(`INSERT OR IGNORE INTO ${DB_BOARDS} (${tablesBoards.join(", ")}) VALUES (${tablesBoards.map(v => "$" + v).join(", ")})`);

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

/**
 * Add a board to the database
 * @param board Board object to add
 * @returns void
 */
export const addBoard = (board: BingoBoard) => {
	const now = Date.now();

	Query.createBoard.run({
		id: board.id,
		title: board.title,
		description: board.description,
		created_at: now,
		updated_at: now,
		owner: board.owner,
		editors: JSON.stringify(board.editors),
		cards: JSON.stringify(board.cards),
		players: JSON.stringify(board.players)
	});
};

/**
 * Add a user to the database
 * @param user User object to add
 * @returns void
 */
export const addUser = (user: BingoUser) => {
	Query.createUser.run({
		uuid: user.uuid,
		password: user.password,
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
		birthday: user.birthday,
		avatarUrl: user.avatarUrl,
		accountType: user.accountType,
		boards: JSON.stringify(user.boards),
		games: JSON.stringify(user.games)
	});
};

/**
 * Get a board by its ID
 * @param id Board ID to search for
 * @returns DatabaseBoard object if found, otherwise null
 */
export const getBoard = (id: string): DatabaseBoard | null => {
	return Query.getBoardByID
		.get({ id });
};

/**
 * Delete a board by its ID
 * @param id Board ID to delete
 */
export const deleteBoard = (id: string) => {
	db.prepare(`DELETE FROM ${DB_BOARDS} WHERE id = $id`)
		.run({ id });
};

/**
 * Update a board in the database
 * @param board Board object to update
 */
export const updateBoard = (board: BingoBoard) => {
	const data: DatabaseBingoBoard = {
		...board,
		updated_at: Date.now(),
		editors: JSON.stringify(board.editors),
		cards: JSON.stringify(board.cards),
		players: JSON.stringify(board.players)
	};

	const keys = Object.keys(data);
	db.prepare(`UPDATE ${DB_BOARDS} SET ${keys.map(k => `${k} = $${k}`).join(", ")} WHERE id = $id`)
		.run({...data});
};

/**
 * Get a list of boards by their IDs
 * @param ids Array of board IDs to search for
 * @returns Array of DatabaseBingoBoard objects
 */
export const getBoards = (ids: string[]): DatabaseBoard[] => {
	const list = ids.map(() => "?").join(",");

	return db.prepare(`SELECT * FROM ${DB_BOARDS} WHERE id IN (${list})`)
		.as(DatabaseBoard)
		.all(...list);
};

/**
 * Get a list of boards owned by a user
 * @param owner User UUID to search for
 * @param limit Maximum number of boards to return
 * @returns Array of DatabaseBingoBoard objects
 */
export const getOwnedBoards = (owner: string, limit: number = 10): DatabaseBoard[] => {
	return db.prepare(`SELECT * FROM ${DB_BOARDS} WHERE owner = $owner LIMIT $limit`)
		.as(DatabaseBoard)
		.all({ owner, limit });
}

/**
 * Get a user by their email
 * @param email Email to search for
 * @returns DatabaseUser object if found, otherwise undefined
 */
export const getUserByEmail = (email: string): DatabaseUser | null => {
	return Query.getUserByEmail
		.get({ email });
};

/**
 * Updates a user's owned boards
 * @param uuid User UUID to update
 * @param boards New list of board IDs
 */
export const updateUserBoards = (uuid: string, boards: string[]) => {
	db.prepare(`UPDATE ${DB_USERS} SET boards = $boards WHERE uuid = $uuid`)
		.run({ uuid, boards: JSON.stringify(boards) });
};

/**
 * Get all boards in the database
 * @returns Array of DatabaseBoard objects
 */
export const getAllBoards = (): DatabaseBoard[] => {
	return db.prepare(`SELECT * FROM ${DB_BOARDS}`)
		.as(DatabaseBoard)
		.all();
};


/**
 * Get a user by their UUID
 * @returns Array of DatabaseUser objects
 */
export const getAllUsers = (): DatabaseUser[] => {
	return db.prepare(`SELECT * FROM ${DB_USERS}`)
		.as(DatabaseUser)
		.all();
}

/**
 * Get a user by their UUID
 * @param uuid User UUID to search for
 * @returns DatabaseUser if found, otherwise undefined
 */
export const getUserByUUID = (uuid: string): DatabaseUser | null => {
	return Query.getUserByUUID.get({ uuid });
};

Query.open();
export default db;


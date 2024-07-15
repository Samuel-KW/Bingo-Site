import { Database } from "bun:sqlite";

class Board {
    constructor(
        public id: string,
        public title: string,
        public createdAt: string,
        public updatedAt: string,
        public owner: string,
        public editors: string[],
        public cards: BingoCard[]
    ) {}

    static fromDB(board: any): Board {
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
}

class User {
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
    ) {}

    static fromDB(user: any): User {
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
}

export default class BingoDatabase {

    private user: Database;
    private board: Database;

    constructor(private userDB: string, private boardDB: string) {
    }

    openDatabases () {
        const userDB = new Database(this.userDB, {
            create: true,
            strict: true
        });
        userDB.run("CREATE TABLE IF NOT EXISTS users (uuid TEXT PRIMARY KEY, password TEXT, firstName TEXT, lastName TEXT, email TEXT, birthday TEXT, avatarUrl TEXT, accountType TEXT, boards TEXT)");

        const boardDB = new Database(this.boardDB, {
            create: true,
            strict: true
        });
        boardDB.run("CREATE TABLE IF NOT EXISTS boards (id TEXT PRIMARY KEY, title TEXT, created_at TEXT, updated_at TEXT, owner TEXT, editors TEXT, cards TEXT)");
    
        this.user = userDB;
        this.board = boardDB;
    }

}

const userDB = new Database("../users.sqlite", {
    create: true,
    strict: true
});
userDB.run("CREATE TABLE IF NOT EXISTS users (uuid TEXT PRIMARY KEY, password TEXT, firstName TEXT, lastName TEXT, email TEXT, birthday TEXT, avatarUrl TEXT, accountType TEXT, boards TEXT)");

const boardDB = new Database("../boards.sqlite", {
    create: true,
    strict: true
});
boardDB.run("CREATE TABLE IF NOT EXISTS boards (id TEXT PRIMARY KEY, title TEXT, created_at TEXT, updated_at TEXT, owner TEXT, editors TEXT, cards TEXT)");

export type BingoCard = {
	title: string;
	description: string;
	required: boolean;
	type: "QR Code" | "Honor System" | "Given" | "User Input";
};

const boardId = crypto.randomUUID();
const userId = crypto.randomUUID();

const createUserQuery = userDB.query("INSERT INTO users (uuid, password, firstName, lastName, email, birthday, avatarUrl, accountType, boards) VALUES ($uuid, $password, $firstName, $lastName, $email, $birthday, $avatarUrl, $accountType, $boards)");
createUserQuery.run({
    uuid: userId,
    password: "1$argon2id$v=19$m=7168,t=5,p=1$307pW1QHqYL6MJBqTN+KhuLjg6N/IGASoD3SiANG+vs$3tZSxr79w9F8rNXuvnEsrSplfc6D4xOHR3hBn6VBBAU5a010aa78cb55fa8bb42a2d021802bd4",
    firstName: "John",
    lastName: "Doe",
    email: "email@mail.com",
    birthday: "01/01/2000",
    avatarUrl: "https://example.com/avatar.png",
    accountType: "user",
    boards: [boardId].join(",")
});
createUserQuery.finalize();

// const getByUUIDQuery = userDB.query("SELECT * FROM users WHERE uuid = $uuid");
// const results = getByUUIDQuery.all({
//   uuid: uuid,
// });

const getByFirstNameQuery = userDB.query("SELECT * FROM users WHERE firstName = $firstName");
const results = getByFirstNameQuery.all({
  firstName: "John",
});
getByFirstNameQuery.finalize();
console.log(results);

const queryCreateBoard = boardDB.query("INSERT INTO boards (id, title, created_at, updated_at, owner, editors, cards) VALUES ($id, $title, $created_at, $updated_at, $owner, $editors, $cards)");
queryCreateBoard.run({
    id: boardId,
    title: "Testing Board",
    created_at: Date.now() - 100,
    updated_at: Date.now(),
    owner: [userId].join(","),
    editors: [].join(","),
    cards: JSON.stringify([
        { title: "Test Card 1", description: "This is a test card", required: false, type: "User Input" },
        { title: "Test Card 2", description: "This is a test card", required: true, type: "QR Code" },
        { title: "Test Card 3", description: "This is a test card", required: false, type: "User Input" },
        { title: "Test Card 4", description: "This is a test card", required: false, type: "Given" },
        { title: "Test Card 5", description: "This is a test card", required: true, type: "QR Code" },
        { title: "Test Card 6", description: "This is a test card", required: false, type: "Honor System" },
        { title: "Test Card 7", description: "This is a test card", required: true, type: "User Input" },
        { title: "Test Card 8", description: "This is a test card", required: false, type: "QR Code" },
        { title: "Test Card 9", description: "This is a test card", required: true, type: "QR Code" },
        { title: "Test Card 10", description: "This is a test card", required: false, type: "QR Code" },
        { title: "Test Card 11", description: "This is a test card", required: false, type: "User Input" },
        { title: "Test Card 12", description: "This is a test card", required: true, type: "Honor System" },
        { title: "Test Card 13", description: "This is a test card", required: false, type: "User Input" },
        { title: "Test Card 14", description: "This is a test card", required: false, type: "Given" },
        { title: "Test Card 15", description: "This is a test card", required: true, type: "Honor System" },
        { title: "Test Card 16", description: "This is a test card", required: false, type: "QR Code" },
    ])
});

const queryGetBoard = boardDB.query("SELECT * FROM boards WHERE id = $id");
const res = queryGetBoard.all({
  id: boardId,
});
queryGetBoard.finalize();
console.log(res);

userDB.close();
boardDB.close();


/* Bingo card types */
export type BingoCardTypes = "QR Code" | "Honor System" | "Given" | "User Input";

export interface BingoCard {
	title: string;
	description: string;
	required: boolean;
	type: BingoCardTypes;
};

export type DatabaseBingoCard = [
	title: string,
	description: string,
	required: boolean,
	type: BingoCardTypes
];


/* Bingo board types */
export interface BingoBoard {
	id: string;
	title: string;
	description: string;
	created_at: number;
	updated_at: number;
	owner: string;
	editors: string[];
	cards: BingoCard[];
	players: BoardPlayerStats[];
};

export interface DatabaseBingoBoard {
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

export interface BoardPlayerStats {

	/* UUID of the player */
	player: string;

	/* Bingo card details */
	cards: boolean[]
};

export interface GameProgress {

	/* UUID of the game */
	board_uuid: string;

	/* Current progress of the game */
	progress: (0 | 1 | string)[]
};


/* User types */
export interface BingoUser {
	uuid: string;
	password: string;
	firstName: string | undefined;
	lastName: string | undefined;
	email: string;
	birthday: string | undefined;
	avatarUrl: string | undefined;
	accountType: "user" | "admin";
	boards: BingoBoard[];
	games: GameProgress[];
};

export interface DatabaseBingoUser {
	uuid: string;
	password: string;
	firstName: string | undefined;
	lastName: string | undefined;
	email: string;
	birthday: string | undefined;
	avatarUrl: string | undefined;
	accountType: "user" | "admin";
	boards: string;
	games: string;
};

export interface UserMetadata {
	firstName: string;
	lastName: string;
	birthday: string;
	avatarUrl: string;
	accountType: string;
	boards: BingoBoard[];
};

export type UserSession = {
	user: {
		email: string;
		id: string;
		metadata: UserMetadata;
	};
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
	tokenType: string;
};

/* Hash options */
export type HashOptions = {
	/**
	 * The algorithm to use for hashing. If possible, use argon2id.
	 */
	algorithm: "bcrypt" | "argon2id" | "argon2d" | "argon2i";

	/**
	 * The memory cost to use for hashing in kilobytes.
	 */
	memoryCost: number;

	/**
	 * The time cost to use for hashing in iterations.
	 */
	timeCost: number;

	/**
	 * The length of the salt to use for hashing in bytes.
	 */
	saltLength: number;

	/**
	 * The pepper to use for hashing. The first pepper in the
	 * array will be used for encoding new hashes and the
	 * remaining peppers will be used for verifying previous
	 * hashes.
	 */
	peppers: string[];
};







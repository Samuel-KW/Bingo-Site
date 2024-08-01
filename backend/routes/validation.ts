import { z } from "zod";
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from "../src/Authentication";

const MIN_BOARD_TITLE_LENGTH = 1;
const MAX_BOARD_TITLE_LENGTH = 64;

const MIN_BOARD_DESCRIPTION_LENGTH = 1;
const MAX_BOARD_DESCRIPTION_LENGTH = 2048;

const MIN_CARD_TITLE_LENGTH = 1;
const MAX_CARD_TITLE_LENGTH = 64;

const MIN_CARD_DESCRIPTION_LENGTH = 1;
const MAX_CARD_DESCRIPTION_LENGTH = 2048;

const MIN_RESPONSE_LENGTH = 1;
const MAX_RESPONSE_LENGTH = 2048;

export const BingoCardTitle = z.string()
	.min(MIN_CARD_TITLE_LENGTH, "Card title is too short")
	.max(MAX_CARD_TITLE_LENGTH, "Card title is too long");

export const BingoCardDescription = z.string()
	.min(MIN_CARD_DESCRIPTION_LENGTH, "Card description is too short")
	.max(MAX_CARD_DESCRIPTION_LENGTH, "Card description is too long");

export const BingoBoardTitle = z.string()
	.min(MIN_BOARD_TITLE_LENGTH, "Board title is too short")
	.max(MAX_BOARD_TITLE_LENGTH, "Board title is too long");

export const BingoBoardDescription = z.string()
	.min(MIN_BOARD_DESCRIPTION_LENGTH, "Board description is too short")
	.max(MAX_BOARD_DESCRIPTION_LENGTH, "Board description is too long");

export const BingoCardResponseInput = z.string()
	.min(MIN_RESPONSE_LENGTH, "Response is too short")
	.max(MAX_RESPONSE_LENGTH, "Response is too long");

/* Bingo card types */
export const BingoCardTypes = [ "QR Code", "Honor System", "Given", "User Input" ] as const;

export type BingoCard = z.infer<typeof BingoCard>;
export const BingoCard = z.object({
	title: z.string(),
	description: z.string(),
	required: z.boolean(),
	type: z.enum(BingoCardTypes, { message: "Invalid card type" }),
});

export type DatabaseBingoCard = z.infer<typeof DatabaseBingoCard>;
export const DatabaseBingoCard = z.tuple([
	BingoCardTitle,
	BingoCardDescription,
	z.boolean(),
	z.enum(BingoCardTypes, { message: "Invalid card type" }),
]);


/* Bingo board types */
export type BoardPlayerStats = z.infer<typeof BoardPlayerStats>;
export const BoardPlayerStats = z.object({
	player: z.string().uuid("Invalid player UUID"),
	cards: z.array(
		z.union([									// Completion status
			z.boolean(), 						//	Standard completion
			BingoCardResponseInput	//	User input completion
		], { message: "Invalid card completion status, must be a boolean or string" }),
	)
});

export type DatabaseBingoBoard = z.infer<typeof DatabaseBingoBoard>;
export const DatabaseBingoBoard = z.object({
	id: z.string()
		.uuid("Invalid board ID"),
	title: BingoBoardTitle,
	description: BingoBoardDescription,
	created_at: z.number().positive(),
	updated_at: z.number().positive(),
	owner: z.string().uuid("Invalid owner UUID"),
	editors: z.string({ message: "Database editors must be a string" }),
	cards: z.string({ message: "Database cards must be a string" }),
	players: z.string({ message: "Database players must be a string" }),
});

export type BingoBoard = z.infer<typeof BingoBoard>;
export const BingoBoard = z.object({
	id: z.string().uuid("Invalid board ID"),
	title: BingoBoardTitle,
	description: BingoBoardDescription,
	created_at: z.number().positive(),
	updated_at: z.number().positive(),
	owner: z.string().uuid("Invalid owner UUID"),
	editors: z.array(z.string().uuid("Invalid editor UUID"), { message: "Editors must be an array" }),
	cards: z.array(BingoCard),
	players: z.array(BoardPlayerStats),
});

export type UserCreateBingoBoard = z.infer<typeof UserCreateBingoBoard>;
export const UserCreateBingoBoard = z.object({
	title: BingoBoardTitle,
	description: BingoBoardDescription,
	editors: z.array(z.string().uuid("Invalid editor UUID"), { message: "Editors must be an array" }),
	cards: z.array(BingoCard)
});



/* User data types */
export const BingoUserTypes = z.enum([ "user", "admin" ], { message: "Invalid account type" });

export type DatabaseBingoUser = z.infer<typeof DatabaseBingoUser>;
export const DatabaseBingoUser = z.object({
	uuid: z.string().uuid("Invalid user UUID"),
	password: z.string(),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	email: z.string().email("Invalid email"),
	birthday: z.string().date().optional(),
	avatarUrl: z.string().url().optional(),
	accountType: BingoUserTypes,
	boards: z.string({ message: "Database boards must be a string" }),
	games: z.string({ message: "Database games must be a string" }),
});

export type BingoUser = z.infer<typeof BingoUser>;
export const BingoUser = z.object({
	uuid: z.string().uuid("Invalid user UUID"),
	password: z.string(),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	email: z.string().email("Invalid email"),
	birthday: z.string().date().optional(),
	avatarUrl: z.string().url().optional(),
	accountType: BingoUserTypes,
	boards: z.array(z.string(), { message: "Boards must be an array" }),
	games: z.array(BoardPlayerStats, { message: "Games must be an array" }),
});

export type UserMetadata = z.infer<typeof UserMetadata>;
export const UserMetadata = z.object({
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	birthday: z.string().date().optional(),
	avatarUrl: z.string().url().optional(),
	accountType: BingoUserTypes,
	boards: z.array(BingoBoard, { message: "Boards must be an array" }),
});

export type SignupSchema = z.infer<typeof SignupSchema>;
export const SignupSchema = z.object({
	password: z.string()
		.min(MIN_PASSWORD_LENGTH, "Password does not meet the required length")
		.max(MAX_PASSWORD_LENGTH, "Password exceeds the maximum length"),
	email: z.string().email("Invalid email"),
	firstName: z.string()
		.min(2, "First name must be more than 1 character")
		.max(64, "Last name must be less than 64 characters")
		.optional(),
	lastName: z.string()
		.min(2, "Last name must be more than 1 character")
		.max(64, "Last name must be less than 64 characters")
		.optional(),
	birthday: z.string().date("Invalid birthday date").optional(),
	avatarUrl: z.string().url("Invalid avatar URL").optional(),
	captcha: z.string().optional(),
});
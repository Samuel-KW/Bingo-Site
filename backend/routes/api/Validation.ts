import { z } from "zod";
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from "../../src/Authentication";

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
	.min(MIN_CARD_TITLE_LENGTH)
	.max(MAX_CARD_TITLE_LENGTH);

export const BingoCardDescription = z.string()
	.min(MIN_CARD_DESCRIPTION_LENGTH)
	.max(MAX_CARD_DESCRIPTION_LENGTH);

export const BingoBoardTitle = z.string()
	.min(MIN_BOARD_TITLE_LENGTH)
	.max(MAX_BOARD_TITLE_LENGTH);

export const BingoBoardDescription = z.string()
	.min(MIN_BOARD_DESCRIPTION_LENGTH)
	.max(MAX_BOARD_DESCRIPTION_LENGTH);

export const BingoCardResponseInput = z.string()
	.min(MIN_RESPONSE_LENGTH)
	.max(MAX_RESPONSE_LENGTH);

/* Bingo card types */
export const BingoCardTypes = [ "QR Code", "Honor System", "Given", "User Input" ] as const;

export type BingoCard = z.infer<typeof BingoCard>;
export const BingoCard = z.object({
	title: z.string(),
	description: z.string(),
	required: z.boolean(),
	type: z.enum(BingoCardTypes),
});

export type DatabaseBingoCard = z.infer<typeof DatabaseBingoCard>;
export const DatabaseBingoCard = z.tuple([
	BingoCardTitle,					// Title
	BingoCardDescription,		// Description
	z.boolean(), 						// Required
	z.enum(BingoCardTypes),	// Type
]);


/* Bingo board types */
export type BoardPlayerStats = z.infer<typeof BoardPlayerStats>;
export const BoardPlayerStats = z.object({
	player: z.string().uuid(),
	cards: z.array(
		z.union([									// Completion status
			z.boolean(), 						//	Standard completion
			BingoCardResponseInput	//	User input completion
		]),
	)
});

export type DatabaseBingoBoard = z.infer<typeof DatabaseBingoBoard>;
export const DatabaseBingoBoard = z.object({
	id: z.string()
		.uuid(),
	title: BingoBoardTitle,
	description: BingoBoardDescription,
	created_at: z.number().positive(),
	updated_at: z.number().positive(),
	owner: z.string().uuid(),
	editors: z.string(),
	cards: z.string(),
	players: z.string()
});

export type BingoBoard = z.infer<typeof BingoBoard>;
export const BingoBoard = z.object({
	id: z.string().uuid(),
	title: BingoBoardTitle,
	description: BingoBoardDescription,
	created_at: z.number().positive(),
	updated_at: z.number().positive(),
	owner: z.string().uuid(),
	editors: z.array(z.string().uuid()),
	cards: z.array(BingoCard),
	players: z.array(BoardPlayerStats),
});



/* User data types */
export const BingoUserTypes = z.enum([ "user", "admin" ]);

export type DatabaseBingoUser = z.infer<typeof DatabaseBingoUser>;
export const DatabaseBingoUser = z.object({
	uuid: z.string().uuid(),
	password: z.string(),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	email: z.string().email(),
	birthday: z.string().date().optional(),
	avatarUrl: z.string().url().optional(),
	accountType: BingoUserTypes,
	boards: z.string(),
	games: z.string(),
});

export type BingoUser = z.infer<typeof BingoUser>;
export const BingoUser = z.object({
	uuid: z.string().uuid(),
	password: z.string(),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	email: z.string().email(),
	birthday: z.string().date().optional(),
	avatarUrl: z.string().url().optional(),
	accountType: BingoUserTypes,
	boards: z.array(BingoBoard),
	games: z.array(BoardPlayerStats),
});

export type UserMetadata = z.infer<typeof UserMetadata>;
export const UserMetadata = z.object({
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	birthday: z.string().date().optional(),
	avatarUrl: z.string().url().optional(),
	accountType: z.enum([ "user", "admin" ]),
	boards: z.array(BingoBoard),
});

export type SignupSchema = z.infer<typeof SignupSchema>;
export const SignupSchema = z.object({
	password: z.string()
		.min(MIN_PASSWORD_LENGTH, "Password doesn't meet the required length")
		.max(MAX_PASSWORD_LENGTH, "Password exceeds the maximum length"),
	email: z.string().email(),
	firstName: z.string().min(2).max(64).optional(),
	lastName: z.string().min(2).max(64).optional(),
	birthday: z.string().date().optional(),
	avatarUrl: z.string().url().optional(),
	captcha: z.string().optional(),
});
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from "../../src/Authentication";
import { z } from "zod";

const types = [ "QR Code", "Honor System", "Given", "User Input" ] as const;

export const BingoCardSchema = z.object({
	title: z.string(),
	description: z.string(),
	required: z.boolean(),
	type: z.enum(types),
});

export const DatabaseBingoCardSchema = z.tuple([
	z.string(),
	z.string(),
	z.boolean(),
	z.enum(types),
]);



export const DatabaseBingoBoardSchema = z.object({
	id: z.string().uuid(),
	title: z.string(),
	description: z.string(),
	created_at: z.number(),
	updated_at: z.number(),
	owner: z.string(),
	editors: z.string(),
	cards: z.string(),
});

export const BingoBoardSchema = z.object({
	id: z.string().uuid(),
	title: z.string(),
	description: z.string(),
	created_at: z.string().date(),
	updated_at: z.string().date(),
	owner: z.string().uuid(),
	editors: z.array(z.string().uuid()),
	cards: z.array(BingoCardSchema),
});



export const UserMetadataSchema = z.object({
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	birthday: z.string().date().optional(),
	avatarUrl: z.string().url().optional(),
	accountType: z.enum([ "user", "admin" ]),
	boards: z.array(BingoBoardSchema),
});

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
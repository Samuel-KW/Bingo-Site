import crypto, { verify } from "crypto";

export type BingoCard = {
	title: string;
	description: string;
	required: boolean;
	completed: boolean;
	type: "QR Code" | "Honor System" | "Given" | "User Input";
};

export type BingoBoard = {
	id: string;
	title: string;
	created_at: string;
	updated_at: string;
	cards: [ BingoCard ] | [];
};

export type UserMetadata = {
	firstName: string;
	lastName: string;
	birthday: string;
	avatarUrl: string;
	accountType: string;
	boards: [ BingoBoard ] | [];
}

export type Session = {
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

// https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
export interface HashOptions {
	algorithm: "bcrypt" | "argon2id" | "argon2d" | "argon2i"; // "argon2id"
	memoryCost: number; // 7168
	timeCost: number; // 5
	saltLength: number; // 32
	pepper: string | undefined;
	pepperVersion: string | undefined;
}

const regex = new RegExp(/^\$(bcrypt|argon2id|argon2d|argon2i)\$v=(\d{1,6})\$m=(\d{1,10}),t=(\d{1,3}),p=(\d{1,3})\$(.+)$/);

export async function Verify(password: string, hash: string, options: HashOptions): Promise<boolean> {

	const versionIndex = hash.indexOf("$");
	const pepperVersion = hash.slice(0, versionIndex);
	hash = hash.slice(versionIndex);

	const pepper = pepperVersion === "0" || options.pepper === undefined ? "" : options.pepper;

	const salt = hash.slice(-options.saltLength);
	hash = hash.slice(0, -options.saltLength);

	return await Bun.password.verify(password + salt + pepper, hash);
}

export async function Hash(password: string, options: HashOptions): Promise<string> {

	if (password.length < 1) throw new Error("Hash has length of 0");

	const salt = crypto.randomBytes(options.saltLength / 2).toString("hex");

	const pepperVersion = options.pepperVersion ?? "0";
	const pepper = (pepperVersion == "0" || options.pepper === undefined) ? "" : options.pepper;

	const hash = await Bun.password.hash(password + salt + pepper, {
		algorithm: options.algorithm,
		memoryCost: options.memoryCost,
		timeCost: options.timeCost
	});

	return pepperVersion + hash + salt;
}
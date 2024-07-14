import crypto from "crypto";



// https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
export interface HashOptions {
	algorithm: "bcrypt" | "argon2id" | "argon2d" | "argon2i"; // "argon2id"
	memoryCost: number; // 7168
	timeCost: number; // 5
	saltLength: number; // 32
	pepper: string | undefined;
}

const regex = new RegExp(/^\$(bcrypt|argon2id|argon2d|argon2i)\$v=(\d{1,6})\$m=(\d{1,10}),t=(\d{1,3}),p=(\d{1,3})\$(.+)$/);


export async function Verify(password: string, verifyHash: string, options: HashOptions): Promise<boolean> {
	const [, algorithm, pV, pMemory, pTime, pP, hashAndSalt] = verifyHash.match(regex) || [];

	if (algorithm !== options.algorithm) return false;

	const salt = hashAndSalt.slice(-options.saltLength);
	const hash = hashAndSalt.slice(0, -options.saltLength);

	return await Bun.password.verify(password + salt, hash);
}

export default async function Hash(password: string, options: HashOptions): Promise<string> {

	if (password.length < 1) throw new Error("Hash has length of 0");

	const salt = crypto.randomBytes(options.saltLength).toString("hex");
	const pepper = options.pepper || "";

	const hash = await Bun.password.hash(password + salt + pepper, {
		algorithm: options.algorithm,
		memoryCost: options.memoryCost,
		timeCost: options.timeCost
	});

	return hash + salt;
}
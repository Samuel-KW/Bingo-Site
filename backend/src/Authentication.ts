import crypto from "crypto";
import { DoubleCsrfConfigOptions } from "csrf-csrf";
import { NextFunction, Request, Response } from "express";

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
};

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
interface HashOptions {
	algorithm: "bcrypt" | "argon2id" | "argon2d" | "argon2i"; // "argon2id"
	memoryCost: number; // 7168
	timeCost: number; // 5
	saltLength: number; // 32
	pepper: string | undefined;
	pepperVersion: string | undefined;
}

// const regex = new RegExp(/^\$(bcrypt|argon2id|argon2d|argon2i)\$v=(\d{1,6})\$m=(\d{1,10}),t=(\d{1,3}),p=(\d{1,3})\$(.+)$/);

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

export const hashOptions: HashOptions = {
	algorithm: "argon2id",
	timeCost: Number(process.env.HASH_TIME_COST),
	memoryCost: Number(process.env.HASH_MEMORY_COST),
	saltLength: Number(process.env.HASH_SALT_LENGTH),
	pepper: process.env.PEPPER,
	pepperVersion: process.env.PEPPER_VERSION
};

export const csrfOptions: DoubleCsrfConfigOptions = {
	getSecret: () => process.env.CSRF_SECRETS.split(" "), // A function that optionally takes the request and returns a secret
	cookieName: "CSRF", // __Host-CSRF The name of the cookie to be used, recommend using Host prefix.
	cookieOptions: {
		sameSite: "lax", // Recommend you make this strict if posible
		path: "/",
		secure: true,
	},
	size: 64, // The size of the generated tokens in bits
	ignoredMethods: ["GET", "HEAD", "OPTIONS"], // A list of request methods that will not be protected.
	getTokenFromRequest: (req: Request) => req.headers["x-csrf-token"], // A function that returns the token from the request
};

export async function Verify(password: string, hash: string, options: HashOptions): Promise<boolean> {

	if (password.length < MIN_PASSWORD_LENGTH) throw "Password is too short";
	else if (password.length > MAX_PASSWORD_LENGTH) throw "Password is too long";

	const versionIndex = hash.indexOf("$");
	const pepperVersion = hash.slice(0, versionIndex);
	hash = hash.slice(versionIndex);

	const pepper = pepperVersion === "0" || options.pepper === undefined ? "" : options.pepper;

	const salt = hash.slice(-options.saltLength);
	hash = hash.slice(0, -options.saltLength);

	return await Bun.password.verify(password + salt + pepper, hash);
}

export async function Hash(password: string, options: HashOptions): Promise<string> {

	if (password.length < MIN_PASSWORD_LENGTH) throw "Password is too short";
	else if (password.length > MAX_PASSWORD_LENGTH) throw "Password is too long";

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

type VerifyAuthOptions = {
	redirectTo?: string;
	setReturnTo?: boolean;
};

declare module 'express-session' {
  interface SessionData {
    returnTo?: string;
  }
}

export function verifyAuthentication(options: VerifyAuthOptions = {}) {

  const url = options.redirectTo ?? '/login';
  const setReturnTo = options.setReturnTo ?? true;

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      if (setReturnTo && req.session) {
        req.session.returnTo = req.originalUrl || req.url;
      }
      return res.redirect(url);
    }
    next();
  }
}
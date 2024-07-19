import crypto from "crypto";
import { DoubleCsrfConfigOptions } from "csrf-csrf";
import { NextFunction, Request, Response } from "express";
import session, { SessionOptions } from "express-session";
import BingoDatabase, { Board, User, BingoCard } from "../Database";

import BunStoreClass from "./BunStore";
import passport from "passport";
const BunStore = BunStoreClass(session);


export const MIN_PASSWORD_LENGTH = Number(process.env.MIN_PASSWORD_LENGTH);
export const MAX_PASSWORD_LENGTH = Number(process.env.MAX_PASSWORD_LENGTH);
if (!MIN_PASSWORD_LENGTH || !MAX_PASSWORD_LENGTH)
	throw new Error("Missing password length options.");

const SESSION_SECRET = process.env.SESSION_SECRETS?.split(" ");
if (!SESSION_SECRET)
	throw new Error("No session secret(s) provided.");

const CSRF_SECRETS = process.env.CSRF_SECRETS?.split(" ");
if (!CSRF_SECRETS)
	throw new Error("No CSRF secrets provided.");

const HASH_TIME_COST = Number(process.env.HASH_TIME_COST);
const HASH_MEMORY_COST = Number(process.env.HASH_MEMORY_COST);
const HASH_SALT_LENGTH = Number(process.env.HASH_SALT_LENGTH);
if (!HASH_TIME_COST || !HASH_MEMORY_COST || !HASH_SALT_LENGTH)
	throw new Error("Missing hash options.");

const HASH_PEPPERS = process.env.PEPPER.split(" ");
if (!HASH_PEPPERS)
	throw new Error("No hash pepper(s) provided.");


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

type HashOptions = {
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
}

export const hashOptions: HashOptions = {
	algorithm: "argon2id",
	timeCost: HASH_TIME_COST,
	memoryCost: HASH_MEMORY_COST,
	saltLength: HASH_SALT_LENGTH,
	peppers: HASH_PEPPERS,
};

export const csrfOptions: DoubleCsrfConfigOptions = {
	getSecret: () => CSRF_SECRETS, // A function that optionally takes the request and returns a secret
	cookieName: "_Host-CSRF", // __Host-CSRF The name of the cookie to be used, recommend using Host prefix.
	cookieOptions: {
		sameSite: "lax", // Recommend you make this strict if posible
		path: "/",
		secure: false,
	},
	size: 64, // The size of the CSRF token in bits
	ignoredMethods: ["GET", "HEAD", "OPTIONS"], // A list of request methods that will not be protected.
	getTokenFromRequest: (req: Request) => req.headers["x-csrf-token"], // A function that returns the token from the request
};

export const 	sessionOptions: SessionOptions = {
	secret: SESSION_SECRET,
	name: "_Host-sid",
	resave: false,
	saveUninitialized: false,
	store: new BunStore({
		client: BingoDatabase,
		expired: {
			clear: true,
			intervalMs: 15 * 60 * 1000 //ms = 15min
		}
	}),
	cookie : {
		sameSite: "lax",
		secure: false,
		httpOnly: true,
		maxAge: 15 * 60 * 1000
	}
};

if (process.env.NODE_ENV === 'production') {
	csrfOptions.cookieOptions.secure = true;
  sessionOptions.cookie.secure = true;
}

// const regex = new RegExp(/^\$(bcrypt|argon2id|argon2d|argon2i)\$v=(\d{1,6})\$m=(\d{1,10}),t=(\d{1,3}),p=(\d{1,3})\$(.+)$/);

export async function Verify(password: string, hash: string, options: HashOptions): Promise<boolean> {

	if (password.length < 1) throw "Trying to verify an empty string.";

	// Slice off the salt from the hash
	const salt = hash.slice(-options.saltLength);
	hash = hash.slice(0, -options.saltLength);

	// Verify the password with each pepper
	for (const pepper of options.peppers) {
		const valid = await Bun.password.verify(password + salt + pepper, hash);
		if (valid) return true;
	}
	return false;
}

export async function Hash(password: string, options: HashOptions): Promise<string> {

	if (password.length < 1) throw "Trying to hash an empty string.";

	const salt = crypto.randomBytes(options.saltLength / 2).toString("hex");

	const pepper = options.peppers[0];

	const hash = await Bun.password.hash(password + salt + pepper, {
		algorithm: options.algorithm,
		memoryCost: options.memoryCost,
		timeCost: options.timeCost
	});

	return hash + salt;
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
		console.log(req.user);
    if (!req.user) {
      if (setReturnTo && req.session) {
        req.session.returnTo = req.originalUrl || req.url;
      }
      return res.redirect(url);
    }
    next();
  }
}
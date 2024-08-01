// Modified from https://github.com/attestate/better-sqlite3-session-store/

import { Database, Statement } from "bun:sqlite";
import Session from "express-session";
import { SessionData } from "express-session";

// Type definitions for BunStore
export type ExpiredOptions = {
	clear: boolean;
	intervalMs: number;
};

interface DatabaseOptions {
	/**
	 * Enables automatic capturing of promise rejection.
	 */
	captureRejections: boolean | undefined;
	client: Database;
	expired: ExpiredOptions;
}

export type Entry = {
	table: string;
	sid: string;
	sess: string;
	expire: string;
};

// @format
const noop = () => { };

// NOTE: 1d = 86400s = 86400000ms
const oneDay = 86400000;

// NOTE: In Milliseconds
const clearExpiredInterval = 900000;
const tableName = "sessions";
const schema = `CREATE TABLE IF NOT EXISTS ${tableName} (sid TEXT NOT NULL PRIMARY KEY, sess JSON NOT NULL, expire TEXT NOT NULL)`;


export default function BunStore ({ Store }: { Store: typeof Session.Store }) {
	class BunStore extends Store {

		private client: Database;
		private expired: ExpiredOptions;

		constructor(options: Partial<DatabaseOptions> = {}) {
			super(options);

			if (!options.client)
				throw new Error("A client must be directly provided to BunStore");

			this.expired = {
				clear: (options.expired && options.expired.clear) || true,
				intervalMs:
					(options.expired && options.expired.intervalMs) ||
					clearExpiredInterval,
			};

			this.client = options.client;
			this.createDb();

			if (this.expired.clear) {
				this.startInterval();
			}
		}

		startInterval() {
			setInterval(
				this.clearExpiredSessions.bind(this),
				this.expired.intervalMs
			);
		}

		clearExpiredSessions() {
			try {
				this.client.run(`DELETE FROM ${tableName} WHERE datetime('now') > datetime(expire)`);
			} catch (err) {
				console.error(err);
			}
		}

		createDb() {
			this.client.run(schema);
		}

		set(sid: string, sess: SessionData, cb: Function = noop): void {
			let age: number;

			// NOTE: Express's temporal unit of choice is milliseconds:
			// http://expressjs.com/en/resources/middleware/session.html#:~:text=cookie.maxAge
			age = sess.cookie && sess.cookie.maxAge ? sess.cookie.maxAge : oneDay;

			const now = Date.now();
			const expire = new Date(now + age).toISOString();
			const entry = [ sid, JSON.stringify(sess), expire ];

			try {
				this.client.prepare(`INSERT OR REPLACE INTO ${tableName} VALUES (?, ?, ?)`, entry);
			} catch (err) {
				cb(err);
				return;
			}

			cb(null, undefined);
		}

		get(sid: string, cb: Function = noop) {
			let req: Statement;
			let res: Entry;

			try {
				req = this.client.prepare(`SELECT sess FROM ${tableName} WHERE sid = $sid AND datetime('now') < datetime(expire)`);
				res = req.get({ sid }) as Entry;
				req.finalize();
			} catch (err) {
				cb(err);
				return;
			}

			if (res && res.sess) {
				cb(null, JSON.parse(res.sess));
			} else {
				cb(null, null);
			}
		}

		destroy(sid: string, cb: Function = noop) {
			try {
				this.client.run(`DELETE FROM ${tableName} WHERE sid = ?`, [ sid ]);
			} catch (err) {
				cb(err);
				return;
			}
			cb(null, undefined);
		}

		override length(cb: Function = noop) {
			let req: Statement;
			let res: { count: number };

			try {
				req = this.client.prepare("SELECT COUNT(*) as count FROM " + tableName);
				res = req.get() as { count: number };
				req.finalize();
			} catch (err) {
				cb(err);
				return;
			}

			cb(null, res.count);
		}

		override clear(cb: Function = noop) {
			try {
				this.client.run("DELETE FROM " + tableName);
			} catch (err) {
				cb(err);
				return;
			}

			cb(null, undefined);
		}

		override touch(sid: string, sess: SessionData, cb: Function = noop) {
			const entry = { sid } as Entry;

			if (sess && sess.cookie && sess.cookie.expires) {
				entry.expire = new Date(sess.cookie.expires).toISOString();
			} else {
				const now = Date.now();
				entry.expire = new Date(now + oneDay).toISOString();
			}

			try {
				this.client.run(`UPDATE ${tableName} SET expire = $expire WHERE sid = $sid AND datetime('now') < datetime(expire)`);
			} catch (err) {
				cb(err);
				return;
			}

			cb(null, undefined);
		}

		override all(cb: Function = noop) {
			let req: Statement;
			let res: Entry[];
			try {
				req = this.client.prepare("SELECT * FROM " + tableName);
				res = req.all() as Entry[];
				req.finalize();
			} catch (err) {
				cb(err);
				return;
			}

			cb(null, res);
		}
	}

	return BunStore;
};
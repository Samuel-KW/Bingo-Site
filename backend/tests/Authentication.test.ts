import { expect, test, describe } from "bun:test";
import { Hash, Verify, HashOptions } from "../src/Authentication";

describe("Hashing", () => {

	const pepper = process.env.PEPPER;
	const pepperVersion = process.env.PEPPER_VERSION;
	const timeCost = Number(process.env.HASH_TIME_COST);
	const memoryCost = Number(process.env.HASH_MEMORY_COST); // Memory cost in Kb
	const saltLength = Number(process.env.HASH_SALT_LENGTH);

	const options: HashOptions = {
		algorithm: "argon2id",
		timeCost, memoryCost,
		pepper, pepperVersion,
		saltLength
	};

	const iterations = 50;
	const charsetSize = 62; // Alphanumeric characters (26 lowercase + 26 uppercase + 10 digits)
	const costPerSecond = 0.001; // Hypothetical cost per second of computation

	const averagePasswordLength = 9;

	test("Average hashing speed", async () => {
	
		const samples: string[] = [];
		for (let i = 0; i < iterations; i++)
			samples.push(Math.random().toString(36).substring(2));
		
		const start = Bun.nanoseconds();
		
		for (let i = 0; i < samples.length; i++) {
			const password = samples[i];
			const hash = await Hash(password, options);
		}

		const dt = ((Bun.nanoseconds() - start) / samples.length) / 1e6;
		console.log(`\nAverage time to hash: ${dt}ms\n`);

		const hashesPerSecond = 1000 / dt;

		const possibleCombinations = (charsetSize ** averagePasswordLength);
		const realisticCombinations = possibleCombinations / 2; // Assume average case
		const timeToCrackYears = (realisticCombinations / hashesPerSecond) / 3.154e7;
		const costToCrack = timeToCrackYears * costPerSecond * 60 * 60 * 24 * 365;
		const memoryUsagePb = (memoryCost / 1e12) * realisticCombinations;

		console.log(`Metrics for ${averagePasswordLength} character password (lowercase, uppercase, and digits):`);
		console.log(`\tTotal combinations: ${(possibleCombinations / 1e9).toFixed(2)} billion`);
		console.log(`\tTime to crack: ${(timeToCrackYears / 100).toFixed(2)} centuries`);
		console.log(`\tCost to crack: $${(costToCrack / 1e9).toFixed(2)} billion`);
		console.log(`\tTotal memory usage: ${memoryUsagePb.toFixed(2)} petabytes\n`);

		expect(dt, "Hashing speed is too slow").toBeLessThan(150);
	}, 150 * iterations);

	test("Average verification speed", async () => {

		const passwords: string[] = [];
		const hashes: string[] = [];
		for (let i = 0; i < iterations; i++) {
			const password = Math.random().toString(36).substring(2);
			
			passwords.push(password);
			hashes.push(await Hash(password, options));
		}
		console.log(hashes[0]);
		const start = Bun.nanoseconds();

		for (let i = 0; i < passwords.length; i++) {
			const password = passwords[i];
			const hash = hashes[i];
		
			// Add a 50% chance of inputting an incorrect password
			const valid = Math.random() < 0.5;
			const result = await Verify(valid ? password : "this is an invalid password", hash, options);
			
			expect(result, "Verification failure").toBe(valid);
		}

		const dt = ((Bun.nanoseconds() - start) / passwords.length) / 1e6;
		console.log(`\nAverage time to verify: ${dt}ms\n`);

		expect(dt, "Verification speed is too slow").toBeLessThan(150);
	}, 150 * iterations);
});

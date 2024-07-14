const start = Bun.nanoseconds();

const hashes = [];
const num = 100;

for (let i = 0; i < num; i++) {
	const hash = Bun.password.hashSync("password1234567890123456789012345678902312345678901234567890123456789023", {
		algorithm: "argon2id",
		memoryCost: 7168,
		timeCost: 5,
	});
	hashes.push(hash);
}

const end = Bun.nanoseconds();
const time = (end - start) / 1000000;

console.log(hashes);
console.log(`Time: ${time / num} ms`);
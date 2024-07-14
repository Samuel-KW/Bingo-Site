
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
import { Box, BoxProps, Center, SimpleGrid, useProps } from '@mantine/core';
import { useDisclosure } from "@mantine/hooks";

import Card, { BingoCard } from "./bingo-card";
import MenuSortGrid from "./menu-sort-grid";

// import styles from "./bingo-board.module.css";

const noop = () => {};

export interface ServerBingoBoard {
	title: string,
	description: string,
	editors: string[],
	cards: [
		string, // Title
		string, // Description
		boolean, // Required
		"QR Code" | "Honor System" | "Given" | "User Input" // Type
	][]
};

const csrf = async () => {
	const req = await fetch("/api/csrf");
	const data = await req.json();
	return data.csrf;
};

export interface BingoBoard {

  /** Bingo board ID */
	id: string;

	/** Bingo board title */
	title: string;

	/** Bingo board description */
	description: string;

	/** Bingo board creation date */
	created_at: number;

	/** Bingo board last update date */
	updated_at: number;

	/** Bingo board owner UUID */
	owner: string;

	/** Bingo board cards */
	cards: BingoCard[];
};

export interface BingoBoardProps extends BoxProps, Partial<BingoBoard> {

	/** Callback when a card is clicked */
	onCardClick?: (card: BingoCard) => void;

	/** Whether to display the board in a grid layout */
	isGrid?: boolean;
}

export async function fetchOwnedBingoBoards(abortController: AbortController): Promise<BingoBoard[]> {
	const response = await fetch("/api/getOwnedBoards", { signal: abortController.signal });
	const data = await response.json();
	return data as BingoBoard[];
};

export async function fetchBingoBoards(abortController: AbortController): Promise<BingoBoard[]> {
	const response = await fetch("/api/getParticipatingBoards", { signal: abortController.signal });
	const data = await response.json();
	return data as BingoBoard[];
};

export async function fetchBingoBoard(id: string, abortController: AbortController): Promise<BingoBoard> {
	const response = await fetch(`/api/bingo/${id}`, { signal: abortController.signal });
	const data = await response.json();

	const cards = JSON.parse(data.cards);
	data.cards = cards.map((card: string[], i: number) => {
		return {
			title: card[0],
			description: card[1],
			required: card[2],
			completed: false,
			type: card[3],
			id: i
		};
	});

	data.players = JSON.parse(data.players);

	return data as BingoBoard;
};

export async function updateBingoBoard(id: string, board: BingoBoard, abortController: AbortController): Promise<void> {
	const csrfToken = await csrf();

	const response = await fetch(`/api/bingo/${id}`, {
		signal: abortController.signal,
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
			"x-csrf-token": csrfToken,
			"credentials": "same-origin"
		},
		body: JSON.stringify(board)
	});
	const data = await response.json();
	return data;
};

export async function createBingoBoard(board: ServerBingoBoard, abortController: AbortController): Promise<void> {
	const csrfToken = await csrf();

	const response = await fetch(`/api/createBoard`, {
		signal: abortController.signal,
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-csrf-token": csrfToken,
			"credentials": "same-origin"
		},
		body: JSON.stringify(board)
	});
	const data = await response.json();
	return data;
};

export async function deleteBingoBoard(id: string, abortController: AbortController): Promise<void> {
	const csrfToken = await csrf();

	const response = await fetch(`/api/bingo/${id}`, {
		signal: abortController.signal,
		method: "DELETE",
		headers: {
			"x-csrf-token": csrfToken,
			"credentials": "same-origin"
		}
	});
	const data = await response.json();
	return data;
};

const defaultProps = {
	id: "",
	title: "No title",
	created_at: Date.now(),
	updated_at: Date.now(),
	owner: "No owner",
	cards: [],
	isGrid: true,
	onCardClick: noop
};

function BingoBoard (_props: BingoBoardProps) {

	const {
		id,
		title,
		created_at,
		updated_at,
		owner,
		cards,
		isGrid,
		onCardClick,
		...others
	} = useProps("BingoBoard", defaultProps, _props);

	const [_isGrid, grid] = useDisclosure(isGrid);

	const size = Math.ceil(Math.sqrt(cards.length));

	return (
		<Box {...others}>
			<Center>
				<MenuSortGrid onClick={grid.toggle} checked={_isGrid} aria-label="Toggle card layout style" />
			</Center>

			<Center>
				<SimpleGrid maw="80%" spacing="xs" verticalSpacing="xs" cols={_isGrid ? size : 1}>
					{cards.map(card => <Card key={card.id}
						onClick={() => onCardClick(card)}
						title={card.title}
						description={card.description}
						required={card.required}
						completed={card.completed}
						type={card.type}/>
					)}
				</SimpleGrid>
			</Center>
		</Box>
	);
};


export default BingoBoard;
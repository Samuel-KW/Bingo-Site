import { Box, BoxProps, Center, SimpleGrid, useProps } from '@mantine/core';
import { useDisclosure } from "@mantine/hooks";

import Card, { BingoCard } from "./bingo-card";
import MenuSortGrid from "./menu-sort-grid";

// import styles from "./bingo-board.module.css";

const noop = () => {};

export async function fetchBingoBoards(): Promise<BingoBoard[]> {
	const response = await fetch("/api/boards");
	const data = await response.json();
	return data as BingoBoard[];
}

export async function fetchBingoBoard(id: string): Promise<BingoBoard> {
	const response = await fetch(`/api/bingo/${id}`);
	const data = await response.json();

	for (let i = 0; i < data.cards.length; i++) {
		const card = data.cards[i];
		data.cards[i] = {
			title: card[0],
			description: card[1],
			required: card[2],
			completed: false,
			type: card[3],
			id: i
		};
	}

	return data as BingoBoard;
}

export async function updateBingoBoard(id: string, board: BingoBoard): Promise<void> {
	const response = await fetch(`/api/bingo/${id}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(board)
	});
	const data = await response.json();
	return data;
}

export async function createBingoBoard(board: BingoBoard): Promise<void> {
	const response = await fetch(`/api/bingo`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(board)
	});
	const data = await response.json();
	return data;
}

export async function deleteBingoBoard(id: string): Promise<void> {
	const response = await fetch(`/api/bingo/${id}`, {
		method: "DELETE"
	});
	const data = await response.json();
	return data;
};

export type BingoBoard = {
	id: string;
	title: string;
	created_at: number;
	updated_at: number;
	owner: string;
	cards: BingoCard[];
};

export interface BingoBoardProps extends BoxProps {
  /** Bingo board ID */
  id?: string;

	/** Bingo board title */
	title?: string;

	/** Bingo board creation date */
	created_at?: number;

	/** Bingo board last update date */
	updated_at?: number;

	/** Bingo board owner UUID */
	owner?: string;

	/** Bingo board cards */
	cards?: BingoCard[];

	/** Callback when a card is clicked */
	onCardClick?: (card: BingoCard) => void;

	/** Whether to display the board in a grid layout */
	isGrid?: boolean;
}

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
	} = useProps('BingoBoard', defaultProps, _props);

	const [_isGrid, grid] = useDisclosure(isGrid);

	const size = Math.ceil(Math.sqrt(cards.length));

	return (
		<Box {...others}>
			<Center>
				<MenuSortGrid onClick={grid.toggle} checked={_isGrid} aria-label="Toggle card layout style" />
			</Center>

			<Center>
				<SimpleGrid maw={1} spacing="xs" verticalSpacing="xs" cols={_isGrid ? size : 1}>
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
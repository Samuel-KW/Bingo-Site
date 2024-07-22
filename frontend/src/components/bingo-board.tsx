import React from "react";
import { Center, SimpleGrid } from "@mantine/core";

import Card, { BingoCard } from "./bingo-card";
import MenuSortGrid from "./menu-sort-grid";

import styles from "./bingo-board.module.css";

const noop = () => {};

export type BingoBoard = {
	id: string;
	title: string;
	created_at: number;
	updated_at: number;
	owner: string;
	cards: BingoCard[];
};

interface BingoBoardProps {
	id: string;
	title: string;
	created_at: number;
	updated_at: number;
	owner: string;
	cards: BingoCard[];
	onClick: (card: BingoCard) => void;
	isGrid: boolean;
}

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

export default class BingoBoardComponent extends React.Component<BingoBoardProps>{
	state: BingoBoardProps = {
		id: "No ID",
		title: "No title",
		created_at: -1,
		updated_at: -1,
		owner: "No owner",
		cards: [],
		onClick: noop,
		isGrid: true
	};

	constructor(props: BingoBoardProps) {
		super(props);

		this.state = {
			id: props.id ?? this.state.id,
			title: props.title ?? this.state.title,
			created_at: props.created_at ?? this.state.created_at,
			updated_at: props.updated_at ?? this.state.updated_at,
			owner: props.owner ?? this.state.owner,
			cards: props.cards ?? this.state.cards,
			isGrid: props.isGrid ?? this.state.isGrid,
			onClick: props.onClick ?? this.state.onClick
		};

		this.toggleGrid = this.toggleGrid.bind(this);
	}

	toggleGrid() {
		this.setState({ isGrid: !this.state.isGrid });
	}

	render() {
		const size = Math.ceil(Math.sqrt(this.state.cards.length));
		return (
			<>
				<Center>
					<MenuSortGrid onClick={this.toggleGrid} checked={this.state.isGrid} aria-label="Toggle card layout style" />
				</Center>

				<Center>
					<SimpleGrid className={styles.board} spacing="xs" verticalSpacing="xs" cols={this.state.isGrid ? size : 1}>
						{this.state.cards.map(card => <Card key={card.id}
							onClick={() => this.state.onClick(card)}
							title={card.title}
							description={card.description}
							required={card.required}
							completed={card.completed}
							type={card.type}/>
						)}
					</SimpleGrid>
				</Center>
			</>
		);
	}
};
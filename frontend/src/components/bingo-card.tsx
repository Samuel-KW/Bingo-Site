import { Card, Title, BoxProps, useProps, Box } from '@mantine/core';

import styles from "./bingo-card.module.css";

const noop = () => {};

export type BingoCard = {
	title: string;
	description: string;
	required: boolean;
	completed: boolean;
	type: "QR Code" | "Honor System" | "Given" | "User Input";
	id: number;
};

export interface BingoCardStates extends BoxProps, BingoCard {
	onClick: (event?: React.MouseEvent<HTMLDivElement>, props?: BingoCardProps) => void;
};

export interface BingoCardProps extends Partial<BingoCardStates> {};

const defaultProps = {
	title: "No title.",
	description: "No description.",
	required: false,
	completed: false,
	type: "Given",
	id: 0,
	onClick: noop
} as BingoCardStates;

function BingoCard (_props: BingoCardProps) {

	const {
		title,
		description,
		required,
		completed,
		type,
		id,
		onClick,
		...others
	} = useProps("BingoCard", defaultProps, _props);

	console.log(title, description, required, completed, type, id, onClick, others);
	return (
		<Box {...others}>
			<Card shadow="lg" onClick={(evt) => onClick(evt, { id, title, description, required, completed, type })} data-required={required} data-completed={completed} className={styles.card}>
				<Title order={3} className={styles.title}>{title}</Title>
			</Card>
		</Box>

	);
}

export default BingoCard;
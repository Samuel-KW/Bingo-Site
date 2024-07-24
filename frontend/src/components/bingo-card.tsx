import { Card, Title, Box, BoxProps, Center, SimpleGrid, useProps } from '@mantine/core';
import { useDisclosure } from "@mantine/hooks";

import styles from "./bingo-card.module.css";

const noop = () => {};

export type BingoCard = {
	title: string;
	description: string;
	required: boolean;
	completed: boolean;
	type: "QR Code" | "Honor System" | "Given" | "User Input";
	id?: number;
};

export interface BingoCardStates extends BoxProps {
	title: string;
	description: string;
	required: boolean;
	completed: boolean;
	type: BingoCard["type"];
	id: number;
	onClick: (event?: React.MouseEvent<HTMLDivElement>, props?: BingoCardProps) => void;
};

export interface BingoCardProps extends BoxProps {
	title?: string;
	description?: string;
	required?: boolean;
	completed?: boolean;
	type?: "QR Code" | "Honor System" | "Given" | "User Input";
	id?: number;
	onClick?: (event?: React.MouseEvent<HTMLDivElement>, props?: BingoCardProps) => void;
};

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
	} = useProps("BingoCard", _props, defaultProps);

	return (
		<Card shadow="lg" onClick={(evt) => onClick(evt, { id, title, description, required, completed, type })} data-required={required} data-completed={completed} {...others}>
			<Title order={3} className={styles.title}>{title}</Title>
		</Card>
	);
}

export default BingoCard;
import React from "react";
import { Card, Menu, Title } from "@mantine/core";

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

export interface BingoCardProps {
	title?: string;
	description?: string;
	required?: boolean;
	completed?: boolean;
	type?: "QR Code" | "Honor System" | "Given" | "User Input";
	id?: number;
	onClick?: () => void;
};

export default class BingoCardComponent extends React.Component<BingoCardProps>{
	state: BingoCardProps = {
		title: "No title",
		description: "No description",
		required: false,
		completed: false,
		type: "Given",
		id: 0,
		onClick: noop
	};

	constructor(props: BingoCardProps) {
		super(props);

		this.state = {
			title: props.title ?? this.state.title,
			description: props.description ?? this.state.description,
			required: props.required ?? this.state.required,
			completed: props.completed ?? this.state.completed,
			type: props.type ?? this.state.type,
			id: props.id ?? this.state.id,
			onClick: props.onClick ?? noop
		};
	}

	render() {
		const completed = this.state.completed || undefined;
		const required = this.state.required || undefined;

		return (
			<Card shadow="lg" onClick={this.state.onClick} className={styles.card} data-required={required} data-completed={completed}>
				<Title order={3} className={styles.title}>{this.state.title}</Title>
			</Card>
		);
	}
};
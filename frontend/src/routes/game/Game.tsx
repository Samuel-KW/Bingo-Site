import { FormEvent, useEffect, useState } from 'react';

import { Accordion, Title, Text, Drawer, Button, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';

import Board, { BingoBoard, fetchBingoBoard } from '../../components/bingo-board';
import { loadingBingoBoard } from '../../components/loading';

import './Game.module.css';
import { BingoCard } from '../../components/bingo-card';


function getTypeElement (type: BingoCard["type"], onSubmit: (event: FormEvent<HTMLFormElement>, result: boolean | EventTarget) => any) {
	switch (type) {
		case "QR Code":
			return <Text mt="md" size="sm" c="var(--mantine-color-gray-5)">Scan the QR code to complete this task.</Text>

		case "Honor System":
			return <form onSubmit={(e) => onSubmit(e, true)}>
				<Button mt="md" variant="filled" type="submit">Mark as Complete</Button>
			</form>

		case "Given":
			return <form onSubmit={(e) => onSubmit(e, true)}>
				<Button mt="md" variant="filled" type="submit">Done</Button>
			</form>

		case "User Input":
			return <form onSubmit={(e) => onSubmit(e, e.target)}>
				<Textarea mt="md"
					label="Input label"
					withAsterisk
					description="Enter your response..."
					placeholder="Your message"
				/>

				<Button mt="xs" type="submit">Submit</Button>
			</form>;

		default:
			return <Text mt="md" size="sm" c="var(--mantine-color-gray-5)">Unknown Type</Text>;
	}
}

function Game() {
	const id = window.location.pathname.split("/").pop() || "";
	if (!id)
		throw new Error("No board ID found in URL");

	const [board, setBoard] = useState<BingoBoard>();

	const [opened, { open, close }] = useDisclosure(false);
	const [title, setTitle] = useState<string>("");
	const [description, setDescription] = useState<string>("");
	const [type, setType] = useState<BingoCard["type"]>("Given");

	const showBingoDetails = (card: BingoCard) => {
		setTitle(card.title);
		setDescription(card.description);
		setType(card.type);
		open();
	};

	const submitBingoCard = (event: FormEvent<HTMLFormElement>, result: boolean | EventTarget) => {
		event.preventDefault();

		if (result === true) {
			console.log("Marked as complete");
		} else if (result instanceof HTMLFormElement) {
			const value = result.querySelector("textarea")?.value.trim();
			console.log("Submitted: " + value);
		}

		close();
	};

	useEffect(() => {

		const abortController = new AbortController();

		fetchBingoBoard(id, abortController)
			.then((data: BingoBoard) => {
				setBoard(data);
			})
			.catch(error => {
				if (error.name !== "AbortError") {
					notifications.show({
						autoClose: false,
						title: "Unable to load board content",
						message: "An error occurred while loading the bingo board.",
						color: "red",
					});
				}
			});

		return () => abortController.abort();
	}, [id]);

	return (
		<>
			<Drawer opened={opened} onClose={close}
							position="bottom" size="md"
							title={title}
							overlayProps={{ backgroundOpacity: 0.7, blur: 1 }}
							closeButtonProps={{ "aria-label": "Close modal" }}
			>
				<Text>{description}</Text>
				{getTypeElement(type, submitBingoCard)}
      </Drawer>

			<div>
				<Accordion>
					<Accordion.Item value="item-1">
						<Accordion.Control>Instructions</Accordion.Control>
						<Accordion.Panel>
							<Text>This website tracks your readiness for camp! The first 10 campers to have a blackout will get a prize!</Text>

							<Title>Instructions</Title>
							<Text>To fill in the bingo boxes, look for QR codes to scan or click a box for more instructions</Text>
							<Text>If you're having any bingo problems find JC Leina in the Grove</Text>

							<strong>Good luck!</strong>
						</Accordion.Panel>
					</Accordion.Item>
				</Accordion>
			</div>

			<div className="content">
				<div className="board">
					{ board ? <Board onCardClick={(card: BingoCard) => showBingoDetails(card)} isGrid={true} {...board} /> : loadingBingoBoard }
				</div>
			</div>
		</>
	)
};

export default Game;
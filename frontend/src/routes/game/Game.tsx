import { useEffect, useState } from 'react';

import { Accordion, Title, Text, Skeleton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import Board, { BingoBoard, fetchBingoBoard } from '../../components/bingo-board';
import MenuSortGrid from "../../components/menu-sort-grid";

import './Game.module.css';

function Game() {

	const id = window.location.pathname.split("/").pop() || "";
	if (!id)
		throw new Error("No board ID found in URL");

	const [checked, { toggle }] = useDisclosure(false);
	const [board, setBoard] = useState<BingoBoard>();

	useEffect(() => {
		fetchBingoBoard(id)
			.then((data: BingoBoard) => {
				setBoard(data);
			})
			.catch(error => {
				console.error(error);
			});
	}, []);

	return (
		<>
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
				<MenuSortGrid onClick={toggle} checked={checked} aria-label="Toggle card layout style" />
				<div className="board">
					{ board ? <Board {...board} /> : <Skeleton height={20} radius="xl" /> }
				</div>
			</div>
		</>
	)
};

export default Game;
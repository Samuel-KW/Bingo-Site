import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, Title, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { loadingBingoBoard } from '../../components/loading';
import { BingoBoard, fetchBingoBoards } from '../../components/bingo-board';

import styles from './Play.module.css';

function Play() {

	const bingoBoards: BingoBoard[] = [];

	const [boards, setBoards] = useState<BingoBoard[]>([]);

	const navigate = useNavigate();


  useEffect(() => {

		const abortController = new AbortController();

    fetchBingoBoards(abortController)
			.then(data => {
				setBoards(data);
				notifications.hide("load-boards-error");
			})
			.catch(error => {

				if (error.name !== "AbortError") {
					notifications.show({
						id: "load-boards-error",
						autoClose: false,
						title: "Unable to load boards",
						message: "An error occurred while loading your accounts bingo board.",
						color: "red",
					});
				}
			});

		return () => abortController.abort();
  }, [bingoBoards]);

	return (
		<>
			<h1>BINGO!</h1>

			<div className={styles.content}>
				<div className={styles.board}>
					{boards.length ? boards.map(board => (
						<Card key={board.id} onClick={() => void navigate("/play/" + board.id)}>
							<Title order={3}>{board.title}</Title>
							<Text>{(new Date(board.created_at)).toLocaleDateString()}</Text>
						</Card>
					)) : loadingBingoBoard}
				</div>
			</div>
		</>
	)
};

export default Play;
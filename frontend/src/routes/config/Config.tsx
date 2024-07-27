import { useEffect, useState } from 'react';

import { Text, Card, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../components/authentication';
import { BingoBoard, fetchOwnedBingoBoards } from '../../components/bingo-board';
import { loadingBingoBoard } from '../../components/loading';

function Config() {

	const [boards, setBoards] = useState<BingoBoard[]>();

	const navigate = useNavigate();

	const auth = useAuth();
	if (!auth) throw new Error("No auth provider found");

	useEffect(() => {

		const abortController = new AbortController();

    fetchOwnedBingoBoards(abortController)
			.then(data => {
				setBoards(data);
				notifications.hide("load-owned-boards-error");
			})
			.catch(error => {
				if (error.name !== "AbortError") {
					notifications.show({
						id: "load-owned-boards-error",
						autoClose: false,
						title: "Unable to load custom boards",
						message: "An error occurred while loading your custom bingo boards.",
						color: "red",
					});
				}
			});

		return () => abortController.abort();
  }, []);

	return (
		<>
			<h1>Your boards</h1>
			{boards === undefined ? loadingBingoBoard : boards.map(board => (
				<Card key={board.id} onClick={() => void navigate("/account/config/" + board.id)}>
					<Title order={3}>{board.title}</Title>
					<Text>{(new Date(board.created_at)).toLocaleDateString()}</Text>
				</Card>
			))}
		</>
	)
}

export default Config;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Title, Text } from '@mantine/core';

import { BingoBoard, fetchBingoBoards } from '../../components/bingo-board';

import './Play.css';

function Play() {

	const bingoBoards: BingoBoard[] = [];

	const [boards, setBoards] = useState<BingoBoard[]>([]);

	const navigate = useNavigate();


  useEffect(() => {
    fetchBingoBoards()
			.then(data => {
				setBoards(data);
			})
			.catch(error => {
				console.error(error);
			});
  }, [bingoBoards]);

	return (
		<>
			<h1>BINGO!</h1>

			<div className="content">
				<div className="board">
					{boards.map(board => (
						<Card key={board.id} onClick={() => void navigate("/play/" + board.id)}>
							<Title order={3}>{board.title}</Title>
							<Text>{(new Date(board.created_at)).toLocaleDateString()}</Text>
						</Card>
					))}
				</div>
			</div>
		</>
	)
};

export default Play;
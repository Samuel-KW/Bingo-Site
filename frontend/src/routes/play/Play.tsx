import { useState } from 'react';
import './Play.css';

import { Accordion, MantineProvider } from '@mantine/core';

function Play() {
	const [title, setTitle] = useState("OASC Summer Camp");

	return (
		<MantineProvider>
			<div className="title sticky">
				<h1>BINGO!</h1>
			</div>

			<div>
				<h2>{title}</h2>
				<Accordion>
					<Accordion.Item value="item-1">
						<Accordion.Control>Instructions</Accordion.Control>
						<Accordion.Panel>
							<p>This website tracks your readiness for camp! The first 10 campers to have a blackout will get a prize!</p>

							<h3>Instructions</h3>
							<p>To fill in the bingo boxes, look for QR codes to scan or click a box for more instructions</p>
							<p>If you're having any bingo problems find JC Leina in the Grove</p>

							<strong>Good luck!</strong>
						</Accordion.Panel>
					</Accordion.Item>
				</Accordion>
			</div>

			<div className="content">
				<div className="grid-type"></div>
				<div className="board">
					{}
				</div>
			</div>
		</MantineProvider>
	)
};

export default Play;
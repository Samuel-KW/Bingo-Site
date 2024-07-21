import { useState } from 'react';
import './Play.css';

import MenuSortGrid from "../../components/menu-sort-grid";
import { Accordion } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

function Play() {
	const [checked, { toggle }] = useDisclosure(false);
	const [title, setTitle] = useState("OASC Summer Camp");

	return (
		<>
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
				<MenuSortGrid onClick={toggle} checked={checked} aria-label="Toggle card layout style" />
				<div className="board">

				</div>
			</div>
		</>
	)
};

export default Play;
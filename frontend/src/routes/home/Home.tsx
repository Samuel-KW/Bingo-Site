import { Title, Text } from '@mantine/core';
import './Home.css';
import { Link } from 'react-router-dom';

function Home() {

	return (
		<>
			<Title>Welcome to the bingo Lounge!</Title>
			<Text>Trying to join a bingo game? <Link to="/play">Click here!</Link></Text>
			<Text>Want to create a new bingo board? <Link to="/account/config">Click here!</Link></Text>

			<Text mt="lg">New user? <Link to="/account/signup">Sign Up!</Link></Text>
			<Text>Already have an account? <Link to="/account/login">Sign in!</Link></Text>
		</>
	)
}

export default Home

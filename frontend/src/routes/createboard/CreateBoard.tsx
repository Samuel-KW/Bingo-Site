import { Button, Checkbox, Group, TextInput, Title, Textarea, SegmentedControl } from "@mantine/core";
import { hasLength, useForm } from "@mantine/form";
import { useState } from "react";
import { useAuth } from "../../components/authentication";
import { BingoCard } from "../../components/bingo-card";
import { createBingoBoard } from "../../components/bingo-board";

function CreateBoard() {

	const [loading, setLoading] = useState(false);

	const auth = useAuth();
	if (!auth) throw new Error("No auth provider found");

	const formBoard = useForm({
		name: "create-board-form",
    mode: "uncontrolled",
    initialValues: {
			title: "",
			description: "",

    },
    validate: {
			title: hasLength({ min: 1, max: 128 }),
			description: hasLength({ min: 1, max: 1024 }),
    }
  });

	const formCard = useForm({
		name: "create-card-form",
    mode: "uncontrolled",
    initialValues: {
			title: "",
			description: "",
			required: false,
			type: "Given",
    } as BingoCard,

    validate: {
			title: hasLength({ min: 1, max: 128 }),
			description: hasLength({ min: 1, max: 1024 })
    },
  });

	const handleInputCard = (values: typeof formCard.values) => {

		setLoading(true);

		try {
			console.log(values);

		} catch (error: unknown) {
			if (typeof error === "string")
				alert(error);

		} finally {
			setLoading(false);
		}
	};

	const handleInputBoard = async (values: typeof formBoard.values) => {

		setLoading(true);

		try {
			console.log(values);

			const abortController = new AbortController();
			createBingoBoard({
				"title": "Example Board",
				"description": "*hi* **Bold** __ul__ This is an example board for OASC camp. Complete the tasks to get to know your fellow campers and staff!",
				"editors": [
					"32af0694-d8b5-4b07-abef-14b88e874fb3"
				],
				"cards": [{
					title: "Pick up your shirt, nametag, and bag",
					description: "By opening the bingo up you should have these camp materials! Make sure to put on your shirt and nametag before you leave your dorm room.",
					required: true,
					type: "Given"
				},
				{
					title: "Get your keys and (if needed) check in with medicine",
					description: "Inside on the first floor you’ll get the keys to your room (don’t lose these!) and be able to let staff know if you have any medical needs, prescriptions, or questions.",
					required: true,
					type: "QR Code"
				},
				{
					title: "Find your room and move in",
					description: "Bring all your stuff into your room and set yourself up for camp this week. Scan the QR on the door to your fling (section of the dorm) on your way out to complete!",
					required: true,
					type: "QR Code"
				},
				{
					title: "Head down to the Grove",
					description: "The Grove is the outdoor area on the first floor. This is where you should be hanging out and exploring before camp activities begin. The QR you need to scan is in the center of the Grove.",
					required: true,
					type: "QR Code"
				},
				{
					title: "Find a JC in the Grove and say hello",
					description: "JCs are so excited to meet you! Any of us in the Grove have the QRs for you to scan.",
					required: false,
					type: "QR Code"
				},
				{
					title: "Find a friend in the same grade as you",
					description: "Say hello to some campers! Enter the name of the camper you met - but they cannot be from your high school!",
					required: false,
					type: "User Input"
				},
				{
					title: "Say “THANK YOU!” to someone on tech crew or support staff",
					description: "WE LOVE TECH CREW! WE LOVE SUPPORT STAFF! Check this off once you’ve said hi and shared the love.",
					required: false,
					type: "Honor System"
				},
				{
					title: "Find a camp director in the Grove and say hello",
					description: "Camp directors (Britt, Beau, or Miles) are so happy you’re here. Say hello and scan the QR code they have",
					required: false,
					type: "QR Code"
				},
				{
					title: "Tell JC Tyler something about OASC camp you’re excited for",
					description: "JC Tyler will be in the grove hanging out, go find him and ask any questions you have about camp and share something you’re excited about!",
					required: false,
					type: "QR Code"
				},
				{
					title: "Beat JC Diego in rock, paper, scissors",
					description: "Be careful, JC Diego is crazy good at RPS. Challenge him and scan his QR code if you win! ",
					required: false,
					type: "QR Code"
				},
				{
					title: "Find a friend from the same region as you",
					description: "Say hello to some campers! Enter the name of the camper you met - but they cannot be from your high school!",
					required: false,
					type: "User Input"
				},
				{
					title: "Find an SC in the Grove and say hello",
					description: "SCs are so excited to meet you! Any of us in the Grove have the QRs for you to scan.",
					required: false,
					type: "QR Code"
				},
				{
					title: "Sing a song to JoJo or Lupita",
					description: "JoJo and Lupita are on our support staff and love music, share your favorite tune (Taylor Swift songs are their favorite) and scan their QR code!",
					required: false,
					type: "QR Code"
				},
				{
					title: "Meet your roommate or find a friend in the same fling as you",
					description: "Say hello to some campers! Enter the name of the camper you met, if you have a roommate enter your roommate or the name of someone in the same dorm hall as you.",
					required: false,
					type: "User Input"
				},
				{
					title: "Find the OASC store",
					description: "The OASC is only open at certain times. If you want to check out the available OASC merch and meet the staff working it, you can find the store on the first floor of Ackerman.",
					required: false,
					type: "QR Code"
				},
				{
					title: "Fill up your water bottle and show SC Greg",
					description: "SC Greg wants you to stay hydrated! Show him a full water bottle and he’ll let you scan his QR code!",
					required: false,
					type: "QR Code"
				}]
			}, abortController);

		} catch (error: unknown) {
			if (typeof error === "string")
				alert(error);

		} finally {
			setLoading(false);
		}
	};

	const cardTypes: BingoCard["type"][] = ["QR Code", "Honor System", "Given", "User Input"];

	return (
		<>
			<Title>Create a new board</Title>
			<form onSubmit={formBoard.onSubmit(values => handleInputBoard(values))}>
				<TextInput label="Title" placeholder="Enter a title for the board" key={formBoard.key("title")} {...formBoard.getInputProps("title")}/>
				<Textarea label="Description" mt="sm" placeholder="Enter a description for the board" key={formBoard.key("description")} {...formBoard.getInputProps("description")} />

				<Group justify="flex-end" mt="md">
					<Button type="submit" disabled={loading}>{loading ? <span>Loading</span> : <span>Create Board</span>}</Button>
				</Group>
			</form>

			<Title order={1}>Create a new card</Title>
			<form onSubmit={formCard.onSubmit(values => handleInputCard(values))}>
				<TextInput label="Title" placeholder="Enter a title for the card" key={formCard.key("title")} {...formCard.getInputProps("title")} />
				<Textarea label="Description" mt="sm" placeholder="Enter a description for the card" key={formCard.key("description")} {...formCard.getInputProps("description")} />
				<Checkbox label="Required" mt="lg" key={formCard.key("required")} {...formCard.getInputProps("required")}/>
				<SegmentedControl mt="lg" fullWidth data={cardTypes} key={formCard.key("type")} {...formCard.getInputProps("type")}/>

				<Group justify="flex-end" mt="md">
					<Button type="submit" disabled={loading}>{loading ? <span>Loading</span> : <span>Create Card</span>}</Button>
				</Group>
			</form>
		</>
	)
};

export default CreateBoard;
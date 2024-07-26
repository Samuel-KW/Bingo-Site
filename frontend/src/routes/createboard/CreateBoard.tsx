import { Button, Checkbox, Group, TextInput, Title, Textarea, SegmentedControl } from "@mantine/core";
import { hasLength, useForm } from "@mantine/form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/authentication";
import { BingoCard } from "../../components/bingo-card";

function CreateBoard() {

	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();

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
			<Title order={1}>Create a new board</Title>
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
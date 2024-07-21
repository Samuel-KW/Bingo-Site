import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../components/authentication.tsx';

import { Button, Checkbox, Group, TextInput, Center, Image, Text, Title, Divider, Card } from '@mantine/core';
import { useForm, isEmail, hasLength, matches } from '@mantine/form';

import SignipImage from "./signup.svg";

// import './SignUp.css'

export default function SignUp() {
	const [loading, setLoading] = useState(false)

	const navigate = useNavigate();

	const auth = useAuth();
	if (!auth) throw new Error("No auth provider found");

	const handleSignUp = async (values: typeof form.values) => {

		setLoading(true);

		try {
			const session = await auth.signup(values.email, values.password, {
				firstName: values.firstName,
				lastName: values.lastName,
				birthday: values.birthday,
				accountType: "user",
				avatarUrl: "",
				boards: []
			}, "");
			alert("Thank you for joining us! Welcome " + session.user.metadata.firstName);
			navigate("/");

		} catch (error: unknown) {
			if (typeof error === "string")
				alert(error);

		} finally {
			setLoading(false);
		}
	};

	const form = useForm({
		name: "signup-form",
    mode: "uncontrolled",
    initialValues: {
      email: "",
			password: "",
			firstName: "",
			lastName: "",
			birthday: "",
      termsOfService: false,
    },

    validate: {
			password: (value) => {
				if (value.length < 8) return "Password must be at least 8 characters long";
				if (value.length > 128) return "Password can not be longer than 128 characters";
				if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter";
				if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
				if (!/[0-9]/.test(value)) return "Password must contain at least one number";
				return null;
			},
      email: isEmail('Invalid email'),
			firstName: hasLength({ min: 1, max: 128 }, 'First name must be 1-128 characters long'),
			lastName: hasLength({ min: 1, max: 128 }, 'Last name must be 1-128 characters long'),
			birthday: matches(/^((19|20)?[0-9]{2}[- /.](0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01]))*$/, "Birthday must be in the format YYYY-MM-DD"),
    }
  });

	const names = ["Peanut","Giraffe","Cat","Dog","Walnut","Hippo","Penguin","Panda","Lion","Tiger","Bear","Elephant","Kangaroo","Koala","Gorilla","Monkey","Zebra","Rhino","Horse","Donkey","Cow","Pig","Sheep","Goat","Chicken","Duck","Goose","Turkey","Pheasant","Partridge","Quail","Ostrich","Emu","Rhea","Cassowary","Kiwi","Flamingo","Pelican","Stork","Crane","Heron","Egret","Ibis","Spoonbill","Vulture","Eagle","Hawk","Falcon","Owl","Osprey","Kite","Harrier","Buzzard","Kestrel","Merlin","Sparrowhawk","Goshawk","Peregrine","Hobby","Redstart","Robin","Wren","Blackbird","Songthrush","Mistlethrush","Fieldfare","Redwing","Whinchat","Stonechat","Wheatear","Dunnock","Nightingale","Swallow","Housemartin","Sandmartin","Cuckoo","Woodpigeon","Kingfisher","Dove"];

	return (
		<Center>
			<Card shadow="xl" p="lg" radius="md" withBorder>
				<Group justify="center" gap="xs" grow>
					<div>
						<div>
							<Title order={2}>Sign Up</Title>
							<Text>Already have an account? <Link to="/login">Log In</Link></Text>
							<Divider my="xs" />
						</div>
						<form onSubmit={form.onSubmit((values) => handleSignUp(values))}>
							<div>
								<TextInput
									withAsterisk
									label="Email"
									autoComplete="email"
									placeholder="your@email.com"
									key={form.key('email')}
									{...form.getInputProps('email')}
								/>

								<TextInput
									mt="xs"
									withAsterisk
									label="Password"
									autoComplete="new-password"
									placeholder="Your password"
									type="password"
									key={form.key('password')}
									{...form.getInputProps('password')}
								/>

								<TextInput
									mt="xs"
									label="First Name"
									autoComplete="given-name"
									placeholder="Mysterious"
									key={form.key('firstName')}
									{...form.getInputProps('firstName')}
								/>

								<TextInput
									mt="xs"
									label="Last Name"
									autoComplete="family-name"
									placeholder={names[Math.floor(Math.random() * names.length)]}
									key={form.key('lastName')}
									{...form.getInputProps('lastName')}
								/>

								<TextInput
									mt="xs"
									type="date"
									label="Birthday"
									autoComplete="bday"
									key={form.key('birthday')}
									{...form.getInputProps('birthday')}
								/>

								<Checkbox
									mt="lg"
									required
									label="I agree to the terms of service"
									key={form.key('termsOfService')}
									{...form.getInputProps('termsOfService', { type: 'checkbox' })}
								/>

								<Group justify="flex-end" mt="md">
									<Button type="submit" disabled={loading}>{loading ? <span>Loading</span> : <span>Log In</span>}</Button>
								</Group>
							</div>
						</form>
					</div>

					<div>
						<Image src={SignipImage} />
					</div>
				</Group>
			</Card>
		</Center>
	);
}
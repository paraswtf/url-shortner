import type { NextPage } from "next";
import { Center, Card, Text, Space, TextInput, Button, PasswordInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconLock, IconUser } from "@tabler/icons";
import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import Head from "next/head";
import { LoginRequest } from "./api/users/login";
import request from "../lib/api";
import { verificationInput } from "./verify";
import Link from "next/link";
import Logo from "../components/Logo";

const Login: NextPage = () => {
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [mfaEmail, setMfaEmail] = useState<string | null>(null);
	//States for verification input
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const form = useForm({
		initialValues: {
			username: "",
			password: ""
		},
		validate: {
			username: (value) => {
				if (!value) return "Username is required";
			},
			password: (value) => {
				if (!value) return "Password is required";
			}
		},
		validateInputOnChange: true
	});

	const handleSubmit = async (values: typeof form["values"]) => {
		//Set loading state
		setSubmitting(true);
		const req = {
			password: values.password,
			[values.username.includes("@") ? "email" : "username"]: values.username
		} as any as LoginRequest;
		try {
			const res = await request("/users/login", req);
			if (res.status === 200) {
				setSubmitted(true);
				window.location.assign("/");
			}
			if (res.status === 400) {
				form.setFieldError("username", res.fields.username);
				form.setFieldError("password", res.fields.password);
			}
			if (res.status === 401) {
				setMfaEmail(res.email);
			}
		} catch (e) {
			console.error(e);
		}

		setSubmitting(false);
	};

	return (
		<div>
			<Head>
				<title>Profyl - Login</title>
			</Head>
			<Center
				h="100vh"
				w="100vw"
				style={{
					flexDirection: "column"
				}}
			>
				<Logo />
				<Space h="xl" />
				<Card
					shadow="md"
					p="md"
					radius="lg"
					bg="secondary"
					w="min(350px, calc(100vw - 30px))"
					sx={{ overflow: "visible" }}
				>
					{mfaEmail ? (
						verificationInput({ email: mfaEmail, error, setError, loading, setLoading })
					) : (
						<>
							<Text
								size={24}
								weight="bold"
								align="center"
							>
								Login
							</Text>
							<Space h="sm" />
							<form onSubmit={form.onSubmit(handleSubmit)}>
								<TextInput
									placeholder="Enter your username or email"
									autoComplete="username"
									icon={<IconUser />}
									withAsterisk={true}
									{...form.getInputProps("username")}
									disabled={submitting || submitted}
								/>
								<Space h="md" />
								<PasswordInput
									placeholder="Enter your password"
									autoComplete="password"
									id="your-password"
									icon={<IconLock />}
									{...form.getInputProps("password")}
									disabled={submitting || submitted}
									visible={submitting || submitted ? false : undefined}
								/>
								<Space h="md" />
								<Center>
									<Button
										radius="xl"
										w="100%"
										type="submit"
										loading={submitting}
										loaderProps={{
											size: "xs",
											variant: "dots"
										}}
										loaderPosition="right"
										disabled={submitted}
									>
										Login
									</Button>
								</Center>
							</form>
							<Space h="md" />
							<Text
								c="primary"
								size="sm"
								align="center"
								w="100%"
							>
								{"Don't have an account? "}
								<Link href="/register">
									<Text
										span
										c="blue.5"
										inherit
										underline
									>
										Sign up
									</Text>
								</Link>
							</Text>
						</>
					)}
				</Card>
			</Center>
		</div>
	);
};

export default Login;

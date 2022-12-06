import axios from "axios";
import env from "../lib/env";
import { IconLock } from "@tabler/icons";
import { Center, Card, Text, Space, PasswordInput, Chip, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import Image from "next/image";
import Head from "next/head";
import { useState } from "react";

export default function Redirect({ slug }: any) {
	const [submitting, setSubmitting] = useState(false);
	const form = useForm({
		initialValues: {
			password: ""
		}
	});

	const handleSubmit = async (values: typeof form["values"]) => {
		//Set submitting to true to show the loader
		setSubmitting(true);

		const res =
			(
				await axios
					.post(env.BASE_URL + "/api/urls/geturl", {
						slug,
						password: values.password
					})
					.catch((err) => {
						if (err?.response?.status === 401) return { data: { locked: true } };
						return null;
					})
					.finally(() => setSubmitting(false))
			)?.data ?? null;

		if (!res || res.locked) return form.setFieldError("password", "Incorrect password");
		else window.location.assign(res.url);
	};

	return (
		<div>
			<Head>
				<title>Profyl - Password Protected URL</title>
			</Head>
			<Center
				h="100vh"
				w="100vw"
				style={{
					flexDirection: "column"
				}}
			>
				<Image
					src="/logo.svg"
					alt="Logo"
					width={100}
					height={100}
				/>

				<Space h="xl" />
				<Card
					shadow="md"
					p="md"
					radius="md"
					bg="secondary"
					w={350}
				>
					<Text
						size={24}
						weight="bold"
						align="center"
					>
						Password Protected URL
					</Text>
					<Space h="sm" />
					<Center>
						<Chip
							variant="filled"
							checked={false}
						>
							<Center>
								<IconLock size={"15px"} /> <Space w={5} />
								{env.DISPLAY_URL + "/" + slug}
							</Center>
						</Chip>
					</Center>

					<Space h="xl" />
					<form onSubmit={form.onSubmit(handleSubmit)}>
						<PasswordInput
							placeholder="Enter Password"
							id="your-password"
							{...form.getInputProps("password")}
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
							>
								Visit URL
							</Button>
						</Center>
					</form>
				</Card>
			</Center>
		</div>
	);
}

export const getServerSideProps = async (context: { params: { slug: string[] } }) => {
	const slug = context.params.slug;

	let redirect = null;

	if (slug && Array.isArray(slug) && slug.length !== 0 && slug.length < 2) {
		redirect =
			(
				await axios
					.post(env.BASE_URL + "/api/urls/geturl", {
						slug: slug.join("/")
					})
					.catch((err) => {
						if (err?.response?.status === 401) return { data: { locked: true } };
						return null;
					})
			)?.data ?? null;
	}

	if (!redirect) {
		return {
			redirect: {
				destination: "/404"
			}
		};
	}

	if (redirect.locked) {
		return {
			props: {
				slug: slug.join("/")
			}
		};
	}

	return {
		redirect: {
			destination: redirect.url
		}
	};
};

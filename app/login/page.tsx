"use client";

import Logo from "../components/logo";
import { Input, Button, Alert } from "@mui/joy";
import { useState } from "react";

export default function LoginPage() {

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFeedback(null);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            setIsSubmitting(true);

            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.message === "Login successful") {
                setFeedback({
                    type: "success",
                    message: "Connexion réussie.",
                });

                window.setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 700);

                return;
            }

            setFeedback({
                type: "error",
                message: "Email ou mot de passe invalide.",
            });
        } catch {
            setFeedback({
                type: "error",
                message: "Une erreur est survenue, veuillez réessayer.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <div className={"w-full h-screen content-center"}>
                <div className={"w-1/4 aspect-square mx-auto shadow-lg rounded-lg border border-gray-200"}>
                    <div className={"w-full flex items-center justify-center flex-col gap-2 mt-5"}>
                        <Logo size={64} />
                        <h1 className={"text-2xl font-bold"}>Agora</h1>
                        <h2 className={"text-gray-500 text-2xl"}>Se connecter</h2>
                    </div>
                    {feedback && (
                        <div className={"w-full px-10 mt-5"}>
                            <Alert
                                variant="soft"
                                color={feedback.type === "success" ? "success" : "danger"}
                                sx={{ mb: 2 }}
                            >
                                {feedback.message}
                            </Alert>
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className={"w-full px-10 mt-5"}>
                            <label htmlFor={"email"} className={"block text-sm font-medium text-gray-700 mb-1"}>Email</label>
                            <Input placeholder="Email" name="email" />
                        </div>
                        <div className={"w-full px-10 mt-5"}>
                            <label htmlFor={"password"} className={"block text-sm font-medium text-gray-700 mb-1"}>Mot de passe</label>
                            <Input placeholder="Mot de passe" name="password" type="password" />
                        </div>
                        <div className={"w-full px-10 mt-5"}>
                            <Button type="submit" fullWidth variant="solid">Se connecter</Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
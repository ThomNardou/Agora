"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Logo from "@/app/components/logo";
import Link from "next/link";
import { Button } from "@mui/joy";

type Status = "idle" | "loading" | "success" | "error" | "missing";

export default function UnsubscribePage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<Status>(token ? "idle" : "missing");
    const [message, setMessage] = useState("");

    function handleUnsubscribe() {
        setStatus("loading");
        fetch("/api/newsletters/unsubscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
        })
            .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
            .then(({ ok, data }) => {
                setMessage(data.message);
                setStatus(ok ? "success" : "error");
            })
            .catch(() => {
                setMessage("Une erreur est survenue. Veuillez réessayer.");
                setStatus("error");
            });
    }

    return (
        <div className="w-full h-screen content-center">
            <div className="w-1/4 aspect-square mx-auto shadow-lg rounded-lg border border-gray-200">
                <div className="w-full flex items-center justify-center flex-col gap-2 mt-5">
                    <Logo size={64} />
                    <h1 className="text-2xl font-bold">Agora</h1>
                    <h2 className="text-gray-500 text-2xl">
                        {status === "success" ? "Désinscription réussie" : "Se désabonner"}
                    </h2>
                </div>

                <div className="w-full px-10 mt-5 flex flex-col gap-4">
                    {status === "idle" && (
                        <>
                            <p className="text-[13px] text-center text-gray-700">
                                Une fois que vous aurez cliqué sur “Se désabonner”, vous ne recevrez plus nos newsletters.

                                <br />
                                <br />
                                Si vous souhaitez vous réabonner ultérieurement, il vous suffira de vous inscrire à nouveau via notre formulaire d’abonnement.
                            </p>
                            <Button
                                fullWidth
                                sx={{ height: "40px" }}
                                onClick={handleUnsubscribe}
                            >
                                Se désabonner
                            </Button>
                        </>
                    )}

                    {status === "loading" && (
                        <p className="text-gray-500 text-sm text-center">Traitement en cours…</p>
                    )}

                    {status === "success" && (
                        <>
                            <p className="text-[13px] text-center text-gray-700">{message}</p>
                            <p className="text-[13px] text-center text-gray-500">
                                Vous ne recevrez plus de newsletters d'Agora. Vos données seront anonymisées dans un délai de 30 jours conformément à notre{" "}
                                <Link href="/privacyPolicy" className="text-blue-500 hover:underline">
                                    politique de confidentialité
                                </Link>.
                            </p>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <p className="text-[13px] text-center text-red-600 font-semibold">Lien invalide</p>
                            <p className="text-[13px] text-center text-gray-700">{message}</p>
                            <p className="text-[13px] text-center text-gray-500">
                                Ce lien a peut-être déjà été utilisé ou a expiré.
                            </p>
                        </>
                    )}

                    {status === "missing" && (
                        <>
                            <p className="text-[13px] text-center text-red-600 font-semibold">Token manquant</p>
                            <p className="text-[13px] text-center text-gray-500">
                                Aucun token de désinscription trouvé. Veuillez utiliser le lien présent dans l'email reçu.
                            </p>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Logo from "@/app/components/logo";
import Link from "next/link";

type Status = "loading" | "success" | "error" | "missing";

export default function UnsubscribePage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<Status>("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("missing");
            return;
        }

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
    }, [token]);

    return (
        <div className="w-full h-screen content-center">
            <div className="w-1/4 aspect-square mx-auto shadow-lg rounded-lg border border-gray-200 flex items-center justify-center flex-col gap-4 p-10">
                <Logo size={64} />
                <h1 className="text-2xl font-bold">Agora</h1>

                {status === "loading" && (
                    <p className="text-gray-500 text-sm text-center">Traitement en cours…</p>
                )}

                {status === "success" && (
                    <>
                        <h2 className="text-xl font-semibold text-green-600">Désinscription réussie</h2>
                        <p className="text-sm text-center text-gray-700">{message}</p>
                        <p className="text-sm text-center text-gray-500 w-4/6">
                            Vous ne recevrez plus de newsletters d'Agora. Vos données seront supprimées dans un délai de 30 jours conformément à notre{" "}
                            <Link href="/privacyPolicy" className="text-blue-500 hover:underline">
                                politique de confidentialité
                            </Link>.
                        </p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <h2 className="text-xl font-semibold text-red-600">Lien invalide</h2>
                        <p className="text-sm text-center text-gray-700">{message}</p>
                        <p className="text-sm text-center text-gray-500">
                            Ce lien a peut-être déjà été utilisé ou a expiré.
                        </p>
                    </>
                )}

                {status === "missing" && (
                    <>
                        <h2 className="text-xl font-semibold text-red-600">Token manquant</h2>
                        <p className="text-sm text-center text-gray-500">
                            Aucun token de désinscription trouvé. Veuillez utiliser le lien présent dans l'email reçu.
                        </p>
                    </>
                )}

                <Link href="/" className="text-sm text-blue-500 hover:underline mt-2">
                    ← Retour à l'accueil
                </Link>
            </div>
        </div>
    );
}

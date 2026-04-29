"use client";

import Image from "next/image";
import Logo from "@/app/components/logo";
import { Input, Checkbox, Button } from "@mui/joy";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);

  return (
    <>
      <div className={"w-full h-screen content-center"}>
        <div className={"w-1/4 aspect-square mx-auto shadow-lg rounded-lg border border-gray-200"}>
          <div className={"w-full flex items-center justify-center flex-col gap-2 mt-5"}>
            <Logo size={64} />
            <h1 className={"text-2xl font-bold"}>Agora</h1>
            <h2 className={"text-gray-500 text-2xl"}>S'abonner</h2>
          </div>
          <div className={"w-full px-10 mt-5"}>
            <label htmlFor={"email"} className={"block text-sm font-medium text-gray-700 mb-1"}>Email</label>
            <Input
              fullWidth
              placeholder={"Entrez votre adresse e-mail"}
              type={"email"}
              sx={{
                height: "40px",
              }}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className={"w-full px-10 mt-5"}>
            <Checkbox label={"J’accepte de recevoir la newsletter de Agora par e-mail"} sx={
              {
                fontSize: '13px'
              }
            } onChange={(event) => setConsent(event.target.checked)} />
          </div>
          <div className={"w-full px-10 mt-5"}>
            <Button fullWidth sx={{ height: "40px" }} disabled={!email} onClick={() => {
              fetch("/api/subscribe", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, consent }),
              }).then((response) => {
                if (response.ok) {
                  alert("Merci pour votre abonnement !");
                  setEmail("");
                  setConsent(false);
                } else {
                  alert("Une erreur est survenue. Veuillez réessayer.");
                }
              }
              )
            }}>
              S'abonner
            </Button>
            <span className={"text-gray-500 text-[11px] mt-2 block text-center"}>En vous abonnant, vous reconnaissez avoir pris connaissance de la <Link href="/privacyPolicy" className={"text-blue-500 hover:underline"}>politique de confidentialité</Link> d’Agora et acceptez le traitement de vos données personnelles conformément à celle-ci.</span>
          </div>
        </div>
      </div>
    </>
  );
}

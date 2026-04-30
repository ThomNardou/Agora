"use client";

import Image from "next/image";
import Logo from "@/app/components/logo";
import { Input, Checkbox, Button } from "@mui/joy";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"subscribing" | "subscribed">("subscribing");
  const [title, setTitle] = useState("S'abonner");

  return (
    <>
      <div className={"w-full h-screen content-center"}>
        <div className={"w-1/4 aspect-square mx-auto shadow-lg rounded-lg border border-gray-200"}>
          <div className={"w-full flex items-center justify-center flex-col gap-2 mt-5"}>
            <Logo size={64} />
            <h1 className={"text-2xl font-bold"}>Agora</h1>
            <h2 className={"text-gray-500 text-2xl"}>{title}</h2>
          </div>
          {
            status === "subscribed" ? (
              <div className={"w-full px-10 mt-5"}>
                <p className={" text-[13px] text-center"}>Vous êtes maintenant abonné à la newsletter d'Agora. Vous recevrez bientôt nos prochaines actualités et mises à jour.</p>
                <p className={" text-[13px] text-center mt-5"}>Si vous souhaitez vous désabonner à tout moment, vous pouvez le faire en cliquant sur le lien de désabonnement dans nos emails ou dans le mail que nous vous avons envoyé.</p>
              </div>
            ) : (
              <div>
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
                  <Checkbox label={"J’accepte de recevoir des newsletters de Agora par e-mail"} sx={
                    {
                      fontSize: '13px'
                    }
                  } onChange={(event) => setConsent(event.target.checked)} />
                </div>
                <div className={"w-full px-10 mt-5"}>
                  <Button fullWidth sx={{ height: "40px" }} disabled={!email || !consent} onClick={() => {
                    fetch("/api/newsletters/subscribe", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ email, consent }),
                    }).then((response) => {
                      if (response.ok) {
                        setEmail("");
                        setConsent(false);
                        setStatus("subscribed");
                        response.json().then((data) => {
                          setTitle(data.message || "Abonnement réussi !");
                        }).catch(() => {
                          setTitle("Abonnement réussi !");
                        });
                      } else {
                        const res = response.json().then((data) => {
                          alert(data.message || "Une erreur est survenue. Veuillez réessayer.");
                        }).catch(() => {
                          alert("Une erreur est survenue. Veuillez réessayer.");
                        });
                      }
                    }
                    )
                  }}>
                    S'abonner
                  </Button>
                  <span className={"text-gray-500 text-[11px] mt-2 block text-center"}>En vous abonnant, vous reconnaissez avoir pris connaissance de la <Link href="/privacyPolicy" className={"text-blue-500 hover:underline"}>politique de confidentialité</Link> d’Agora et acceptez le traitement de vos données personnelles conformément à celle-ci.</span>
                </div>
              </div>
            )
          }

        </div>
      </div>
    </>
  );
}

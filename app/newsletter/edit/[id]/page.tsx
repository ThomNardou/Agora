"use client";

import HomeResponseData from "@/app/api/home/route";
import NewsLetterForm from "@/app/components/newsLetterForm";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function EditNewsletterPage() {
    const { id } = useParams<{ id: string }>();

    const [newsletter, setNewsletter] = useState<{
        id: number;
        name: string;
        body: string;
        sendAt: string | null;
    } | null>(null);

    useEffect(() => {
        async function fetchNewsletter() {
            try {
                const response = await fetch(`/api/newsletters/getNewsLetterById/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setNewsletter({
                        id: data.newsletter.newsLetter_id,
                        name: data.newsletter.name,
                        body: data.newsletter.body,
                        sendAt: data.newsletter.sendAt,
                    });

                    console.log("Fetched newsletter:", data);
                } else {
                    console.error("Failed to fetch newsletter");
                }
            } catch (error) {
                console.error("Error fetching newsletter:", error);
            }
        }

        fetchNewsletter();
    }, [id]);

    return (
        <>
            <NewsLetterForm mode="edit" title="Modifier la campagne" newsletter={newsletter || undefined} />
        </>
    )
}
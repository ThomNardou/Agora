"use client"

import { marked } from "marked"
import DOMPurify from "dompurify"
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { LuPen } from "react-icons/lu";
import { Input } from "@mui/joy";
import { IoCodeSlash } from "react-icons/io5";
import { CiPlay1 } from "react-icons/ci";




export default function NewsletterDetailsPage() {

    const { id } = useParams<{ id: string }>();
    const [newsletter, setNewsletter] = useState<{
        id: number;
        name: string;
        body: string;
    } | null>(null);
    const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
    const [htmlContent, setHtmlContent] = useState("");

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
                    });

                    const rawHtml = await marked(data.newsletter.body);
                    console.log("Raw HTML:", rawHtml);

                    setHtmlContent(DOMPurify.sanitize(rawHtml));

                }
            } catch (error) {
                console.error("Error fetching newsletter:", error);
            }
        }

        fetchNewsletter();
    }, [id]);

    return (
        <div className="w-4/5 mx-auto">
            <h1 className="text-2xl text-gray-500 mb-4">Détails de la campagne</h1>
            <Input placeholder="Nom" fullWidth disabled startDecorator={
                <LuPen size={20} />
            }
                value={newsletter?.name || ""}
            />

            <div className="flex items-center gap-4 mt-4 bg-gray-200 rounded-t-lg">
                <button
                    onClick={() => setViewMode("preview")}
                    className={`cursor-pointer select-none px-4 py-2 ${viewMode === "preview" ? "border-b-3 border-b-blue-600" : ""}`}
                >
                    <CiPlay1 size={20} />
                </button>
                <button
                    onClick={() => setViewMode("code")}
                    className={`cursor-pointer select-none px-4 py-2 ${viewMode === "code" ? "border-b-3 border-b-blue-600" : ""}`}
                >
                    <IoCodeSlash size={20} />
                </button>
            </div>
            {
                viewMode === "preview" ? (
                    <div
                        className="p-4 border border-gray-300 rounded-b-lg min-h-96 max-h-96 overflow-y-auto bg-gray-100 shadow-sm">
                        <div dangerouslySetInnerHTML={{ __html: htmlContent }} className="newsletter-content" />
                    </div>
                ) : (
                    <div className="p-4 border border-gray-300 rounded-b-lg min-h-96 max-h-96 overflow-y-auto bg-gray-100 shadow-sm whitespace-pre-wrap font-mono text-sm">
                        {newsletter?.body}
                    </div>
                )
            }
        </div>
    )
}
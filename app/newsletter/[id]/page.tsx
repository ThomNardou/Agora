"use client"

import { marked } from "marked"
import DOMPurify from "dompurify"
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { LuPen } from "react-icons/lu";
import { Input, Button, Modal, ModalDialog, ModalClose, Typography } from "@mui/joy";
import { IoCodeSlash } from "react-icons/io5";
import { CiPlay1 } from "react-icons/ci";
import Link from "next/link";
import { IoEyeOutline } from "react-icons/io5";
import { MdDeleteOutline } from "react-icons/md";
import { VscDebugRestart } from "react-icons/vsc";

marked.setOptions({
    breaks: true,
    gfm: true
});


export default function NewsletterDetailsPage() {

    const { id } = useParams<{ id: string }>();
    const [newsletter, setNewsletter] = useState<{
        id: number;
        name: string;
        body: string;
        status: string;
    } | null>(null);
    const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
    const [htmlContent, setHtmlContent] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);


    useEffect(() => {
        async function fetchNewsletter() {
            try {
                const response = await fetch(`/api/newsletters/getNewsLetterById/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    setNewsletter({
                        id: data.newsletter.newsLetter_id,
                        name: data.newsletter.name,
                        body: data.newsletter.body,
                        status: data.newsletter.newsLetter_status.status,
                    });

                    const rawHtml = await marked(data.newsletter.body);

                    setHtmlContent(DOMPurify.sanitize(rawHtml));

                }
            } catch (error) {
                console.error("Error fetching newsletter:", error);
            }
        }

        fetchNewsletter();
    }, [id]);

    return (
        <>

            <Modal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
            >
                <ModalDialog>
                    <ModalClose />
                    <Typography level="h4">Confirmer la suppression</Typography>
                    <p>Êtes-vous sûr de vouloir {newsletter?.status === "DRAFT" ? "supprimer" : "annuler l'envoi de"} cette newsletter ?</p>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            color="neutral"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            color="danger"
                            onClick={async () => {
                                const response = await fetch(`/api/newsletters/${newsletter?.id}`, {
                                    method: "DELETE"
                                });

                                if (response.ok) {
                                    window.location.href = "/dashboard";
                                } else {
                                    alert("Erreur lors de la suppression de la newsletter");
                                }
                            }}
                        >
                            {newsletter?.status === "DRAFT" ? "Supprimer" : "Annuler l'envoi"}
                        </Button>
                    </div>
                </ModalDialog>
            </Modal>

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
                            <div dangerouslySetInnerHTML={{ __html: htmlContent }} className="newsletter-content prose prose-sm max-w-none" />
                        </div>
                    ) : (
                        <div className="p-4 border border-gray-300 rounded-b-lg min-h-96 max-h-96 overflow-y-auto bg-gray-100 shadow-sm whitespace-pre-wrap font-mono text-sm">
                            {newsletter?.body}
                        </div>
                    )
                }

                <div className="flex items-center gap-4 mt-4">
                    {
                        newsletter?.status === "DRAFT" || newsletter?.status === "SCHEDULED" ? (
                            <button
                                className="flex h-8 gap-2 items-center justify-center rounded-md border border-red-600 bg-red-100 text-red-700 hover:bg-red-200 transition-colors px-2 py-1"
                                onClick={async () => {
                                    setShowDeleteModal(true);

                                }}
                            >
                                <MdDeleteOutline size={25} />
                                {newsletter?.status === "DRAFT" ? "Supprimer" : "Annuler l'envoi"}
                            </button>
                        ) : null
                    }
                    {
                        newsletter?.status === "DRAFT" && (
                            <Link
                                href={`/newsletter/edit/${newsletter?.id}`}
                                className="flex h-8 gap-2 items-center justify-center rounded-md border border-yellow-600 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors px-2 py-1"
                            >
                                <LuPen size={20} />
                                Modifier
                            </Link>
                        )
                    }
                    {
                        newsletter?.status === "FAILED" || newsletter?.status === "CANCELLED" ? (
                            <button
                                className="flex h-8 gap-2 items-center justify-center rounded-md border border-orange-600 bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors px-2 py-1"
                                onClick={async () => {
                                    const response = await fetch(`/api/newsletters/${newsletter?.id}/retry`, {
                                        method: "PUT"
                                    });

                                    if (response.ok) {
                                        window.location.reload();
                                    } else {
                                        alert("Erreur lors de la reprogrammation de la newsletter");
                                    }
                                }}
                            >
                                <VscDebugRestart size={25} />
                                {newsletter?.status === "FAILED" ? "Réessayer" : "Reprogrammer"}
                            </button>
                        ) : null
                    }
                </div>
            </div>
        </>
    )
}
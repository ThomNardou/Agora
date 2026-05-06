"use client";

import { Input, Button, Alert } from "@mui/joy";
import { LuPen } from "react-icons/lu";
import { HiOutlineFolderAdd } from "react-icons/hi";
import { useState, useRef, useEffect } from "react";

export default function NewsLetterForm({ mode, title, newsletter }: {
    mode: "create" | "edit", title: string, newsletter?: {
        id: number;
        name: string;
        body: string;
        sendAt: string | null;
    }
}) {


    const editorRef = useRef<HTMLTextAreaElement>(null);
    const [markdownContent, setMarkdownContent] = useState("");
    const [name, setName] = useState("");
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    useEffect(() => {
        if (newsletter) {
            setName(newsletter.name);
            setMarkdownContent(newsletter.body);
        }
    }, [newsletter]);

    const applyTextFormat = (format: "bold" | "italic" | "underline" | "h1" | "h2" | "h3") => {
        if (!editorRef.current) return;

        const textarea = editorRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = markdownContent.substring(start, end);

        if (!selectedText) return;

        let formattedText: string;
        switch (format) {
            case "bold":
                formattedText = `**${selectedText}**`;
                break;
            case "italic":
                formattedText = `*${selectedText}*`;
                break;
            case "underline":
                formattedText = `<u>${selectedText}</u>`;
                break;
            case "h1":
                formattedText = `# ${selectedText}`;
                break;
            case "h2":
                formattedText = `## ${selectedText}`;
                break;
            case "h3":
                formattedText = `### ${selectedText}`;
                break;
        }

        const newMarkdown = markdownContent.substring(0, start) + formattedText + markdownContent.substring(end);
        setMarkdownContent(newMarkdown);

        textarea.focus();
        const cursorPosition = start + formattedText.length;
        textarea.setSelectionRange(cursorPosition, cursorPosition);
    };

    return (
        <>
            <div className="w-4/5 mx-auto">
                <h1 className="text-2xl text-gray-500 mb-4">{title}</h1>

                {feedback && (
                    <div className={"w-full my-5"}>
                        <Alert
                            variant="soft"
                            color={feedback.type === "success" ? "success" : "danger"}
                            sx={{ mb: 2 }}
                        >
                            {feedback.message}
                        </Alert>
                    </div>
                )}

                <Input placeholder="Nom" fullWidth startDecorator={
                    <LuPen size={20} />
                }
                    value={name || ""}
                    onChange={(e) => setName(e.target.value)}
                />

                <div className="flex items-center gap-2 mt-4 bg-gray-200 px-3 py-1 rounded-t-lg w-full">
                    <Button
                        size="sm"
                        variant="plain"
                        title="Gras"
                        className="font-bold "
                        onClick={() => applyTextFormat("bold")}
                    >
                        G
                    </Button>
                    <Button
                        size="sm"
                        variant="plain"
                        title="Italique"
                        className="italic"
                        onClick={() => applyTextFormat("italic")}
                    >
                        I
                    </Button>
                    <Button
                        size="sm"
                        variant="plain"
                        title="Souligné"
                        className="underline"
                        onClick={() => applyTextFormat("underline")}
                    >
                        U
                    </Button>
                    <details className="relative">
                        <summary className="cursor-pointer text-[#0B6BCB] text-sm select-none hover:bg-[#E3EFFB] px-2 py-1 rounded">
                            Aa
                        </summary>
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-2 z-10 w-40">
                            <Button
                                variant="plain"
                                title="Titre 1"
                                className="text-lg font-bold w-full justify-start"
                                onClick={() => applyTextFormat("h1")}
                            >
                                <span className="text-xl font-bold">Titre 1</span>
                            </Button>
                            <Button
                                variant="plain"
                                title="Titre 2"
                                className="text-md font-bold w-full justify-start"
                                onClick={() => applyTextFormat("h2")}
                            >
                                <span className="text-lg font-bold">Titre 2</span>
                            </Button>
                            <Button
                                variant="plain"
                                title="Titre 3"
                                className="text-sm font-bold w-full justify-start"
                                onClick={() => applyTextFormat("h3")}
                            >
                                <span className="text-md font-bold">Titre 3</span>
                            </Button>
                        </div>
                    </details>

                </div>
                <textarea
                    ref={editorRef}
                    value={markdownContent || ""}
                    onChange={(e) => setMarkdownContent(e.target.value)}
                    className="w-full border border-gray-300 border-t-0 rounded-b-lg p-4 min-h-96 focus:outline-none focus:border-blue-500 bg-white focus:ring-2 focus:ring-blue-200 text-sm"
                />
                <div className="flex justify-start mt-4">
                    <Button
                        color="neutral"
                        startDecorator={<HiOutlineFolderAdd size={20} />}
                        className="mr-2"
                        onClick={async () => {
                            console.log("Saving draft with name:", name);
                            if (name) {
                                const response = await fetch("/api/newsletters/save", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({
                                        id: newsletter?.id,
                                        name,
                                        status: "DRAFT",
                                        body: markdownContent
                                    })
                                })

                                if (response.ok) {
                                    setFeedback({
                                        type: "success",
                                        message: "Brouillon enregistré avec succès."
                                    });
                                } else {
                                    setFeedback({
                                        type: "error",
                                        message: "Une erreur est survenue lors de l'enregistrement du brouillon."
                                    });
                                }
                            } else {
                                setFeedback({
                                    type: "error",
                                    message: "Le nom de la campagne est requis pour enregistrer un brouillon."
                                });
                            }
                        }}>
                        {
                            mode === "create" ? "Enregistrer comme brouillon" : "Enregistrer les modifications"
                        }
                    </Button>
                </div>

            </div>
        </>
    )
}
"use client";

import { Input, Button, Alert, Modal, ModalDialog, ModalClose, Typography, Table, Checkbox } from "@mui/joy";
import { LuPen } from "react-icons/lu";
import { HiOutlineFolderAdd } from "react-icons/hi";
import { useState, useRef, useEffect } from "react";
import { RxCross1 } from "react-icons/rx";
import { IoCheckmarkOutline } from "react-icons/io5";
import { MdSearch } from "react-icons/md";
import { LuSend } from "react-icons/lu";


export default function NewsLetterForm({ mode, title, newsletter }: {
    mode: "create" | "edit", title: string, newsletter?: {
        id: number;
        name: string;
        body: string;
        sendAt: string | null;
    }
}) {


    const editorRef = useRef<HTMLTextAreaElement>(null);
    const sendAttInputRef = useRef<HTMLInputElement>(null);

    const [markdownContent, setMarkdownContent] = useState("");
    const [name, setName] = useState("");
    const [selectedReaders, setSelectedReaders] = useState<number[]>([]);
    const [sendAt, setSendAt] = useState<string | null>(null);
    const [openPlanModal, setOpenPlanModal] = useState(false);
    const [openReaderModal, setOpenReaderModal] = useState(false);
    const [readers, setReaders] = useState<{ reader_id: number; email: string, consentGiven: boolean }[]>([]);
    const [nlStatus, setNLStatus] = useState<"DRAFT" | "IN_PROGRESS" | "SCHEDULED" | null>(null);
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    useEffect(() => {
        const fetchReaders = async () => {
            try {
                const response = await fetch("/api/readers/getAll");
                if (response.ok) {
                    const data = await response.json();
                    setReaders(data.readers);
                    setSelectedReaders(data.readers.filter((r: { consentGiven: boolean }) => r.consentGiven).map((r: { reader_id: number }) => r.reader_id));
                }
            } catch (error) {
                console.error("Error fetching readers:", error);
            }
        };

        fetchReaders();
    }, []);

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


    const onCloseReaderModal = () => {
        setOpenReaderModal(false);
        setSelectedReaders(readers.filter(r => r.consentGiven).map(r => r.reader_id));
    }
    return (
        <>

            {/* =============================== PLAN MODAL =============================== */}
            <Modal open={openPlanModal} onClose={() => {setOpenPlanModal(false); if (sendAttInputRef.current) sendAttInputRef.current.value = ""; setSendAt(null);}}>
                <ModalDialog>
                    <ModalClose variant="plain" sx={{ m: 1 }} />
                    <Typography sx={{ mb: 2 }}>Planifier l'envoi</Typography>
                    <div className="flex flex-col gap-6 min-w-xl">
                        <div>
                            <label>
                                Date d'envoi :
                            </label>
                            <Input slotProps={{ input: { ref: sendAttInputRef, min: new Date().toISOString().slice(0, 16) } }} fullWidth type="datetime-local" className=" border border-gray-300 rounded px-2 py-1" onChange={(e) => setSendAt(e.target.value)} />
                        </div>
                        <Button disabled={!sendAt || sendAt < new Date().toISOString().slice(0, 16)} color="primary" sx={{ marginTop: '30px' }} onClick={() => { setOpenReaderModal(true); setOpenPlanModal(false); }}>
                            Planifier
                        </Button>
                    </div>
                </ModalDialog>
            </Modal>

            {/* =============================== READER SELECTION MODAL =============================== */}
            <Modal open={openReaderModal} onClose={onCloseReaderModal}>
                <ModalDialog>
                    <ModalClose variant="plain" sx={{ m: 1 }} />
                    <Typography sx={{ mb: 2 }}>Envoyer à :</Typography>
                    <div className="flex flex-col min-w-xl">
                        <div className="w-full flex justify-end">
                            <Input
                                placeholder="Rechercher un lecteur..."
                                startDecorator={<MdSearch size={20} />}
                                sx={{ width: "300px", marginBottom: "20px" }}
                                onInput={(e) => {
                                    const value = (e.target as HTMLInputElement).value.toLowerCase();
                                    const filteredReaders = readers.filter(reader => reader.email.toLowerCase().includes(value));
                                    setReaders(filteredReaders);
                                }}
                            />
                        </div>
                        <Table sx={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={{width: '5%'}}></th>
                                    <th style={{width: '10%'}}>N°</th>
                                    <th>Email</th>
                                    <th>Consentement</th>
                                </tr>
                            </thead>
                            <tbody>
                                {readers.filter(reader => reader.consentGiven).map(reader => (
                                    <tr key={reader.reader_id}>
                                        <td>
                                            <Checkbox size="sm" onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedReaders(prev => [...prev, reader.reader_id]);
                                                } else {
                                                    setSelectedReaders(prev => prev.filter(id => id !== reader.reader_id));
                                                }
                                            }} checked={selectedReaders.includes(reader.reader_id)} />
                                        </td>
                                        <td>{reader.reader_id}</td>
                                        <td title={reader.email}>{reader.email.slice(0, 30)}{reader.email.length > 30 ? "..." : ""}</td>
                                        <td>{reader.consentGiven ? (
                                            <div className="w-5 flex justify-center items-center aspect-square rounded-full  mr-2 bg-green-500">
                                                <IoCheckmarkOutline size={16} color="white" />
                                            </div>
                                        ) : (
                                            <div className="w-5 flex justify-center items-center aspect-square rounded-full mr-2 bg-red-500">
                                                <RxCross1 size={12} color="white" />
                                            </div>
                                        )}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <Button disabled={selectedReaders.length === 0} fullWidth color="primary" sx={{ marginTop: '30px' }} onClick={async () => {
                            const response = await fetch("/api/newsletters/save", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"                                },
                                body: JSON.stringify({
                                    id: newsletter?.id,
                                    readerIds: selectedReaders,
                                    status: nlStatus,
                                    name,
                                    body: markdownContent,
                                    sendAt
                                })
                            });

                            if (response.ok) {
                                setFeedback({
                                    type: "success",
                                    message: `Campagne ${nlStatus === "IN_PROGRESS" ? "envoyée" : "planifiée"} avec succès.`
                                });
                            }
                            else {
                                setFeedback({
                                    type: "error",
                                    message: `Une erreur est survenue lors de ${nlStatus === "IN_PROGRESS" ? "l'envoi" : "la planification"} de la campagne.`
                                });
                            }
                            onCloseReaderModal();
                            setSendAt(null);
                        }}>
                            Envoyer
                        </Button>
                    </div>
                </ModalDialog>
            </Modal>

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
                <div className="flex justify-start mt-4 gap-4">
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
                    <Button
                        color="success"
                        disabled={!name || !markdownContent}
                        startDecorator={<LuPen size={20} />}
                        onClick={() => {setOpenPlanModal(true); setNLStatus("SCHEDULED");}}
                    >
                        Planifier
                    </Button>
                    <Button
                        color="primary"
                        disabled={!name || !markdownContent}
                        startDecorator={<LuSend size={20} />}
                        onClick={() => {setOpenReaderModal(true); setSendAt(new Date().toISOString().slice(0, 16)); setNLStatus("IN_PROGRESS");}}
                    >
                        Envoyer
                    </Button>
                </div>

            </div>
        </>
    )
}
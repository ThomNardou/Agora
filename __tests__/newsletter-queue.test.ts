import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock des modules AVANT d'importer
vi.mock("../lib/prisma", () => ({
    default: {
        t_newsLetters_readers: {
            findMany: vi.fn(),
            update: vi.fn(),
            count: vi.fn(),
        },
        t_newsLetters: {
            update: vi.fn(),
            updateMany: vi.fn(),
        },
        t_newsLetters_status: {
            findFirst: vi.fn(),
        },
    },
}));

vi.mock("marked", () => ({
    marked: Object.assign(
        vi.fn(async (text) => `<p>${text}</p>`),
        { setOptions: vi.fn() }
    ),
}));

vi.mock("@/app/components/EmailHeader", () => ({
    default: () => "<tr><td>Header</td></tr>",
}));

vi.mock("@/app/components/EmailFooter", () => ({
    default: (unsubscribeUrl: string, appUrl: string, nlId?: number) =>
        `<tr><td><a href="${unsubscribeUrl}">Me désabonner</a></td></tr>${
            nlId
                ? `<img src="${appUrl}/api/newsletters/track/opened?t=${Buffer.from(`${nlId}`).toString("base64")}" alt="" width="1" height="1" style="display:none;border:0;" />`
                : ""
        }`,
}));

import { processBatch, sendEmail } from "../lib/newsletter-queue";
import prisma from "../lib/prisma";

const mockPrisma = prisma as any;

describe("Newsletter Queue", () => {
    let fetchSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.clearAllMocks();
        // Réinitialiser explicitement les mocks Prisma
        mockPrisma.t_newsLetters_readers.findMany.mockReset();
        mockPrisma.t_newsLetters_status.findFirst.mockReset();
        mockPrisma.t_newsLetters_readers.update.mockReset();
        mockPrisma.t_newsLetters_readers.count.mockReset();
        mockPrisma.t_newsLetters.update.mockReset();
        mockPrisma.t_newsLetters.updateMany.mockReset();

        fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
            new Response(JSON.stringify({ success: true }), { status: 200 })
        );

        // Mock process.env
        process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
        process.env.MAIL_TOKEN = "test_token";
        process.env.MAIL_FROM = "noreply@agora.ch";
        process.env.NEWSLETTER_BATCH_SIZE = "20";
        process.env.NEWSLETTER_INTERVAL_MS = "60000";
        process.env.NEWSLETTER_MAX_FAILURES = "5";
    });

    afterEach(() => {
        fetchSpy.mockRestore();
        vi.clearAllTimers();
    });

    describe("Scénario d'envoi", () => {
        it("Envoi à lecteur inscrit", async () => {
            const mockReader = {
                reader_id: 1,
                email: "user@example.com",
                consentGiven: true,
                consentGivenAt: new Date(),
                unsubscribeToken: "token_123",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockNewsletter = {
                newsLetter_id: 1,
                name: "Test Newsletter",
                body: "Test content",
                sendAt: new Date(Date.now() - 1000), // envoi passé
                newsLetter_status_fk: 2,
                createdAt: new Date(),
                updatedAt: new Date(),
                newsLetter_status: {
                    status_id: 2,
                    status: "SCHEDULED",
                    displayName: "Scheduled",
                    textColor: "#000",
                    backgroundColor: "#fff",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            };

            const mockEntry = {
                newsLetter_fk: 1,
                reader_fk: 1,
                sentAt: null,
                newsLetter: mockNewsletter,
                reader: mockReader,
            };

            // Mock findMany (lecture des newsletters non envoyées)
            mockPrisma.t_newsLetters_readers.findMany.mockResolvedValueOnce([
                mockEntry,
            ]);

            // Mock findFirst pour statut IN_PROGRESS
            mockPrisma.t_newsLetters_status.findFirst.mockResolvedValueOnce(null);

            // Mock update (marquage comme envoyé)
            mockPrisma.t_newsLetters_readers.update.mockResolvedValueOnce({
                newsLetter_fk: 1,
                reader_fk: 1,
                sentAt: new Date(),
            });

            // Mock count (vérification des lecteurs restants)
            mockPrisma.t_newsLetters_readers.count.mockResolvedValueOnce(0);

            // Mock pour marquer comme COMPLETED
            mockPrisma.t_newsLetters_status.findFirst.mockResolvedValueOnce({
                status_id: 3,
                status: "COMPLETED",
                displayName: "Completed",
                textColor: "#000",
                backgroundColor: "#fff",
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            mockPrisma.t_newsLetters.update.mockResolvedValueOnce({
                newsLetter_id: 1,
                name: "Test Newsletter",
                body: "Test content",
                sendAt: new Date(),
                newsLetter_status_fk: 3,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            // Appel de processBatch
            await processBatch();

            // Vérifier les appels à Prisma
            expect(mockPrisma.t_newsLetters_readers.findMany).toHaveBeenCalled();
            expect(mockPrisma.t_newsLetters_status.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { status: "IN_PROGRESS" }
                })
            );

            // Vérifier que l'email a été envoyé via fetch
            expect(fetchSpy).toHaveBeenCalledWith(
                "https://maily.section-inf.ch/mail/server.php",
                expect.objectContaining({
                    method: "POST",
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                        "X-Maily-Token": expect.any(String),
                    }),
                })
            );

            // Vérifier que la newsletter est marquée comme envoyée
            expect(mockPrisma.t_newsLetters_readers.update).toHaveBeenCalledWith({
                where: {
                    newsLetter_fk_reader_fk: {
                        newsLetter_fk: 1,
                        reader_fk: 1,
                    },
                },
                data: { sentAt: expect.any(Date) },
            });

            // Vérifier le count des lecteurs restants
            expect(mockPrisma.t_newsLetters_readers.count).toHaveBeenCalled();

            // Vérifier que la newsletter est marquée comme COMPLETED
            expect(mockPrisma.t_newsLetters.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { newsLetter_id: 1 },
                    data: { newsLetter_status_fk: 3 },
                })
            );
        });

        it("Tracking des clics", async () => {
            const mockReader = {
                reader_id: 1,
                email: "user@example.com",
                consentGiven: true,
                consentGivenAt: new Date(),
                unsubscribeToken: "token_123",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockNewsletter = {
                newsLetter_id: 1,
                name: "Test Newsletter",
                body: "Click [here](https://example.com)",
                sendAt: new Date(Date.now() - 1000),
                newsLetter_status_fk: 2,
                createdAt: new Date(),
                updatedAt: new Date(),
                newsLetter_status: {
                    status_id: 2,
                    status: "SCHEDULED",
                    displayName: "Scheduled",
                    textColor: "#000",
                    backgroundColor: "#fff",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            };

            const mockEntry = {
                newsLetter_fk: 1,
                reader_fk: 1,
                sentAt: null,
                newsLetter: mockNewsletter,
                reader: mockReader,
            };

            mockPrisma.t_newsLetters_readers.findMany.mockResolvedValueOnce([
                mockEntry,
            ]);
            mockPrisma.t_newsLetters_status.findFirst.mockResolvedValueOnce(null);
            mockPrisma.t_newsLetters_readers.update.mockResolvedValueOnce({
                newsLetter_fk: 1,
                reader_fk: 1,
                sentAt: new Date(),
            });
            mockPrisma.t_newsLetters_readers.count.mockResolvedValueOnce(0);
            mockPrisma.t_newsLetters_status.findFirst.mockResolvedValueOnce({
                status_id: 3,
                status: "COMPLETED",
                displayName: "Completed",
                textColor: "#000",
                backgroundColor: "#fff",
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            mockPrisma.t_newsLetters.update.mockResolvedValueOnce({
                newsLetter_id: 1,
                name: "Test Newsletter",
                body: "Click [here](https://example.com)",
                sendAt: new Date(),
                newsLetter_status_fk: 3,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await processBatch();

            // Vérifier les appels à Prisma
            expect(mockPrisma.t_newsLetters_readers.findMany).toHaveBeenCalled();
            expect(mockPrisma.t_newsLetters_status.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { status: "IN_PROGRESS" }
                })
            );
            expect(mockPrisma.t_newsLetters_readers.update).toHaveBeenCalled();
            expect(mockPrisma.t_newsLetters_readers.count).toHaveBeenCalled();
            expect(mockPrisma.t_newsLetters.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { newsLetter_id: 1 },
                    data: { newsLetter_status_fk: 3 },
                })
            );

            // Vérifier que fetch a été appelé et que le body contient le tracking
            expect(fetchSpy).toHaveBeenCalledWith(
                "https://maily.section-inf.ch/mail/server.php",
                expect.any(Object)
            );

            const fetchCall = fetchSpy.mock.calls[0];
            expect(fetchCall[0]).toBe(
                "https://maily.section-inf.ch/mail/server.php"
            );

            const body = JSON.parse(fetchCall[1]!.body as string);
            // Le HTML devrait contenir le tracking URL
            expect(body.body_html).toContain("api/newsletters/track/clicked");
        });

        it("Envoi en batch", async () => {
            // Créer 5 lecteurs avec une même newsletter
            const mockNewsletter = {
                newsLetter_id: 1,
                name: "Batch Test",
                body: "Test content",
                sendAt: new Date(Date.now() - 1000),
                newsLetter_status_fk: 2,
                createdAt: new Date(),
                updatedAt: new Date(),
                newsLetter_status: {
                    status_id: 2,
                    status: "SCHEDULED",
                    displayName: "Scheduled",
                    textColor: "#000",
                    backgroundColor: "#fff",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            };

            const mockEntries = Array.from({ length: 5 }, (_, i) => ({
                newsLetter_fk: 1,
                reader_fk: i + 1,
                sentAt: null,
                newsLetter: mockNewsletter,
                reader: {
                    reader_id: i + 1,
                    email: `user${i + 1}@example.com`,
                    consentGiven: true,
                    consentGivenAt: new Date(),
                    unsubscribeToken: `token_${i + 1}`,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            }));

            mockPrisma.t_newsLetters_readers.findMany.mockResolvedValueOnce(
                mockEntries
            );
            mockPrisma.t_newsLetters_status.findFirst.mockResolvedValueOnce(null);

            // Mock update pour chaque lecteur
            for (let i = 0; i < 5; i++) {
                mockPrisma.t_newsLetters_readers.update.mockResolvedValueOnce({
                    newsLetter_fk: 1,
                    reader_fk: i + 1,
                    sentAt: new Date(),
                });
            }

            mockPrisma.t_newsLetters_readers.count.mockResolvedValueOnce(0);
            mockPrisma.t_newsLetters_status.findFirst.mockResolvedValueOnce({
                status_id: 3,
                status: "COMPLETED",
                displayName: "Completed",
                textColor: "#000",
                backgroundColor: "#fff",
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            mockPrisma.t_newsLetters.update.mockResolvedValueOnce({
                newsLetter_id: 1,
                name: "Batch Test",
                body: "Test content",
                sendAt: new Date(),
                newsLetter_status_fk: 3,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await processBatch();

            // Vérifier les appels à Prisma
            expect(mockPrisma.t_newsLetters_readers.findMany).toHaveBeenCalled();
            expect(mockPrisma.t_newsLetters_status.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { status: "IN_PROGRESS" }
                })
            );
            expect(mockPrisma.t_newsLetters_readers.update).toHaveBeenCalledTimes(5);
            expect(mockPrisma.t_newsLetters_readers.count).toHaveBeenCalled();
            expect(mockPrisma.t_newsLetters.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { newsLetter_id: 1 },
                    data: { newsLetter_status_fk: 3 },
                })
            );

            // Vérifier que 5 emails ont été envoyés
            expect(fetchSpy).toHaveBeenCalledTimes(5);

            // Vérifier que chaque lecteur a reçu un email avec son adresse
            const calls = fetchSpy.mock.calls;
            for (let i = 0; i < 5; i++) {
                expect(calls[i][0]).toBe(
                    "https://maily.section-inf.ch/mail/server.php"
                );
                const body = JSON.parse(calls[i][1]!.body as string);
                expect(body.to).toBe(`user${i + 1}@example.com`);
            }
        });
    });

    describe("Scénario de désinscription", () => {
        it("Lien de désinscription", async () => {
            const mockReader = {
                reader_id: 1,
                email: "user@example.com",
                consentGiven: true,
                consentGivenAt: new Date(),
                unsubscribeToken: "token_unsubscribe_123",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockNewsletter = {
                newsLetter_id: 1,
                name: "Test Newsletter",
                body: "Test content",
                sendAt: new Date(Date.now() - 1000),
                newsLetter_status_fk: 2,
                createdAt: new Date(),
                updatedAt: new Date(),
                newsLetter_status: {
                    status_id: 2,
                    status: "SCHEDULED",
                    displayName: "Scheduled",
                    textColor: "#000",
                    backgroundColor: "#fff",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            };

            mockPrisma.t_newsLetters_readers.findMany.mockResolvedValueOnce([
                {
                    newsLetter_fk: 1,
                    reader_fk: 1,
                    sentAt: null,
                    newsLetter: mockNewsletter,
                    reader: mockReader,
                },
            ]);

            mockPrisma.t_newsLetters_status.findFirst.mockResolvedValueOnce(null);
            mockPrisma.t_newsLetters_readers.update.mockResolvedValueOnce({
                newsLetter_fk: 1,
                reader_fk: 1,
                sentAt: new Date(),
            });
            mockPrisma.t_newsLetters_readers.count.mockResolvedValueOnce(0);
            mockPrisma.t_newsLetters_status.findFirst.mockResolvedValueOnce({
                status_id: 3,
                status: "COMPLETED",
                displayName: "Completed",
                textColor: "#000",
                backgroundColor: "#fff",
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            mockPrisma.t_newsLetters.update.mockResolvedValueOnce({
                newsLetter_id: 1,
                name: "Test Newsletter",
                body: "Test content",
                sendAt: new Date(),
                newsLetter_status_fk: 3,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await processBatch();

            // Vérifier les appels à Prisma
            expect(mockPrisma.t_newsLetters_readers.findMany).toHaveBeenCalled();
            expect(mockPrisma.t_newsLetters_status.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { status: "IN_PROGRESS" }
                })
            );
            expect(mockPrisma.t_newsLetters_readers.update).toHaveBeenCalled();
            expect(mockPrisma.t_newsLetters_readers.count).toHaveBeenCalled();
            expect(mockPrisma.t_newsLetters.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { newsLetter_id: 1 },
                    data: { newsLetter_status_fk: 3 },
                })
            );

            // Vérifier que le fetch contient le lien de désinscription
            expect(fetchSpy).toHaveBeenCalled();
            const fetchCall = fetchSpy.mock.calls[0];
            const body = JSON.parse(fetchCall[1]!.body as string);
            expect(body.body_html).toContain(
                "unsubscribe?token=token_unsubscribe_123"
            );
        });

        it("Pas d'envoi sans consentement", async () => {
            // Les lecteurs sans consentement sont filtrés par la requête Prisma
            // Donc findMany ne retournera rien
            mockPrisma.t_newsLetters_readers.findMany.mockResolvedValue([]);

            await processBatch();

            // Vérifier que Prisma a bien été interrogée
            expect(mockPrisma.t_newsLetters_readers.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        sentAt: null,
                        reader: { consentGiven: true },
                    }),
                })
            );

            // Vérifier que fetch n'a jamais été appelé
            expect(fetchSpy).not.toHaveBeenCalled();

            // Vérifier que update n'a pas été appelé
            expect(mockPrisma.t_newsLetters_readers.update).not.toHaveBeenCalled();
            expect(mockPrisma.t_newsLetters.update).not.toHaveBeenCalled();
        });
    });

    describe("Cas d'erreurs", () => {
        
        it("Token test_token_invalide", async () => {
            fetchSpy.mockResolvedValueOnce(
                new Response(
                    JSON.stringify({ error: "Invalid token" }),
                    {
                        status: 401,
                    }
                )
            );

            // Utiliser test_token_invalide comme token
            await expect(
                sendEmail(
                    "test@example.com",
                    "Test",
                    "<p>Test</p>",
                    "test_token_invalide",
                    1,
                    1
                )
            ).rejects.toThrow("Maily HTTP 401");
        });
    });

    describe("Gestion des statuts", () => {
        it("Vérification des statuts", async () => {
            const mockNewsletter = {
                newsLetter_id: 1,
                name: "Test Newsletter",
                body: "Test",
                sendAt: new Date(Date.now() - 1000),
                newsLetter_status_fk: 2,
                createdAt: new Date(),
                updatedAt: new Date(),
                newsLetter_status: {
                    status_id: 2,
                    status: "SCHEDULED",
                    displayName: "Scheduled",
                    textColor: "#000",
                    backgroundColor: "#fff",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            };

            mockPrisma.t_newsLetters_readers.findMany.mockResolvedValueOnce([
                {
                    newsLetter_fk: 1,
                    reader_fk: 1,
                    sentAt: null,
                    newsLetter: mockNewsletter,
                    reader: {
                        reader_id: 1,
                        email: "test@example.com",
                        consentGiven: true,
                        consentGivenAt: new Date(),
                        unsubscribeToken: "token",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                },
            ]);

            mockPrisma.t_newsLetters_status.findFirst.mockResolvedValueOnce(null);
            mockPrisma.t_newsLetters_readers.update.mockResolvedValueOnce({
                newsLetter_fk: 1,
                reader_fk: 1,
                sentAt: new Date(),
            });

            mockPrisma.t_newsLetters_readers.count.mockResolvedValueOnce(0);

            // Vérifier que processBatch s'exécute sans erreur
            await processBatch();

            // Vérifier les appels à Prisma
            expect(mockPrisma.t_newsLetters_readers.findMany).toHaveBeenCalled();
            expect(mockPrisma.t_newsLetters_status.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { status: "IN_PROGRESS" }
                })
            );

            // Vérifier que fetch a été appelé (email envoyé)
            expect(fetchSpy).toHaveBeenCalled();

            // Vérifier que l'update de sent a été appelé
            expect(mockPrisma.t_newsLetters_readers.update).toHaveBeenCalledWith({
                where: {
                    newsLetter_fk_reader_fk: {
                        newsLetter_fk: 1,
                        reader_fk: 1,
                    },
                },
                data: { sentAt: expect.any(Date) },
            });

            // Vérifier le count des lecteurs
            expect(mockPrisma.t_newsLetters_readers.count).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { newsLetter_fk: 1, sentAt: null },
                })
            );
        });

        it("Détection statut SCHEDULED", async () => {
            // Quand il n'y a pas de newsletters non envoyées, processBatch retourne early
            mockPrisma.t_newsLetters_readers.findMany.mockResolvedValueOnce([]);

            await processBatch();

            // Vérifier que findMany a été appelé
            expect(mockPrisma.t_newsLetters_readers.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        sentAt: null,
                    }),
                })
            );

            // Aucune newsletter à envoyer, donc aucun appel supplémentaire
            expect(mockPrisma.t_newsLetters_status.findFirst).not.toHaveBeenCalled();
            expect(fetchSpy).not.toHaveBeenCalled();
            expect(mockPrisma.t_newsLetters_readers.update).not.toHaveBeenCalled();
            expect(mockPrisma.t_newsLetters.update).not.toHaveBeenCalled();
        });
    });
});

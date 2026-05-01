"use client";

import { useState, useEffect } from "react";
import NewsLettersTab from "../components/newsLettersTab";
import HomeResponseData from "../api/home/route";
import ReadersTab from "../components/readersTab";


export default function DashboardPage() {

    const [stats, setStats] = useState<HomeResponseData | null>(null);
    const [activeTab, setActiveTab] = useState<"newsletters" | "readers">("newsletters");

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch("/api/home");
                console.log(response);

                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                } else {
                    console.error("Failed to fetch stats");
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        }

        fetchStats();
    }, []);



    return (
        <>
            <div className="w-4/5 mx-auto">
                <div className="w-full flex flex-wrap gap-4">
                    {[
                        { value: stats?.newsLettersThisWeek ?? "0", label: "Envoies cette semaine" },
                        { value: stats?.mailsOpened ?? "0", label: "Ouvertures de mail" },
                        { value: stats?.clickRate ?? "0", label: "Clics de lien" },
                        { value: stats?.subscribedReaders ?? "0", label: "Inscriptions" },
                        { value: stats?.unsubscribedReaders ?? "0", label: "Désinscriptions" },
                        { value: stats?.mailsError ?? "0", label: "Échecs" },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="flex-1 min-w-[32%] bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        >
                            <p className="text-3xl font-semibold text-gray-800">{stat.value}</p>
                            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-4/5 mx-auto mt-8 rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-6 mb-4 w-full border-b border-gray-200">
                        <label className={`cursor-pointer select-none px-3 py-1 ${activeTab === "newsletters" ? "border-b-3 border-b-blue-600" : ""}`} onClick={() => setActiveTab("newsletters")}>
                            Campagnes
                        </label>
                        <label className={`cursor-pointer select-none px-3 py-1 ${activeTab === "readers" ? "border-b-3 border-b-blue-600" : ""}`} onClick={() => setActiveTab("readers")}>
                            Lecteurs
                        </label>
                    </div>
                    <div>
                        {activeTab === "newsletters" && <NewsLettersTab newsletters={stats ? stats.newsletters : []} />}
                        {activeTab === "readers" && <ReadersTab readers={stats ? stats.readers : []} />}
                    </div>
            </div>
        </>
    );
}
"use client";

import { useState, useEffect } from "react";
import {
    CartesianGrid,
    XAxis,
    YAxis,
    Bar,
    BarChart,
    PieChart,
    Pie,
    Legend,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import HomeResponseData from "../api/home/route";

export default function StatisticsPage() {
    const [data, setData] = useState<HomeResponseData | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch("/api/home");

                if (response.ok) {
                    const data = await fetch("/api/home").then((res) => res.json());
                    setData(data);
                } else {
                    console.error("Failed to fetch stats");
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        }

        fetchStats();
    }, []);

    if (!data) return <div className="w-4/5 mx-auto mt-4">Chargement...</div>;

    // Graphique: répartition des lecteurs (abonnés vs désabonnés)
    const readersData = [
        { name: "Abonnés", value: data.subscribedReaders, fill: "#10b981" },
        { name: "Désabonnés", value: data.unsubscribedReaders, fill: "#ef4444" },
    ];

    // Graphique: statistiques générales
    const statsData = [
        { name: "Mails ouverts", value: data.mailsOpened },
        { name: "Clics", value: data.clickRate },
        { name: "Erreurs", value: data.mailsError },
    ];

    // Graphique: performance par newsletter
    const newslettersPerformance = data.newsletters
        .filter((n) => n.sendAt)
        .map((n) => ({
            name: n.name,
            opens: n.nbrOpens || 0,
            clicks: n.nbrClicks || 0,
        }));

    return (
        <div className="w-4/5 mx-auto">
            <style>
                {`
                    svg:focus { outline: none !important; }
                    .recharts-surface:focus { outline: none !important; }
                    .recharts-wrapper { outline: none !important; }
                    g:focus { outline: none !important; } 
                    .recharts-sector { outline: none !important; }
                `}

            </style>
            <h1 className="text-2xl text-gray-500 mb-8">Statistiques</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">Newsletters cette semaine</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {data.newsLettersThisWeek}
                    </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">Mails ouverts</p>
                    <p className="text-2xl font-bold text-green-600">{data.mailsOpened}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">Lecteurs abonnés</p>
                    <p className="text-2xl font-bold text-purple-600">
                        {data.subscribedReaders}
                    </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">Erreurs d'envoi</p>
                    <p className="text-2xl font-bold text-red-600">{data.mailsError}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Répartition des lecteurs</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={readersData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                dataKey="value"
                            >
                                {readersData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Statistiques générales</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={statsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {newslettersPerformance.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
                        <h2 className="text-xl font-semibold mb-4">Performance par newsletter</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={newslettersPerformance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={140} interval={0} />
                                <YAxis />
                                <Tooltip />
                                <Legend style={{paddingTop: '60px', paddingBottom: '60px'}}/>
                                <Bar dataKey="opens" fill="#10b981" />
                                <Bar dataKey="clicks" fill="#f59e0b" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
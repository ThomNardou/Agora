"use client";

import { usePathname } from "next/navigation";
import Navbar from "./components/navbar";
export default function RootLayoutClient({
    children,
    geistSans,
    geistMono,
}: Readonly<{
    children: React.ReactNode;
    geistSans: { variable: string };
    geistMono: { variable: string };
}>) {
    const pathname = usePathname();
    const layoutPaths = ["/login", "/", "unsubscribe"];

    const shouldHideLayout = layoutPaths.includes(pathname);

    return (
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
            {shouldHideLayout ? (
                children
            ) : (
                <>
                    <Navbar />
                    {children}
                </>
            )}
        </body>
    );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const outfit = Outfit({
    variable: "--font-outfit",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "MAS-HSC | Altar Servers Management",
    description: "Ministry of Altar Servers - Holy Spirit Church Management System",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            try {
                                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                                    document.documentElement.classList.add('dark')
                                } else {
                                    document.documentElement.classList.remove('dark')
                                }
                            } catch (_) {}
                        `,
                    }}
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased font-sans`}
            >
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}

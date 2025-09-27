import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Appsidebar from "@/components/Sidebar/Appsidebar";
import Visibility from "@/components/Sidebar/visibility";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Job Application Tracker",
  description: "Intelligent Job Application Tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen`}
      >
        <SidebarProvider>
          <Visibility>
            <div className="grid grid-cols-[auto_1fr] flex-1 w-full">
              <Appsidebar />
              <main className="flex flex-col overflow-auto">{children}</main>
            </div>
          </Visibility>
        </SidebarProvider>
        <Analytics />
      </body>
    </html>
  );
}

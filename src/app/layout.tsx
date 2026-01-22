import type { Metadata } from "next";
import { Rubik, Nunito_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { ChatWidget } from "@/components/ai/ChatWidget";

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PetPixel Gallery - Premium AI Pet Portraits",
  description: "Transform your pet into a masterpiece. Premium AI art generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${rubik.variable} ${nunitoSans.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <ChatWidget />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

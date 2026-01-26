import type { Metadata } from "next";
import { Rubik, Nunito_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "../globals.css";
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

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${rubik.variable} ${nunitoSans.variable} font-sans antialiased bg-background text-foreground`}>
        <NextIntlClientProvider messages={messages}>
          {children}
          <ChatWidget />
          <Toaster position="top-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

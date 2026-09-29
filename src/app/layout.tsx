import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "SQR CLIMB | How high can you go?",
  description:
    "SQR CLIMB is an original vertical pixel-art platformer. Climb as high as you can and compete on the permanent community leaderboard. $SQR",
  openGraph: {
    title: "SQR CLIMB",
    description: "Climb higher. Compete forever. $SQR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-sqr-cream text-sqr-dark antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

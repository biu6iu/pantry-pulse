import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Pantry Pulse",
  description:
    "Pantry Pulse is a Medical Pantry project that visualises donations to make their impact visible.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className={poppins.variable}>{children}</body>
    </html>
  );
}
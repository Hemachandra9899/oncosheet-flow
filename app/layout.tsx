import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OncoSheet Flow",
  description: "Click-first oncology patient entry for Google Sheets"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

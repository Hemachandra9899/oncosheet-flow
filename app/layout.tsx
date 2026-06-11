import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenSheet",
  description: "Click-first data entry for Google Sheets"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "แบบฟอร์มตรวจสอบและล้างแอร์ห้อง ATM/CDM",
  description: "ธนาคารไทยพาณิชย์ จำกัด (มหาชน)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased font-sarabun">
        {children}
      </body>
    </html>
  );
}

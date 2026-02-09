import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Đăng Kí Ngày Nghỉ",
  description: "Hệ thống quản lý đơn xin nghỉ phép cho doanh nghiệp",
  keywords: ["leave request", "nghỉ phép", "quản lý", "nhân sự"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}

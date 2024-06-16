import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="flex justify-center items-center bg-neutral-900">
      <QueryClientProvider client={queryClient}>
        <body className="h-[100%] w-[100%] flex justify-center items-center ">
          {children}
        </body>
      </QueryClientProvider>
    </html>
  );
}

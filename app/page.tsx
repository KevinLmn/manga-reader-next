"use client";

import { Search } from "@/components/search";

export default function Home() {
  const token = localStorage.getItem("authToken");
  console.log(token);
  return (
    <div className="h-100vh flex justify-center items-center">
      <Search />
    </div>
  );
}

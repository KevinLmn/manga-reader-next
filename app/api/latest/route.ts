import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("Fetching popular data...");

  const response = await fetch("http://localhost:3004/login", {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "1",
    },
    method: "POST",
    body: JSON.stringify({
      username: "username",
      password: "password",
    }),
  });

  const loginData = await response.json();

  const token = loginData.access_token;
  const res = await fetch("http://localhost:3004/latest", {
    next: { revalidate: 600 },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { message: "Failed to fetch data" },
      { status: 500 }
    );
  }
  const data = await res.json();

  return NextResponse.json(data);
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ body });
}

/*
fetch("/api/vds/execute", {
    method: "post",
    body: JSON.stringify({tasks:'manamana'}),
});
*/

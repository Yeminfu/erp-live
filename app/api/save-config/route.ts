import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';

export async function POST(request: NextRequest) {
  const body = await request.json();
  fs.writeFileSync("./app/config.json", JSON.stringify(body, null, 2), "utf8");
  return NextResponse.json({ body });
}

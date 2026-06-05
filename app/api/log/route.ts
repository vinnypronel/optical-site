import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const logFilePath = path.join(process.cwd(), 'client_logs.txt');
    const time = new Date().toISOString();
    const line = `[${time}] ${body.type.toUpperCase()}: ${body.message}\n`;
    fs.appendFileSync(logFilePath, line);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

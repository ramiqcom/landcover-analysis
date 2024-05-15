import { NextResponse } from 'next/server';
import { lulcLayer } from '../../module/ee';
import { LCRequestBody } from '../../module/global';

/**
 * Function to load land cover tile url
 * @param req
 */
export async function POST(req: Request) {
  try {
    const { year }: LCRequestBody = await req.json();
    const urlFormat = await lulcLayer(year);
    return NextResponse.json({ url: urlFormat }, { status: 200 });
  } catch ({ message }) {
    return NextResponse.json({ message }, { status: 404 });
  }
}

import { NextResponse } from 'next/server';
import { analysisLulc } from '../../module/ee';
import { LCAnalyzeBody } from '../../module/global';

export async function POST(req: Request) {
  try {
    // Load geojson from request body
    const { geojson, bounds }: LCAnalyzeBody = await req.json();
    const data = await analysisLulc({ geojson, bounds });
    return NextResponse.json({ data }, { status: 200 });
  } catch ({ message }) {
    return NextResponse.json({ message }, { status: 404 });
  }
}

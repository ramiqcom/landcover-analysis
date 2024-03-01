import 'node-self';

import ee from '@google/earthengine';
import collection from '../../data/collection.json';
import lc from '../../data/lc.json';
import { LCRequestBody, MapId } from '../../module/global';
import { authenticate, getMapId } from '../../server/ee-server';
import { NextResponse } from 'next/server';

/**
 * Function to load land cover tile url
 * @param req
 */
export async function POST(req: Request) {
  try {
    // Parameter
    const { year }: LCRequestBody = await req.json();

    // Error handle for wrong year
    if (
      year < 1985 ||
      year > 2022 ||
      (year > 1985 && year < 1990) ||
      (year > 1990 && year < 1995) ||
      (year > 1995 && year < 2000)
    ) {
      throw new Error('That year is not availabel');
    }

    // Authenticate Earth Engine
    await authenticate();

    // Image collection
    const col: ee.ImageCollection = ee.ImageCollection(
      collection[year < 2000 ? '5-year' : 'annual']
    );

    // Creat image mosaic
    let colBand: ee.ImageCollection;

    // Conditional mosaic based on year
    if (year < 2000) {
      colBand = col.select(`b${(year - 1980) / 5}`);
    } else {
      colBand = col.select(`b${year - 1999}`);
    }

    // Mosaic the image and add visualization
    const image: ee.Image = colBand.mosaic().rename('lulc').set({
      lulc_class_names: lc.names,
      lulc_class_palette: lc.palette,
      lulc_class_values: lc.values,
    });

    // Visualized the image
    const visualized: ee.Image = image.visualize();

    // Get image url
    const { urlFormat }: MapId = await getMapId(visualized, {});

		return NextResponse.json({ url: urlFormat }, { status: 200 });
  } catch ({ message }) {
    return NextResponse.json({ message }, { status: 404 });
  }
}

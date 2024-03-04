import 'node-self';

import ee from '@google/earthengine';
import { NextResponse } from 'next/server';
import collection from '../../data/collection.json';
import { LCAnalyzeBody } from '../../module/global';
import { authenticate, evaluate } from '../../server/ee-server';
import years from '../../data/year.json';

export async function POST(req: Request) {
  try {
    // Load geojson from request body
    const { geojson, bounds }: LCAnalyzeBody = await req.json();

    // Authenticate earth engine
    await authenticate();

    // Turn geojson to ee object
    const features: ee.FeatureCollection = ee.FeatureCollection(geojson);

    // Also turn bbox to ee object
    const geometry: ee.Geometry = ee.Geometry(bounds);

    // Area image
    const area = ee.Image.pixelArea().divide(1e4);

    // Area land cover per year
    const areas: ee.List = ee.List(
      years.map((year, index) => {
        // Image collection
        const col: ee.ImageCollection = ee
          .ImageCollection(collection[year < 2000 ? '5-year' : 'annual'])
          .filterBounds(bounds);

        const image = ee
          .Image(col.select(`b${(index <= 2 ? index : index - 2) + 1}`).mosaic())
          .rename(`lulc_${year}`);

        const areaLc = area
          .addBands(image)
          .clipToCollection(features)
          .reduceRegion({
            geometry: bounds,
            scale: 100,
            maxPixels: 1e13,
            reducer: ee.Reducer.sum().setOutputs(['area']).group(1, 'lc'),
          });

        return areaLc;
      })
    );

    // Evaluated value
    const data = await evaluate(areas);

    return NextResponse.json({ data }, { status: 200 });
  } catch ({ message }) {
    return NextResponse.json({ message }, { status: 404 });
  }
}

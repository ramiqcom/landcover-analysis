'use server';

import 'node-self';

import ee from '@google/earthengine';
import collection from '../data/collection.json';
import lc from '../data/lc.json';
import years from '../data/year.json';
import { authenticate, evaluate, getMapId } from './ee-server';
import { LCAnalyzeBody } from './global';

export async function lulcLayer({ year }: { year: number }) {
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
  const col: ee.ImageCollection = ee.ImageCollection(collection[year < 2000 ? '5-year' : 'annual']);

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
  const { urlFormat } = await getMapId(visualized, {});

  return { urlFormat };
}

export async function analysisLulc({ geojson, bounds }: LCAnalyzeBody) {
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
          geometry,
          scale: 100,
          maxPixels: 1e13,
          reducer: ee.Reducer.sum().setOutputs(['area']).group(1, 'lc'),
        });

      return areaLc;
    })
  );

  // Evaluated value
  const data = await evaluate(areas);

  return { data };
}

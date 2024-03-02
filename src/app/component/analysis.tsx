import { kml } from '@tmcw/togeojson';
import { FeatureCollection, area, bbox, bboxPolygon, dissolve, flatten } from '@turf/turf';
import epsg from 'epsg';
import { GeoJSON } from 'geojson';
import { GeoJSONSource, LngLatBoundsLike } from 'maplibre-gl';
import { Dispatch, MutableRefObject, SetStateAction, useContext, useEffect, useState } from 'react';
import { toWgs84 } from 'reproject';
import shp from 'shpjs';
import { Context, GlobalContext, LCAnalyzeResponse } from '../module/global';
import { setModal } from '../module/utils';
import lc from '../data/lc.json';

/**
 * Analysis panel
 * @returns
 */
export default function Analysis() {
  const {
    map,
    panel,
    geojson,
    setGeojson,
    vectorId,
    lcId,
    modalRef,
    setModalText,
    setBounds,
    bounds,
  } = useContext(Context) as GlobalContext;

  const [showVector, setShowVector] = useState(true);

  // Allow to drop file to map
  useEffect(() => {
    window.ondragover = (e: DragEvent): void => {
      e.preventDefault();
    };

    window.ondrop = async (e: DragEvent): Promise<void> => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      await loadGeojson(file, setGeojson, modalRef, setModalText);
    };
  }, [map]);

  // Allow to add geojson to map
  useEffect(() => {
    if (map && map.getSource(lcId)) {
      if (map.getSource(vectorId)) {
        const source = map.getSource(vectorId) as GeoJSONSource;
        source.setData(geojson);
      } else {
        map.addSource(vectorId, {
          type: 'geojson',
          data: geojson,
        });

        map.addLayer({
          id: vectorId,
          type: 'line',
          source: vectorId,
          paint: {
            'line-color': 'black',
            'line-width': 4,
          },
        });
      }

      // Zoom to geojson
      if (geojson && map.getSource(vectorId)) {
        const bounds = bbox(geojson);
        map.fitBounds(bounds as LngLatBoundsLike);

        const geometry = bboxPolygon(bounds).geometry;
        setBounds(geometry);
      }
    }
  }, [geojson]);

  // Use effect when the vector layer checked is changed
  useEffect(() => {
    if (map && map.getSource(vectorId)) {
      map.setLayoutProperty(vectorId, 'visibility', showVector ? 'visible' : 'none');
    }
  }, [showVector]);

  return (
    <div
      className='flexible vertical gap'
      style={{ display: panel == 'analysis' ? 'flex' : 'none' }}
    >
      <div className='flexible small-gap'>
        <input
          type='checkbox'
          disabled={geojson ? false : true}
          checked={showVector}
          onChange={(e) => {
            setShowVector(e.target.checked);
          }}
        />
        Vector layer
      </div>

      <div>
        Upload GeoJSON, Shapefile (zip), or KML/KMZ
        <input
          type='file'
          accept='.zip, .geojson, .json, .kml, .kmz'
          onChange={async (e) => {
            await loadGeojson(e.target.files[0], setGeojson, modalRef, setModalText);
          }}
        />
      </div>

      <button
        disabled={geojson ? false : true}
        onClick={async () => {
          // Flatten the polygon
          const polygon = flatten(geojson as FeatureCollection);
          const dissolved = dissolve(polygon);

          const request = await fetch('/api/analyze', {
            method: 'POST',
            body: JSON.stringify({ geojson: dissolved, bounds }),
            headers: {
              'Content-type': 'application/json',
            },
          });

          const { data, message }: LCAnalyzeResponse = await request.json();

          if (!request.ok) {
            throw new Error(message);
					}

					// LC datasets
					const { values, names, palette } = lc;

          // List years
          const years = [1985, 1990, 2000, 2005, 2010, 2015, 2020];

          // Group the data based on lc values to make it into a datasets for chart
          const datasets = values.map((value, index) => {
            const yearData = data.map((arr) => {
              const filtered = arr.groups.filter((obj) => obj.lc == value);
              return filtered.length ? filtered[0].area : 0;
						});

						const group = {
              data: yearData,
              backgroundColor: `#${palette[index]}80`,
              borderColor: `#${palette[index]}80`,
              label: names[index],
              fill: true,
            };

            return group;
					});

					// Filtered data year
					const filtered = datasets.filter((arr) => arr.data.reduce((x, y) => x + y));

					// C
        }}
      >
        Analyze land cover change
      </button>
    </div>
  );
}

/**
 * Function to parse and load geojson
 * @param file
 * @param setGeojson
 */
async function loadGeojson(
  file: File,
  setGeojson: Dispatch<SetStateAction<GeoJSON>>,
  modalRef: MutableRefObject<any>,
  setModalText: Dispatch<SetStateAction<string>>
): Promise<void> {
  try {
    // Show processing screen
    setModal('Processing data...', modalRef, setModalText);

    const format = file.name.split('.').at(-1).toLowerCase();

    let geojson: GeoJSON;

    // Conditional format
    switch (format) {
      case 'geojson':
      case 'json': {
        const parsed = JSON.parse(await file.text());
        const reprojected = toWgs84(parsed, undefined, epsg);
        geojson = reprojected;
        break;
      }
      case 'zip': {
        const parsed = await shp(await file.arrayBuffer());
        geojson = parsed;
        break;
      }
      case 'kml':
      case 'kmz': {
        const parsed = kml(new DOMParser().parseFromString(await file.text(), 'application/xml'));
        geojson = parsed;
        break;
      }
      default: {
        throw new Error(`Format ${format} is not supported`);
      }
    }

    // Check geojson area
    const areaGeojson = area(geojson as FeatureCollection) / 1e6;

    // If area too big throw error
    if (areaGeojson > 1e6) {
      throw new Error(`Data area is ${areaGeojson}. Too big. Make it under 1 million km2`);
    }

    // Set geojson
    setGeojson(geojson);

    // Close it
    setModal('', modalRef, setModalText, false);
  } catch ({ message }) {
    // Show error
    setModal(message as string, modalRef, setModalText, false, true);
  }
}

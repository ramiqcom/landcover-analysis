import { kml } from '@tmcw/togeojson';
import { FeatureCollection, area, bbox } from '@turf/turf';
import epsg from 'epsg';
import { GeoJSON } from 'geojson';
import { GeoJSONSource, LngLatBoundsLike } from 'maplibre-gl';
import { Dispatch, MutableRefObject, SetStateAction, useContext, useEffect, useState } from 'react';
import { toWgs84 } from 'reproject';
import shp from 'shpjs';
import { Context, GlobalContext } from '../module/global';
import { setModal } from '../module/utils';

/**
 * Analysis panel
 * @returns
 */
export default function Analysis() {
  const { map, panel, geojson, setGeojson, vectorId, lcId, modalRef, setModalText } = useContext(
    Context
  ) as GlobalContext;

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
        const bounds = bbox(geojson) as LngLatBoundsLike;
        map.fitBounds(bounds);
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

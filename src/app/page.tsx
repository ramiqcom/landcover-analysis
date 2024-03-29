'use client';

import { Geometry } from '@turf/turf';
import { GeoJSON } from 'geojson';
import { Map } from 'maplibre-gl';
import { Suspense, useRef, useState } from 'react';
import MapCanvas from './component/map';
import Float from './component/panel';
import basemaps from './data/basemap.json';
import { Context, PanelID } from './module/global';

/**
 * Main app component
 * @returns
 */
export default function Home() {
  // Basemap of choice
  const [basemap, setBasemap] = useState(basemaps[0]);

  // Map object
  const [map, setMap] = useState<Map>();

  // Tile list
  const [tiles, setTiles] = useState<Record<string, string>>({});

  // Tile
  const [tile, setTile] = useState<string | undefined>();

  // Year
  const [year, setYear] = useState<number>(2022);

  // Land cover panel
  const [panel, setPanel] = useState<PanelID>('landcover');

  // Geojson
  const [geojson, setGeojson] = useState<GeoJSON>();

  // Geojson geometries/bound
  const [bounds, setBounds] = useState<Geometry>();

  // Modal
  const [modalText, setModalText] = useState('');

  // LC select
  const [lcDisabled, setLcDisabled] = useState(true);

  // Datasets
  const [data, setData] = useState();

  // Modal ref
  const modalRef = useRef();

  // Lc id name
  const lcId: string = 'LC';

  // Vector id
  const vectorId: string = 'vector';

  // Context of all states
  const contextDict = {
    basemap,
    setBasemap,
    map,
    setMap,
    tiles,
    setTiles,
    year,
    setYear,
    tile,
    setTile,
    panel,
    setPanel,
    geojson,
    setGeojson,
    lcId,
    vectorId,
    modalText,
    setModalText,
    modalRef,
    lcDisabled,
    setLcDisabled,
    bounds,
    setBounds,
    data,
    setData,
  };

  return (
    <>
      <Context.Provider value={contextDict}>
        <dialog id='modal' ref={modalRef}>
          {modalText}
        </dialog>
        <Float />
        <Suspense fallback={<Loading />}>
          <MapCanvas />
        </Suspense>
      </Context.Provider>
    </>
  );
}

/**
 * Showing loading component
 * Loading component
 * @returns
 */
function Loading() {
  return (
    <div id='loading' className='flexible center1 center2'>
      Loading...
    </div>
  );
}

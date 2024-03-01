'use client';
import { Map } from 'maplibre-gl';
import { useState } from 'react';
import MapCanvas from './component/map';
import basemaps from './data/basemap.json';
import { Context } from './module/context';

export default function Home() {
  // Basemap of choice
  const [basemap, setBasemap] = useState(basemaps[0]);

  // Map object
  const [map, setMap] = useState<Map>();

  // Context of all states
  const contextDict = { basemap, setBasemap, map, setMap };

  return (
    <>
      <Context.Provider value={contextDict}>
        <MapCanvas />
      </Context.Provider>
    </>
  );
}

/**
 * Showing loading component
 * Loading component
 */
function Loading() {
  return (
    <div id='loading' className='flexible center1 center2'>
      Loading...
    </div>
  );
}

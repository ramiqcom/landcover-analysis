'use client';

import { Geometry } from '@turf/turf';
import { ChartData, ChartTypeRegistry } from 'chart.js';
import { GeoJSON } from 'geojson';
import { Map } from 'maplibre-gl';
import { useState } from 'react';
import MapCanvas from '../component/map';
import Float from '../component/panel';
import basemaps from '../data/basemap.json';
import lc from '../data/lc.json';
import yearsList from '../data/year.json';
import { Context, Option, PanelID } from '../module/global';

export default function Main() {
  // Basemap of choice
  const [basemap, setBasemap] = useState(basemaps[0]);

  // Map object
  const [map, setMap] = useState<Map>();

  // Tile list
  const [tiles, setTiles] = useState<Record<string, string>>({});

  // Year list
  const years = yearsList
    .map((year) => new Object({ label: String(year), value: year }) as Option)
    .reverse();

  // Year
  const [year, setYear] = useState(years[0]);

  // Tile
  const [tile, setTile] = useState<string>();

  // Show tile
  const [showTile, setShowTile] = useState(true);

  // Land cover panel
  const [panel, setPanel] = useState<PanelID>('landcover');

  // Geojson
  const [geojson, setGeojson] = useState<GeoJSON>();

  // Geojson show
  const [showVector, setShowVector] = useState(true);

  // Geojson geometries/bound
  const [bounds, setBounds] = useState<Geometry>();

  // Datasets
  const [data, setData] = useState<ChartData<keyof ChartTypeRegistry>>();

  // Status text
  const [status, setStatus] = useState<string>();

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
    bounds,
    setBounds,
    data,
    setData,
    showTile,
    setShowTile,
    showVector,
    setShowVector,
    lc,
    years,
    status,
    setStatus,
  };

  return (
    <>
      <Context.Provider value={contextDict}>
        <Float />
        <MapCanvas />
      </Context.Provider>
    </>
  );
}

'use client';

import { Geometry } from '@turf/turf';
import { ChartData, ChartTypeRegistry } from 'chart.js';
import { GeoJSON } from 'geojson';
import { Map } from 'maplibre-gl';
import { useState } from 'react';
import MapCanvas from '../component/map';
import Float from '../component/panel';
import { Context, Option, Options, PanelID } from '../module/global';

export default function Main({
  defaultStates,
}: {
  defaultStates: {
    basemap: Option;
    basemaps: Options;
    year: Option;
    years: Options;
    lc: Record<string, any[]>;
    tiles: Record<string, any>;
  };
}) {
  // Basemap of choice
  const [basemap, setBasemap] = useState(defaultStates.basemap);

  // Map object
  const [map, setMap] = useState<Map>();

  // Tile list
  const [tiles, setTiles] = useState(defaultStates.tiles);

  // Year
  const [year, setYear] = useState(defaultStates.year);

  // Tile
  const [tile, setTile] = useState(tiles[year.value]);

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
    lc: defaultStates.lc,
    years: defaultStates.years,
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

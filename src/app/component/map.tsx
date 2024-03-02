import { Map, RasterTileSource } from 'maplibre-gl';
import { useContext, useEffect } from 'react';
import '../../../node_modules/maplibre-gl/dist/maplibre-gl.css';
import { Context, GlobalContext, LCResponseBody } from '../module/global';

/**
 * Map div
 * @returns
 */
export default function MapCanvas() {
  // States from context
  const { basemap, map, setMap, tiles, setTiles, year, tile, setTile, lcId } = useContext(
    Context
  ) as GlobalContext;

  // Name of div id as map canvas
  const mapId: string = 'map';

  // When html is rendered load map
  useEffect(() => {
    // New Map
    const map = new Map({
      container: mapId,
      zoom: 4,
      center: [130, 0],
      style: basemap.value,
    });

    // Set map object
    setMap(map);

    // When map is loaded do something
    map.on('load', async () => {
      const tile = await getTile();

      map.addSource(lcId, {
        type: 'raster',
        tileSize: 256,
        tiles: [tile],
      });

      map.addLayer({
        id: lcId,
        type: 'raster',
        source: lcId,
        minzoom: 0,
        maxzoom: 22,
      });
    });
  }, []);

  // When year/tiles change do something
  useEffect(() => {
    // Load new tile
    getTile();
  }, [year, tiles]);

  // When the tile change, add it to map
  useEffect(() => {
    if (map && map.getSource(lcId)) {
      const source = map.getSource(lcId) as RasterTileSource;
      source.setTiles([tile]);
    }
  }, [tile]);

  /**
   * Async function to fetch land cover tileurl
   * @returns
   */
  async function getTile(): Promise<string> {
    let tile: string;

    if (!tiles[year]) {
      const response = await fetch('/api/lc', {
        body: JSON.stringify({ year }),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { url, message }: LCResponseBody = await response.json();

      if (!response.ok) {
        throw new Error(message);
      }

      tile = url;

      // Add fetched tile to tiles collection
      const newTiles = tiles;
      newTiles[year] = tile;
      setTiles(newTiles);
    } else {
      tile = tiles[year];
    }

    // Set the main tile
    setTile(tile);

    return tile;
  }

  return <div id={mapId} />;
}

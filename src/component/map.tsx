import { bbox, bboxPolygon } from '@turf/turf';
import { GeoJSONSource, LngLatBoundsLike, Map, RasterTileSource } from 'maplibre-gl';
import { useContext, useEffect, useState } from 'react';
import '../../node_modules/maplibre-gl/dist/maplibre-gl.css';
import { Context } from '../module/global';

/**
 * Map div
 * @returns
 */
export default function MapCanvas() {
  // States from context
  const { basemap, map, setMap, tile, showTile, geojson, showVector, setBounds } =
    useContext(Context);

  // Name of div id as map canvas
  const mapId = 'map';

  // LC id
  const lcId = 'lc';

  // Vector id
  const vectorId = 'vector';

  const [mapLoaded, setMapLoaded] = useState(false);

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
    map.on('load', () => {
      setMapLoaded(true);
    });
  }, []);

  // When the tile change, add it to map
  useEffect(() => {
    if (mapLoaded && tile) {
      if (map.getSource(lcId)) {
        const source = map.getSource(lcId) as RasterTileSource;
        source.setTiles([tile]);
      } else {
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
          maxzoom: 18,
        });
      }
    }
  }, [mapLoaded, tile]);

  // When tile loaded and geojson exist do something
  useEffect(() => {
    if (mapLoaded && geojson) {
      // Allow to add geojson to map
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

      const bounds = bbox(geojson);
      map.fitBounds(bounds as LngLatBoundsLike);

      const geometry = bboxPolygon(bounds).geometry;
      setBounds(geometry);
    }
  }, [mapLoaded, geojson]);

  // Use effect when the vector layer checked is changed
  useEffect(() => {
    if (mapLoaded && map.getSource(vectorId)) {
      map.setLayoutProperty(vectorId, 'visibility', showVector ? 'visible' : 'none');
    }
  }, [mapLoaded, showVector]);

  useEffect(() => {
    if (mapLoaded && map.getSource(lcId)) {
      map.setLayoutProperty(lcId, 'visibility', showTile ? 'visible' : 'none');
    }
  }, [mapLoaded, showTile]);

  return <div id={mapId} />;
}

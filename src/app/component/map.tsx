import { Map } from 'maplibre-gl';
import { useContext, useEffect } from 'react';
import '../../../node_modules/maplibre-gl/dist/maplibre-gl.css';
import { Context } from '../module/context';

export default function MapCanvas() {
  // States from context
  const { basemap, setMap } = useContext(Context);

  // Name of div id as map canvas
  const mapId = 'map';

  // When html is rendered load map
  useEffect(() => {
    const map = new Map({
      container: mapId,
      zoom: 8,
      center: [117, 0],
      style: basemap.value,
    });
    setMap(map);
  }, []);

  return <div id={mapId} />;
}

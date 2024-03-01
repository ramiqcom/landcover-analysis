import { Map } from 'maplibre-gl';
import { useContext, useEffect } from 'react';
import '../../../node_modules/maplibre-gl/dist/maplibre-gl.css';
import { Context, GlobalContext } from '../module/global';

export default function MapCanvas() {
  // States from context
  const { basemap, setMap } = useContext(Context) as GlobalContext;

  // Name of div id as map canvas
  const mapId: string = 'map';

  // When html is rendered load map
  useEffect(() => {
    const map = new Map({
      container: mapId,
      zoom: 4,
      center: [117, 0],
      style: basemap.value,
    });
    setMap(map);

    return () => {
      setMap(undefined);
    }
  }, []);

  return <div id={mapId} />;
}

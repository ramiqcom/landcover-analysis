import { GeoJSON } from 'geojson';
import { Map } from 'maplibre-gl';
import { Dispatch, SetStateAction, createContext } from 'react';

export type Option = { label: string; value: any };

export type PanelID = 'landcover' | 'analysis';

export type Options = Array<Option>;

export type GlobalContext = {
  basemap: Option;
  setBasemap: Dispatch<SetStateAction<Option>>;
  map: Map | undefined;
  setMap: Dispatch<SetStateAction<Map | undefined>>;
  tiles: Record<string, string>;
  setTiles: Dispatch<SetStateAction<Record<string, string>>>;
  tile: string;
  setTile: Dispatch<SetStateAction<string>>;
  year: number;
  setYear: Dispatch<SetStateAction<number>>;
  panel: PanelID;
  setPanel: Dispatch<SetStateAction<PanelID>>;
  geojson: GeoJSON;
  setGeojson: Dispatch<SetStateAction<GeoJSON>>;
  lcId: string;
  vectorId: string;
};

export type LCRequestBody = {
  year: number;
};

export type LCResponseBody = {
  url: string | undefined;
  message: string | undefined;
};

export type VisObject = {
  bands: Array<string>;
  min: Array<number>;
  max: Array<number>;
  palette?: Array<string>;
};

export type MapId = {
  mapid: string;
  urlFormat: string;
  image: Object;
};

export const Context = createContext<GlobalContext | {}>({});

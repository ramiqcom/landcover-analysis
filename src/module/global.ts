import { Geometry } from '@turf/turf';
import { ChartData, ChartTypeRegistry } from 'chart.js';
import { GeoJSON } from 'geojson';
import { Map } from 'maplibre-gl';
import { Dispatch, SetStateAction, createContext } from 'react';

export type Option = { label: string; value: any };

export type PanelID = 'landcover' | 'analysis';

export type Options = Array<Option>;

export type SetState<T> = Dispatch<SetStateAction<T>>;

export type GlobalContext = {
  basemap: Option;
  setBasemap: SetState<Option>;
  map: Map | undefined;
  setMap: SetState<Map>;
  tiles: Record<string, string>;
  setTiles: SetState<Record<string, string>>;
  tile: string;
  setTile: SetState<string>;
  showTile: boolean;
  setShowTile: SetState<boolean>;
  year: Option;
  setYear: SetState<Option>;
  panel: PanelID;
  setPanel: SetState<PanelID>;
  geojson: GeoJSON;
  setGeojson: SetState<GeoJSON>;
  bounds: Geometry;
  setBounds: SetState<Geometry>;
  data: ChartData<keyof ChartTypeRegistry>;
  setData: SetState<ChartData<keyof ChartTypeRegistry>>;
  lc: Record<string, any[]>;
  years: Options;
  showVector: boolean;
  setShowVector: SetState<boolean>;
  status: string;
  setStatus: SetState<string>;
};

export type LCRequestBody = {
  year: number;
};

export type LCResponseBody = {
  url: string | undefined;
  message: string | undefined;
};

export type LCAnalyzeBody = {
  geojson: GeoJSON;
  bounds: Geometry;
};

export type LCAnalyzeResponse = {
  data: Array<{ groups: Array<{ lc: number; area: number }> }>;
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

export const Context = createContext<GlobalContext | undefined>(undefined);

import { Geometry } from '@turf/turf';
import { ChartData, ChartTypeRegistry } from 'chart.js';
import { GeoJSON } from 'geojson';
import { Map } from 'maplibre-gl';
import { Dispatch, MutableRefObject, SetStateAction, createContext } from 'react';

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
  modalText: string;
  setModalText: Dispatch<SetStateAction<string>>;
  modalRef: MutableRefObject<any>;
  lcDisabled: boolean;
  setLcDisabled: Dispatch<SetStateAction<boolean>>;
  bounds: Geometry;
  setBounds: Dispatch<SetStateAction<Geometry>>;
  data: ChartData<keyof ChartTypeRegistry> | undefined;
  setData: Dispatch<SetStateAction<ChartData<keyof ChartTypeRegistry>>>;
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

export const Context = createContext<GlobalContext | {}>({});

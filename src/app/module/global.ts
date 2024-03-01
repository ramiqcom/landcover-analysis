import { createContext } from 'react';
import { Map } from 'maplibre-gl';
import { Dispatch, SetStateAction } from 'react';

export type Option = { label: string; value: any };
export type Options = Array<Option>;
export type GlobalContext = {
  basemap: Option;
  setBasemap: Dispatch<SetStateAction<Option>>;
  map: Map | undefined;
  setMap: Dispatch<SetStateAction<Map | undefined>>;
};

export const Context = createContext<GlobalContext | {}>({});

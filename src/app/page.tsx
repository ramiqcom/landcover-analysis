import Main from '../component/main';
import basemaps from '../data/basemap.json';
import lc from '../data/lc.json';
import yearsList from '../data/year.json';
import { lulcLayer } from '../module/ee';
import { Option, Options } from '../module/global';

/**
 * Main server app component
 * @returns
 */
export default async function Home() {
  const basemap = basemaps[0];
  const years: Options = yearsList
    .map((year) => new Object({ label: String(year), value: year }) as Option)
    .reverse();
  const year = years[0];

  const tiles = {};
  const { urlFormat } = await lulcLayer({ year: year.value });
  tiles[year.value] = urlFormat;

  const defaultStates = {
    basemap,
    basemaps,
    year,
    years,
    lc,
    tiles,
  };

  return (
    <>
      <Main defaultStates={defaultStates} />
    </>
  );
}

import { useContext } from 'react';
import lc from '../data/lc.json';
import years from '../data/year.json';
import { Context, GlobalContext, Options } from '../module/global';
import { Select } from './input';

/**
 * Transparent background
 * @returns
 */
export default function Float() {
  return (
    <div id='float' className='flexible vertical'>
      <Panel />
    </div>
  );
}

/**
 * Panel that do the analysis
 * @returns
 */
function Panel() {
  const { year, setYear } = useContext(Context) as GlobalContext;
  const options = years
    .map((year) => new Object({ value: year, label: String(year) }))
    .reverse() as Options;

  return (
    <div className='flexible vertical float-panel gap'>
      <div className='title'>Land Cover Analysis</div>

      <div>
        Land cover
        <Select
          options={options}
          value={{ value: year, label: String(year) }}
          onChange={(value) => setYear(value.value)}
        />
      </div>

      <Legend />
    </div>
  );
}

function Legend() {
  // Label and palette of the land cover
  const { names, palette } = lc;

  // Legend div
  const legends = names.map((name, index) => {
    return (
      <div key={index} style={{ width: '100%', height: '4vh' }} className='flexible small-gap'>
        <div
          style={{
            width: '3vh',
            height: '100%',
            border: 'thin solid white',
            backgroundColor: `#${palette[index]}`,
          }}
        />
        {name}
      </div>
    );
  });

  return (
    <div className='flexible vertical small-gap' id='legend'>
      {legends}
    </div>
  );
}

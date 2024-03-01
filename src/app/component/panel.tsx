import { useContext } from 'react';
import years from '../data/year.json';
import { Context, GlobalContext, Options } from '../module/global';
import { Select } from './input';

export default function Float() {
  return (
    <div id='float' className='flexible vertical'>
      <Panel />
    </div>
  );
}

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
    </div>
  );
}

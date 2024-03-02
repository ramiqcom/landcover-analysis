import { useContext, useEffect, useState } from 'react';
import lc from '../data/lc.json';
import years from '../data/year.json';
import { Context, GlobalContext, Options } from '../module/global';
import Analysis from './analysis';
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
  const { panel, setPanel } = useContext(Context) as GlobalContext;

  return (
    <div className='flexible vertical float-panel gap'>
      <div className='title'>Land Cover Analysis</div>

      <div className='flexible wide' style={{ width: '100%' }}>
        <button
          className='button-select'
          disabled={panel == 'landcover' ? true : false}
          onClick={() => setPanel('landcover')}
        >
          Land cover
        </button>
        <button
          className='button-select'
          disabled={panel == 'analysis' ? true : false}
          onClick={() => setPanel('analysis')}
        >
          Analysis
        </button>
      </div>

      <Analysis />
      <View />
    </div>
  );
}

function View() {
  const { year, setYear, panel, map, lcId, lcDisabled } = useContext(Context) as GlobalContext;
  const options = years
    .map((year) => new Object({ value: year, label: String(year) }))
    .reverse() as Options;

  const [showRaster, setShowRaster] = useState(true);

  // Show and hide raster layer
  useEffect(() => {
    if (map && map.getSource(lcId)) {
      map.setLayoutProperty(lcId, 'visibility', showRaster ? 'visible' : 'none');
    }
  }, [showRaster]);

  return (
    <div className='flexible vertical' style={{ display: panel == 'landcover' ? 'flex' : 'none' }}>
      <div className='flexible small-gap'>
        <input
          type='checkbox'
          checked={showRaster}
          disabled={lcDisabled}
          onChange={(e) => setShowRaster(e.target.checked)}
        />

        <Select
          options={options}
          disabled={lcDisabled}
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

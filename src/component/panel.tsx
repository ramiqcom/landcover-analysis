import { useContext, useState } from 'react';
import { Context, LCResponseBody } from '../module/global';
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
  const { panel, setPanel, status } = useContext(Context);

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

      <div style={{ textAlign: 'center', fontSize: 'small' }}>{status}</div>

      <div style={{ fontSize: 'x-small' }} className='flexible vertical small-gap'>
        <div>
          Created by Ramadhan{' '}
          <a href='mailto:ramiqcom@gmail.com' target='_blank' style={{ color: 'lightskyblue' }}>
            Email
          </a>{' '}
          <a
            href='https://linkedin.com/in/ramiqcom'
            target='_blank'
            style={{ color: 'lightskyblue' }}
          >
            LinkedIn
          </a>{' '}
          <a
            href='https://www.researchgate.net/profile/Ramadhan_Ramadhan7'
            target='_blank'
            style={{ color: 'lightskyblue' }}
          >
            ResearchGate
          </a>
        </div>

        <div>
          Data hosted in Google Earth Engine Community Catalog{' '}
          <a
            href='https://gee-community-catalog.org/'
            target='_blank'
            style={{ color: 'lightskyblue' }}
          >
            https://gee-community-catalog.org/
          </a>
        </div>

        <div>
          Data source: Liangyun Liu, Xiao Zhang, & Tingting Zhao. (2023). GLC_FCS30D: the first
          global 30-m land-cover dynamic monitoring product with fine classification system from
          1985 to 2022 [Data set]. Zenodo. https://doi.org/10.5281/zenodo.8239305
        </div>
      </div>
    </div>
  );
}

function View() {
  const {
    year,
    setYear,
    panel,
    showTile,
    setShowTile,
    years,
    tiles,
    setTiles,
    setTile,
    setStatus,
  } = useContext(Context);

  const [lcDisabled, setLCDisabled] = useState(false);

  return (
    <div className='flexible vertical' style={{ display: panel == 'landcover' ? 'flex' : 'none' }}>
      <div className='flexible small-gap'>
        <input
          type='checkbox'
          checked={showTile}
          disabled={lcDisabled}
          onChange={(e) => setShowTile(e.target.checked)}
        />

        <Select
          options={years}
          disabled={lcDisabled}
          value={year}
          onChange={async (value) => {
            try {
              setYear(value);

              // Show image generating status
              setStatus('Generating image...');

              // disabled button for a while
              setLCDisabled(true);

              let tile: string;

              if (!tiles[value.value]) {
                const response = await fetch('/lc', {
                  body: JSON.stringify({ year: value.value }),
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
                const { url, message }: LCResponseBody = await response.json();

                if (!response.ok) {
                  throw new Error(message);
                }

                tile = url;

                // Add fetched tile to tiles collection
                const newTiles = tiles;
                newTiles[value.value] = tile;
                setTiles(newTiles);

                // Set the main tile
                setTile(tile);
              } else {
                // Get tile from collection
                tile = tiles[value.value];

                // Set the main tile
                setTile(tile);
              }

              // Show image generating status
              setStatus('Success');
            } catch ({ message }) {
              // Show image generating status
              setStatus(message);
            } finally {
              // Enable button again
              setLCDisabled(false);
            }
          }}
        />
      </div>

      <Legend />
    </div>
  );
}

function Legend() {
  const { lc } = useContext(Context);

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

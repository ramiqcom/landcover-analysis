import { kml } from '@tmcw/togeojson';
import { FeatureCollection, area, dissolve, flatten } from '@turf/turf';
import epsg from 'epsg';
import { GeoJSON } from 'geojson';
import { useContext, useEffect, useState } from 'react';
import { toWgs84 } from 'reproject';
import shp from 'shpjs';
import { Context, LCAnalyzeResponse } from '../module/global';
import ChartCanvas from './chart';

/**
 * Analysis panel
 * @returns
 */
export default function Analysis() {
  const {
    panel,
    geojson,
    setGeojson,
    bounds,
    data,
    setData,
    years,
    lc,
    showVector,
    setShowVector,
    setStatus,
  } = useContext(Context);

  const [analysisButtonDisabled, setAnalysisButtonDisabled] = useState(true);

  const [chartShow, setChartShow] = useState(false);

  const [downloadLink, setDownloadLink] = useState('');

  // chart options
  const options = {
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
        title: {
          display: true,
          text: 'Area (Ha)',
        },
      },
      x: {
        stacked: true,
      },
    },
    layout: {
      padding: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20,
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        align: 'start',
      },
    },
  };

  // Allow to drop file to map
  useEffect(() => {
    window.ondragover = (e: DragEvent): void => {
      e.preventDefault();
    };

    window.ondrop = async (e: DragEvent): Promise<void> => {
      try {
        setStatus('Processing vector data...');
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        setGeojson(await loadGeojson(file));
        setStatus('Success');
      } catch ({ message }) {
        setStatus(message);
      }
    };
  }, []);

  return (
    <div
      className='flexible vertical gap'
      style={{ display: panel == 'analysis' ? 'flex' : 'none' }}
    >
      <div className='flexible small-gap'>
        <input
          type='checkbox'
          disabled={geojson ? false : true}
          checked={showVector}
          onChange={(e) => {
            setShowVector(e.target.checked);
          }}
        />
        Vector layer
      </div>

      <div>
        Upload GeoJSON, Shapefile (zip), or KML/KMZ
        <input
          type='file'
          accept='.zip, .geojson, .json, .kml, .kmz'
          onChange={async (e) => {
            try {
              setStatus('Processing vector data...');
              setGeojson(await loadGeojson(e.target.files[0]));
              setStatus('Success');
            } catch ({ message }) {
              setStatus(message);
            }
          }}
        />
      </div>

      <button
        disabled={geojson && analysisButtonDisabled ? false : true}
        onClick={async (e) => {
          try {
            // Make button disabled
            setAnalysisButtonDisabled(false);
            setChartShow(false);
            setStatus('Generating chart...');

            // Flatten the polygon
            const polygon = flatten(geojson as FeatureCollection);
            const dissolved = dissolve(polygon);

            const request = await fetch('/analyze', {
              method: 'POST',
              body: JSON.stringify({ geojson: dissolved, bounds }),
              headers: {
                'Content-type': 'application/json',
              },
            });

            const { data, message }: LCAnalyzeResponse = await request.json();

            if (!request.ok) {
              throw new Error(message);
            }

            // LC datasets
            const { values, names, palette } = lc;

            // Group the data based on lc values to make it into a datasets for chart
            const datasets = values.map((value, index) => {
              const yearData = data.map((arr) => {
                const filtered = arr.groups.filter((obj) => obj.lc == value);
                return filtered.length ? filtered[0].area : 0;
              });

              const group = {
                data: yearData,
                backgroundColor: `#${palette[index]}80`,
                borderColor: `#${palette[index]}80`,
                label: names[index],
                fill: true,
              };

              return group;
            });

            // Filtered data year
            const filtered = datasets.filter((arr) => arr.data.reduce((x, y) => x + y));

            // Set data
            setData({
              labels: years.map((dict) => dict.value),
              datasets: filtered,
            });

            // Set array only for csv
            const dataOnly = filtered.map((group) => {
              const label = group.label;
              const value = group.data;
              return [label, ...value];
            });
            dataOnly.unshift(['Land cover', ...years.map((dict) => dict.value)]);

            // Create string from the data
            const strings = dataOnly.map((arr) => arr.join(', ')).join('\n');

            // Create link for download
            const link = encodeURI(`data:text/csv;charset=utf-8,${strings}`);
            setDownloadLink(link);

            // Make button enbaled
            setAnalysisButtonDisabled(true);
            setChartShow(true);
            setStatus('Success');
          } catch ({ message }) {
            setStatus(message);
          }
        }}
      >
        Analyze land cover change
      </button>

      <div style={{ display: chartShow ? 'inline' : 'none' }}>
        <ChartCanvas options={options} type='line' data={data} />
        <a
          style={{ width: '100%' }}
          href={downloadLink}
          target='_blank'
          download={'landcover_change_1985_2020_Ha'}
        >
          <button style={{ width: '100%' }}>Download data</button>
        </a>
      </div>
    </div>
  );
}

/**
 * Function to parse and load geojson
 * @param file
 * @param setGeojson
 */
async function loadGeojson(file: File): Promise<GeoJSON> {
  const format = file.name.split('.').at(-1).toLowerCase();

  let geojson: GeoJSON;

  // Conditional format
  switch (format) {
    case 'geojson':
    case 'json': {
      const parsed = JSON.parse(await file.text());
      geojson = parsed;
      break;
    }
    case 'zip': {
      const parsed = await shp(await file.arrayBuffer());
      geojson = parsed;
      break;
    }
    case 'kml':
    case 'kmz': {
      const parsed = kml(new DOMParser().parseFromString(await file.text(), 'application/xml'));
      geojson = parsed;
      break;
    }
    default: {
      throw new Error(`Format ${format} is not supported`);
    }
  }

  // Reproject if possible
  try {
    geojson = toWgs84(geojson, undefined, epsg);
  } catch (err) {}

  // Check geojson area
  const areaGeojson = area(geojson as FeatureCollection) / 1e6;

  // If area too big throw error
  if (areaGeojson > 1e6) {
    throw new Error(`Data area is ${areaGeojson}. Too big. Make it under 1 million km2`);
  }

  return geojson;
}

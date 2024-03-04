import { Chart, ChartData, ChartTypeRegistry } from 'chart.js/auto';
import { useEffect } from 'react';

type ChartProp = {
  type: keyof ChartTypeRegistry;
  options: Record<string, any>;
  data: ChartData<keyof ChartTypeRegistry> | undefined;
};

export default function ChartCanvas({ type, options, data }: ChartProp) {
  const chartId: string = 'chart';

  useEffect(() => {
    if (type && options && data) {
      const doc = document.getElementById(chartId) as HTMLCanvasElement;
      const chart = new Chart(doc, {
        type,
        options,
        data,
      });

      return () => {
        // Destroy chart when done
        chart.destroy();
      };
    }
  }, [type, options, data]);

  return (
    <div>
      <canvas id={chartId} height={'100%'} width={'100%'}></canvas>
    </div>
  );
}

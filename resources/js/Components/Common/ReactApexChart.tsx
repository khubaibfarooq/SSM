import React, { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';

interface ReactApexChartProps {
    type?: ApexChart['type'];
    series?: ApexAxisChartSeries | ApexNonAxisChartSeries;
    options?: ApexCharts.ApexOptions;
    width?: string | number;
    height?: string | number;
    className?: string;
    dir?: string;
}

/**
 * A drop-in replacement for the `react-apexcharts` component.
 * Uses vanilla `apexcharts` (ESM-compatible) directly via useRef+useEffect,
 * bypassing the CJS interop issue with react-apexcharts@1.4.1 in Vite 8 + React 19.
 */
const ReactApexChart: React.FC<ReactApexChartProps> = ({
    type = 'line',
    series,
    options = {},
    width = '100%',
    height = 'auto',
    className,
    dir,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<ApexCharts | null>(null);

    // Mount the chart
    useEffect(() => {
        if (!containerRef.current) return;

        const chartOptions: ApexCharts.ApexOptions = {
            ...options,
            chart: {
                ...options?.chart,
                type,
                width,
                height,
            },
            series,
        };

        chartRef.current = new ApexCharts(containerRef.current, chartOptions);
        chartRef.current.render();

        return () => {
            chartRef.current?.destroy();
            chartRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update series when it changes
    useEffect(() => {
        if (chartRef.current && series !== undefined) {
            chartRef.current.updateSeries(series as any, true);
        }
    }, [series]);

    // Update options when they change
    useEffect(() => {
        if (chartRef.current) {
            chartRef.current.updateOptions({
                ...options,
                chart: {
                    ...options?.chart,
                    type,
                    width,
                    height,
                },
            }, false, true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options, type, width, height]);

    return <div ref={containerRef} className={className} dir={dir} />;
};

export default ReactApexChart;

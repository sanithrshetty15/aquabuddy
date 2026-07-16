import React, { useEffect, useRef } from 'react';
import { SensorReading } from '../../types/sensor.types';

interface WaterCollectionChartProps {
  data: SensorReading[];
}

export const WaterCollectionChart: React.FC<WaterCollectionChartProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 200 * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = 200;

    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) {
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No water collection data available', width / 2, height / 2);
      return;
    }

    const sortedData = [...data].reverse();

    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const flows = sortedData.map((d) => d.waterFlow);
    const maxFlow = Math.max(1.0, ...flows);
    const minY = 0;
    const maxY = maxFlow * 1.1;

    const getX = (index: number) => {
      if (sortedData.length <= 1) return paddingLeft;
      return paddingLeft + (index / (sortedData.length - 1)) * chartWidth;
    };

    const getY = (val: number) => {
      const ratio = (val - minY) / (maxY - minY);
      return height - paddingBottom - ratio * chartHeight;
    };

    // Draw Grid Lines & Y-axis Labels
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const yTicks = [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY];
    yTicks.forEach((tick) => {
      const y = getY(tick);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();
      ctx.fillText(`${tick.toFixed(2)}L`, paddingLeft - 8, y);
    });

    // Draw X-axis Labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const xLabelCount = Math.min(5, sortedData.length);
    for (let i = 0; i < xLabelCount; i++) {
      const index = Math.floor((i / (xLabelCount - 1)) * (sortedData.length - 1));
      const item = sortedData[index];
      if (!item) continue;
      const x = getX(index);
      const date = new Date(item.createdAt);
      const label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      ctx.fillText(label, x, height - paddingBottom + 8);
    }

    // Draw Rounded Columns/Bars
    const barWidth = Math.max(4, (chartWidth / sortedData.length) * 0.5);
    const barGrad = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
    barGrad.addColorStop(0, '#00D6FF');
    barGrad.addColorStop(1, '#0066CC');

    sortedData.forEach((item, idx) => {
      const x = getX(idx) - barWidth / 2;
      const y = getY(item.waterFlow);
      const barHeight = height - paddingBottom - y;

      ctx.fillStyle = barGrad;
      ctx.beginPath();
      // Use standard canvas rect or custom roundRect if supported (fully supported in modern browsers)
      if (ctx.roundRect) {
        ctx.roundRect(x, y, barWidth, Math.max(1, barHeight), [2, 2, 0, 0]);
      } else {
        ctx.rect(x, y, barWidth, Math.max(1, barHeight));
      }
      ctx.fill();
    });
  }, [data]);

  return (
    <div className="w-full h-[200px]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

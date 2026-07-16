import React, { useEffect, useRef } from 'react';
import { SensorReading } from '../../types/sensor.types';

interface TemperatureChartProps {
  data: SensorReading[];
}

export const TemperatureChart: React.FC<TemperatureChartProps> = ({ data }) => {
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
      ctx.fillText('No temperature data available', width / 2, height / 2);
      return;
    }

    const sortedData = [...data].reverse();

    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const temperatures = sortedData.map((d) => d.temperature);
    const maxTemp = Math.max(40, ...temperatures);
    const minTemp = Math.min(0, ...temperatures);
    const range = maxTemp - minTemp;
    const minY = minTemp - range * 0.1;
    const maxY = maxTemp + range * 0.1;

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

    const step = (maxY - minY) / 4;
    const yTicks = Array.from({ length: 5 }, (_, i) => minY + step * i);
    yTicks.forEach((tick) => {
      const y = getY(tick);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();
      ctx.fillText(`${tick.toFixed(0)}°C`, paddingLeft - 8, y);
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

    // Draw Line
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(sortedData[0].temperature));
    for (let i = 1; i < sortedData.length; i++) {
      ctx.lineTo(getX(i), getY(sortedData[i].temperature));
    }

    const fillGrad = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
    fillGrad.addColorStop(0, 'rgba(255, 87, 34, 0.2)');
    fillGrad.addColorStop(1, 'rgba(255, 87, 34, 0.0)');

    ctx.strokeStyle = '#FF5722';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(255, 87, 34, 0.4)';
    ctx.shadowBlur = 6;
    ctx.stroke();

    ctx.shadowBlur = 0;

    ctx.lineTo(getX(sortedData.length - 1), height - paddingBottom);
    ctx.lineTo(getX(0), height - paddingBottom);
    ctx.closePath();
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Draw points
    sortedData.forEach((item, idx) => {
      const x = getX(idx);
      const y = getY(item.temperature);

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#FF5722';
      ctx.fill();
      ctx.strokeStyle = '#050505';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }, [data]);

  return (
    <div className="w-full h-[200px]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

import React, { useEffect, useRef } from 'react';
import { SensorReading } from '../../types/sensor.types';

interface HumidityChartProps {
  data: SensorReading[];
}

export const HumidityChart: React.FC<HumidityChartProps> = ({ data }) => {
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
      ctx.fillText('No humidity data available', width / 2, height / 2);
      return;
    }

    // Sort chronologically (oldest to newest)
    const sortedData = [...data].reverse();

    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const minY = 0;
    const maxY = 100;

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

    const yTicks = [0, 25, 50, 75, 100];
    yTicks.forEach((tick) => {
      const y = getY(tick);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();
      ctx.fillText(`${tick}%`, paddingLeft - 8, y);
    });

    // Draw X-axis Labels (times)
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

    // Draw Glow Line
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(sortedData[0].humidity));
    for (let i = 1; i < sortedData.length; i++) {
      ctx.lineTo(getX(i), getY(sortedData[i].humidity));
    }

    const fillGrad = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
    fillGrad.addColorStop(0, 'rgba(0, 214, 255, 0.2)');
    fillGrad.addColorStop(1, 'rgba(0, 214, 255, 0.0)');

    ctx.strokeStyle = '#00D6FF';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(0, 214, 255, 0.4)';
    ctx.shadowBlur = 6;
    ctx.stroke();

    // Reset shadow for filling path
    ctx.shadowBlur = 0;

    ctx.lineTo(getX(sortedData.length - 1), height - paddingBottom);
    ctx.lineTo(getX(0), height - paddingBottom);
    ctx.closePath();
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Draw point nodes
    sortedData.forEach((item, idx) => {
      const x = getX(idx);
      const y = getY(item.humidity);

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#00D6FF';
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

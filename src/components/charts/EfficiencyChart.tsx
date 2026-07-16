import React, { useEffect, useRef } from 'react';
import { SensorReading } from '../../types/sensor.types';

interface EfficiencyChartProps {
  reading: SensorReading | null;
}

export const EfficiencyChart: React.FC<EfficiencyChartProps> = ({ reading }) => {
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

    let efficiency = 75; // Default base efficiency
    if (reading && reading.powerConsumption > 0) {
      const ratio = reading.waterFlow / reading.powerConsumption;
      // Normalizing ratio (1.5 -> 50%, 3.0 -> 100%)
      efficiency = Math.min(100, Math.max(10, (ratio / 3.0) * 100));
    }

    const centerX = width / 2;
    const centerY = height - 25;
    const radius = 65;

    // Draw grey background arc
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
    ctx.stroke();

    // Draw color gradient sweep arc
    const endAngle = Math.PI + (efficiency / 100) * Math.PI;
    const arcGrad = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
    arcGrad.addColorStop(0, '#0066CC');
    arcGrad.addColorStop(0.5, '#00D6FF');
    arcGrad.addColorStop(1, '#00FF66');

    ctx.strokeStyle = arcGrad;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(0, 214, 255, 0.3)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, endAngle);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Draw center indicator pin
    ctx.fillStyle = '#050505';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#00D6FF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw pointer needle
    const needleLen = radius - 6;
    const needleX = centerX + Math.cos(endAngle) * needleLen;
    const needleY = centerY + Math.sin(endAngle) * needleLen;

    ctx.strokeStyle = '#00D6FF';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(needleX, needleY);
    ctx.stroke();

    // Draw metrics inside gauge
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${efficiency.toFixed(0)}%`, centerX, centerY - 14);

    ctx.fillStyle = '#6b7280';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Conversion Ratio', centerX, centerY - 1);
  }, [reading]);

  return (
    <div className="w-full h-[200px]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

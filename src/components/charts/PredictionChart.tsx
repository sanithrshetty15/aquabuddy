import React, { useEffect, useRef } from 'react';
import { SensorReading } from '../../types/sensor.types';

interface PredictionChartProps {
  historicalData: SensorReading[];
  predictions: any[];
}

export const PredictionChart: React.FC<PredictionChartProps> = ({
  historicalData,
  predictions,
}) => {
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

    if (historicalData.length === 0 && predictions.length === 0) {
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No forecasting data available', width / 2, height / 2);
      return;
    }

    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const histPoints = [...historicalData].reverse();
    const predPoints = [...predictions].sort(
      (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
    );

    const histVals = histPoints.map((d) => d.waterFlow);
    const predVals = predPoints.map((p) => p.value);
    const maxVal = Math.max(2.0, ...histVals, ...predVals);

    const minY = 0;
    const maxY = maxVal * 1.1;

    const totalPointsCount = histPoints.length + predPoints.length;

    const getX = (index: number) => {
      if (totalPointsCount <= 1) return paddingLeft;
      return paddingLeft + (index / (totalPointsCount - 1)) * chartWidth;
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
      ctx.fillText(`${tick.toFixed(1)}L`, paddingLeft - 8, y);
    });

    // Draw X-axis Labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    if (histPoints.length > 0) {
      ctx.fillText('Historical', getX(Math.floor(histPoints.length / 2)), height - paddingBottom + 8);
    }

    if (predPoints.length > 0) {
      ctx.fillText(
        'Forecast',
        getX(histPoints.length + Math.floor(predPoints.length / 2)),
        height - paddingBottom + 8
      );
    }

    // Historical Segment (solid cyan/blue)
    if (histPoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(getX(0), getY(histPoints[0].waterFlow));
      for (let i = 1; i < histPoints.length; i++) {
        ctx.lineTo(getX(i), getY(histPoints[i].waterFlow));
      }
      ctx.strokeStyle = '#00D6FF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Nodes
      histPoints.forEach((d, i) => {
        ctx.beginPath();
        ctx.arc(getX(i), getY(d.waterFlow), 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#00D6FF';
        ctx.fill();
      });
    }

    // Forecast Segment (dashed amber)
    if (predPoints.length > 0) {
      // Shaded Confidence Band
      ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
      ctx.beginPath();

      if (histPoints.length > 0) {
        ctx.moveTo(getX(histPoints.length - 1), getY(histPoints[histPoints.length - 1].waterFlow));
      } else {
        ctx.moveTo(getX(0), getY(predPoints[0].value));
      }

      // Upper band
      predPoints.forEach((p, idx) => {
        const delta = p.value * (1 - p.confidence) * 0.4;
        ctx.lineTo(getX(histPoints.length + idx), getY(p.value + delta));
      });

      // Lower band (traverse back)
      for (let idx = predPoints.length - 1; idx >= 0; idx--) {
        const p = predPoints[idx];
        const delta = p.value * (1 - p.confidence) * 0.4;
        ctx.lineTo(getX(histPoints.length + idx), getY(Math.max(0, p.value - delta)));
      }

      ctx.closePath();
      ctx.fill();

      // Dashed Line
      ctx.beginPath();
      if (histPoints.length > 0) {
        ctx.moveTo(getX(histPoints.length - 1), getY(histPoints[histPoints.length - 1].waterFlow));
      } else {
        ctx.moveTo(getX(0), getY(predPoints[0].value));
      }

      predPoints.forEach((p, idx) => {
        ctx.lineTo(getX(histPoints.length + idx), getY(p.value));
      });

      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Prediction nodes
      predPoints.forEach((p, idx) => {
        const x = getX(histPoints.length + idx);
        const y = getY(p.value);

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#F59E0B';
        ctx.fill();
        ctx.strokeStyle = '#050505';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }
  }, [historicalData, predictions]);

  return (
    <div className="w-full h-[200px]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

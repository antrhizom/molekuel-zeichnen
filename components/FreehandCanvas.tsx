'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import type { FreehandTool } from './Toolbar';

export interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  type?: 'freehand' | 'electron-pair' | 'single-bond' | 'double-bond' | 'triple-bond';
}

interface FreehandCanvasProps {
  penColor: string;
  penSize: number;
  tool: FreehandTool;
  strokes: Stroke[];
  onStrokesChange: (strokes: Stroke[]) => void;
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  const { points, color, width, type } = stroke;
  if (points.length === 0) return;

  if (type === 'electron-pair') {
    // Draw two dots (electron pair)
    const p = points[0];
    const dotRadius = 3;
    const gap = 6;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.x - gap, p.y, dotRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x + gap, p.y, dotRadius, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (type === 'single-bond' && points.length >= 2) {
    const [start, end] = [points[0], points[points.length - 1]];
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    return;
  }

  if (type === 'double-bond' && points.length >= 2) {
    const [start, end] = [points[0], points[points.length - 1]];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len * 3; // perpendicular offset
    const ny = dx / len * 3;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(start.x + nx, start.y + ny);
    ctx.lineTo(end.x + nx, end.y + ny);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(start.x - nx, start.y - ny);
    ctx.lineTo(end.x - nx, end.y - ny);
    ctx.stroke();
    return;
  }

  if (type === 'triple-bond' && points.length >= 2) {
    const [start, end] = [points[0], points[points.length - 1]];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len * 4;
    const ny = dx / len * 4;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    // Center line
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    // Top line
    ctx.beginPath();
    ctx.moveTo(start.x + nx, start.y + ny);
    ctx.lineTo(end.x + nx, end.y + ny);
    ctx.stroke();
    // Bottom line
    ctx.beginPath();
    ctx.moveTo(start.x - nx, start.y - ny);
    ctx.lineTo(end.x - nx, end.y - ny);
    ctx.stroke();
    return;
  }

  // Default freehand stroke
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (points.length === 1) {
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, width / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  if (points.length === 2) {
    ctx.lineTo(points[1].x, points[1].y);
  } else {
    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
  }
  ctx.stroke();
}

export default function FreehandCanvas({
  penColor,
  penSize,
  tool,
  strokes,
  onStrokesChange,
}: FreehandCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const currentStrokeRef = useRef<{ x: number; y: number }[]>([]);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const isBondTool = tool === 'single-bond' || tool === 'double-bond' || tool === 'triple-bond';

  // Track container size with ResizeObserver
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setSize({ w: Math.round(width), h: Math.round(height) });
        }
      }
    });
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.w === 0 || size.h === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const targetW = Math.round(size.w * dpr);
    const targetH = Math.round(size.h * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size.w, size.h);

    // Light grid
    ctx.strokeStyle = '#F0F0F0';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < size.w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size.h);
      ctx.stroke();
    }
    for (let y = 0; y < size.h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size.w, y);
      ctx.stroke();
    }

    // Draw saved strokes
    for (const stroke of strokes) {
      drawStroke(ctx, stroke);
    }

    // Draw current in-progress stroke
    if (currentStrokeRef.current.length > 0) {
      if (isBondTool) {
        // Preview bond as dashed line
        const pts = currentStrokeRef.current;
        if (pts.length >= 2) {
          const preview: Stroke = {
            points: [pts[0], pts[pts.length - 1]],
            color: '#222222',
            width: 2,
            type: tool as Stroke['type'],
          };
          drawStroke(ctx, preview);
        }
      } else if (tool === 'pen' || tool === 'eraser') {
        const c = tool === 'eraser' ? '#FFFFFF' : penColor;
        const w = tool === 'eraser' ? penSize * 3 : penSize;
        drawStroke(ctx, { points: currentStrokeRef.current, color: c, width: w, type: 'freehand' });
      }
    }
  }, [strokes, penColor, penSize, tool, size, isBondTool]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getCoords(e);

    // Electron pair: single click placement
    if (tool === 'electron-pair') {
      const newStroke: Stroke = {
        points: [pos],
        color: '#222222',
        width: 3,
        type: 'electron-pair',
      };
      onStrokesChange([...strokes, newStroke]);
      return;
    }

    setIsDrawing(true);
    currentStrokeRef.current = [pos];
    lastPointRef.current = pos;

    // For pen/eraser, draw the initial dot
    if (tool === 'pen' || tool === 'eraser') {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          const c = tool === 'eraser' ? '#FFFFFF' : penColor;
          const w = tool === 'eraser' ? penSize * 3 : penSize;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, w / 2, 0, Math.PI * 2);
          ctx.fillStyle = c;
          ctx.fill();
        }
      }
    }
  };

  const continueDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const pos = getCoords(e);

    const last = lastPointRef.current;
    if (last) {
      const dist = Math.sqrt((pos.x - last.x) ** 2 + (pos.y - last.y) ** 2);
      if (dist < 2) return;
    }

    currentStrokeRef.current.push(pos);
    lastPointRef.current = pos;

    if (isBondTool) {
      // Redraw everything to show updated bond preview
      redraw();
      return;
    }

    // For pen/eraser, draw incrementally
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const c = tool === 'eraser' ? '#FFFFFF' : penColor;
        const w = tool === 'eraser' ? penSize * 3 : penSize;
        const pts = currentStrokeRef.current;

        ctx.strokeStyle = c;
        ctx.lineWidth = w;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (pts.length >= 2) {
          const prev = pts[pts.length - 2];
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
        }
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStrokeRef.current.length > 0) {
      if (isBondTool) {
        const pts = currentStrokeRef.current;
        if (pts.length >= 2) {
          const newStroke: Stroke = {
            points: [pts[0], pts[pts.length - 1]],
            color: '#222222',
            width: 2,
            type: tool as Stroke['type'],
          };
          onStrokesChange([...strokes, newStroke]);
        }
      } else {
        const color = tool === 'eraser' ? '#FFFFFF' : penColor;
        const width = tool === 'eraser' ? penSize * 3 : penSize;
        const newStroke: Stroke = {
          points: [...currentStrokeRef.current],
          color,
          width,
          type: 'freehand',
        };
        onStrokesChange([...strokes, newStroke]);
      }
    }
    currentStrokeRef.current = [];
    lastPointRef.current = null;
  };

  return (
    <div ref={wrapperRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        width={size.w}
        height={size.h}
        className="absolute inset-0 rounded-xl touch-none"
        style={{ cursor: tool === 'electron-pair' ? 'cell' : 'crosshair', width: size.w, height: size.h }}
        onMouseDown={startDrawing}
        onMouseMove={continueDrawing}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={continueDrawing}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
      />
    </div>
  );
}

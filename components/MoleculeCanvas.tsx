'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

export interface Atom {
  id: string;
  symbol: string;
  x: number;
  y: number;
  color: string;
}

export interface Bond {
  id: string;
  from: string;
  to: string;
  type: 1 | 2 | 3;
}

const ATOM_RADIUS = 22;

const ATOM_COLORS: Record<string, string> = {
  C: '#333333',
  H: '#FFFFFF',
  O: '#FF0000',
  N: '#3333FF',
  S: '#FFCC00',
  P: '#FF8800',
  Cl: '#00CC00',
  Br: '#882200',
};

interface MoleculeCanvasProps {
  selectedAtom: string | null;
  selectedTool: 'atom' | 'bond' | 'eraser' | 'move';
  bondType: 1 | 2 | 3;
  atoms: Atom[];
  bonds: Bond[];
  onAtomsChange: (atoms: Atom[]) => void;
  onBondsChange: (bonds: Bond[]) => void;
}

export default function MoleculeCanvas({
  selectedAtom,
  selectedTool,
  bondType,
  atoms,
  bonds,
  onAtomsChange,
  onBondsChange,
}: MoleculeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [bondStart, setBondStart] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const getAtomAt = useCallback(
    (x: number, y: number): Atom | null => {
      for (let i = atoms.length - 1; i >= 0; i--) {
        const a = atoms[i];
        const dx = a.x - x;
        const dy = a.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < ATOM_RADIUS + 5) {
          return a;
        }
      }
      return null;
    },
    [atoms]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Grid
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < rect.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }
    for (let y = 0; y < rect.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    // Draw bonds
    bonds.forEach((bond) => {
      const fromAtom = atoms.find((a) => a.id === bond.from);
      const toAtom = atoms.find((a) => a.id === bond.to);
      if (!fromAtom || !toAtom) return;

      ctx.strokeStyle = '#555';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      const dx = toAtom.x - fromAtom.x;
      const dy = toAtom.y - fromAtom.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = -dy / len;
      const ny = dx / len;

      if (bond.type === 1) {
        ctx.beginPath();
        ctx.moveTo(fromAtom.x, fromAtom.y);
        ctx.lineTo(toAtom.x, toAtom.y);
        ctx.stroke();
      } else if (bond.type === 2) {
        const offset = 4;
        ctx.beginPath();
        ctx.moveTo(fromAtom.x + nx * offset, fromAtom.y + ny * offset);
        ctx.lineTo(toAtom.x + nx * offset, toAtom.y + ny * offset);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(fromAtom.x - nx * offset, fromAtom.y - ny * offset);
        ctx.lineTo(toAtom.x - nx * offset, toAtom.y - ny * offset);
        ctx.stroke();
      } else if (bond.type === 3) {
        const offset = 5;
        ctx.beginPath();
        ctx.moveTo(fromAtom.x, fromAtom.y);
        ctx.lineTo(toAtom.x, toAtom.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(fromAtom.x + nx * offset, fromAtom.y + ny * offset);
        ctx.lineTo(toAtom.x + nx * offset, toAtom.y + ny * offset);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(fromAtom.x - nx * offset, fromAtom.y - ny * offset);
        ctx.lineTo(toAtom.x - nx * offset, toAtom.y - ny * offset);
        ctx.stroke();
      }
    });

    // Draw bond preview
    if (bondStart && mousePos && selectedTool === 'bond') {
      const fromAtom = atoms.find((a) => a.id === bondStart);
      if (fromAtom) {
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(fromAtom.x, fromAtom.y);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw atoms
    atoms.forEach((atom) => {
      // Circle background
      ctx.beginPath();
      ctx.arc(atom.x, atom.y, ATOM_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = atom.color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Symbol
      ctx.fillStyle = atom.color === '#FFFFFF' ? '#666' : atom.color;
      ctx.font = 'bold 16px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(atom.symbol, atom.x, atom.y);
    });
  }, [atoms, bonds, bondStart, mousePos, selectedTool]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasCoords(e);
    const clickedAtom = getAtomAt(pos.x, pos.y);

    if (selectedTool === 'atom' && selectedAtom) {
      if (!clickedAtom) {
        const newAtom: Atom = {
          id: `atom_${Date.now()}`,
          symbol: selectedAtom,
          x: pos.x,
          y: pos.y,
          color: ATOM_COLORS[selectedAtom] || '#333',
        };
        onAtomsChange([...atoms, newAtom]);
      }
    } else if (selectedTool === 'bond') {
      if (clickedAtom) {
        setBondStart(clickedAtom.id);
      }
    } else if (selectedTool === 'eraser') {
      if (clickedAtom) {
        onBondsChange(bonds.filter((b) => b.from !== clickedAtom.id && b.to !== clickedAtom.id));
        onAtomsChange(atoms.filter((a) => a.id !== clickedAtom.id));
      }
    } else if (selectedTool === 'move') {
      if (clickedAtom) {
        setDragging(clickedAtom.id);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasCoords(e);

    if (selectedTool === 'bond' && bondStart) {
      setMousePos(pos);
    }

    if (dragging) {
      onAtomsChange(
        atoms.map((a) => (a.id === dragging ? { ...a, x: pos.x, y: pos.y } : a))
      );
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasCoords(e);

    if (selectedTool === 'bond' && bondStart) {
      const targetAtom = getAtomAt(pos.x, pos.y);
      if (targetAtom && targetAtom.id !== bondStart) {
        const exists = bonds.find(
          (b) =>
            (b.from === bondStart && b.to === targetAtom.id) ||
            (b.from === targetAtom.id && b.to === bondStart)
        );
        if (!exists) {
          const newBond: Bond = {
            id: `bond_${Date.now()}`,
            from: bondStart,
            to: targetAtom.id,
            type: bondType,
          };
          onBondsChange([...bonds, newBond]);
        }
      }
      setBondStart(null);
      setMousePos(null);
    }

    setDragging(null);
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair rounded-xl"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setDragging(null);
        setBondStart(null);
        setMousePos(null);
      }}
    />
  );
}

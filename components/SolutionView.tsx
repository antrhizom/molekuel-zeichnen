'use client';

import { useRef, useEffect, useState } from 'react';
import { NotationStyle, NOTATION_LABELS } from '@/lib/exercises';

interface SolutionViewProps {
  smiles: string;
  notationStyle: NotationStyle;
  moleculeName: string;
}

export default function SolutionView({ smiles, notationStyle, moleculeName }: SolutionViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!expanded || !canvasRef.current) return;

    let cancelled = false;
    setLoaded(false);
    setError(null);

    async function renderMolecule() {
      try {
        const SmilesDrawer = await import('smiles-drawer');
        if (cancelled) return;

        const mod = SmilesDrawer.default || SmilesDrawer;

        const drawer = new mod.Drawer({
          width: 400,
          height: 300,
          bondThickness: 1.5,
          bondLength: 25,
          padding: 30,
          explicitHydrogens: notationStyle === 'lewis' || notationStyle === 'struktur',
          terminalCarbons: notationStyle !== 'skelett',
        });

        mod.parse(
          smiles,
          (tree: import('smiles-drawer').ParseTree) => {
            if (cancelled || !canvasRef.current) return;
            drawer.draw(tree, canvasRef.current, 'light', false);
            setLoaded(true);
          },
          (err: Error) => {
            if (!cancelled) setError(`SMILES konnte nicht gelesen werden: ${err.message}`);
          }
        );
      } catch {
        if (!cancelled) setError('Lösung konnte nicht geladen werden.');
      }
    }

    renderMolecule();
    return () => {
      cancelled = true;
    };
  }, [expanded, smiles, notationStyle]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
      >
        <span>Lösung anzeigen ({NOTATION_LABELS[notationStyle]})</span>
        <span
          className={`transform transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>
      {expanded && (
        <div className="p-4 flex flex-col items-center gap-2 bg-white">
          {error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <>
              <canvas
                ref={canvasRef}
                width={400}
                height={300}
                className="border border-gray-100 rounded-lg bg-white"
              />
              <p className="text-xs text-gray-500 font-medium">
                {moleculeName} — {NOTATION_LABELS[notationStyle]}
              </p>
              {!loaded && (
                <p className="text-xs text-gray-400 animate-pulse">Wird geladen...</p>
              )}
            </>
          )}
          <p className="text-xs text-gray-400 italic mt-1 text-center max-w-sm">
            Hinweis: Die generierte Darstellung ist eine Näherung.
            {notationStyle === 'lewis' &&
              ' Freie Elektronenpaare werden möglicherweise nicht vollständig angezeigt.'}
            {notationStyle === 'keilstrich' &&
              ' Die 3D-Darstellung wird vereinfacht gezeigt.'}
          </p>
        </div>
      )}
    </div>
  );
}

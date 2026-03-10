'use client';

import { useEffect, useState, useRef } from 'react';
import { NotationStyle, NOTATION_LABELS } from '@/lib/exercises';

interface SolutionViewProps {
  smiles: string;
  notationStyle: NotationStyle;
  moleculeName: string;
}

export default function SolutionView({ smiles, notationStyle, moleculeName }: SolutionViewProps) {
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded || !containerRef.current) return;

    let cancelled = false;
    setLoaded(false);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        if (!containerRef.current || cancelled) return;

        const importedModule = await import('smiles-drawer');
        if (cancelled) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SD: any = importedModule.default ?? importedModule;
        const SvgDrawerClass = SD.SvgDrawer ?? SD.default?.SvgDrawer;
        const parseFn = SD.parse ?? SD.default?.parse;

        if (!SvgDrawerClass || !parseFn) {
          setError('smiles-drawer Modul konnte nicht geladen werden.');
          return;
        }

        const svgDrawer = new SvgDrawerClass({
          width: 400,
          height: 300,
          bondThickness: 1.5,
          bondLength: 25,
          padding: 30,
          explicitHydrogens: notationStyle === 'lewis' || notationStyle === 'struktur',
          terminalCarbons: notationStyle !== 'skelett',
        });

        parseFn(
          smiles,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (tree: any) => {
            if (cancelled || !containerRef.current) return;
            try {
              // Create an SVG element for SvgDrawer
              const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
              svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
              svg.setAttributeNS(null, 'width', '400');
              svg.setAttributeNS(null, 'height', '300');

              svgDrawer.draw(tree, svg, 'light');

              // Clear previous content and insert SVG
              const svgContainer = containerRef.current.querySelector('.svg-target');
              if (svgContainer) {
                svgContainer.innerHTML = '';
                svgContainer.appendChild(svg);
              }
              setLoaded(true);
            } catch (drawErr: unknown) {
              const msg = drawErr instanceof Error ? drawErr.message : 'Zeichenfehler';
              if (!cancelled) setError(`Darstellung fehlgeschlagen: ${msg}`);
            }
          },
          (err: Error) => {
            if (!cancelled) setError(`SMILES konnte nicht gelesen werden: ${err.message}`);
          }
        );
      } catch {
        if (!cancelled) setError('Lösung konnte nicht geladen werden.');
      }
    }, 50);

    return () => {
      cancelled = true;
      clearTimeout(timer);
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
        <div ref={containerRef} className="p-4 flex flex-col items-center gap-2 bg-white">
          {error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <>
              <div
                className="svg-target border border-gray-100 rounded-lg bg-white flex items-center justify-center"
                style={{ width: 400, height: 300 }}
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

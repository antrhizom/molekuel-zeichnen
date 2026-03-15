'use client';

import { useState, useEffect, useCallback } from 'react';

interface TutorialStep {
  target: string; // data-tutorial attribute value
  title: string;
  desc: string;
  tip?: string;
  position: 'above' | 'below';
}

const STEPS: TutorialStep[] = [
  {
    target: 'atoms',
    title: '1. Atome platzieren',
    desc: 'Wähle ein Element und klicke auf die Zeichenfläche, um es zu platzieren.',
    tip: 'Tipp: Beginne mit dem Zentralatom (z.B. C oder O) und arbeite dich nach aussen.',
    position: 'above',
  },
  {
    target: 'bonds',
    title: '2. Bindungen ziehen',
    desc: 'Wähle den Bindungstyp und ziehe mit der Maus von einem Atom zum anderen.',
    tip: 'Tipp: — = Einfachbindung, = = Doppelbindung, ≡ = Dreifachbindung',
    position: 'above',
  },
  {
    target: 'electron-pair',
    title: '3. Elektronenpaare',
    desc: 'Klicke auf ein Atom, um ein freies Elektronenpaar zu setzen. Die Richtung folgt der Mausposition.',
    tip: 'Tipp: Bei Lewis-Schreibweise müssen freie Elektronenpaare gezeigt werden!',
    position: 'above',
  },
  {
    target: 'mode-toggle',
    title: '4. Freihand ergänzen',
    desc: 'Wechsle zu «Freihand», um mit dem Stift Beschriftungen oder Details zu ergänzen.',
    tip: 'Tipp: Du kannst jederzeit zwischen den Modi wechseln.',
    position: 'above',
  },
  {
    target: 'canvas',
    title: '5. Zeichenfläche',
    desc: 'Hier zeichnest du dein Molekül. Klicke um Atome zu setzen, ziehe um Bindungen zu erstellen.',
    tip: 'Tipp: Wenn du fertig bist, klicke auf «Zeichnung abgeben» unten.',
    position: 'below',
  },
];

interface TutorialProps {
  onClose: () => void;
}

export default function Tutorial({ onClose }: TutorialProps) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const updateRect = useCallback(() => {
    const target = STEPS[step].target;
    const el = document.querySelector(`[data-tutorial="${target}"]`);
    if (el) {
      setRect(el.getBoundingClientRect());
    } else {
      setRect(null);
    }
  }, [step]);

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [updateRect]);

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  // Spotlight cutout dimensions
  const pad = 8;
  const spotX = rect ? rect.left - pad : 0;
  const spotY = rect ? rect.top - pad : 0;
  const spotW = rect ? rect.width + pad * 2 : 0;
  const spotH = rect ? rect.height + pad * 2 : 0;

  // Tooltip position
  const tooltipStyle: React.CSSProperties = {};
  if (rect) {
    const centerX = rect.left + rect.width / 2;
    const tooltipWidth = 300;

    // Horizontal: center on target, but clamp to viewport
    let left = centerX - tooltipWidth / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - tooltipWidth - 12));
    tooltipStyle.left = left;
    tooltipStyle.width = tooltipWidth;

    if (currentStep.position === 'above') {
      tooltipStyle.bottom = window.innerHeight - rect.top + pad + 8;
    } else {
      tooltipStyle.top = rect.bottom + pad + 8;
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Dark overlay with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={spotX}
                y={spotY}
                width={spotW}
                height={spotH}
                rx={10}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.5)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Spotlight border glow */}
      {rect && (
        <div
          className="absolute rounded-xl ring-2 ring-blue-400 ring-offset-2 animate-pulse"
          style={{
            left: spotX,
            top: spotY,
            width: spotW,
            height: spotH,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Clickable overlay to catch clicks outside */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Tooltip */}
      {rect && (
        <div
          className="absolute bg-white rounded-xl shadow-2xl border border-gray-200 p-4 space-y-3 z-10"
          style={tooltipStyle}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-6 bg-blue-600' : i < step ? 'w-3 bg-blue-300' : 'w-3 bg-gray-200'
                }`}
              />
            ))}
          </div>

          <h4 className="text-sm font-bold text-gray-900">{currentStep.title}</h4>
          <p className="text-xs text-gray-600 leading-relaxed">{currentStep.desc}</p>
          {currentStep.tip && (
            <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2 leading-relaxed">
              {currentStep.tip}
            </p>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onClose}
              className="text-xs text-gray-400 hover:text-gray-600 transition-all"
            >
              Überspringen
            </button>
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Zurück
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
              >
                {isLast ? 'Los geht\u2019s!' : 'Weiter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

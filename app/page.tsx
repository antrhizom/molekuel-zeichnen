'use client';

import { useState, useRef, useCallback } from 'react';
import MoleculeCanvas, { Atom, Bond } from '@/components/MoleculeCanvas';
import FreehandCanvas, { Stroke } from '@/components/FreehandCanvas';
import Toolbar, { DrawingMode } from '@/components/Toolbar';
import ExercisePanel from '@/components/ExercisePanel';
import FeedbackPanel from '@/components/FeedbackPanel';
import { exercises, Exercise } from '@/lib/exercises';

export default function Home() {
  // Mode
  const [mode, setMode] = useState<DrawingMode>('freehand');

  // Structured mode state
  const [selectedTool, setSelectedTool] = useState<'atom' | 'bond' | 'eraser' | 'move'>('atom');
  const [selectedAtom, setSelectedAtom] = useState<string | null>('C');
  const [bondType, setBondType] = useState<1 | 2 | 3>(1);
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [structHistory, setStructHistory] = useState<{ atoms: Atom[]; bonds: Bond[] }[]>([]);

  // Freehand mode state
  const [penColor, setPenColor] = useState('#222222');
  const [penSize, setPenSize] = useState(4);
  const [freehandTool, setFreehandTool] = useState<'pen' | 'eraser'>('pen');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [strokeHistory, setStrokeHistory] = useState<Stroke[][]>([]);

  // Shared
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Structured mode handlers
  const saveStructHistory = useCallback(() => {
    setStructHistory((prev) => [...prev.slice(-20), { atoms: [...atoms], bonds: [...bonds] }]);
  }, [atoms, bonds]);

  const handleAtomsChange = useCallback(
    (newAtoms: Atom[]) => {
      saveStructHistory();
      setAtoms(newAtoms);
    },
    [saveStructHistory]
  );

  const handleBondsChange = useCallback(
    (newBonds: Bond[]) => {
      saveStructHistory();
      setBonds(newBonds);
    },
    [saveStructHistory]
  );

  // Freehand handlers
  const handleStrokesChange = useCallback(
    (newStrokes: Stroke[]) => {
      setStrokeHistory((prev) => [...prev.slice(-30), [...strokes]]);
      setStrokes(newStrokes);
    },
    [strokes]
  );

  const handleUndo = () => {
    if (mode === 'structured') {
      if (structHistory.length === 0) return;
      const last = structHistory[structHistory.length - 1];
      setAtoms(last.atoms);
      setBonds(last.bonds);
      setStructHistory((prev) => prev.slice(0, -1));
    } else {
      if (strokeHistory.length === 0) return;
      const last = strokeHistory[strokeHistory.length - 1];
      setStrokes(last);
      setStrokeHistory((prev) => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (mode === 'structured') {
      saveStructHistory();
      setAtoms([]);
      setBonds([]);
    } else {
      setStrokeHistory((prev) => [...prev.slice(-30), [...strokes]]);
      setStrokes([]);
    }
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowHints(false);
    setFeedback(null);
  };

  const getCanvasImage = (): string | null => {
    const container = canvasContainerRef.current;
    if (!container) return null;
    const canvas = container.querySelector('canvas');
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  };

  const hasContent = mode === 'structured' ? atoms.length > 0 : strokes.length > 0;

  const handleAnalyze = async () => {
    const image = getCanvasImage();
    if (!image) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image,
          exerciseName: selectedExercise?.name || null,
          exerciseFormula: selectedExercise?.formula || null,
          exerciseDescription: selectedExercise?.description || null,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setFeedback(`Fehler: ${data.error}`);
      } else {
        setFeedback(data.feedback);
      }
    } catch {
      setFeedback('Verbindungsfehler. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <header className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg">
            &#9879;
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Molekül-Zeichner</h1>
            <p className="text-sm text-gray-500">Interaktive Lernumgebung mit KI-Feedback</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        {/* Sidebar */}
        <div className="space-y-4 order-2 lg:order-1">
          <Toolbar
            mode={mode}
            onModeChange={setMode}
            selectedTool={selectedTool}
            selectedAtom={selectedAtom}
            bondType={bondType}
            onToolChange={setSelectedTool}
            onAtomChange={(atom) => {
              setSelectedAtom(atom);
              setSelectedTool('atom');
            }}
            onBondTypeChange={(type) => {
              setBondType(type);
              setSelectedTool('bond');
            }}
            penColor={penColor}
            penSize={penSize}
            freehandTool={freehandTool}
            onPenColorChange={setPenColor}
            onPenSizeChange={setPenSize}
            onFreehandToolChange={setFreehandTool}
            onClear={handleClear}
            onUndo={handleUndo}
          />

          <ExercisePanel
            exercises={exercises}
            selectedExercise={selectedExercise}
            onSelect={handleExerciseSelect}
            showHints={showHints}
            onToggleHints={() => setShowHints(!showHints)}
          />

          <FeedbackPanel
            feedback={feedback}
            loading={loading}
            onAnalyze={handleAnalyze}
            hasAtoms={hasContent}
          />
        </div>

        {/* Canvas */}
        <div className="order-1 lg:order-2">
          <div
            ref={canvasContainerRef}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            style={{ height: 'calc(100vh - 140px)', minHeight: '500px' }}
          >
            {mode === 'freehand' ? (
              <FreehandCanvas
                penColor={penColor}
                penSize={penSize}
                tool={freehandTool}
                strokes={strokes}
                onStrokesChange={handleStrokesChange}
              />
            ) : (
              <MoleculeCanvas
                selectedAtom={selectedAtom}
                selectedTool={selectedTool}
                bondType={bondType}
                atoms={atoms}
                bonds={bonds}
                onAtomsChange={handleAtomsChange}
                onBondsChange={handleBondsChange}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

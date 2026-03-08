'use client';

import { useState, useRef, useCallback } from 'react';
import MoleculeCanvas, { Atom, Bond } from '@/components/MoleculeCanvas';
import Toolbar from '@/components/Toolbar';
import ExercisePanel from '@/components/ExercisePanel';
import FeedbackPanel from '@/components/FeedbackPanel';
import { exercises, Exercise } from '@/lib/exercises';

export default function Home() {
  const [selectedTool, setSelectedTool] = useState<'atom' | 'bond' | 'eraser' | 'move'>('atom');
  const [selectedAtom, setSelectedAtom] = useState<string | null>('C');
  const [bondType, setBondType] = useState<1 | 2 | 3>(1);
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [history, setHistory] = useState<{ atoms: Atom[]; bonds: Bond[] }[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const saveHistory = useCallback(() => {
    setHistory((prev) => [...prev.slice(-20), { atoms: [...atoms], bonds: [...bonds] }]);
  }, [atoms, bonds]);

  const handleAtomsChange = useCallback(
    (newAtoms: Atom[]) => {
      saveHistory();
      setAtoms(newAtoms);
    },
    [saveHistory]
  );

  const handleBondsChange = useCallback(
    (newBonds: Bond[]) => {
      saveHistory();
      setBonds(newBonds);
    },
    [saveHistory]
  );

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setAtoms(last.atoms);
    setBonds(last.bonds);
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    saveHistory();
    setAtoms([]);
    setBonds([]);
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
            hasAtoms={atoms.length > 0}
          />
        </div>

        {/* Canvas */}
        <div className="order-1 lg:order-2">
          <div
            ref={canvasContainerRef}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            style={{ height: 'calc(100vh - 140px)', minHeight: '500px' }}
          >
            <MoleculeCanvas
              selectedAtom={selectedAtom}
              selectedTool={selectedTool}
              bondType={bondType}
              atoms={atoms}
              bonds={bonds}
              onAtomsChange={handleAtomsChange}
              onBondsChange={handleBondsChange}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

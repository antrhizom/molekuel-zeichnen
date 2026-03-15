'use client';

import { useState, useRef, useCallback } from 'react';
import MoleculeCanvas, { Atom, Bond, ElectronPair } from '@/components/MoleculeCanvas';
import FreehandCanvas, { Stroke } from '@/components/FreehandCanvas';
import Toolbar, { DrawingMode, FreehandTool } from '@/components/Toolbar';
import FeedbackPanel from '@/components/FeedbackPanel';
import StartScreen from '@/components/StartScreen';
import MoleculeChoice from '@/components/MoleculeChoice';
import Certificate from '@/components/Certificate';
import Tutorial from '@/components/Tutorial';
import { Exercise, NotationStyle, NOTATION_LABELS } from '@/lib/exercises';
import { GamePhase, RoundResult, pickTwoRandomExercises } from '@/lib/game-utils';

export default function Home() {
  // Game state
  const [phase, setPhase] = useState<GamePhase>('START');
  const [currentRound, setCurrentRound] = useState(1);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [choices, setChoices] = useState<[Exercise, Exercise] | null>(null);
  const [rounds, setRounds] = useState<RoundResult[]>([]);
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [selectedNotation, setSelectedNotation] = useState<NotationStyle>('struktur');

  // Tutorial
  const [showTutorial, setShowTutorial] = useState(true);

  // Drawing mode
  const [mode, setMode] = useState<DrawingMode>('structured');

  // Structured mode state
  const [selectedTool, setSelectedTool] = useState<'atom' | 'bond' | 'eraser' | 'move' | 'electron-pair'>('atom');
  const [selectedAtom, setSelectedAtom] = useState<string | null>('C');
  const [bondType, setBondType] = useState<1 | 2 | 3>(1);
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [electronPairs, setElectronPairs] = useState<ElectronPair[]>([]);
  const [structHistory, setStructHistory] = useState<{ atoms: Atom[]; bonds: Bond[]; electronPairs: ElectronPair[] }[]>([]);

  // Freehand mode state
  const [penColor, setPenColor] = useState('#222222');
  const [penSize, setPenSize] = useState(4);
  const [freehandTool, setFreehandTool] = useState<FreehandTool>('pen');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [strokeHistory, setStrokeHistory] = useState<Stroke[][]>([]);

  // Feedback
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // --- Drawing handlers ---
  const saveStructHistory = useCallback(() => {
    setStructHistory((prev) => [...prev.slice(-20), { atoms: [...atoms], bonds: [...bonds], electronPairs: [...electronPairs] }]);
  }, [atoms, bonds, electronPairs]);

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

  const handleElectronPairsChange = useCallback(
    (newPairs: ElectronPair[]) => {
      saveStructHistory();
      setElectronPairs(newPairs);
    },
    [saveStructHistory]
  );

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
      setElectronPairs(last.electronPairs);
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
      setElectronPairs([]);
    } else {
      setStrokeHistory((prev) => [...prev.slice(-30), [...strokes]]);
      setStrokes([]);
    }
  };

  const resetCanvas = () => {
    setAtoms([]);
    setBonds([]);
    setElectronPairs([]);
    setStrokes([]);
    setStructHistory([]);
    setStrokeHistory([]);
  };

  // --- Game flow ---
  const startGame = () => {
    setRounds([]);
    setUsedIds([]);
    setCurrentRound(1);
    resetCanvas();
    const picks = pickTwoRandomExercises([]);
    setChoices(picks);
    setPhase('CHOOSE');
  };

  const handleChoose = (exercise: Exercise, notation: NotationStyle) => {
    setCurrentExercise(exercise);
    setSelectedNotation(notation);
    setUsedIds((prev) => [...prev, exercise.id]);
    resetCanvas();
    setFeedback(null);
    setScore(null);
    setPhase('DRAW');
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
    if (!image || !currentExercise) return;

    setLoading(true);
    setFeedback(null);
    setScore(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image,
          exerciseName: currentExercise.name,
          exerciseFormula: currentExercise.formula,
          exerciseDescription: currentExercise.description,
          notationStyle: selectedNotation,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setFeedback(`Fehler: ${data.error}`);
        setScore(null);
      } else {
        setFeedback(data.feedback);
        setScore(data.score ?? 5);

        const result: RoundResult = {
          roundNumber: currentRound,
          exercise: currentExercise,
          score: data.score ?? 5,
          feedbackText: data.feedback,
          canvasImage: image,
          notationStyle: selectedNotation,
        };
        setRounds((prev) => [...prev, result]);
        setPhase('FEEDBACK');
      }
    } catch {
      setFeedback('Verbindungsfehler. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextRound = () => {
    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);
    resetCanvas();
    setFeedback(null);
    setScore(null);
    const picks = pickTwoRandomExercises(usedIds);
    setChoices(picks);
    setPhase('CHOOSE');
  };

  const handleEndGame = () => {
    setPhase('CERTIFICATE');
  };

  const handleRestart = () => {
    setPhase('START');
    setRounds([]);
    setUsedIds([]);
    setCurrentRound(1);
    resetCanvas();
    setFeedback(null);
    setScore(null);
  };

  // --- Render ---
  if (phase === 'START') {
    return <StartScreen onStart={startGame} />;
  }

  if (phase === 'CHOOSE' && choices) {
    return <MoleculeChoice roundNumber={currentRound} choices={choices} onSelect={handleChoose} />;
  }

  if (phase === 'CERTIFICATE') {
    return <Certificate rounds={rounds} onRestart={handleRestart} />;
  }

  const showFeedback = phase === 'FEEDBACK' && feedback && score !== null;

  // DRAW and FEEDBACK phases
  return (
    <div className="h-screen flex flex-col p-3 gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm">
            &#9879;
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">
              Runde {currentRound}: {currentExercise?.name}
            </h1>
            <p className="text-xs text-gray-500">
              {currentExercise?.formula} &middot; {currentExercise?.difficulty} &middot; {NOTATION_LABELS[selectedNotation]}
            </p>
          </div>
        </div>
        {currentExercise && (
          <div className="text-xs text-gray-400 max-w-xs text-right hidden sm:block">
            {currentExercise.description}
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className={`flex-1 min-h-0 flex ${showFeedback ? 'gap-3' : ''}`}>
        {/* Canvas - always visible */}
        <div
          ref={canvasContainerRef}
          data-tutorial="canvas"
          className={`relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-0 ${
            showFeedback ? 'flex-1' : 'w-full'
          }`}
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
              electronPairs={electronPairs}
              onAtomsChange={handleAtomsChange}
              onBondsChange={handleBondsChange}
              onElectronPairsChange={handleElectronPairsChange}
            />
          )}
        </div>

        {/* Feedback panel - side by side on desktop */}
        {showFeedback && (
          <div className="w-80 shrink-0 hidden md:block overflow-y-auto">
            <FeedbackPanel
              feedback={feedback}
              score={score}
              loading={loading}
              onAnalyze={handleAnalyze}
              onNextRound={handleNextRound}
              onEndGame={handleEndGame}
              hasContent={hasContent}
            />
          </div>
        )}
      </div>

      {/* Toolbar */}
      {!showFeedback && (
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
      )}

      {/* Feedback panel - mobile version */}
      {showFeedback && (
        <div className="md:hidden">
          <FeedbackPanel
            feedback={feedback}
            score={score}
            loading={loading}
            onAnalyze={handleAnalyze}
            onNextRound={handleNextRound}
            onEndGame={handleEndGame}
            hasContent={hasContent}
          />
        </div>
      )}

      {/* Submit button */}
      {!showFeedback && (
        <FeedbackPanel
          feedback={null}
          score={null}
          loading={loading}
          onAnalyze={handleAnalyze}
          onNextRound={handleNextRound}
          onEndGame={handleEndGame}
          hasContent={hasContent}
        />
      )}

      {/* Interactive tutorial */}
      {showTutorial && phase === 'DRAW' && !showFeedback && atoms.length === 0 && strokes.length === 0 && (
        <Tutorial onClose={() => setShowTutorial(false)} />
      )}
    </div>
  );
}

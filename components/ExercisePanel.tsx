'use client';

import { Exercise } from '@/lib/exercises';

interface ExercisePanelProps {
  exercises: Exercise[];
  selectedExercise: Exercise | null;
  onSelect: (exercise: Exercise) => void;
  showHints: boolean;
  onToggleHints: () => void;
}

const DIFFICULTY_COLORS = {
  leicht: 'bg-green-100 text-green-700',
  mittel: 'bg-yellow-100 text-yellow-700',
  schwer: 'bg-red-100 text-red-700',
};

export default function ExercisePanel({
  exercises,
  selectedExercise,
  onSelect,
  showHints,
  onToggleHints,
}: ExercisePanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Aufgaben
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {exercises.map((ex) => (
          <button
            key={ex.id}
            onClick={() => onSelect(ex)}
            className={`p-3 rounded-lg text-left transition-all border ${
              selectedExercise?.id === ex.id
                ? 'border-blue-300 bg-blue-50 shadow-sm'
                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-gray-800">{ex.name}</span>
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${DIFFICULTY_COLORS[ex.difficulty]}`}
              >
                {ex.difficulty}
              </span>
            </div>
            <span className="text-xs text-gray-500 font-mono">{ex.formula}</span>
          </button>
        ))}
      </div>

      {selectedExercise && (
        <div className="bg-blue-50 rounded-lg p-3 space-y-2">
          <p className="text-sm text-gray-700">{selectedExercise.description}</p>
          <button
            onClick={onToggleHints}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {showHints ? '▾ Tipps ausblenden' : '▸ Tipps anzeigen'}
          </button>
          {showHints && (
            <ul className="text-xs text-gray-600 space-y-1 ml-3">
              {selectedExercise.hints.map((hint, i) => (
                <li key={i} className="list-disc">
                  {hint}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { Exercise } from '@/lib/exercises';

interface MoleculeChoiceProps {
  roundNumber: number;
  choices: [Exercise, Exercise];
  onSelect: (exercise: Exercise) => void;
}

const DIFFICULTY_COLORS = {
  leicht: 'bg-green-100 text-green-700',
  mittel: 'bg-yellow-100 text-yellow-700',
  schwer: 'bg-red-100 text-red-700',
};

export default function MoleculeChoice({ roundNumber, choices, onSelect }: MoleculeChoiceProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">
            Runde {roundNumber}
          </p>
          <h2 className="text-2xl font-bold text-gray-900">
            Wähle ein Molekül
          </h2>
          <p className="text-gray-500">Klicke auf das Molekül, das du zeichnen möchtest.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {choices.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => onSelect(exercise)}
              className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-6 text-left space-y-3 hover:border-blue-400 hover:shadow-md transition-all active:scale-[0.98] group"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                  {exercise.name}
                </h3>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${DIFFICULTY_COLORS[exercise.difficulty]}`}>
                  {exercise.difficulty}
                </span>
              </div>
              <p className="text-2xl font-mono text-gray-700">{exercise.formula}</p>
              <p className="text-sm text-gray-500">{exercise.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

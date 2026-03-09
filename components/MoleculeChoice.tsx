'use client';

import { useState } from 'react';
import { Exercise, NotationStyle, NOTATION_LABELS, NOTATION_DESCRIPTIONS } from '@/lib/exercises';

interface MoleculeChoiceProps {
  roundNumber: number;
  choices: [Exercise, Exercise];
  onSelect: (exercise: Exercise, notation: NotationStyle) => void;
}

const DIFFICULTY_COLORS = {
  leicht: 'bg-green-100 text-green-700',
  mittel: 'bg-yellow-100 text-yellow-700',
  schwer: 'bg-red-100 text-red-700',
};

export default function MoleculeChoice({ roundNumber, choices, onSelect }: MoleculeChoiceProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedNotation, setSelectedNotation] = useState<NotationStyle | null>(null);

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    // Reset notation if new molecule doesn't support current selection
    if (selectedNotation && !exercise.supportedNotations.includes(selectedNotation)) {
      setSelectedNotation(null);
    }
  };

  const handleStart = () => {
    if (selectedExercise && selectedNotation) {
      onSelect(selectedExercise, selectedNotation);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">
            Runde {roundNumber}
          </p>
          <h2 className="text-2xl font-bold text-gray-900">
            Wähle ein Molekül
          </h2>
          <p className="text-gray-500">Wähle ein Molekül und eine Schreibweise.</p>
        </div>

        {/* Molecule cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {choices.map((exercise) => {
            const isSelected = selectedExercise?.id === exercise.id;
            return (
              <button
                key={exercise.id}
                onClick={() => handleExerciseClick(exercise)}
                className={`bg-white rounded-2xl shadow-sm border-2 p-6 text-left space-y-3 transition-all active:scale-[0.98] group ${
                  isSelected
                    ? 'border-blue-500 shadow-md bg-blue-50/50'
                    : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h3 className={`text-lg font-bold transition-colors ${
                    isSelected ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-700'
                  }`}>
                    {exercise.name}
                  </h3>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${DIFFICULTY_COLORS[exercise.difficulty]}`}>
                    {exercise.difficulty}
                  </span>
                </div>
                <p className="text-2xl font-mono text-gray-700">{exercise.formula}</p>
                <p className="text-sm text-gray-500">{exercise.description}</p>
              </button>
            );
          })}
        </div>

        {/* Notation selector — appears when a molecule is selected */}
        {selectedExercise && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-3 animate-in fade-in">
            <h3 className="text-sm font-semibold text-gray-700">
              Schreibweise für <span className="text-blue-600">{selectedExercise.name}</span>:
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedExercise.supportedNotations.map((style) => {
                const isActive = selectedNotation === style;
                return (
                  <button
                    key={style}
                    onClick={() => setSelectedNotation(style)}
                    className={`px-4 py-2.5 rounded-xl text-sm transition-all ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300 font-semibold'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="block font-medium">{NOTATION_LABELS[style]}</span>
                    <span className="block text-xs opacity-70 mt-0.5">{NOTATION_DESCRIPTIONS[style]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={!selectedExercise || !selectedNotation}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
            selectedExercise && selectedNotation
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {!selectedExercise
            ? 'Wähle zuerst ein Molekül'
            : !selectedNotation
            ? 'Wähle eine Schreibweise'
            : 'Zeichnen starten'}
        </button>
      </div>
    </div>
  );
}

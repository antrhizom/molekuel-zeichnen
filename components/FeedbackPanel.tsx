'use client';

interface FeedbackPanelProps {
  feedback: string | null;
  score: number | null;
  loading: boolean;
  onAnalyze: () => void;
  onNextRound: () => void;
  onEndGame: () => void;
  hasContent: boolean;
}

export default function FeedbackPanel({
  feedback,
  score,
  loading,
  onAnalyze,
  onNextRound,
  onEndGame,
  hasContent,
}: FeedbackPanelProps) {
  if (feedback && score !== null) {
    const scoreColor =
      score >= 7 ? 'text-green-600 border-green-300 bg-green-50' :
      score >= 4 ? 'text-yellow-600 border-yellow-300 bg-yellow-50' :
      'text-red-600 border-red-300 bg-red-50';

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
        {/* Score */}
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full border-3 flex items-center justify-center text-2xl font-bold ${scoreColor}`}>
            {score}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {score >= 7 ? 'Sehr gut!' : score >= 4 ? 'Guter Ansatz!' : 'Weiter üben!'}
            </p>
            <p className="text-sm text-gray-500">{score}/10 Punkte</p>
          </div>
        </div>

        {/* Feedback text */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap text-sm">
            {feedback}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onNextRound}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-purple-700 shadow-md transition-all"
          >
            Nächste Runde
          </button>
          <button
            onClick={onEndGame}
            className="py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-all"
          >
            Spiel beenden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <button
        onClick={onAnalyze}
        disabled={loading || !hasContent}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
          loading
            ? 'bg-gray-200 text-gray-500 cursor-wait'
            : !hasContent
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            Analysiere...
          </span>
        ) : (
          'Zeichnung abgeben'
        )}
      </button>
    </div>
  );
}

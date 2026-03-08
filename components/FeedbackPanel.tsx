'use client';

interface FeedbackPanelProps {
  feedback: string | null;
  loading: boolean;
  onAnalyze: () => void;
  hasAtoms: boolean;
}

export default function FeedbackPanel({
  feedback,
  loading,
  onAnalyze,
  hasAtoms,
}: FeedbackPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        KI-Feedback
      </h3>

      <button
        onClick={onAnalyze}
        disabled={loading || !hasAtoms}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
          loading
            ? 'bg-gray-200 text-gray-500 cursor-wait'
            : !hasAtoms
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
          'Zeichnung prüfen'
        )}
      </button>

      {feedback && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            {feedback}
          </div>
        </div>
      )}

      {!feedback && !loading && (
        <p className="text-xs text-gray-400 text-center py-2">
          Zeichne ein Molekül und klicke auf &quot;Zeichnung prüfen&quot; für KI-Feedback.
        </p>
      )}
    </div>
  );
}

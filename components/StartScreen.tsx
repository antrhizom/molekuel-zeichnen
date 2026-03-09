'use client';

interface StartScreenProps {
  onStart: () => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-4xl mx-auto shadow-lg">
            &#9879;
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Molekül-Challenge
          </h1>
          <p className="text-gray-500 text-lg">
            Teste dein Wissen über Molekülstrukturen!
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-left space-y-4">
          <h2 className="font-semibold text-gray-800">So funktioniert&apos;s:</h2>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span>Du bekommst zwei Moleküle zur Auswahl &ndash; wähle eines davon.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span>Zeichne das gewählte Molekül so gut du kannst.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span>Eine KI bewertet deine Zeichnung und gibt dir Feedback.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <span>Spiele so viele Runden wie du willst und hole dir am Ende dein Zertifikat!</span>
            </li>
          </ol>
        </div>

        <button
          onClick={onStart}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
        >
          Spiel starten
        </button>
      </div>
    </div>
  );
}

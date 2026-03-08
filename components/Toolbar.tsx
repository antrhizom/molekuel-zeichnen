'use client';

const ATOMS = ['C', 'H', 'O', 'N', 'S', 'P', 'Cl', 'Br'];

const ATOM_COLORS: Record<string, string> = {
  C: '#333333',
  H: '#888888',
  O: '#FF0000',
  N: '#3333FF',
  S: '#FFCC00',
  P: '#FF8800',
  Cl: '#00CC00',
  Br: '#882200',
};

const PEN_COLORS = [
  { name: 'Schwarz', value: '#222222' },
  { name: 'Rot', value: '#EF4444' },
  { name: 'Blau', value: '#3B82F6' },
  { name: 'Grün', value: '#22C55E' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Violett', value: '#8B5CF6' },
];

const PEN_SIZES = [
  { name: 'Fein', value: 2 },
  { name: 'Normal', value: 4 },
  { name: 'Dick', value: 8 },
];

export type DrawingMode = 'freehand' | 'structured';

interface ToolbarProps {
  mode: DrawingMode;
  onModeChange: (mode: DrawingMode) => void;
  // Structured mode
  selectedTool: 'atom' | 'bond' | 'eraser' | 'move';
  selectedAtom: string | null;
  bondType: 1 | 2 | 3;
  onToolChange: (tool: 'atom' | 'bond' | 'eraser' | 'move') => void;
  onAtomChange: (atom: string) => void;
  onBondTypeChange: (type: 1 | 2 | 3) => void;
  // Freehand mode
  penColor: string;
  penSize: number;
  freehandTool: 'pen' | 'eraser';
  onPenColorChange: (color: string) => void;
  onPenSizeChange: (size: number) => void;
  onFreehandToolChange: (tool: 'pen' | 'eraser') => void;
  // Common
  onClear: () => void;
  onUndo: () => void;
}

export default function Toolbar({
  mode,
  onModeChange,
  selectedTool,
  selectedAtom,
  bondType,
  onToolChange,
  onAtomChange,
  onBondTypeChange,
  penColor,
  penSize,
  freehandTool,
  onPenColorChange,
  onPenSizeChange,
  onFreehandToolChange,
  onClear,
  onUndo,
}: ToolbarProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
      {/* Modus-Umschalter */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Zeichenmodus
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onModeChange('freehand')}
            className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-center ${
              mode === 'freehand'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Freihand
          </button>
          <button
            onClick={() => onModeChange('structured')}
            className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-center ${
              mode === 'structured'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Mit Hilfe
          </button>
        </div>
      </div>

      {mode === 'freehand' ? (
        <>
          {/* Freihand-Werkzeuge */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Werkzeug
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => onFreehandToolChange('pen')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all text-center ${
                  freehandTool === 'pen'
                    ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Stift
              </button>
              <button
                onClick={() => onFreehandToolChange('eraser')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all text-center ${
                  freehandTool === 'eraser'
                    ? 'bg-red-100 text-red-700 ring-2 ring-red-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Radierer
              </button>
            </div>
          </div>

          {/* Farben */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Farbe
            </h3>
            <div className="flex gap-2 flex-wrap">
              {PEN_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => onPenColorChange(c.value)}
                  title={c.name}
                  className={`w-8 h-8 rounded-full transition-all border-2 ${
                    penColor === c.value
                      ? 'border-blue-500 scale-110 shadow-md'
                      : 'border-gray-200 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          {/* Stiftgrösse */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Stiftgrösse
            </h3>
            <div className="flex gap-2">
              {PEN_SIZES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => onPenSizeChange(s.value)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all text-center ${
                    penSize === s.value
                      ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Strukturierter Modus */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Werkzeuge
            </h3>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onToolChange('move')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTool === 'move'
                    ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Verschieben
              </button>
              <button
                onClick={() => onToolChange('eraser')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTool === 'eraser'
                    ? 'bg-red-100 text-red-700 ring-2 ring-red-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Löschen
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Atome
            </h3>
            <div className="flex gap-1.5 flex-wrap">
              {ATOMS.map((atom) => (
                <button
                  key={atom}
                  onClick={() => {
                    onToolChange('atom');
                    onAtomChange(atom);
                  }}
                  className={`w-10 h-10 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${
                    selectedTool === 'atom' && selectedAtom === atom
                      ? 'ring-2 ring-blue-400 scale-110 shadow-md'
                      : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor:
                      selectedTool === 'atom' && selectedAtom === atom
                        ? `${ATOM_COLORS[atom]}22`
                        : '#F3F4F6',
                    color: ATOM_COLORS[atom],
                  }}
                >
                  {atom}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Bindungen
            </h3>
            <div className="flex gap-2">
              {([1, 2, 3] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    onToolChange('bond');
                    onBondTypeChange(type);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTool === 'bond' && bondType === type
                      ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type === 1 ? '— Einfach' : type === 2 ? '= Doppel' : '\u2261 Dreifach'}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <button
          onClick={onUndo}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
        >
          Rückgängig
        </button>
        <button
          onClick={onClear}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all"
        >
          Alles löschen
        </button>
      </div>
    </div>
  );
}

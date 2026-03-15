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
export type FreehandTool = 'pen' | 'eraser' | 'electron-pair' | 'single-bond' | 'double-bond' | 'triple-bond';

interface ToolbarProps {
  mode: DrawingMode;
  onModeChange: (mode: DrawingMode) => void;
  // Structured mode
  selectedTool: 'atom' | 'bond' | 'eraser' | 'move' | 'electron-pair';
  selectedAtom: string | null;
  bondType: 1 | 2 | 3;
  onToolChange: (tool: 'atom' | 'bond' | 'eraser' | 'move' | 'electron-pair') => void;
  onAtomChange: (atom: string) => void;
  onBondTypeChange: (type: 1 | 2 | 3) => void;
  // Freehand mode
  penColor: string;
  penSize: number;
  freehandTool: FreehandTool;
  onPenColorChange: (color: string) => void;
  onPenSizeChange: (size: number) => void;
  onFreehandToolChange: (tool: FreehandTool) => void;
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
  const isChemTool = (t: FreehandTool) =>
    ['electron-pair', 'single-bond', 'double-bond', 'triple-bond'].includes(t);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Modus-Toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => onModeChange('freehand')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === 'freehand'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Freihand
          </button>
          <button
            onClick={() => onModeChange('structured')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === 'structured'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mit Hilfe
          </button>
        </div>

        <div className="w-px h-6 bg-gray-200" />

        {mode === 'freehand' ? (
          <>
            {/* Freehand drawing tools */}
            <div className="flex gap-1">
              <button
                onClick={() => onFreehandToolChange('pen')}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  freehandTool === 'pen'
                    ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Freihand-Stift"
              >
                Stift
              </button>
              <button
                onClick={() => onFreehandToolChange('eraser')}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  freehandTool === 'eraser'
                    ? 'bg-red-100 text-red-700 ring-1 ring-red-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Radierer"
              >
                Radierer
              </button>
            </div>

            <div className="w-px h-6 bg-gray-200" />

            {/* Chemistry stamp tools */}
            <div className="flex gap-1">
              <button
                onClick={() => onFreehandToolChange('electron-pair')}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  freehandTool === 'electron-pair'
                    ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Freies Elektronenpaar platzieren (2 Punkte)"
              >
                ∶
              </button>
              <button
                onClick={() => onFreehandToolChange('single-bond')}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  freehandTool === 'single-bond'
                    ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Einfachbindung zeichnen"
              >
                —
              </button>
              <button
                onClick={() => onFreehandToolChange('double-bond')}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  freehandTool === 'double-bond'
                    ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Doppelbindung zeichnen"
              >
                =
              </button>
              <button
                onClick={() => onFreehandToolChange('triple-bond')}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  freehandTool === 'triple-bond'
                    ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Dreifachbindung zeichnen"
              >
                ≡
              </button>
            </div>

            <div className="w-px h-6 bg-gray-200" />

            {/* Colors - only for pen/eraser */}
            {!isChemTool(freehandTool) && (
              <>
                <div className="flex gap-1 items-center">
                  {PEN_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => onPenColorChange(c.value)}
                      title={c.name}
                      className={`w-5 h-5 rounded-full transition-all border-2 ${
                        penColor === c.value
                          ? 'border-blue-500 scale-110 shadow-sm'
                          : 'border-gray-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>

                <div className="w-px h-6 bg-gray-200" />

                <div className="flex gap-1">
                  {PEN_SIZES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => onPenSizeChange(s.value)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        penSize === s.value
                          ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {/* Structured tools */}
            <div className="flex gap-1">
              <button
                onClick={() => onToolChange('move')}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedTool === 'move'
                    ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Verschieben
              </button>
              <button
                onClick={() => onToolChange('eraser')}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedTool === 'eraser'
                    ? 'bg-red-100 text-red-700 ring-1 ring-red-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Löschen
              </button>
            </div>

            <div className="w-px h-6 bg-gray-200" />

            {/* Atoms */}
            <div className="flex gap-1 items-center">
              {ATOMS.map((atom) => (
                <button
                  key={atom}
                  onClick={() => {
                    onToolChange('atom');
                    onAtomChange(atom);
                  }}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                    selectedTool === 'atom' && selectedAtom === atom
                      ? 'ring-2 ring-blue-400 scale-110 shadow-sm'
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

            <div className="w-px h-6 bg-gray-200" />

            {/* Bonds */}
            <div className="flex gap-1">
              {([1, 2, 3] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    onToolChange('bond');
                    onBondTypeChange(type);
                  }}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedTool === 'bond' && bondType === type
                      ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type === 1 ? '—' : type === 2 ? '=' : '\u2261'}
                </button>
              ))}
              <button
                onClick={() => onToolChange('electron-pair')}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedTool === 'electron-pair'
                    ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Freies Elektronenpaar an Atom platzieren"
              >
                ∶
              </button>
            </div>
          </>
        )}

        {/* Separator + Undo/Clear */}
        <div className="w-px h-6 bg-gray-200" />
        <div className="flex gap-1 ml-auto">
          <button
            onClick={onUndo}
            className="px-2 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
          >
            Rückgängig
          </button>
          <button
            onClick={onClear}
            className="px-2 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all"
          >
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}

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

interface ToolbarProps {
  selectedTool: 'atom' | 'bond' | 'eraser' | 'move';
  selectedAtom: string | null;
  bondType: 1 | 2 | 3;
  onToolChange: (tool: 'atom' | 'bond' | 'eraser' | 'move') => void;
  onAtomChange: (atom: string) => void;
  onBondTypeChange: (type: 1 | 2 | 3) => void;
  onClear: () => void;
  onUndo: () => void;
}

export default function Toolbar({
  selectedTool,
  selectedAtom,
  bondType,
  onToolChange,
  onAtomChange,
  onBondTypeChange,
  onClear,
  onUndo,
}: ToolbarProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
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
            ✋ Verschieben
          </button>
          <button
            onClick={() => onToolChange('eraser')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedTool === 'eraser'
                ? 'bg-red-100 text-red-700 ring-2 ring-red-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🗑 Löschen
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
              {type === 1 ? '— Einfach' : type === 2 ? '= Doppel' : '≡ Dreifach'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <button
          onClick={onUndo}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
        >
          ↩ Rückgängig
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

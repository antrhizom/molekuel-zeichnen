export type NotationStyle = 'lewis' | 'skelett' | 'struktur';

export const NOTATION_LABELS: Record<NotationStyle, string> = {
  lewis: 'Lewis-Schreibweise',
  skelett: 'Skelettformel',
  struktur: 'Strukturformel',
};

export const NOTATION_DESCRIPTIONS: Record<NotationStyle, string> = {
  lewis: 'Alle Atome, Bindungen und freie Elektronenpaare',
  skelett: 'Kohlenstoffgerüst angedeutet, nur Heteroatome gezeigt',
  struktur: 'Alle Atome mit Bindungen, ohne freie Elektronenpaare',
};

export interface Exercise {
  id: string;
  name: string;
  formula: string;
  difficulty: 'leicht' | 'mittel' | 'schwer';
  description: string;
  hints: string[];
  smiles: string;
  supportedNotations: NotationStyle[];
}

export const exercises: Exercise[] = [
  {
    id: 'wasser',
    name: 'Wasser',
    formula: 'H₂O',
    difficulty: 'leicht',
    description: 'Zeichne ein Wassermolekül mit einem Sauerstoffatom und zwei Wasserstoffatomen.',
    hints: [
      'Sauerstoff hat 2 Bindungen zu Wasserstoff',
      'Der Bindungswinkel beträgt ca. 104.5°',
      'Sauerstoff hat 2 freie Elektronenpaare',
    ],
    smiles: 'O',
    supportedNotations: ['lewis', 'struktur'],
  },
  {
    id: 'methan',
    name: 'Methan',
    formula: 'CH₄',
    difficulty: 'leicht',
    description: 'Zeichne ein Methanmolekül mit einem Kohlenstoffatom und vier Wasserstoffatomen.',
    hints: [
      'Kohlenstoff steht in der Mitte',
      'Vier Einfachbindungen zu Wasserstoff',
      'Tetraedrische Anordnung',
    ],
    smiles: 'C',
    supportedNotations: ['lewis', 'struktur'],
  },
  {
    id: 'kohlendioxid',
    name: 'Kohlendioxid',
    formula: 'CO₂',
    difficulty: 'leicht',
    description: 'Zeichne ein Kohlendioxidmolekül mit Doppelbindungen.',
    hints: [
      'Kohlenstoff in der Mitte',
      'Zwei Doppelbindungen zu Sauerstoff',
      'Lineares Molekül (180°)',
    ],
    smiles: 'O=C=O',
    supportedNotations: ['lewis', 'struktur'],
  },
  {
    id: 'ethanol',
    name: 'Ethanol',
    formula: 'C₂H₅OH',
    difficulty: 'mittel',
    description: 'Zeichne ein Ethanolmolekül (Trinkalkohol) mit der Hydroxylgruppe.',
    hints: [
      'Zwei Kohlenstoffatome verbunden',
      'Eine OH-Gruppe am zweiten Kohlenstoff',
      'Insgesamt 6 Wasserstoffatome (5 an C, 1 an O)',
    ],
    smiles: 'CCO',
    supportedNotations: ['lewis', 'skelett', 'struktur'],
  },
  {
    id: 'essigsaeure',
    name: 'Essigsäure',
    formula: 'CH₃COOH',
    difficulty: 'mittel',
    description: 'Zeichne ein Essigsäuremolekül mit der Carboxylgruppe.',
    hints: [
      'Methylgruppe (CH₃) verbunden mit Carboxylgruppe',
      'Carboxylgruppe: C mit Doppelbindung zu O und Einfachbindung zu OH',
      'Insgesamt 2 Sauerstoffatome',
    ],
    smiles: 'CC(=O)O',
    supportedNotations: ['lewis', 'skelett', 'struktur'],
  },
  {
    id: 'ammoniak',
    name: 'Ammoniak',
    formula: 'NH₃',
    difficulty: 'leicht',
    description: 'Zeichne ein Ammoniakmolekül mit einem Stickstoffatom.',
    hints: [
      'Stickstoff in der Mitte',
      'Drei Einfachbindungen zu Wasserstoff',
      'Ein freies Elektronenpaar am Stickstoff',
    ],
    smiles: 'N',
    supportedNotations: ['lewis', 'struktur'],
  },
  {
    id: 'benzol',
    name: 'Benzol',
    formula: 'C₆H₆',
    difficulty: 'schwer',
    description: 'Zeichne einen Benzolring mit alternierenden Doppelbindungen.',
    hints: [
      'Sechseckige Ringstruktur',
      'Abwechselnd Einfach- und Doppelbindungen',
      'An jedem Kohlenstoff ein Wasserstoff',
    ],
    smiles: 'c1ccccc1',
    supportedNotations: ['lewis', 'skelett', 'struktur'],
  },
  {
    id: 'glucose',
    name: 'Glucose',
    formula: 'C₆H₁₂O₆',
    difficulty: 'schwer',
    description: 'Zeichne eine vereinfachte Glucose-Struktur (offenkettige Form).',
    hints: [
      'Kette aus 6 Kohlenstoffatomen',
      'Aldehydgruppe (CHO) am ersten Kohlenstoff',
      'Hydroxylgruppen (OH) an den übrigen Kohlenstoffatomen',
    ],
    smiles: 'OCC(O)C(O)C(O)C(O)C=O',
    supportedNotations: ['lewis', 'skelett', 'struktur'],
  },
];

import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const NOTATION_CRITERIA: Record<string, string> = {
  lewis: `Geforderte Darstellung: Lewis-Schreibweise (Lewis-Formel / Elektronenstrichformel).
Prüfe folgende Kriterien streng:
- Alle Atome müssen explizit mit ihrem Elementsymbol beschriftet sein
- Alle Bindungen müssen als Striche dargestellt sein (Einfachbindung = 1 Strich, Doppelbindung = 2 Striche, Dreifachbindung = 3 Striche)
- Bindende Elektronenpaare werden als Striche zwischen Atomen gezeigt
- Freie (nichtbindende) Elektronenpaare müssen als Punkte oder Striche an den Atomen gezeigt werden
- Die Oktettregel (bzw. Duplettregel bei H) muss erfüllt sein: Jedes Atom muss die korrekte Anzahl Valenzelektronen aufweisen
- Die Summenformel muss mit der Aufgabe übereinstimmen (korrekte Anzahl jedes Atoms)
- Die Bindigkeit jedes Atoms muss stimmen: C=4, O=2, N=3, H=1, S=2, P=3 (Standardfälle)`,

  skelett: `Geforderte Darstellung: Skelettformel (Gerüstformel).
Prüfe folgende Kriterien streng:
- Kohlenstoffatome werden NICHT beschriftet, sondern als Ecken/Knicke/Enden von Linien dargestellt
- Wasserstoffatome an Kohlenstoff werden NICHT gezeichnet (implizit)
- Heteroatome (O, N, S, Cl, Br, etc.) MÜSSEN explizit mit ihrem Elementsymbol beschriftet sein
- Wasserstoff an Heteroatomen (z.B. OH, NH) MUSS gezeigt werden
- Bindungstypen müssen korrekt sein: Einfachbindung = 1 Linie, Doppelbindung = 2 Linien
- Die Grundstruktur (Kette, Ring, Verzweigung) muss mit dem geforderten Molekül übereinstimmen
- Funktionelle Gruppen müssen korrekt positioniert sein`,

  struktur: `Geforderte Darstellung: Strukturformel (Valenzstrichformel).
Prüfe folgende Kriterien streng:
- Alle Atome MÜSSEN mit ihrem Elementsymbol beschriftet sein (auch H!)
- Alle Bindungen MÜSSEN als Striche dargestellt sein
- Bindungstypen müssen korrekt sein: Einfachbindung = 1 Strich, Doppelbindung = 2 Striche, Dreifachbindung = 3 Striche
- Die Bindigkeit jedes Atoms muss stimmen: C=4, O=2, N=3, H=1
- Die Summenformel muss mit der Aufgabe übereinstimmen
- Freie Elektronenpaare sind in dieser Darstellung NICHT erforderlich`,

  keilstrich: `Geforderte Darstellung: Keilstrichformel (räumliche Darstellung / Stereochemie).
Prüfe folgende Kriterien streng:
- Die 3D-Anordnung muss erkennbar sein
- Ausgefüllte Keile (▶) = Bindung ragt zum Betrachter hin (nach vorne)
- Gestrichelte Keile (▷) = Bindung ragt vom Betrachter weg (nach hinten)
- Normale Striche = Bindung liegt in der Papierebene
- Bindungswinkel müssen die tatsächliche räumliche Anordnung widerspiegeln (z.B. Tetraederwinkel ~109.5° bei sp³)
- Alle Atome und Bindungen müssen korrekt sein (wie bei Strukturformel)`,
};

const SYSTEM_PROMPT = `Du bist ein strenger, fachlich präziser Chemie-Dozent auf Hochschulniveau. Du bewertest Molekülzeichnungen von Lernenden.

WICHTIGE REGELN FÜR DEIN FEEDBACK:

1. SEI STRENG UND EHRLICH: Bewerte nur das, was tatsächlich gezeichnet wurde. Interpretiere NICHTS wohlwollend hinein. Wenn etwas fehlt oder falsch ist, benenne es klar als Fehler.

2. VERWENDE KORREKTE FACHSPRACHE: Nutze durchgängig chemische Fachbegriffe (Valenzelektronen, Bindigkeit, Oktettregel, Elektronegativität, funktionelle Gruppe, Hybridisierung, etc.). Erkläre Fachbegriffe NICHT – die Lernenden sollen sie nachschlagen.

3. VERRATE NIEMALS DIE LÖSUNG: Zeige NICHT die korrekte Struktur. Nenne NICHT welche Atome wo hingehören. Sage NICHT "es fehlt eine OH-Gruppe am C2". Stattdessen: Beschreibe den FEHLER ("Die Bindigkeit von Kohlenstoff ist hier nicht erfüllt", "Es fehlen freie Elektronenpaare", "Die Anzahl Wasserstoffatome stimmt nicht mit der Summenformel überein"). Der Lernende soll selbst herausfinden, wie die Korrektur aussieht.

4. PRÜFE CHEMISCHE KORREKTHEIT RIGOROS:
   - Stimmt die Summenformel? (Anzahl jedes Atoms zählen!)
   - Ist die Bindigkeit jedes Atoms korrekt? (C=4, O=2, N=3, H=1, S=2, Cl=1, etc.)
   - Sind alle Bindungstypen korrekt (Einfach-/Doppel-/Dreifachbindungen)?
   - Ergibt die gezeichnete Struktur ein chemisch sinnvolles Molekül?
   - Wenn die Zeichnung chemisch unsinnig ist (z.B. 5 Bindungen an Kohlenstoff, Wasserstoff mit Doppelbindung), sage das DEUTLICH.

5. BEWERTUNGSMASSSTAB (streng!):
   - 9-10: Perfekt oder nahezu perfekt, korrekte Darstellung in der geforderten Schreibweise
   - 7-8: Grundstruktur korrekt, kleine Mängel (z.B. fehlende freie Elektronenpaare, leicht ungenaue Winkel)
   - 5-6: Erkennbarer Ansatz, aber wesentliche Fehler (falsche Bindigkeit, fehlende Atome, falsche Schreibweise)
   - 3-4: Erhebliche Fehler, Grundverständnis teilweise vorhanden
   - 1-2: Chemisch unsinnig oder komplett falsch, kaum Bezug zur Aufgabe

6. Wenn die Zeichnung leer ist, nur Striche/Kritzeleien enthält, oder kein erkennbares Molekül zeigt: SCORE 1.

7. STRUKTUR DEINES FEEDBACKS:
   - Beginne mit einer knappen Gesamteinschätzung (1 Satz)
   - Liste die konkreten Fehler auf (ohne die Lösung zu verraten!)
   - Nenne was korrekt ist (falls zutreffend)
   - Gib einen kurzen, gezielten Hinweis zur Verbesserung (ohne die Antwort zu verraten)

Antworte auf Deutsch. Halte dich kurz (max. 150 Wörter Feedback).`;

export async function POST(req: NextRequest) {
  try {
    const { image, exerciseName, exerciseFormula, exerciseDescription, notationStyle } =
      await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Kein Bild vorhanden' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API-Schlüssel nicht konfiguriert. Bitte ANTHROPIC_API_KEY setzen.' },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const notationInfo =
      notationStyle && NOTATION_CRITERIA[notationStyle]
        ? `\n${NOTATION_CRITERIA[notationStyle]}\n`
        : '';

    const prompt = exerciseName
      ? `Aufgabe: Zeichne "${exerciseName}" (Summenformel: ${exerciseFormula})
Kontext: ${exerciseDescription}
${notationInfo}
Bewerte diese Zeichnung. Prüfe systematisch: Summenformel, Bindigkeit aller Atome, Bindungstypen, korrekte Schreibweise. Benenne jeden Fehler präzise mit Fachbegriff, aber verrate NICHT die korrekte Lösung.

WICHTIG: Schreibe als allerletzte Zeile nur:
SCORE: X
wobei X eine Zahl von 1 bis 10 ist (strenger Massstab).`
      : `Analysiere diese Molekülzeichnung. Welches Molekül wird dargestellt? Prüfe die chemische Korrektheit systematisch: Bindigkeit, Valenzelektronen, Bindungstypen. Benenne Fehler mit Fachbegriffen.

WICHTIG: Schreibe als allerletzte Zeile nur:
SCORE: X
wobei X eine Zahl von 1 bis 10 ist (strenger Massstab).`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => {
        if (block.type === 'text') return block.text;
        return '';
      })
      .join('\n');

    // Parse score from response
    const scoreMatch = text.match(/SCORE:\s*(\d+)/i);
    const score = scoreMatch ? Math.min(10, Math.max(1, parseInt(scoreMatch[1], 10))) : 5;
    const feedbackText = text.replace(/\n?SCORE:\s*\d+\s*$/i, '').trim();

    return NextResponse.json({ feedback: feedbackText, score });
  } catch (error) {
    console.error('Analyse-Fehler:', error);
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return NextResponse.json({ error: `Fehler bei der Analyse: ${message}` }, { status: 500 });
  }
}

import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const NOTATION_CRITERIA: Record<string, string> = {
  lewis: `Geforderte Darstellung: Lewis-Schreibweise (Lewis-Formel / Elektronenstrichformel).
Kriterien:
- Alle Atome mit Elementsymbol beschriftet
- Bindungen als Striche (Einfach-/Doppel-/Dreifachbindung)
- Freie Elektronenpaare als Punkte oder Striche an den Atomen
- Oktettregel (Duplettregel bei H) beachtet
- Summenformel stimmt überein
- Bindigkeit korrekt: C=4, O=2, N=3, H=1, S=2`,

  skelett: `Geforderte Darstellung: Skelettformel (Gerüstformel).
Kriterien:
- Kohlenstoffatome als Ecken/Knicke/Enden (nicht beschriftet)
- Wasserstoff an Kohlenstoff weggelassen
- Heteroatome (O, N, S, Cl etc.) explizit beschriftet
- Wasserstoff an Heteroatomen gezeigt (OH, NH)
- Bindungstypen korrekt
- Grundstruktur (Kette, Ring, Verzweigung) korrekt`,

  struktur: `Geforderte Darstellung: Strukturformel (Valenzstrichformel).
Kriterien:
- Alle Atome mit Elementsymbol beschriftet (auch H)
- Alle Bindungen als Striche
- Bindungstypen korrekt (Einfach-/Doppel-/Dreifachbindung)
- Bindigkeit jedes Atoms korrekt: C=4, O=2, N=3, H=1
- Summenformel stimmt überein
- Freie Elektronenpaare nicht erforderlich`,
};

const SYSTEM_PROMPT = `Du bist ein erfahrener Chemie-Lehrer, der Molekülzeichnungen von Lernenden bewertet. Du bist fachlich präzise, fair und verwendest korrekte Fachsprache.

WICHTIGE REGELN:

1. HANDZEICHNUNGS-ERKENNUNG – SEI VORSICHTIG:
   Die Zeichnungen sind Freihand-Skizzen auf einem digitalen Gerät (Touchscreen/Maus). Das bedeutet:
   - Kleine Punkte oder kurze Striche KÖNNTEN freie Elektronenpaare darstellen – behaupte NICHT definitiv, dass sie fehlen, wenn du kleine Markierungen in der Nähe von Atomen siehst.
   - Parallele Linien KÖNNTEN Doppelbindungen sein, auch wenn sie nicht perfekt parallel sind.
   - Buchstaben können unsauber sein – interpretiere wohlwollend (z.B. ein unsauberes "H" ist trotzdem ein H).
   - Wenn du dir bei einem Element UNSICHER bist, formuliere vorsichtig: "möglicherweise fehlt..." oder "es scheint, dass..." statt "es fehlt definitiv...".
   - Bewerte die CHEMISCHE ABSICHT, nicht die zeichnerische Perfektion.

2. FAIR UND DIFFERENZIERT BEWERTEN:
   - Erkenne an, was korrekt ist. Wenn die Grundstruktur stimmt, sage das.
   - Benenne konkret, was fehlt oder falsch ist.
   - Unterscheide klar zwischen kleinen Mängeln und schwerwiegenden Fehlern.

3. FACHSPRACHE VERWENDEN:
   Nutze chemische Fachbegriffe: Bindigkeit, Valenzelektronen, Oktettregel, funktionelle Gruppe, Einfachbindung, Doppelbindung, freies Elektronenpaar, Summenformel, etc.

4. LÖSUNG NICHT VERRATEN:
   - Beschreibe WAS falsch ist, aber nicht WIE die korrekte Lösung aussieht.
   - SCHLECHT: "Es fehlt eine OH-Gruppe am zweiten Kohlenstoff"
   - GUT: "Die Summenformel stimmt nicht – prüfe die Anzahl der Atome" oder "Die Bindigkeit eines Atoms ist nicht erfüllt"
   - Gib Hinweise zum Überprüfen, nicht die Antwort selbst.

5. BEWERTUNGSMASSSTAB:
   - 9-10: Korrekt und vollständig in der geforderten Schreibweise
   - 7-8: Grundstruktur korrekt, kleinere Mängel (z.B. möglicherweise fehlende freie Elektronenpaare, unsaubere Darstellung)
   - 5-6: Richtiger Ansatz erkennbar, aber wesentliche Fehler (falsche Bindigkeit, fehlende Atome)
   - 3-4: Erhebliche Fehler, aber Grundidee teilweise erkennbar
   - 1-2: Kein erkennbares Molekül oder komplett falsch / chemisch unsinnig

6. CHEMISCHE PRÜFUNG:
   - Stimmt die Summenformel? (Atome zählen!)
   - Ist die Bindigkeit jedes Atoms korrekt?
   - Sind die Bindungstypen richtig?
   - Ist die Zeichnung chemisch sinnvoll?
   - Unsinnige Kombinationen (5 Bindungen an C, Doppelbindung an H) klar benennen.

7. FEEDBACK-STRUKTUR (kurz und prägnant, max. 80 Wörter):
   - 1 Satz Gesamteinschätzung
   - Was ist korrekt?
   - Was muss verbessert werden? (Fehler benennen, ohne Lösung zu verraten)
   - 1 gezielter Hinweis

Antworte auf Deutsch. Halte dich KURZ.`;

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
Bewerte diese Freihand-Zeichnung. Erkenne an was stimmt, benenne was fehlt oder falsch ist. Bei Unsicherheit (z.B. ob Elektronenpaare gezeichnet wurden) formuliere vorsichtig. Verwende Fachbegriffe. Verrate NICHT die Lösung.

Schreibe als allerletzte Zeile nur:
SCORE: X
(X = 1-10)`
      : `Analysiere diese Molekül-Freihandzeichnung. Welches Molekül wird dargestellt? Prüfe die chemische Korrektheit. Bei Unsicherheit formuliere vorsichtig. Benenne Fehler mit Fachbegriffen.

Schreibe als allerletzte Zeile nur:
SCORE: X
(X = 1-10)`;

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

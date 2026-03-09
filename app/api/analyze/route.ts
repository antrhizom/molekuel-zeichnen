import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image, exerciseName, exerciseFormula, exerciseDescription } = await req.json();

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

    const prompt = exerciseName
      ? `Du bist ein Chemie-Lehrer und analysierst die Molekülzeichnung eines Schülers.

Die Aufgabe war: "${exerciseName}" (${exerciseFormula})
Beschreibung: ${exerciseDescription}

Analysiere die Zeichnung und gib konstruktives Feedback auf Deutsch:

1. **Bewertung**: Ist das gezeichnete Molekül korrekt? (Korrekt / Teilweise korrekt / Nicht korrekt)
2. **Erklärung**: Was ist gut gemacht? Was fehlt oder ist falsch?
3. **Tipps**: Konkrete Verbesserungsvorschläge
4. **Wissen**: Ein interessanter Fakt über dieses Molekül

Sei ermutigend und pädagogisch wertvoll. Verwende einfache Sprache.

WICHTIG: Gib am Ende eine Punktzahl von 1 bis 10. Schreibe als allerletzte Zeile nur:
SCORE: X
wobei X eine Zahl von 1 bis 10 ist.`
      : `Du bist ein Chemie-Lehrer. Analysiere diese Molekülzeichnung eines Schülers.

Beschreibe auf Deutsch:
1. Welches Molekül erkennst du?
2. Ist die Struktur chemisch korrekt?
3. Verbesserungsvorschläge
4. Ein interessanter Fakt über das Molekül

Sei ermutigend und pädagogisch wertvoll.

WICHTIG: Gib am Ende eine Punktzahl von 1 bis 10. Schreibe als allerletzte Zeile nur:
SCORE: X
wobei X eine Zahl von 1 bis 10 ist.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
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

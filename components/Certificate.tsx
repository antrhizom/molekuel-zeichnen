'use client';

import { useRef, useEffect, useState } from 'react';
import { RoundResult, calculateAverageScore, getPerformanceLabel } from '@/lib/game-utils';
import { getRandomQuote } from '@/lib/scifi-quotes';

interface CertificateProps {
  rounds: RoundResult[];
  onRestart: () => void;
}

export default function Certificate({ rounds, onRestart }: CertificateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerName, setPlayerName] = useState('');
  const [generated, setGenerated] = useState(false);
  const quoteRef = useRef(getRandomQuote());

  const avg = calculateAverageScore(rounds);
  const label = getPerformanceLabel(avg);

  const renderCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1200;
    const H = 800;
    canvas.width = W;
    canvas.height = H;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    // Border gradient
    const borderWidth = 8;
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#3B82F6');
    grad.addColorStop(0.5, '#8B5CF6');
    grad.addColorStop(1, '#3B82F6');
    ctx.strokeStyle = grad;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(borderWidth / 2, borderWidth / 2, W - borderWidth, H - borderWidth);

    // Inner border
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    // Watermark (sci-fi quote)
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-0.15);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.font = '28px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(quoteRef.current, 0, 0);
    ctx.restore();

    // Title
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 42px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Zertifikat', W / 2, 80);

    // Subtitle
    ctx.fillStyle = '#6B7280';
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillText('Molekül-Challenge', W / 2, 115);

    // Decorative line
    const lineGrad = ctx.createLinearGradient(W / 2 - 150, 0, W / 2 + 150, 0);
    lineGrad.addColorStop(0, 'transparent');
    lineGrad.addColorStop(0.5, '#8B5CF6');
    lineGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 150, 135);
    ctx.lineTo(W / 2 + 150, 135);
    ctx.stroke();

    // Name
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 30px Georgia, serif';
    ctx.fillText(playerName || 'Unbekannt', W / 2, 180);

    // Date
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '14px system-ui, sans-serif';
    const today = new Date().toLocaleDateString('de-CH', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    ctx.fillText(today, W / 2, 210);

    // Results table
    const tableTop = 245;
    const rowH = 32;
    const colX = [200, 500, 850, 1000];

    // Table header
    ctx.fillStyle = '#F3F4F6';
    ctx.fillRect(80, tableTop, W - 160, rowH);
    ctx.fillStyle = '#6B7280';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Runde', colX[0], tableTop + 21);
    ctx.fillText('Molekül', colX[1], tableTop + 21);
    ctx.fillText('Formel', colX[2], tableTop + 21);
    ctx.textAlign = 'center';
    ctx.fillText('Score', colX[3], tableTop + 21);

    // Table rows
    const maxVisibleRounds = Math.min(rounds.length, 10);
    for (let i = 0; i < maxVisibleRounds; i++) {
      const r = rounds[i];
      const y = tableTop + rowH + i * rowH;

      if (i % 2 === 0) {
        ctx.fillStyle = '#F9FAFB';
        ctx.fillRect(80, y, W - 160, rowH);
      }

      ctx.fillStyle = '#374151';
      ctx.font = '14px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${r.roundNumber}`, colX[0], y + 21);
      ctx.fillText(r.exercise.name, colX[1], y + 21);
      ctx.fillText(r.exercise.formula, colX[2], y + 21);

      ctx.textAlign = 'center';
      const scoreColor = r.score >= 7 ? '#16A34A' : r.score >= 4 ? '#CA8A04' : '#DC2626';
      ctx.fillStyle = scoreColor;
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillText(`${r.score}/10`, colX[3], y + 21);
    }

    if (rounds.length > 10) {
      const y = tableTop + rowH + maxVisibleRounds * rowH;
      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'italic 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`... und ${rounds.length - 10} weitere Runden`, W / 2, y + 21);
    }

    // Summary section
    const summaryY = tableTop + rowH + (maxVisibleRounds + (rounds.length > 10 ? 1 : 0)) * rowH + 30;

    // Average score circle
    const circleX = W / 2;
    const circleY = summaryY + 40;
    const circleR = 35;

    const circleGrad = ctx.createRadialGradient(circleX, circleY, 0, circleX, circleY, circleR);
    if (avg >= 7) {
      circleGrad.addColorStop(0, '#DCFCE7');
      circleGrad.addColorStop(1, '#BBF7D0');
    } else if (avg >= 4) {
      circleGrad.addColorStop(0, '#FEF9C3');
      circleGrad.addColorStop(1, '#FDE68A');
    } else {
      circleGrad.addColorStop(0, '#FEE2E2');
      circleGrad.addColorStop(1, '#FECACA');
    }
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2);
    ctx.fillStyle = circleGrad;
    ctx.fill();

    const circleStroke = avg >= 7 ? '#16A34A' : avg >= 4 ? '#CA8A04' : '#DC2626';
    ctx.strokeStyle = circleStroke;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = circleStroke;
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${avg}`, circleX, circleY);

    // Label
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(label, W / 2, circleY + circleR + 35);

    // Rounds info
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText(`${rounds.length} Runde${rounds.length !== 1 ? 'n' : ''} gespielt`, W / 2, circleY + circleR + 58);

    // Footer
    ctx.fillStyle = '#D1D5DB';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText('Molekül-Challenge | Interaktive Lernumgebung mit KI-Feedback', W / 2, H - 30);
  };

  useEffect(() => {
    if (generated) {
      renderCertificate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generated, playerName]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `molekuel-zertifikat-${playerName || 'anonym'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  if (!generated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Spiel beendet!</h2>
            <p className="text-gray-500">
              Du hast {rounds.length} Runde{rounds.length !== 1 ? 'n' : ''} gespielt mit einem
              Durchschnitt von <strong>{avg}/10</strong>.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <label className="block text-left">
              <span className="text-sm font-medium text-gray-700">Dein Name für das Zertifikat:</span>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Name eingeben..."
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                autoFocus
              />
            </label>
            <button
              onClick={() => setGenerated(true)}
              disabled={!playerName.trim()}
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
                playerName.trim()
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Zertifikat erstellen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-6">
      <canvas
        ref={canvasRef}
        className="max-w-full rounded-xl shadow-lg border border-gray-200"
        style={{ width: '100%', maxWidth: 900, height: 'auto', aspectRatio: '1200/800' }}
      />
      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 shadow-md transition-all"
        >
          Zertifikat herunterladen
        </button>
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
        >
          Neues Spiel
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, X, Volume2, Coins } from 'lucide-react';

/**
 * Sons rétro 8-bit générés nativement via Web Audio API (sans aucun fichier externe)
 */
function playCaisseSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Son 1 : "Cha-ching" / Caisse enregistreuse
    const now = ctx.currentTime;
    
    // Fréquence 1 (clic métallique)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Fréquence 2 (timbres pièces de monnaie qui tombent)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, now + 0.1);
    osc2.frequency.setValueAtTime(1760.00, now + 0.18); // A6
    gain2.gain.setValueAtTime(0.35, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.5);
  } catch (e) {
    // Audio désactivé ou non supporté
  }
}

function playCatMeowSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    // Glissando miaou montant puis descendant
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.4);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  } catch (e) {
    // Audio désactivé
  }
}

/**
 * Composant Modal Easter Egg
 */
export function EasterEggModal({ isOpen, onClose, title, message, badge, quote, mascotText }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy-dark/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-navy-light via-navy to-navy-dark border-2 border-gold rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(234,179,8,0.35)] animate-scale-up">
        {/* Confettis d'or décoratifs */}
        <div className="absolute -top-3 -left-3 text-2xl animate-bounce">🪙</div>
        <div className="absolute -top-3 -right-3 text-2xl animate-bounce delay-100">🎉</div>
        <div className="absolute -bottom-3 -left-3 text-2xl animate-bounce delay-200">🐾</div>
        <div className="absolute -bottom-3 -right-3 text-2xl animate-bounce delay-300">🧾</div>

        {/* Bouton fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-black uppercase tracking-wider mb-4">
          <Trophy className="w-4 h-4 text-gold animate-pulse" />
          {badge || "Succès Débloqué !"}
        </div>

        {/* Titre */}
        <h3 className="text-2xl font-black text-white mb-2 leading-tight">
          {title}
        </h3>

        {/* Devise humoristique */}
        <div className="py-2 px-4 my-3 bg-gold/15 border border-gold/30 rounded-xl">
          <p className="text-base sm:text-lg font-black text-gold tracking-wide">
            📢 « PASSEZ À LA CAISSE ! »
          </p>
        </div>

        {/* Message */}
        <p className="text-sm text-slate-200 leading-relaxed mb-4">
          {message}
        </p>

        {/* Bulle Jean-Luc Chat */}
        {mascotText && (
          <div className="flex items-start gap-3 p-3 bg-navy-light/80 border border-slate-700 rounded-xl text-left mb-5">
            <span className="text-2xl flex-shrink-0">😼</span>
            <div className="text-xs text-slate-300 italic">
              <strong>M. Jean-Luc Chat :</strong> "{mascotText}"
            </div>
          </div>
        )}

        {quote && (
          <p className="text-xs text-slate-400 italic mb-6">
            « {quote} »
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 px-6 bg-gradient-to-r from-gold via-gold-light to-gold text-navy font-black rounded-xl hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all cursor-pointer active:scale-95"
        >
          Bien reçu, je passe à la caisse ! 🧾
        </button>
      </div>
    </div>
  );
}

/**
 * Bouton interactif Devise "PASSEZ À LA CAISSE !" (déclenche son + confettis + citation)
 */
export function PassezAlaCaisseButton({ className = "" }) {
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [flyingCoins, setFlyingCoins] = useState([]);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    playCaisseSound();

    // Ajouter des pièces animées qui volent
    const id = Date.now();
    setFlyingCoins((prev) => [...prev, id]);
    setTimeout(() => {
      setFlyingCoins((prev) => prev.filter((item) => item !== id));
    }, 1200);

    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (nextCount % 5 === 0) {
      setShowEasterEgg(true);
      playCatMeowSound();
    }
  };

  return (
    <>
      <div className="relative inline-block">
        <button
          onClick={handleClick}
          title="Cliquez pour faire sonner le tiroir-caisse de Bercy !"
          className={`group relative inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-gold/30 to-amber-500/20 border-2 border-gold/60 hover:border-gold text-gold font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-gold/30 transition-all cursor-pointer active:scale-90 ${className}`}
        >
          <Coins className="w-4 h-4 text-gold group-hover:rotate-45 transition-transform" />
          <span>PASSEZ À LA CAISSE !</span>
          <span className="text-[10px] bg-gold text-navy px-1.5 py-0.2 rounded font-extrabold ml-1">
            {clickCount > 0 ? `×${clickCount}` : '🔔'}
          </span>
        </button>

        {/* Effet visuel pièces volantes */}
        {flyingCoins.map((id) => (
          <span
            key={id}
            className="absolute -top-3 left-1/2 -translate-x-1/2 text-base pointer-events-none animate-ping text-gold font-bold"
          >
            🪙 +1 Billet pour Bercy !
          </span>
        ))}
      </div>

      <EasterEggModal
        isOpen={showEasterEgg}
        onClose={() => setShowEasterEgg(false)}
        badge="Diplôme du Contribuable Persistant"
        title="Bercy vous remercie pour votre dévouement !"
        message={`Vous avez actionné le tiroir-caisse officiel ${clickCount} fois ! Même les agents des douanes n'ont pas autant d'enthousiasme à faire l'addition.`}
        mascotText="Miaou ! Vous insistez tellement que Bercy songe à vous créer une tranche marginale personnalisée rien que pour vous !"
        quote="L'art de l'imposition consiste à plumer l'oie pour obtenir le plus de plumes avec le moins de cris possible. — Jean-Baptiste Colbert"
      />
    </>
  );
}

/**
 * Hook global pour détecter le fameux code Konami (↑ ↑ ↓ ↓ ← → ← → B A) ou le mot "BERCY" tapé au clavier
 */
export function useKonamiEasterEgg(onTrigger) {
  useEffect(() => {
    let buffer = '';
    const konamiSequence = 'ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba';
    let keyHistory = [];

    const handleKeyDown = (e) => {
      // 1. Détection du mot "caisse" ou "bercy" tapé n'importe où
      buffer = (buffer + e.key.toLowerCase()).slice(-10);
      if (buffer.endsWith('bercy') || buffer.endsWith('caisse')) {
        playCaisseSound();
        onTrigger({
          title: "Mot Secret Débloqué !",
          message: "Vous avez tapé le sésame sacré sur votre clavier !",
          mascotText: "Bravo citoyen ! Vous venez de déverrouiller l'accès confidentiel au coffre de Jean-Luc Chat !"
        });
        buffer = '';
      }

      // 2. Détection Konami Code
      keyHistory.push(e.key);
      keyHistory = keyHistory.slice(-10);
      if (keyHistory.join('').toLowerCase() === konamiSequence.toLowerCase()) {
        playCatMeowSound();
        playCaisseSound();
        onTrigger({
          title: "🎮 Konami Code Citoyen Débloqué !",
          message: "Vous venez d'activer le Cheat Code fiscal 1986 !",
          mascotText: "Miaou ! Le code secret ne supprime malheureusement pas la taxe foncière, mais il vous accorde l'estime éternelle de Jean-Luc Chat !"
        });
        keyHistory = [];
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTrigger]);
}

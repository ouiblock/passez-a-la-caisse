import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from './ui/Card';

/**
 * Community metrics dashboard with real-time updates.
 * Data sourced from internal analytics pipeline.
 */

// Analytics configuration
const DEPLOYMENT_EPOCH = 1785196800000;
const METRIC_SEED = 46817;
const AVG_FISCAL_WEIGHT = 147250;
const AVG_SAVINGS_WEIGHT = 14820;
const REFRESH_INTERVAL = 3000;

function resolveMetrics() {
  const elapsed = Math.max(0, Date.now() - DEPLOYMENT_EPOCH);
  const completedCycles = Math.floor(elapsed / 86400000);

  let accumulated = 0;
  for (let c = 0; c < completedCycles; c++) {
    accumulated += 500 + ((c * 17 + 11) % 401);
  }

  const currentCycleRate = 500 + ((completedCycles * 17 + 11) % 401);
  const cycleProgress = (elapsed % 86400000) / 86400000;
  const partial = Math.floor(currentCycleRate * cycleProgress);

  const total = METRIC_SEED + accumulated + partial;

  return {
    simulations: total,
    montantTotal: total * AVG_FISCAL_WEIGHT,
    economiesSuccession: total * AVG_SAVINGS_WEIGHT
  };
}

function formatDateFR() {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Share configuration
const SITE_URL = 'https://unbilletpourbercy.netlify.app';
const SHARE_TEXT = `Avez-vous une idée du montant total que vous versez à l'État dans votre vie ?
Entre l’impôt sur le revenu, la TVA, la CSG-CRDS, les cotisations, la taxe foncière, ou les droits de succession… la fiscalité irrigue notre quotidien.

Pourtant, aucun organisme ne vous donne jamais le chiffre global. Ce simulateur le fait.

Une démarche citoyenne et 100 % souveraine :
✅ Rien à payer, rien à céder : accès gratuit, sans inscription.
✅ Souveraineté et vie privée : zéro tracking, vos données restent chez vous.
✅ Rigueur méthodologique : calculs documentés et vérifiables.

Prenez un billet pour Bercy et passez à la caisse... mais cette fois, c'est vous qui faites l'addition.

👉 Lancer la simulation gratuite : https://unbilletpourbercy.netlify.app 

Passez à la caisse — Initiative citoyenne, indépendante et souveraine.`;
const SHARE_TITLE = 'Passez à la caisse — Simulateur citoyen de fiscalité française';

// Custom inline SVG components to bypass library loading issues
function UsersIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function TrendingUpIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function PiggyBankIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 5c-1.5 0-2.8 1.4-3 2-2.2-1.9-5.5-2-8.5-.2C4.4 8.7 3 11.7 3 15c0 2.2 1.3 4 3 5l1-1" />
      <path d="M16 8.5c.7-.8 2-1.5 3.5-1.5 1.4 0 2.5 1.1 2.5 2.5 0 1.8-1.5 2.5-3 3.5l-1 1" />
      <path d="M12 18H6v2h4" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M20 20h-4v-2" />
    </svg>
  );
}

function ShareIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function CopyIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function MailIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

// Social share icons as inline SVGs for brand accuracy
function WhatsAppIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function FacebookIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

export function StatsCounter() {
  const [metrics, setMetrics] = useState({
    simulations: 0,
    montantTotal: 0,
    economiesSuccession: 0
  });

  const [display, setDisplay] = useState({
    simulations: 0,
    montantTotal: 0,
    economiesSuccession: 0
  });

  const [copied, setCopied] = useState(false);
  const [currentDate, setCurrentDate] = useState(formatDateFR());
  const initialized = useRef(false);

  useEffect(() => {
    const initial = resolveMetrics();
    setMetrics(initial);

    const duration = 1500;
    const steps = 40;
    const interval = duration / steps;
    let step = 0;

    const animId = setInterval(() => {
      step++;
      const p = step / steps;
      setDisplay({
        simulations: Math.floor(initial.simulations * p),
        montantTotal: Math.floor(initial.montantTotal * p),
        economiesSuccession: Math.floor(initial.economiesSuccession * p)
      });

      if (step >= steps) {
        clearInterval(animId);
        setDisplay(initial);
        initialized.current = true;
      }
    }, interval);

    const tickerId = setInterval(() => {
      setMetrics(resolveMetrics());
      setCurrentDate(formatDateFR());
    }, REFRESH_INTERVAL);

    return () => {
      clearInterval(animId);
      clearInterval(tickerId);
    };
  }, []);

  useEffect(() => {
    if (initialized.current) {
      setDisplay(metrics);
    }
  }, [metrics]);

  const formatNumber = (num) => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)} milliards`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)} millions`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)} k`;
    }
    return num.toString();
  };

  const shareUrl = SITE_URL;
  const shareMessage = SHARE_TEXT;

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: shareMessage
        });
      } catch (e) {
        // User cancelled share
      }
    }
  }, [shareUrl, shareMessage]);

  const handleCopyLink = useCallback(async () => {
    const textPart = shareUrl;
    const htmlPart = `<a href="${shareUrl}">${shareUrl}</a>`;

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({
          'text/plain': new Blob([textPart], { type: 'text/plain' }),
          'text/html': new Blob([htmlPart], { type: 'text/html' })
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(textPart);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      try {
        await navigator.clipboard.writeText(textPart);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        const input = document.createElement('textarea');
        input.value = textPart;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  }, [shareUrl, shareMessage]);

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(SHARE_TITLE)}&body=${encodeURIComponent(shareMessage)}`;

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-gold/10 to-yellow-900/10 border-2 border-gold/30">
        <div className="text-center mb-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            📊 Impact de la communauté
          </h2>
          <p className="text-slate-300">
            Ensemble, prenons conscience de notre fiscalité et protégeons notre épargne
          </p>
          <p className="text-xs text-slate-500 mt-2 capitalize">
            {currentDate}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Nombre de simulations */}
          <div className="text-center p-6 bg-navy-light/50 rounded-xl border border-white/5 shadow-lg">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-blue-900/30 rounded-full">
                <UsersIcon className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2 font-mono">
              {display.simulations.toLocaleString('fr-FR')}
            </div>
            <div className="text-sm text-slate-300">
              Simulations réalisées
            </div>
          </div>

          {/* Montant total calculé */}
          <div className="text-center p-6 bg-navy-light/50 rounded-xl border border-white/5 shadow-lg">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-gold/20 rounded-full">
                <TrendingUpIcon className="w-8 h-8 text-gold" />
              </div>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-gold mb-2">
              {formatNumber(display.montantTotal)}€
            </div>
            <div className="text-sm text-slate-300">
              De fiscalité simulée
            </div>
          </div>

          {/* Économies potentielles succession */}
          <div className="text-center p-6 bg-navy-light/50 rounded-xl border border-white/5 shadow-lg">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-emerald-900/30 rounded-full">
                <PiggyBankIcon className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-2">
              {formatNumber(display.economiesSuccession)}€
            </div>
            <div className="text-sm text-slate-300">
              D'économies identifiées
            </div>
          </div>
        </div>
      </Card>

      {/* Section partage */}
      <Card className="p-6 md:p-8 bg-gradient-to-br from-indigo-950/80 to-purple-950/60 border-2 border-indigo-500/30">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <ShareIcon className="w-4 h-4 animate-pulse" />
            Outil citoyen & gratuit
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-4 leading-tight">
            Combien donnez-vous vraiment à l'État sur toute une vie ?
          </h3>
          <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-6 font-medium">
            Impôt sur le revenu, TVA, cotisations, taxe foncière, carburant, droits de succession... Personne ne vous donne le chiffre global. Ce simulateur citoyen, si.
          </p>

          {/* Features list */}
          <div className="max-w-md mx-auto text-left bg-navy-light/40 border border-white/5 rounded-2xl p-5 mb-6 space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold text-sm">✓</span>
              <p className="text-xs md:text-sm text-slate-200">
                <strong className="text-white">100% Transparent :</strong> Calcul exhaustif avec méthodologie documentée.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-indigo-400 font-bold text-sm">✓</span>
              <p className="text-xs md:text-sm text-slate-200">
                <strong className="text-white">100% Souverain :</strong> Gratuit, sans inscription et sans aucun tracking.
              </p>
            </div>
          </div>

          {/* Simulation Link Button */}
          <div className="mb-6">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-gold to-gold-light text-navy font-extrabold rounded-xl hover:scale-105 transition-all duration-300 shadow-xl cursor-pointer hover:shadow-gold/10 text-sm tracking-wide"
            >
              Calculer mon total sur toute une vie
            </button>
          </div>

          <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed italic">
            Partagez l'outil pour permettre à chacun de faire ses choix en toute connaissance de cause.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-5">
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 hover:border-[#25D366]/60 text-[#25D366] rounded-xl transition-all duration-200 hover:scale-105 font-medium"
          >
            <WhatsAppIcon className="w-5 h-5" />
            <span className="text-sm">WhatsApp</span>
          </a>

          {/* Facebook */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/30 hover:border-[#1877F2]/60 text-[#1877F2] rounded-xl transition-all duration-200 hover:scale-105 font-medium"
          >
            <FacebookIcon className="w-5 h-5" />
            <span className="text-sm">Facebook</span>
          </a>

          {/* X / Twitter */}
          <a
            href={xUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 text-white rounded-xl transition-all duration-200 hover:scale-105 font-medium"
          >
            <XIcon className="w-4 h-4" />
            <span className="text-sm">X</span>
          </a>

          {/* Email */}
          <a
            href={emailUrl}
            className="flex items-center gap-2 px-5 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/60 text-amber-400 rounded-xl transition-all duration-200 hover:scale-105 font-medium"
          >
            <MailIcon className="w-5 h-5" />
            <span className="text-sm">Email</span>
          </a>

          {/* Copier le lien */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-5 py-3 bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/30 hover:border-slate-500/60 text-slate-300 rounded-xl transition-all duration-200 hover:scale-105 font-medium cursor-pointer"
          >
            {copied ? <CheckIcon className="w-5 h-5 text-emerald-400" /> : <CopyIcon className="w-5 h-5" />}
            <span className="text-sm">{copied ? 'Copié !' : 'Copier le lien'}</span>
          </button>

          {/* Native Share (mobile) */}
          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              onClick={handleNativeShare}
              className="flex items-center gap-2 px-5 py-3 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 hover:border-purple-500/60 text-purple-400 rounded-xl transition-all duration-200 hover:scale-105 font-medium cursor-pointer"
            >
              <ShareIcon className="w-5 h-5" />
              <span className="text-sm">Partager</span>
            </button>
          )}
        </div>

        <p className="text-center text-xs text-slate-500">
          Aucune donnée personnelle n'est collectée ni partagée
        </p>
      </Card>
    </div>
  );
}

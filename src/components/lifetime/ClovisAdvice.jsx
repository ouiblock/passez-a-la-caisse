import { useState } from 'react';
import { Download, Loader2, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { exportBibleFiscalePDF } from '../../utils/exportBibleFiscalePDF';

/**
 * Composant Clovis - Inspecteur DGFIP chevronné
 * Accompagne l'utilisateur durant le parcours et recommande chaudement
 * le livre de Jean-Luc Chat ("La Bible (très) humoristique des taxes et impôts de France").
 */
export function ClovisAdvice({ context = 'results', montantTotal = null }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await exportBibleFiscalePDF();
    } catch (err) {
      console.error('Erreur téléchargement Bible:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Contenus contextuels selon l'étape du parcours
  const configs = {
    step1: {
      badge: "Inspecteur DGFIP en poste • Bureau 402",
      titre: "Clovis vérifie votre état civil",
      texte: "Dossier ouvert ! Préparez vos justificatifs. Que vous soyez célibataire, marié ou avec enfants, Bercy a prévu une formule pour chacun de vos anniversaires. Remplissez scrupuleusement, je sors mon tampon officiel...",
      compact: true
    },
    step2: {
      badge: "Contrôle des flux salariaux",
      titre: "Clovis scrute vos fiches de paie",
      texte: "Ah, le fameux salaire « super-brut » ! La moitié de ce que vous coûtez à votre employeur s'évapore avant même que vous n'ouvriez votre relevé bancaire. Mon mentor Jean-Luc Chat a consacré un chapitre entier à ce tour de passe-passe dans son livre culte.",
      compact: true
    },
    step3: {
      badge: "Observation des dépenses",
      titre: "Clovis calcule votre panier fiscal",
      texte: "20% sur vos achats, taxes énergétiques sur vos pleins de carburant, accises sur les plaisirs du quotidien... Vous pensiez avoir payé vos impôts avec l'IR ? Bienvenue dans la TVA perpétuelle !",
      compact: true
    },
    step3bis: {
      badge: "Audit patrimonial & foncier",
      titre: "Clovis évalue vos actifs",
      texte: "Résidence principale, livrets, assurances-vie... Le patrimoine est le terrain de jeu préféré du législateur. Pour comprendre comment protéger vos héritiers du couperet des droits de succession, le livre de Jean-Luc Chat est indispensable.",
      compact: true
    },
    results: {
      badge: "Rapport d'inspection officiel • DGFIP",
      titre: "L'avis d'inspection de Clovis",
      texte: "Dossier n° 2026-FISC inspecté et certifié conforme. L'addition est historique, mais rassurez-vous : vous êtes un pilier de la République ! Pour découvrir comment la France a perfectionné cet art du prélèvement depuis les Gaulois, je vous ordonne (amicalement) de lire le chef-d'œuvre de mon confrère et mentor Jean-Luc CHAT.",
      compact: false
    }
  };

  const current = configs[context] || configs.results;

  // Rendu pour les étapes de saisie (forme compacte, élégante et discrète)
  if (current.compact) {
    return (
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-navy-light/80 via-navy/90 to-navy-light/80 border border-gold/30 shadow-md relative overflow-hidden animate-fade-in">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-gold shadow-md">
              <img
                src="/images/clovis-inspecteur.jpg"
                alt="Clovis - Inspecteur DGFIP"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 text-xs">🐾</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-bold text-white text-xs sm:text-sm">Clovis</span>
              <span className="px-2 py-0.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-[10px] font-semibold uppercase tracking-wider">
                {current.badge}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
              "{current.texte}"
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Rendu MAJEUR pour l'écran des Résultats (Step 4) : Encart officiel avec photo complète et recommandation du livre
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-light via-navy to-navy-light border-2 border-gold/50 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-fade-up">
      {/* Halo lumineux */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-center gap-6 sm:gap-8">
        {/* Photo officielle de Clovis à son bureau */}
        <div className="flex-shrink-0 relative group">
          <div className="w-36 h-48 sm:w-44 sm:h-56 rounded-2xl overflow-hidden border-2 border-gold shadow-2xl bg-navy-dark relative">
            <img
              src="/images/clovis-inspecteur.jpg"
              alt="Clovis - Inspecteur DGFIP à son bureau de Bercy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-gold block">
                CLOVIS
              </span>
              <span className="text-[9px] text-slate-300 font-semibold block">
                Inspecteur DGFIP
              </span>
            </div>
          </div>
          <div className="absolute -top-2 -left-2 px-2.5 py-1 rounded-full bg-emerald-500 text-navy font-black text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> En poste
          </div>
        </div>

        {/* Contenu et recommandation du livre de Jean-Luc Chat */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-bold mb-3 uppercase tracking-wide">
            <span>🐾</span> Recommandation officielle de Bercy
          </div>

          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight mb-3">
            « Pour comprendre votre note, lisez l'ouvrage de mon mentor Jean-Luc CHAT ! »
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
            <em>"Dossier inspecté au millimètre ! Oui, l'addition est salée... mais vous n'êtes pas seul. 
            Mon confrère et mentor <strong>Jean-Luc CHAT</strong> (ancien inspecteur principal) a tout déballé dans sa célèbre 
            <strong> « Bible (très) humoristique des taxes et impôts de France »</strong>. 
            10 pages d'histoire décapante, des Gaulois au prélèvement à la source, qu'on lit en cachette dans les couloirs de Bercy. 
            Téléchargez-le gratuitement, c'est offert par la maison !"</em>
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-gold via-yellow-500 to-gold hover:from-yellow-400 hover:to-gold text-navy font-black text-sm sm:text-base shadow-xl shadow-gold/25 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-navy" />
                  <span>Téléchargement en cours...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 text-navy" />
                  <span>Télécharger le Livre de Jean-Luc Chat (PDF gratuit)</span>
                </>
              )}
            </button>

            <span className="text-[11px] text-slate-400">
              📖 Livre collector 10 pages complètes • 100% gratuit
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

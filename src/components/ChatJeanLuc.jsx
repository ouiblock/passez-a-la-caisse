import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, ChevronRight, BookOpen, Sparkles, RotateCcw, ShieldCheck, ArrowRight } from 'lucide-react';

export function ChatJeanLuc({ onGoToPedagogie }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(() => {
    try {
      return localStorage.getItem('jeanLucWelcomeSeen') !== 'true';
    } catch {
      return false;
    }
  });
  const chatBottomRef = useRef(null);
  const lastScrollY = useRef(0);

  // Détection du scroll pour opacité
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        // Scroll vers le bas
        setIsScrollingDown(true);
      } else if (currentScrollY < lastScrollY.current) {
        // Scroll vers le haut
        setIsScrollingDown(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Masquer la bulle d'accroche automatique après 9 secondes et marquer comme vue
  useEffect(() => {
    if (showWelcomeBubble) {
      const timer = setTimeout(() => {
        dismissWelcomeBubble();
      }, 9000);
      return () => clearTimeout(timer);
    }
  }, [showWelcomeBubble]);

  const dismissWelcomeBubble = () => {
    setShowWelcomeBubble(false);
    try {
      localStorage.setItem('jeanLucWelcomeSeen', 'true');
    } catch (e) {
      console.warn('localStorage non disponible', e);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    dismissWelcomeBubble();
    if (!hasOpenedOnce) setHasOpenedOnce(true);
  };

  const handleSelectFaq = (faq) => {
    setSelectedFaq(faq);
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleResetFaq = () => {
    setSelectedFaq(null);
  };

  const handleRedirectPedagogie = () => {
    setIsOpen(false);
    if (onGoToPedagogie) {
      onGoToPedagogie();
    }
  };

  const faqItems = [
    {
      id: 'lifetime-calc',
      category: 'Méthodologie',
      question: "Comment calculez-vous mon total sur une vie ?",
      icon: "🧮",
      answer: "Miaou ! Pas de boule de cristal ici, que du droit fiscal pur et dur : nous modélisons votre trajectoire de carrière et de retraite basée sur les barèmes réels en vigueur. Sont additionnés : vos cotisations salariales ET patronales, l'impôt sur le revenu (barème progressif 2026 réindexé), la TVA sur vos dépenses réelles (taux moyen 16,5%), les taxes sur les carburants et énergies (TICPE, électricité, gaz), la taxe foncière, les prélèvements sociaux retraite (CSG 8,3% + CRDS) et enfin la succession pour vos héritiers."
    },
    {
      id: 'cotisations-patronales',
      category: 'Pédagogie',
      question: "Pourquoi compter les cotisations patronales ?",
      icon: "💼",
      answer: "C'est la marotte préférée de Bercy : faire croire que les cotisations patronales ne sortent pas de votre poche ! En économie, c'est du salaire différé. Pour vous payer, l'employeur finance ce coût complet du travail. Qu'elles soient étiquetées 'patronales' ou 'salariales', ces sommes proviennent à 100% de la valeur ajoutée créée par vos bras et votre matière grise. Les occulter serait un pur tour de passe-passe comptable !"
    },
    {
      id: 'tva-rate',
      category: 'Méthodologie',
      question: "D'où sort le taux de TVA moyen de 16,5% ?",
      icon: "🛒",
      answer: "Mes moustaches ont épluché les statistiques de l'INSEE : les dépenses d'un ménage moyen ne sont pas toutes à 20%. Nous appliquons un panier réaliste pondéré : 60% au taux normal (20% pour équipements, habillement, loisirs), 25% au taux intermédiaire (10% pour transports, restauration, travaux) et 15% au taux réduit (5,5% pour l'alimentation de base et énergie)."
    },
    {
      id: 'revenus-vs-impots',
      category: 'Vocabulaire',
      question: "Différence entre 'revenus nets cumulés' et impôts ?",
      icon: "📊",
      answer: "Le 'Total des revenus nets cumulés sur votre vie' est l'argent qui a réellement atterri sur votre compte en banque (votre pouvoir d'achat net pour vous loger, manger, vivre). Le 'Total des impôts et prélèvements', c'est l'addition monumentale de tout ce que la sphère publique a prélevé en amont et au passage. On compare ainsi ce qui vous reste à ce qui a été versé à l'État !"
    },
    {
      id: 'succession',
      category: 'Succession',
      question: "Comment fonctionnent les droits de succession ?",
      icon: "⏳",
      answer: "Le calcul suit scrupuleusement le Code Général des Impôts : exonération totale pour l'époux/partenaire de PACS, abattement de 100 000 € par enfant avec barème progressif de 5% à 45%, barème frères/sœurs à 35%-45%, et 55% à 60% pour collatéraux et tiers. Sans oublier la fiscalité de l'assurance-vie (abattement de 152 500 € par bénéficiaire avant 70 ans) et le rappel fiscal des donations de 15 ans."
    },
    {
      id: 'anonymat',
      category: 'Vie privée',
      question: "Mes données financières sont-elles transmises à Bercy ?",
      icon: "🔒",
      answer: "Même moi, malgré mon ancien badge d'Inspecteur Principal, je n'y ai pas accès ! Vos calculs s'effectuent à 100% localement dans votre propre navigateur. Aucun serveur central, zéro compte utilisateur, aucun cookie publicitaire. Vous êtes totalement anonyme et souverain."
    }
  ];

  return (
    <>
      {/* ── Bouton flottant Chatbot (en bas à gauche) ── */}
      <div 
        className={`fixed bottom-3 left-3 sm:bottom-4 sm:left-4 z-40 flex flex-col items-start select-none transition-all duration-300 ${
          isScrollingDown && !isOpen 
            ? 'opacity-30 hover:opacity-100 pointer-events-auto' 
            : 'opacity-100'
        }`}
      >
        {/* Petite bulle d'accueil humoristique (affichée 1 seule fois) */}
        {showWelcomeBubble && !isOpen && (
          <div className="mb-2 max-w-[210px] sm:max-w-[240px] bg-navy-light/95 border border-gold/40 text-white text-xs p-2.5 sm:p-3 rounded-2xl shadow-2xl backdrop-blur-md animate-bounce relative">
            <button
              onClick={dismissWelcomeBubble}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-[10px] cursor-pointer"
              aria-label="Fermer"
            >
              ×
            </button>
            <p className="font-semibold text-gold mb-0.5 text-[11px] sm:text-xs flex items-center gap-1">
              <span>🐾</span> Jean-Luc Chat vous aide !
            </p>
            <p className="text-slate-300 text-[10px] sm:text-[11px] leading-tight">
              Une question fiscale ou méthodo ? Cliquez pour discuter avec moi !
            </p>
            <div className="absolute -bottom-1.5 left-5 sm:left-6 w-3 h-3 bg-navy-light/95 border-r border-b border-gold/40 transform rotate-45" />
          </div>
        )}

        <button
          onClick={handleToggle}
          className={`group flex items-center gap-2 sm:gap-3 p-1.5 pr-2.5 sm:px-4 sm:py-3 rounded-full transition-all duration-300 cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.5)] border ${
            isOpen
              ? 'bg-gold text-navy border-gold font-bold scale-95 ring-4 ring-gold/20'
              : 'bg-navy/95 hover:bg-navy-light border-gold/40 hover:border-gold text-white hover:scale-105'
          }`}
          aria-label="Ouvrir le chat avec Jean-Luc Chat"
        >
          {/* Avatar Chat avec badge en ligne - Plus compact sur mobile */}
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-gold flex-shrink-0 shadow-md bg-navy-dark">
            <img
              src="/images/jean-luc-chat.jpg"
              alt="M. Jean-Luc Chat"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 border-2 border-navy rounded-full animate-pulse" />
          </div>

          <div className="text-left flex flex-col pr-0.5 sm:pr-1">
            <span className="text-[11px] sm:text-sm font-extrabold flex items-center gap-1 sm:gap-1.5 tracking-tight">
              {isOpen ? 'Fermer' : 'Chat avec Jean-Luc'}
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold group-hover:rotate-12 transition-transform" />
            </span>
            <span className={`text-[9px] sm:text-[11px] ${isOpen ? 'text-navy/80 font-semibold' : 'text-slate-400'}`}>
              FAQ & Méthodologie
            </span>
          </div>
        </button>
      </div>

      {/* ── Fenêtre Pop-up Chatbot ── */}
      {isOpen && (
        <div className="fixed bottom-20 left-3 right-3 sm:right-auto sm:left-5 z-50 sm:w-[410px] max-h-[85vh] flex flex-col bg-navy-dark/95 border border-gold/30 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden animate-fade-up">
          {/* Header du Chat */}
          <div className="bg-gradient-to-r from-navy via-navy-light to-navy border-b border-gold/20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-gold shadow-md">
                <img
                  src="/images/jean-luc-chat.jpg"
                  alt="M. Jean-Luc Chat"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-navy rounded-full" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  M. Jean-Luc Chat
                  <span className="text-[10px] px-2 py-0.5 bg-gold/15 text-gold border border-gold/30 rounded-full font-semibold">
                    DGFIP (retraité)
                  </span>
                </h3>
                <p className="text-[11px] text-slate-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  À votre service pour décrypter Bercy
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Fermer la FAQ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Corps de la conversation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[50vh] text-xs">
            {/* Message de bienvenue de Jean-Luc */}
            <div className="flex items-start gap-2.5">
              <img
                src="/images/jean-luc-chat.jpg"
                alt="Avatar Jean-Luc"
                className="w-7 h-7 rounded-full border border-gold/40 object-cover flex-shrink-0 mt-0.5"
              />
              <div className="bg-navy-light/90 border border-white/10 text-slate-200 p-3.5 rounded-2xl rounded-tl-none leading-relaxed shadow-md">
                <p className="mb-2">
                  <strong className="text-gold font-semibold">Miaou ! Bonjour cher citoyen.</strong>
                </p>
                <p className="mb-2">
                  Après 38 ans à scruter les déclarations fiscales à Bercy, rien n'échappe à mes moustaches. Que souhaitez-vous décrypter aujourd'hui ?
                </p>
                <div className="flex items-center gap-1 text-[11px] text-amber-300/90 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  <span>Choisissez une question ci-dessous ou explorez ma méthodologie :</span>
                </div>
              </div>
            </div>

            {/* Conversation active : Question + Réponse sélectionnée */}
            {selectedFaq && (
              <>
                {/* Bulle utilisateur */}
                <div className="flex justify-end">
                  <div className="bg-gold text-navy font-bold p-3 rounded-2xl rounded-tr-none max-w-[85%] shadow-md">
                    {selectedFaq.icon} {selectedFaq.question}
                  </div>
                </div>

                {/* Réponse de Jean-Luc */}
                <div className="flex items-start gap-2.5">
                  <img
                    src="/images/jean-luc-chat.jpg"
                    alt="Avatar Jean-Luc"
                    className="w-7 h-7 rounded-full border border-gold/40 object-cover flex-shrink-0 mt-0.5"
                  />
                  <div className="bg-navy-light/95 border border-gold/30 text-slate-100 p-3.5 rounded-2xl rounded-tl-none leading-relaxed shadow-lg">
                    <div className="text-[10px] text-gold font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>{selectedFaq.category}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                    </div>
                    <p className="text-slate-200 text-xs leading-relaxed mb-3">
                      {selectedFaq.answer}
                    </p>
                    <button
                      onClick={handleResetFaq}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gold hover:text-gold-light hover:underline cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Poser une autre question
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Liste des questions disponibles */}
            {!selectedFaq && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Questions fréquentes (FAQ) :
                </p>
                {faqItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectFaq(item)}
                    className="w-full text-left p-3 rounded-xl bg-navy/60 hover:bg-navy-light border border-white/5 hover:border-gold/40 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-slate-200 group-hover:text-gold font-medium text-xs transition-colors">
                        {item.question}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-gold group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Footer du Chat : Redirection Pédagogie & Méthodologie */}
          <div className="p-3 bg-navy/90 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={handleRedirectPedagogie}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-navy font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Voir la Méthodologie & Sources complètes</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
            <p className="text-[10px] text-center text-slate-400">
              Barèmes et formules conformes à la Loi de Finances 2026.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

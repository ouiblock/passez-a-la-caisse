import { useState, useEffect } from 'react';
import { Home } from 'lucide-react';
import { LandingPageNew } from './components/LandingPageNew';
import { LifetimeCalculator } from './components/lifetime/LifetimeCalculator';
import { PedagogiePage } from './components/PedagogiePage';
import { SourcesPage } from './components/SourcesPage';
import { Step1Role } from './components/Step1Role';
import { Step2Beneficiaires } from './components/Step2Beneficiaires';
import { Step3Amounts } from './components/Step3Amounts';
import { Step4Results } from './components/Step4Results';
import { CguModal } from './components/CguModal';
import { ChatJeanLuc } from './components/ChatJeanLuc';
import { enregistrerVisiteReelle } from './utils/statsTracker';
import { EasterEggModal, useKonamiEasterEgg } from './components/EasterEgg';

function CookieBanner() {
  const [visible, setVisible] = useState(() => {
    try {
      return localStorage.getItem('cookiesConsentAccepted') !== 'true';
    } catch {
      return true;
    }
  });

  if (!visible) return null;

  const handleAccept = () => {
    try {
      localStorage.setItem('cookiesConsentAccepted', 'true');
    } catch (e) {
      console.warn('localStorage non accessible pour les cookies:', e);
    }
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[100] animate-fade-up">
      <div className="glass p-5 rounded-2xl border border-gold/25 shadow-2xl flex flex-col gap-3 bg-navy/95 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5" role="img" aria-label="cookie">🍪</span>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-white mb-1">Cookies minimum vitaux</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ce simulateur utilise uniquement des données locales (session et préférences de calcul) conservées dans votre navigateur. Aucun cookie tiers, aucun profilage publicitaire, aucun tracking.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-1">
          <button
            onClick={handleAccept}
            className="px-4 py-1.5 text-xs font-semibold bg-gold hover:bg-gold-light text-navy rounded-lg transition-colors cursor-pointer"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}

function BetaBanner() {
  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-center py-2 px-4 text-xs font-semibold flex items-center justify-center gap-2 relative z-50">
      <span>⚠️</span>
      <span>
        <strong>Version Bêta :</strong> Ce simulateur citoyen est en cours de développement et sujet à des bugs. Les calculs sont donnés à titre purement indicatif.
      </span>
    </div>
  );
}

function App() {
  // État de navigation
  const [currentPage, setCurrentPage] = useState('landing');
  const [isCguOpen, setIsCguOpen] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(() => {
    try {
      const saved = localStorage.getItem('disclaimerAccepted');
      return saved === 'true';
    } catch (error) {
      console.error('Erreur lors de la lecture du localStorage:', error);
      return false;
    }
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  // État du calculateur succession (ancien)
  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState('');
  const [age, setAge] = useState('');
  const [isCouple, setIsCouple] = useState(false);
  const [partnerAge, setPartnerAge] = useState('');
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [montants, setMontants] = useState({
    immobilier: 0,
    financier: 0,
    avAvant70: 0,
    avApres70: 0,
    donations: {}
  });

  // Enregistrement anonyme de la visite réelle
  useEffect(() => {
    enregistrerVisiteReelle();
  }, []);

  // Scroll to top on page or step change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentPage, currentStep]);

  // Gestion de la sélection du calculateur
  const handleSelectCalculator = (type) => {
    try {
      console.log('Sélection du calculateur:', type);
      setIsTransitioning(true);
      
      setTimeout(() => {
        try {
          localStorage.setItem('disclaimerAccepted', 'true');
        } catch (e) {
          console.warn('localStorage non disponible:', e);
        }
        setDisclaimerAccepted(true);
        setCurrentPage(type);
        setIsTransitioning(false);
        console.log('Navigation vers:', type);
      }, 100);
    } catch (error) {
      console.error('Erreur lors de la sélection:', error);
      setDisclaimerAccepted(true);
      setCurrentPage(type);
      setIsTransitioning(false);
    }
  };

  // Retour à l'accueil
  const handleReturnHome = () => {
    setCurrentPage('landing');
    setDisclaimerAccepted(false);
    setCurrentStep(1);
    setRole('');
    setAge('');
    setIsCouple(false);
    setPartnerAge('');
    setBeneficiaires([]);
    setMontants({
      immobilier: 0,
      financier: 0,
      avAvant70: 0,
      avApres70: 0,
      donations: {}
    });
    try {
      localStorage.removeItem('disclaimerAccepted');
    } catch (e) {
      console.warn('localStorage non disponible:', e);
    }
  };

  // Navigation vers pédagogie
  const handleGoToPedagogie = () => {
    try {
      localStorage.setItem('disclaimerAccepted', 'true');
    } catch (e) {
      console.warn('localStorage non disponible:', e);
    }
    setDisclaimerAccepted(true);
    setCurrentPage('pedagogie');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset calculateur succession
  const handleReset = () => {
    setCurrentStep(1);
    setRole('');
    setAge('');
    setIsCouple(false);
    setPartnerAge('');
    setBeneficiaires([]);
    setMontants({
      immobilier: 0,
      financier: 0,
      avAvant70: 0,
      avApres70: 0,
      donations: {}
    });
  };

  // Écran de chargement pendant la transition
  if (isTransitioning) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gold mb-4"></div>
          <p className="text-xl text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  // Détermination du contenu de la page active
  let content;

  if (currentPage === 'pedagogie') {
    content = <PedagogiePage onBack={handleReturnHome} />;
  } else if (currentPage === 'sources') {
    content = <SourcesPage onBack={handleReturnHome} />;
  } else if (!disclaimerAccepted || currentPage === 'landing') {
    content = <LandingPageNew onSelectCalculator={handleSelectCalculator} onOpenCgu={() => setIsCguOpen(true)} />;
  } else if (currentPage === 'lifetime') {
    content = <LifetimeCalculator onBack={handleReturnHome} onGoToPedagogie={handleGoToPedagogie} />;
  } else if (currentPage === 'succession') {
    content = (
      <div className="relative min-h-screen bg-navy">
        {/* Bouton retour accueil */}
        <button
          onClick={handleReturnHome}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 z-40 flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-600"
        >
          <Home className="w-5 h-5" />
          <span className="hidden sm:inline">Retour à l'accueil</span>
        </button>

        <div className="px-4 pt-16 pb-8 sm:pt-20">
        {currentStep === 1 && (
          <Step1Role
            selectedRole={role}
            onRoleChange={setRole}
            age={age}
            onAgeChange={setAge}
            isCouple={isCouple}
            onCoupleChange={setIsCouple}
            partnerAge={partnerAge}
            onPartnerAgeChange={setPartnerAge}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <Step2Beneficiaires
            role={role}
            beneficiaires={beneficiaires}
            onBeneficiairesChange={setBeneficiaires}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
            isCouple={isCouple}
          />
        )}

        {currentStep === 3 && (
          <Step3Amounts
            beneficiaires={beneficiaires}
            montants={montants}
            onMontantsChange={setMontants}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Step4Results
            role={role}
            beneficiaires={beneficiaires}
            montants={montants}
            isCouple={isCouple}
            age={age}
            partnerAge={partnerAge}
            onBack={() => setCurrentStep(3)}
            onReset={handleReset}
          />
        )}
        </div>
      </div>
    );
  } else {
    content = <LandingPageNew onSelectCalculator={handleSelectCalculator} onOpenCgu={() => setIsCguOpen(true)} />;
  }

  // Easter Egg global (clavier Konami Code ou frappe mot 'bercy' / 'caisse')
  const [globalEasterEgg, setGlobalEasterEgg] = useState(null);
  useKonamiEasterEgg((data) => {
    setGlobalEasterEgg(data);
  });

  return (
    <div className="flex flex-col relative min-h-screen bg-navy">
      <BetaBanner />
      <div className="flex-1">
        {content}
      </div>
      <ChatJeanLuc onGoToPedagogie={handleGoToPedagogie} />
      <CookieBanner />
      <CguModal isOpen={isCguOpen} onClose={() => setIsCguOpen(false)} />
      
      {/* Modal Easter Egg Global */}
      {globalEasterEgg && (
        <EasterEggModal
          isOpen={true}
          onClose={() => setGlobalEasterEgg(null)}
          title={globalEasterEgg.title}
          message={globalEasterEgg.message}
          mascotText={globalEasterEgg.mascotText}
          badge="Inspecteur Secret de Bercy"
        />
      )}
    </div>
  );
}

export default App;

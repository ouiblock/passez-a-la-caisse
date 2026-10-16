import { useState, useEffect } from 'react';
import { Home } from 'lucide-react';
import { Step1Profile } from './Step1Profile';
import { Step2Income } from './Step2Income';
import { Step3Consumption } from './Step3Consumption';
import { Step3bisPatrimoine } from './Step3bisPatrimoine';
import { Step4LifetimeResults } from './Step4LifetimeResults';
import { DEFAULT_PROFIL } from '../../types/tax';

export function LifetimeCalculator({ onBack, onGoToPedagogie }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [profil, setProfil] = useState(DEFAULT_PROFIL);

  // Remonter tout en haut à chaque changement d'étape (mobile & desktop)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentStep]);

  const handleStep1Complete = (data) => {
    setProfil({ ...profil, ...data });
    setCurrentStep(2);
  };

  const handleStep2Complete = (data) => {
    setProfil({ ...profil, ...data });
    setCurrentStep(3);
  };

  const handleStep3Complete = (data) => {
    setProfil({ ...profil, ...data });
    setCurrentStep(3.5); // Step 3bis
  };

  const handleStep3bisComplete = (data) => {
    setProfil({ ...profil, ...data });
    setCurrentStep(4);
  };

  const handleStep3bisSkip = () => {
    // Passer directement au step 4 sans placements ni crédits
    setCurrentStep(4);
  };

  const handleBack = () => {
    if (currentStep === 4) {
      setCurrentStep(3.5);
    } else if (currentStep === 3.5) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleReset = () => {
    setProfil(DEFAULT_PROFIL);
    setCurrentStep(1);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 overflow-x-hidden">
      {/* Barre d'actions supérieure */}
      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-40 flex justify-between items-center gap-2 pointer-events-none">
        <button
          onClick={onBack}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-600 shadow-lg"
        >
          <Home className="w-5 h-5" />
          <span className="hidden sm:inline">Retour à l'accueil</span>
        </button>

        <a
          href="mailto:unbilletpourbercy@proton.me?subject=Signalement de bug ou erreur"
          className="pointer-events-auto flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-900/60 hover:bg-red-800/80 text-red-100 rounded-lg transition-colors border border-red-500/30 shadow-lg text-sm"
        >
          <span className="text-base">🐞</span>
          <span className="hidden sm:inline font-medium">Signaler un bug / erreur</span>
        </a>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* En-tête */}
        <div className="text-center mb-8 mt-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
            Fiscalité sur une vie
          </h1>
          <p className="text-base sm:text-xl text-gray-300">
            Calculez tous les impôts et taxes que vous paierez durant votre vie en France
          </p>
        </div>

        {/* Indicateur de progression */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 3.5, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full flex items-center justify-center text-sm sm:text-base font-bold ${
                    step < currentStep
                      ? 'bg-green-600 text-white'
                      : step === currentStep
                      ? 'bg-gold text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {step < currentStep ? '✓' : step === 3.5 ? '3b' : Math.floor(step)}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-1 sm:mx-2 ${
                      step < currentStep ? 'bg-green-600' : 'bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between gap-1 text-[10px] sm:text-sm text-gray-400 text-center">
            <span>Profil</span>
            <span>Revenus</span>
            <span>Conso</span>
            <span>Patrimoine</span>
            <span>Résultats</span>
          </div>
        </div>

        {/* Étapes */}
        {currentStep === 1 && (
          <Step1Profile
            initialData={profil}
            onContinue={handleStep1Complete}
          />
        )}

        {currentStep === 2 && (
          <Step2Income
            initialData={profil}
            onContinue={handleStep2Complete}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && (
          <Step3Consumption
            initialData={profil}
            onContinue={handleStep3Complete}
            onBack={handleBack}
          />
        )}

        {currentStep === 3.5 && (
          <Step3bisPatrimoine
            initialData={profil}
            onContinue={handleStep3bisComplete}
            onSkip={handleStep3bisSkip}
            onBack={handleBack}
          />
        )}

        {currentStep === 4 && (
          <Step4LifetimeResults
            profil={profil}
            onBack={handleBack}
            onReset={handleReset}
            onGoToPedagogie={onGoToPedagogie}
          />
        )}
      </div>
    </div>
  );
}

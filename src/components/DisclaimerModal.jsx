import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export function DisclaimerModal({ onAccept }) {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="max-w-3xl w-full bg-gray-900 border-gold border-2 my-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/20 rounded-full mb-4">
            <Shield className="w-8 h-8 text-gold" />
          </div>
          <h2 className="text-3xl font-bold text-gold mb-2">
            Avertissement juridique
          </h2>
          <p className="text-gray-400">
            Veuillez lire attentivement avant d'utiliser cet outil
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {/* Nature de l'outil */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Outil pédagogique uniquement
                </h3>
                <p className="text-gray-300 text-sm">
                  Simulateur pédagogique indicatif. <strong className="text-red-400">Ne constitue pas un conseil juridique ou fiscal</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Validation professionnelle */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-2">
              ⚖️ Validation professionnelle obligatoire
            </h3>
            <p className="text-gray-300 text-sm">
              <strong className="text-gold">Consultez un notaire ou avocat fiscaliste</strong> avant toute décision patrimoniale.
            </p>
          </div>

          {/* Confidentialité */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  🔒 Confidentialité totale
                </h3>
                <p className="text-gray-300 text-sm">
                  <strong className="text-green-400">Aucune donnée collectée ou stockée</strong>. Calculs 100% locaux dans votre navigateur.
                </p>
              </div>
            </div>
          </div>

          {/* Responsabilité */}
          <div className="bg-red-900/20 rounded-lg p-4 border border-red-700">
            <h3 className="text-base font-bold text-red-400 mb-2">
              ⚠️ Limitation de responsabilité
            </h3>
            <p className="text-gray-300 text-xs">
              Estimations indicatives uniquement. L'éditeur ne saurait être tenu responsable des décisions prises.
            </p>
          </div>
        </div>

        {/* Bouton d'acceptation */}
        <div className="flex flex-col items-center gap-4">
          <Button 
            onClick={onAccept}
            variant="primary"
            className="w-full max-w-md text-lg py-4"
          >
            J'ai lu et j'accepte ces conditions
          </Button>
          <p className="text-xs text-gray-500 text-center">
            En cliquant sur ce bouton, vous reconnaissez avoir pris connaissance de cet avertissement 
            et acceptez d'utiliser cet outil en connaissance de cause.
          </p>
        </div>
      </Card>
    </div>
  );
}

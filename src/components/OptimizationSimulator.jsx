import { useState, useEffect } from 'react';
import { TrendingUp, Calculator, Sparkles } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { calculerDroitsAvecAV } from '../utils/calculations';

export function OptimizationSimulator({ 
  beneficiaires, 
  montantTransmissible, 
  montantsInitiaux,
  isCouple,
  droitsActuels,
  formatNumber,
  onUpdateAV
}) {
  const [avAvant70, setAvAvant70] = useState(montantsInitiaux.avAvant70 || 0);
  const [avApres70, setAvApres70] = useState(montantsInitiaux.avApres70 || 0);
  const [droitsSimules, setDroitsSimules] = useState(droitsActuels);

  // Recalculer à chaque changement
  useEffect(() => {
    const benefsAvecDonations = beneficiaires.map(b => ({
      ...b,
      // Les donations sont déjà dans b.donations
      donations: b.donations || []
    }));

    const { totalDroits } = calculerDroitsAvecAV(
      benefsAvecDonations,
      montantTransmissible,
      avAvant70,
      avApres70,
      isCouple
    );

    setDroitsSimules(totalDroits);
    
    // Mettre à jour localState automatiquement
    if (onUpdateAV) {
      onUpdateAV(avAvant70, avApres70);
    }
  }, [avAvant70, avApres70, beneficiaires, montantTransmissible, montantsInitiaux, isCouple, onUpdateAV]);

  const economieVsActuel = droitsActuels - droitsSimules;
  const avTotal = avAvant70 + avApres70;
  const avInitialTotal = (montantsInitiaux.avAvant70 || 0) + (montantsInitiaux.avApres70 || 0);
  const augmentationAV = avTotal - avInitialTotal;

  return (
    <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-2 border-purple-500">
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
            <Calculator className="w-8 h-8 text-purple-300" />
          </div>
          <h3 className="text-2xl font-bold text-purple-100 mb-2">
            🎯 Simulateur d'optimisation
          </h3>
          <p className="text-purple-200">
            Ajustez vos montants d'assurance-vie et voyez l'impact en temps réel
          </p>
        </div>

        {/* Sliders AV */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-purple-800/30 rounded-lg p-4">
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Assurance-vie avant 70 ans (€)
            </label>
            <input
              type="range"
              min="0"
              max="1000000"
              step="10000"
              value={avAvant70}
              onChange={(e) => setAvAvant70(parseInt(e.target.value))}
              className="w-full h-3 bg-purple-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
            <div className="flex justify-between items-center mt-2">
              <input
                type="number"
                value={avAvant70 || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setAvAvant70(val === '' ? 0 : parseInt(val) || 0);
                }}
                placeholder="0"
                className="w-32 px-3 py-2 bg-purple-700 border border-purple-600 text-white rounded-lg focus:ring-2 focus:ring-purple-400"
              />
              <span className="text-sm text-purple-300">
                {avAvant70 > (montantsInitiaux.avAvant70 || 0) && (
                  <span className="text-green-400">
                    +{formatNumber(avAvant70 - (montantsInitiaux.avAvant70 || 0))}
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="bg-purple-800/30 rounded-lg p-4">
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Assurance-vie après 70 ans (€)
            </label>
            <input
              type="range"
              min="0"
              max="500000"
              step="5000"
              value={avApres70}
              onChange={(e) => setAvApres70(parseInt(e.target.value))}
              className="w-full h-3 bg-purple-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
            <div className="flex justify-between items-center mt-2">
              <input
                type="number"
                value={avApres70 || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setAvApres70(val === '' ? 0 : parseInt(val) || 0);
                }}
                placeholder="0"
                className="w-32 px-3 py-2 bg-purple-700 border border-purple-600 text-white rounded-lg focus:ring-2 focus:ring-purple-400"
              />
              <span className="text-sm text-purple-300">
                {avApres70 > (montantsInitiaux.avApres70 || 0) && (
                  <span className="text-green-400">
                    +{formatNumber(avApres70 - (montantsInitiaux.avApres70 || 0))}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Résultats simulation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-800/30 rounded-lg p-4 text-center">
            <p className="text-sm text-purple-200 mb-1">Droits actuels</p>
            <p className="text-2xl font-bold text-purple-100">{formatNumber(droitsActuels)}</p>
          </div>
          <div className="bg-purple-800/30 rounded-lg p-4 text-center">
            <p className="text-sm text-purple-200 mb-1">Droits avec ajustement</p>
            <p className="text-2xl font-bold text-purple-100">{formatNumber(droitsSimules)}</p>
          </div>
          <div className={`rounded-lg p-4 text-center border-2 ${
            economieVsActuel > 0 
              ? 'bg-gold/20 border-gold' 
              : economieVsActuel < 0
              ? 'bg-red-900/20 border-red-500'
              : 'bg-gray-700/20 border-gray-500'
          }`}>
            <p className={`text-sm mb-1 ${
              economieVsActuel > 0 ? 'text-gold' : economieVsActuel < 0 ? 'text-red-300' : 'text-gray-300'
            }`}>
              {economieVsActuel > 0 ? '💰 Économie supplémentaire' : economieVsActuel < 0 ? '⚠️ Surcoût' : '➡️ Aucun changement'}
            </p>
            <p className={`text-2xl font-bold ${
              economieVsActuel > 0 ? 'text-gold' : economieVsActuel < 0 ? 'text-red-300' : 'text-gray-300'
            }`}>
              {economieVsActuel !== 0 ? formatNumber(Math.abs(economieVsActuel)) : '0 €'}
            </p>
          </div>
        </div>

        {/* Impact positif */}
        {augmentationAV > 0 && economieVsActuel > 0 && (
          <div className="bg-purple-800/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
              <div>
                <p className="text-purple-100 font-bold">
                  En augmentant votre assurance-vie de {formatNumber(augmentationAV)}, 
                  vous économisez {formatNumber(economieVsActuel)} de droits supplémentaires !
                </p>
                <p className="text-sm text-purple-300 mt-2">
                  💡 L'assurance-vie avant 70 ans bénéficie d'un abattement de 152 500 € par bénéficiaire (art. 990 I)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Message spécifique pour neveux/nièces (taux 55%) */}
        {augmentationAV > 0 && economieVsActuel > 0 && beneficiaires.some(b => b.type === 'neveu_niece') && (
          <div className="bg-gold/20 rounded-lg p-4 border-2 border-gold">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
              <div>
                <p className="text-gold font-bold">
                  ⭐ Excellent choix pour les neveux/nièces !
                </p>
                <p className="text-sm text-gold-light mt-2">
                  L'assurance-vie est <strong>particulièrement avantageuse</strong> pour transmettre à vos neveux/nièces :
                </p>
                <ul className="text-sm text-gold-light mt-2 space-y-1 list-disc list-inside">
                  <li><strong>Succession classique : 55% de droits</strong> (taux unique)</li>
                  <li><strong>AV avant 70 ans : 20% de droits</strong> (au-delà de 152 500 €)</li>
                  <li><strong>Économie : 35%</strong> sur chaque euro placé en AV !</li>
                </ul>
                <p className="text-sm text-gold font-bold mt-3">
                  💰 Sur {formatNumber(augmentationAV)}, vous économisez {formatNumber(economieVsActuel)} de droits !
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Impact négatif (surcoût) */}
        {augmentationAV > 0 && economieVsActuel < 0 && (
          <div className="bg-red-900/30 rounded-lg p-4 border border-red-500">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-red-300 flex-shrink-0 mt-1" />
              <div>
                <p className="text-red-100 font-bold">
                  ⚠️ Attention : En augmentant votre assurance-vie de {formatNumber(augmentationAV)}, 
                  vous augmentez les droits de {formatNumber(Math.abs(economieVsActuel))} !
                </p>
                <p className="text-sm text-red-200 mt-2">
                  💡 Vous avez déjà dépassé les abattements AV. Au-delà, l'AV est taxée à 20% (ou au barème si plus favorable).
                  Il peut être plus intéressant de privilégier les donations ou le démembrement.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Conseils */}
        <div className="bg-purple-800/30 rounded-lg p-4 text-xs text-purple-300">
          <p className="font-bold mb-2">💡 Conseils :</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Privilégiez l'AV avant 70 ans pour maximiser les abattements (152 500 € / bénéficiaire)</li>
            <li>Répartissez sur plusieurs bénéficiaires pour multiplier les abattements</li>
            {beneficiaires.some(b => b.type === 'neveu_niece') && (
              <li className="text-gold-light font-bold">
                ⭐ Pour les neveux/nièces : l'AV est taxée à 20% au lieu de 55% (économie de 35% !)
              </li>
            )}
            <li>L'AV après 70 ans a un abattement global de 30 500 € (61 000 € si couple)</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

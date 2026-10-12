import { TrendingDown, CheckCircle, Target, Award } from 'lucide-react';
import { Card } from './ui/Card';
import { SOC } from '../constants/fiscal';

export function GlobalSavingsSummary({ 
  economieDejaRealisee,
  economiePotentielle,
  totalDonations,
  totalAV,
  formatNumber 
}) {
  const economieGlobale = economieDejaRealisee + economiePotentielle;
  const pourcentageRealise = economieGlobale > 0
    ? Math.round((economieDejaRealisee / economieGlobale) * 100) 
    : 0;
  
  // Debug
  console.log('GlobalSavingsSummary:', {
    economieDejaRealisee,
    economiePotentielle,
    economieGlobale,
    pourcentageRealise,
    totalDonations,
    totalAV
  });

  return (
    <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-2 border-blue-500">
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
            <Award className="w-8 h-8 text-blue-300" />
          </div>
          <h3 className="text-3xl font-bold text-blue-100 mb-2">
            📊 Récapitulatif global de vos économies
          </h3>
          <p className="text-blue-200">
            Vue d'ensemble de votre stratégie d'optimisation fiscale
          </p>
        </div>

        {/* Barre de progression */}
        <div className="bg-blue-800/30 rounded-lg p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-blue-200">Progression de votre optimisation</span>
            <span className="text-lg font-bold text-blue-100">{pourcentageRealise}%</span>
          </div>
          <div className="w-full bg-blue-900 rounded-full h-6 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${pourcentageRealise}%` }}
            >
              {pourcentageRealise > 10 && (
                <span className="text-xs font-bold text-white">Déjà réalisé</span>
              )}
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-blue-300">
            <span>0%</span>
            <span>Objectif 100%</span>
          </div>
        </div>

        {/* Détail des économies */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Déjà réalisé */}
          <div className="bg-green-900/30 rounded-lg p-4 border-2 border-green-500">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-sm font-bold text-green-200">Déjà réalisé</p>
            </div>
            <p className="text-3xl font-bold text-green-100 mb-2">
              {formatNumber(economieDejaRealisee)}
            </p>
            <div className="space-y-1 text-xs text-green-300">
              {totalDonations > 0 && (
                <p>• Donations : {formatNumber(totalDonations)}</p>
              )}
              {totalAV > 0 && (
                <p>• Assurance-vie : {formatNumber(totalAV)}</p>
              )}
            </div>
          </div>

          {/* À réaliser */}
          <div className="bg-orange-900/30 rounded-lg p-4 border-2 border-orange-500">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-orange-400" />
              <p className="text-sm font-bold text-orange-200">Potentiel restant</p>
            </div>
            <p className="text-3xl font-bold text-orange-100 mb-2">
              {formatNumber(economiePotentielle)}
            </p>
            <p className="text-xs text-orange-300">
              Suivez nos préconisations pour débloquer ce potentiel
            </p>
          </div>

          {/* Total */}
          <div className="bg-gold/20 rounded-lg p-4 border-2 border-gold">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-gold" />
              <p className="text-sm font-bold text-gold">Économie totale</p>
            </div>
            <p className="text-3xl font-bold text-gold mb-2">
              {formatNumber(economieGlobale)}
            </p>
            <p className="text-xs text-yellow-300">
              Réalisé + Potentiel
            </p>
          </div>
        </div>

        {/* Impact en contexte */}
        <div className="bg-blue-800/30 rounded-lg p-4">
          <p className="text-lg text-blue-100 font-bold mb-3 text-center">
            💰 Votre économie globale représente :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-100">
                {Math.floor(economieGlobale / SOC.smic_net_annuel)}
              </p>
              <p className="text-sm text-blue-300">années de SMIC net</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-100">
                {Math.floor(economieGlobale / SOC.rsa_personne_seule_par_an)}
              </p>
              <p className="text-sm text-blue-300">années de RSA</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-100">
                {Math.floor(economieGlobale / SOC.allocations_familiales_2_enfants_par_an)}
              </p>
              <p className="text-sm text-blue-300">familles (AF 2 enfants) / 1 an</p>
            </div>
          </div>
        </div>

        {/* Message motivant */}
        <div className="bg-blue-800/30 rounded-lg p-4 text-center">
          {pourcentageRealise >= 75 ? (
            <p className="text-lg text-blue-100">
              🏆 <strong>Excellent !</strong> Vous avez déjà réalisé {pourcentageRealise}% de votre potentiel d'optimisation. 
              Continuez sur cette lancée !
            </p>
          ) : pourcentageRealise >= 50 ? (
            <p className="text-lg text-blue-100">
              👍 <strong>Bon travail !</strong> Vous avez réalisé {pourcentageRealise}% de votre potentiel. 
              Il reste encore {formatNumber(economiePotentielle)} à économiser !
            </p>
          ) : pourcentageRealise > 0 ? (
            <p className="text-lg text-blue-100">
              💪 <strong>Bon début !</strong> Vous avez commencé à optimiser ({pourcentageRealise}%). 
              Suivez nos préconisations pour économiser {formatNumber(economiePotentielle)} de plus !
            </p>
          ) : (
            <p className="text-lg text-blue-100">
              🚀 <strong>Énorme potentiel !</strong> Vous pouvez économiser jusqu'à {formatNumber(economiePotentielle)} 
              en suivant nos préconisations !
            </p>
          )}
        </div>

        {/* Message percutant sur la taxation */}
        <div className="bg-gradient-to-r from-red-900 to-orange-900 rounded-lg p-6 border-2 border-orange-500">
          <div className="text-center space-y-4">
            <p className="text-2xl font-bold text-orange-100">
              ⚠️ Ce patrimoine a déjà été taxé... et le sera encore !
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-orange-200">
              <div className="bg-orange-900/30 rounded-lg p-3">
                <p className="font-bold text-orange-100 mb-2">1️⃣ À la création</p>
                <p>Impôt sur le revenu, charges sociales, TVA... Vous avez déjà payé pour constituer ce patrimoine.</p>
              </div>
              <div className="bg-orange-900/30 rounded-lg p-3">
                <p className="font-bold text-orange-100 mb-2">2️⃣ Pendant la détention</p>
                <p>IFI, taxe foncière, impôts sur les revenus fonciers... Vous continuez de payer chaque année.</p>
              </div>
              <div className="bg-orange-900/30 rounded-lg p-3">
                <p className="font-bold text-orange-100 mb-2">3️⃣ À la transmission</p>
                <p>Droits de succession jusqu'à 45% ! Et vos héritiers paieront à nouveau sur leurs revenus futurs.</p>
              </div>
            </div>
            <div className="bg-orange-900/40 rounded-lg p-4 mt-4">
              <p className="text-lg font-bold text-orange-100 mb-2">
                💡 Chaque euro économisé est un euro qui reste dans votre famille
              </p>
              <p className="text-orange-200">
                Ne laissez pas l'État prendre jusqu'à <strong>45% de votre patrimoine</strong> alors que vous avez déjà payé pour le constituer. 
                <strong className="text-orange-100"> Agissez maintenant</strong> pour protéger le fruit de votre travail et le transmettre à vos proches.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-orange-300 text-sm">
              <span>⏰</span>
              <p>Le temps joue contre vous : plus vous attendez, moins vous optimisez.</p>
            </div>
          </div>
        </div>

        {/* Actions recommandées */}
        {economiePotentielle > 0 && (
          <div className="bg-blue-800/30 rounded-lg p-4">
            <p className="text-sm font-bold text-blue-200 mb-3">🎯 Prochaines étapes recommandées :</p>
            <ul className="space-y-2 text-sm text-blue-300">
              <li className="flex items-start gap-2">
                <span className="text-gold">1.</span>
                <span>Consultez les préconisations ci-dessus et cliquez sur "Appliquer"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold">2.</span>
                <span>Utilisez le simulateur pour ajuster vos montants d'assurance-vie</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold">3.</span>
                <span>Prenez rendez-vous avec un notaire pour valider votre stratégie</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

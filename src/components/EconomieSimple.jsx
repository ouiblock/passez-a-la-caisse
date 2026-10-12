import { TrendingDown, Award } from 'lucide-react';
import { Card } from './ui/Card';
import { SOC } from '../constants/fiscal';

/**
 * Affichage simple et clair de l'économie réalisée
 * Une seule source de vérité, pas de calculs complexes
 */
export function EconomieSimple({ 
  droitsSansOptimisation,
  droitsAvecOptimisation,
  formatNumber 
}) {
  const economie = Math.max(0, droitsSansOptimisation - droitsAvecOptimisation);
  const pourcentageEconomie = droitsSansOptimisation > 0
    ? Math.round((economie / droitsSansOptimisation) * 100)
    : 0;
  
  const anneesSmicNet = economie > 0 ? Math.floor(economie / SOC.smic_net_annuel) : 0;
  const anneesRSA = economie > 0 ? Math.floor(economie / SOC.rsa_personne_seule_par_an) : 0;

  return (
    <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-2 border-blue-500">
      <div className="space-y-6">
        {/* Titre */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
            <Award className="w-8 h-8 text-blue-300" />
          </div>
          <h3 className="text-3xl font-bold text-blue-100 mb-2">
            💰 Votre économie fiscale
          </h3>
          <p className="text-blue-200">
            Comparaison entre succession classique et stratégie optimisée
          </p>
        </div>

        {/* Économie réalisée */}
        <div className="bg-gold/20 rounded-lg p-6 border-2 border-gold text-center">
          <p className="text-sm text-gold mb-2">Économie réalisée</p>
          <p className="text-5xl font-bold text-gold mb-2">
            {formatNumber(economie)}
          </p>
          {pourcentageEconomie > 0 && (
            <p className="text-lg text-yellow-300">
              Soit {pourcentageEconomie}% d'économie sur les droits
            </p>
          )}
        </div>

        {/* Comparaison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-900/30 rounded-lg p-4 border-2 border-red-500 text-center">
            <p className="text-sm text-red-200 mb-2">❌ Sans optimisation</p>
            <p className="text-3xl font-bold text-red-100">
              {formatNumber(droitsSansOptimisation)}
            </p>
            <p className="text-xs text-red-300 mt-2">
              Succession classique
            </p>
          </div>
          <div className="bg-green-900/30 rounded-lg p-4 border-2 border-green-500 text-center">
            <p className="text-sm text-green-200 mb-2">✅ Avec optimisation</p>
            <p className="text-3xl font-bold text-green-100">
              {formatNumber(droitsAvecOptimisation)}
            </p>
            <p className="text-xs text-green-300 mt-2">
              Donations + Assurance-vie
            </p>
          </div>
        </div>

        {/* Impact concret */}
        {economie > 0 && (
          <div className="bg-blue-800/30 rounded-lg p-4">
            <p className="text-lg text-blue-100 font-bold mb-3 text-center">
              💡 Concrètement, cette économie représente :
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-100">{anneesSmicNet}</p>
                <p className="text-sm text-blue-300">années de SMIC net</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-100">{anneesRSA}</p>
                <p className="text-sm text-blue-300">années de RSA</p>
              </div>
            </div>
          </div>
        )}

        {/* Message motivant */}
        <div className="bg-blue-800/30 rounded-lg p-4 text-center">
          {economie === 0 ? (
            <p className="text-lg text-blue-100">
              🚀 <strong>Énorme potentiel !</strong> Suivez nos préconisations ci-dessus pour réduire vos droits de succession.
            </p>
          ) : pourcentageEconomie >= 50 ? (
            <p className="text-lg text-blue-100">
              🏆 <strong>Excellent !</strong> Vous avez déjà économisé {pourcentageEconomie}% sur vos droits de succession. 
              Continuez à suivre nos préconisations pour optimiser davantage !
            </p>
          ) : (
            <p className="text-lg text-blue-100">
              👍 <strong>Bon début !</strong> Vous avez économisé {formatNumber(economie)} ({pourcentageEconomie}%). 
              Suivez nos préconisations pour économiser encore plus !
            </p>
          )}
        </div>

        {/* Message percutant */}
        <div className="bg-gradient-to-r from-red-900 to-orange-900 rounded-lg p-6 border-2 border-orange-500">
          <div className="text-center space-y-3">
            <p className="text-2xl font-bold text-orange-100">
              ⚠️ Ce patrimoine a déjà été taxé... et le sera encore !
            </p>
            <p className="text-orange-200">
              Ne laissez pas l'État prendre jusqu'à <strong>45% de votre patrimoine</strong> alors que vous avez déjà payé pour le constituer. 
              <strong className="text-orange-100"> Chaque euro économisé reste dans votre famille.</strong>
            </p>
            <div className="flex items-center justify-center gap-2 text-orange-300 text-sm">
              <TrendingDown className="w-4 h-4" />
              <p>Le temps joue contre vous : plus vous attendez, moins vous optimisez.</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

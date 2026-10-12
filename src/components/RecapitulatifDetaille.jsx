import { Calculator, TrendingDown, Users, Home, Briefcase, Shield, PiggyBank } from 'lucide-react';
import { Card } from './ui/Card';
import { SOC } from '../constants/fiscal';
import { getAbattement } from '../utils/calculations';

export function RecapitulatifDetaille({ 
  montants,
  beneficiaires,
  totalDroits,
  droitsSansOpti,
  economie,
  totalAV,
  totalDonations,
  isCouple,
  formatNumber 
}) {
  const patrimoineTotal = (montants.immobilier || 0) + (montants.financier || 0);
  const montantTransmissible = patrimoineTotal;
  const nbBeneficiaires = beneficiaires.reduce((sum, b) => sum + (b.nombre || 1), 0);
  
  // Calcul des abattements DISPONIBLES (après déduction des donations)
  const multiplicateurCouple = isCouple ? 2 : 1;
  
  // Calculer les donations consommées par bénéficiaire
  const calculerDonationsConsommees = (donations) => {
    const now = new Date().getFullYear();
    return donations
      .filter(d => (now - d.annee) <= 15)  // Donations des 15 dernières années
      .reduce((sum, d) => sum + d.montant, 0);
  };
  
  // Abattements disponibles par type (après déduction donations)
  const detailAbattements = beneficiaires.map(b => {
    const abattementUnitaire = getAbattement(b.type, 'succession');
    const nombreBenef = b.nombre || 1;
    const abattementHandicap = b.handicap ? 159325 : 0;
    const abattementBase = abattementUnitaire * nombreBenef * multiplicateurCouple;
    const abattementHandicapTotal = abattementHandicap * nombreBenef;
    const abattementBrut = abattementBase + abattementHandicapTotal;
    
    // Déduire les donations consommées
    const donationsConsommees = calculerDonationsConsommees(b.donations || []);
    const abattementDisponible = Math.max(0, abattementBrut - donationsConsommees);
    
    return {
      type: b.type,
      nombre: nombreBenef,
      handicap: b.handicap || false,
      abattementUnitaire,
      abattementHandicap,
      abattementBrut,
      donationsConsommees,
      abattementDisponible
    };
  });
  
  // Total des abattements DISPONIBLES
  const abattementsTotaux = detailAbattements.reduce((sum, d) => sum + d.abattementDisponible, 0);

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-slate-600">
      <div className="space-y-6">
        {/* Titre */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/30 rounded-full mb-4">
            <Calculator className="w-8 h-8 text-slate-300" />
          </div>
          <h2 className="text-3xl font-bold text-slate-100 mb-2">
            📊 Récapitulatif détaillé de votre transmission
          </h2>
          <p className="text-slate-300">
            Analyse complète de votre situation patrimoniale et fiscale
          </p>
        </div>

        {/* Section 1 : Patrimoine */}
        <div className="bg-slate-800/50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-400" />
            1. Votre patrimoine
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Immobilier</p>
              <p className="text-2xl font-bold text-slate-100">{formatNumber(montants.immobilier || 0)}</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Financier</p>
              <p className="text-2xl font-bold text-slate-100">{formatNumber(montants.financier || 0)}</p>
            </div>
            <div className="bg-blue-900/30 rounded-lg p-4 border-2 border-blue-500">
              <p className="text-sm text-blue-300 mb-1">Total patrimoine</p>
              <p className="text-2xl font-bold text-blue-100">{formatNumber(patrimoineTotal)}</p>
            </div>
          </div>
        </div>

        {/* Section 2 : Bénéficiaires */}
        <div className="bg-slate-800/50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            2. Vos bénéficiaires
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Nombre de bénéficiaires</p>
              <p className="text-2xl font-bold text-slate-100">{nbBeneficiaires}</p>
              <p className="text-xs text-slate-500 mt-2">
                {beneficiaires.map(b => `${b.nombre || 1} ${b.type}`).join(', ')}
              </p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Statut</p>
              <p className="text-2xl font-bold text-slate-100">{isCouple ? 'Couple' : 'Personne seule'}</p>
              <p className="text-xs text-slate-500 mt-2">
                {isCouple ? 'Abattements doublés (×2)' : 'Abattements simples'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3 : Optimisations en place */}
        <div className="bg-slate-800/50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            3. Optimisations en place
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Donations effectuées</p>
              <p className="text-2xl font-bold text-slate-100">{formatNumber(totalDonations)}</p>
              <p className="text-xs text-slate-500 mt-2">
                {totalDonations > 0 ? 'Abattements consommés' : 'Aucune donation'}
              </p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Assurance-vie</p>
              <p className="text-2xl font-bold text-slate-100">{formatNumber(totalAV)}</p>
              <p className="text-xs text-slate-500 mt-2">
                {totalAV > 0 ? 'Hors succession classique' : 'Aucune AV'}
              </p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Abattements disponibles</p>
              <p className="text-2xl font-bold text-slate-100">{formatNumber(abattementsTotaux)}</p>
              <div className="text-xs text-slate-500 mt-2 space-y-1">
                {detailAbattements.map((detail, idx) => (
                  <div key={idx}>
                    {detail.nombre} {detail.type} × {formatNumber(detail.abattementUnitaire)} 
                    {isCouple && ' × 2'}
                    {detail.handicap && ` + ${formatNumber(detail.abattementHandicap)} (handicap)`}
                    {' = '}{formatNumber(detail.abattementBrut)}
                    {detail.donationsConsommees > 0 && (
                      <span className="text-orange-400">
                        {' - '}{formatNumber(detail.donationsConsommees)} (donations) = {formatNumber(detail.abattementDisponible)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4 : Calcul des droits */}
        <div className="bg-slate-800/50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-orange-400" />
            4. Calcul des droits de succession
          </h3>
          
          {/* Étape par étape */}
          <div className="space-y-4">
            {/* Étape 1 */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-300">Étape 1 : Patrimoine transmissible</span>
                <span className="text-lg font-bold text-slate-100">{formatNumber(montantTransmissible)}</span>
              </div>
              <p className="text-xs text-slate-500">
                Immobilier ({formatNumber(montants.immobilier || 0)}) + Financier ({formatNumber(montants.financier || 0)})
              </p>
            </div>

            {/* Étape 2 */}
            {totalAV > 0 && (
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-300">Étape 2 : Assurance-vie (hors succession)</span>
                  <span className="text-lg font-bold text-green-400">- {formatNumber(totalAV)}</span>
                </div>
                <p className="text-xs text-slate-500">
                  L'AV bénéficie d'une fiscalité avantageuse (art. 990 I et 757 B)
                </p>
              </div>
            )}

            {/* Étape 3 */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-300">Étape 3 : Application des abattements</span>
                <span className="text-lg font-bold text-green-400">- {formatNumber(abattementsTotaux)}</span>
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                {detailAbattements.map((detail, idx) => (
                  <div key={idx}>
                    • {detail.nombre} {detail.type} × {formatNumber(detail.abattementUnitaire)} 
                    {isCouple && ' × 2'}
                    {detail.handicap && ` + ${formatNumber(detail.abattementHandicap)} (handicap)`}
                    {' = '}{formatNumber(detail.abattementBrut)}
                    {detail.donationsConsommees > 0 && (
                      <span className="text-orange-400">
                        {' - '}{formatNumber(detail.donationsConsommees)} (donations) = {formatNumber(detail.abattementDisponible)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Étape 4 */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-300">Étape 4 : Base taxable</span>
                <span className="text-lg font-bold text-orange-300">
                  {formatNumber(Math.max(0, montantTransmissible - abattementsTotaux))}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Patrimoine - Abattements = Montant soumis au barème progressif
              </p>
            </div>

            {/* Étape 5 */}
            <div className="bg-red-900/30 rounded-lg p-4 border-2 border-red-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-red-200">Étape 5 : Droits de succession (barème progressif)</span>
                <span className="text-2xl font-bold text-red-100">{formatNumber(totalDroits)}</span>
              </div>
              <p className="text-xs text-red-300">
                Taux progressif de 5% à 45% selon les tranches (ligne directe)
              </p>
            </div>
          </div>
        </div>

        {/* Section 5 : Comparaison */}
        <div className="bg-gradient-to-r from-red-900 to-green-900 rounded-lg p-6 border-2 border-gold">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-gold" />
            5. Impact de vos optimisations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-red-900/40 rounded-lg p-4 text-center">
              <p className="text-sm text-red-200 mb-1">Sans optimisation</p>
              <p className="text-3xl font-bold text-red-100">{formatNumber(droitsSansOpti)}</p>
              <p className="text-xs text-red-300 mt-2">Scénario pessimiste</p>
            </div>
            <div className="bg-green-900/40 rounded-lg p-4 text-center">
              <p className="text-sm text-green-200 mb-1">Avec optimisations</p>
              <p className="text-3xl font-bold text-green-100">{formatNumber(totalDroits)}</p>
              <p className="text-xs text-green-300 mt-2">Situation actuelle</p>
            </div>
            <div className="bg-gold/30 rounded-lg p-4 text-center border-2 border-gold">
              <p className="text-sm text-gold mb-1">💰 Économie</p>
              <p className="text-3xl font-bold text-gold">{formatNumber(economie)}</p>
              <p className="text-xs text-yellow-300 mt-2">Argent sauvé !</p>
            </div>
          </div>

          {/* Mise en perspective */}
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-lg font-bold text-white mb-3 text-center">
              💡 Cette économie représente :
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center text-sm">
              <div>
                <p className="text-3xl font-bold text-blue-300">{Math.floor(economie / SOC.smic_net_annuel)}</p>
                <p className="text-slate-400">années de SMIC net</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-300">{Math.floor(economie / SOC.rsa_personne_seule_par_an)}</p>
                <p className="text-slate-400">années de RSA</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-300">{Math.floor(economie / SOC.allocations_familiales_2_enfants_par_an)}</p>
                <p className="text-slate-400">familles (AF 2 enfants) / 1 an</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 6 : Répartition finale */}
        <div className="bg-slate-800/50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-green-400" />
            6. Ce que vos héritiers reçoivent réellement
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-slate-700/30 rounded-lg p-4">
              <span className="text-slate-300">Patrimoine total transmis</span>
              <span className="text-xl font-bold text-slate-100">{formatNumber(patrimoineTotal + totalAV)}</span>
            </div>
            <div className="flex justify-between items-center bg-red-900/20 rounded-lg p-4">
              <span className="text-red-300">Moins : Droits de succession</span>
              <span className="text-xl font-bold text-red-200">- {formatNumber(totalDroits)}</span>
            </div>
            <div className="flex justify-between items-center bg-green-900/30 rounded-lg p-4 border-2 border-green-500">
              <span className="text-green-200 font-bold">Net reçu par les héritiers</span>
              <span className="text-2xl font-bold text-green-100">{formatNumber(patrimoineTotal + totalAV - totalDroits)}</span>
            </div>
          </div>

          <div className="mt-4 bg-blue-900/20 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-200">
              Taux effectif de taxation : <strong className="text-blue-100 text-lg">
                {((totalDroits / (patrimoineTotal + totalAV)) * 100).toFixed(1)}%
              </strong>
            </p>
            <p className="text-xs text-blue-300 mt-2">
              Au lieu de ~{((droitsSansOpti / (patrimoineTotal + totalAV)) * 100).toFixed(1)}% sans optimisation
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

import { useState } from 'react';
import { TrendingUp, Home as HomeIcon, CreditCard, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export function Step3bisPatrimoine({ initialData, onContinue, onBack, onSkip }) {
  // Placements par type (avec fiscalité spécifique)
  const [pea, setPea] = useState(initialData.placements?.pea || 0);
  const [assuranceVie, setAssuranceVie] = useState(initialData.placements?.assuranceVie || 0);
  const [cto, setCto] = useState(initialData.placements?.cto || 0); // Compte-titres ordinaire
  const [livrets, setLivrets] = useState(initialData.placements?.livrets || 0); // Livrets défiscalisés
  const [autresPlacements, setAutresPlacements] = useState(initialData.placements?.autresPlacements || 0);
  
  const [rendementPct, setRendementPct] = useState(initialData.placements?.rendementPct || 3);
  const [revenusFonciersAnnuels, setRevenusFonciersAnnuels] = useState(initialData.placements?.revenusFonciersAnnuels || 0);
  const [cash, setCash] = useState(initialData.patrimoine?.cash || 0);
  const [capitalRestant, setCapitalRestant] = useState(initialData.credits?.capitalRestant || 0);
  const [tauxPct, setTauxPct] = useState(initialData.credits?.tauxPct || 2.5);
  const [dureeRestanteAns, setDureeRestanteAns] = useState(initialData.credits?.dureeRestanteAns || 0);

  // Calculer le patrimoine immobilier net pour l'IFI
  const calculatePatrimoineImmoNet = () => {
    let total = 0;
    if (initialData.logement.rpAchat && initialData.logement.rpPrix) {
      total += initialData.logement.rpPrix * 0.7; // Abattement 30% RP
    }
    if (initialData.logement.rsAchat && initialData.logement.rsPrix) {
      total += initialData.logement.rsPrix;
    }
    total -= capitalRestant; // Déduire les crédits
    return total;
  };

  const patrimoineImmoNet = calculatePatrimoineImmoNet();
  const isIFIApplicable = patrimoineImmoNet >= 1310000;

  const handleSubmit = (e) => {
    e.preventDefault();
    const capitalTotal = pea + assuranceVie + cto + livrets + autresPlacements;
    onContinue({
      placements: {
        pea,
        assuranceVie,
        cto,
        livrets,
        autresPlacements,
        capitalTotal, // Total pour compatibilité
        rendementPct,
        revenusFonciersAnnuels
      },
      patrimoine: {
        cash
      },
      credits: {
        capitalRestant,
        tauxPct,
        dureeRestanteAns
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-5 sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Étape 3 bis : Patrimoine & Placements (optionnel)
          </h2>
          <p className="text-gray-400">
            Ces informations permettent de calculer la flat tax (31.6%) et l'IFI si applicable
          </p>
        </div>

        {/* Placements financiers */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gold" />
            Placements financiers
          </h3>

          <div className="space-y-4">
            {/* PEA */}
            <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
              <label className="block text-sm font-medium text-green-300 mb-2">
                💚 PEA (Plan d'Épargne en Actions)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="0"
                  max="10000000"
                  step="10000"
                  value={pea || ''}
                  onChange={(e) => setPea(e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <span className="text-gray-400">€</span>
              </div>
              <p className="text-xs text-green-300 mt-1">
                Exonération d'impôt après 5 ans • Prélèvements sociaux 17.2%
              </p>
            </div>

            {/* Assurance-vie */}
            <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
              <label className="block text-sm font-medium text-blue-300 mb-2">
                💙 Assurance-vie
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="0"
                  max="10000000"
                  step="10000"
                  value={assuranceVie || ''}
                  onChange={(e) => setAssuranceVie(e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400">€</span>
              </div>
              <p className="text-xs text-blue-300 mt-1">
                Après 8 ans : abattement 4600€/9200€ couple • Puis 7.5% + PS 17.2%
              </p>
            </div>

            {/* Compte-titres ordinaire */}
            <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
              <label className="block text-sm font-medium text-red-300 mb-2">
                ❤️ Compte-titres ordinaire (CTO)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="0"
                  max="10000000"
                  step="10000"
                  value={cto || ''}
                  onChange={(e) => setCto(e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <span className="text-gray-400">€</span>
              </div>
              <p className="text-xs text-red-300 mt-1">
                Flat tax 30% (12.8% IR + 17.2% PS) ou barème progressif
              </p>
            </div>

            {/* Livrets défiscalisés */}
            <div className="p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <label className="block text-sm font-medium text-yellow-300 mb-2">
                💛 Livrets défiscalisés (Livret A, LEP, LDDS...)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="0"
                  max="500000"
                  step="1000"
                  value={livrets || ''}
                  onChange={(e) => setLivrets(e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-yellow-500"
                />
                <span className="text-gray-400">€</span>
              </div>
              <p className="text-xs text-yellow-300 mt-1">
                Totalement exonérés d'impôt et de prélèvements sociaux
              </p>
            </div>

            {/* Autres placements */}
            <div className="p-3 bg-purple-900/20 border border-purple-700 rounded-lg">
              <label className="block text-sm font-medium text-purple-300 mb-2">
                💜 Autres placements (SCPI, obligations, crypto...)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="0"
                  max="10000000"
                  step="10000"
                  value={autresPlacements || ''}
                  onChange={(e) => setAutresPlacements(e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-gray-400">€</span>
              </div>
              <p className="text-xs text-purple-300 mt-1">
                Fiscalité variable selon le type de placement
              </p>
            </div>

            {/* Rendement */}
            {(pea + assuranceVie + cto + livrets + autresPlacements) > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rendement annuel moyen estimé
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={rendementPct}
                    onChange={(e) => setRendementPct(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold"
                  />
                  <div className="w-24 text-center">
                    <span className="text-2xl font-bold text-gold">{rendementPct}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Rendement moyen attendu (dividendes, intérêts, plus-values...)
                </p>
                
                {/* Estimation revenus et fiscalité */}
                <div className="mt-3 p-3 bg-blue-900/30 rounded-lg border border-blue-700">
                  <p className="text-sm text-blue-300 mb-1">
                    <strong>💰 Capital total :</strong> {(pea + assuranceVie + cto + livrets + autresPlacements).toLocaleString('fr-FR')} €
                  </p>
                  <p className="text-sm text-blue-300 mb-1">
                    <strong>📈 Revenus annuels estimés :</strong> {((pea + assuranceVie + cto + livrets + autresPlacements) * rendementPct / 100).toLocaleString('fr-FR')} €
                  </p>
                  <p className="text-xs text-blue-400 mt-2">
                    Fiscalité appliquée selon chaque enveloppe (PEA, AV, CTO, livrets...)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Revenus fonciers */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              💼 Revenus fonciers annuels (optionnel)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max="500000"
                step="1000"
                value={revenusFonciersAnnuels || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setRevenusFonciersAnnuels(val === '' ? 0 : parseInt(val) || 0);
                }}
                placeholder="0"
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-gold focus:border-gold text-lg"
              />
              <span className="text-gray-400">€/an</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Loyers perçus annuellement (nu, meublé, LMNP...). Fiscalité moyenne appliquée : ~40% (charges + IR + prélèvements sociaux)
            </p>
            
            {revenusFonciersAnnuels > 0 && (
              <div className="mt-3 p-3 bg-purple-900/30 rounded-lg border border-purple-700">
                <p className="text-sm text-purple-300 mb-1">
                  <strong>🏠 Revenus fonciers bruts :</strong> {revenusFonciersAnnuels.toLocaleString('fr-FR')} €/an
                </p>
                <p className="text-sm text-purple-300">
                  <strong>💸 Fiscalité estimée (~40%) :</strong> {Math.round(revenusFonciersAnnuels * 0.40).toLocaleString('fr-FR')} €/an
                </p>
                <p className="text-xs text-purple-400 mt-2">
                  Taux moyen incluant : charges déductibles (~30%), IR sur le net (~20%), prélèvements sociaux (17.2%)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cash / Épargne */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <HomeIcon className="w-5 h-5 text-gold" />
            Cash & Épargne (pour estimation succession)
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Épargne liquide (livrets, comptes courants, cash...)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max="5000000"
                step="10000"
                value={cash || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setCash(val === '' ? 0 : parseInt(val) || 0);
                }}
                placeholder="0"
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-gold focus:border-gold text-lg"
              />
              <span className="text-gray-400">€</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Montant d'épargne liquide qui sera transmis à vos héritiers (hors placements déjà renseignés)
            </p>
          </div>
        </div>

        {/* Crédits immobiliers */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gold" />
            Crédits immobiliers en cours
          </h3>

          <div className="space-y-4">
            {/* Capital restant dû */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Capital restant dû
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="0"
                  max="2000000"
                  step="10000"
                  value={capitalRestant || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCapitalRestant(val === '' ? 0 : parseInt(val) || 0);
                  }}
                  placeholder="0"
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-gold focus:border-gold text-lg"
                />
                <span className="text-gray-400">€</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Montant total qu'il vous reste à rembourser
              </p>
            </div>

            {capitalRestant > 0 && (
              <>
                {/* Taux d'intérêt */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Taux d'intérêt du crédit
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0.5"
                      max="5"
                      step="0.1"
                      value={tauxPct}
                      onChange={(e) => setTauxPct(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold"
                    />
                    <div className="w-24 text-center">
                      <span className="text-2xl font-bold text-gold">{tauxPct}%</span>
                    </div>
                  </div>
                </div>

                {/* Durée restante */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Durée restante
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={dureeRestanteAns || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDureeRestanteAns(val === '' ? 0 : parseInt(val) || 0);
                      }}
                      className="w-32 px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-gold focus:border-gold text-lg"
                    />
                    <span className="text-gray-400">années</span>
                  </div>
                </div>

                {/* Estimation intérêts */}
                {dureeRestanteAns > 0 && (
                  <div className="p-3 bg-orange-900/30 rounded-lg border border-orange-700">
                    <p className="text-sm text-orange-300">
                      <strong>💳 Intérêts totaux estimés :</strong> {Math.round((capitalRestant * tauxPct / 100 * dureeRestanteAns) / 2).toLocaleString('fr-FR')} €
                    </p>
                    <p className="text-xs text-orange-400 mt-1">
                      (Calcul simplifié : capital × taux × durée ÷ 2)
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* IFI */}
        {isIFIApplicable && (
          <div className="mb-8 p-4 bg-red-900/30 rounded-lg border-2 border-red-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-lg font-bold text-red-300 mb-2">
                  ⚠️ IFI applicable
                </h4>
                <p className="text-sm text-red-200 mb-2">
                  Votre patrimoine immobilier net ({patrimoineImmoNet.toLocaleString('fr-FR')} €) 
                  dépasse le seuil de 1 310 000 €. Vous êtes soumis à l'IFI (Impôt sur la Fortune Immobilière).
                </p>
                <p className="text-xs text-red-300">
                  Barème progressif de 0.5% à 1.5% selon les tranches. 
                  Abattement de 30% déjà appliqué sur la résidence principale.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-sm text-gray-300">
            <strong>💡 Pourquoi ces informations ?</strong>
          </p>
          <ul className="text-xs text-gray-400 mt-2 space-y-1">
            <li>• <strong>Flat tax 31.6%</strong> : Taxe sur les revenus du capital (loi de finances 2026)</li>
            <li>• <strong>IFI</strong> : Si patrimoine immobilier net ≥ 1.31M€</li>
            <li>• <strong>Intérêts crédits</strong> : Ce que vous payez à la banque (pas une taxe, mais un coût)</li>
          </ul>
        </div>

        {/* Boutons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onBack}
          >
            ← Retour
          </Button>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => onSkip()}
            >
              Passer cette étape
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="px-8"
            >
              Voir les résultats →
            </Button>
          </div>
        </div>
      </Card>
    </form>
  );
}

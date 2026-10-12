import { useState, useEffect } from 'react';
import { Download, RefreshCw, TrendingUp, PieChart, Info, BookOpen, ExternalLink, Loader2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { estimateLifetimeTaxes, calculatePerPerson } from '../../utils/lifetime/lifetimeCalculations';
import { estimateSuccessionHeritiers } from '../../utils/lifetime/adapters/successionEstimation';
import { enregistrerSimulation } from '../../utils/statsTracker';
import { EquivalencesCard } from './EquivalencesCard';
import { TimelineDetailCard } from './TimelineDetailCard';
import { SuccessionEstimationCard } from './SuccessionEstimationCard';
import { exportLifetimePDF } from '../../utils/exportLifetimePDF';

const CATEGORIES = [
  { key: 'tvaConso', label: 'TVA sur consommation', color: 'bg-red-500', description: 'TVA payée sur vos achats quotidiens' },
  { key: 'cotSalariales', label: 'Cotisations salariales', color: 'bg-orange-500', description: 'Prélevées sur votre salaire brut' },
  { key: 'cotPatronales', label: 'Cotisations patronales', color: 'bg-yellow-500', description: 'Payées par votre employeur' },
  { key: 'impotRevenu', label: 'Impôt sur le revenu', color: 'bg-green-500', description: 'Barème progressif selon vos revenus' },
  { key: 'flatTaxPlacements', label: 'Flat tax placements', color: 'bg-teal-500', description: 'PFU 31.6% sur revenus du capital' },
  { key: 'fiscaliteRevenusFonciers', label: 'Fiscalité revenus fonciers', color: 'bg-purple-700', description: 'Charges + IR + PS sur loyers (~40%)' },
  { key: 'ifi', label: 'IFI', color: 'bg-red-700', description: 'Impôt sur la Fortune Immobilière' },
  { key: 'energieCarburant', label: 'Taxes carburant', color: 'bg-blue-500', description: 'TICPE et TVA sur le carburant' },
  { key: 'energieElectricite', label: 'Taxes électricité', color: 'bg-indigo-500', description: 'TICFE et TVA sur l\'électricité' },
  { key: 'energieGaz', label: 'Taxes gaz', color: 'bg-purple-500', description: 'TICGN et TVA sur le gaz' },
  { key: 'logementNotaire', label: 'Frais notaire', color: 'bg-pink-500', description: 'Droits de mutation immobilière' },
  { key: 'taxeFonciere', label: 'Taxe foncière', color: 'bg-rose-500', description: 'Taxe annuelle sur la propriété' },
  { key: 'retraitesPrelevSociaux', label: 'Prélèvements retraite', color: 'bg-cyan-500', description: 'CSG/CRDS/CASA sur pension' },
  { key: 'droitsSuccession', label: 'Droits de succession', color: 'bg-orange-700', description: 'Ce que vos héritiers paieront' },
  { key: 'interetsCredits', label: 'Intérêts crédits', color: 'bg-gray-500', description: 'Intérêts payés à la banque (pas une taxe)' }
];

export function Step4LifetimeResults({ profil, onBack, onReset, onGoToPedagogie }) {
  const [showDetails, setShowDetails] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  
  // Calcul des résultats
  const resultats = estimateLifetimeTaxes(profil);
  const successionEstimation = estimateSuccessionHeritiers(profil);
  
  // Ajouter les droits de succession aux résultats
  const resultatsAvecSuccession = {
    ...resultats,
    droitsSuccession: successionEstimation.droitsTotal
  };
  
  const totalAvecSuccession = resultats.total + successionEstimation.droitsTotal;
  const { total, parPersonne } = calculatePerPerson(resultats, profil);

  const formatEuro = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleExportPDF = async () => {
    setPdfLoading(true);
    try {
      await exportLifetimePDF(profil, resultats, successionEstimation);
    } catch (err) {
      console.error('Erreur export PDF:', err);
      alert('Une erreur est survenue lors de la génération du PDF. Consultez la console pour les détails.');
    } finally {
      setPdfLoading(false);
    }
  };

  // Calcul des pourcentages pour le graphique (avec succession)
  const totalNonNul = totalAvecSuccession > 0 ? totalAvecSuccession : 1;
  const categoriesAvecPourcentage = CATEGORIES.map(cat => ({
    ...cat,
    montant: resultatsAvecSuccession[cat.key] || 0,
    pourcentage: ((resultatsAvecSuccession[cat.key] || 0) / totalNonNul) * 100
  })).filter(cat => cat.montant > 0);

  // Enregistrer les stats une seule fois au chargement
  useEffect(() => {
    enregistrerSimulation({
      montantTotal: totalAvecSuccession,
      economiesPotentielles: successionEstimation.droitsTotal,
      type: 'vie'
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      {/* Message de M. Jean-Luc Chat */}
      <div className="flex items-start gap-4 p-6 bg-navy-light/40 border border-gold/20 rounded-2xl relative overflow-hidden animate-fade-in-up">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <img 
          src="/images/jean-luc-chat.jpg" 
          alt="Monsieur Jean-Luc Chat" 
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-gold shadow-lg object-cover"
        />
        <div className="flex-1 mt-1">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-bold text-white text-base sm:text-lg">M. Jean-Luc Chat</h3>
            <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider text-gold bg-gold/10 rounded-full border border-gold/20">
              Inspecteur Principal
            </span>
          </div>
          <div className="relative">
            <p className="text-sm sm:text-base text-slate-300 italic leading-relaxed">
              "J'ai minutieusement épluché votre dossier. Le bilan est fait. Il est temps de... <strong className="text-gold text-lg">passer à la caisse</strong>."
            </p>
          </div>
        </div>
      </div>

      {/* Total des revenus nets cumulés sur votre vie */}
      <Card className="p-5 sm:p-8 bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-600">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            💼 Total des revenus nets cumulés sur votre vie
          </h2>
          <div className="text-3xl sm:text-5xl md:text-6xl font-bold text-green-400 mb-4 break-words">
            {formatEuro(resultats.richesseTotaleCreee || 0)}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-3 bg-green-900/30 rounded-lg">
              <div className="text-xs text-green-300 mb-1">Salaires nets</div>
              <div className="text-lg font-bold text-white">
                {formatEuro(resultats.detailRichesse?.revenusSalariauxNets || 0)}
              </div>
            </div>
            <div className="p-3 bg-green-900/30 rounded-lg">
              <div className="text-xs text-green-300 mb-1">Pensions nettes</div>
              <div className="text-lg font-bold text-white">
                {formatEuro(resultats.detailRichesse?.revenusRetraiteNets || 0)}
              </div>
            </div>
            {resultats.detailRichesse?.revenusPlacementsBruts > 0 && (
              <div className="p-3 bg-green-900/30 rounded-lg">
                <div className="text-xs text-green-300 mb-1">Revenus placements</div>
                <div className="text-lg font-bold text-white">
                  {formatEuro(resultats.detailRichesse?.revenusPlacementsBruts || 0)}
                </div>
              </div>
            )}
            {resultats.detailRichesse?.revenusFonciersBruts > 0 && (
              <div className="p-3 bg-green-900/30 rounded-lg">
                <div className="text-xs text-green-300 mb-1">Revenus fonciers</div>
                <div className="text-lg font-bold text-white">
                  {formatEuro(resultats.detailRichesse?.revenusFonciersBruts || 0)}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Carte principale - Total */}
      <Card className="p-5 sm:p-8 bg-gradient-to-br from-gold/20 to-yellow-900/20 border-2 border-gold">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Total des impôts et taxes sur votre vie
          </h2>
          <div className="text-4xl sm:text-6xl md:text-7xl font-bold text-gold mb-4 break-words">
            {formatEuro(totalAvecSuccession)}
          </div>
          <div className="text-lg sm:text-xl text-green-400 mb-2">
            Soit {((totalAvecSuccession / (resultats.richesseTotaleCreee || 1)) * 100).toFixed(1)}% de vos revenus nets cumulés
          </div>
          {successionEstimation.droitsTotal > 0 && (
            <div className="text-sm text-gray-400 mb-2">
              Dont {formatEuro(successionEstimation.droitsTotal)} de droits de succession pour vos héritiers
            </div>
          )}
          {profil.situation === 'couple' && (
            <div className="text-xl text-gray-300">
              Soit {formatEuro(parPersonne)} par personne (hors succession)
            </div>
          )}
          <div className="mt-4 text-gray-400">
            {profil.statut === 'retraite' ? (
              <p>
                Carrière : {profil.ageDebutCarriere || 22} à {profil.retraiteAge} ans ({profil.retraiteAge - (profil.ageDebutCarriere || 22)} ans)
                <br />
                Retraite : {profil.age} à {profil.esperanceVie} ans ({profil.esperanceVie - profil.age} ans)
                <br />
                <span className="text-gold font-medium">Total : {profil.esperanceVie - (profil.ageDebutCarriere || 22)} ans</span>
              </p>
            ) : (
              <p>
                De {profil.ageDebutCarriere || 22} à {profil.esperanceVie} ans 
                <span className="text-gold font-medium"> ({profil.esperanceVie - (profil.ageDebutCarriere || 22)} ans)</span>
                <br />
                <span className="text-sm">Carrière : {profil.ageDebutCarriere || 22} à {profil.retraiteAge} ans • Retraite : {profil.retraiteAge} à {profil.esperanceVie} ans</span>
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Répartition par catégorie */}
      <Card className="p-5 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <PieChart className="w-6 h-6 text-gold" />
            Répartition par catégorie
          </h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-gold hover:text-yellow-400 transition-colors flex items-center gap-1"
          >
            <Info className="w-4 h-4" />
            {showDetails ? 'Masquer' : 'Afficher'} les détails
          </button>
        </div>

        {/* Barres empilées */}
        <div className="mb-6">
          <div className="h-12 flex rounded-lg overflow-hidden">
            {categoriesAvecPourcentage.map((cat) => (
              <div
                key={cat.key}
                className={`${cat.color} relative group cursor-pointer transition-all hover:opacity-80`}
                style={{ width: `${cat.pourcentage}%` }}
                title={`${cat.label}: ${formatEuro(cat.montant)} (${cat.pourcentage.toFixed(1)}%)`}
              >
                {cat.pourcentage > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                    {cat.pourcentage.toFixed(0)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Liste détaillée */}
        <div className="space-y-3">
          {categoriesAvecPourcentage.map((cat) => (
            <div key={cat.key} className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded ${cat.color} flex-shrink-0`}></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{cat.label}</span>
                  <span className="text-gold font-bold">{formatEuro(cat.montant)}</span>
                </div>
                {showDetails && (
                  <p className="text-xs text-gray-400 mt-1">{cat.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Timeline simplifiée */}
      <Card className="p-5 sm:p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-gold" />
          Évolution dans le temps
        </h3>

        <div className="space-y-4">
          {/* Phases de vie */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Vie active */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">Vie active</div>
              <div className="text-2xl font-bold text-white mb-1">
                {profil.retraiteAge - (profil.ageDebutCarriere || 22)} ans
              </div>
              <div className="text-xs text-gray-500">
                De {profil.ageDebutCarriere || 22} à {profil.retraiteAge} ans
              </div>
            </div>

            {/* Retraite */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">Retraite</div>
              <div className="text-2xl font-bold text-white mb-1">
                {profil.esperanceVie - profil.retraiteAge} ans
              </div>
              <div className="text-xs text-gray-500">
                De {profil.retraiteAge} à {profil.esperanceVie} ans
              </div>
            </div>

            {/* Total */}
            <div className="p-4 bg-gold/10 rounded-lg border border-gold">
              <div className="text-sm text-gold mb-1">Durée totale</div>
              <div className="text-2xl font-bold text-white mb-1">
                {profil.esperanceVie - profil.age} ans
              </div>
              <div className="text-xs text-gray-400">
                Toute votre vie
              </div>
            </div>
          </div>

        </div>
      </Card>

      {/* Détail année par année */}
      <TimelineDetailCard profil={profil} resultats={resultats} />

      {/* Équivalences pédagogiques */}
      <EquivalencesCard montantTotal={total} />

      {/* Estimation droits de succession */}
      <SuccessionEstimationCard profil={profil} estimation={successionEstimation} />

      {/* Sources officielles - Mise en avant */}
      <Card className="p-6 bg-gradient-to-br from-green-900/30 to-slate-900 border-2 border-green-600">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-green-100 mb-2 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-green-400" />
            📚 Sources Officielles Utilisées
          </h3>
          <p className="text-sm text-green-200">
            Tous nos calculs sont basés sur les barèmes et données officiels 2025
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <a
            href="https://www.urssaf.fr/portail/home/taux-et-baremes/taux-de-cotisations.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 hover:border-green-500 transition-all group"
          >
            <ExternalLink className="w-5 h-5 text-green-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <div className="flex-1">
              <p className="text-white font-medium text-sm">URSSAF</p>
              <p className="text-xs text-gray-400">Cotisations sociales 2025</p>
            </div>
          </a>

          <a
            href="https://www.impots.gouv.fr/particulier/bareme-de-limpot-sur-le-revenu"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 hover:border-green-500 transition-all group"
          >
            <ExternalLink className="w-5 h-5 text-green-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <div className="flex-1">
              <p className="text-white font-medium text-sm">Impots.gouv.fr</p>
              <p className="text-xs text-gray-400">Barème IR 2025</p>
            </div>
          </a>

          <a
            href="https://www.insee.fr/fr/statistiques"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 hover:border-green-500 transition-all group"
          >
            <ExternalLink className="w-5 h-5 text-green-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <div className="flex-1">
              <p className="text-white font-medium text-sm">INSEE</p>
              <p className="text-xs text-gray-400">Statistiques nationales</p>
            </div>
          </a>

          <button
            onClick={onGoToPedagogie}
            className="flex items-center gap-3 p-3 bg-gold/20 hover:bg-gold/30 rounded-lg border-2 border-gold hover:border-yellow-400 transition-all group"
          >
            <BookOpen className="w-5 h-5 text-gold flex-shrink-0 group-hover:scale-110 transition-transform" />
            <div className="flex-1 text-left">
              <p className="text-white font-medium text-sm">Voir toutes les sources</p>
              <p className="text-xs text-yellow-300">30+ références officielles</p>
            </div>
          </button>
        </div>

        <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-700">
          <p className="text-xs text-blue-200">
            <strong>💡 Vérifiez nos calculs :</strong> Utilisez les simulateurs officiels 
            <a href="https://www.impots.gouv.fr/simulateur-de-calcul" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline mx-1">
              impots.gouv.fr
            </a>
            et
            <a href="https://mon-entreprise.urssaf.fr/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline mx-1">
              mon-entreprise.urssaf.fr
            </a>
          </p>
        </div>
      </Card>

      {/* Disclaimer */}
      <Card className="p-6 bg-yellow-900/20 border-2 border-yellow-600">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-white font-medium mb-2">
              ⚠️ Estimation indicative à but pédagogique
            </h4>
            <p className="text-sm text-gray-300 mb-2">
              Ces résultats sont des <strong>estimations</strong> basées sur des hypothèses simplifiées et des moyennes nationales.
              <strong className="text-yellow-300"> L'algorithme peut contenir des erreurs ou imprécisions</strong> malgré nos vérifications avec les sources officielles.
              Ces calculs ne remplacent pas un conseil fiscal personnalisé.
            </p>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="secondary"
          size="lg"
          onClick={onBack}
          className="flex-1"
        >
          ← Modifier les paramètres
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={handleExportPDF}
          disabled={pdfLoading}
          className="flex-1"
        >
          {pdfLoading ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Génération...</>
          ) : (
            <><Download className="w-5 h-5 mr-2" />Exporter en PDF</>
          )}
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onReset}
          className="flex-1"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Nouvelle simulation
        </Button>
      </div>

      {/* Lien pédagogie */}
      <div className="text-center">
        <button
          onClick={onGoToPedagogie}
          className="inline-flex items-center gap-2 text-gold hover:text-yellow-400 transition-colors font-medium"
        >
          <span>📚 Comprendre ces montants en détail</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}

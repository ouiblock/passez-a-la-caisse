import { Download, RotateCcw, TrendingDown, Loader2 } from 'lucide-react';
import { useMemo, useEffect, useState } from 'react';
import { StepHeader } from './StepHeader';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { calculerDroitsAvecAV } from '../utils/calculations';
import { exportToPDF } from '../utils/exportPDF';
import { enregistrerSimulation } from '../utils/statsTracker';

export function Step4Results({ 
  role,
  beneficiaires, 
  montants,
  isCouple = false,
  age,
  partnerAge,
  onBack, 
  onReset,
  onExportPDF 
}) {
  // Debug: afficher les props reçues
  console.log('Step4Results - Props reçues:', { 
    role, 
    beneficiaires, 
    montants, 
    isCouple, 
    age, 
    partnerAge 
  });

  // Calcul simple des droits de succession
  const calculs = useMemo(() => {
    // Protection : vérifier que les données sont valides
    if (!beneficiaires || !Array.isArray(beneficiaires) || beneficiaires.length === 0) {
      return { montantTransmissible: 0, totalDroits: 0, error: 'Aucun bénéficiaire défini' };
    }

    if (!montants || typeof montants !== 'object') {
      return { montantTransmissible: 0, totalDroits: 0, error: 'Données patrimoniales invalides' };
    }

    try {
      const montantTransmissible = (montants.immobilier || 0) + (montants.financier || 0);
      
      // Associer les donations du type de bénéficiaire à chaque bénéficiaire individuel
      const benefsAvecDonations = beneficiaires.map(b => ({
        ...b,
        donations: (montants.donations && montants.donations[b.type]) || []
      }));

      const { totalDroits, resultats } = calculerDroitsAvecAV(
        benefsAvecDonations,
        montantTransmissible,
        montants.avAvant70 || 0,
        montants.avApres70 || 0,
        isCouple
      );

      return { montantTransmissible, totalDroits, resultats, error: null };
    } catch (error) {
      console.error('Erreur calcul droits:', error);
      return { montantTransmissible: 0, totalDroits: 0, error: error.message };
    }
  }, [montants, beneficiaires, isCouple]);

  const [pdfLoading, setPdfLoading] = useState(false);

  const handleExportPDF = async () => {
    if (onExportPDF) {
      onExportPDF();
      return;
    }
    setPdfLoading(true);
    try {
      await exportToPDF({
        role,
        beneficiaires,
        montants,
        resultats: calculs.resultats,
        totalDroits: calculs.totalDroits,
        isCouple,
        age,
        partnerAge
      });
    } catch (err) {
      console.error('Erreur export PDF succession:', err);
    } finally {
      setPdfLoading(false);
    }
  };

  // Afficher l'erreur si nécessaire
  if (calculs.error) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card className="bg-red-900/30 border-2 border-red-500">
          <p className="text-red-100">Erreur : {calculs.error}. Veuillez revenir en arrière.</p>
          <Button onClick={onBack} className="mt-4">Retour</Button>
        </Card>
      </div>
    );
  }

  const { montantTransmissible, totalDroits, resultats } = calculs;

  // Utiliser les résultats détaillés de calculerDroitsAvecAV
  const detailsCalcul = useMemo(() => {
    if (!resultats || resultats.length === 0) return null;

    return resultats.map(result => {
      // Récupérer les donations récentes pour l'affichage
      const donations = result.donations || [];
      const anneeCourante = new Date().getFullYear();
      const donationsRecentes = donations.filter(d => {
        return (anneeCourante - (d.annee || 0)) <= 15;
      });

      return {
        id: result.id,
        type: result.type,
        abattementBase: result.abattementBase,
        abattementConsomme: result.donationsConsommees || 0,
        abattementDisponible: result.abattementDisponible,
        partSuccession: result.quotePart,
        baseTaxable: result.baseTaxable,
        droitsCivils: result.droitsCivils,
        donationsRecentes
      };
    });
  }, [resultats]);

  // Calcul de l'économie réalisée grâce à l'assurance-vie
  const economieAV = useMemo(() => {
    const totalAV = (montants.avAvant70 || 0) + (montants.avApres70 || 0);
    if (totalAV === 0) return 0;

    // Calculer les droits si tout était en succession classique
    const patrimoineTotal = montantTransmissible + totalAV;
    const benefsAvecDonations = beneficiaires.map(b => ({
      ...b,
      donations: b.donations || []
    }));

    // Droits sans AV (tout en succession)
    const { totalDroits: droitsSansAV } = calculerDroitsAvecAV(
      benefsAvecDonations,
      patrimoineTotal,
      0,
      0,
      isCouple
    );

    // Économie = différence
    return Math.max(0, droitsSansAV - totalDroits);
  }, [montants, montantTransmissible, totalDroits, beneficiaires, isCouple]);

  const formatNumber = (value) => {
    // Protection contre les valeurs invalides
    if (value === undefined || value === null || isNaN(value)) {
      return '0 €';
    }
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0 
    }).format(value);
  };

  // Enregistrer la simulation (une seule fois au montage du composant)
  useEffect(() => {
    // Calculer les économies potentielles totales
    const economiesPotentielles = Math.round(
      (age < 70 ? 152500 * beneficiaires.length * 0.20 : 6000) +
      (100000 * beneficiaires.length * (isCouple ? 2 : 1) * 0.20) +
      (age < 80 && beneficiaires.some(b => b.type === 'enfant' || b.type === 'petit_enfant') 
        ? 31865 * beneficiaires.filter(b => b.type === 'enfant' || b.type === 'petit_enfant').length * 0.20 
        : 0)
    );

    // Enregistrer la simulation
    enregistrerSimulation(economiesPotentielles);
  }, []); // Tableau vide = exécuté une seule fois au montage

  return (
    <div className="max-w-6xl mx-auto">
      <StepHeader
        step={4}
        title="Résultats & préconisations"
        subtitle="Votre simulation fiscale détaillée"
      />

      {/* Message de M. Jean-Luc Chat */}
      <div className="flex items-start gap-4 p-6 bg-navy-light/40 border border-gold/20 rounded-2xl relative overflow-hidden animate-fade-in-up mb-6">
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
              "J'ai minutieusement épluché votre dossier de succession. Le bilan est fait. Il est temps pour vos héritiers de... <strong className="text-gold text-lg">passer à la caisse</strong>."
            </p>
          </div>
        </div>
      </div>

      {/* Résultat : Droits de succession */}
      <Card className="mb-6 bg-gradient-to-br from-navy to-blue-900 border-2 border-gold">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gold/20 rounded-full mb-4">
            <TrendingDown className="w-10 h-10 text-gold" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">
            Droits de succession
          </h2>
          
          <div className="bg-gold/10 rounded-lg p-8 border-2 border-gold">
            <p className="text-5xl font-bold text-gold mb-2">
              {formatNumber(totalDroits)}
            </p>
            <p className="text-lg text-gray-300">
              Montant à payer par vos héritiers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-800/30 rounded-lg p-4">
              <p className="text-sm text-gray-300 mb-1">Patrimoine transmis</p>
              <p className="text-2xl font-bold text-white">
                {formatNumber(montantTransmissible + (montants.avAvant70 || 0) + (montants.avApres70 || 0))}
              </p>
            </div>
            <div className="bg-blue-800/30 rounded-lg p-4">
              <p className="text-sm text-gray-300 mb-1">Taux effectif</p>
              <p className="text-2xl font-bold text-white">
                {montantTransmissible > 0 ? Math.round((totalDroits / (montantTransmissible + (montants.avAvant70 || 0) + (montants.avApres70 || 0))) * 100) : 0}%
              </p>
            </div>
          </div>

          <div className="bg-blue-800/30 rounded-lg p-4 text-sm text-gray-300">
            <p>
              💡 Ce montant représente les droits de succession que vos héritiers devront payer à l'État.
            </p>
          </div>
        </div>
      </Card>

      {/* Détail du calcul des droits de succession */}
      {detailsCalcul && (
        <Card className="mb-6 bg-gradient-to-br from-blue-900 to-cyan-900 border-2 border-cyan-500">
          <div>
            <h3 className="text-2xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
              <span>📊</span> Détail du calcul des droits de succession
            </h3>
            
            <div className="bg-cyan-900/30 rounded-lg p-4 mb-4">
              <h4 className="font-bold text-white mb-2">Base de calcul</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-gray-400">Patrimoine immobilier</p>
                  <p className="text-white font-bold">{formatNumber(montants.immobilier || 0)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Patrimoine financier</p>
                  <p className="text-white font-bold">{formatNumber(montants.financier || 0)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Total transmissible</p>
                  <p className="text-cyan-300 font-bold text-lg">{formatNumber(montantTransmissible)}</p>
                </div>
              </div>
            </div>

            {montants.avAvant70 > 0 || montants.avApres70 > 0 ? (
              <div className="bg-green-900/20 rounded-lg p-4 mb-4 border border-green-500">
                <h4 className="font-bold text-green-300 mb-2">✅ Assurance-vie (optimisation appliquée)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {montants.avAvant70 > 0 && (
                    <div>
                      <p className="text-gray-400">AV avant 70 ans (990 I)</p>
                      <p className="text-white font-bold">{formatNumber(montants.avAvant70)}</p>
                      <p className="text-xs text-green-300">Abattement 152 500 € par bénéficiaire</p>
                    </div>
                  )}
                  {montants.avApres70 > 0 && (
                    <div>
                      <p className="text-gray-400">AV après 70 ans (757 B)</p>
                      <p className="text-white font-bold">{formatNumber(montants.avApres70)}</p>
                      <p className="text-xs text-green-300">Abattement global 30 500 €</p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="space-y-4">
              <h4 className="font-bold text-white mb-3">Répartition par bénéficiaire ({beneficiaires.length})</h4>
              
              {detailsCalcul.map((detail, idx) => (
                <div key={detail.id || idx} className="bg-blue-800/40 rounded-lg p-4 border border-blue-500">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-bold text-cyan-300">
                      Bénéficiaire {idx + 1} — {detail.type}
                    </h5>
                    {detail.id && (
                      <span className="text-xs bg-blue-700 px-2 py-1 rounded text-white">
                        {detail.id.slice(0, 8)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {/* Colonne gauche : Abattements */}
                    <div className="space-y-2">
                      <div className="bg-blue-900/50 rounded p-3">
                        <p className="text-gray-400 text-xs mb-1">Abattement de base ({detail.type})</p>
                        <p className="text-white font-bold">{formatNumber(detail.abattementBase)}</p>
                      </div>

                      {detail.abattementConsomme > 0 && (
                        <div className="bg-orange-900/30 rounded p-3 border border-orange-500">
                          <p className="text-orange-300 text-xs mb-1">
                            ⚠️ Abattement déjà consommé (donations &lt; 15 ans)
                          </p>
                          <p className="text-orange-200 font-bold">- {formatNumber(detail.abattementConsomme)}</p>
                          {detail.donationsRecentes.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {detail.donationsRecentes.map((don, i) => (
                                <p key={i} className="text-xs text-orange-300">
                                  • {don.type || 'Don'} : {formatNumber(don.montant)} ({don.annee || 'N/A'})
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="bg-green-900/30 rounded p-3 border border-green-500">
                        <p className="text-green-300 text-xs mb-1">✅ Abattement disponible</p>
                        <p className="text-green-200 font-bold text-lg">{formatNumber(detail.abattementDisponible)}</p>
                      </div>
                    </div>

                    {/* Colonne droite : Calcul */}
                    <div className="space-y-2">
                      <div className="bg-blue-900/50 rounded p-3">
                        <p className="text-gray-400 text-xs mb-1">Part de succession</p>
                        <p className="text-white font-bold">{formatNumber(detail.partSuccession)}</p>
                      </div>

                      <div className="bg-blue-900/50 rounded p-3">
                        <p className="text-gray-400 text-xs mb-1">− Abattement disponible</p>
                        <p className="text-white font-bold">− {formatNumber(detail.abattementDisponible)}</p>
                      </div>

                      <div className="bg-red-900/30 rounded p-3 border-2 border-red-500">
                        <p className="text-red-300 text-xs mb-1">= Base taxable</p>
                        <p className="text-red-200 font-bold text-lg">{formatNumber(detail.baseTaxable)}</p>
                        {detail.baseTaxable > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            Barème progressif appliqué (5% → 45%)
                          </p>
                        )}
                      </div>

                      <div className="bg-orange-900/30 rounded p-3 border-2 border-orange-500 mt-2">
                        <p className="text-orange-300 text-xs mb-1">💰 Droits à payer</p>
                        <p className="text-orange-200 font-bold text-xl">{formatNumber(detail.droitsCivils)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-gradient-to-r from-red-900 to-orange-900 rounded-lg p-4 border-2 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm mb-1">Total des droits de succession</p>
                  <p className="text-3xl font-bold text-red-200">{formatNumber(totalDroits)}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-300 text-sm mb-1">Taux effectif</p>
                  <p className="text-2xl font-bold text-orange-300">
                    {montantTransmissible > 0 ? Math.round((totalDroits / montantTransmissible) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-blue-800/20 rounded-lg p-3 text-xs text-gray-300">
              <p className="mb-1">
                <strong className="text-cyan-300">💡 Rappel :</strong> Les abattements se renouvellent tous les 15 ans. 
                Les donations récentes consomment l'abattement disponible pour la succession.
              </p>
              <p>
                <strong className="text-cyan-300">📋 Barème progressif :</strong> 5% (jusqu'à 8 072 €), 10%, 15%, 20%, 30%, 40%, 45% (au-delà de 1 805 677 €) 
                pour les transmissions en ligne directe.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Félicitations pour l'optimisation AV */}
      {economieAV > 0 && (
        <Card className="mb-6 bg-gradient-to-br from-green-900 to-emerald-900 border-2 border-green-500">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
              <span className="text-5xl">🎉</span>
            </div>
            
            <h3 className="text-3xl font-bold text-green-300 mb-4">
              Bravo ! Vous avez optimisé votre transmission
            </h3>
            
            <div className="bg-green-800/40 rounded-lg p-6 mb-4 border-2 border-green-400">
              <p className="text-lg text-gray-300 mb-3">
                Grâce à votre <strong className="text-white">assurance-vie</strong>, vous avez retiré :
              </p>
              <p className="text-6xl font-bold text-green-300 mb-3">
                {formatNumber(economieAV)}
              </p>
              <p className="text-xl text-green-200">
                de droits de succession qui n'iront pas dans les poches de l'État ! 💰
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-green-900/30 rounded-lg p-4 border border-green-500">
                <p className="text-sm text-gray-300 mb-1">Montant AV optimisé</p>
                <p className="text-2xl font-bold text-white">
                  {formatNumber((montants.avAvant70 || 0) + (montants.avApres70 || 0))}
                </p>
                {montants.avAvant70 > 0 && (
                  <p className="text-xs text-green-300 mt-1">
                    • Avant 70 ans : {formatNumber(montants.avAvant70)}
                  </p>
                )}
                {montants.avApres70 > 0 && (
                  <p className="text-xs text-green-300 mt-1">
                    • Après 70 ans : {formatNumber(montants.avApres70)}
                  </p>
                )}
              </div>

              <div className="bg-green-900/30 rounded-lg p-4 border border-green-500">
                <p className="text-sm text-gray-300 mb-1">Taux d'économie</p>
                <p className="text-2xl font-bold text-green-300">
                  {Math.round((economieAV / (economieAV + totalDroits)) * 100)}%
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  d'économie sur le total initial
                </p>
              </div>
            </div>

            <div className="bg-emerald-900/30 rounded-lg p-4 border border-emerald-500">
              <p className="text-sm text-gray-300">
                <strong className="text-green-300">💡 Astuce :</strong> Vous avez fait le bon choix ! 
                L'assurance-vie est l'un des meilleurs outils pour transmettre votre patrimoine 
                en réduisant drastiquement les droits de succession. Continuez à optimiser en 
                répartissant sur plusieurs bénéficiaires et en privilégiant les versements avant 70 ans.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
              <span>🏛️</span>
              <p className="italic">
                "Bercy vous remercie... mais un peu moins qu'avant !"
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Pistes d'optimisation indicatives */}
      <Card className="mb-6 bg-gradient-to-br from-indigo-900 to-purple-900 border-2 border-indigo-500">
        <div>
          <h3 className="text-2xl font-bold text-indigo-300 mb-4 flex items-center gap-2">
            <span>💡</span> Pistes d'optimisation pour réduire vos droits
          </h3>
          
          <div className="bg-indigo-900/30 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-300">
              Vous avez <strong className="text-white">{beneficiaires.length} bénéficiaire{beneficiaires.length > 1 ? 's' : ''}</strong> 
              {age && <> et vous avez <strong className="text-white">{age} ans</strong></>}.
              Voici des leviers d'optimisation à explorer :
            </p>
          </div>

          <div className="space-y-4">
            {/* 1. Assurance-vie avant 70 ans */}
            {age < 70 && (
              <div className="bg-gradient-to-r from-green-900 to-emerald-900 rounded-lg p-4 border-2 border-green-500">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">🏦</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-green-300 mb-2">Assurance-vie avant 70 ans (art. 990 I)</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Vous pouvez placer jusqu'à <strong className="text-white">152 500 € par bénéficiaire</strong> 
                      en assurance-vie avec des primes versées avant vos 70 ans.
                    </p>
                    
                    <div className="bg-green-800/40 rounded p-3 mb-3">
                      <p className="text-xs text-gray-400 mb-2">Exemple avec vos {beneficiaires.length} bénéficiaire{beneficiaires.length > 1 ? 's' : ''} :</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-400">Montant total possible</p>
                          <p className="text-white font-bold">{formatNumber(152500 * beneficiaires.length)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Économie estimée</p>
                          <p className="text-green-300 font-bold">
                            {formatNumber(Math.round(152500 * beneficiaires.length * 0.20))}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        * Estimation basée sur un taux moyen de 20% de droits évités
                      </p>
                    </div>

                    <p className="text-xs text-green-200">
                      ✅ Totalement exonéré jusqu'à 152 500 € par bénéficiaire
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Assurance-vie après 70 ans */}
            {age >= 70 && (
              <div className="bg-gradient-to-r from-blue-900 to-cyan-900 rounded-lg p-4 border-2 border-blue-500">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">🏦</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-blue-300 mb-2">Assurance-vie après 70 ans (art. 757 B)</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Vous pouvez encore placer en assurance-vie avec un abattement global de <strong className="text-white">30 500 €</strong> 
                      sur les primes versées après 70 ans.
                    </p>
                    
                    <div className="bg-blue-800/40 rounded p-3 mb-3">
                      <p className="text-xs text-gray-400 mb-2">Exemple :</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-400">Abattement global</p>
                          <p className="text-white font-bold">30 500 €</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Économie estimée</p>
                          <p className="text-blue-300 font-bold">~6 000 €</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        * Au-delà, taxation au barème civil après abattement
                      </p>
                    </div>

                    <p className="text-xs text-blue-200">
                      ⚠️ Moins avantageux qu'avant 70 ans, mais toujours intéressant
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Donations classiques 100k€ */}
            <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-lg p-4 border-2 border-purple-500">
              <div className="flex items-start gap-3">
                <span className="text-3xl">💰</span>
                <div className="flex-1">
                  <h4 className="font-bold text-purple-300 mb-2">Donations classiques (100 000 € par enfant)</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    Chaque parent peut donner <strong className="text-white">100 000 €</strong> à chaque enfant 
                    tous les 15 ans, en franchise de droits.
                  </p>
                  
                  <div className="bg-purple-800/40 rounded p-3 mb-3">
                    <p className="text-xs text-gray-400 mb-2">Avec vos {beneficiaires.length} bénéficiaire{beneficiaires.length > 1 ? 's' : ''} :</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-400">Montant total possible</p>
                        <p className="text-white font-bold">{formatNumber(100000 * beneficiaires.length)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Économie estimée</p>
                        <p className="text-purple-300 font-bold">
                          {formatNumber(Math.round(100000 * beneficiaires.length * 0.20))}
                        </p>
                      </div>
                    </div>
                    {isCouple && (
                      <p className="text-xs text-purple-200 mt-2">
                        💑 En couple : doublez ces montants (200 000 € par enfant) !
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-purple-200">
                    ✅ Renouvelable tous les 15 ans
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Don manuel 790G */}
            {age < 80 && beneficiaires.some(b => b.type === 'enfant' || b.type === 'petit_enfant') && (
              <div className="bg-gradient-to-r from-orange-900 to-amber-900 rounded-lg p-4 border-2 border-orange-500">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">💵</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-orange-300 mb-2">Don manuel de sommes d'argent (art. 790 G)</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Avant 80 ans, vous pouvez donner <strong className="text-white">31 865 €</strong> en espèces 
                      à chaque descendant majeur, en franchise totale.
                    </p>
                    
                    <div className="bg-orange-800/40 rounded p-3 mb-3">
                      <p className="text-xs text-gray-400 mb-2">Avec vos descendants :</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-400">Montant par bénéficiaire</p>
                          <p className="text-white font-bold">31 865 €</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Économie estimée</p>
                          <p className="text-orange-300 font-bold">
                            ~{formatNumber(Math.round(31865 * beneficiaires.filter(b => b.type === 'enfant' || b.type === 'petit_enfant').length * 0.20))}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-orange-200">
                      ✅ Cumulable avec les 100 000 € • Renouvelable tous les 15 ans
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Démembrement de propriété */}
            {montants.immobilier > 0 && (
              <div className="bg-gradient-to-r from-teal-900 to-cyan-900 rounded-lg p-4 border-2 border-teal-500">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">🏠</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-teal-300 mb-2">Démembrement de propriété (donation de nue-propriété)</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Donnez la nue-propriété de vos biens immobiliers tout en conservant l'usufruit 
                      (vous continuez à habiter ou percevoir les loyers).
                    </p>
                    
                    <div className="bg-teal-800/40 rounded p-3 mb-3">
                      <p className="text-xs text-gray-400 mb-2">Exemple indicatif :</p>
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Valeur nue-propriété (selon âge)</span>
                          <span className="text-white font-bold">
                            {age < 51 ? '60%' : age < 61 ? '50%' : age < 71 ? '40%' : '30%'} de la valeur
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Économie estimée</span>
                          <span className="text-teal-300 font-bold">15-25% de droits évités</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-teal-200">
                      ✅ Vous gardez l'usage • Réunion automatique au décès sans droits
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Récapitulatif total des économies potentielles */}
          <div className="mt-6 bg-gradient-to-r from-yellow-900 to-amber-900 rounded-lg p-6 border-2 border-yellow-500">
            <div className="text-center mb-4">
              <h4 className="text-2xl font-bold text-yellow-300 mb-2">
                💰 Total des économies potentielles
              </h4>
              <p className="text-sm text-gray-300">
                En cumulant toutes ces optimisations, vous pourriez économiser :
              </p>
            </div>

            <div className="space-y-3 mb-4">
              {age < 70 && (
                <div className="flex justify-between items-center bg-yellow-800/30 rounded p-3">
                  <span className="text-sm text-gray-300">🏦 Assurance-vie avant 70 ans</span>
                  <span className="text-white font-bold">{formatNumber(Math.round(152500 * beneficiaires.length * 0.20))}</span>
                </div>
              )}
              
              {age >= 70 && (
                <div className="flex justify-between items-center bg-yellow-800/30 rounded p-3">
                  <span className="text-sm text-gray-300">🏦 Assurance-vie après 70 ans</span>
                  <span className="text-white font-bold">~6 000 €</span>
                </div>
              )}

              <div className="flex justify-between items-center bg-yellow-800/30 rounded p-3">
                <span className="text-sm text-gray-300">💰 Donations classiques</span>
                <span className="text-white font-bold">
                  {formatNumber(Math.round(100000 * beneficiaires.length * (isCouple ? 2 : 1) * 0.20))}
                </span>
              </div>

              {age < 80 && beneficiaires.some(b => b.type === 'enfant' || b.type === 'petit_enfant') && (
                <div className="flex justify-between items-center bg-yellow-800/30 rounded p-3">
                  <span className="text-sm text-gray-300">💵 Don manuel 790G</span>
                  <span className="text-white font-bold">
                    ~{formatNumber(Math.round(31865 * beneficiaires.filter(b => b.type === 'enfant' || b.type === 'petit_enfant').length * 0.20))}
                  </span>
                </div>
              )}

              {montants.immobilier > 0 && (
                <div className="flex justify-between items-center bg-yellow-800/30 rounded p-3">
                  <span className="text-sm text-gray-300">🏠 Démembrement de propriété</span>
                  <span className="text-white font-bold">15-25% du patrimoine immobilier</span>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-green-900 to-emerald-900 rounded-lg p-4 border-2 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300 mb-1">Économie totale estimée</p>
                  <p className="text-xs text-gray-400">(hors démembrement)</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-green-300">
                    {formatNumber(
                      Math.round(
                        (age < 70 ? 152500 * beneficiaires.length * 0.20 : 6000) +
                        (100000 * beneficiaires.length * (isCouple ? 2 : 1) * 0.20) +
                        (age < 80 && beneficiaires.some(b => b.type === 'enfant' || b.type === 'petit_enfant') 
                          ? 31865 * beneficiaires.filter(b => b.type === 'enfant' || b.type === 'petit_enfant').length * 0.20 
                          : 0)
                      )
                    )}
                  </p>
                  <p className="text-xs text-green-200 mt-1">
                    + économie sur l'immobilier
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-yellow-200">
                <strong>🎯 Soit une réduction potentielle de {Math.round(
                  ((age < 70 ? 152500 * beneficiaires.length * 0.20 : 6000) +
                  (100000 * beneficiaires.length * (isCouple ? 2 : 1) * 0.20) +
                  (age < 80 && beneficiaires.some(b => b.type === 'enfant' || b.type === 'petit_enfant') 
                    ? 31865 * beneficiaires.filter(b => b.type === 'enfant' || b.type === 'petit_enfant').length * 0.20 
                    : 0)) / totalDroits * 100
                )}% de vos droits actuels !</strong>
              </p>
            </div>
          </div>

          <div className="mt-6 bg-indigo-800/30 rounded-lg p-4 border border-indigo-500">
            <p className="text-sm text-gray-300 mb-2">
              <strong className="text-indigo-300">💡 Conseil :</strong> Ces optimisations sont cumulables ! 
              Combinez assurance-vie, donations et démembrement pour maximiser vos économies.
            </p>
            <p className="text-xs text-gray-400">
              ⚠️ Estimations indicatives. Consultez un notaire ou conseiller en gestion de patrimoine 
              pour une stratégie personnalisée adaptée à votre situation.
            </p>
          </div>
        </div>
      </Card>

      {/* Équivalent en prestations sociales - Section informative */}
      <Card className="mb-6 bg-gradient-to-br from-purple-900 to-indigo-900 border-2 border-purple-500">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-purple-300 mb-4">
            📊 Votre contribution en perspective
          </h3>
          <p className="text-sm text-gray-300 mb-4">
            Vos droits de succession (<strong className="text-white">{formatNumber(totalDroits)}</strong>) correspondent à :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* RSA */}
            <div className="bg-purple-800/40 rounded-lg p-4 border border-purple-500">
              <div className="text-3xl mb-2">🏠</div>
              <p className="text-lg font-bold text-purple-200 mb-1">
                {Math.round(totalDroits / 7000)} années de RSA
              </p>
              <p className="text-xs text-gray-400">
                Revenu de Solidarité Active<br />
                7 000 € / an (616 €/mois)
              </p>
            </div>

            {/* Allocations familiales */}
            <div className="bg-purple-800/40 rounded-lg p-4 border border-purple-500">
              <div className="text-3xl mb-2">👨‍👩‍👧‍👦</div>
              <p className="text-lg font-bold text-purple-200 mb-1">
                {Math.round(totalDroits / 3000)} années d'allocations familiales
              </p>
              <p className="text-xs text-gray-400">
                Pour 2 enfants<br />
                3 000 € / an / foyer
              </p>
            </div>

            {/* APL */}
            <div className="bg-purple-800/40 rounded-lg p-4 border border-purple-500">
              <div className="text-3xl mb-2">🏡</div>
              <p className="text-lg font-bold text-purple-200 mb-1">
                {Math.round(totalDroits / 4000)} années d'aide au logement
              </p>
              <p className="text-xs text-gray-400">
                APL moyenne<br />
                4 000 € / an / foyer
              </p>
            </div>

            {/* Retraite minimum */}
            <div className="bg-purple-800/40 rounded-lg p-4 border border-purple-500">
              <div className="text-3xl mb-2">👴</div>
              <p className="text-lg font-bold text-purple-200 mb-1">
                {Math.round(totalDroits / 11500)} années de minimum vieillesse
              </p>
              <p className="text-xs text-gray-400">
                ASPA (Allocation de Solidarité)<br />
                11 500 € / an / personne
              </p>
            </div>

            {/* Prime d'activité */}
            <div className="bg-purple-800/40 rounded-lg p-4 border border-purple-500">
              <div className="text-3xl mb-2">💼</div>
              <p className="text-lg font-bold text-purple-200 mb-1">
                {Math.round(totalDroits / 2400)} années de prime d'activité
              </p>
              <p className="text-xs text-gray-400">
                Complément de revenus<br />
                2 400 € / an / allocataire
              </p>
            </div>

            {/* AAH */}
            <div className="bg-purple-800/40 rounded-lg p-4 border border-purple-500">
              <div className="text-3xl mb-2">♿</div>
              <p className="text-lg font-bold text-purple-200 mb-1">
                {Math.round(totalDroits / 11500)} années d'AAH
              </p>
              <p className="text-xs text-gray-400">
                Allocation Adulte Handicapé<br />
                11 500 € / an / bénéficiaire
              </p>
            </div>
          </div>

          <div className="bg-indigo-900/50 rounded-lg p-4 border border-indigo-500">
            <p className="text-sm text-gray-300">
              <strong className="text-purple-300">💡 Contexte :</strong> L'État français collecte environ 
              <strong className="text-white"> 17.5 milliards d'euros</strong> de droits de succession par an, 
              qui contribuent au financement de la protection sociale et des services publics.
            </p>
            <p className="text-xs text-gray-400 mt-2 italic">
              Sources : CAF, Ministère du Travail, DREES, Cour des comptes, PLFSS 2024
            </p>
          </div>
        </div>
      </Card>

      {/* Disclaimer */}
      <div className="bg-gray-800 border border-gray-200 rounded-lg p-4 mb-6 text-xs text-gray-400">
        <p className="text-center mb-2">
          <strong className="text-yellow-300">⚠️ Simulation indicative à but pédagogique</strong>
        </p>
        <p className="text-center mb-2">
          Ces calculs sont des estimations. <strong className="text-yellow-300">L'algorithme peut contenir des erreurs ou imprécisions</strong> malgré nos vérifications.
          Les règles fiscales évoluent. Réserve héréditaire et situations personnelles : faites valider par un notaire ou avocat.
        </p>
        <p className="text-center text-xs">
          💡 Vérifiez avec le simulateur officiel : 
          <a href="https://www.impots.gouv.fr/simulateur-de-calcul" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline ml-1">
            impots.gouv.fr
          </a>
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button variant="outline" onClick={onBack}>
          Modifier les montants
        </Button>
        <Button variant="secondary" onClick={handleExportPDF} disabled={pdfLoading}>
          {pdfLoading ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Génération...</>
          ) : (
            <><Download className="w-5 h-5 mr-2" />Exporter en PDF</>
          )}
        </Button>
        <Button onClick={onReset}>
          <RotateCcw className="w-5 h-5 mr-2" />
          Nouvelle simulation
        </Button>
      </div>
    </div>
  );
}

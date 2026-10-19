import { useState } from 'react';
import { TrendingUp, Calendar, Receipt } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ClovisAdvice } from './ClovisAdvice';
import { MOYENNES_INSEE } from '../../utils/lifetime/assumptions';
import { calculerImpotAnnuel, calculerParts } from '../../utils/lifetime/adapters/impotRevenu';

export function Step2Income({ initialData, onContinue, onBack }) {
  const [revenuNetMensuel, setRevenuNetMensuel] = useState(initialData.revenuNetMensuel);
  const [salaireMoyenCarriere, setSalaireMoyenCarriere] = useState(initialData.salaireMoyenCarriere || null);
  const [croissanceRevenuPct, setCroissanceRevenuPct] = useState(initialData.croissanceRevenuPct);
  // Initialiser l'âge de retraite (peut être inférieur à l'âge actuel si déjà à la retraite)
  const [retraiteAge, setRetraiteAge] = useState(initialData.retraiteAge);
  const [esperanceVie, setEsperanceVie] = useState(initialData.esperanceVie);

  const moyenneStatut = MOYENNES_INSEE.revenuNetMensuel[initialData.statut];
  const useDefault = revenuNetMensuel === null || revenuNetMensuel === 0;
  const isRetraite = initialData.statut === 'retraite';

  // Calculs pour l'aperçu dynamique de l'impôt sur le revenu (barème 2026)
  const revenuEffectifMensuel = useDefault ? moyenneStatut : (revenuNetMensuel || 0);
  const revenuEffectifAnnuel = revenuEffectifMensuel * 12;
  const partsFiscales = calculerParts(initialData);
  const impotAnnuelEstime = calculerImpotAnnuel(revenuEffectifAnnuel, partsFiscales);
  const impotMensuelEstime = Math.round(impotAnnuelEstime / 12);
  const baseImposableApresAbattement = Math.max(0, Math.round(revenuEffectifAnnuel * 0.90));
  const tauxEffectifMoyen = revenuEffectifAnnuel > 0 
    ? ((impotAnnuelEstime / revenuEffectifAnnuel) * 100).toFixed(1) 
    : '0.0';

  const handleSubmit = (e) => {
    e.preventDefault();
    onContinue({
      revenuNetMensuel: useDefault ? null : revenuNetMensuel,
      salaireMoyenCarriere: isRetraite ? salaireMoyenCarriere : null,
      croissanceRevenuPct,
      retraiteAge,
      esperanceVie
    });
  };

  // Validation : l'âge de retraite peut être <= âge actuel (déjà à la retraite) ou >= âge actuel (futur)
  const isValid = retraiteAge >= 55 && retraiteAge <= esperanceVie && esperanceVie <= 110;

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-5 sm:p-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          Étape 2 : Vos revenus
        </h2>

        {/* Revenu net mensuel */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {isRetraite ? 'Pension de retraite mensuelle nette' : `Revenu net mensuel avant impôts ${initialData.situation === 'couple' ? '(du foyer)' : '(individuel)'}`} (optionnel)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="0"
              max="1000000"
              step="any"
              value={useDefault ? '' : (revenuNetMensuel || '')}
              onChange={(e) => {
                const val = e.target.value;
                setRevenuNetMensuel(val === '' ? null : parseFloat(val) || null);
              }}
              placeholder={`${moyenneStatut} € (moyenne)`}
              className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-gold focus:border-gold text-lg"
            />
            <span className="text-gray-400">€/mois</span>
          </div>
          {useDefault && (
            <div className="mt-2 px-3 py-2 bg-blue-900/30 border border-blue-700 rounded-lg">
              <p className="text-sm text-blue-300">
                <span className="font-medium">💡 Valeur par défaut utilisée :</span> {moyenneStatut} €/mois
                (moyenne nationale pour un {initialData.statut === 'salarie' ? 'salarié' : initialData.statut})
              </p>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {isRetraite 
              ? 'Votre pension de retraite mensuelle nette actuelle. Si vide, moyenne nationale utilisée.'
              : initialData.situation === 'couple' 
                ? 'Indiquez le revenu total du foyer (vous + conjoint) avant impôts. Si vide, moyenne nationale utilisée.'
                : 'Votre salaire net avant impôt sur le revenu (après cotisations sociales). Si vide, moyenne nationale utilisée.'}
          </p>
        </div>

        {/* Aperçu immédiat Impôt sur le revenu (Barème 2026) */}
        <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-600/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Estimation Impôt sur le revenu annuel (Barème 2026)</span>
            </div>
            <span className="text-xs bg-emerald-900/60 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              {partsFiscales} part{partsFiscales > 1 ? 's' : ''} ({initialData.situation === 'couple' ? 'Couple' : 'Célibataire'}{initialData.enfants > 0 ? `, ${initialData.enfants} enf.` : ''})
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div>
              <span className="text-2xl font-bold text-white">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(impotAnnuelEstime)}
              </span>
              <span className="text-xs text-gray-300 ml-2">/ an (soit ~{impotMensuelEstime} €/mois)</span>
            </div>
            <span className="text-xs text-emerald-300 font-medium">
              Taux moyen effectif : {tauxEffectifMoyen}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Calculé après <strong>abattement forfaitaire de 10%</strong> (base taxable : {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(baseImposableApresAbattement)}) et application du <strong>quotient familial</strong> ({partsFiscales} part{partsFiscales > 1 ? 's' : ''}).
          </p>
        </div>

        {/* Salaire moyen pendant la carrière (pour les retraités) */}
        {isRetraite && (
          <div className="mb-6 p-4 bg-purple-900/20 border border-purple-700 rounded-lg">
            <label className="block text-sm font-medium text-purple-300 mb-2">
              💼 Salaire net moyen pendant votre carrière (optionnel)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max="1000000"
                step="any"
                value={salaireMoyenCarriere || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setSalaireMoyenCarriere(val === '' ? null : parseFloat(val) || null);
                }}
                placeholder="2200 € (moyenne)"
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
              />
              <span className="text-gray-400">€/mois</span>
            </div>
            <p className="text-xs text-purple-300 mt-2">
              Pour calculer les cotisations que vous avez payées pendant votre carrière. Si vide, moyenne nationale utilisée (2200€).
            </p>
          </div>
        )}

        {/* Évolution du revenu */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <TrendingUp className="w-4 h-4 inline mr-1" />
            Évolution annuelle du revenu
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="-2"
              max="5"
              step="0.5"
              value={croissanceRevenuPct}
              onChange={(e) => setCroissanceRevenuPct(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold"
            />
            <div className="w-24 text-center">
              <span className={`text-2xl font-bold ${croissanceRevenuPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {croissanceRevenuPct > 0 ? '+' : ''}{croissanceRevenuPct}%
              </span>
              <span className="text-xs text-gray-400 block">par an</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Augmentation moyenne de votre salaire chaque année (hors inflation)
          </p>
        </div>

        {/* Âge de départ à la retraite */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Âge de départ à la retraite
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="55"
              max="70"
              value={retraiteAge}
              onChange={(e) => setRetraiteAge(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold"
            />
            <div className="w-20 text-center">
              <span className="text-2xl font-bold text-gold">{retraiteAge}</span>
              <span className="text-sm text-gray-400 block">ans</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {initialData.age >= initialData.retraiteAge || isRetraite
              ? "Âge auquel vous avez pris votre retraite"
              : "Âge prévu de cessation d'activité professionnelle"}
          </p>
        </div>

        {/* Espérance de vie */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Espérance de vie
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={Math.max(retraiteAge, 70)}
              max="110"
              value={esperanceVie}
              onChange={(e) => setEsperanceVie(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold"
            />
            <div className="w-20 text-center">
              <span className="text-2xl font-bold text-gold">{esperanceVie}</span>
              <span className="text-sm text-gray-400 block">ans</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Durée de vie estimée (moyenne nationale : 82 ans)
          </p>
        </div>

        {/* Récapitulatif */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">📊 Récapitulatif</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Durée carrière :</span>
              <span className="text-white font-medium ml-2">
                {isRetraite || initialData.age >= retraiteAge
                  ? `${Math.max(0, retraiteAge - (initialData.ageDebutCarriere || 22))} ans (passée)`
                  : `${Math.max(0, retraiteAge - initialData.age)} ans`}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Durée retraite :</span>
              <span className="text-white font-medium ml-2">
                {Math.max(0, esperanceVie - retraiteAge)} ans
              </span>
            </div>
            <div>
              <span className="text-gray-400">Revenu mensuel :</span>
              <span className="text-white font-medium ml-2">
                {useDefault ? moyenneStatut : revenuNetMensuel} €
              </span>
            </div>
            <div>
              <span className="text-gray-400">Évolution :</span>
              <span className={`font-medium ml-2 ${croissanceRevenuPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {croissanceRevenuPct > 0 ? '+' : ''}{croissanceRevenuPct}% /an
              </span>
            </div>
            <div className="col-span-2 pt-2 border-t border-gray-700/60 flex items-center justify-between">
              <span className="text-gray-300">Impôt sur le revenu estimé (2026) :</span>
              <span className="text-emerald-400 font-bold">
                {impotAnnuelEstime.toLocaleString('fr-FR')} €/an (~{impotMensuelEstime} €/mois)
              </span>
            </div>
          </div>
        </div>

        {/* Note d'inspection de Clovis */}
        <ClovisAdvice context="step2" />

        {/* Boutons */}
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onBack}
          >
            ← Retour
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!isValid}
            className="px-8"
          >
            Continuer →
          </Button>
        </div>
      </Card>
    </form>
  );
}

import { Users, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { detailCalculSuccession } from '../../utils/lifetime/adapters/successionEstimation';

export function SuccessionEstimationCard({ estimation }) {
  // Si pas d'estimation fournie, ne rien afficher
  if (!estimation) return null;

  const formatEuro = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Si pas de patrimoine ou pas d'enfants, ne pas afficher
  if (estimation.patrimoineTotal === 0 || estimation.nombreHeritiers === 0) {
    return null;
  }

  const detail = detailCalculSuccession(estimation.partParHeritier);

  return (
    <Card className="p-5 sm:p-8 bg-gradient-to-br from-orange-900/30 to-slate-900 border-2 border-orange-700">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Users className="w-6 h-6 text-orange-400" />
          Droits de succession estimés pour vos héritiers
        </h3>
        <p className="text-gray-300">
          Ce que vos {estimation.nombreHeritiers} enfant{estimation.nombreHeritiers > 1 ? 's' : ''} devr{estimation.nombreHeritiers > 1 ? 'ont' : 'a'} payer à l'État lors de votre succession
        </p>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">Patrimoine total</p>
          <p className="text-2xl font-bold text-white">{formatEuro(estimation.patrimoineTotal)}</p>
          <p className="text-xs text-gray-500 mt-1">Immobilier + Placements + Cash - Crédits</p>
        </div>

        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">Part par enfant</p>
          <p className="text-2xl font-bold text-blue-300">{formatEuro(estimation.partParHeritier)}</p>
          <p className="text-xs text-gray-500 mt-1">Répartition égale entre {estimation.nombreHeritiers} enfant{estimation.nombreHeritiers > 1 ? 's' : ''}</p>
        </div>

        <div className="p-4 bg-orange-900/50 rounded-lg border-2 border-orange-600">
          <p className="text-sm text-orange-300 mb-1">Droits par enfant</p>
          <p className="text-2xl font-bold text-orange-400">{formatEuro(estimation.droitsParHeritier)}</p>
          <p className="text-xs text-orange-300 mt-1">Taux moyen : {estimation.tauxMoyen}%</p>
        </div>
      </div>

      {/* Total */}
      <div className="p-6 bg-orange-900/40 rounded-lg border-2 border-orange-600 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-orange-300 mb-1">Total des droits de succession</p>
            <p className="text-xs text-orange-400">Ce que vos enfants paieront collectivement à l'État</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-orange-400">{formatEuro(estimation.droitsTotal)}</p>
          </div>
        </div>
      </div>

      {/* Détail du calcul pour un enfant */}
      <div className="mb-6">
        <h4 className="text-lg font-bold text-white mb-3">Détail du calcul pour un enfant</h4>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Part reçue :</span>
            <span className="text-white font-medium">{formatEuro(detail.partRecue)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Abattement (ligne directe) :</span>
            <span className="text-green-400 font-medium">- {formatEuro(detail.abattement)}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-gray-700 pt-2">
            <span className="text-white font-medium">Base imposable :</span>
            <span className="text-white font-bold">{formatEuro(detail.baseImposable)}</span>
          </div>
        </div>

        {detail.tranches.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-300 mb-3">Application du barème progressif :</p>
            <div className="space-y-2">
              {detail.tranches.map((tranche, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-gray-400">
                    {formatEuro(tranche.montant)} × {tranche.taux}%
                  </span>
                  <span className="text-orange-400 font-medium">{formatEuro(tranche.droits)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm border-t border-gray-700 pt-2">
                <span className="text-white font-medium">Total droits :</span>
                <span className="text-orange-400 font-bold">{formatEuro(detail.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Avertissement */}
      <div className="p-4 bg-yellow-900/30 rounded-lg border border-yellow-700 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-yellow-200 mb-2">
            <strong>💡 Comment réduire ces droits ?</strong>
          </p>
          <ul className="text-xs text-yellow-300 space-y-1">
            <li>• <strong>Donations de votre vivant</strong> : Abattement de 100 000€ tous les 15 ans par parent et par enfant</li>
            <li>• <strong>Assurance-vie</strong> : Abattement de 152 500€ par bénéficiaire (versements avant 70 ans)</li>
            <li>• <strong>Démembrement de propriété</strong> : Transmettre la nue-propriété en conservant l'usufruit</li>
            <li>• <strong>Pacte Dutreil</strong> : Exonération de 75% pour transmission d'entreprise</li>
          </ul>
          <p className="text-xs text-yellow-400 mt-2 italic">
            → Consultez un notaire ou conseiller en gestion de patrimoine pour optimiser votre transmission
          </p>
        </div>
      </div>

      {/* Note méthodologique */}
      <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-700">
        <p className="text-xs text-blue-300">
          <strong>📋 Méthodologie :</strong> Calcul basé sur le barème 2025 en ligne directe (parents-enfants). 
          Hypothèse : répartition égale entre les enfants, sans donations antérieures. 
          Si vous êtes en couple, vos enfants hériteront au décès du second parent (conjoint exonéré).
        </p>
      </div>
    </Card>
  );
}

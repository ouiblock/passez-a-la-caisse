import { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { generateComparisons } from '../../utils/lifetime/equivalences';

export function EquivalencesCard({ montantTotal }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const comparisons = generateComparisons(montantTotal);
  const visibleComparisons = isExpanded ? comparisons : comparisons.slice(0, 3);

  return (
    <Card className="p-5 sm:p-8 bg-gradient-to-br from-purple-900/30 to-slate-900 border-2 border-purple-700">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-purple-400" />
          Pour mettre en perspective
        </h3>
        <p className="text-gray-300">
          Vos {montantTotal.toLocaleString('fr-FR')} € d'impôts et taxes représentent l'équivalent de :
        </p>
      </div>

      <div className="space-y-4">
        {visibleComparisons.map((comp, index) => (
          <div
            key={index}
            className="p-4 bg-gray-800/50 rounded-lg border border-purple-600/30 hover:border-purple-600/60 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl flex-shrink-0">{comp.icon}</div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between mb-1">
                  <h4 className="text-lg font-bold text-white">{comp.title}</h4>
                  <span className="text-2xl font-bold text-purple-400">{comp.value}</span>
                </div>
                <p className="text-sm text-gray-400">{comp.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {comparisons.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 w-full py-2 text-purple-400 hover:text-purple-300 transition-colors flex items-center justify-center gap-2"
        >
          <span>{isExpanded ? 'Voir moins' : `Voir ${comparisons.length - 3} autres équivalences`}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      )}

      <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
        <p className="text-xs text-gray-400">
          <strong className="text-purple-300">💡 Bon à savoir :</strong> Ces équivalences sont calculées sur la base des coûts réels des services publics et des prestations sociales en France (données 2025). 
          Elles illustrent la redistribution et le financement de notre modèle social.
        </p>
      </div>
    </Card>
  );
}

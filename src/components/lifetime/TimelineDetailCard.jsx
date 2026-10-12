import { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { Card } from '../ui/Card';
import { detailImpotParAnnee } from '../../utils/lifetime/adapters/impotRevenu';

export function TimelineDetailCard({ profil, resultats }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDecade, setSelectedDecade] = useState(null);

  const formatEuro = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Générer timeline détaillée
  const generateDetailedTimeline = () => {
    const timeline = [];
    const ageDebut = Math.max(profil.age, 18);
    const ageFin = profil.esperanceVie;
    const irDetails = detailImpotParAnnee(profil);
    
    for (let age = ageDebut; age <= ageFin; age++) {
      const annee = age - ageDebut + 1;
      const phase = age < profil.retraiteAge ? 'active' : 'retraite';
      
      // Calculs simplifiés par année (avec impôt sur le revenu réel par année)
      const dureeTotal = Math.max(1, ageFin - ageDebut + 1);
      const dureeActive = Math.max(1, profil.retraiteAge - ageDebut);
      const dureeRetraite = Math.max(1, ageFin - profil.retraiteAge + 1);
      const irAnnee = irDetails.find(item => item.age === age)?.impot ?? Math.round(resultats.impotRevenu / dureeTotal);
      
      const taxes = {
        tvaConso: Math.round(resultats.tvaConso / dureeTotal),
        cotSalariales: phase === 'active' ? Math.round(resultats.cotSalariales / dureeActive) : 0,
        cotPatronales: phase === 'active' ? Math.round(resultats.cotPatronales / dureeActive) : 0,
        impotRevenu: irAnnee,
        energieCarburant: Math.round(resultats.energieCarburant / dureeTotal),
        energieElectricite: Math.round(resultats.energieElectricite / dureeTotal),
        energieGaz: Math.round(resultats.energieGaz / dureeTotal),
        taxeFonciere: Math.round(resultats.taxeFonciere / dureeTotal * Math.pow(1.02, annee - 1)), // +2%/an
        retraitesPrelevSociaux: phase === 'retraite' ? Math.round(resultats.retraitesPrelevSociaux / dureeRetraite) : 0
      };
      
      const totalAnnee = Object.values(taxes).reduce((sum, val) => sum + val, 0);
      const cumulPrecedent = timeline.length > 0 ? timeline[timeline.length - 1].cumul : 0;
      
      timeline.push({
        annee,
        age,
        phase,
        taxes,
        total: totalAnnee,
        cumul: cumulPrecedent + totalAnnee
      });
    }
    
    return timeline;
  };

  const timeline = generateDetailedTimeline();

  // Grouper par décennie
  const decades = [];
  for (let i = 0; i < timeline.length; i += 10) {
    const decade = timeline.slice(i, i + 10);
    const ageDebut = decade[0].age;
    const ageFin = decade[decade.length - 1].age;
    const totalDecade = decade.reduce((sum, year) => sum + year.total, 0);
    
    decades.push({
      label: `${ageDebut}-${ageFin} ans`,
      years: decade,
      total: totalDecade
    });
  }

  return (
    <Card className="p-5 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-gold" />
          Détail année par année
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-gold hover:text-yellow-400 transition-colors flex items-center gap-1"
        >
          {isExpanded ? (
            <>
              Masquer <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Afficher le détail <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Vue par décennie */}
      {isExpanded && (
        <div className="space-y-3 mb-6">
          {decades.map((decade, index) => (
          <div key={index}>
            <button
              onClick={() => setSelectedDecade(selectedDecade === index ? null : index)}
              className="w-full p-4 bg-gray-800 hover:bg-gray-750 rounded-lg border border-gray-700 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-white">{decade.label}</span>
                <span className="text-sm text-gray-400">({decade.years.length} ans)</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-gold">{formatEuro(decade.total)}</span>
                {selectedDecade === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Détail des années de la décennie */}
            {selectedDecade === index && (
              <div className="mt-2 ml-4 space-y-2">
                {decade.years.map((year) => (
                  <div
                    key={year.annee}
                    className="p-3 bg-gray-900 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">Année {year.annee}</span>
                        <span className="text-sm text-gray-400">({year.age} ans)</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          year.phase === 'active' 
                            ? 'bg-blue-900 text-blue-300' 
                            : 'bg-purple-900 text-purple-300'
                        }`}>
                          {year.phase === 'active' ? 'Vie active' : 'Retraite'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gold">{formatEuro(year.total)}</div>
                        <div className="text-xs text-gray-500">Cumul: {formatEuro(year.cumul)}</div>
                      </div>
                    </div>

                    {/* Détail des taxes */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      {year.taxes.tvaConso > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">TVA:</span>
                          <span className="text-white">{formatEuro(year.taxes.tvaConso)}</span>
                        </div>
                      )}
                      {year.taxes.cotSalariales > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Cot. sal.:</span>
                          <span className="text-white">{formatEuro(year.taxes.cotSalariales)}</span>
                        </div>
                      )}
                      {year.taxes.cotPatronales > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Cot. pat.:</span>
                          <span className="text-white">{formatEuro(year.taxes.cotPatronales)}</span>
                        </div>
                      )}
                      {year.taxes.impotRevenu > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">IR:</span>
                          <span className="text-white">{formatEuro(year.taxes.impotRevenu)}</span>
                        </div>
                      )}
                      {year.taxes.energieCarburant > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Carburant:</span>
                          <span className="text-white">{formatEuro(year.taxes.energieCarburant)}</span>
                        </div>
                      )}
                      {year.taxes.taxeFonciere > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">T. foncière:</span>
                          <span className="text-white">{formatEuro(year.taxes.taxeFonciere)}</span>
                        </div>
                      )}
                      {year.taxes.retraitesPrelevSociaux > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Prélèv. retraite:</span>
                          <span className="text-white">{formatEuro(year.taxes.retraitesPrelevSociaux)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        </div>
      )}

      {/* Résumé */}
      <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-700">
        <p className="text-sm text-blue-300">
          <strong>💡 Note :</strong> Ces montants sont des estimations basées sur une répartition simplifiée. 
          La taxe foncière évolue de +2%/an. Les cotisations s'arrêtent à la retraite. 
          Pour plus de précision, consultez l'audit des calculs dans la documentation.
        </p>
      </div>
    </Card>
  );
}

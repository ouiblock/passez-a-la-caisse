import { useState } from 'react';
import { Card } from '../ui/Card';
import { PieChart, BarChart3 } from 'lucide-react';
import { detailImpotParAnnee } from '../../utils/lifetime/adapters/impotRevenu';
import { detailCotisationsParAnnee } from '../../utils/lifetime/adapters/cotisations';

export function YearlyChart({ profil, resultats }) {
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // 'all', 'active', 'retraite'
  const [viewMode, setViewMode] = useState('pie'); // 'pie' ou 'bar'
  
  const formatEuro = (montant) => {
    if (montant >= 1000000) {
      return `${(montant / 1000000).toFixed(1)}M€`;
    } else if (montant >= 1000) {
      return `${(montant / 1000).toFixed(0)}k€`;
    }
    return `${Math.round(montant)}€`;
  };

  // Générer les données année par année
  const generateYearlyData = () => {
    const ageDebut = profil.ageDebutCarriere || 22;
    const ageFin = profil.esperanceVie;
    const duree = Math.max(1, ageFin - ageDebut);
    const irDetails = detailImpotParAnnee(profil);
    const cotDetails = detailCotisationsParAnnee(profil);
    
    const data = [];
    
    for (let i = 0; i < duree; i++) {
      const age = ageDebut + i;
      const phase = age < profil.retraiteAge ? 'active' : 'retraite';
      
      // Estimation par catégorie
      const dureeCarriere = Math.max(1, profil.retraiteAge - ageDebut);
      const dureeRetraite = Math.max(1, ageFin - profil.retraiteAge);
      const irAnnee = irDetails.find(d => d.age === age)?.impot ?? ((resultats.impotRevenu || 0) / duree);
      const cotAnnee = cotDetails.find(d => d.age === age);
      
      const annee = {
        age,
        phase,
        tvaConso: (resultats.tvaConso || 0) / duree,
        cotSalariales: phase === 'active' && cotAnnee ? cotAnnee.salariales : (phase === 'active' ? (resultats.cotSalariales || 0) / dureeCarriere : 0),
        cotPatronales: phase === 'active' && cotAnnee ? cotAnnee.patronales : (phase === 'active' ? (resultats.cotPatronales || 0) / dureeCarriere : 0),
        impotRevenu: irAnnee,
        flatTaxPlacements: (resultats.flatTaxPlacements || 0) / duree,
        taxesEnergie: ((resultats.energieCarburant || 0) + (resultats.energieElectricite || 0) + (resultats.energieGaz || 0)) / duree,
        taxesLogement: ((resultats.logementNotaire || 0) + (resultats.taxeFonciere || 0)) / duree,
        prelevementsRetraite: phase === 'retraite' && dureeRetraite > 0 ? (resultats.retraitesPrelevSociaux || 0) / dureeRetraite : 0,
      };
      
      annee.total = Object.values(annee).reduce((sum, val) => typeof val === 'number' ? sum + val : sum, 0);
      
      data.push(annee);
    }
    
    return data;
  };

  const yearlyData = generateYearlyData();
  
  // Filtrer selon la période sélectionnée
  const filteredData = yearlyData.filter(d => {
    if (selectedPeriod === 'active') return d.phase === 'active';
    if (selectedPeriod === 'retraite') return d.phase === 'retraite';
    return true;
  });

  // Trouver le max pour l'échelle
  const maxTotal = Math.max(...filteredData.map(d => d.total));

  // Échantillonner les données si trop nombreuses
  const sampleData = filteredData.length > 50 
    ? filteredData.filter((_, i) => i % Math.ceil(filteredData.length / 50) === 0)
    : filteredData;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-4">
          📊 Évolution année par année
        </h3>
        
        {/* Filtres de période */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedPeriod('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedPeriod === 'all'
                ? 'bg-gold text-gray-900 font-bold'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Toute la vie
          </button>
          <button
            onClick={() => setSelectedPeriod('active')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedPeriod === 'active'
                ? 'bg-blue-500 text-white font-bold'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Vie active
          </button>
          <button
            onClick={() => setSelectedPeriod('retraite')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedPeriod === 'retraite'
                ? 'bg-purple-500 text-white font-bold'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Retraite
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          {filteredData.length} années • Maximum : {formatEuro(maxTotal)}/an
        </p>
      </div>

      {/* Graphique en barres */}
      <div className="relative">
        {/* Axe Y */}
        <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col justify-between text-xs text-gray-400 text-right pr-2">
          <span>{formatEuro(maxTotal)}</span>
          <span>{formatEuro(maxTotal * 0.75)}</span>
          <span>{formatEuro(maxTotal * 0.5)}</span>
          <span>{formatEuro(maxTotal * 0.25)}</span>
          <span>0€</span>
        </div>

        {/* Barres */}
        <div className="ml-16 overflow-x-auto">
          <div className="flex items-end gap-1 min-w-full" style={{ height: '300px' }}>
            {sampleData.map((d, i) => {
              const heightPercent = (d.total / maxTotal) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 min-w-[8px] group relative"
                  style={{ height: '100%' }}
                >
                  <div
                    className={`w-full rounded-t transition-all hover:opacity-80 cursor-pointer ${
                      d.phase === 'active' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}
                    style={{
                      height: `${heightPercent}%`,
                      marginTop: `${100 - heightPercent}%`
                    }}
                  >
                    {/* Tooltip au survol */}
                    <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap z-10 border border-gray-700">
                      <div className="font-bold mb-1">Âge {d.age} ans</div>
                      <div className="text-gold">{formatEuro(d.total)}</div>
                      <div className="text-gray-400 text-[10px] mt-1">
                        {d.phase === 'active' ? '💼 Vie active' : '🏖️ Retraite'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Axe X (âges) */}
          <div className="flex gap-1 mt-2 text-xs text-gray-400">
            {sampleData.map((d, i) => {
              // Afficher seulement quelques labels pour éviter le chevauchement
              const showLabel = i % Math.ceil(sampleData.length / 10) === 0;
              return (
                <div key={i} className="flex-1 min-w-[8px] text-center">
                  {showLabel && <span>{d.age}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-gray-300">Vie active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <span className="text-gray-300">Retraite</span>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        💡 Survolez les barres pour voir le détail par année
      </div>
    </Card>
  );
}

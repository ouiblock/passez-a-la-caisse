import { useState } from 'react';
import { Card } from '../ui/Card';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

const CATEGORIES_COLORS = [
  { key: 'tvaConso', label: 'TVA consommation', color: '#ef4444' },
  { key: 'cotSalariales', label: 'Cotisations salariales', color: '#f97316' },
  { key: 'cotPatronales', label: 'Cotisations patronales', color: '#eab308' },
  { key: 'impotRevenu', label: 'Impôt sur le revenu', color: '#22c55e' },
  { key: 'flatTaxPlacements', label: 'Flat tax placements', color: '#14b8a6' },
  { key: 'fiscaliteRevenusFonciers', label: 'Revenus fonciers', color: '#7c3aed' },
  { key: 'ifi', label: 'IFI', color: '#b91c1c' },
  { key: 'energieCarburant', label: 'Taxes carburant', color: '#3b82f6' },
  { key: 'energieElectricite', label: 'Taxes électricité', color: '#6366f1' },
  { key: 'energieGaz', label: 'Taxes gaz', color: '#8b5cf6' },
  { key: 'logementNotaire', label: 'Frais notaire', color: '#ec4899' },
  { key: 'taxeFonciere', label: 'Taxe foncière', color: '#f43f5e' },
  { key: 'retraitesPrelevSociaux', label: 'Prélèvements retraite', color: '#06b6d4' },
];

export function TaxBreakdownChart({ profil, resultats }) {
  const [viewMode, setViewMode] = useState('pie'); // 'pie' ou 'bar'

  const formatEuro = (montant) => {
    if (montant >= 1000000) {
      return `${(montant / 1000000).toFixed(2)}M€`;
    } else if (montant >= 1000) {
      return `${(montant / 1000).toFixed(0)}k€`;
    }
    return `${Math.round(montant).toLocaleString('fr-FR')}€`;
  };

  // Préparer les données pour le graphique
  const chartData = CATEGORIES_COLORS
    .map(cat => ({
      ...cat,
      montant: resultats[cat.key] || 0
    }))
    .filter(cat => cat.montant > 0)
    .sort((a, b) => b.montant - a.montant);

  const total = chartData.reduce((sum, cat) => sum + cat.montant, 0);

  // Calcul des angles pour le camembert
  let currentAngle = 0;
  const pieSlices = chartData.map(cat => {
    const percentage = (cat.montant / total) * 100;
    const angle = (cat.montant / total) * 360;
    const slice = {
      ...cat,
      percentage,
      startAngle: currentAngle,
      endAngle: currentAngle + angle
    };
    currentAngle += angle;
    return slice;
  });

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">
            📊 Répartition détaillée des taxes
          </h3>
          
          {/* Boutons de vue */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('pie')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                viewMode === 'pie'
                  ? 'bg-gold text-gray-900 font-bold'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <PieChartIcon className="w-4 h-4" />
              Camembert
            </button>
            <button
              onClick={() => setViewMode('bar')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                viewMode === 'bar'
                  ? 'bg-gold text-gray-900 font-bold'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Barres
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-400">
          Total : {formatEuro(total)} • {chartData.length} catégories
        </p>
      </div>

      {viewMode === 'pie' ? (
        /* Vue Camembert */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camembert SVG */}
          <div className="flex items-center justify-center">
            <div className="relative w-80 h-80">
              <svg viewBox="0 0 200 200" className="transform -rotate-90">
                {pieSlices.map((slice, index) => {
                  const startAngle = (slice.startAngle * Math.PI) / 180;
                  const endAngle = (slice.endAngle * Math.PI) / 180;
                  const largeArcFlag = slice.endAngle - slice.startAngle > 180 ? 1 : 0;

                  const x1 = 100 + 90 * Math.cos(startAngle);
                  const y1 = 100 + 90 * Math.sin(startAngle);
                  const x2 = 100 + 90 * Math.cos(endAngle);
                  const y2 = 100 + 90 * Math.sin(endAngle);

                  return (
                    <g key={slice.key}>
                      <path
                        d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                        fill={slice.color}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                        stroke="#1f2937"
                        strokeWidth="1"
                      >
                        <title>{slice.label}: {formatEuro(slice.montant)} ({slice.percentage.toFixed(1)}%)</title>
                      </path>
                    </g>
                  );
                })}
                {/* Cercle central pour faire un donut */}
                <circle cx="100" cy="100" r="50" fill="#111827" />
                <text x="100" y="95" textAnchor="middle" className="fill-white text-xs font-bold transform rotate-90" style={{ transform: 'rotate(90deg)', transformOrigin: '100px 100px' }}>
                  Total
                </text>
                <text x="100" y="110" textAnchor="middle" className="fill-gold text-sm font-bold transform rotate-90" style={{ transform: 'rotate(90deg)', transformOrigin: '100px 100px' }}>
                  {formatEuro(total)}
                </text>
              </svg>
            </div>
          </div>

          {/* Légende */}
          <div className="space-y-2">
            {pieSlices.map(slice => (
              <div key={slice.key} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div 
                    className="w-4 h-4 rounded flex-shrink-0"
                    style={{ backgroundColor: slice.color }}
                  ></div>
                  <span className="text-sm text-gray-300">{slice.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{formatEuro(slice.montant)}</div>
                  <div className="text-xs text-gray-400">{slice.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Vue Barres horizontales */
        <div className="space-y-3">
          {chartData.map(cat => {
            const percentage = (cat.montant / total) * 100;
            return (
              <div key={cat.key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{cat.label}</span>
                  <span className="text-white font-medium">{formatEuro(cat.montant)}</span>
                </div>
                <div className="relative h-8 bg-gray-800 rounded-lg overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: cat.color
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-end pr-3">
                    <span className="text-xs font-bold text-white drop-shadow-lg">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-700">
        <p className="text-sm text-blue-300 text-center">
          💡 Ce graphique montre la répartition de vos {formatEuro(total)} de taxes sur toute votre vie
        </p>
      </div>
    </Card>
  );
}

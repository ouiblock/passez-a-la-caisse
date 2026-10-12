import { useState, useEffect } from 'react';
import { Card } from './ui/Card';

export function SimulationStats() {
  const [stats, setStats] = useState({
    totalSimulations: 0,
    totalEconomies: 0,
    loading: true
  });

  useEffect(() => {
    // Récupérer les stats depuis le localStorage (temporaire)
    const loadStats = () => {
      try {
        const savedStats = localStorage.getItem('passez_a_la_caisse_stats');
        if (savedStats) {
          const parsed = JSON.parse(savedStats);
          setStats({
            totalSimulations: parsed.totalSimulations || 0,
            totalEconomies: parsed.totalEconomies || 0,
            loading: false
          });
        } else {
          setStats({
            totalSimulations: 0,
            totalEconomies: 0,
            loading: false
          });
        }
      } catch (error) {
        console.error('Erreur chargement stats:', error);
        setStats({
          totalSimulations: 0,
          totalEconomies: 0,
          loading: false
        });
      }
    };

    loadStats();
  }, []);

  const formatNumber = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatCount = (value) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  if (stats.loading) {
    return null;
  }

  return (
    <Card className="mb-8 bg-gradient-to-br from-purple-900 to-indigo-900 border-2 border-purple-500">
      <div className="text-center">
        <h3 className="text-xl font-bold text-purple-300 mb-4">
          📊 Impact de notre simulateur
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre de simulations */}
          <div className="bg-purple-800/40 rounded-lg p-6 border border-purple-500">
            <div className="flex flex-col items-center">
              <span className="text-5xl mb-3">🧮</span>
              <p className="text-gray-300 text-sm mb-2">Simulations réalisées</p>
              <p className="text-5xl font-bold text-purple-300 mb-2">
                {formatCount(stats.totalSimulations)}
              </p>
              <p className="text-xs text-gray-400">
                Familles accompagnées dans leur réflexion
              </p>
            </div>
          </div>

          {/* Économies potentielles */}
          <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-lg p-6 border-2 border-green-500">
            <div className="flex flex-col items-center">
              <span className="text-5xl mb-3">💰</span>
              <p className="text-gray-300 text-sm mb-2">Économies potentielles simulées</p>
              <p className="text-4xl font-bold text-green-300 mb-2">
                {formatNumber(stats.totalEconomies)}
              </p>
              <p className="text-xs text-gray-400">
                Montant total qui pourrait rester dans les familles
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-indigo-800/30 rounded-lg p-4 border border-indigo-500">
          <p className="text-sm text-gray-300">
            <strong className="text-indigo-300">💡 Notre mission :</strong> Vous aider à optimiser votre transmission 
            et garder votre patrimoine dans votre famille plutôt que dans les caisses de l'État.
          </p>
        </div>
      </div>
    </Card>
  );
}

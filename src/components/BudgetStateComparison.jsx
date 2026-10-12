import { Card } from './ui/Card';

export function BudgetStateComparison({ totalDroits }) {
  const formatNumber = (value) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0 
    }).format(value);
  };

  const formatPercent = (value) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Budget de l'État français 2024 (en milliards)
  const budgetEtat = {
    total: 492, // Milliards d'euros
    droitsSuccession: 17.5, // Recettes des droits de succession 2024
    defense: 47.2,
    education: 61.5,
    sante: 9.8, // Hors Sécu
    justice: 10.8,
    ecologie: 12.5,
    recherche: 11.4,
    culture: 3.9,
    sport: 1.1
  };

  // Votre contribution en % du budget de l'État
  const votrePart = totalDroits / (budgetEtat.total * 1000000000);

  // Équivalents budgétaires
  const equivalents = [
    {
      icon: '🛡️',
      label: 'Défense nationale',
      budget: budgetEtat.defense,
      color: 'from-red-900 to-orange-900',
      borderColor: 'border-red-500',
      description: 'Armée, équipements militaires, dissuasion nucléaire'
    },
    {
      icon: '🎓',
      label: 'Éducation nationale',
      budget: budgetEtat.education,
      color: 'from-blue-900 to-indigo-900',
      borderColor: 'border-blue-500',
      description: 'Écoles, collèges, lycées, universités'
    },
    {
      icon: '🏥',
      label: 'Santé',
      budget: budgetEtat.sante,
      color: 'from-green-900 to-emerald-900',
      borderColor: 'border-green-500',
      description: 'Hôpitaux, recherche médicale (hors Sécurité sociale)'
    },
    {
      icon: '⚖️',
      label: 'Justice',
      budget: budgetEtat.justice,
      color: 'from-purple-900 to-violet-900',
      borderColor: 'border-purple-500',
      description: 'Tribunaux, prisons, aide juridictionnelle'
    },
    {
      icon: '🌱',
      label: 'Écologie',
      budget: budgetEtat.ecologie,
      color: 'from-teal-900 to-cyan-900',
      borderColor: 'border-teal-500',
      description: 'Transition énergétique, biodiversité, climat'
    },
    {
      icon: '🔬',
      label: 'Recherche',
      budget: budgetEtat.recherche,
      color: 'from-indigo-900 to-blue-900',
      borderColor: 'border-indigo-500',
      description: 'CNRS, universités, innovation'
    }
  ];

  return (
    <Card className="mb-6 bg-gradient-to-br from-slate-900 to-gray-900 border-2 border-slate-600">
      <div>
        <h3 className="text-2xl font-bold text-slate-100 mb-4 text-center">
          📊 Où vont vos droits de succession dans le budget de l'État ?
        </h3>
        
        <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-600">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-400 text-sm mb-1">Vos droits de succession</p>
              <p className="text-3xl font-bold text-red-300">{formatNumber(totalDroits)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Budget de l'État 2024</p>
              <p className="text-3xl font-bold text-slate-300">{budgetEtat.total} Mds €</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Votre contribution</p>
              <p className="text-3xl font-bold text-yellow-300">{formatPercent(votrePart)}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-bold text-slate-200 mb-3 text-center">
            💰 Les droits de succession en France (2024)
          </h4>
          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Recettes totales</p>
                <p className="text-2xl font-bold text-orange-300">{budgetEtat.droitsSuccession} Mds €</p>
                <p className="text-xs text-gray-500 mt-1">soit {formatPercent(budgetEtat.droitsSuccession / budgetEtat.total)} du budget</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Nombre de successions taxées</p>
                <p className="text-2xl font-bold text-cyan-300">~150 000</p>
                <p className="text-xs text-gray-500 mt-1">sur 600 000 décès/an (25%)</p>
              </div>
            </div>
          </div>
        </div>

        <h4 className="text-lg font-bold text-slate-200 mb-4 text-center">
          🎯 Vos {formatNumber(totalDroits)} représentent :
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {equivalents.map((item) => {
            const budgetEnEuros = item.budget * 1000000000;
            const pourcentage = totalDroits / budgetEnEuros;
            const nombreHeures = pourcentage * 365 * 24;
            const nombreMinutes = nombreHeures * 60;

            // Formater en heures ou minutes selon la taille
            let affichageTemps;
            if (nombreHeures >= 1) {
              affichageTemps = `${nombreHeures.toFixed(1)} heure${nombreHeures >= 2 ? 's' : ''}`;
            } else if (nombreMinutes >= 1) {
              affichageTemps = `${nombreMinutes.toFixed(0)} minute${nombreMinutes >= 2 ? 's' : ''}`;
            } else {
              affichageTemps = `${(nombreMinutes * 60).toFixed(0)} secondes`;
            }

            return (
              <div 
                key={item.label}
                className={`bg-gradient-to-br ${item.color} rounded-lg p-4 border-2 ${item.borderColor}`}
              >
                <div className="text-center mb-3">
                  <div className="text-4xl mb-2">{item.icon}</div>
                  <h5 className="font-bold text-white mb-1">{item.label}</h5>
                  <p className="text-xs text-gray-300">{item.description}</p>
                </div>
                
                <div className="bg-black/30 rounded p-3 mb-2">
                  <p className="text-xs text-gray-400 mb-1">Budget annuel 2024</p>
                  <p className="text-lg font-bold text-white">{item.budget} Mds €</p>
                </div>

                <div className="bg-black/30 rounded p-3">
                  <p className="text-xs text-gray-400 mb-1">Vos droits financent :</p>
                  <p className="text-3xl font-bold text-yellow-300 mb-2">{affichageTemps}</p>
                  <p className="text-xs text-gray-400">
                    de fonctionnement annuel
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section informative non-partisane */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600">
          <h4 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <span>💡</span> Comprendre les droits de succession
          </h4>
          
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <p className="font-bold text-white mb-2">📈 Contexte historique</p>
              <p>
                Les droits de succession existent en France depuis 1791. Ils représentent aujourd'hui 
                <strong className="text-yellow-300"> {budgetEtat.droitsSuccession} milliards d'euros</strong> de recettes annuelles, 
                soit environ <strong className="text-yellow-300">{formatPercent(budgetEtat.droitsSuccession / budgetEtat.total)}</strong> du budget de l'État.
              </p>
            </div>

            <div>
              <p className="font-bold text-white mb-2">⚖️ Qui paie ?</p>
              <p>
                Seulement <strong className="text-cyan-300">25% des successions</strong> sont taxées (environ 150 000 sur 600 000 décès/an). 
                Les 75% restants bénéficient des abattements (100 000 € par enfant, exonération du conjoint, etc.).
              </p>
            </div>

            <div>
              <p className="font-bold text-white mb-2">🎯 Optimisation légale</p>
              <p>
                L'optimisation fiscale via donations, assurance-vie et démembrement est <strong className="text-green-300">parfaitement légale</strong>. 
                Ces dispositifs sont prévus par le Code général des impôts pour encourager la transmission anticipée du patrimoine.
              </p>
            </div>

            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500">
              <p className="font-bold text-blue-300 mb-2">🤝 Une question de choix personnel</p>
              <p className="text-xs">
                Certains considèrent que l'impôt sur les successions finance les services publics et réduit les inégalités. 
                D'autres estiment qu'il pénalise l'épargne et la transmission familiale. 
                <strong className="text-white"> Quelle que soit votre opinion</strong>, ce simulateur vous aide à 
                <strong className="text-yellow-300"> comprendre votre situation</strong> et à 
                <strong className="text-green-300"> faire des choix éclairés</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

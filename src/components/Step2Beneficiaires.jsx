import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { StepHeader } from './StepHeader';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { BENEFICIAIRES_PAR_ROLE, BENEFICIAIRES_LABELS } from '../constants/fiscal';

export function Step2Beneficiaires({ role, beneficiaires, onBeneficiairesChange, onNext, onBack, isCouple }) {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [repartition, setRepartition] = useState({});
  const [nombres, setNombres] = useState({});
  const [handicaps, setHandicaps] = useState({}); // État pour les handicaps

  const availableTypes = BENEFICIAIRES_PAR_ROLE[role] || [];

  useEffect(() => {
    if (beneficiaires.length > 0) {
      const types = beneficiaires.map(b => b.type);
      setSelectedTypes(types);
      const rep = {};
      const nbr = {};
      const hand = {};
      beneficiaires.forEach(b => {
        rep[b.type] = b.pourcentage;
        nbr[b.type] = b.nombre || 1;
        hand[b.type] = b.handicap || false;
      });
      setRepartition(rep);
      setNombres(nbr);
      setHandicaps(hand);
    }
  }, [beneficiaires]);

  const handleTypeToggle = (type) => {

    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
      const newRep = { ...repartition };
      const newNbr = { ...nombres };
      const newHand = { ...handicaps };
      delete newRep[type];
      delete newNbr[type];
      delete newHand[type];
      setRepartition(newRep);
      setNombres(newNbr);
      setHandicaps(newHand);
    } else {
      setSelectedTypes([...selectedTypes, type]);
      setRepartition({ ...repartition, [type]: 0 });
      setNombres({ ...nombres, [type]: 1 });
      setHandicaps({ ...handicaps, [type]: false });
    }
  };

  const handlePercentageChange = (type, value) => {
    setRepartition({ ...repartition, [type]: parseFloat(value) || 0 });
  };

  const handleNombreChange = (type, value) => {
    // Le conjoint ne peut être qu'en 1 exemplaire
    if (type === 'conjoint') {
      setNombres({ ...nombres, [type]: 1 });
      return;
    }
    
    // Permettre la saisie vide temporairement
    if (value === '' || value === null || value === undefined) {
      setNombres({ ...nombres, [type]: '' });
      return;
    }
    
    const num = parseInt(value, 10);
    
    // Valider que c'est un nombre valide
    if (isNaN(num)) {
      return;
    }
    
    // Appliquer les limites min/max
    const bounded = Math.max(1, Math.min(20, num));
    setNombres({ ...nombres, [type]: bounded });
  };

  const handleHandicapChange = (type, value) => {
    setHandicaps({ ...handicaps, [type]: value });
  };

  const total = Object.values(repartition).reduce((sum, val) => sum + val, 0);
  const isValid = total === 100 && selectedTypes.length > 0;

  const hasDescendantsExcluded = role === 'pere' || role === 'mere' || role === 'grand_pere' || role === 'grand_mere';
  const descendantsSelected = selectedTypes.includes('enfant') || selectedTypes.includes('petit_enfant');

  const handleContinue = () => {
    const benefs = [];
    
    selectedTypes.forEach(type => {
      // S'assurer que le nombre est un entier valide
      let nombre = parseInt(nombres[type], 10);
      if (isNaN(nombre) || nombre < 1) {
        nombre = 1;
      }
      nombre = Math.max(1, Math.min(20, nombre));
      
      const pourcentageTotal = repartition[type] || 0;
      const pourcentageParBenef = pourcentageTotal / nombre;
      
      console.log(`Type: ${type}, Nombre: ${nombre}, Pourcentage total: ${pourcentageTotal}%, Par bénéf: ${pourcentageParBenef}%`);
      
      // Créer un objet séparé pour chaque bénéficiaire
      for (let i = 0; i < nombre; i++) {
        benefs.push({
          id: `${type}-${i + 1}`,
          type,
          pourcentage: pourcentageParBenef,
          handicap: handicaps[type] || false,
          donations: []
        });
      }
    });
    
    console.log('Bénéficiaires créés:', benefs);
    console.log('Nombre total de bénéficiaires:', benefs.length);
    
    onBeneficiairesChange(benefs);
    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <StepHeader
        step={2}
        title="À qui souhaitez-vous léguer ?"
        subtitle="Sélectionnez les bénéficiaires et répartissez les parts de votre héritage"
      />

      {/* Rappel des abattements */}
      <Card className="mb-6 bg-gradient-to-br from-blue-900 to-cyan-900 border-2 border-cyan-500">
        <div>
          <h3 className="text-lg font-bold text-cyan-300 mb-3 flex items-center gap-2">
            <span>ℹ️</span> Rappel des abattements selon le degré de filiation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="bg-cyan-900/30 rounded-lg p-3">
              <p className="text-cyan-200 font-bold mb-1">Enfant</p>
              <p className="text-white text-lg">100 000 €</p>
              <p className="text-gray-400 text-xs">par parent et par enfant</p>
            </div>
            <div className="bg-cyan-900/30 rounded-lg p-3">
              <p className="text-cyan-200 font-bold mb-1">Petit-enfant</p>
              <p className="text-white text-lg">1 594 €</p>
              <p className="text-gray-400 text-xs">sauf représentation*</p>
            </div>
            <div className="bg-cyan-900/30 rounded-lg p-3">
              <p className="text-cyan-200 font-bold mb-1">Frère / Sœur</p>
              <p className="text-white text-lg">15 932 €</p>
              <p className="text-gray-400 text-xs">par bénéficiaire</p>
            </div>
            <div className="bg-cyan-900/30 rounded-lg p-3">
              <p className="text-cyan-200 font-bold mb-1">Neveu / Nièce</p>
              <p className="text-white text-lg">7 967 €</p>
              <p className="text-gray-400 text-xs">par bénéficiaire</p>
            </div>
            <div className="bg-cyan-900/30 rounded-lg p-3">
              <p className="text-cyan-200 font-bold mb-1">Conjoint / Pacsé</p>
              <p className="text-white text-lg">Exonéré</p>
              <p className="text-gray-400 text-xs">totalement (art. 796-0 bis)</p>
            </div>
            <div className="bg-cyan-900/30 rounded-lg p-3">
              <p className="text-cyan-200 font-bold mb-1">Autres (Tiers)</p>
              <p className="text-white text-lg">1 594 €</p>
              <p className="text-gray-400 text-xs">montant minimal</p>
            </div>
          </div>
          <div className="mt-4 bg-blue-800/30 rounded-lg p-3 border border-blue-500">
            <p className="text-xs text-gray-300">
              <strong className="text-cyan-300">* Représentation :</strong> Si un petit-enfant hérite en représentation de son parent décédé, 
              il bénéficie de l'abattement de 100 000 € de son parent (divisé entre les représentants).
            </p>
            <p className="text-xs text-gray-300 mt-2">
              <strong className="text-cyan-300">💡 Bon à savoir :</strong> Ces abattements se renouvellent tous les 15 ans 
              et sont cumulables avec les donations (art. 790 G : 31 865 € supplémentaires avant 80 ans).
            </p>
          </div>
        </div>
      </Card>

      <Card>
        {/* Note pour le conjoint automatiquement ajouté */}
        {isCouple && availableTypes.includes('conjoint') && (
          <div className="mb-6 bg-green-900/20 border border-green-700 rounded-lg p-4">
            <p className="text-sm text-green-200">
              ✅ <strong>Conjoint/Pacsé automatiquement ajouté</strong> : Exonération totale des droits de succession (CGI art. 796-0 bis). 
              Vous pouvez ajuster sa part ci-dessous.
            </p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          {availableTypes.map((type) => (
            <div key={type} className={`border rounded-lg p-4 transition-colors ${
              type === 'conjoint' && isCouple 
                ? 'border-green-500 bg-green-900/10' 
                : 'border-gray-700 bg-gray-800 hover:border-gold'
            }`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => handleTypeToggle(type)}
                  disabled={type === 'conjoint' && isCouple}
                  className="w-5 h-5 text-gold rounded focus:ring-gold accent-gold disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="font-bold text-gray-100 flex-1">
                  {BENEFICIAIRES_LABELS[type]}
                  {type === 'conjoint' && isCouple && (
                    <span className="ml-2 text-xs text-green-400">(Obligatoire)</span>
                  )}
                </span>
              </label>

              {selectedTypes.includes(type) && (
                <div className="mt-4 pl-8 space-y-4">
                  {/* Nombre de bénéficiaires */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre de {BENEFICIAIRES_LABELS[type].toLowerCase()}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={nombres[type] === '' ? '' : (nombres[type] || 1)}
                      onChange={(e) => handleNombreChange(type, e.target.value)}
                      onBlur={(e) => {
                        // Si le champ est vide à la perte de focus, mettre 1
                        if (e.target.value === '' || !e.target.value) {
                          handleNombreChange(type, '1');
                        }
                      }}
                      disabled={type === 'conjoint'}
                      className={`w-24 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg text-center focus:ring-2 focus:ring-gold focus:border-gold font-bold text-lg ${type === 'conjoint' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    {type === 'conjoint' && (
                      <p className="text-xs text-gray-500 mt-1">Le conjoint est unique</p>
                    )}
                  </div>

                  {/* Handicap (abattement supplémentaire) */}
                  <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-700">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={handicaps[type] || false}
                        onChange={(e) => handleHandicapChange(type, e.target.checked)}
                        className="w-5 h-5 mt-0.5 text-blue-500 rounded focus:ring-blue-500 accent-blue-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-blue-200">
                          Bénéficiaire en situation de handicap
                        </span>
                        <p className="text-xs text-blue-300 mt-1">
                          Abattement supplémentaire de 159 325 € (CGI art. 779, V) pour infirmité physique ou mentale empêchant de travailler
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Part en pourcentage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Part de la succession (%)
                    </label>
                    <p className="text-xs text-gray-400 mb-3">
                      Sélectionnez le pourcentage de la succession que vous souhaitez allouer à {type === 'conjoint' ? 'votre conjoint' : `ce${nombres[type] > 1 ? 's' : ''} bénéficiaire${nombres[type] > 1 ? 's' : ''}`}
                    </p>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={repartition[type] || 0}
                        onChange={(e) => handlePercentageChange(type, e.target.value)}
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={repartition[type] || 0}
                        onChange={(e) => handlePercentageChange(type, e.target.value)}
                        className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg text-center focus:ring-2 focus:ring-gold focus:border-gold"
                      />
                      <span className="text-gray-400 font-bold">%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={`p-4 rounded-lg border-2 ${total === 100 ? 'bg-green-900/30 border-green-500' : 'bg-orange-900/30 border-orange-500'}`}>
          <p className="text-center font-bold text-xl">
            Total : <span className={total === 100 ? 'text-green-400' : 'text-orange-400'}>{total.toFixed(0)}%</span>
            {total === 100 && <span className="ml-2 text-green-400 text-2xl">✓</span>}
          </p>
        </div>

        {hasDescendantsExcluded && !descendantsSelected && selectedTypes.length > 0 && (
          <div className="mt-4 bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-200">
              <strong className="text-yellow-300">Attention :</strong> Vous n'avez pas sélectionné de descendants. 
              La réserve héréditaire s'applique en France. Consultez un notaire pour valider votre répartition.
            </p>
          </div>
        )}
      </Card>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={handleContinue} disabled={!isValid}>
          Continuer
        </Button>
      </div>
    </div>
  );
}

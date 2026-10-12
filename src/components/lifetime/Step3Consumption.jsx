import { useState } from 'react';
import { Home as HomeIcon, Car, Zap, ShoppingCart } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

const TYPES_VEHICULE = [
  { value: 'essence', label: 'Essence', icon: '⛽' },
  { value: 'diesel', label: 'Diesel', icon: '🚗' },
  { value: 'electrique', label: 'Électrique', icon: '🔋' },
  { value: 'aucun', label: 'Aucun', icon: '🚶' }
];

export function Step3Consumption({ initialData, onContinue, onBack }) {
  // Logement
  const [rpAchat, setRpAchat] = useState(initialData.logement.rpAchat);
  const [rpPrix, setRpPrix] = useState(initialData.logement.rpPrix || 300000);
  const [rsAchat, setRsAchat] = useState(initialData.logement.rsAchat);
  const [rsPrix, setRsPrix] = useState(initialData.logement.rsPrix || 150000);

  // Mobilité
  const [typeVehicule, setTypeVehicule] = useState(initialData.mobilite.type);
  const [kmAn, setKmAn] = useState(initialData.mobilite.kmAn);
  
  // Mobilité conjoint (si couple)
  const [typeVehiculeConjoint, setTypeVehiculeConjoint] = useState(initialData.mobilite?.typeConjoint || 'aucun');
  const [kmAnConjoint, setKmAnConjoint] = useState(initialData.mobilite?.kmAnConjoint || 12000);
  const isCouple = initialData.situation === 'couple';

  // Énergie
  const [elecAn, setElecAn] = useState(initialData.energie.elecAn);
  const [gazAn, setGazAn] = useState(initialData.energie.gazAn);

  // Consommation courante
  const [consoMensuelle, setConsoMensuelle] = useState(initialData.consoMensuelle);

  const handleSubmit = (e) => {
    e.preventDefault();
    onContinue({
      logement: {
        rpAchat,
        rpPrix: rpAchat ? rpPrix : null,
        rsAchat,
        rsPrix: rsAchat ? rsPrix : null
      },
      mobilite: {
        type: typeVehicule,
        kmAn,
        typeConjoint: isCouple ? typeVehiculeConjoint : 'aucun',
        kmAnConjoint: isCouple ? kmAnConjoint : 0
      },
      energie: {
        elecAn,
        gazAn
      },
      consoMensuelle
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-5 sm:p-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          Étape 3 : Votre consommation
        </h2>

        {/* Logement */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <HomeIcon className="w-5 h-5 text-gold" />
            Logement
          </h3>

          {/* Résidence principale */}
          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={rpAchat}
                onChange={(e) => setRpAchat(e.target.checked)}
                className="w-5 h-5 text-gold rounded focus:ring-gold accent-gold"
              />
              <span className="text-gray-300 font-medium">
                Achat d'une résidence principale
              </span>
            </label>
            {rpAchat && (
              <div className="ml-8 flex items-center gap-4">
                <input
                  type="number"
                  min="50000"
                  max="10000000"
                  step="10000"
                  value={rpPrix || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRpPrix(val === '' ? 0 : parseInt(val) || 0);
                  }}
                  onBlur={(e) => {
                    if (!e.target.value || parseInt(e.target.value) === 0) {
                      setRpPrix(300000);
                    }
                  }}
                  placeholder="300000"
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-gold focus:border-gold"
                />
                <span className="text-gray-400">€</span>
              </div>
            )}
          </div>

          {/* Résidence secondaire */}
          <div className="mb-2">
            <label className="flex items-center gap-3 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={rsAchat}
                onChange={(e) => setRsAchat(e.target.checked)}
                className="w-5 h-5 text-gold rounded focus:ring-gold accent-gold"
              />
              <span className="text-gray-300 font-medium">
                Achat d'une résidence secondaire
              </span>
            </label>
            {rsAchat && (
              <div className="ml-8 flex items-center gap-4">
                <input
                  type="number"
                  min="50000"
                  max="5000000"
                  step="10000"
                  value={rsPrix || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRsPrix(val === '' ? 0 : parseInt(val) || 0);
                  }}
                  onBlur={(e) => {
                    if (!e.target.value || parseInt(e.target.value) === 0) {
                      setRsPrix(150000);
                    }
                  }}
                  placeholder="150000"
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-gold focus:border-gold"
                />
                <span className="text-gray-400">€</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Frais de notaire (~8%) et taxe foncière seront calculés
          </p>
        </div>

        {/* Mobilité */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Car className="w-5 h-5 text-gold" />
            Mobilité
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {TYPES_VEHICULE.map((v) => (
              <button
                key={v.value}
                type="button"
                onClick={() => setTypeVehicule(v.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  typeVehicule === v.value
                    ? 'border-gold bg-gold/10 text-white'
                    : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="text-2xl mb-1">{v.icon}</div>
                <div className="text-sm font-medium">{v.label}</div>
              </button>
            ))}
          </div>

          {typeVehicule !== 'aucun' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Kilomètres par an
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="1000"
                  value={kmAn}
                  onChange={(e) => setKmAn(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold"
                />
                <div className="w-32 text-center">
                  <span className="text-xl font-bold text-gold">{kmAn.toLocaleString()}</span>
                  <span className="text-sm text-gray-400 block">km/an</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {typeVehicule === 'essence' || typeVehicule === 'diesel' 
                  ? `Hypothèse : 7L/100km à 1,60€/L en moyenne, dont ~52% de taxes (TICPE + TVA)`
                  : `Hypothèse : 15kWh/100km, dont 20% de TVA sur l'électricité`}
              </p>
            </div>
          )}
        </div>

        {/* Mobilité conjoint (si couple) */}
        {isCouple && (
          <div className="mb-8 p-4 bg-purple-900/20 border border-purple-700 rounded-lg">
            <h3 className="text-lg font-medium text-purple-300 mb-4 flex items-center gap-2">
              <Car className="w-5 h-5 text-purple-400" />
              Mobilité du conjoint
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {TYPES_VEHICULE.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => setTypeVehiculeConjoint(v.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    typeVehiculeConjoint === v.value
                      ? 'border-purple-500 bg-purple-500/10 text-white'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-2xl mb-1">{v.icon}</div>
                  <div className="text-sm font-medium">{v.label}</div>
                </button>
              ))}
            </div>

            {typeVehiculeConjoint !== 'aucun' && (
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Kilomètres par an (conjoint)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={kmAnConjoint}
                    onChange={(e) => setKmAnConjoint(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="w-32 text-center">
                    <span className="text-xl font-bold text-purple-400">{kmAnConjoint.toLocaleString()}</span>
                    <span className="text-sm text-gray-400 block">km/an</span>
                  </div>
                </div>
                <p className="text-xs text-purple-300 mt-2">
                  {typeVehiculeConjoint === 'essence' || typeVehiculeConjoint === 'diesel' 
                    ? `Hypothèse : 7L/100km à 1,60€/L en moyenne, dont ~52% de taxes (TICPE + TVA)`
                    : `Hypothèse : 15kWh/100km, dont 20% de TVA sur l'électricité`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Énergie */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-gold" />
            Énergie logement
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Électricité */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dépenses électricité annuelles
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="5000"
                  step="50"
                  value={elecAn}
                  onChange={(e) => {
                    const val = e.target.value;
                    setElecAn(val === '' ? 0 : parseInt(val) || 0);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-gold focus:border-gold"
                />
                <span className="text-gray-400">€/an</span>
              </div>
            </div>

            {/* Gaz */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dépenses gaz annuelles
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="3000"
                  step="50"
                  value={gazAn}
                  onChange={(e) => {
                    const val = e.target.value;
                    setGazAn(val === '' ? 0 : parseInt(val) || 0);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-gold focus:border-gold"
                />
                <span className="text-gray-400">€/an</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Environ 35% de votre facture d'électricité et 30% du gaz sont des taxes
          </p>
        </div>

        {/* Consommation courante */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-gold" />
            Consommation courante
          </h3>

          <label className="block text-sm font-medium text-gray-300 mb-2">
            Dépenses mensuelles (hors loyer/crédit)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={consoMensuelle}
              onChange={(e) => setConsoMensuelle(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold"
            />
            <div className="w-32 text-center">
              <span className="text-xl font-bold text-gold">{consoMensuelle.toLocaleString()}</span>
              <span className="text-sm text-gray-400 block">€/mois</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Alimentation, vêtements, loisirs, etc. (TVA moyenne ~16.5%)
          </p>
        </div>

        {/* Boutons */}
        <div className="flex justify-between">
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
            className="px-8"
          >
            Continuer →
          </Button>
        </div>
      </Card>
    </form>
  );
}

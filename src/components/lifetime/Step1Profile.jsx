import { useState } from 'react';
import { User, Users, Briefcase } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

const STATUTS = [
  { value: 'salarie', label: 'Salarié', icon: '👔' },
  { value: 'cadre', label: 'Cadre', icon: '💼' },
  { value: 'prof_lib', label: 'Profession libérale', icon: '⚕️' },
  { value: 'entrepreneur', label: 'Entrepreneur', icon: '🚀' },
  { value: 'retraite', label: 'Retraité', icon: '🏖️' }
];

export function Step1Profile({ initialData, onContinue }) {
  const [age, setAge] = useState(initialData.age);
  const [ageDebutCarriere, setAgeDebutCarriere] = useState(initialData.ageDebutCarriere || 22);
  const [situation, setSituation] = useState(initialData.situation);
  const [enfants, setEnfants] = useState(initialData.enfants);
  const [statut, setStatut] = useState(initialData.statut);

  const handleSubmit = (e) => {
    e.preventDefault();
    onContinue({
      age,
      ageDebutCarriere,
      situation,
      enfants,
      statut
    });
  };

  const isValid = age >= 18 && age <= 100 && ageDebutCarriere >= 16 && ageDebutCarriere <= age && statut;

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-5 sm:p-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          Étape 1 : Votre profil
        </h2>

        {/* Âge */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Votre âge actuel
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="18"
              max="100"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold"
            />
            <div className="w-20 text-center">
              <span className="text-3xl font-bold text-gold">{age}</span>
              <span className="text-sm text-gray-400 block">ans</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Votre âge aujourd'hui
          </p>
        </div>

        {/* Âge de début de carrière */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Âge de début de carrière
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="16"
              max={age}
              value={ageDebutCarriere}
              onChange={(e) => setAgeDebutCarriere(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="w-20 text-center">
              <span className="text-3xl font-bold text-blue-400">{ageDebutCarriere}</span>
              <span className="text-sm text-gray-400 block">ans</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Âge auquel vous avez commencé à travailler (par défaut : 22 ans)
          </p>
          {ageDebutCarriere > age && (
            <p className="text-xs text-red-400 mt-1">
              ⚠️ L'âge de début de carrière ne peut pas être supérieur à votre âge actuel
            </p>
          )}
        </div>

        {/* Situation familiale */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Situation familiale
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSituation('celibataire')}
              className={`p-4 rounded-lg border-2 transition-all ${
                situation === 'celibataire'
                  ? 'border-gold bg-gold/10 text-white'
                  : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
              }`}
            >
              <User className="w-8 h-8 mx-auto mb-2" />
              <span className="font-medium">Célibataire</span>
            </button>
            <button
              type="button"
              onClick={() => setSituation('couple')}
              className={`p-4 rounded-lg border-2 transition-all ${
                situation === 'couple'
                  ? 'border-gold bg-gold/10 text-white'
                  : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
              }`}
            >
              <Users className="w-8 h-8 mx-auto mb-2" />
              <span className="font-medium">En couple</span>
            </button>
          </div>
        </div>

        {/* Nombre d'enfants */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nombre d'enfants
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="0"
              max="10"
              value={enfants === 0 ? '' : enfants}
              onChange={(e) => {
                const val = e.target.value;
                setEnfants(val === '' ? 0 : parseInt(val) || 0);
              }}
              placeholder="0"
              className="w-24 px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg text-center focus:ring-2 focus:ring-gold focus:border-gold font-bold text-xl"
            />
            <span className="text-gray-400">
              {enfants === 0 ? 'Aucun enfant' : enfants === 1 ? '1 enfant' : `${enfants} enfants`}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Impact sur le quotient familial (impôt sur le revenu)
          </p>
        </div>

        {/* Statut professionnel */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            <Briefcase className="w-5 h-5 inline mr-2" />
            Statut professionnel
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {STATUTS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStatut(s.value)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  statut === s.value
                    ? 'border-gold bg-gold/10 text-white'
                    : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-sm font-medium">{s.label}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Détermine le revenu moyen si vous ne le renseignez pas à l'étape suivante
          </p>
        </div>

        {/* Bouton continuer */}
        <div className="flex justify-end">
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

      {/* Info */}
      <div className="mt-4 text-center text-sm text-gray-400">
        <p>
          💡 Toutes vos données restent sur votre appareil et ne sont jamais transmises
        </p>
      </div>
    </form>
  );
}

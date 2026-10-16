import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { StepHeader } from './StepHeader';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { BENEFICIAIRES_LABELS } from '../constants/fiscal';

export function Step3Amounts({ 
  beneficiaires, 
  montants, 
  onMontantsChange, 
  onNext, 
  onBack 
}) {
  const [immobilier, setImmobilier] = useState(montants?.immobilier || '');
  const [financier, setFinancier] = useState(montants?.financier || '');
  const [avAvant70, setAvAvant70] = useState(montants?.avAvant70 || '');
  const [avApres70, setAvApres70] = useState(montants?.avApres70 || '');
  const [hasDonations, setHasDonations] = useState(false);
  const [donations, setDonations] = useState({});

  useEffect(() => {
    if (montants?.donations) {
      const hasDons = Object.values(montants.donations).some(d => d.length > 0);
      setHasDonations(hasDons);
      setDonations(montants.donations);
    }
  }, [montants]);

  const formatNumber = (value) => {
    if (!value || value === '') return 0;
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const handleNumberInput = (value, setter) => {
    if (value === '' || value === null) {
      setter('');
      return;
    }
    const num = parseFloat(value.replace(/\s/g, ''));
    setter(isNaN(num) ? '' : num);
  };

  const addDonation = (benefType) => {
    const newDonations = { ...donations };
    if (!newDonations[benefType]) {
      newDonations[benefType] = [];
    }
    newDonations[benefType].push({ montant: 0, annee: new Date().getFullYear() });
    setDonations(newDonations);
  };

  const removeDonation = (benefType, index) => {
    const newDonations = { ...donations };
    newDonations[benefType].splice(index, 1);
    setDonations(newDonations);
  };

  const updateDonation = (benefType, index, field, value) => {
    const newDonations = { ...donations };
    newDonations[benefType][index][field] = field === 'montant' 
      ? parseFloat(value) || 0 
      : parseInt(value) || new Date().getFullYear();
    setDonations(newDonations);
  };

  const getDonationBadge = (annee) => {
    const currentYear = new Date().getFullYear();
    const diff = currentYear - annee;
    if (diff <= 15) {
      return <span className="text-xs bg-orange-900/30 text-orange-400 px-2 py-1 rounded">≤ 15 ans</span>;
    }
    return <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">&gt; 15 ans (rechargé)</span>;
  };

  const handleContinue = () => {
    onMontantsChange({
      immobilier: parseFloat(immobilier) || 0,
      financier: parseFloat(financier) || 0,
      avAvant70: parseFloat(avAvant70) || 0,
      avApres70: parseFloat(avApres70) || 0,
      donations: hasDonations ? donations : {}
    });
    onNext();
  };

  const total = (parseFloat(immobilier) || 0) + (parseFloat(financier) || 0);

  return (
    <div className="max-w-4xl mx-auto">
      <StepHeader
        step={3}
        title="Combien & historique ?"
        subtitle="Estimez votre patrimoine et vos donations passées"
      />

      <Card className="mb-6">
        <h3 className="text-xl font-bold text-gold mb-4">Patrimoine à transmettre</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Immobilier (€)
            </label>
            <input
              type="number"
              step="any"
              value={immobilier || ''}
              onChange={(e) => handleNumberInput(e.target.value, setImmobilier)}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
              placeholder="0"
            />
            <p className="text-sm text-gray-500 mt-1">{formatNumber(immobilier)} €</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Financier / Cash (€)
            </label>
            <input
              type="number"
              step="any"
              value={financier || ''}
              onChange={(e) => handleNumberInput(e.target.value, setFinancier)}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
              placeholder="0"
            />
            <p className="text-sm text-gray-500 mt-1">{formatNumber(financier)} €</p>
          </div>
        </div>

        <div className="bg-gold/5 rounded-lg p-4 mb-6">
          <p className="font-bold text-gold">
            Total transmissible : {formatNumber(total)} €
          </p>
        </div>

        <h4 className="text-lg font-bold text-gold mb-3">Assurance-vie (optionnel)</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Primes versées avant 70 ans (€)
            </label>
            <input
              type="number"
              step="any"
              value={avAvant70 || ''}
              onChange={(e) => handleNumberInput(e.target.value, setAvAvant70)}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">Art. 990 I - Abattement 152 500 € / bénéficiaire</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Primes versées après 70 ans (€)
            </label>
            <input
              type="number"
              step="any"
              value={avApres70 || ''}
              onChange={(e) => handleNumberInput(e.target.value, setAvApres70)}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">Art. 757 B - Abattement global 30 500 €</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gold">Donations déjà effectuées</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasDonations}
              onChange={(e) => setHasDonations(e.target.checked)}
              className="w-5 h-5 text-gold rounded focus:ring-navy"
            />
            <span className="text-sm font-medium">Oui, j'ai déjà fait des donations</span>
          </label>
        </div>

        {hasDonations && (
          <div className="space-y-6">
            {beneficiaires.map((benef) => (
              <div key={benef.type} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-100">{BENEFICIAIRES_LABELS[benef.type]}</h4>
                  <button
                    onClick={() => addDonation(benef.type)}
                    className="flex items-center gap-1 text-sm text-gold hover:text-opacity-80"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une donation
                  </button>
                </div>

                {donations[benef.type]?.map((don, index) => (
                  <div key={index} className="flex items-center gap-3 mb-2">
                    <input
                      type="number"
                      value={don.montant}
                      onChange={(e) => updateDonation(benef.type, index, 'montant', e.target.value)}
                      placeholder="Montant (€)"
                      className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                    />
                    <input
                      type="number"
                      value={don.annee}
                      onChange={(e) => updateDonation(benef.type, index, 'annee', e.target.value)}
                      placeholder="Année"
                      className="w-24 px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                    />
                    {getDonationBadge(don.annee)}
                    <button
                      onClick={() => removeDonation(benef.type, index)}
                      className="text-red-400 hover:text-red-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                {(!donations[benef.type] || donations[benef.type].length === 0) && (
                  <p className="text-sm text-gray-500 italic">Aucune donation enregistrée</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={handleContinue}>
          Voir les résultats
        </Button>
      </div>
    </div>
  );
}

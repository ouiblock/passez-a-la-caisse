import { Info, AlertCircle, PiggyBank } from 'lucide-react';
import { ROLES } from '../constants/fiscal';
import { StepHeader } from './StepHeader';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export function Step1Role({ selectedRole, onRoleChange, age, onAgeChange, isCouple, onCoupleChange, partnerAge, onPartnerAgeChange, onNext }) {
  return (
    <div className="max-w-3xl mx-auto">
      <StepHeader
        step={1}
        title="Qui êtes-vous ?"
        subtitle="Sélectionnez votre lien de parenté avec les bénéficiaires de votre héritage"
      />

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {ROLES.map((role) => (
            <label
              key={role.id}
              className={`
                flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all
                ${selectedRole === role.id
                  ? 'border-gold bg-gold/20 shadow-xl scale-105'
                  : 'border-gray-700 bg-gray-800 hover:border-gold hover:shadow-lg hover:scale-102'
                }
              `}
            >
              <input
                type="radio"
                name="role"
                value={role.id}
                checked={selectedRole === role.id}
                onChange={(e) => onRoleChange(e.target.value)}
                className="sr-only"
              />
              <span className={`font-bold ${selectedRole === role.id ? 'text-gold' : 'text-gray-300'}`}>
                {role.label}
              </span>
            </label>
          ))}
        </div>

        {/* Champs Âge et Couple */}
        <div className="mt-6 space-y-4 border-t border-gray-700 pt-6">
          <h3 className="text-lg font-bold text-gold mb-4">Votre situation</h3>
          
          {/* Âge */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Votre âge <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="18"
              max="120"
              value={age}
              onChange={(e) => {
                const val = e.target.value;
                // Permettre la saisie libre sans validation immédiate
                onAgeChange(val === '' ? '' : val);
              }}
              onBlur={(e) => {
                // Valider uniquement à la perte de focus
                const val = e.target.value;
                if (val !== '') {
                  const num = parseInt(val);
                  if (!isNaN(num)) {
                    onAgeChange(Math.max(18, Math.min(120, num)));
                  }
                }
              }}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-gold focus:border-gold text-lg font-bold"
              placeholder="45"
            />
            
            {/* Message d'alerte si âge >= 60 ans */}
            {age && parseInt(age) >= 60 && parseInt(age) < 70 && (
              <div className="mt-3 bg-gold/20 border-2 border-gold rounded-lg p-4 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <PiggyBank className="w-6 h-6 text-gold flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-gold mb-2">
                      💡 Pensez à l'assurance-vie avant vos 70 ans !
                    </p>
                    <div className="text-sm text-gold-light space-y-2">
                      <p>
                        <strong>Avantage fiscal exceptionnel :</strong> Les versements effectués <strong>avant 70 ans</strong> bénéficient 
                        d'un abattement de <strong>152 500 € par bénéficiaire</strong> au décès (CGI art. 990 I).
                      </p>
                      <p>
                        <strong>Votre argent reste disponible :</strong> Vous pouvez retirer vos fonds à tout moment. 
                        L'assurance-vie n'est pas bloquée, c'est juste une enveloppe fiscale avantageuse.
                      </p>
                      <p>
                        <strong>Exonérations :</strong>
                      </p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li>Jusqu'à 152 500 € par bénéficiaire : <strong>0% de droits</strong></li>
                        <li>Au-delà : seulement <strong>20%</strong> (jusqu'à 700 000 €) au lieu de 45% en succession classique</li>
                        <li>Le conjoint/pacsé reste totalement exonéré</li>
                      </ul>
                      <p className="text-gold font-bold mt-2">
                        ⏰ Agissez maintenant : après 70 ans, l'abattement tombe à seulement 30 500 € (pour tous les bénéficiaires) !
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Alerte si >= 70 ans */}
            {age && parseInt(age) >= 70 && (
              <div className="mt-3 bg-orange-900/30 border-2 border-orange-500 rounded-lg p-4 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-orange-300 mb-2">
                      ⚠️ Vous avez 70 ans ou plus
                    </p>
                    <div className="text-sm text-orange-200 space-y-2">
                      <p>
                        Les versements effectués <strong>après 70 ans</strong> sur une assurance-vie bénéficient d'un abattement 
                        global de seulement <strong>30 500 €</strong> (pour tous les bénéficiaires confondus).
                      </p>
                      <p>
                        <strong>Mais l'assurance-vie reste intéressante :</strong>
                      </p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li>Les <strong>intérêts et plus-values</strong> sont totalement exonérés</li>
                        <li>Clause bénéficiaire libre (hors réserve héréditaire)</li>
                        <li>Transmission hors succession (pas de frais de notaire sur l'AV)</li>
                      </ul>
                      <p className="text-orange-300 font-bold mt-2">
                        💡 Privilégiez les donations ou le démembrement pour optimiser davantage.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 flex gap-3 mt-6">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-200">
            <strong className="text-blue-300">⚖️ Simulation pédagogique.</strong> En France, réserve héréditaire pour les descendants : 
            faites valider votre schéma par un notaire ou avocat.
          </p>
        </div>
      </Card>

      <div className="flex justify-end mt-6">
        <Button onClick={onNext} disabled={!selectedRole || !age || (isCouple && !partnerAge)}>
          Continuer
        </Button>
      </div>
    </div>
  );
}

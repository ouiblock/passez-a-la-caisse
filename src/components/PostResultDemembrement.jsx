import { useMemo, useState } from 'react';
import { Info, Split } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { calcDemembrement, droitsDonationNP } from '../utils/demembrement_inter_vivos';

const currency = (n) => new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0
}).format(n);

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export function PostResultDemembrement({ state, engine }) {
  const [pp, setPP] = useState(0);
  const [kind, setKind] = useState('viager');
  const [ageUs, setAgeUs] = useState(state.age || 70);
  const [dur, setDur] = useState(10);
  const [lien, setLien] = useState('enfant');
  const [deja, setDeja] = useState(0);

  // 1) Calcul US/NP
  const dm = useMemo(() => {
    return calcDemembrement(
      kind === 'viager'
        ? { kind, ageUsufruitier: ageUs, pleinePropriete: pp }
        : { kind, dureeAnnees: dur, pleinePropriete: pp }
    );
  }, [pp, kind, ageUs, dur]);

  // 2) Droits de donation si on donne la NP maintenant
  const dDon = useMemo(() => {
    return droitsDonationNP(dm.valNP || 0, lien, deja);
  }, [dm.valNP, lien, deja]);

  // 3) Impact estimé (Δ droits) en sandbox
  const delta = useMemo(() => {
    if (!engine || pp === 0) return 0;
    
    try {
      const base = engine.simulate(state);
      const s2 = structuredClone(state);
      s2.__sandbox_demembrementNP = {
        pleinePropriete: pp,
        kind,
        ageUsufruitier: kind === 'viager' ? ageUs : undefined,
        dureeAnnees: kind === 'temporaire' ? dur : undefined,
        lien,
        dejaConsoAbatt: deja
      };
      const after = engine.simulate(s2);
      return base.droitsSansOpti - after.droitsAvecOpti;
    } catch (error) {
      console.error('Erreur calcul delta démembrement:', error);
      return 0;
    }
  }, [state, engine, pp, kind, ageUs, dur, lien, deja]);

  const canApply = pp > 0 && ((kind === 'viager' && ageUs > 0) || (kind === 'temporaire' && dur > 0));

  return (
    <Card className="bg-gradient-to-br from-indigo-900 to-indigo-800 border-2 border-indigo-500">
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/20 rounded-full mb-4">
            <Split className="w-8 h-8 text-indigo-300" />
          </div>
          <h2 className="text-2xl font-bold text-indigo-100 mb-2 flex items-center justify-center gap-2">
            Démembrement (donation de nue-propriété)
          </h2>
          <p className="text-sm text-indigo-200">
            Évaluez et appliquez une donation de NP <strong>inter vivos</strong> : clé fiscale <em>CGI art. 669</em> (US/NP). 
            La réunion de la pleine propriété au décès s'opère <strong>sans droits</strong> si le démembrement résulte d'une donation régulière.
          </p>
        </div>

        {/* Formulaire */}
        <div className="grid md:grid-cols-3 gap-4">
          <label className="text-sm text-indigo-200">
            Valeur pleine propriété (€)
            <input
              type="number"
              className="w-full mt-1 px-3 py-2 bg-indigo-700 border border-indigo-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-400"
              value={pp || ''}
              onChange={e => setPP(clamp(parseInt(e.target.value || '0', 10), 0, 1e12))}
            />
          </label>

          <label className="text-sm text-indigo-200">
            Type d'usufruit
            <select
              className="w-full mt-1 px-3 py-2 bg-indigo-700 border border-indigo-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-400"
              value={kind}
              onChange={e => setKind(e.target.value)}
            >
              <option value="viager">Viager (par âge)</option>
              <option value="temporaire">Temporaire (par durée)</option>
            </select>
          </label>

          {kind === 'viager' ? (
            <label className="text-sm text-indigo-200">
              Âge de l'usufruitier
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 bg-indigo-700 border border-indigo-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-400"
                value={ageUs || ''}
                onChange={e => setAgeUs(clamp(parseInt(e.target.value || '0', 10), 18, 110))}
              />
            </label>
          ) : (
            <label className="text-sm text-indigo-200">
              Durée (années)
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 bg-indigo-700 border border-indigo-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-400"
                value={dur || ''}
                onChange={e => setDur(clamp(parseInt(e.target.value || '0', 10), 1, 60))}
              />
            </label>
          )}

          <label className="text-sm text-indigo-200">
            Lien donateur → donataire
            <select
              className="w-full mt-1 px-3 py-2 bg-indigo-700 border border-indigo-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-400"
              value={lien}
              onChange={e => setLien(e.target.value)}
            >
              <option value="enfant">Enfant</option>
              <option value="petit_enfant">Petit-enfant</option>
              <option value="frere">Frère</option>
              <option value="soeur">Sœur</option>
              <option value="neveu">Neveu</option>
              <option value="niece">Nièce</option>
              <option value="tiers">Tiers</option>
            </select>
          </label>

          <label className="text-sm text-indigo-200">
            Abattement déjà consommé (≤ 15 ans) (€)
            <input
              type="number"
              className="w-full mt-1 px-3 py-2 bg-indigo-700 border border-indigo-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-400"
              value={deja || 0}
              onChange={e => setDeja(clamp(parseInt(e.target.value || '0', 10), 0, 1e12))}
            />
          </label>
        </div>

        {/* Résultats */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-indigo-800/30 rounded-lg p-4">
            <h4 className="font-bold text-indigo-100 mb-3">Valorisation (art. 669)</h4>
            <p className="text-sm text-indigo-200">
              Usufruit : <strong>{(dm.usPct * 100).toFixed(0)}%</strong> — {currency(dm.valUS)}
            </p>
            <p className="text-sm text-indigo-200">
              Nue-propriété : <strong>{(dm.npPct * 100).toFixed(0)}%</strong> — {currency(dm.valNP)}
            </p>
          </div>

          <div className="bg-indigo-800/30 rounded-lg p-4">
            <h4 className="font-bold text-indigo-100 mb-3">Donation de NP (maintenant)</h4>
            <p className="text-sm text-indigo-200">Base NP : {currency(dDon.baseAvantAbatt)}</p>
            <p className="text-sm text-indigo-200">
              Abattement dispo : {currency(dDon.abattementDisponible)} ({currency(dDon.abattementTheorique)} théorique)
            </p>
            <p className="text-sm text-indigo-200">
              Base taxable : <strong>{currency(dDon.baseTaxable)}</strong>
            </p>
            <p className="text-sm text-indigo-100 font-bold mt-2">
              Droits de donation : {currency(dDon.droits)}
            </p>
          </div>

          <div className="bg-gold/20 rounded-lg p-4 border-2 border-gold">
            <h4 className="font-bold text-gold mb-3">Impact estimé</h4>
            <p className="text-sm text-yellow-200">
              Économie potentielle de droits (Δ) :
            </p>
            <p className="text-2xl font-bold text-gold mt-2">
              {delta > 0 ? `– ${currency(delta)}` : '—'}
            </p>
            <div className="flex gap-1 mt-3 text-xs text-yellow-300">
              <Info className="w-4 h-4 flex-shrink-0" />
              <p>Estimation pédagogique : le moteur final recalculera précisément le bilan.</p>
            </div>
          </div>
        </div>

        {/* Bouton Appliquer */}
        <div className="flex justify-end">
          <Button
            variant="primary"
            disabled={!canApply}
            onClick={() => engine.applyDemembrementNP({
              pleinePropriete: pp,
              kind,
              ageUsufruitier: kind === 'viager' ? ageUs : undefined,
              dureeAnnees: kind === 'temporaire' ? dur : undefined,
              lien,
              dejaConsoAbatt: deja
            })}
          >
            Appliquer cette donation de NP & recalculer
          </Button>
        </div>

        {/* Note explicative */}
        <div className="bg-indigo-800/30 rounded-lg p-4 text-xs text-indigo-300">
          <p className="font-bold mb-2">💡 Comment ça marche ?</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>
              <strong>Inter vivos</strong> : vous donnez la <strong>nue-propriété</strong> et conservez l'<strong>usufruit</strong> (usage/revenus)
            </li>
            <li>
              Au décès, la pleine propriété se reconstitue <strong>sans droits</strong> si le montage est régulier
            </li>
            <li>
              Vous payez des droits de donation maintenant sur la valeur de la NP (réduite selon l'âge ou la durée)
            </li>
            <li>
              La NP sort de votre patrimoine successoral, réduisant les droits futurs
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

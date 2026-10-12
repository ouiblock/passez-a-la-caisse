import { useMemo, useState } from 'react';
import { PiggyBank, Split, HandCoins } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

const currency = (n) => new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0
}).format(n);

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export function PostResultRecommendations({ state, engine }) {
  const nbBenef = state.beneficiaires?.length || 1;
  const nbEnfants = state.beneficiaires?.filter(b => b.type === 'enfant').length || 0;
  const cash = Math.max(state.patrimFinancier || 0, 0);
  const immo = Math.max(state.patrimImmobilier || 0, 0);

  // ---------- 1) ASSURANCE-VIE ----------
  const isAnyUnder70 = (state.age || 0) < 70 || (state.isCouple && (state.partnerAge ?? 100) < 70);
  const maxParBenef990I = 152500;
  
  // Proposition: répartir le cash ≤ nbBenef * 152 500, borné par cash
  const av70SuggestionParBenef = nbBenef > 0 ? Math.min(Math.floor(cash / nbBenef), maxParBenef990I) : 0;
  const splitAV70Init = Object.fromEntries(
    (state.beneficiaires || []).map(b => [b.id, av70SuggestionParBenef])
  );
  const reste = Math.max(cash - av70SuggestionParBenef * nbBenef, 0);
  if (reste > 0 && state.beneficiaires?.[0]) {
    splitAV70Init[state.beneficiaires[0].id] += reste;
  }
  
  const [splitAV70, setSplitAV70] = useState(splitAV70Init);
  const [primesApres70, setPrimesApres70] = useState(0);

  const deltaAV = useMemo(() => {
    if (!engine) return 0;
    try {
      const base = engine.simulate(state);
      const s2 = structuredClone(state);
      s2.__sandbox_avplan = { splitAV70, primesApres70 };
      const after = engine.simulate(s2);
      return Math.max(0, base.droitsSansOpti - after.droitsAvecOpti);
    } catch (error) {
      console.error('Erreur calcul deltaAV:', error);
      return 0;
    }
  }, [state, engine, splitAV70, primesApres70]);

  // ---------- 2) DEMEMBREMENT (donation de NP) ----------
  const [demPP, setDemPP] = useState(Math.floor(immo * 0.5));
  const [mode, setMode] = useState('viager');
  const [ageUs, setAgeUs] = useState(state.age || 70);
  const [duree, setDuree] = useState(10);
  const lienDef = nbEnfants > 0 ? 'enfant' : 'tiers';
  const [lien, setLien] = useState(lienDef);

  const deltaDem = useMemo(() => {
    if (!engine) return 0;
    try {
      const base = engine.simulate(state);
      const s2 = structuredClone(state);
      s2.__sandbox_demembrementPlan = {
        pleinePropriete: demPP,
        mode,
        ageUsufruitier: ageUs,
        duree,
        lien
      };
      const after = engine.simulate(s2);
      return Math.max(0, base.droitsSansOpti - after.droitsAvecOpti);
    } catch (error) {
      console.error('Erreur calcul deltaDem:', error);
      return 0;
    }
  }, [state, engine, demPP, mode, ageUs, duree, lien]);

  // ---------- 3) DONATION "100k€/bénéficiaire" ----------
  const [classiqueParBenef, setClassiqueParBenef] = useState(100000);
  const eligible790G = (state.age || 0) < 80;
  const [use790G, setUse790G] = useState(eligible790G && nbEnfants > 0);

  const deltaDon = useMemo(() => {
    if (!engine) return 0;
    try {
      const base = engine.simulate(state);
      const s2 = structuredClone(state);
      s2.__sandbox_donationPlan = { classiqueParBenef, use790G };
      const after = engine.simulate(s2);
      return Math.max(0, base.droitsSansOpti - after.droitsAvecOpti);
    } catch (error) {
      console.error('Erreur calcul deltaDon:', error);
      return 0;
    }
  }, [state, engine, classiqueParBenef, use790G]);

  // ---------- 4) DON MANUEL 790G (31 865 €) ----------
  const age = state.age || 0;
  const eligible790GManuel = age < 80;
  const anneeCourante = state.anneeCourante || new Date().getFullYear();
  
  // Bénéficiaires éligibles : descendants (enfants, petits-enfants) ou à défaut neveux/nièces
  const benefEligibles790G = (state.beneficiaires || []).filter(b => {
    const isDescendant = b.type === 'enfant' || b.type === 'petit_enfant';
    const isNeveuNiece = b.type === 'neveu_niece';
    // Si pas de descendants, accepter neveux/nièces
    const hasDescendants = (state.beneficiaires || []).some(x => x.type === 'enfant' || x.type === 'petit_enfant');
    return isDescendant || (!hasDescendants && isNeveuNiece);
  });

  // Vérifier si 790G déjà utilisé (< 15 ans)
  const dons790GRecents = benefEligibles790G.map(b => {
    const dons = b.donations || [];
    const don790G = dons.find(d => d.type === '790G' && (anneeCourante - (d.annee || 0)) <= 15);
    return { benefId: b.id, dejaUtilise: !!don790G, anneesRestantes: don790G ? 15 - (anneeCourante - don790G.annee) : 0 };
  });

  // Montants 790G par bénéficiaire
  const montants790GInit = Object.fromEntries(
    benefEligibles790G.map(b => [b.id, 0])
  );
  const [montants790G, setMontants790G] = useState(montants790GInit);

  const delta790G = useMemo(() => {
    if (!engine || !eligible790GManuel) return 0;
    try {
      const base = engine.simulate(state);
      const s2 = structuredClone(state);
      s2.__sandbox_790G = { montants: montants790G };
      const after = engine.simulate(s2);
      return Math.max(0, base.droitsSansOpti - after.droitsAvecOpti);
    } catch (error) {
      console.error('Erreur calcul delta790G:', error);
      return 0;
    }
  }, [state, engine, montants790G, eligible790GManuel]);

  const show790GCard = eligible790GManuel && benefEligibles790G.length > 0;

  // ---------- UI ----------
  return (
    <section className="space-y-6 mt-6">
      {/* Headline contextualisée */}
      <Card className="bg-blue-900/30">
        <p className="text-sm text-gray-300">
          Vous avez <strong className="text-white">
            {nbEnfants > 0 ? `${nbEnfants} enfant${nbEnfants > 1 ? 's' : ''}` : `${nbBenef} bénéficiaire${nbBenef > 1 ? 's' : ''}`}
          </strong>.
          Voici nos <strong className="text-gold">préconisations</strong> pour réduire les droits futurs, calculées selon votre âge, vos liens et vos montants saisis.
        </p>
      </Card>

      {/* Trigger Âge ≥ 60 ans */}
      {age >= 60 && age < 80 && benefEligibles790G.length > 0 && (
        <Card className="bg-gold/10 border-2 border-gold">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💡</span>
            <div>
              <p className="text-sm font-bold text-gold mb-1">Bon réflexe après 60 ans</p>
              <p className="text-sm text-gray-300">
                Pensez au <strong className="text-white">don manuel de 31 865 €</strong> par bénéficiaire 
                (enfants/petits-enfants, ou à défaut neveux/nièces). C'est <strong className="text-gold">exonéré</strong>, 
                cumulable avec les 100 000 €, et renouvelable tous les 15 ans.
              </p>
            </div>
          </div>
        </Card>
      )}

      {age >= 80 && (
        <Card className="bg-orange-900/20 border-2 border-orange-500">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <p className="text-sm text-orange-200">
              À partir de 80 ans, le don manuel 31 865 € (art. 790 G) n'est plus applicable.
            </p>
          </div>
        </Card>
      )}

      {/* 1) ASSURANCE-VIE */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <PiggyBank className="w-5 h-5 text-gold" />
          <h3 className="font-bold text-xl text-gold">Assurance-vie (répartition conseillée)</h3>
        </div>
        <p className="text-sm text-gray-300 mb-4">
          {isAnyUnder70 ? (
            <>
              Avant 70 ans (art. 990 I), vous pouvez viser jusqu'à <strong className="text-white">152 500 €</strong> par bénéficiaire, 
              puis 20 %/31,25 %. Répartissez votre cash entre vos bénéficiaires.
            </>
          ) : (
            <>
              À 70 ans et plus (art. 757 B), l'abattement est global <strong className="text-white">30 500 €</strong> sur les primes 
              puis barème civil. Renseignez les montants ci-dessous.
            </>
          )}
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm font-medium mb-3 text-white">Primes &lt; 70 ans — par bénéficiaire</p>
            {(state.beneficiaires || []).map(b => (
              <div key={b.id} className="flex items-center gap-2 mb-2">
                <span className="w-32 text-sm text-gray-300">{b.type}</span>
                <input
                  type="number"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={splitAV70[b.id] ?? 0}
                  onChange={e => {
                    const v = clamp(parseInt(e.target.value || '0', 10), 0, cash);
                    setSplitAV70(prev => ({ ...prev, [b.id]: v }));
                  }}
                />
              </div>
            ))}
            <p className="text-xs text-gray-400 mt-2">
              💡 Répartir sur plusieurs bénéficiaires maximise l'abattement de 152 500 €.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm font-medium mb-3 text-white">Primes ≥ 70 ans — global (757 B)</p>
            <input
              type="number"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              value={primesApres70}
              onChange={e => setPrimesApres70(clamp(parseInt(e.target.value || '0', 10), 0, cash))}
            />
            <p className="text-xs text-gray-400 mt-2">
              Abattement global 30 500 € sur les primes, puis barème civil par lien.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-green-900/20 rounded-lg p-3">
          <span className="text-sm">
            Économie estimée : {deltaAV > 0 ? (
              <span className="text-green-400 font-bold">– {currency(deltaAV)}</span>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </span>
          <Button
            onClick={() => engine?.applyAVPlan({ splitAV70, primesApres70 })}
            disabled={!engine}
          >
            Appliquer le plan AV & recalculer
          </Button>
        </div>
      </Card>

      {/* 2) DEMEMBREMENT */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Split className="w-5 h-5 text-gold" />
          <h3 className="font-bold text-xl text-gold">Démembrement de propriété (donation de NP aujourd'hui)</h3>
        </div>
        <p className="text-sm text-gray-300 mb-4">
          On applique la clé fiscale <em>CGI art. 669</em> (valorisation US/NP). La pleine propriété se reconstituera{' '}
          <strong className="text-white">sans droits</strong> au décès si le montage est régulier.
        </p>

        <div className="grid md:grid-cols-4 gap-3 mb-4">
          <label className="text-sm">
            <span className="text-gray-300 block mb-1">Montant immobilier (PP)</span>
            <input
              type="number"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              value={demPP || ''}
              onChange={e => setDemPP(clamp(parseInt(e.target.value || '0', 10), 0, Math.max(immo, 0)))}
            />
          </label>
          <label className="text-sm">
            <span className="text-gray-300 block mb-1">Mode</span>
            <select
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              value={mode}
              onChange={e => setMode(e.target.value)}
            >
              <option value="viager">Usufruit viager (par âge)</option>
              <option value="temporaire">Usufruit temporaire (par durée)</option>
            </select>
          </label>
          {mode === 'viager' ? (
            <label className="text-sm">
              <span className="text-gray-300 block mb-1">Âge usufruitier</span>
              <input
                type="number"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                value={ageUs || ''}
                onChange={e => setAgeUs(clamp(parseInt(e.target.value || '0', 10), 18, 110))}
              />
            </label>
          ) : (
            <label className="text-sm">
              <span className="text-gray-300 block mb-1">Durée (années)</span>
              <input
                type="number"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                value={duree || ''}
                onChange={e => setDuree(clamp(parseInt(e.target.value || '0', 10), 1, 60))}
              />
            </label>
          )}
          <label className="text-sm">
            <span className="text-gray-300 block mb-1">Donataire (lien)</span>
            <select
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              value={lien}
              onChange={e => setLien(e.target.value)}
            >
              <option value="enfant">Enfant</option>
              <option value="petit_enfant">Petit-enfant</option>
              <option value="frere_soeur">Frère/Sœur</option>
              <option value="neveu_niece">Neveu/Nièce</option>
              <option value="tiers">Tiers</option>
            </select>
          </label>
        </div>

        <div className="flex items-center justify-between bg-green-900/20 rounded-lg p-3">
          <span className="text-sm">
            Économie estimée : {deltaDem > 0 ? (
              <span className="text-green-400 font-bold">– {currency(deltaDem)}</span>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </span>
          <Button
            onClick={() => engine?.applyDemembrementPlan({
              pleinePropriete: demPP,
              mode,
              ageUsufruitier: mode === 'viager' ? ageUs : undefined,
              duree: mode === 'temporaire' ? duree : undefined,
              lien
            })}
            disabled={!engine}
          >
            Appliquer le démembrement & recalculer
          </Button>
        </div>
      </Card>

      {/* 3) DONATIONS 100k€ */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <HandCoins className="w-5 h-5 text-gold" />
          <h3 className="font-bold text-xl text-gold">Donations – Abattement 100 k€ par bénéficiaire</h3>
        </div>
        <p className="text-sm text-gray-300 mb-4">
          Parent → enfant : <strong className="text-white">100 000 €</strong> par bénéficiaire, renouvelable tous les 15 ans 
          (l'abattement déjà consommé est pris en compte).{' '}
          {eligible790G && (
            <>
              Option : <strong className="text-white">31 865 €</strong> en cash (790 G) si &lt; 80 ans et bénéficiaire majeur.
            </>
          )}
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <label className="text-sm">
            <span className="text-gray-300 block mb-1">Montant par bénéficiaire (max 100 k€)</span>
            <input
              type="number"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              value={classiqueParBenef}
              onChange={e => setClassiqueParBenef(clamp(parseInt(e.target.value || '0', 10), 0, 100000))}
            />
          </label>
          <label className="text-sm flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={use790G}
              onChange={e => setUse790G(e.target.checked)}
              disabled={!eligible790G || nbEnfants === 0}
              className="w-4 h-4"
            />
            <span className="text-gray-300">
              Ajouter 31 865 € (790 G) par bénéficiaire (si éligible)
            </span>
          </label>
        </div>

        <div className="flex items-center justify-between bg-green-900/20 rounded-lg p-3">
          <span className="text-sm">
            Économie estimée : {deltaDon > 0 ? (
              <span className="text-green-400 font-bold">– {currency(deltaDon)}</span>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </span>
          <Button
            onClick={() => engine?.applyDonationPlan({ classiqueParBenef, use790G })}
            disabled={!engine}
          >
            Appliquer la fenêtre & recalculer
          </Button>
        </div>
      </Card>

      {/* 4) DON MANUEL 790G (31 865 €) */}
      {show790GCard && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <HandCoins className="w-5 h-5 text-gold" />
            <h3 className="font-bold text-xl text-gold">Don manuel — 31 865 € par bénéficiaire (art. 790 G)</h3>
          </div>
          
          {!eligible790GManuel ? (
            <div className="bg-orange-900/20 rounded-lg p-4 border-2 border-orange-500">
              <p className="text-sm text-orange-200">
                ⚠️ <strong>Donateur ≥ 80 ans</strong> : le 790 G n'est pas applicable.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-300 mb-4">
                Vous avez <strong className="text-white">{benefEligibles790G.length} bénéficiaire{benefEligibles790G.length > 1 ? 's' : ''} éligible{benefEligibles790G.length > 1 ? 's' : ''}</strong>. 
                Le don manuel de sommes d'argent (<strong className="text-white">31 865 €</strong>) est <strong className="text-gold">exonéré</strong>, 
                cumulable avec les 100 000 €, et renouvelable tous les 15 ans.
              </p>

              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium mb-3 text-white">Conditions</p>
                <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                  <li>Donateur &lt; 80 ans ✓</li>
                  <li>Bénéficiaire majeur (supposé)</li>
                  <li>Descendants (enfants, petits-enfants) — à défaut, neveu/nièce</li>
                  <li>Formulaire 2735 (déclaration du don)</li>
                </ul>
              </div>

              <div className="space-y-3 mb-4">
                <p className="text-sm font-medium text-white">Montants par bénéficiaire</p>
                {benefEligibles790G.map((b, idx) => {
                  const donRecent = dons790GRecents.find(d => d.benefId === b.id);
                  return (
                    <div key={b.id} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-300 flex-1">{b.type} — {b.id.slice(0, 8)}</span>
                        <input
                          type="number"
                          className="w-32 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                          value={montants790G[b.id] || 0}
                          onChange={e => {
                            const v = clamp(parseInt(e.target.value || '0', 10), 0, 31865);
                            setMontants790G(prev => ({ ...prev, [b.id]: v }));
                          }}
                          disabled={donRecent?.dejaUtilise}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMontants790G(prev => ({ ...prev, [b.id]: 31865 }))}
                          disabled={donRecent?.dejaUtilise}
                        >
                          Max
                        </Button>
                      </div>
                      {donRecent?.dejaUtilise && (
                        <p className="text-xs text-orange-400">
                          ⚠️ Le 790 G a déjà été utilisé récemment : réinitialisation dans {donRecent.anneesRestantes} an{donRecent.anneesRestantes > 1 ? 's' : ''}.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-blue-800/20 rounded-lg p-3 mb-4 text-xs text-gray-300">
                <p>💡 <strong className="text-white">Astuce :</strong> Lissez vos dons 790 G et vos donations 100 000 € pour optimiser les recharges de 15 ans.</p>
                <p className="mt-1">📋 <strong className="text-white">Rappel :</strong> Le don manuel 790 G ne consomme pas l'abattement 100 000 €.</p>
                <p className="mt-1">📝 <strong className="text-white">Pédagogie :</strong> Déclarez via le formulaire 2735.</p>
              </div>

              <div className="flex items-center justify-between bg-green-900/20 rounded-lg p-3">
                <span className="text-sm">
                  Économie estimée : {delta790G > 0 ? (
                    <span className="text-green-400 font-bold">– {currency(delta790G)}</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </span>
                <Button
                  onClick={() => {
                    if (engine?.apply790GPlan) {
                      engine.apply790GPlan({ montants: montants790G });
                    }
                  }}
                  disabled={!engine || Object.values(montants790G).every(v => v === 0)}
                >
                  Appliquer les dons 790 G & recalculer
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Avertissements pro */}
      <div className="bg-gray-800/50 rounded-lg p-4 text-xs text-gray-400">
        <p>
          <strong className="text-white">⚠️ Simulation indicative.</strong> Réserve héréditaire à respecter. Dons ≤15 ans consomment l'abattement.{' '}
          AV : 990 I (&lt;70) 152 500 €/bénéficiaire ; 757 B (≥70) 30 500 € global sur primes + barème civil.{' '}
          Démembrement : valorisation fiscale art. 669 ; réunion sans droits au décès (montage régulier).
        </p>
      </div>
    </section>
  );
}

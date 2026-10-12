import { useState, useMemo } from 'react';
import { Info, Wand2, PiggyBank, Split, Shield, Landmark, Lightbulb, X } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { currency, clamp } from '../utils/recoEngineAdapter';

export function RecommendationsModule({ state, engine }) {
  if (!state || !state.beneficiaires) {
    return null;
  }
  
  const nbEnfants = state.beneficiaires.filter(b => b.type === 'enfant').length;
  const hasEnfants = nbEnfants > 0;

  const ageNum = parseInt(state.age) || 0;
  const partnerAgeNum = parseInt(state.partnerAge) || 0;
  
  const eligibleAV70 = ageNum < 70 || (state.isCouple && partnerAgeNum < 70);
  const eligible790G_Donateur = ageNum < 80 && hasEnfants;
  const eligible790G_Partner = state.isCouple && partnerAgeNum < 80 && hasEnfants;

  // Split AV <70 par défaut (égalitaire)
  const [splitAV70, setSplitAV70] = useState(() => {
    const total = state.montants?.avAvant70 || 0;
    const ben = state.beneficiaires;
    const m = {};
    if (ben.length === 0) return m;
    const part = Math.floor(total / ben.length);
    ben.forEach(b => m[b.type] = part);
    const reste = total - part * ben.length;
    if (reste > 0) m[ben[0].type] = (m[ben[0].type] || 0) + reste;
    return m;
  });

  const [donClassiqueParEnfant, setDonClassiqueParEnfant] = useState(100000);
  const [don790GParEnfant, setDon790GParEnfant] = useState(31865);

  const recos = useMemo(() => {
    const list = [];

    // 1) Fenêtre de donations immédiate
    if (hasEnfants) {
      const totalClassique = donClassiqueParEnfant * nbEnfants * (state.isCouple ? 2 : 1);
      const total790G = (eligible790G_Donateur ? don790GParEnfant * nbEnfants : 0) + 
                        (eligible790G_Partner ? don790GParEnfant * nbEnfants : 0);
      const totalFenetre = totalClassique + total790G;

      list.push({
        key: 'window_now',
        icon: <Wand2 className="w-5 h-5 text-gold" />,
        titre: "Activer la fenêtre de donations (maintenant)",
        desc: `Profitez des abattements : ${currency(totalClassique)} (classique) + ${currency(total790G)} (790G) = ${currency(totalFenetre)} transmis sans droits`,
        controls: (
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-gray-300">
              Classique par enfant (€)
              <input 
                type="number" 
                className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-gold"
                value={donClassiqueParEnfant}
                onChange={e => setDonClassiqueParEnfant(clamp(parseInt(e.target.value || '0', 10), 0, 100000))}
              />
            </label>
            <label className="text-sm text-gray-300">
              790G par enfant (€) {!eligible790G_Donateur && !eligible790G_Partner && <span className="text-xs text-gray-500">(non éligible ≥ 80 ans)</span>}
              <input 
                type="number" 
                className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-gold"
                value={don790GParEnfant}
                onChange={e => setDon790GParEnfant(clamp(parseInt(e.target.value || '0', 10), 0, 31865))}
              />
            </label>
            <p className="col-span-2 text-xs text-gray-400">
              💡 Conditions 790G : donateur &lt; 80 ans et donataire majeur ; cumulable avec l'abattement classique ; déclaration 2735.
            </p>
          </div>
        ),
        cta: (
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="primary"
              onClick={() => engine.applyDonationWindow('donateur', donClassiqueParEnfant, eligible790G_Donateur ? don790GParEnfant : 0)}
            >
              Appliquer (donateur)
            </Button>
            {state.isCouple && (
              <Button 
                variant="primary"
                onClick={() => engine.applyDonationWindow('partenaire', donClassiqueParEnfant, eligible790G_Partner ? don790GParEnfant : 0)}
              >
                Appliquer (partenaire)
              </Button>
            )}
          </div>
        ),
        score: 100,
        impact: `Économie potentielle : ${currency(totalFenetre * 0.2)}`
      });
    }

    // 2) AV <70 - Répartition optimale
    if ((state.montants?.avAvant70 || 0) > 0 && state.beneficiaires.length > 0) {
      const totalAV = (state.montants?.avAvant70 || 0) + (state.montants?.avApres70 || 0);
      const abattementParBenef = 152500;
      // Calculer le nombre réel de bénéficiaires (en tenant compte du champ nombre)
      const nbBeneficiairesTotal = state.beneficiaires.reduce((sum, b) => sum + (b.nombre || 1), 0);
      const hasNeveuNiece = state.beneficiaires.some(b => b.type === 'neveu_niece');
      const economieEstimee = Math.min(totalAV, abattementParBenef * nbBeneficiairesTotal) * 0.2;

      list.push({
        key: 'av70',
        icon: <PiggyBank className="w-5 h-5 text-gold" />,
        titre: hasNeveuNiece 
          ? "⭐ Assurance-vie < 70 ans : 20% au lieu de 55% pour vos neveux/nièces !"
          : "Assurance-vie < 70 ans : maximiser les 152 500 € / bénéficiaire",
        desc: eligibleAV70
          ? hasNeveuNiece
            ? `Répartissez ${currency(totalAV)} sur ${nbBeneficiairesTotal} bénéficiaire(s). Pour les neveux/nièces, l'AV est taxée à 20% au lieu de 55% en succession (économie de 35% !). Abattement : 152 500 € / bénéficiaire (art. 990 I).`
            : `Répartissez ${currency(totalAV)} sur ${nbBeneficiairesTotal} bénéficiaire(s) : chaque part bénéficie de 152 500 € (art. 990 I), puis 20%/31,25%.`
          : "Si tout le monde ≥ 70 ans, privilégiez d'autres leviers.",
        controls: (
          <div className="space-y-2">
            {/* Dédupliquer les bénéficiaires par type */}
            {Array.from(new Set(state.beneficiaires.map(b => b.type))).map(type => {
              const benef = state.beneficiaires.find(b => b.type === type);
              const nombre = benef?.nombre || 1;
              const label = nombre > 1 ? `${type} (${nombre})` : type;
              
              return (
                <div key={type} className="flex items-center gap-2">
                  <span className="w-44 text-sm text-gray-300">{label}</span>
                  <input
                    type="number"
                    className="w-40 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-gold"
                    value={splitAV70[type] || 0}
                    onChange={e => {
                      const v = clamp(parseInt(e.target.value || '0', 10), 0, totalAV);
                      setSplitAV70(prev => ({ ...prev, [type]: v }));
                    }}
                  />
                </div>
              );
            })}
            <p className="text-xs text-gray-400">💡 Plus de bénéficiaires = plus d'abattements de 152 500 € utilisés.</p>
          </div>
        ),
        cta: (
          <Button 
            variant="primary"
            onClick={() => engine.applyAssuranceVieSplit(splitAV70)}
          >
            Appliquer & recalculer
          </Button>
        ),
        score: 95,
        impact: `Économie potentielle : ${currency(economieEstimee)}`
      });
    }

    // 3) Clause bénéficiaire AV
    if ((state.montants?.avAvant70 || 0) > 0 && state.beneficiaires.length > 1) {
      list.push({
        key: 'clause',
        icon: <Shield className="w-5 h-5 text-gold" />,
        titre: "Clause bénéficiaire AV : clarifier & répartir",
        desc: "Rédigez une clause par têtes. Pas de représentation en AV : répartissez explicitement entre bénéficiaires pour coller à votre volonté et optimiser 990 I.",
        controls: (
          <p className="text-xs text-gray-400">À faire chez l'assureur. Conseil rédactionnel à faire valider.</p>
        ),
        cta: (
          <span className="text-sm text-gray-400">Information — pas d'action in-app.</span>
        ),
        score: 60
      });
    }

    // 4) Réserve héréditaire
    const pctEnfants = state.beneficiaires
      .filter(b => b.type === 'enfant')
      .reduce((s, b) => s + (b.pourcentage || 0), 0);
    
    if (hasEnfants && pctEnfants < 50) {
      list.push({
        key: 'reserve',
        icon: <Landmark className="w-5 h-5 text-gold" />,
        titre: "Réserve héréditaire : vérifiez vos pourcentages",
        desc: "En présence de descendants, une part minimale leur est due. Simulation pédagogique : faites valider par notaire/avocat.",
        controls: (
          <p className="text-xs text-gray-400">Ajustez vos % si besoin dans l'étape 2.</p>
        ),
        cta: (
          <span className="text-sm text-gray-400">Information — pas d'action automatique.</span>
        ),
        score: 50
      });
    }

    return list.sort((a, b) => b.score - a.score);
  }, [state, eligibleAV70, eligible790G_Donateur, eligible790G_Partner, splitAV70, donClassiqueParEnfant, don790GParEnfant, hasEnfants, nbEnfants]);

  if (recos.length === 0) {
    return null;
  }

  // Récupérer toutes les donations appliquées
  const donationsAppliquees = state.beneficiaires.flatMap(b => 
    (b.donations || []).map((d, idx) => ({
      benefType: b.type,
      benefNombre: b.nombre || 1,
      donation: d,
      index: idx
    }))
  );

  return (
    <section className="space-y-4 mb-8">
      <div className="flex items-center gap-3">
        <Lightbulb className="w-6 h-6 text-gold" />
        <h2 className="text-2xl font-bold text-gold">Préconisations & optimisation fiscale</h2>
      </div>
      <p className="text-sm text-gray-400">Ajustez, appliquez, puis regardez l'impact sur le bilan.</p>
      
      {/* Afficher les donations appliquées */}
      {donationsAppliquees.length > 0 && (
        <Card className="bg-green-900/20 border-2 border-green-700">
          <div className="space-y-3">
            <h3 className="font-bold text-green-100 flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              Donations appliquées ({donationsAppliquees.length})
            </h3>
            <div className="space-y-2">
              {donationsAppliquees.map((item, globalIdx) => (
                <div key={globalIdx} className="flex items-center justify-between bg-green-800/30 rounded-lg p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-100">
                      {currency(item.donation.montant)} • {item.donation.type} • Par {item.donation.par}
                    </p>
                    <p className="text-xs text-green-300 mt-1">
                      Pour {item.benefNombre} {item.benefType} • Année {item.donation.annee}
                    </p>
                  </div>
                  <button
                    onClick={() => engine.removeDonation(item.benefType, item.index)}
                    className="ml-3 p-2 hover:bg-red-900 hover:bg-opacity-30 rounded-lg transition-colors group"
                    title="Supprimer cette donation"
                  >
                    <X className="w-4 h-4 text-green-300 group-hover:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
      
      {recos.map(r => (
        <Card key={r.key} className="border-gray-700">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{r.icon}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-4 mb-2">
                <h3 className="font-bold text-white">{r.titre}</h3>
                {r.impact && (
                  <span className="text-sm text-green-400">
                    {r.impact}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-300">{r.desc}</p>
              <div className="mt-3">{r.controls}</div>
              <div className="mt-3">{r.cta}</div>
            </div>
          </div>
        </Card>
      ))}
      
      <div className="rounded-xl bg-yellow-900/20 border border-yellow-700 p-3 text-xs text-yellow-200">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            ⚠️ Simulation indicative. Réserve héréditaire, situations particulières (handicap, exonérations), IFI, démembrements atypiques : faites valider par notaire/avocat.
          </p>
        </div>
      </div>
    </section>
  );
}

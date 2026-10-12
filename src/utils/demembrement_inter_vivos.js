/**
 * Démembrement inter vivos - Donation de nue-propriété
 * CGI art. 669 - Barème fiscal US/NP
 */

const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Calcul du pourcentage d'usufruit viager selon l'âge (CGI art. 669)
 */
export function usPctViager(age) {
  if (age <= 20) return 0.90;
  if (age <= 30) return 0.80;
  if (age <= 40) return 0.70;
  if (age <= 50) return 0.60;
  if (age <= 60) return 0.50;
  if (age <= 70) return 0.40;
  if (age <= 80) return 0.30;
  if (age <= 90) return 0.20;
  return 0.10;
}

/**
 * Calcul du pourcentage d'usufruit temporaire
 * 23% par tranche de 10 ans commencée (plafonné à 100%)
 */
export function usPctTemporaire(duree) {
  if (!Number.isFinite(duree) || duree <= 0) return 0;
  return Math.min(0.23 * Math.ceil(duree / 10), 1);
}

/**
 * Calcule le démembrement US/NP
 */
export function calcDemembrement(input) {
  const usPct = input.kind === 'viager' 
    ? usPctViager(input.ageUsufruitier) 
    : usPctTemporaire(input.dureeAnnees);
  
  const npPct = Math.max(1 - usPct, 0);
  
  return {
    usPct,
    npPct,
    valUS: r2(input.pleinePropriete * usPct),
    valNP: r2(input.pleinePropriete * npPct)
  };
}

// ---- Barèmes de donation ----

const BAREME_LD = [
  [8072, 0.05],
  [12109, 0.10],
  [15932, 0.15],
  [552324, 0.20],
  [902838, 0.30],
  [1805677, 0.40],
  ['inf', 0.45]
];

const BAREME_FRATRIE = [
  [24430, 0.35],
  ['inf', 0.45]
];

const BAREME_COLLATS = [
  ['inf', 0.55]
];

const BAREME_TIERS = [
  ['inf', 0.60]
];

function baremeFor(lien) {
  if (lien === 'enfant' || lien === 'petit_enfant') return BAREME_LD;
  if (lien === 'frere' || lien === 'soeur') return BAREME_FRATRIE;
  if (lien === 'neveu' || lien === 'niece') return BAREME_COLLATS;
  return BAREME_TIERS;
}

function applyTranches(base, tranches) {
  if (base <= 0) return 0;
  
  let reste = base;
  let prev = 0;
  let tot = 0;
  
  for (const [lim, taux] of tranches) {
    if (lim === 'inf') {
      tot += reste * taux;
      return r2(tot);
    }
    
    const cap = lim;
    const q = Math.max(Math.min(reste, cap - prev), 0);
    tot += q * taux;
    reste -= q;
    prev = cap;
    
    if (reste <= 0) break;
  }
  
  return r2(tot);
}

/**
 * Abattement donation selon le lien
 */
export function abattementDonation(lien) {
  if (lien === 'enfant') return 100000;
  if (lien === 'petit_enfant') return 31865; // 790 B
  if (lien === 'frere' || lien === 'soeur') return 15932;
  if (lien === 'neveu' || lien === 'niece') return 7967;
  return 1594; // tiers
}

/**
 * Calcule les droits de donation sur la nue-propriété
 */
export function droitsDonationNP(valNP, lien, dejaConsoAbatt = 0) {
  const abatTheo = abattementDonation(lien);
  const abatDisp = Math.max(abatTheo - (dejaConsoAbatt || 0), 0);
  const baseTax = Math.max(valNP - abatDisp, 0);
  const droits = applyTranches(baseTax, baremeFor(lien));
  
  return {
    baseAvantAbatt: r2(valNP),
    abattementTheorique: abatTheo,
    abattementDisponible: abatDisp,
    baseTaxable: r2(baseTax),
    droits
  };
}

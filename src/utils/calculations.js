import { FISC } from '../constants/fiscal.js';

/**
 * Applique un barème progressif à un montant
 */
export function appliquerBareme(montant, bareme) {
  let droits = 0;
  let reste = montant;
  let tranchePrecedente = 0;

  for (const [seuil, taux] of bareme) {
    const tranche = Math.min(reste, seuil - tranchePrecedente);
    droits += tranche * taux;
    reste -= tranche;
    
    if (reste <= 0) break;
    tranchePrecedente = seuil;
  }

  return droits;
}

/**
 * Détermine le barème applicable selon le lien de parenté
 */
export function getBareme(typeBeneficiaire) {
  switch (typeBeneficiaire) {
    case 'enfant':
    case 'petit_enfant':
      return FISC.baremes.ligne_directe;
    case 'frere_soeur':
      return FISC.baremes.freres_soeurs;
    case 'neveu_niece':
      return FISC.baremes.collateraux;
    case 'conjoint':
      return [[Infinity, 0]]; // Exonéré
    case 'tiers':
      return FISC.baremes.tiers;
    default:
      return FISC.baremes.tiers;
  }
}

/**
 * Récupère l'abattement applicable (succession par défaut)
 * @param {string} typeBeneficiaire - Type de bénéficiaire
 * @param {string} mode - 'succession' ou 'donation'
 */
export function getAbattement(typeBeneficiaire, mode = 'succession') {
  const abattements = mode === 'donation' ? FISC.abattements.donation : FISC.abattements.succession;
  
  switch (typeBeneficiaire) {
    case 'enfant':
      return abattements.enfant || 100000;
    case 'petit_enfant':
      // En donation: 790B = 31865€, en succession: 1594€ (sauf représentation)
      return mode === 'donation' ? (abattements.petit_enfant_790B || 31865) : (abattements.tiers || 1594);
    case 'frere_soeur':
      return abattements.freres_soeurs || 15932;
    case 'neveu_niece':
      return abattements.neveu_niece || 7967;
    case 'conjoint':
      return abattements.conjoint || Infinity;
    case 'tiers':
      return abattements.tiers || 1594;
    default:
      return abattements.tiers || 1594;
  }
}

/**
 * Calcule les donations consommées dans les N dernières années (15 par défaut)
 */
export function calculerDonationsConsommees(donations, anneeActuelle = new Date().getFullYear()) {
  const rechargeAns = FISC.regles?.recharge_abattements_ans || 15;
  return donations
    .filter(d => (anneeActuelle - d.annee) <= rechargeAns)
    .reduce((sum, d) => sum + d.montant, 0);
}

/**
 * Calcule les droits de succession pour un bénéficiaire
 * @param {boolean} isCouple - Indique si le défunt a un conjoint survivant (n'affecte PAS les abattements des enfants)
 * Note: Le double abattement (200k) pour les enfants ne s'applique que si les DEUX parents sont décédés
 */
export function calculerDroitsBeneficiaire(beneficiaire, montantTransmissible, pourcentage, donations = [], isCouple = false) {
  const quotePart = montantTransmissible * (pourcentage / 100);
  const abattementBase = getAbattement(beneficiaire.type);
  
  // Abattement handicap (cumulable avec l'abattement de base)
  const abattementHandicap = beneficiaire.handicap ? (FISC.abattements.succession.handicap || 159325) : 0;
  
  // IMPORTANT: isCouple = true signifie que le défunt a un conjoint SURVIVANT
  // Dans ce cas, les enfants n'ont PAS le double abattement
  // Le double abattement (200k) ne s'applique que si les DEUX parents sont décédés
  // Donc on ne multiplie JAMAIS par 2 ici
  const abattementTotal = abattementBase + abattementHandicap;
  
  const donationsConsommees = calculerDonationsConsommees(donations);
  const abattementDisponible = Math.max(0, abattementTotal - donationsConsommees);
  const baseTaxable = Math.max(0, quotePart - abattementDisponible);
  const bareme = getBareme(beneficiaire.type);
  const droitsCivils = appliquerBareme(baseTaxable, bareme);

  return {
    quotePart,
    abattementTotal,
    abattementBase,
    abattementHandicap,
    donationsConsommees,
    abattementDisponible,
    baseTaxable,
    droitsCivils,
    net: quotePart - droitsCivils,
    isCouple
  };
}

/**
 * Calcule les droits sur l'assurance-vie avant 70 ans (art. 990 I)
 */
export function calculerDroitsAVAvant70(montant) {
  const { abattement_par_beneficiaire, palier_20_pourcent, taux_au_dela } = FISC.assurance_vie.avant70_990I;
  const apresAbattement = Math.max(0, montant - abattement_par_beneficiaire);
  
  if (apresAbattement <= palier_20_pourcent) {
    return apresAbattement * 0.20;
  } else {
    return palier_20_pourcent * 0.20 + (apresAbattement - palier_20_pourcent) * taux_au_dela;
  }
}

/**
 * Calcule les droits sur l'assurance-vie après 70 ans (art. 757 B)
 */
export function calculerDroitsAVApres70(montantPrimes, typeBeneficiaire, partProrata, abattementGlobalRestant) {
  const abattementApplicable = Math.min(partProrata, abattementGlobalRestant);
  const baseTaxable = Math.max(0, partProrata - abattementApplicable);
  const bareme = getBareme(typeBeneficiaire);
  return appliquerBareme(baseTaxable, bareme);
}

/**
 * Calcule le total des droits avec assurance-vie
 * @param {boolean} isCouple - Si true, double les abattements
 */
export function calculerDroitsAvecAV(beneficiaires, montantTransmissible, avAvant70, avApres70, isCouple = false) {
  const resultats = [];
  let totalDroits = 0;
  let totalDroitsAV = 0;

  // Calcul du nombre de bénéficiaires pour répartir l'abattement AV après 70
  const nbBeneficiaires = beneficiaires.length;
  const abattementGlobalApres70 = FISC.assurance_vie.apres70_757B.abattement_global;
  
  // Si couple, doubler l'abattement AV après 70 (chaque parent a le sien)
  const abattementApres70Total = isCouple ? abattementGlobalApres70 * 2 : abattementGlobalApres70;

  beneficiaires.forEach((benef) => {
    // Droits civils classiques (chaque bénéficiaire est maintenant un objet séparé)
    const droitsCivils = calculerDroitsBeneficiaire(
      benef,
      montantTransmissible,
      benef.pourcentage,
      benef.donations || [],
      isCouple
    );

    // Droits AV avant 70 ans
    let droitsAVAvant70 = 0;
    if (avAvant70 > 0) {
      const partAVAvant70 = avAvant70 * (benef.pourcentage / 100);
      droitsAVAvant70 = calculerDroitsAVAvant70(partAVAvant70);
    }

    // Droits AV après 70 ans
    let droitsAVApres70 = 0;
    if (avApres70 > 0) {
      const partAVApres70 = avApres70 * (benef.pourcentage / 100);
      const abattementProrata = abattementApres70Total / nbBeneficiaires;
      droitsAVApres70 = calculerDroitsAVApres70(
        partAVApres70,
        benef.type,
        partAVApres70,
        abattementProrata
      );
    }

    const totalDroitsAVBenef = droitsAVAvant70 + droitsAVApres70;
    const totalDroitsBenef = droitsCivils.droitsCivils + totalDroitsAVBenef;

    totalDroits += totalDroitsBenef;
    totalDroitsAV += totalDroitsAVBenef;

    resultats.push({
      ...benef,
      ...droitsCivils,
      droitsAVAvant70,
      droitsAVApres70,
      totalDroitsAV: totalDroitsAVBenef,
      totalDroits: totalDroitsBenef,
      netFinal: droitsCivils.quotePart + (avAvant70 + avApres70) * (benef.pourcentage / 100) - totalDroitsBenef
    });
  });

  return { resultats, totalDroits, totalDroitsAV };
}

/**
 * Adapter Estimation des droits de succession
 * Calcule ce que les héritiers paieront à votre décès
 */

// Barème des droits de succession en ligne directe (parents-enfants) 2025
const BAREME_SUCCESSION_LIGNE_DIRECTE = [
  { min: 0, max: 8072, taux: 0.05 },
  { min: 8072, max: 12109, taux: 0.10 },
  { min: 12109, max: 15932, taux: 0.15 },
  { min: 15932, max: 552324, taux: 0.20 },
  { min: 552324, max: 902838, taux: 0.30 },
  { min: 902838, max: 1805677, taux: 0.40 },
  { min: 1805677, max: Infinity, taux: 0.45 }
];

// Abattements 2025
const ABATTEMENTS = {
  enfant: 100000, // 100 000 € par enfant
  conjoint: Infinity, // Exonération totale
  petitEnfant: 1594,
  arrierePetitEnfant: 1594,
  frere_soeur: 15932,
  neveu_niece: 7967
};

/**
 * Calcule les droits de succession pour un enfant
 * @param {number} partRecue - Part reçue par l'enfant
 * @returns {number} Droits à payer
 */
function calculerDroitsEnfant(partRecue) {
  // Appliquer l'abattement
  const baseImposable = Math.max(0, partRecue - ABATTEMENTS.enfant);
  
  if (baseImposable === 0) return 0;
  
  // Appliquer le barème progressif
  let droits = 0;
  
  for (const tranche of BAREME_SUCCESSION_LIGNE_DIRECTE) {
    if (baseImposable > tranche.min) {
      const montantTranche = Math.min(baseImposable, tranche.max) - tranche.min;
      droits += montantTranche * tranche.taux;
    }
  }
  
  return Math.round(droits);
}

/**
 * Estime les droits de succession totaux que paieront les héritiers
 * @param {import('../../../types/tax').Profil} profil - Profil utilisateur
 * @returns {Object} Estimation des droits de succession
 */
export function estimateSuccessionHeritiers(profil) {
  // Calculer le patrimoine total à transmettre
  let patrimoineTotal = 0;
  
  // Immobilier
  if (profil.logement.rpAchat && profil.logement.rpPrix) {
    patrimoineTotal += profil.logement.rpPrix;
  }
  if (profil.logement.rsAchat && profil.logement.rsPrix) {
    patrimoineTotal += profil.logement.rsPrix;
  }
  
  // Placements financiers (tous types)
  if (profil.placements) {
    // Nouveau système avec placements détaillés
    if (profil.placements.pea) patrimoineTotal += profil.placements.pea;
    if (profil.placements.assuranceVie) patrimoineTotal += profil.placements.assuranceVie;
    if (profil.placements.cto) patrimoineTotal += profil.placements.cto;
    if (profil.placements.livrets) patrimoineTotal += profil.placements.livrets;
    if (profil.placements.autresPlacements) patrimoineTotal += profil.placements.autresPlacements;
    
    // Ancien système (pour compatibilité)
    if (profil.placements.capitalTotal && !profil.placements.pea && !profil.placements.assuranceVie) {
      patrimoineTotal += profil.placements.capitalTotal;
    }
  }
  
  // Cash/épargne (si renseigné)
  if (profil.patrimoine && profil.patrimoine.cash) {
    patrimoineTotal += profil.patrimoine.cash;
  }
  
  // Déduire les crédits
  if (profil.credits && profil.credits.capitalRestant) {
    patrimoineTotal -= profil.credits.capitalRestant;
  }
  
  // Si couple, on suppose que le conjoint hérite d'abord (exonéré)
  // Les enfants héritent au décès du second parent
  // Pour simplifier, on calcule sur la totalité du patrimoine
  
  const nombreEnfants = profil.enfants || 1; // Au moins 1 pour le calcul
  
  if (nombreEnfants === 0) {
    // Pas d'enfants : calcul différent (frères/sœurs, neveux...)
    // Pour l'instant, on retourne 0
    return {
      patrimoineTotal: Math.round(patrimoineTotal),
      nombreHeritiers: 0,
      partParHeritier: 0,
      droitsParHeritier: 0,
      droitsTotal: 0,
      tauxMoyen: 0
    };
  }
  
  // Part par enfant (répartition égale)
  const partParEnfant = patrimoineTotal / nombreEnfants;
  
  // Droits par enfant
  const droitsParEnfant = calculerDroitsEnfant(partParEnfant);
  
  // Droits totaux
  const droitsTotal = droitsParEnfant * nombreEnfants;
  
  // Taux moyen
  const tauxMoyen = patrimoineTotal > 0 ? (droitsTotal / patrimoineTotal) * 100 : 0;
  
  return {
    patrimoineTotal: Math.round(patrimoineTotal),
    nombreHeritiers: nombreEnfants,
    partParHeritier: Math.round(partParEnfant),
    droitsParHeritier: Math.round(droitsParEnfant),
    droitsTotal: Math.round(droitsTotal),
    tauxMoyen: Math.round(tauxMoyen * 100) / 100,
    abattementParEnfant: ABATTEMENTS.enfant
  };
}

/**
 * Détail du calcul pour un héritier
 * @param {number} partRecue - Part reçue
 * @returns {Object} Détail des tranches
 */
export function detailCalculSuccession(partRecue) {
  const baseImposable = Math.max(0, partRecue - ABATTEMENTS.enfant);
  
  if (baseImposable === 0) {
    return {
      partRecue: Math.round(partRecue),
      abattement: ABATTEMENTS.enfant,
      baseImposable: 0,
      tranches: [],
      total: 0
    };
  }
  
  const tranches = [];
  let droitsTotal = 0;
  
  for (const tranche of BAREME_SUCCESSION_LIGNE_DIRECTE) {
    if (baseImposable > tranche.min) {
      const montantTranche = Math.min(baseImposable, tranche.max) - tranche.min;
      const droitsTranche = montantTranche * tranche.taux;
      
      if (montantTranche > 0) {
        tranches.push({
          min: tranche.min,
          max: tranche.max === Infinity ? 'Au-delà' : tranche.max,
          taux: tranche.taux * 100,
          montant: Math.round(montantTranche),
          droits: Math.round(droitsTranche)
        });
        
        droitsTotal += droitsTranche;
      }
    }
  }
  
  return {
    partRecue: Math.round(partRecue),
    abattement: ABATTEMENTS.enfant,
    baseImposable: Math.round(baseImposable),
    tranches,
    total: Math.round(droitsTotal)
  };
}

export default {
  estimateSuccessionHeritiers,
  detailCalculSuccession
};

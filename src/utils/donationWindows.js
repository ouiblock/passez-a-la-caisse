/**
 * Utilitaires pour le calendrier de donations par fenêtres de 15 ans
 */

const ABATT_CLASSIQUE = 100000;
const DON_790G = 31865;
const RECHARGE = 15;

/**
 * Génère les fenêtres de donation (âge actuel, +15, +30, ... jusqu'à 95 ans)
 */
export function generateWindows(age, maxAge = 95) {
  const wins = [];
  for (let a = Math.max(18, Math.floor(age)); a <= maxAge; a += 15) {
    wins.push(a);
  }
  return wins;
}

/**
 * Calcule les plafonds disponibles pour une fenêtre donnée
 * @param {number} ageFenetre - Âge à la fenêtre
 * @param {number} nbEnfants - Nombre d'enfants
 * @param {Array} donsRecentsParEnfant - Donations récentes (< 15 ans) pour cet enfant
 * @param {boolean} is790GEligible - Enfant majeur (éligible au 790G)
 * @param {string} parent - 'donateur' ou 'partenaire'
 * @returns {Object} Plafonds classique et 790G
 */
export function calcPlafondsFenetre(
  ageFenetre,
  nbEnfants,
  donsRecentsParEnfant = [],
  is790GEligible = true,
  parent = 'donateur'
) {
  // Consommation < 15 ans du classique par ENFANT et par PARENT
  const consoClassiqueParEnfant = donsRecentsParEnfant
    .filter(d => d.type === 'classique' && d.par === parent)
    .reduce((s, d) => s + d.montant, 0);

  const dispoClassiqueParEnfant = Math.max(ABATT_CLASSIQUE - consoClassiqueParEnfant, 0);
  const plafondClassiqueTotal = dispoClassiqueParEnfant * nbEnfants;

  // 790G uniquement si donateur < 80 ans et enfant majeur
  const conso790GParEnfant = donsRecentsParEnfant
    .filter(d => d.type === '790G' && d.par === parent)
    .reduce((s, d) => s + d.montant, 0);

  const dispo790GParEnfant = Math.max(DON_790G - conso790GParEnfant, 0);
  const plafond790GTotal = (ageFenetre < 80 && is790GEligible) ? dispo790GParEnfant * nbEnfants : 0;

  return { 
    plafondClassiqueTotal, 
    plafond790GTotal,
    plafondClassiqueParEnfant: dispoClassiqueParEnfant,
    plafond790GParEnfant: ageFenetre < 80 && is790GEligible ? dispo790GParEnfant : 0
  };
}

/**
 * Calcule tous les plafonds pour toutes les fenêtres (donateur seul ou couple)
 */
export function calcAllWindows(age, partnerAge, isCouple, nbEnfants, beneficiaires, currentYear = new Date().getFullYear()) {
  const windowsDonateur = generateWindows(age);
  const windowsPartner = isCouple ? generateWindows(partnerAge) : [];

  const resultsDonateur = windowsDonateur.map(ageFen => {
    // Calculer pour chaque enfant puis sommer
    let totalClassique = 0;
    let total790G = 0;

    beneficiaires.filter(b => b.type === 'enfant').forEach(enfant => {
      const donsRecents = (enfant.donations || []).filter(d => 
        (currentYear - d.annee) <= RECHARGE
      );
      
      const plafonds = calcPlafondsFenetre(ageFen, 1, donsRecents, true, 'donateur');
      totalClassique += plafonds.plafondClassiqueParEnfant;
      total790G += plafonds.plafond790GParEnfant;
    });

    return {
      age: ageFen,
      plafondClassique: totalClassique,
      plafond790G: total790G,
      total: totalClassique + total790G,
      parent: 'donateur'
    };
  });

  const resultsPartner = windowsPartner.map(ageFen => {
    let totalClassique = 0;
    let total790G = 0;

    beneficiaires.filter(b => b.type === 'enfant').forEach(enfant => {
      const donsRecents = (enfant.donations || []).filter(d => 
        (currentYear - d.annee) <= RECHARGE
      );
      
      const plafonds = calcPlafondsFenetre(ageFen, 1, donsRecents, true, 'partenaire');
      totalClassique += plafonds.plafondClassiqueParEnfant;
      total790G += plafonds.plafond790GParEnfant;
    });

    return {
      age: ageFen,
      plafondClassique: totalClassique,
      plafond790G: total790G,
      total: totalClassique + total790G,
      parent: 'partenaire'
    };
  });

  return { resultsDonateur, resultsPartner };
}

/**
 * Applique une fenêtre de donation aux bénéficiaires
 */
export function applyWindow(beneficiaires, ageFenetre, parent, currentYear = new Date().getFullYear()) {
  const enfants = beneficiaires.filter(b => b.type === 'enfant');
  
  if (enfants.length === 0) return beneficiaires;

  return beneficiaires.map(benef => {
    if (benef.type !== 'enfant') return benef;

    const donsRecents = (benef.donations || []).filter(d => 
      (currentYear - d.annee) <= RECHARGE
    );

    const plafonds = calcPlafondsFenetre(ageFenetre, 1, donsRecents, true, parent);

    const newDonations = [...(benef.donations || [])];

    // Ajouter donation classique si plafond disponible
    if (plafonds.plafondClassiqueParEnfant > 0) {
      newDonations.push({
        montant: plafonds.plafondClassiqueParEnfant,
        annee: currentYear,
        type: 'classique',
        par: parent
      });
    }

    // Ajouter donation 790G si éligible et plafond disponible
    if (plafonds.plafond790GParEnfant > 0) {
      newDonations.push({
        montant: plafonds.plafond790GParEnfant,
        annee: currentYear,
        type: '790G',
        par: parent
      });
    }

    return {
      ...benef,
      donations: newDonations
    };
  });
}

/**
 * Calcule l'économie potentielle en appliquant une fenêtre
 */
export function calcEconomieFenetre(droitsSans, droitsAvec) {
  return Math.max(0, droitsSans - droitsAvec);
}

/**
 * Génère les exemples pré-calculés pour affichage
 */
export function getExemples(age, partnerAge, isCouple, nbEnfants) {
  const exemples = [];

  if (nbEnfants === 2) {
    if (age === 45 && !isCouple) {
      exemples.push({
        titre: "Exemple : Donateur 45 ans, 2 enfants",
        fenetres: [
          { age: 45, montant: 263730, detail: "(100 000 + 31 865) × 2 enfants" },
          { age: 60, montant: 263730, detail: "(100 000 + 31 865) × 2 enfants" },
          { age: 75, montant: 263730, detail: "(100 000 + 31 865) × 2 enfants" },
          { age: 90, montant: 200000, detail: "100 000 × 2 enfants (sans 790G)" }
        ],
        total: 991190,
        totalJusqua75: 791190
      });
    }

    if (age === 45 && isCouple && partnerAge === 45) {
      exemples.push({
        titre: "Exemple : Couple 45/45 ans, 2 enfants",
        fenetres: [
          { age: 45, montant: 527460, detail: "(100 000 + 31 865) × 2 enfants × 2 parents" },
          { age: 60, montant: 527460, detail: "(100 000 + 31 865) × 2 enfants × 2 parents" },
          { age: 75, montant: 527460, detail: "(100 000 + 31 865) × 2 enfants × 2 parents" },
          { age: 90, montant: 400000, detail: "100 000 × 2 enfants × 2 parents (sans 790G)" }
        ],
        total: 1982380,
        totalJusqua75: 1582380
      });
    }
  }

  return exemples;
}

export const CONSTANTS = {
  ABATT_CLASSIQUE,
  DON_790G,
  RECHARGE
};

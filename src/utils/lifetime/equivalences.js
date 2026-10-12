/**
 * Équivalences pédagogiques pour mettre en perspective les montants
 * Sources : Budget de l'État 2025, données INSEE, services publics
 */

// Budget de l'État 2025 (en milliards d'euros)
export const BUDGET_ETAT_2025 = {
  total: 492, // Milliards €
  depenses: {
    education: 67.5, // Éducation nationale
    defense: 50.0, // Défense
    securite: 22.5, // Sécurité (police, justice)
    recherche: 14.0, // Recherche
    culture: 3.5, // Culture
    ecologie: 12.0, // Transition écologique
    logement: 18.0, // Logement et urbanisme
    travail: 20.0, // Travail et emploi
    sante: 8.5, // Santé (hors sécu)
    solidarite: 28.0, // Solidarité et insertion
    collectivites: 55.0, // Collectivités territoriales
    autres: 193.0 // Autres (dette, pensions, etc.)
  }
};

// Coûts annuels moyens des services publics (par personne)
export const COUTS_SERVICES_PUBLICS = {
  // Éducation
  eleve_primaire: 6900, // €/an
  eleve_college: 8780, // €/an
  eleve_lycee: 11200, // €/an
  etudiant_universite: 11470, // €/an
  
  // Santé
  patient_hopital_jour: 800, // €/jour
  consultation_medecin: 25, // €
  irm: 280, // €
  
  // Sécurité
  policier_annuel: 85000, // Coût annuel d'un policier
  pompier_intervention: 500, // €/intervention
  
  // Justice
  journee_prison: 100, // €/jour
  
  // Infrastructure
  km_autoroute: 10000000, // 10M€/km
  km_ligne_metro: 150000000, // 150M€/km
  
  // Social
  rsa_mensuel: 607, // €/mois (personne seule)
  allocation_chomage_moyenne: 1350 // €/mois
};

// Prestations sociales annuelles moyennes
export const PRESTATIONS_SOCIALES = {
  // Retraite
  pension_retraite_moyenne: 1545, // €/mois
  pension_retraite_annuelle: 18540, // €/an
  
  // Famille
  allocations_familiales_2enfants: 141, // €/mois
  allocations_familiales_3enfants: 322, // €/mois
  paje_base: 184, // €/mois (0-3 ans)
  
  // Chômage
  allocation_chomage_moyenne: 1350, // €/mois
  allocation_chomage_annuelle: 16200, // €/an
  
  // Santé
  remboursement_secu_moyen: 2500, // €/an/personne
  
  // Logement
  apl_moyenne: 250, // €/mois
  
  // Handicap
  aah: 971, // €/mois (Allocation Adulte Handicapé)
  
  // Solidarité
  rsa: 607, // €/mois (personne seule)
  prime_activite: 200 // €/mois (moyenne)
};

// Durées moyennes de perception
export const DUREES_PRESTATIONS = {
  retraite_annees: 25, // Durée moyenne de retraite
  chomage_mois: 12, // Durée moyenne d'indemnisation
  allocations_familiales_annees: 18, // Par enfant jusqu'à 20 ans
  apl_annees: 10 // Durée moyenne de perception
};

/**
 * Calcule les équivalences en prestations sociales
 * @param {number} montantTotal - Montant total des impôts payés
 * @returns {Object} Équivalences en prestations
 */
export function calculatePrestationsEquivalences(montantTotal) {
  return {
    // Retraite
    annees_retraite: Math.floor(montantTotal / PRESTATIONS_SOCIALES.pension_retraite_annuelle),
    mois_retraite: Math.floor(montantTotal / PRESTATIONS_SOCIALES.pension_retraite_moyenne),
    
    // Chômage
    annees_chomage: Math.floor(montantTotal / PRESTATIONS_SOCIALES.allocation_chomage_annuelle),
    mois_chomage: Math.floor(montantTotal / PRESTATIONS_SOCIALES.allocation_chomage_moyenne),
    
    // Famille
    annees_allocations_2enfants: Math.floor(montantTotal / (PRESTATIONS_SOCIALES.allocations_familiales_2enfants * 12)),
    annees_allocations_3enfants: Math.floor(montantTotal / (PRESTATIONS_SOCIALES.allocations_familiales_3enfants * 12)),
    
    // Santé
    annees_remboursement_secu: Math.floor(montantTotal / PRESTATIONS_SOCIALES.remboursement_secu_moyen),
    
    // Logement
    annees_apl: Math.floor(montantTotal / (PRESTATIONS_SOCIALES.apl_moyenne * 12)),
    
    // Solidarité
    annees_rsa: Math.floor(montantTotal / (PRESTATIONS_SOCIALES.rsa * 12)),
    mois_rsa: Math.floor(montantTotal / PRESTATIONS_SOCIALES.rsa)
  };
}

/**
 * Calcule les équivalences en services publics
 * @param {number} montantTotal - Montant total des impôts payés
 * @returns {Object} Équivalences en services
 */
export function calculateServicesEquivalences(montantTotal) {
  return {
    // Éducation
    annees_primaire: Math.floor(montantTotal / COUTS_SERVICES_PUBLICS.eleve_primaire),
    annees_college: Math.floor(montantTotal / COUTS_SERVICES_PUBLICS.eleve_college),
    annees_lycee: Math.floor(montantTotal / COUTS_SERVICES_PUBLICS.eleve_lycee),
    annees_universite: Math.floor(montantTotal / COUTS_SERVICES_PUBLICS.etudiant_universite),
    
    // Santé
    jours_hopital: Math.floor(montantTotal / COUTS_SERVICES_PUBLICS.patient_hopital_jour),
    consultations_medecin: Math.floor(montantTotal / COUTS_SERVICES_PUBLICS.consultation_medecin),
    irm: Math.floor(montantTotal / COUTS_SERVICES_PUBLICS.irm),
    
    // Sécurité
    annees_policier: Math.floor(montantTotal / COUTS_SERVICES_PUBLICS.policier_annuel),
    interventions_pompiers: Math.floor(montantTotal / COUTS_SERVICES_PUBLICS.pompier_intervention),
    
    // Infrastructure
    metres_autoroute: Math.floor((montantTotal / COUTS_SERVICES_PUBLICS.km_autoroute) * 1000),
    metres_metro: Math.floor((montantTotal / COUTS_SERVICES_PUBLICS.km_ligne_metro) * 1000)
  };
}

/**
 * Calcule la part du budget de l'État financée
 * @param {number} montantTotal - Montant total des impôts payés
 * @returns {Object} Part du budget par ministère
 */
export function calculateBudgetEquivalences(montantTotal) {
  const montantMilliards = montantTotal / 1000000000;
  
  return {
    pourcentage_budget_total: (montantMilliards / BUDGET_ETAT_2025.total) * 100,
    
    // Équivalence en jours de financement par ministère
    jours_education: (montantMilliards / BUDGET_ETAT_2025.depenses.education) * 365,
    jours_defense: (montantMilliards / BUDGET_ETAT_2025.depenses.defense) * 365,
    jours_securite: (montantMilliards / BUDGET_ETAT_2025.depenses.securite) * 365,
    jours_culture: (montantMilliards / BUDGET_ETAT_2025.depenses.culture) * 365,
    jours_ecologie: (montantMilliards / BUDGET_ETAT_2025.depenses.ecologie) * 365,
    
    // Part en euros
    part_education: (montantTotal / BUDGET_ETAT_2025.total) * BUDGET_ETAT_2025.depenses.education,
    part_defense: (montantTotal / BUDGET_ETAT_2025.total) * BUDGET_ETAT_2025.depenses.defense,
    part_securite: (montantTotal / BUDGET_ETAT_2025.total) * BUDGET_ETAT_2025.depenses.securite
  };
}

/**
 * Génère des comparaisons pédagogiques
 * @param {number} montantTotal - Montant total des impôts payés
 * @returns {Array} Liste de comparaisons parlantes
 */
export function generateComparisons(montantTotal) {
  const prestations = calculatePrestationsEquivalences(montantTotal);
  const services = calculateServicesEquivalences(montantTotal);
  const budget = calculateBudgetEquivalences(montantTotal);
  
  const comparisons = [];
  
  // Retraite
  if (prestations.annees_retraite > 0) {
    comparisons.push({
      icon: '🏖️',
      title: 'Pension de retraite',
      value: `${prestations.annees_retraite} ans`,
      description: `Équivalent à ${prestations.annees_retraite} années de pension moyenne (1 545 €/mois)`
    });
  }
  
  // Éducation
  if (services.annees_universite > 0) {
    comparisons.push({
      icon: '🎓',
      title: 'Études universitaires',
      value: `${services.annees_universite} ans`,
      description: `Coût de ${services.annees_universite} années d'études à l'université`
    });
  }
  
  // Santé
  if (services.jours_hopital > 365) {
    const annees = Math.floor(services.jours_hopital / 365);
    comparisons.push({
      icon: '🏥',
      title: 'Hospitalisation',
      value: `${annees} ans`,
      description: `${services.jours_hopital.toLocaleString()} jours d'hospitalisation`
    });
  }
  
  // Chômage
  if (prestations.annees_chomage > 0) {
    comparisons.push({
      icon: '💼',
      title: 'Allocation chômage',
      value: `${prestations.annees_chomage} ans`,
      description: `${prestations.annees_chomage} années d'indemnisation chômage (1 350 €/mois)`
    });
  }
  
  // Infrastructure
  if (services.metres_autoroute >= 100) {
    comparisons.push({
      icon: '🛣️',
      title: 'Autoroute',
      value: `${services.metres_autoroute} m`,
      description: `Construction de ${services.metres_autoroute} mètres d'autoroute`
    });
  }
  
  // Budget État
  if (budget.jours_education >= 1) {
    comparisons.push({
      icon: '📚',
      title: 'Budget Éducation Nationale',
      value: `${Math.floor(budget.jours_education)} jours`,
      description: `Finance ${Math.floor(budget.jours_education)} jours du budget de l'Éducation Nationale`
    });
  }
  
  // Famille
  if (prestations.annees_allocations_2enfants >= 10) {
    comparisons.push({
      icon: '👨‍👩‍👧‍👦',
      title: 'Allocations familiales',
      value: `${prestations.annees_allocations_2enfants} ans`,
      description: `${prestations.annees_allocations_2enfants} années d'allocations pour 2 enfants`
    });
  }
  
  return comparisons;
}

export default {
  BUDGET_ETAT_2025,
  COUTS_SERVICES_PUBLICS,
  PRESTATIONS_SOCIALES,
  calculatePrestationsEquivalences,
  calculateServicesEquivalences,
  calculateBudgetEquivalences,
  generateComparisons
};

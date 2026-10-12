/**
 * Moteur de calcul principal pour la fiscalité vie entière
 * Agrège tous les adapters et produit le résultat final
 */

import { estimateTVAConso } from './adapters/tvaConso.js';
import { estimateCotisationsSalariales, estimateCotisationsPatronales } from './adapters/cotisations.js';
import { estimateImpotRevenu, detailImpotParAnnee } from './adapters/impotRevenu.js';
import { calculateFlatTax, calculateIFI, calculateInteretsCredits } from './adapters/placementsEtPatrimoine.js';
import { estimateFiscaliteRevenusFonciers, calculateTotalRevenusFonciers } from './adapters/revenusFonciers.js';
import { TAXES_ENERGIE, CONSO_CARBURANT, LOGEMENT, RETRAITE, MOYENNES_INSEE, COTISATIONS } from './assumptions.js';

/**
 * Calcule les taxes sur le carburant
 * @param {import('../../types/tax').Profil} profil - Profil utilisateur
 * @returns {number} Total taxes carburant
 */
function calculateTaxesCarburant(profil) {
  let totalTaxes = 0;
  const ageDebut = Math.max(profil.age, 18);
  const duree = Math.max(0, profil.esperanceVie - ageDebut);
  
  // Calculer pour la personne principale
  if (profil.mobilite.type !== 'aucun') {
    const kmAn = profil.mobilite.kmAn;
    
    if (profil.mobilite.type === 'electrique') {
      const consoKWh = (kmAn / 100) * CONSO_CARBURANT.electrique;
      const coutAnnuel = consoKWh * TAXES_ENERGIE.carburant.electrique.coutKm * 100;
      const taxesAnnuelles = coutAnnuel * TAXES_ENERGIE.carburant.electrique.partTaxes;
      totalTaxes += taxesAnnuelles * duree;
    } else {
      const typeCarburant = profil.mobilite.type;
      const consoL = (kmAn / 100) * CONSO_CARBURANT[typeCarburant];
      const prixMoyen = TAXES_ENERGIE.carburant[typeCarburant].prixMoyen;
      const partTaxes = TAXES_ENERGIE.carburant[typeCarburant].partTaxes;
      const depenseAnnuelle = consoL * prixMoyen;
      const taxesAnnuelles = depenseAnnuelle * partTaxes;
      totalTaxes += taxesAnnuelles * duree;
    }
  }
  
  // Calculer pour le conjoint (si couple)
  if (profil.mobilite.typeConjoint && profil.mobilite.typeConjoint !== 'aucun') {
    const kmAnConjoint = profil.mobilite.kmAnConjoint || 0;
    
    if (profil.mobilite.typeConjoint === 'electrique') {
      const consoKWh = (kmAnConjoint / 100) * CONSO_CARBURANT.electrique;
      const coutAnnuel = consoKWh * TAXES_ENERGIE.carburant.electrique.coutKm * 100;
      const taxesAnnuelles = coutAnnuel * TAXES_ENERGIE.carburant.electrique.partTaxes;
      totalTaxes += taxesAnnuelles * duree;
    } else {
      const typeCarburant = profil.mobilite.typeConjoint;
      const consoL = (kmAnConjoint / 100) * CONSO_CARBURANT[typeCarburant];
      const prixMoyen = TAXES_ENERGIE.carburant[typeCarburant].prixMoyen;
      const partTaxes = TAXES_ENERGIE.carburant[typeCarburant].partTaxes;
      const depenseAnnuelle = consoL * prixMoyen;
      const taxesAnnuelles = depenseAnnuelle * partTaxes;
      totalTaxes += taxesAnnuelles * duree;
    }
  }
  
  return Math.round(totalTaxes);
}

/**
 * Calcule les taxes sur l'électricité
 * @param {import('../../types/tax').Profil} profil - Profil utilisateur
 * @returns {number} Total taxes électricité
 */
function calculateTaxesElectricite(profil) {
  const depenseAnnuelle = profil.energie.elecAn;
  const partTaxes = TAXES_ENERGIE.electricite.partTaxes;
  const taxesAnnuelles = depenseAnnuelle * partTaxes;
  
  const ageDebut = Math.max(profil.age, 18);
  const duree = Math.max(0, profil.esperanceVie - ageDebut);
  
  return Math.round(taxesAnnuelles * duree);
}

/**
 * Calcule les taxes sur le gaz
 * @param {import('../../types/tax').Profil} profil - Profil utilisateur
 * @returns {number} Total taxes gaz
 */
function calculateTaxesGaz(profil) {
  const depenseAnnuelle = profil.energie.gazAn;
  const partTaxes = TAXES_ENERGIE.gaz.partTaxes;
  const taxesAnnuelles = depenseAnnuelle * partTaxes;
  
  const ageDebut = Math.max(profil.age, 18);
  const duree = Math.max(0, profil.esperanceVie - ageDebut);
  
  return Math.round(taxesAnnuelles * duree);
}

/**
 * Calcule les frais de notaire (droits de mutation)
 * @param {import('../../types/tax').Profil} profil - Profil utilisateur
 * @returns {number} Total frais notaire
 */
function calculateFraisNotaire(profil) {
  let total = 0;
  
  // Résidence principale
  if (profil.logement.rpAchat && profil.logement.rpPrix) {
    total += profil.logement.rpPrix * LOGEMENT.fraisNotaire.ancien;
  }
  
  // Résidence secondaire
  if (profil.logement.rsAchat && profil.logement.rsPrix) {
    total += profil.logement.rsPrix * LOGEMENT.fraisNotaire.ancien;
  }
  
  return Math.round(total);
}

/**
 * Calcule la taxe foncière cumulée
 * @param {import('../../types/tax').Profil} profil - Profil utilisateur
 * @returns {number} Total taxe foncière
 */
function calculateTaxeFonciere(profil) {
  if (!profil.logement.rpAchat && !profil.logement.rsAchat) return 0;
  
  const ageDebut = Math.max(profil.age, 18);
  const duree = Math.max(0, profil.esperanceVie - ageDebut);
  
  // Hypothèse : taxe foncière moyenne avec évolution 2%/an
  const tfAnnuelle = LOGEMENT.taxeFonciere.moyenneAnnuelle;
  const evolution = LOGEMENT.taxeFonciere.evolutionPct;
  
  let total = 0;
  for (let annee = 0; annee < duree; annee++) {
    const tf = tfAnnuelle * Math.pow(1 + evolution, annee);
    total += tf;
  }
  
  return Math.round(total);
}

/**
 * Calcule les prélèvements sociaux sur la retraite
 * @param {import('../../types/tax').Profil} profil - Profil utilisateur
 * @returns {number} Total prélèvements sociaux retraite
 */
function calculatePrelevementsRetraite(profil) {
  if (profil.retraiteAge >= profil.esperanceVie) return 0;
  
  const netMensuel = profil.revenuNetMensuel ?? MOYENNES_INSEE.revenuNetMensuel[profil.statut];
  const netAnnuel = netMensuel * 12;
  
  // Durée carrière pour calculer dernier salaire
  const ageDebut = profil.ageDebutCarriere || 22;
  const dureeCarriere = Math.max(0, profil.retraiteAge - ageDebut);
  const croissance = 1 + (profil.croissanceRevenuPct / 100);
  const dernierSalaire = netAnnuel * Math.pow(croissance, dureeCarriere - 1);
  
  // Pension selon le statut
  const tauxRemplacement = RETRAITE.tauxRemplacementParStatut[profil.statut] || RETRAITE.tauxRemplacement;
  const pensionAnnuelle = dernierSalaire * tauxRemplacement;
  
  // Prélèvements sociaux
  const prelevementsAnnuels = pensionAnnuelle * RETRAITE.prelevementsSociaux.total;
  
  // Durée retraite
  const dureeRetraite = profil.esperanceVie - profil.retraiteAge;
  
  return Math.round(prelevementsAnnuels * dureeRetraite);
}

/**
 * Calcule la fiscalité totale sur une vie
 * @param {import('../../types/tax').Profil} profil - Profil utilisateur
 * @returns {import('../../types/tax').ResultVie} Résultat détaillé
 */
export function estimateLifetimeTaxes(profil) {
  // Calcul de chaque composante
  const tvaConso = estimateTVAConso(profil);
  const cotSalariales = estimateCotisationsSalariales(profil);
  const cotPatronales = estimateCotisationsPatronales(profil);
  const impotRevenu = estimateImpotRevenu(profil);
  const energieCarburant = calculateTaxesCarburant(profil);
  const energieElectricite = calculateTaxesElectricite(profil);
  const energieGaz = calculateTaxesGaz(profil);
  const logementNotaire = calculateFraisNotaire(profil);
  const taxeFonciere = calculateTaxeFonciere(profil);
  const retraitesPrelevSociaux = calculatePrelevementsRetraite(profil);
  const flatTaxPlacements = calculateFlatTax(profil);
  const ifi = calculateIFI(profil);
  const interetsCredits = calculateInteretsCredits(profil);
  const fiscaliteRevenusFonciers = estimateFiscaliteRevenusFonciers(profil);
  
  // Total
  const total = 
    tvaConso +
    cotSalariales +
    cotPatronales +
    impotRevenu +
    energieCarburant +
    energieElectricite +
    energieGaz +
    logementNotaire +
    taxeFonciere +
    retraitesPrelevSociaux +
    flatTaxPlacements +
    ifi +
    interetsCredits +
    fiscaliteRevenusFonciers;
  
  // Calcul de la richesse totale créée (revenus NET avant impôts)
  const netMensuel = profil.revenuNetMensuel ?? MOYENNES_INSEE.revenuNetMensuel[profil.statut];
  const ageDebut = profil.ageDebutCarriere || 22;
  const dureeCarriere = Math.max(0, profil.retraiteAge - ageDebut);
  const croissance = 1 + (profil.croissanceRevenuPct / 100);
  
  // Revenus salariaux NET sur la carrière (ce qui est réellement perçu avant IR)
  let revenusSalariauxNets = 0;
  for (let annee = 0; annee < dureeCarriere; annee++) {
    const facteurEvolution = Math.pow(croissance, annee);
    revenusSalariauxNets += netMensuel * 12 * facteurEvolution;
  }
  
  // Pension retraite nette (selon le statut)
  const dureeRetraite = Math.max(0, profil.esperanceVie - profil.retraiteAge);
  const dernierSalaire = netMensuel * 12 * Math.pow(croissance, dureeCarriere - 1);
  const tauxRemplacement = RETRAITE.tauxRemplacementParStatut[profil.statut] || RETRAITE.tauxRemplacement;
  const pensionAnnuelle = dernierSalaire * tauxRemplacement;
  const revenusRetraiteNets = pensionAnnuelle * dureeRetraite;
  
  // Revenus placements bruts
  const capitalTotal = profil.placements?.capitalTotal || 0;
  const rendementPct = profil.placements?.rendementPct || 0;
  const dureeVie = Math.max(0, profil.esperanceVie - profil.age);
  const revenusPlacementsBruts = (capitalTotal * rendementPct / 100) * dureeVie;
  
  // Revenus fonciers bruts
  const revenusFonciersBruts = calculateTotalRevenusFonciers(profil);
  
  // Richesse totale créée (NET avant impôts)
  const richesseTotaleCreee = Math.round(
    revenusSalariauxNets +
    revenusRetraiteNets +
    revenusPlacementsBruts +
    revenusFonciersBruts
  );
  
  // Timeline (simplifié pour l'instant)
  const timeline = generateTimeline(profil, {
    tvaConso,
    cotSalariales,
    cotPatronales,
    impotRevenu,
    energieCarburant,
    energieElectricite,
    energieGaz,
    taxeFonciere,
    retraitesPrelevSociaux
  });
  
  return {
    tvaConso,
    cotSalariales,
    cotPatronales,
    impotRevenu,
    energieCarburant,
    energieElectricite,
    energieGaz,
    logementNotaire,
    taxeFonciere,
    retraitesPrelevSociaux,
    flatTaxPlacements,
    ifi,
    interetsCredits,
    fiscaliteRevenusFonciers,
    total,
    timeline,
    // Richesse totale créée (NET avant impôts)
    richesseTotaleCreee,
    detailRichesse: {
      revenusSalariauxNets: Math.round(revenusSalariauxNets),
      revenusRetraiteNets: Math.round(revenusRetraiteNets),
      revenusPlacementsBruts: Math.round(revenusPlacementsBruts),
      revenusFonciersBruts: Math.round(revenusFonciersBruts)
    }
  };
}

/**
 * Génère la timeline année par année
 * @param {import('../../types/tax').Profil} profil - Profil utilisateur
 * @param {Object} totaux - Totaux par catégorie
 * @returns {Array} Timeline
 */
function generateTimeline(profil, totaux) {
  const ageDebut = Math.max(profil.age, 18);
  const ageFin = profil.esperanceVie;
  const duree = Math.max(1, ageFin - ageDebut);
  const irDetails = detailImpotParAnnee(profil);
  
  const timeline = [];
  let cumulTotal = 0;
  
  for (let age = ageDebut; age <= ageFin; age++) {
    const annee = age - ageDebut + 1;
    const irAnnee = irDetails.find(item => item.age === age)?.impot ?? Math.round(totaux.impotRevenu / duree);
    
    // Répartition annuelle
    const taxesAnnee = {
      tvaConso: Math.round(totaux.tvaConso / duree),
      cotSalariales: age < profil.retraiteAge ? Math.round(totaux.cotSalariales / Math.max(1, profil.retraiteAge - ageDebut)) : 0,
      cotPatronales: age < profil.retraiteAge ? Math.round(totaux.cotPatronales / Math.max(1, profil.retraiteAge - ageDebut)) : 0,
      impotRevenu: irAnnee,
      energieCarburant: Math.round(totaux.energieCarburant / duree),
      energieElectricite: Math.round(totaux.energieElectricite / duree),
      energieGaz: Math.round(totaux.energieGaz / duree),
      taxeFonciere: Math.round(totaux.taxeFonciere / duree),
      retraitesPrelevSociaux: age >= profil.retraiteAge ? Math.round(totaux.retraitesPrelevSociaux / Math.max(1, ageFin - profil.retraiteAge)) : 0
    };
    
    const totalAnnee = Object.values(taxesAnnee).reduce((sum, val) => sum + val, 0);
    cumulTotal += totalAnnee;
    
    timeline.push({
      annee,
      age,
      total: totalAnnee,
      cumul: cumulTotal,
      details: taxesAnnee
    });
  }
  
  return timeline;
}

/**
 * Calcule le total par personne (si couple)
 * @param {import('../../types/tax').ResultVie} result - Résultat
 * @param {import('../../types/tax').Profil} profil - Profil
 * @returns {{total: number, parPersonne: number}}
 */
export function calculatePerPerson(result, profil) {
  const total = result.total;
  const parPersonne = profil.situation === 'couple' ? Math.round(total / 2) : total;
  
  return { total, parPersonne };
}

export default {
  estimateLifetimeTaxes,
  calculatePerPerson
};

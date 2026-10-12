/**
 * Adapter Impôt sur le revenu
 * Calcule l'IR annuel et sur toute une vie selon le barème progressif 2026
 * 
 * Méthodologie et cadre légal (Loi de Finances 2026 - Revenus 2025) :
 * 1. Abattement forfaitaire de 10% appliqué directement sur les revenus nets déclarés
 *    (salaires et pensions, selon Art. 83-3° et Art. 158-5-a du CGI).
 * 2. Quotient familial (Art. 194 du CGI) : division du revenu imposable par le nombre de parts
 *    (célibataire: 1 part, couple: 2 parts, +0,5 part/enfant pour les deux premiers, +1 part/enfant dès le 3ème).
 * 3. Application du barème progressif par tranches sur le revenu par part :
 *    - 0% jusqu'à 11 600 €
 *    - 11% de 11 601 € à 29 579 €
 *    - 30% de 29 580 € à 84 577 €
 *    - 41% de 84 578 € à 181 917 €
 *    - 45% au-delà de 181 917 €
 * 4. Multiplication de l'impôt par part par le nombre de parts pour obtenir l'impôt dû.
 * 
 * Projection pluriannuelle (années passées et futures) :
 * Ce barème 2026 sert d'étalon de référence constant. En France, les tranches de l'IR sont
 * revalorisées annuellement au niveau de l'inflation par la loi de finances pour éviter tout
 * effet de seuil artificiel. Appliquer ce barème indexé sur les revenus permet une modélisation
 * homogène, transparente et représentative de la charge fiscale tout au long de la vie.
 */

import { BAREME_IR_2026, QUOTIENT_FAMILIAL, MOYENNES_INSEE, RETRAITE } from '../assumptions.js';

/**
 * Calcule le nombre de parts fiscales
 * @param {import('../../../types/tax').Profil} profil - Profil utilisateur
 * @returns {number} Nombre de parts
 */
export function calculerParts(profil) {
  let parts = QUOTIENT_FAMILIAL[profil?.situation] || 1;
  const nbEnfants = Number(profil?.enfants) || 0;
  
  // Ajout des parts pour enfants (Art. 194 CGI)
  if (nbEnfants > 0) {
    parts += QUOTIENT_FAMILIAL.enfant1; // 1er enfant (+0.5 part)
  }
  if (nbEnfants > 1) {
    parts += QUOTIENT_FAMILIAL.enfant2; // 2ème enfant (+0.5 part)
  }
  if (nbEnfants > 2) {
    parts += (nbEnfants - 2) * QUOTIENT_FAMILIAL.enfant3Plus; // 3ème enfant et suivants (+1.0 part)
  }
  
  return parts;
}

/**
 * Calcule l'impôt pour une part selon le barème progressif 2026
 * @param {number} revenuImposableParPart - Revenu imposable divisé par le nombre de parts
 * @returns {number} Impôt dû pour 1 part
 */
export function appliquerBareme(revenuImposableParPart) {
  if (!revenuImposableParPart || revenuImposableParPart <= 0) return 0;
  let impot = 0;
  
  for (let i = 0; i < BAREME_IR_2026.length; i++) {
    const tranche = BAREME_IR_2026[i];
    const min = tranche.min;
    const max = tranche.max;
    const taux = tranche.taux;
    
    if (revenuImposableParPart > min) {
      const baseImposable = Math.min(revenuImposableParPart, max) - min;
      impot += baseImposable * taux;
    }
  }
  
  return impot;
}

/**
 * Calcule l'impôt sur le revenu annuel pour un foyer fiscal
 * @param {number} revenuNet - Revenu net annuel du foyer avant IR (salaires ou pensions)
 * @param {number} parts - Nombre de parts fiscales
 * @returns {number} Impôt annuel dû
 */
export function calculerImpotAnnuel(revenuNet, parts = 1) {
  if (!revenuNet || revenuNet <= 0 || parts <= 0) return 0;
  
  // 1. Déduction de l'abattement forfaitaire de 10% (frais professionnels ou pensions)
  const abattement = revenuNet * 0.10;
  const revenuImposable = Math.max(0, revenuNet - abattement);
  
  // 2. Application du quotient familial (quotient par part)
  const revenuParPart = revenuImposable / parts;
  
  // 3. Application du barème progressif 2026 par tranche sur le revenu par part
  const impotParPart = appliquerBareme(revenuParPart);
  
  // 4. Impôt total dû par le foyer fiscal
  const impotTotal = impotParPart * parts;
  
  return Math.max(0, Math.round(impotTotal));
}

/**
 * Estime l'impôt sur le revenu sur toute la vie
 * @param {import('../../../types/tax').Profil} profil - Profil utilisateur
 * @returns {number} Total IR vie entière
 */
export function estimateImpotRevenu(profil) {
  const parts = calculerParts(profil);
  const ageDebut = profil.ageDebutCarriere || 22;
  const ageRetraite = profil.retraiteAge || 64;
  const esperanceVie = profil.esperanceVie || 82;
  const dureeCarriere = Math.max(0, ageRetraite - ageDebut);
  const dureeRetraite = Math.max(0, esperanceVie - ageRetraite);
  const isRetraite = profil.statut === 'retraite';
  const croissance = 1 + ((profil.croissanceRevenuPct || 0) / 100);
  
  let totalImpot = 0;

  if (isRetraite) {
    // Profil déjà retraité :
    // Carrière passée avec salaire moyen de carrière
    const netMensuelCarriere = profil.salaireMoyenCarriere || MOYENNES_INSEE.revenuNetMensuel.salarie;
    const netAnnuelCarriere = netMensuelCarriere * 12;
    for (let annee = 0; annee < dureeCarriere; annee++) {
      const impotAnnee = calculerImpotAnnuel(netAnnuelCarriere, parts);
      totalImpot += impotAnnee;
    }
    
    // Retraite actuelle et future avec pension renseignée
    const pensionMensuelle = profil.revenuNetMensuel ?? MOYENNES_INSEE.revenuNetMensuel.retraite;
    const pensionAnnuelle = pensionMensuelle * 12;
    for (let annee = 0; annee < dureeRetraite; annee++) {
      const impotAnnee = calculerImpotAnnuel(pensionAnnuelle, parts);
      totalImpot += impotAnnee;
    }
  } else {
    // Profil actif :
    const netMensuel = profil.revenuNetMensuel ?? MOYENNES_INSEE.revenuNetMensuel[profil.statut];
    const netAnnuel = netMensuel * 12;

    // Phase active (avant retraite)
    for (let annee = 0; annee < dureeCarriere; annee++) {
      const facteurEvolution = Math.pow(croissance, annee);
      const revenuAnnee = netAnnuel * facteurEvolution;
      const impotAnnee = calculerImpotAnnuel(revenuAnnee, parts);
      totalImpot += impotAnnee;
    }

    // Phase retraite (si applicable)
    if (dureeRetraite > 0) {
      const dernierSalaire = netAnnuel * Math.pow(croissance, Math.max(0, dureeCarriere - 1));
      const tauxRemplacement = RETRAITE.tauxRemplacementParStatut[profil.statut] || RETRAITE.tauxRemplacement;
      const pensionAnnuelle = dernierSalaire * tauxRemplacement;
      
      for (let annee = 0; annee < dureeRetraite; annee++) {
        const impotAnnee = calculerImpotAnnuel(pensionAnnuelle, parts);
        totalImpot += impotAnnee;
      }
    }
  }
  
  return Math.round(totalImpot);
}

/**
 * Détail de l'IR par année sur toute la vie
 * @param {import('../../../types/tax').Profil} profil - Profil utilisateur
 * @returns {Array<{annee: number, age: number, revenu: number, impot: number, phase: string}>}
 */
export function detailImpotParAnnee(profil) {
  const parts = calculerParts(profil);
  const ageDebut = profil.ageDebutCarriere || 22;
  const ageRetraite = profil.retraiteAge || 64;
  const ageFin = profil.esperanceVie || 82;
  const croissance = 1 + ((profil.croissanceRevenuPct || 0) / 100);
  const isRetraite = profil.statut === 'retraite';
  
  const timeline = [];
  const dureeCarriere = Math.max(0, ageRetraite - ageDebut);

  if (isRetraite) {
    const netMensuelCarriere = profil.salaireMoyenCarriere || MOYENNES_INSEE.revenuNetMensuel.salarie;
    const netAnnuelCarriere = netMensuelCarriere * 12;
    const pensionMensuelle = profil.revenuNetMensuel ?? MOYENNES_INSEE.revenuNetMensuel.retraite;
    const pensionAnnuelle = pensionMensuelle * 12;

    for (let age = ageDebut; age <= ageFin; age++) {
      const phase = age < ageRetraite ? 'actif' : 'retraite';
      const revenu = phase === 'actif' ? netAnnuelCarriere : pensionAnnuelle;
      const impot = calculerImpotAnnuel(revenu, parts);

      timeline.push({
        annee: age - ageDebut + 1,
        age,
        revenu: Math.round(revenu),
        impot: Math.round(impot),
        phase
      });
    }
  } else {
    const netMensuel = profil.revenuNetMensuel ?? MOYENNES_INSEE.revenuNetMensuel[profil.statut];
    const netAnnuel = netMensuel * 12;
    let anneeCarriere = 0;

    for (let age = ageDebut; age <= ageFin; age++) {
      let revenu, impot, phase;
      
      if (age < ageRetraite) {
        // Phase active
        const facteurEvolution = Math.pow(croissance, anneeCarriere);
        revenu = netAnnuel * facteurEvolution;
        impot = calculerImpotAnnuel(revenu, parts);
        phase = 'actif';
        anneeCarriere++;
      } else {
        // Phase retraite
        const dernierSalaire = netAnnuel * Math.pow(croissance, Math.max(0, dureeCarriere - 1));
        const tauxRemplacement = RETRAITE.tauxRemplacementParStatut[profil.statut] || RETRAITE.tauxRemplacement;
        revenu = dernierSalaire * tauxRemplacement;
        impot = calculerImpotAnnuel(revenu, parts);
        phase = 'retraite';
      }
      
      timeline.push({
        annee: age - ageDebut + 1,
        age,
        revenu: Math.round(revenu),
        impot: Math.round(impot),
        phase
      });
    }
  }
  
  return timeline;
}

/**
 * Simulation avec différents scénarios
 * @param {import('../../../types/tax').Profil} profil - Profil utilisateur
 * @returns {Object} Comparaison scénarios
 */
export function simulerScenarios(profil) {
  const base = estimateImpotRevenu(profil);
  
  // Scénario avec croissance +1%
  const profilPlus = { ...profil, croissanceRevenuPct: (profil.croissanceRevenuPct || 0) + 1 };
  const plus = estimateImpotRevenu(profilPlus);
  
  // Scénario avec croissance -1%
  const profilMoins = { ...profil, croissanceRevenuPct: Math.max(0, (profil.croissanceRevenuPct || 0) - 1) };
  const moins = estimateImpotRevenu(profilMoins);
  
  return {
    base: Math.round(base),
    optimiste: Math.round(plus),
    pessimiste: Math.round(moins),
    ecartOptimiste: Math.round(plus - base),
    ecartPessimiste: Math.round(base - moins)
  };
}

export default {
  calculerParts,
  appliquerBareme,
  calculerImpotAnnuel,
  estimateImpotRevenu,
  detailImpotParAnnee,
  simulerScenarios
};

/**
 * Types pour le système de calcul fiscal
 * @typedef {Object} Profil
 * @property {number} age - Âge actuel (18-100)
 * @property {number} ageDebutCarriere - Âge de début de carrière (16-age, défaut: 22)
 * @property {'celibataire'|'couple'} situation - Situation familiale
 * @property {number} enfants - Nombre d'enfants
 * @property {'salarie'|'cadre'|'prof_lib'|'entrepreneur'|'retraite'} statut - Statut professionnel
 * @property {number} [revenuNetMensuel] - Revenu net mensuel (optionnel, utilise moyenne si absent)
 * @property {number} croissanceRevenuPct - Taux d'évolution du revenu (%/an)
 * @property {number} retraiteAge - Âge de départ à la retraite
 * @property {number} esperanceVie - Espérance de vie
 * @property {Object} logement - Informations logement
 * @property {boolean} logement.rpAchat - Achat résidence principale
 * @property {number} [logement.rpPrix] - Prix résidence principale
 * @property {boolean} logement.rsAchat - Achat résidence secondaire
 * @property {number} [logement.rsPrix] - Prix résidence secondaire
 * @property {Object} mobilite - Informations mobilité
 * @property {'essence'|'diesel'|'electrique'|'aucun'} mobilite.type - Type de véhicule
 * @property {number} mobilite.kmAn - Kilomètres par an
 * @property {Object} energie - Dépenses énergie
 * @property {number} energie.elecAn - Dépenses électricité annuelles
 * @property {number} energie.gazAn - Dépenses gaz annuelles
 * @property {number} consoMensuelle - Consommation courante mensuelle
 * @property {Object} [placements] - Placements financiers (optionnel)
 * @property {number} [placements.capitalTotal] - Capital total placé
 * @property {number} [placements.rendementPct] - Rendement annuel moyen (%)
 * @property {Object} [patrimoine] - Patrimoine pour succession (optionnel)
 * @property {number} [patrimoine.cash] - Cash et épargne liquide
 * @property {Object} [credits] - Crédits immobiliers (optionnel)
 * @property {number} [credits.capitalRestant] - Capital restant dû
 * @property {number} [credits.tauxPct] - Taux d'intérêt (%)
 * @property {number} [credits.dureeRestanteAns] - Durée restante (années)
 */

/**
 * @typedef {Object} ResultVie
 * @property {number} tvaConso - TVA sur consommation
 * @property {number} cotSalariales - Cotisations salariales
 * @property {number} cotPatronales - Cotisations patronales
 * @property {number} impotRevenu - Impôt sur le revenu
 * @property {number} energieCarburant - Taxes sur carburant
 * @property {number} energieElectricite - Taxes sur électricité
 * @property {number} energieGaz - Taxes sur gaz
 * @property {number} logementNotaire - Frais notaire acquisition
 * @property {number} taxeFonciere - Taxe foncière cumulée
 * @property {number} retraitesPrelevSociaux - Prélèvements sociaux retraite
 * @property {number} flatTaxPlacements - Flat tax sur revenus du capital
 * @property {number} ifi - Impôt sur la Fortune Immobilière
 * @property {number} interetsCredits - Intérêts payés sur crédits immobiliers
 * @property {number} total - Total fiscal vie entière
 * @property {Array<{annee: number, total: number, details: Partial<ResultVie>}>} timeline - Évolution annuelle
 */

/**
 * @typedef {Object} SuccessionInput
 * @property {number} patrimoine - Patrimoine à transmettre
 * @property {boolean} conjoint - Présence d'un conjoint/PACS
 * @property {number} enfants - Nombre d'enfants
 * @property {Array<'frere_soeur'|'neveu_niece'|'autre'>} [autres] - Autres héritiers
 */

/**
 * @typedef {Object} SuccessionOutput
 * @property {Array<{lien: string, base: number, impot: number}>} parHeritier - Détail par héritier
 * @property {number} total - Total des droits
 */

// Valeurs par défaut
export const DEFAULT_PROFIL = {
  age: 30,
  ageDebutCarriere: 22,
  situation: 'celibataire',
  enfants: 0,
  statut: 'salarie',
  revenuNetMensuel: null, // Utilisera moyenne nationale
  croissanceRevenuPct: 1,
  retraiteAge: 64,
  esperanceVie: 82,
  logement: {
    rpAchat: true,
    rpPrix: 300000,
    rsAchat: false,
    rsPrix: null
  },
  mobilite: {
    type: 'essence',
    kmAn: 12000
  },
  energie: {
    elecAn: 1200,
    gazAn: 900
  },
  consoMensuelle: 800,
  placements: {
    capitalTotal: 0,
    rendementPct: 3 // 3% par défaut
  },
  patrimoine: {
    cash: 0
  },
  credits: {
    capitalRestant: 0,
    tauxPct: 2.5, // 2.5% par défaut
    dureeRestanteAns: 0
  }
};

// Moyennes nationales (sources INSEE, URSSAF 2026)
export const MOYENNES_NATIONALES = {
  revenuNetMensuel: {
    salarie: 2200,
    cadre: 4000,
    prof_lib: 3500,
    entrepreneur: 3000,
    retraite: 1500
  },
  tauxCotisationsSalariales: 0.222, // ~22,2% (régime général 2026)
  tauxCotisationsPatronales: 0.455, // ~45,5% (régime général 2026, hors RGDU)
  tauxCSG: 0.092, // 9.2%
  tauxCRDS: 0.005, // 0.5%
  tauxTVAEffectif: 0.165, // ~16.5% effectif sur panier mixte
  fraisNotairePct: 0.08, // ~8% du prix
  taxeFonciereAnnuelle: 1200 // Moyenne
};

export default {
  DEFAULT_PROFIL,
  MOYENNES_NATIONALES
};

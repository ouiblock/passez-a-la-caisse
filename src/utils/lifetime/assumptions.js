/**
 * Hypothèses et valeurs par défaut pour le simulateur vie entière
 * Sources : INSEE, impots.gouv.fr, URSSAF
 * Dernière mise à jour : Loi de finances 2026 (revenus 2025, revalorisation +0,9%)
 */

// Barèmes impôt sur le revenu 2026 (par part) — Source : Ministère de l'Économie / LFi 2026 (revenus 2025)
// Tranches d'imposition applicables :
// - Jusqu'à 11 600 € : 0%
// - De 11 601 € à 29 579 € : 11%
// - De 29 580 € à 84 577 € : 30%
// - De 84 578 € à 181 917 € : 41%
// - Supérieur à 181 917 € : 45%
// 
// Convention de calcul pluriannuelle (passé / avenir) :
// Ce barème 2026 sert d'étalon monétaire constant pour toutes les années de la vie.
// En France, les tranches de l'IR sont réindexées annuellement sur l'inflation par la loi de finances,
// neutralisant ainsi les effets de seuil monétaires. L'application du barème 2026 indexé sur l'évolution
// des salaires fournit l'estimation la plus robuste et comparable sur toute la vie.
export const BAREME_IR_2026 = [
  { min: 0, max: 11600, taux: 0 },
  { min: 11600, max: 29579, taux: 0.11 },
  { min: 29579, max: 84577, taux: 0.30 },
  { min: 84577, max: 181917, taux: 0.41 },
  { min: 181917, max: Infinity, taux: 0.45 }
];

// Quotient familial (Art. 194 du CGI) :
// - Célibataire : 1 part
// - Couple (marié ou pacsé) : 2 parts
// - Enfants : +0,5 part pour les 2 premiers, +1,0 part à partir du 3ème
export const QUOTIENT_FAMILIAL = {
  celibataire: 1,
  couple: 2,
  enfant1: 0.5,
  enfant2: 0.5,
  enfant3Plus: 1 // À partir du 3ème enfant
};

// Flat tax sur les revenus du capital (PFU - Prélèvement Forfaitaire Unique)
// LFSS 2026 : hausse CSG de 9,2% → 10,6% sur certains revenus du capital
export const FLAT_TAX = {
  // Taux applicable aux revenus mobiliers (CTO, dividendes, obligations, etc.)
  taux: 0.314, // 31,4% (12,8% IR + 18,6% PS) — LFSS 2026
  irSeul: 0.128, // Part impôt sur le revenu (inchangé)
  prelevementsSociaux: 0.186, // Part PS : CSG 10,6% + CRDS 0,5% + solidarité 7,5%
  // Taux PS pour revenus épargnés (AV, foncier, PEA, PEL/CEL)
  prelevementsSociauxReduits: 0.172, // 17,2% — CSG 9,2% + CRDS 0,5% + solidarité 7,5%
  // Option pour barème progressif (si plus avantageux)
  optionBareme: true
};

// IFI - Impôt sur la Fortune Immobilière (2025)
export const BAREME_IFI = {
  seuil: 1310000, // Seuil d'imposition
  abattement: 800000, // Abattement résidence principale (30%)
  tranches: [
    { min: 0, max: 800000, taux: 0 },
    { min: 800000, max: 1300000, taux: 0.005 }, // 0.5%
    { min: 1300000, max: 2570000, taux: 0.007 }, // 0.7%
    { min: 2570000, max: 5000000, taux: 0.01 }, // 1%
    { min: 5000000, max: 10000000, taux: 0.0125 }, // 1.25%
    { min: 10000000, max: Infinity, taux: 0.015 } // 1.5%
  ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// COTISATIONS SOCIALES — RÉGIME GÉNÉRAL — TAUX 2026
// Sources : urssaf.fr/accueil/outils-documentation/taux-baremes.html
//           bpifrance-creation.fr, mon-entreprise.urssaf.fr
// Mise à jour : 01/01/2026
//
// MÉTHODOLOGIE :
// On modélise un salarié "type" du régime général (hors TNS, professions libérales
// et régimes spéciaux). Pour la simulation, on applique des taux MOYENS sur l'assiette
// brute, ce qui est une simplification pédagogique valide pour une estimation lifetime.
//
// Plafond Annuel de la Sécurité Sociale (PASS) 2026 : 48 060 € (4 005 €/mois)
//
// NOTE — RGDU (Réduction Générale Dégressive Unique, depuis 01/01/2026) :
// Ce dispositif remplace l'ancienne "réduction Fillon" et réduit les cotisations
// patronales pour les salaires < 3 SMIC (env. 5 760 €/mois brut). Dans ce simulateur,
// nous ne modélisons pas la RGDU pour conserver la lisibilité pédagogique sur la vie
// entière. Les montants sont donc légèrement majorés pour les bas salaires.
// ═══════════════════════════════════════════════════════════════════════════════
export const COTISATIONS = {
  // ── PART SALARIALE ──────────────────────────────────────────────────────────
  // Taux prélevés sur le salaire BRUT du salarié
  // Total moyen régime général ~22.5% du brut (dont ~7.5% déductibles du RFR via CSG)
  salariales: {
    maladie:          0.0075, // 0,75% — Assurance maladie/maternité/invalidité/décès (totalité)
    vieillesse:       0.069,  // 6,90% — Assurance vieillesse plafonnée (dans la limite du PASS)
    vieillesse_dep:   0.004,  // 0,40% — Assurance vieillesse déplafonnée (totalité)
    // Chômage : 4,0% (applicable sur 4×PASS soit ~192 240€/an)
    // Pour salarié moyen (< 4×PASS), on applique le taux plein
    chomage:          0.04,   // 4,00% — Assurance chômage (Unédic, jusqu'à 4×PASS)
    // AGIRC-ARRCO : cotisation retraite complémentaire obligatoire
    // Tranche 1 (< 1 PASS) : taux contractuel 6,20% dont part salariale 3,15%
    // Tranche 2 (1-8 PASS) : taux contractuel 17% dont part salariale 8,64% — non modélisé ici
    retraiteCompl:    0.0315, // 3,15% — AGIRC-ARRCO Tranche 1 (part salarié)
    // CEG (Contribution d'Équilibre Généralisée) AGIRC-ARRCO Tranche 1 : 0,86%
    ceg:              0.0086, // 0,86% — CEG salarié Tranche 1
    // CSG : 9,20% sur 98,25% du salaire brut (abattement forfaitaire 1,75%)
    // dont 6,80% déductibles du RFR | 2,40% non déductibles
    csg:              0.092,  // 9,20% — CSG (base 98,25% du brut)
    crds:             0.005,  // 0,50% — CRDS (base 98,25% du brut)
    // TOTAL effectif sur brut : ~22,2%
    // Note: CSG/CRDS s'appliquent sur 98,25% → taux réel légèrement inférieur
    total:            0.222   // 22,2% — Part salariale effective sur salaire brut
  },

  // ── PART PATRONALE ──────────────────────────────────────────────────────────
  // Taux calculés sur le salaire BRUT versé au salarié
  // Total moyen régime général ~44-46% du brut AVANT réduction RGDU
  patronales: {
    maladie:          0.133,  // 13,30% — Assurance maladie/maternité/invalidité/décès (totalité)
    // Taux réduit 7% si salaire < 2,5 SMIC, mais non modélisé ici
    vieillesse:       0.0855, // 8,55% — Assurance vieillesse plafonnée (dans la limite du PASS)
    vieillesse_dep:   0.0211, // 2,11% — Assurance vieillesse déplafonnée (totalité) — +0,09% en 2026
    allocFamiliales:  0.0525, // 5,25% — Allocations familiales (totalité)
    // Taux réduit 3,45% si salaire < 3,5 SMIC, mais non modélisé ici
    chomage:          0.04,   // 4,00% — Assurance chômage (Unédic, jusqu'à 4×PASS)
    // AGIRC-ARRCO Tranche 1 : taux contractuel 6,20% dont patronale 5,12% (après abattement CEG inclus)
    // Régime unifié depuis 2019, tranche unique jusqu'au PASS
    retraiteCompl:    0.0512, // 5,12% — AGIRC-ARRCO Tranche 1 (part patronale)
    ceg:              0.0129, // 1,29% — CEG patronal Tranche 1
    csa:              0.003,  // 0,30% — Contribution Solidarité Autonomie (totalité)
    // AT/MP : taux fixé par la CARSAT selon le secteur d'activité
    // Moyenne nationale : 0,84% (secteur tertiaire : 0,60%, bâtiment : 2-4%)
    accident:         0.0084, // 0,84% — Accidents du travail (moyenne nationale régime général)
    // Autres contributions patronales (FNAL, formation, taxe d'apprentissage, transport…)
    // FNAL : 0,10% (employeurs > 20 salariés : 0,50%) — retenu 0,10%
    // Formation professionnelle : 1,00% (entreprises > 11 salariés) | 0,55% (< 11 salariés) — retenu 0,60%
    // Contribution patronale CEG Tranche 1 incluse ci-dessus (1,29%)
    fnal:             0.001,  // 0,10% — FNAL (Fonds National d'Aide au Logement)
    formation:        0.006,  // 0,60% — Formation professionnelle (moyenne)
    // TOTAL effectif : ~46% du brut (sans RGDU)
    // Avec RGDU pour salaires < 3 SMIC, réduction pouvant aller jusqu'à ~10 points à 1 SMIC
    // Pour la simulation vie-entière, on retient un taux moyen "sans RGDU" pour un salarié
    // à revenu moyen/élevé (pas concerné ou peu par la réduction)
    total:            0.455   // 45,5% — Part patronale effective moyenne sur salaire brut
  },

  // ── RATIO CONVERSION NET / BRUT ─────────────────────────────────────────────
  // Formule : brut = net / (1 - taux_salarial)
  // Exemple : 2 200€ net → 2 200 / (1 - 0,222) = 2 827€ brut
  // Coût total employeur : brut × (1 + taux_patronal) = 2 827 × 1,455 = 4 113€
  //
  // Vérification sur simulateur URSSAF (mon-entreprise.urssaf.fr) :
  // 2 200€ net → ~2 840€ brut → ~4 100€ coût employeur (résultat cohérent ±2%)
  conversionNote: 'Régime général 2026 — Salarié non-cadre — Hors réduction RGDU'
};

// TVA (taux effectifs par catégorie)
export const TVA = {
  taux: {
    normal: 0.20, // 20%
    intermediaire: 0.10, // 10%
    reduit: 0.055, // 5.5%
    particulier: 0.021 // 2.1%
  },
  repartition: {
    normal: 0.60, // 60% à 20%
    intermediaire: 0.25, // 25% à 10%
    reduit: 0.15 // 15% à 5.5%
  },
  // Taux effectif moyen
  effectif: 0.165 // ~16.5%
};

// Revenus fonciers - Fiscalité moyenne
// LFSS 2026 : les revenus fonciers RESTENT à 17,2% de PS (exclus de la hausse CSG)
export const REVENUS_FONCIERS = {
  // Taux de fiscalité moyen tous régimes confondus
  // Inclut : charges déductibles (~30%), IR sur le net (~20%), prélèvements sociaux (17,2%)
  tauxFiscaliteMoyen: 0.40, // 40% du revenu brut
  tauxPS: 0.172, // 17,2% PS (exclu de la hausse CSG — LFSS 2026)
  description: 'Moyenne location nue, meublée, LMNP (charges 30% + IR 20% + PS 17,2% maintenu)'
};

// Fiscalité des placements financiers — LFSS 2026
// La hausse de PS (17,2% → 18,6%) s'applique UNIQUEMENT aux revenus mobiliers
// Les revenus fonciers, AV, PEA, PEL/CEL restent à 17,2% de PS
export const FISCALITE_PLACEMENTS = {
  pea: {
    // PEA : Exonération d'IR après 5 ans, PS uniquement (taux maintenu)
    tauxIR: 0, // 0% d'IR après 5 ans
    tauxPS: 0.172, // 17,2% de PS (exclu de la hausse CSG — LFSS 2026)
    total: 0.172, // 17,2% total
    description: 'Exonération IR après 5 ans + PS 17,2% (taux maintenu)'
  },
  assuranceVie: {
    // Assurance-vie > 8 ans : abattement puis 7,5% + PS (taux maintenu)
    tauxIR: 0.075, // 7,5% après abattement (simplifié)
    tauxPS: 0.172, // 17,2% PS (exclu de la hausse CSG — LFSS 2026)
    total: 0.247, // 24,7% total (simplifié après abattement)
    description: 'Après 8 ans : 7,5% IR + 17,2% PS (taux PS maintenu)'
  },
  cto: {
    // Compte-titres : PFU 31,4% — LFSS 2026 (hausse PS)
    tauxIR: 0.128, // 12,8% IR (inchangé)
    tauxPS: 0.186, // 18,6% PS (CSG 10,6% + CRDS 0,5% + solidarité 7,5%)
    total: 0.314, // 31,4% total (flat tax LFSS 2026)
    description: 'PFU 31,4% (12,8% IR + 18,6% PS) — LFSS 2026'
  },
  livrets: {
    // Livrets réglementés : totalement exonérés
    tauxIR: 0,
    tauxPS: 0,
    total: 0, // 0% (exonération totale)
    description: 'Exonération totale (Livret A, LEP, LDDS)'
  },
  autresPlacements: {
    // Autres placements mobiliers : PFU 31,4% par défaut — LFSS 2026
    tauxIR: 0.128,
    tauxPS: 0.186, // 18,6% PS (hausse CSG)
    total: 0.314, // 31,4% total
    description: 'PFU 31,4% par défaut (12,8% IR + 18,6% PS) — LFSS 2026'
  }
};

// Taxes énergie
export const TAXES_ENERGIE = {
  electricite: {
    ticfe: 0.0225, // €/kWh (Taxe Intérieure sur Consommation Finale d'Électricité)
    tva: 0.20, // 20% sur abonnement + conso
    partTaxes: 0.35 // ~35% de la facture
  },
  gaz: {
    ticgn: 0.0084, // €/kWh (Taxe Intérieure sur Consommation de Gaz Naturel)
    tva: 0.20, // 20%
    partTaxes: 0.30 // ~30% de la facture
  },
  carburant: {
    essence: {
      ticpe: 0.6829, // €/L (Taxe Intérieure de Consommation sur les Produits Énergétiques)
      tva: 0.20,
      prixMoyen: 1.60, // €/L (prix moyen 2025)
      prixHT: 1.06, // €/L hors taxes (prix TTC / 1.20 - TICPE)
      partTaxes: 0.54 // ~54% du prix (TICPE + TVA)
    },
    diesel: {
      ticpe: 0.5928, // €/L
      tva: 0.20,
      prixMoyen: 1.60, // €/L (prix moyen 2025)
      prixHT: 1.14, // €/L hors taxes
      partTaxes: 0.50 // ~50% du prix (TICPE + TVA)
    },
    electrique: {
      ticpe: 0, // Pas de TICPE
      tva: 0.20,
      coutKm: 0.03, // €/km (coût électricité)
      partTaxes: 0.20 // ~20% (TVA uniquement)
    }
  }
};

// Consommation carburant moyenne
export const CONSO_CARBURANT = {
  essence: 7.0, // L/100km (véhicule thermique moyen)
  diesel: 7.0, // L/100km (unifié pour simplifier)
  electrique: 15 // kWh/100km
};

// Logement
export const LOGEMENT = {
  fraisNotaire: {
    ancien: 0.08, // ~8% du prix
    neuf: 0.03 // ~3% du prix
  },
  taxeFonciere: {
    moyenneAnnuelle: 1200, // € par an (moyenne nationale)
    evolutionPct: 0.02 // +2%/an
  },
  droitsMutation: {
    taux: 0.0575 // 5.75% (part État + départements)
  }
};

// Retraite (Sources : Assurance retraite, AGIRC-ARRCO, CNAV)
export const RETRAITE = {
  // Taux de remplacement par statut (% du dernier salaire NET)
  tauxRemplacementParStatut: {
    salarie: 0.55, // 55% (régime général ~50% + complémentaire ~5%)
    cadre: 0.60, // 60% (régime général + AGIRC-ARRCO plus élevé)
    prof_lib: 0.40, // 40% (CNAVPL + complémentaires faibles)
    entrepreneur: 0.42, // 42% (SSI, souvent cotisations minimales)
    retraite: 0 // Déjà en retraite
  },
  tauxRemplacement: 0.55, // 55% par défaut (salarié moyen)
  prelevementsSociaux: {
    // Taux CSG normal sur pensions de retraite (RFR ≥ 26 472€ pour 1 part)
    csg: 0.083, // 8,3% (taux normal 2026)
    crds: 0.005, // 0,5%
    casa: 0.003, // 0,3%
    total: 0.091 // 9,1% (8,3% + 0,5% + 0,3%)
  }
};

// Évolution des revenus
export const EVOLUTION_REVENUS = {
  inflation: 0.02, // 2%/an (hypothèse)
  croissanceMoyenne: 0.01, // +1%/an réel
  bonusCarriere: {
    // Bonus selon ancienneté
    5: 1.05, // +5% après 5 ans
    10: 1.15, // +15% après 10 ans
    20: 1.30, // +30% après 20 ans
    30: 1.40 // +40% après 30 ans
  }
};

// Abattements et réductions
export const ABATTEMENTS = {
  impotRevenu: {
    fraisPro: 0.10, // 10% (abattement forfaitaire)
    min: 472, // Minimum
    max: 13522 // Maximum
  }
};

// Moyennes nationales (INSEE 2024)
export const MOYENNES_INSEE = {
  revenuNetMensuel: {
    salarie: 2200,
    cadre: 4000,
    prof_lib: 3500,
    entrepreneur: 3000,
    retraite: 1500
  },
  consoMensuelle: {
    celibataire: 1200,
    couple: 1800,
    parEnfant: 400
  },
  tauxEpargne: 0.15 // 15%
};

export default {
  BAREME_IR_2026,
  QUOTIENT_FAMILIAL,
  COTISATIONS,
  TVA,
  TAXES_ENERGIE,
  CONSO_CARBURANT,
  LOGEMENT,
  RETRAITE,
  EVOLUTION_REVENUS,
  ABATTEMENTS,
  MOYENNES_INSEE
};

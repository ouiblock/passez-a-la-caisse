// Paramètres fiscaux - Séparation donation/succession selon JSON
export const FISC = {
  abattements: {
    donation: {
      enfant: 100000,
      petit_enfant_790B: 31865,
      freres_soeurs: 15932,
      neveu_niece: 7967,
      tiers: 1594,
      don_familial_790G: 31865
    },
    succession: {
      enfant: 100000,
      freres_soeurs: 15932,
      neveu_niece: 7967,
      tiers: 1594,
      conjoint: Infinity, // Exonéré
      handicap: 159325 // Abattement supplémentaire (CGI art. 779, V) - cumulable
    }
  },
  baremes: {
    ligne_directe: [
      [8072, 0.05],
      [12109, 0.10],
      [15932, 0.15],
      [552324, 0.20],
      [902838, 0.30],
      [1805677, 0.40],
      [Infinity, 0.45]
    ],
    freres_soeurs: [
      [24430, 0.35],
      [Infinity, 0.45]
    ],
    collateraux: [[Infinity, 0.55]],
    tiers: [[Infinity, 0.60]]
  },
  assurance_vie: {
    avant70_990I: { 
      abattement_par_beneficiaire: 152500, 
      palier_20_pourcent: 700000, 
      taux_au_dela: 0.3125 
    },
    apres70_757B: { 
      abattement_global: 30500 
    }
  },
  usufruit_art669: {
    viager: {
      "moins_de_21": 0.90, 
      "21_30": 0.80, 
      "31_40": 0.70, 
      "41_50": 0.60,
      "51_60": 0.50, 
      "61_70": 0.40, 
      "71_80": 0.30, 
      "81_90": 0.20, 
      "plus_de_91": 0.10
    },
    temporaire: {
      taux_par_tranche_10_ans: 0.23
    }
  },
  regles: {
    recharge_abattements_ans: 15,
    don_familial_790G_conditions: "donateur < 80 ans et donataire majeur/émancipé; cumulable avec abattements classiques; déclaration 2735",
    representation_succession: "les petits-enfants reprennent et partagent l'abattement de 100k si représentation d'un parent prédécédé/renonçant; sinon 1 594 €",
    assurance_vie_pas_de_representation: true,
    reunion_usufruit_np_sans_droits: true
  }
};

export const SOC = {
  rsa_personne_seule_par_mois: 646.52,
  rsa_personne_seule_par_an: 7758.24,
  allocations_familiales_2_enfants_par_mois: 151.05,
  allocations_familiales_2_enfants_par_an: 1812.60,
  smic_net_mensuel: 1398.69, // SMIC net mensuel 2024
  smic_net_annuel: 16784.28 // SMIC net annuel 2024 (12 mois)
};

export const ROLES = [
  { id: 'pere', label: 'Père' },
  { id: 'mere', label: 'Mère' },
  { id: 'grand_pere', label: 'Grand-père' },
  { id: 'grand_mere', label: 'Grand-mère' },
  { id: 'oncle', label: 'Oncle' },
  { id: 'tante', label: 'Tante' },
  { id: 'frere', label: 'Frère' },
  { id: 'soeur', label: 'Sœur' },
  { id: 'tiers', label: 'Tiers' }
];

export const BENEFICIAIRES_PAR_ROLE = {
  pere: ['enfant', 'petit_enfant', 'conjoint', 'frere_soeur', 'tiers'],
  mere: ['enfant', 'petit_enfant', 'conjoint', 'frere_soeur', 'tiers'],
  grand_pere: ['enfant', 'petit_enfant', 'frere_soeur', 'tiers'],
  grand_mere: ['enfant', 'petit_enfant', 'frere_soeur', 'tiers'],
  oncle: ['neveu_niece', 'frere_soeur', 'tiers'],
  tante: ['neveu_niece', 'frere_soeur', 'tiers'],
  frere: ['frere_soeur', 'tiers'],
  soeur: ['frere_soeur', 'tiers'],
  tiers: ['tiers']
};

export const BENEFICIAIRES_LABELS = {
  enfant: 'Enfant(s)',
  petit_enfant: 'Petit(s)-enfant(s)',
  conjoint: 'Conjoint/Pacsé (exonéré)',
  neveu_niece: 'Neveu(x)/Nièce(s)',
  frere_soeur: 'Frère/Sœur',
  tiers: 'Tiers'
};

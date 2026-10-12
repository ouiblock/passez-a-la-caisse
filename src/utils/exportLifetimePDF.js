/**
 * Export PDF — Bilan fiscal vie entière
 * "Passez à la Caisse" — Un billet pour Bercy
 *
 * Structure du document :
 *  Page 1 — Page de garde (M. Jean-Luc Chat + titre)
 *  Page 2 — Données renseignées (profil de simulation)
 *  Page 3 — Cotisations URSSAF détaillées + méthodologie
 *  Page 4 — Récapitulatif de tous les prélèvements
 *  Page 5 — Pistes de réflexion
 *  Page 6 — Disclaimer juridique
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Palette couleurs ────────────────────────────────────────────────────────
const NAVY    = [11,  31,  58];
const GOLD    = [198, 164, 90];
const WHITE   = [255, 255, 255];
const GRAY    = [100, 100, 100];
const LIGHTGRAY = [240, 240, 245];
const RED_DARK = [139, 0, 0];
const GREEN_DARK = [0, 100, 60];

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const formatNumber = (n) => {
  if (n === null || n === undefined || isNaN(n)) return '0';
  return Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export const fmt = (n) => `${formatNumber(n)} €`;

export const fmtPct = (n) => `${(n * 100).toFixed(1)}%`;

function setFont(doc, size, color = WHITE, style = 'normal') {
  doc.setFontSize(size);
  doc.setTextColor(...color);
  doc.setFont('helvetica', style);
}

function header(doc, title, pageNum, totalPages) {
  // Bande navy en haut
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 18, 'F');
  setFont(doc, 9, GOLD, 'bold');
  doc.text('UN BILLET POUR BERCY — BILAN FISCAL VIE ENTIÈRE', 10, 11);
  setFont(doc, 9, GRAY);
  doc.text(`Page ${pageNum} / ${totalPages}`, 200, 11, { align: 'right' });
  // Titre de page
  setFont(doc, 14, NAVY, 'bold');
  doc.text(title, 10, 28);
  // Ligne or
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(10, 31, 200, 31);
}

function footer(doc, date) {
  const y = 287;
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.3);
  doc.line(10, y - 3, 200, y - 3);
  setFont(doc, 7, GRAY);
  doc.text(`Document généré le ${date} · Outil pédagogique gratuit · unbilletpourbercy.proton.me`, 10, y);
  doc.text('Collectif anonyme de citoyens — aucun conseil fiscal', 200, y, { align: 'right' });
}

function addPage(doc, title, pageNum, totalPages, date) {
  doc.addPage();
  header(doc, title, pageNum, totalPages);
  footer(doc, date);
  return 38; // y de départ après l'en-tête
}

// ─── Chargement image base64 ──────────────────────────────────────────────────
async function loadImageAsBase64(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ─── Calcul taux global ────────────────────────────────────────────────────────
function tauxGlobal(totalTaxes, richesse) {
  if (!richesse || richesse <= 0) return 0;
  return totalTaxes / richesse;
}

// ═════════════════════════════════════════════════════════════════════════════
// FONCTION PRINCIPALE
// ═════════════════════════════════════════════════════════════════════════════
export async function exportLifetimePDF(profil, resultats, successionEstimation) {
  const date = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const totalAvecSuccession = (resultats.total || 0) + (successionEstimation?.droitsTotal || 0);
  const taux = tauxGlobal(totalAvecSuccession, resultats.richesseTotaleCreee);
  const TOTAL_PAGES = 6;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // ──────────────────────────────────────────────────────────────────────────
  // PAGE 1 — PAGE DE GARDE
  // ──────────────────────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 297, 'F');

  // Logo Jean-Luc Chat
  const chatImg = await loadImageAsBase64('/images/jean-luc-chat.jpg');
  if (chatImg) {
    // Cadre rond simulé avec un rectangle arrondi
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(2);
    doc.roundedRect(80, 18, 50, 50, 25, 25, 'S');
    doc.addImage(chatImg, 'JPEG', 80, 18, 50, 50);
  }

  // Titre principal
  setFont(doc, 28, GOLD, 'bold');
  doc.text('VOTRE BILAN', 105, 90, { align: 'center' });
  setFont(doc, 22, WHITE, 'bold');
  doc.text('POUR PASSER À LA CAISSE', 105, 102, { align: 'center' });

  // Ligne dorée
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.5);
  doc.line(30, 108, 180, 108);

  // Montant total — chiffre choc
  setFont(doc, 11, GRAY);
  doc.text('Total estimé des prélèvements sur votre vie', 105, 120, { align: 'center' });
  setFont(doc, 36, GOLD, 'bold');
  doc.text(fmt(totalAvecSuccession), 105, 135, { align: 'center' });
  setFont(doc, 13, WHITE);
  doc.text(`soit ${fmtPct(taux)} de vos revenus nets cumulés`, 105, 144, { align: 'center' });

  // Ligne dorée
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(30, 150, 180, 150);

  // Citation de Jean-Luc Chat
  setFont(doc, 10, GOLD, 'bold');
  doc.text('M. Jean-Luc Chat', 105, 162, { align: 'center' });
  setFont(doc, 8.5, [...GRAY, 0.8]);
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(8.5);
  const citation = '"J\'ai minutieusement épluché votre dossier. Le bilan est fait.\nIl est temps de... passer à la caisse."';
  const citLines = doc.splitTextToSize(citation, 140);
  doc.text(citLines, 105, 169, { align: 'center' });

  setFont(doc, 8, GRAY);
  doc.setTextColor(120, 120, 120);
  doc.text('Inspecteur Principal — DGFIP (Retraite)', 105, 180, { align: 'center' });

  // Infos simulation
  doc.setFillColor(25, 50, 80);
  doc.roundedRect(20, 190, 170, 55, 4, 4, 'F');
  setFont(doc, 9, GOLD, 'bold');
  doc.text('INFORMATIONS DE SIMULATION', 105, 200, { align: 'center' });

  const infoRows = [
    ['Statut professionnel', profilLabel('statut', profil.statut)],
    ['Situation familiale', `${profilLabel('situation', profil.situation)}${profil.enfants > 0 ? ` — ${profil.enfants} enfant(s)` : ''}`],
    ['Période simulée', `De ${profil.ageDebutCarriere || 22} à ${profil.esperanceVie} ans (${profil.esperanceVie - (profil.ageDebutCarriere || 22)} ans)`],
    ['Date de génération', date],
  ];

  let iy = 207;
  setFont(doc, 8.5, WHITE);
  for (const [label, val] of infoRows) {
    doc.setTextColor(160, 160, 160);
    doc.setFontSize(8);
    doc.text(label, 30, iy);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(val, 100, iy);
    iy += 9;
  }

  // Pied de page de garde
  setFont(doc, 7.5, GRAY);
  doc.setTextColor(100, 100, 100);
  doc.text('UN BILLET POUR BERCY — Outil pédagogique gratuit & anonyme · unbilletpourbercy.proton.me', 105, 270, { align: 'center' });
  doc.text('Collectif anonyme de citoyens · Document à but pédagogique uniquement', 105, 276, { align: 'center' });

  footer(doc, date);

  // ──────────────────────────────────────────────────────────────────────────
  // PAGE 2 — DONNÉES RENSEIGNÉES
  // ──────────────────────────────────────────────────────────────────────────
  let y = addPage(doc, 'Vos données de simulation', 2, TOTAL_PAGES, date);

  // Encadré récap profil
  setFont(doc, 10, NAVY, 'bold');
  doc.text('Profil général', 10, y + 2);
  y += 6;

  const profilData = buildProfilTable(profil);
  autoTable(doc, {
    startY: y,
    body: profilData,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 75, textColor: [50, 50, 50] },
      1: { cellWidth: 115, textColor: [11, 31, 58] }
    },
    alternateRowStyles: { fillColor: LIGHTGRAY }
  });
  y = doc.lastAutoTable.finalY + 8;

  // Revenus & consommation
  setFont(doc, 10, NAVY, 'bold');
  doc.text('Revenus & patrimoine', 10, y + 2);
  y += 6;

  const revenusData = buildRevenusTable(profil);
  autoTable(doc, {
    startY: y,
    body: revenusData,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 75, textColor: [50, 50, 50] },
      1: { cellWidth: 115, textColor: [11, 31, 58] }
    },
    alternateRowStyles: { fillColor: LIGHTGRAY }
  });
  y = doc.lastAutoTable.finalY + 8;

  // Note méthodologique
  doc.setFillColor(245, 240, 210);
  doc.roundedRect(10, y, 190, 20, 2, 2, 'F');
  setFont(doc, 8, [100, 70, 0], 'bold');
  doc.text('📋  Note méthodologique', 14, y + 6);
  setFont(doc, 7.5, [80, 60, 0]);
  const methNote = `Barèmes appliqués : IR 2026 (LFi 2026, revenus 2025), URSSAF régime général 2026 (PASS = 48 060 €/an), TVA taux effectif moyen 16,5%. ` +
    `Les montants sont exprimés en euros constants (pouvoir d'achat 2026), le simulateur applique le barème 2026 sur l'ensemble de la carrière ` +
    `pour produire des estimations comparables. Une croissance annuelle des revenus de ${profil.croissanceRevenuPct || 1}% est appliquée.`;
  const methLines = doc.splitTextToSize(methNote, 180);
  doc.text(methLines, 14, y + 12);

  // ──────────────────────────────────────────────────────────────────────────
  // PAGE 3 — COTISATIONS URSSAF (détail + métho)
  // ──────────────────────────────────────────────────────────────────────────
  y = addPage(doc, 'Cotisations sociales — Régime général 2026', 3, TOTAL_PAGES, date);

  // Encadré intro
  doc.setFillColor(230, 240, 255);
  doc.roundedRect(10, y, 190, 18, 2, 2, 'F');
  setFont(doc, 8.5, NAVY, 'bold');
  doc.text('Méthodologie URSSAF — Régime général (salarié du secteur privé)', 14, y + 6);
  setFont(doc, 7.5, [40, 40, 80]);
  const urssafIntro = `Taux en vigueur au 01/01/2026. Source : urssaf.fr · PASS 2026 = 48 060 €/an (4 005 €/mois). ` +
    `La RGDU (Réduction Générale Dégressive Unique, remplaçant la "réduction Fillon") n'est pas modélisée pour conserver la lisibilité pédagogique.`;
  doc.text(doc.splitTextToSize(urssafIntro, 180), 14, y + 11);
  y += 22;

  // Tableau part salariale
  setFont(doc, 9, NAVY, 'bold');
  doc.text('Part salariale (prélevée sur le salaire brut du salarié)', 10, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    head: [['Cotisation', 'Taux 2026', 'Assiette', 'Commentaire']],
    body: [
      ['Assurance maladie (AMMI)', '0,75%', 'Totalité du salaire brut', 'Maladie, maternité, invalidité, décès'],
      ['Assurance vieillesse plafonnée', '6,90%', 'Dans la limite du PASS', 'Retraite de base — régime général'],
      ['Assurance vieillesse déplafonnée', '0,40%', 'Totalité du salaire brut', 'Retraite de base — part déplafonnée'],
      ['Assurance chômage (Unédic)', '4,00%', 'Jusqu\'à 4×PASS (192 240€/an)', 'Cotisation Unédic (hors AGS)'],
      ['AGIRC-ARRCO Tranche 1', '3,15%', 'Jusqu\'à 1 PASS', 'Retraite complémentaire obligatoire'],
      ['CEG salarié Tranche 1', '0,86%', 'Jusqu\'à 1 PASS', 'Contribution d\'Équilibre Généralisée'],
      ['CSG (dont 6,8% déductible)', '9,20%', '98,25% du brut (abatt. 1,75%)', '6,8% déductible RFR + 2,4% non déductible'],
      ['CRDS', '0,50%', '98,25% du brut', 'Remboursement dette sociale'],
      ['TOTAL SALARIAL', '~22,2%', 'Taux effectif moyen', 'Sur salaire brut'],
    ],
    theme: 'striped',
    styles: { fontSize: 7.5, cellPadding: 1.5 },
    headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold' },
    columnStyles: {
      1: { halign: 'right', fontStyle: 'bold' },
      0: { cellWidth: 52 },
      2: { cellWidth: 52 },
      3: { cellWidth: 60 }
    },
    rowStyles: { 8: { fontStyle: 'bold', fillColor: [220, 240, 220] } }
  });
  y = doc.lastAutoTable.finalY + 6;

  // Tableau part patronale
  setFont(doc, 9, NAVY, 'bold');
  doc.text('Part patronale (prise en charge par l\'employeur, sur le salaire brut)', 10, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    head: [['Cotisation', 'Taux 2026', 'Assiette', 'Commentaire']],
    body: [
      ['Assurance maladie (AMMI)', '13,30%', 'Totalité du salaire brut', 'Taux réduit 7% si < 2,5 SMIC (RGDU)'],
      ['Assurance vieillesse plafonnée', '8,55%', 'Dans la limite du PASS', 'Retraite de base'],
      ['Assurance vieillesse déplafonnée', '2,11%', 'Totalité du salaire brut', '+0,09 pt en 2026 vs 2025'],
      ['Allocations familiales', '5,25%', 'Totalité du salaire brut', 'Taux réduit 3,45% si < 3,5 SMIC'],
      ['Assurance chômage (Unédic)', '4,00%', 'Jusqu\'à 4×PASS', 'Dont 0,05% AGS (garantie salaires)'],
      ['AGIRC-ARRCO Tranche 1', '5,12%', 'Jusqu\'à 1 PASS', 'Retraite complémentaire obligatoire'],
      ['CEG patronal Tranche 1', '1,29%', 'Jusqu\'à 1 PASS', 'Contribution d\'Équilibre Généralisée'],
      ['Contribution Solidarité Autonomie', '0,30%', 'Totalité du salaire brut', 'Financement dépendance (CNSA)'],
      ['Accidents du travail (AT/MP)', '0,84%', 'Totalité du salaire brut', 'Taux fixé par la CARSAT selon secteur'],
      ['FNAL', '0,10%', 'Totalité du salaire brut', 'Aide au logement (0,50% si > 20 sal.)'],
      ['Formation professionnelle', '0,60%', 'Totalité du salaire brut', 'Moyenne (1% si > 11 sal., 0,55% si < 11)'],
      ['TOTAL PATRONAL', '~45,5%', 'Taux effectif moyen', 'Hors RGDU — sur salaire brut'],
    ],
    theme: 'striped',
    styles: { fontSize: 7.5, cellPadding: 1.5 },
    headStyles: { fillColor: [60, 80, 120], textColor: WHITE, fontStyle: 'bold' },
    columnStyles: {
      1: { halign: 'right', fontStyle: 'bold' },
      0: { cellWidth: 52 },
      2: { cellWidth: 52 },
      3: { cellWidth: 60 }
    },
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PAGE 4 — RÉCAPITULATIF DE TOUS LES PRÉLÈVEMENTS
  // ──────────────────────────────────────────────────────────────────────────
  y = addPage(doc, 'Récapitulatif de vos prélèvements sur la vie entière', 4, TOTAL_PAGES, date);

  // Grande carte totale
  doc.setFillColor(...NAVY);
  doc.roundedRect(10, y, 190, 28, 3, 3, 'F');
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.5);
  doc.roundedRect(10, y, 190, 28, 3, 3, 'S');
  setFont(doc, 9, GOLD, 'bold');
  doc.text('TOTAL ESTIMÉ DES PRÉLÈVEMENTS SUR VOTRE VIE', 105, y + 7, { align: 'center' });
  setFont(doc, 28, GOLD, 'bold');
  doc.text(fmt(totalAvecSuccession), 105, y + 21, { align: 'center' });
  y += 33;

  // Sous-totaux
  const sousTotaux = [
    ['Total des revenus nets cumulés sur votre vie', fmt(resultats.richesseTotaleCreee || 0), ''],
    ['dont salaires nets de carrière', fmt(resultats.detailRichesse?.revenusSalariauxNets || 0), ''],
    ['dont pensions de retraite nettes', fmt(resultats.detailRichesse?.revenusRetraiteNets || 0), ''],
  ];
  autoTable(doc, {
    startY: y,
    body: sousTotaux,
    theme: 'plain',
    styles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 130, textColor: [...GREEN_DARK] },
      1: { halign: 'right', cellWidth: 40, fontStyle: 'bold' },
      2: { cellWidth: 20 }
    }
  });
  y = doc.lastAutoTable.finalY + 4;

  // Tableau détail des impôts
  const CATEGORIES = [
    { key: 'cotSalariales',          label: 'Cotisations salariales (URSSAF)',      group: 'Cotisations sociales' },
    { key: 'cotPatronales',          label: 'Cotisations patronales (coût employeur)',group: 'Cotisations sociales' },
    { key: 'retraitesPrelevSociaux', label: 'Prélèvements sociaux sur pension',      group: 'Cotisations sociales' },
    { key: 'impotRevenu',            label: 'Impôt sur le revenu (IR)',              group: 'Impôts directs' },
    { key: 'ifi',                    label: 'IFI (Impôt sur la Fortune Immobilière)',group: 'Impôts directs' },
    { key: 'tvaConso',               label: 'TVA sur consommation courante',         group: 'TVA & Taxes' },
    { key: 'energieCarburant',       label: 'Taxes sur carburant (TICPE + TVA)',     group: 'TVA & Taxes' },
    { key: 'energieElectricite',     label: 'Taxes sur électricité (TICFE + TVA)',   group: 'TVA & Taxes' },
    { key: 'energieGaz',             label: 'Taxes sur gaz (TICGN + TVA)',           group: 'TVA & Taxes' },
    { key: 'logementNotaire',        label: 'Frais de notaire (droits de mutation)', group: 'Droits & Taxes locales' },
    { key: 'taxeFonciere',           label: 'Taxe foncière (cumulée)',               group: 'Droits & Taxes locales' },
    { key: 'flatTaxPlacements',      label: 'Flat tax sur placements (PFU 31,4%)',   group: 'Fiscalité des placements' },
    { key: 'fiscaliteRevenusFonciers',label: 'Fiscalité revenus fonciers (~40%)',    group: 'Fiscalité des placements' },
    { key: 'interetsCredits',        label: 'Intérêts de crédits (banque, non fiscal)',group: 'Information' },
  ];

  const tableData = [];
  let lastGroup = '';
  for (const cat of CATEGORIES) {
    const montant = resultats[cat.key] || 0;
    if (montant <= 0) continue;
    if (cat.group !== lastGroup) {
      tableData.push([{ content: cat.group, colSpan: 3, styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 8 } }]);
      lastGroup = cat.group;
    }
    const pct = totalAvecSuccession > 0 ? ((montant / totalAvecSuccession) * 100).toFixed(1) + '%' : '—';
    tableData.push([cat.label, fmt(montant), pct]);
  }
  // Droits de succession
  if (successionEstimation?.droitsTotal > 0) {
    tableData.push([{ content: 'Droits de succession (payés par vos héritiers)', colSpan: 3, styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 8 } }]);
    tableData.push(['Droits de succession estimés', fmt(successionEstimation.droitsTotal), fmtPct((successionEstimation.droitsTotal) / totalAvecSuccession)]);
  }
  // Total
  tableData.push([{ content: 'TOTAL GÉNÉRAL', styles: { fontStyle: 'bold', fillColor: [...GOLD, 0.2], textColor: NAVY, fontSize: 10 } }, { content: fmt(totalAvecSuccession), styles: { halign: 'right', fontStyle: 'bold', textColor: NAVY, fontSize: 10 } }, { content: '100%', styles: { halign: 'right', fontStyle: 'bold', textColor: NAVY } }]);

  autoTable(doc, {
    startY: y,
    body: tableData,
    theme: 'striped',
    styles: { fontSize: 8.5, cellPadding: 2 },
    headStyles: { fillColor: NAVY, textColor: WHITE },
    columnStyles: {
      0: { cellWidth: 125 },
      1: { halign: 'right', cellWidth: 40, fontStyle: 'bold' },
      2: { halign: 'right', cellWidth: 25 }
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PAGE 5 — PISTES DE RÉFLEXION
  // ──────────────────────────────────────────────────────────────────────────
  y = addPage(doc, 'Pistes de réflexion (à but pédagogique)', 5, TOTAL_PAGES, date);

  setFont(doc, 8.5, GRAY);
  doc.text('Ces pistes sont présentées à titre informatif et pédagogique. Elles ne constituent pas un conseil fiscal ou patrimonial.', 10, y);
  y += 8;

  const pistes = [
    {
      titre: '1. Assurance-vie (art. 990 I & 757 B)',
      desc: `L'assurance-vie permet de transmettre un capital hors succession avec des avantages fiscaux significatifs. ` +
        `Les primes versées avant 70 ans bénéficient d'un abattement de 152 500 € par bénéficiaire désigné (art. 990 I CGI). ` +
        `Au-delà, les primes versées après 70 ans bénéficient d'un abattement global de 30 500 € (art. 757 B). ` +
        `La fiscalité applicable sur les gains varie selon la durée du contrat (exonération après 8 ans sous conditions).`
    },
    {
      titre: '2. Donations classiques (art. 779 CGI)',
      desc: `Chaque parent peut donner 100 000 € à chaque enfant tous les 15 ans en franchise de droits. ` +
        `Les dons manuels de sommes d'argent (art. 790 G) permettent en outre de donner 31 865 € supplémentaires ` +
        `à chaque descendant majeur, à condition d'avoir moins de 80 ans. Ces abattements se cumulent et se renouvellent.`
    },
    {
      titre: '3. Démembrement de propriété (art. 669 CGI)',
      desc: `La donation de nue-propriété (en conservant l'usufruit) permet de transmettre un bien immobilier à valeur réduite fiscalement, ` +
        `calculée selon un barème viager lié à l'âge du donateur (art. 669 CGI). À votre décès, le nu-propriétaire récupère la ` +
        `pleine propriété sans droits supplémentaires.`
    },
    {
      titre: '4. PEA & Épargne salariale',
      desc: `Le PEA (Plan d'Épargne en Actions) permet, après 5 ans, d'exonérer les gains d'impôt sur le revenu ` +
        `(seuls les prélèvements sociaux de 17,2% restent dus). Les dispositifs d'épargne salariale (PEE, PERCO, PER) ` +
        `peuvent réduire l'IR en phase de constitution, à vérifier selon votre situation.`
    },
    {
      titre: '5. Optimisation de la retraite (PER)',
      desc: `Les versements sur un Plan d'Épargne Retraite (PER) sont déductibles du revenu imposable (dans la limite ` +
        `d'un plafond annuel), ce qui peut réduire votre IR pendant la phase active. La fiscalité à la sortie (en rente ou ` +
        `en capital) doit toutefois être analysée en fonction de votre TMI à la retraite.`
    },
  ];

  for (const piste of pistes) {
    if (y > 260) {
      y = addPage(doc, 'Pistes de réflexion (suite)', 5, TOTAL_PAGES, date);
    }
    doc.setFillColor(245, 248, 255);
    doc.roundedRect(10, y, 190, 5, 1, 1, 'F');
    setFont(doc, 9, NAVY, 'bold');
    doc.text(piste.titre, 13, y + 4);
    y += 8;
    setFont(doc, 8, [50, 50, 50]);
    const lines = doc.splitTextToSize(piste.desc, 183);
    doc.text(lines, 13, y);
    y += lines.length * 4 + 4;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PAGE 6 — DISCLAIMER JURIDIQUE
  // ──────────────────────────────────────────────────────────────────────────
  y = addPage(doc, 'Avertissements — Mentions légales', 6, TOTAL_PAGES, date);

  // Encadré d'avertissement principal
  doc.setFillColor(255, 240, 230);
  doc.roundedRect(10, y, 190, 12, 2, 2, 'F');
  doc.setDrawColor(200, 80, 0);
  doc.setLineWidth(1);
  doc.roundedRect(10, y, 190, 12, 2, 2, 'S');
  setFont(doc, 10, [180, 60, 0], 'bold');
  doc.text('AVERTISSEMENT : CE DOCUMENT EST EXCLUSIVEMENT PEDAGOGIQUE', 105, y + 8, { align: 'center' });
  y += 17;

  const disclaimerBlocks = [
    {
      titre: '1. Finalite pedagogique — aucun conseil fiscal',
      texte: `"Un billet pour Bercy" est un outil de sensibilisation conçu par un collectif anonyme de citoyens ` +
        `pour illustrer, de manière concrète et accessible, le poids des prélèvements obligatoires sur une vie en France. ` +
        `Ce document ne constitue en aucun cas un conseil fiscal, juridique, patrimonial ou financier. ` +
        `Il n'a pas vocation à se substituer à une consultation auprès d'un professionnel qualifié. ` +
        `Toute décision financière ou patrimoniale doit être prise après consultation d'un notaire, d'un avocat fiscaliste ` +
        `ou d'un conseiller en gestion de patrimoine (CGP) agréé.`
    },
    {
      titre: '2. Simplifications et limites du modele',
      texte: `Les calculs présentés reposent sur des hypothèses moyennes, des barèmes nationaux et des simplifications ` +
        `inhérentes à tout outil de simulation généraliste. En particulier : (1) le modèle ne tient pas compte de la ` +
        `Réduction Générale Dégressive Unique (RGDU) sur les cotisations patronales ; (2) les taux de cotisations AGIRC-ARRCO ` +
        `pour les rémunérations supérieures à 1 PASS (Tranche 2) ne sont pas modélisés ; (3) les avantages fiscaux personnels ` +
        `(crédits d'impôt, réductions diverses, exonérations liées à des situations spécifiques) ne sont pas pris en compte ; ` +
        `(4) les résultats sont exprimés en euros constants 2026 ; l'inflation future et l'évolution de la législation fiscale ` +
        `pourront modifier significativement les montants réels.`
    },
    {
      titre: '3. Anonymat & protection des donnees',
      texte: `Cet outil ne collecte aucune donnée personnelle. Aucune information saisie n'est transmise à un serveur tiers, ` +
        `enregistrée ni partagée. L'ensemble des calculs s'effectue localement dans votre navigateur. ` +
        `Le collectif "Un billet pour Bercy" n'a aucun lien avec l'administration fiscale française (DGFIP, URSSAF, Ministère de l'Économie) ` +
        `ni avec aucun parti politique, syndicat, association agréée ou prestataire financier.`
    },
    {
      titre: '4. Absence de responsabilite',
      texte: `Le collectif "Un billet pour Bercy" décline toute responsabilité quant aux décisions prises par les utilisateurs ` +
        `sur la base des estimations produites par cet outil. Les montants affichés sont des ordres de grandeur indicatifs. ` +
        `Les barèmes fiscaux évoluent chaque année lors de la loi de finances ; les données présentées ici correspondent ` +
        `aux règles en vigueur en 2026 appliquées de façon conventionnelle sur l'ensemble de la vie simulée.`
    },
    {
      titre: '5. Le mot de M. Jean-Luc Chat',
      texte: `"Ces chiffres vous ont peut-être donné des sueurs froides — c'est tout à fait normal et même souhaitable. ` +
        `La fiscalité est complexe, évolutive, et votre situation personnelle mérite une attention individuelle. ` +
        `Consultez un professionnel ! Et si vous souhaitez approfondir, rapprochez-vous d'un notaire ou d'un avocat fiscaliste ` +
        `avant toute décision. Ils sont bien plus qualifiés que moi pour vous donner un vrai conseil — j'ai beau être Inspecteur Principal, ` +
        `je reste un chat." — M. Jean-Luc Chat, Inspecteur Principal DGFIP (retraite)`
    },
  ];

  for (const block of disclaimerBlocks) {
    if (y > 260) break; // sécurité
    setFont(doc, 8.5, NAVY, 'bold');
    doc.text(block.titre, 10, y);
    y += 5;
    setFont(doc, 8, [50, 50, 50]);
    const lines = doc.splitTextToSize(block.texte, 186);
    doc.text(lines, 10, y);
    y += lines.length * 3.8 + 5;
    // Séparateur
    doc.setDrawColor(200, 200, 210);
    doc.setLineWidth(0.3);
    doc.line(10, y - 2, 200, y - 2);
  }

  // Contact
  if (y < 275) {
    doc.setFillColor(240, 248, 255);
    doc.roundedRect(10, y, 190, 14, 2, 2, 'F');
    setFont(doc, 8.5, NAVY, 'bold');
    doc.text('Contact & collaboration', 14, y + 5);
    setFont(doc, 8, [30, 60, 120]);
    doc.text('Pour toute question, signalement d\'erreur ou demande de collaboration : unbilletpourbercy@proton.me', 14, y + 11);
  }

  // ─── Sauvegarde ────────────────────────────────────────────────────────────
  const slug = `bilan-fiscal-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(slug);
}

// ─── Helpers label profil ─────────────────────────────────────────────────────
function profilLabel(key, val) {
  const maps = {
    statut: { salarie: 'Salarié(e)', cadre: 'Cadre', prof_lib: 'Profession libérale', entrepreneur: 'Entrepreneur(e)', retraite: 'Retraité(e)' },
    situation: { celibataire: 'Célibataire', couple: 'En couple (marié/pacsé)', divorce: 'Divorcé(e)', veuf: 'Veuf/Veuve' }
  };
  return maps[key]?.[val] || val || '—';
}

function buildProfilTable(profil) {
  return [
    ['Statut professionnel', profilLabel('statut', profil.statut)],
    ['Situation familiale', profilLabel('situation', profil.situation)],
    ['Nombre d\'enfants', profil.enfants > 0 ? `${profil.enfants} enfant(s)` : 'Aucun'],
    ['Âge actuel', `${profil.age} ans`],
    ['Âge de début de carrière', `${profil.ageDebutCarriere || 22} ans`],
    ['Âge de départ à la retraite', `${profil.retraiteAge} ans`],
    ['Espérance de vie simulée', `${profil.esperanceVie} ans`],
    ['Durée de carrière simulée', `${Math.max(0, profil.retraiteAge - (profil.ageDebutCarriere || 22))} ans`],
    ['Durée de retraite simulée', `${Math.max(0, profil.esperanceVie - profil.retraiteAge)} ans`],
  ];
}

function buildRevenusTable(profil) {
  const rows = [
    ['Revenu net mensuel (début de carrière)', fmt(profil.revenuNetMensuel || 0)],
    ['Croissance annuelle des revenus', `${profil.croissanceRevenuPct || 1}% / an`],
    ['Consommation mensuelle estimée', fmt(profil.consoMensuelle || 0)],
  ];
  if (profil.logement?.rpAchat) rows.push(['Résidence principale (prix d\'achat)', fmt(profil.logement.rpPrix || 0)]);
  if (profil.logement?.rsAchat) rows.push(['Résidence secondaire (prix d\'achat)', fmt(profil.logement.rsPrix || 0)]);
  if (profil.placements?.capitalTotal > 0) {
    rows.push(['Capital de placements', fmt(profil.placements.capitalTotal)]);
    rows.push(['Rendement annuel estimé', `${profil.placements.rendementPct || 0}%`]);
  }
  if (profil.revenusFonciers?.revenuBrut > 0) rows.push(['Revenus fonciers bruts annuels', fmt(profil.revenusFonciers.revenuBrut)]);
  return rows;
}

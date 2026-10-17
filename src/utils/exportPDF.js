/**
 * Export PDF — Bilan de simulation Succession & Transmission
 * "Passez à la Caisse" — Un billet pour Bercy
 *
 * Structure du document :
 *  Page 1 — Page de garde (M. Jean-Luc Chat + titre + chiffre choc)
 *  Page 2 — Données du patrimoine transmis & bénéficiaires
 *  Page 3 — Résultats détaillés par bénéficiaire & barèmes fiscaux
 *  Page 4 — Pistes de réflexion & stratégies de transmission
 *  Page 5 — Mentions légales & disclaimer juridique
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BENEFICIAIRES_LABELS } from '../constants/fiscal.js';

// ─── Palette couleurs ────────────────────────────────────────────────────────
const NAVY       = [11,  31,  58];
const GOLD       = [198, 164, 90];
const WHITE      = [255, 255, 255];
const GRAY       = [100, 100, 100];
const LIGHTGRAY  = [240, 240, 245];
const GREEN_DARK = [0,   100, 60];
const RED_DARK   = [139, 0,   0];

// ─── Helpers d'affichage ─────────────────────────────────────────────────────
export function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  const rounded = Math.round(Number(value));
  // Utilise un espace ASCII standard (0x20) pour éviter que jsPDF n'affiche des slashes (/) pour les milliers/millions
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function fmt(value) {
  return `${formatNumber(value)} €`;
}

export function fmtPct(value) {
  if (value === null || value === undefined || isNaN(value)) return '0,0%';
  return `${(Number(value) * 100).toFixed(1).replace('.', ',')}%`;
}

function setFont(doc, size, color = WHITE, style = 'normal') {
  doc.setFontSize(size);
  doc.setTextColor(...color);
  doc.setFont('helvetica', style);
}

function header(doc, title, pageNum, totalPages) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 18, 'F');
  setFont(doc, 9, GOLD, 'bold');
  doc.text('UN BILLET POUR BERCY — SUCCESSION & TRANSMISSION', 10, 11);
  setFont(doc, 9, GRAY);
  doc.text(`Page ${pageNum} / ${totalPages}`, 200, 11, { align: 'right' });

  setFont(doc, 14, NAVY, 'bold');
  doc.text(title, 10, 28);
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
  doc.text(`Document généré le ${date} · Outil pédagogique gratuit · passezalacaisse.org`, 10, y);
  doc.text('Collectif anonyme de citoyens — aucun conseil fiscal', 200, y, { align: 'right' });
}

function addPage(doc, title, pageNum, totalPages, date) {
  doc.addPage();
  header(doc, title, pageNum, totalPages);
  footer(doc, date);
  return 38;
}

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

// ═════════════════════════════════════════════════════════════════════════════
// FONCTION PRINCIPALE
// ═════════════════════════════════════════════════════════════════════════════
export async function exportToPDF(
  roleOrOptions,
  rawBeneficiaires,
  rawMontants,
  rawResultats,
  rawTotalDroits,
  rawIsCouple = false,
  rawAge,
  rawPartnerAge
) {
  // Support objet unique ou arguments positionnels
  let role, beneficiaires, montants, resultats, totalDroits, isCouple, age, partnerAge;

  if (typeof roleOrOptions === 'object' && roleOrOptions !== null && !Array.isArray(roleOrOptions)) {
    ({
      role = 'donateur',
      beneficiaires = [],
      montants = {},
      resultats = [],
      totalDroits = 0,
      isCouple = false,
      age = null,
      partnerAge = null
    } = roleOrOptions);
  } else {
    role = roleOrOptions || 'donateur';
    beneficiaires = rawBeneficiaires || [];
    montants = rawMontants || {};
    resultats = rawResultats || [];
    totalDroits = rawTotalDroits || 0;
    isCouple = Boolean(rawIsCouple);
    age = rawAge || null;
    partnerAge = rawPartnerAge || null;
  }

  // Normalisation du tableau de résultats
  const items = Array.isArray(resultats) ? resultats : (resultats?.resultats || []);

  const date = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const TOTAL_PAGES = 5;

  const montantImmo = Number(montants.immobilier) || 0;
  const montantFin = Number(montants.financier) || 0;
  const avAvant70 = Number(montants.avAvant70) || 0;
  const avApres70 = Number(montants.avApres70) || 0;
  const totalTransmissibleCivil = montantImmo + montantFin;
  const patrimoineTotalGlobal = totalTransmissibleCivil + avAvant70 + avApres70;
  const netGlobalTransmis = Math.max(0, patrimoineTotalGlobal - totalDroits);
  const tauxMoyenGlobal = patrimoineTotalGlobal > 0 ? (totalDroits / patrimoineTotalGlobal) : 0;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // ──────────────────────────────────────────────────────────────────────────
  // PAGE 1 — PAGE DE GARDE
  // ──────────────────────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 297, 'F');

  // Photo Jean-Luc Chat
  const chatImg = await loadImageAsBase64('/images/jean-luc-chat.jpg');
  if (chatImg) {
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(2);
    doc.roundedRect(80, 18, 50, 50, 25, 25, 'S');
    doc.addImage(chatImg, 'JPEG', 80, 18, 50, 50);
  }

  // Titre principal
  setFont(doc, 26, GOLD, 'bold');
  doc.text('VOTRE BILAN SUCCESSION', 105, 90, { align: 'center' });
  setFont(doc, 20, WHITE, 'bold');
  doc.text('POUR PASSER À LA CAISSE', 105, 102, { align: 'center' });

  // Ligne dorée
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.5);
  doc.line(30, 108, 180, 108);

  // Montant total choc
  setFont(doc, 11, GRAY);
  doc.text('Total estimé des droits de succession & transmission', 105, 120, { align: 'center' });
  setFont(doc, 36, GOLD, 'bold');
  doc.text(fmt(totalDroits), 105, 135, { align: 'center' });
  setFont(doc, 13, WHITE);
  doc.text(`soit ${fmtPct(tauxMoyenGlobal)} du patrimoine transmis`, 105, 144, { align: 'center' });

  // Ligne dorée
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(30, 150, 180, 150);

  // Citation de Jean-Luc Chat
  setFont(doc, 10, GOLD, 'bold');
  doc.text('M. Jean-Luc Chat', 105, 162, { align: 'center' });
  setFont(doc, 8.5, [180, 180, 180]);
  const citation = '"Transmettre un patrimoine en France, c\'est aussi faire passer vos héritiers à la caisse.\nLe fisc s\'est servi, voici le détail sans fard."';
  const citLines = doc.splitTextToSize(citation, 150);
  doc.text(citLines, 105, 169, { align: 'center' });

  setFont(doc, 8, [120, 120, 120]);
  doc.text('Inspecteur Principal — DGFIP (Retraite)', 105, 180, { align: 'center' });

  // Carte synthèse chiffres clés
  doc.setFillColor(25, 50, 80);
  doc.roundedRect(20, 190, 170, 60, 4, 4, 'F');
  setFont(doc, 9, GOLD, 'bold');
  doc.text('SYNTHÈSE DE LA TRANSMISSION', 105, 199, { align: 'center' });

  const infoRows = [
    ['Qualité du déclarant', role === 'beneficiaire' ? 'Bénéficiaire (héritier)' : 'Transmetteur (parent / donateur)'],
    ['Patrimoine total transmis', fmt(patrimoineTotalGlobal)],
    ['Total des droits à payer par les héritiers', fmt(totalDroits)],
    ['Net total reçu par les héritiers', fmt(netGlobalTransmis)],
    ['Nombre de bénéficiaires désignés', `${beneficiaires.length} bénéficiaire(s)`],
    ['Situation matrimoniale', isCouple ? `En couple (marié / pacsé)${age ? ` — âges : ${age} ans${partnerAge ? ` / ${partnerAge} ans` : ''}` : ''}` : `Individuel${age ? ` (${age} ans)` : ''}`],
    ['Date de simulation', date],
  ];

  let iy = 206;
  for (const [label, val] of infoRows) {
    doc.setTextColor(170, 170, 170);
    doc.setFontSize(8);
    doc.text(label, 30, iy);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(val, 130, iy);
    iy += 7.5;
  }

  // Pied de page de garde
  setFont(doc, 7.5, GRAY);
  doc.text('PASSEZ À LA CAISSE — Outil pédagogique gratuit & anonyme · passezalacaisse.org', 105, 272, { align: 'center' });
  doc.text('Collectif anonyme de citoyens · Document à but informatif uniquement', 105, 277, { align: 'center' });

  footer(doc, date);

  // ──────────────────────────────────────────────────────────────────────────
  // PAGE 2 — DONNÉES DU PATRIMOINE ET BÉNÉFICIAIRES
  // ──────────────────────────────────────────────────────────────────────────
  let y = addPage(doc, 'Actifs déclarés et bénéficiaires', 2, TOTAL_PAGES, date);

  // Section Actifs
  setFont(doc, 10, NAVY, 'bold');
  doc.text('1. Décomposition du patrimoine transmissible', 10, y + 2);
  y += 6;

  const actifsRows = [
    ['Immobilier (résidences, locatif, terrains)', fmt(montantImmo), `${fmtPct(patrimoineTotalGlobal > 0 ? montantImmo / patrimoineTotalGlobal : 0)}`],
    ['Actifs financiers (comptes, liquidités, livrets, PEA, CTO)', fmt(montantFin), `${fmtPct(patrimoineTotalGlobal > 0 ? montantFin / patrimoineTotalGlobal : 0)}`],
    ['Total de l\'actif successoral civil', fmt(totalTransmissibleCivil), `${fmtPct(patrimoineTotalGlobal > 0 ? totalTransmissibleCivil / patrimoineTotalGlobal : 0)}`],
  ];

  if (avAvant70 > 0) {
    actifsRows.push(['Assurance-vie versée avant 70 ans (art. 990 I CGI)', fmt(avAvant70), `${fmtPct(avAvant70 / patrimoineTotalGlobal)}`]);
  }
  if (avApres70 > 0) {
    actifsRows.push(['Assurance-vie versée après 70 ans (art. 757 B CGI)', fmt(avApres70), `${fmtPct(avApres70 / patrimoineTotalGlobal)}`]);
  }

  actifsRows.push([
    { content: 'TOTAL DU PATRIMOINE TRANSMIS', styles: { fontStyle: 'bold', fillColor: [...NAVY], textColor: WHITE } },
    { content: fmt(patrimoineTotalGlobal), styles: { halign: 'right', fontStyle: 'bold', fillColor: [...NAVY], textColor: GOLD } },
    { content: '100,0%', styles: { halign: 'right', fontStyle: 'bold', fillColor: [...NAVY], textColor: WHITE } }
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Catégorie d\'actif', 'Montant estimé', 'Part (%)']],
    body: actifsRows,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { halign: 'right', cellWidth: 45, fontStyle: 'bold' },
      2: { halign: 'right', cellWidth: 25 }
    }
  });

  y = doc.lastAutoTable.finalY + 12;

  // Section Bénéficiaires
  setFont(doc, 10, NAVY, 'bold');
  doc.text('2. Bénéficiaires désignés et répartition successorale', 10, y + 2);
  y += 6;

  const benefTableBody = beneficiaires.map((b, idx) => {
    const label = BENEFICIAIRES_LABELS[b.type] || b.type;
    const partPct = b.pourcentage || (100 / beneficiaires.length);
    const quotePartEstimee = (patrimoineTotalGlobal * partPct) / 100;
    let abattementRef = '100 000 € (art. 779 I)';
    if (b.type === 'conjoint') abattementRef = 'Exonération totale (loi TEPA)';
    else if (b.type === 'petit_enfant') abattementRef = '1 594 € (31 865 € si don)';
    else if (b.type === 'frere_soeur') abattementRef = '15 932 € (art. 779 IV)';
    else if (b.type === 'neveu_niece') abattementRef = '7 967 € (art. 779 V)';
    else if (b.type === 'tiers') abattementRef = '1 594 € (art. 788 IV)';

    return [
      `${label} ${beneficiaires.length > 1 ? `#${idx + 1}` : ''}`,
      `${partPct.toFixed(1).replace('.', ',')} %`,
      fmt(quotePartEstimee),
      abattementRef
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['Bénéficiaire', 'Quote-part', 'Part brute estimée', 'Abattement de référence']],
    body: benefTableBody,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { halign: 'right', cellWidth: 30 },
      2: { halign: 'right', cellWidth: 40, fontStyle: 'bold' },
      3: { cellWidth: 65 }
    }
  });

  y = doc.lastAutoTable.finalY + 10;

  // Note méthodologique civile
  doc.setFillColor(245, 248, 255);
  doc.roundedRect(10, y, 190, 22, 2, 2, 'F');
  setFont(doc, 8.5, NAVY, 'bold');
  doc.text('Note sur le cadre légal civil et fiscal', 14, y + 6);
  setFont(doc, 7.5, [40, 40, 70]);
  const civilNote = `En droit français, la transmission s'opère selon les règles de la réserve héréditaire (art. 912 et suivants du Code civil) ` +
    `garantissant une part minimale aux enfants. Le conjoint marié ou partenaire de PACS est intégralement exonéré de droits de succession. ` +
    `Les barèmes appliqués sont ceux en vigueur au 1er janvier 2026.`;
  doc.text(doc.splitTextToSize(civilNote, 180), 14, y + 11);

  // ──────────────────────────────────────────────────────────────────────────
  // PAGE 3 — RÉSULTATS DÉTAILLÉS PAR BÉNÉFICIAIRE
  // ──────────────────────────────────────────────────────────────────────────
  y = addPage(doc, 'Résultats détaillés par bénéficiaire & barèmes', 3, TOTAL_PAGES, date);

  // Tableau détaillé des calculs
  setFont(doc, 10, NAVY, 'bold');
  doc.text('Calcul analytique des droits de succession', 10, y + 2);
  y += 6;

  const resultRows = items.map((r, idx) => {
    const label = BENEFICIAIRES_LABELS[r.type] || r.type || `Bénéficiaire ${idx + 1}`;
    const quotePart = r.quotePart || 0;
    const abattement = r.abattementDisponible ?? r.abattementLegal ?? 0;
    const baseTaxable = r.baseTaxable || 0;
    const droits = r.totalDroits || 0;
    const net = r.netFinal ?? (quotePart - droits);
    const tauxEffectif = quotePart > 0 ? (droits / quotePart) : 0;

    return [
      label,
      fmt(quotePart),
      fmt(abattement),
      fmt(baseTaxable),
      fmt(droits),
      fmt(net),
      fmtPct(tauxEffectif)
    ];
  });

  // Ligne de total
  resultRows.push([
    { content: 'TOTAL GÉNÉRAL', styles: { fontStyle: 'bold', fillColor: [...NAVY], textColor: WHITE } },
    { content: fmt(patrimoineTotalGlobal), styles: { halign: 'right', fontStyle: 'bold', fillColor: [...NAVY], textColor: WHITE } },
    { content: '—', styles: { halign: 'center', fillColor: [...NAVY], textColor: WHITE } },
    { content: '—', styles: { halign: 'center', fillColor: [...NAVY], textColor: WHITE } },
    { content: fmt(totalDroits), styles: { halign: 'right', fontStyle: 'bold', fillColor: [...NAVY], textColor: GOLD } },
    { content: fmt(netGlobalTransmis), styles: { halign: 'right', fontStyle: 'bold', fillColor: [...NAVY], textColor: [150, 255, 180] } },
    { content: fmtPct(tauxMoyenGlobal), styles: { halign: 'right', fontStyle: 'bold', fillColor: [...NAVY], textColor: GOLD } }
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Bénéficiaire', 'Part brute', 'Abattement', 'Base taxable', 'Droits dus', 'Net reçu', 'Taux eff.']],
    body: resultRows,
    theme: 'striped',
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { halign: 'right', cellWidth: 26 },
      2: { halign: 'right', cellWidth: 26 },
      3: { halign: 'right', cellWidth: 26 },
      4: { halign: 'right', cellWidth: 26, fontStyle: 'bold' },
      5: { halign: 'right', cellWidth: 28, fontStyle: 'bold' },
      6: { halign: 'right', cellWidth: 23 }
    }
  });

  y = doc.lastAutoTable.finalY + 10;

  // Tableau explicatif des barèmes légaux
  setFont(doc, 10, NAVY, 'bold');
  doc.text('Barèmes fiscaux applicables en 2026', 10, y + 2);
  y += 6;

  const baremesData = [
    ['Ligne directe (Enfants, Parents)', '100 000 € / parent / enfant', 'Barème progressif de 5% (jusqu\'à 8 072 €) à 45% (au-delà de 1 805 677 €)'],
    ['Conjoint marié ou partenaire de PACS', 'Exonération intégrale', '0% (Exonération totale de droits de succession - Loi TEPA 2007)'],
    ['Frères et sœurs', '15 932 €', '35% jusqu\'à 24 430 €, puis 45% au-delà'],
    ['Neveux et nièces', '7 967 €', 'Taux forfaitaire unique de 55%'],
    ['Tiers sans lien de parenté', '1 594 €', 'Taux forfaitaire unique de 60%'],
    ['Assurance-vie avant 70 ans (art. 990 I)', '152 500 € / bénéficiaire', '20% jusqu\'à 700 000 € imposables, puis 31,25% au-delà'],
    ['Assurance-vie après 70 ans (art. 757 B)', '30 500 € (global, tous bénéficiaires)', 'Barème successoral selon le lien de parenté (intérêts exonérés)'],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Lien de parenté / Régime', 'Abattement légal', 'Taux d\'imposition']],
    body: baremesData,
    theme: 'plain',
    styles: { fontSize: 7, cellPadding: 1.8 },
    headStyles: { fillColor: [40, 60, 95], textColor: WHITE, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 50 },
      2: { cellWidth: 80 }
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PAGE 4 — PISTES D'OPTIMISATION & STRATÉGIES PATRIMONIALES
  // ──────────────────────────────────────────────────────────────────────────
  y = addPage(doc, 'Pistes de réflexion & stratégies patrimoniales', 4, TOTAL_PAGES, date);

  setFont(doc, 8.5, GRAY);
  doc.text('Ces pistes sont présentées à titre purement pédagogique pour alimenter votre réflexion avec votre notaire.', 10, y);
  y += 8;

  const optimisations = [
    {
      titre: '1. Anticiper via des donations tous les 15 ans (art. 779 CGI)',
      desc: `Chaque parent peut donner jusqu'à 100 000 € à chaque enfant tous les 15 ans en franchise totale de droits de mutation. ` +
        `Pour un couple avec deux enfants, cela représente 400 000 € transmis sans aucun impôt tous les 15 ans. ` +
        `Anticiper tôt permet de renouveler ces abattements au moins deux ou trois fois au cours d'une vie.`
    },
    {
      titre: '2. Tirer parti des dons familiaux d\'argent (art. 790 G CGI)',
      desc: `En complément des 100 000 €, il est possible de faire don de 31 865 € en argent liquide par enfant ou petit-enfant majeur, ` +
        `sans droits, à condition que le donateur ait moins de 80 ans au jour de la transmission. ` +
        `Ces dons se renouvellent également tous les 15 ans et sont cumulables avec l'abattement ordinaire.`
    },
    {
      titre: '3. Utiliser l\'assurance-vie avant 70 ans (art. 990 I CGI)',
      desc: `Les capitaux versés sur des contrats d'assurance-vie avant l'âge de 70 ans sont transmis hors actif successoral civil ` +
        `et bénéficient d'un abattement spécifique de 152 500 € par bénéficiaire désigné. ` +
        `Ce dispositif permet d'alléger considérablement l'impôt pour les enfants ou de gratifier des tiers avec une fiscalité adoucie.`
    },
    {
      titre: '4. Démembrer la propriété immobilière (art. 669 CGI)',
      desc: `Donner la nue-propriété d'un bien tout en conservant l'usufruit (pour y habiter ou en percevoir les loyers) réduit ` +
        `immédiatement la base taxable au barème viager (ex : 50% de la valeur à 51-60 ans, 60% à 61-70 ans). ` +
        `Au décès de l'usufruitier, le nu-propriétaire devient plein propriétaire sans aucun impôt supplémentaire.`
    },
    {
      titre: '5. Transmission d\'entreprise : le Pacte Dutreil (art. 787 B CGI)',
      desc: `Pour les dirigeants d'entreprise, la mise en place d'un engagement de conservation des titres (Pacte Dutreil) ` +
        `permet d'exonérer 75% de la valeur de l'entreprise de droits de mutation à titre gratuit, ` +
        `sous réserve du respect des conditions de durée de détention et de fonction de direction.`
    }
  ];

  for (const opt of optimisations) {
    if (y > 260) {
      y = addPage(doc, 'Pistes de réflexion (suite)', 4, TOTAL_PAGES, date);
    }
    doc.setFillColor(245, 248, 255);
    doc.roundedRect(10, y, 190, 5, 1, 1, 'F');
    setFont(doc, 9, NAVY, 'bold');
    doc.text(opt.titre, 13, y + 4);
    y += 8;
    setFont(doc, 8, [50, 50, 50]);
    const lines = doc.splitTextToSize(opt.desc, 183);
    doc.text(lines, 13, y);
    y += lines.length * 3.8 + 4;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PAGE 5 — AVERTISSEMENTS & DISCLAIMER JURIDIQUE
  // ──────────────────────────────────────────────────────────────────────────
  y = addPage(doc, 'Avertissements légaux & mentions', 5, TOTAL_PAGES, date);

  doc.setFillColor(255, 240, 230);
  doc.roundedRect(10, y, 190, 12, 2, 2, 'F');
  doc.setDrawColor(200, 80, 0);
  doc.setLineWidth(1);
  doc.roundedRect(10, y, 190, 12, 2, 2, 'S');
  setFont(doc, 10, [180, 60, 0], 'bold');
  doc.text('AVERTISSEMENT : CE DOCUMENT EST EXCLUSIVEMENT PÉDAGOGIQUE', 105, y + 8, { align: 'center' });
  y += 18;

  const disclaimerBlocks = [
    {
      titre: '1. Outil informatif — aucun conseil juridique ou fiscal',
      texte: `"Passez à la caisse" est une initiative citoyenne libre et gratuite dont l'objectif est de vulgariser les mécanismes ` +
        `de la fiscalité successorale française. Ce rapport d'estimation ne constitue en aucun cas une consultation juridique, ` +
        `un conseil fiscal ou une préconisation d'investissement. Chaque patrimoine est unique et soumis à des règles spécifiques ` +
        `(régime matrimonial, clauses bénéficiaires, donations antérieures de moins de 15 ans, récompenses entre époux).`
    },
    {
      titre: '2. Consultation obligatoire d\'un notaire',
      texte: `Toute transmission de patrimoine, rédaction de testament, donation ou aménagement de régime matrimonial ` +
        `doit obligatoirement être validée auprès d'un notaire ou d'un avocat spécialisé en droit des successions. ` +
        `Seul un officier ministériel assermenté peut garantir la validité civile et fiscale de vos actes.`
    },
    {
      titre: '3. Confidentialité & respect des données',
      texte: `Cette simulation est calculée localement dans votre navigateur web. Aucune coordonnée, aucun nom et aucun montant ` +
        `saisi ne sont stockés sur nos serveurs ni transmis à un tiers ou à l'administration fiscale.`
    },
    {
      titre: '4. Le mot de M. Jean-Luc Chat',
      texte: `"Si ces calculs vous paraissent élevés, rassurez-vous : il est souvent possible d'alléger la note en s'y prenant tôt. ` +
        `Prenez rendez-vous avec votre notaire dès cette semaine. Et souvenez-vous : mieux vaut organiser sa transmission de son vivant ` +
        `que de laisser vos héritiers seuls face à la machine de Bercy !" — M. Jean-Luc Chat, Inspecteur Principal DGFIP (retraite)`
    }
  ];

  for (const block of disclaimerBlocks) {
    if (y > 260) break;
    setFont(doc, 8.5, NAVY, 'bold');
    doc.text(block.titre, 10, y);
    y += 5;
    setFont(doc, 8, [50, 50, 50]);
    const lines = doc.splitTextToSize(block.texte, 186);
    doc.text(lines, 10, y);
    y += lines.length * 3.8 + 5;
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
    doc.text('Pour toute remarque, signalement d\'erreur ou contact : contact@passezalacaisse.org', 14, y + 11);
  }

  // Téléchargement
  const filename = `bilan-succession-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

export default exportToPDF;

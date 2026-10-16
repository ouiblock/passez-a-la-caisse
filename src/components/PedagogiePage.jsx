import { useState } from 'react';
import { Home, BookOpen, ExternalLink, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Card } from './ui/Card';

export function PedagogiePage({ onBack }) {
  const [activeTab, setActiveTab] = useState('decryptage'); // 'decryptage' or 'faq'

  const sections = [
    {
      id: 'tva',
      title: 'TVA & consommation',
      icon: '🛒',
      content: {
        definition: "La TVA (Taxe sur la Valeur Ajoutée) est un impôt indirect sur la consommation. Elle est payée par le consommateur final mais collectée par les entreprises.",
        calcul: "Nous utilisons un taux effectif moyen de 16,5% sur votre consommation mensuelle. Ce taux résulte d'un panier mixte : 60% à 20% (taux normal), 25% à 10% (taux intermédiaire), 15% à 5,5% (taux réduit). Il reste conforme aux règles en vigueur pour 2026.",
        variation: "Votre TVA varie selon vos habitudes : plus d'alimentation = moins de TVA (5,5%), plus de biens manufacturés = plus de TVA (20%).",
        sources: [
          { label: "Service-Public.fr - La TVA", url: "https://www.service-public.fr/particuliers/vosdroits/F23567" },
          { label: "impots.gouv.fr - Taux de TVA", url: "https://www.impots.gouv.fr/portail/particulier/questions/quels-sont-les-taux-de-tva-en-vigueur" }
        ]
      }
    },
    {
      id: 'cotisations',
      title: 'Cotisations sociales',
      icon: '💼',
      content: {
        definition: "Les cotisations sociales financent la protection sociale (santé, retraite, chômage, famille). Elles sont prélevées sur les salaires (part salariale ~22%) et payées par l'employeur (part patronale ~42%).",
        calcul: "Nous calculons les cotisations sur votre salaire brut reconstitué, en appliquant les taux moyens de la sécurité sociale révisés pour 2026. Les cotisations patronales sont invisibles sur votre fiche de paie mais font partie du coût total du travail.",
        variation: "Les taux varient selon votre statut (cadre/non-cadre), votre salaire (plafonnement de la sécurité sociale), et votre secteur d'activité.",
        sources: [
          { label: "URSSAF - Taux de cotisations", url: "https://www.urssaf.fr/portail/home/taux-et-baremes.html" },
          { label: "Service-Public.fr - Cotisations salariales", url: "https://www.service-public.fr/particuliers/vosdroits/F2302" }
        ]
      }
    },
    {
      id: 'impot-revenu',
      title: 'Impôt sur le revenu',
      icon: '📊',
      content: {
        definition: "L'impôt sur le revenu est progressif : plus vous gagnez, plus le taux marginal augmente. Il est calculé par tranches (0%, 11%, 30%, 41%, 45%) et tient compte du quotient familial et de l'abattement forfaitaire de 10%.",
        calcul: "Méthode de calcul officielle appliquée : 1) Abattement forfaitaire automatique de 10% pour frais professionnels ou pensions (revenu imposable = revenu net × 0,90). 2) Quotient familial : division du revenu imposable par le nombre de parts (1 part célibataire, 2 parts couple, +0,5 part pour les 2 premiers enfants, +1 part dès le 3ème). 3) Barème officiel 2026 par part : 0% jusqu'à 11 600 €, 11% de 11 601 € à 29 579 €, 30% de 29 580 € à 84 577 €, 41% de 84 578 € à 181 917 €, 45% au-delà. 4) Multiplication par le nombre de parts. Pour la simulation vie entière (passé et futur), ce barème 2026 étalon est appliqué en euros constants, en cohérence avec la pratique législative de réindexation annuelle des seuils sur l'inflation.",
        variation: "Votre impôt annuel s'adapte à chaque étape de votre vie : progression salariale durant la carrière, passage à la pension de retraite, et composition du foyer fiscal.",
        sources: [
          { label: "impots.gouv.fr - Barème de l'IR 2026", url: "https://www.impots.gouv.fr/particulier/bareme-de-limpot-sur-le-revenu" },
          { label: "Service-Public.fr - Quotient familial", url: "https://www.service-public.fr/particuliers/vosdroits/F2705" }
        ]
      }
    },
    {
      id: 'energie',
      title: 'Taxes sur l\'énergie',
      icon: '⚡',
      content: {
        definition: "Les taxes sur l'énergie comprennent la TICPE (carburants), la TICFE (électricité), la TICGN (gaz), plus la TVA. Elles représentent environ 60% du prix du carburant, 35% de l'électricité, et 30% du gaz.",
        calcul: "Nous estimons vos dépenses énergétiques annuelles et appliquons les parts de taxes correspondantes conformément aux niveaux stabilisés pour 2026. Pour les carburants, nous calculons selon votre kilométrage et type de véhicule.",
        variation: "Les taxes varient selon les prix de l'énergie, votre consommation, et les évolutions réglementaires de l'accise sur les énergies.",
        sources: [
          { label: "Ministère de la Transition Écologique", url: "https://www.ecologie.gouv.fr/" },
          { label: "CRE - Commission de régulation de l'énergie", url: "https://www.cre.fr/" }
        ]
      }
    },
    {
      id: 'logement',
      title: 'Logement (notaire & taxe foncière)',
      icon: '🏠',
      content: {
        definition: "Les frais de notaire (droits de mutation) représentent ~8% du prix d'un bien ancien (~3% pour le neuf). La taxe foncière est un impôt local annuel sur la propriété.",
        calcul: "Nous appliquons 8% sur le prix d'achat de votre résidence principale et secondaire. La taxe foncière 2026 est estimée à 1 200€/an en moyenne, avec une évolution de +2%/an.",
        variation: "Les frais de notaire varient selon l'ancien/neuf. La taxe foncière dépend de votre commune, de la valeur locative cadastrale, et des taux votés localement.",
        sources: [
          { label: "Service-Public.fr - Frais de notaire", url: "https://www.service-public.fr/particuliers/vosdroits/F16142" },
          { label: "impots.gouv.fr - Taxe foncière", url: "https://www.impots.gouv.fr/portail/particulier/la-taxe-fonciere" }
        ]
      }
    },
    {
      id: 'retraite',
      title: 'Prélèvements sociaux sur la retraite',
      icon: '🏖️',
      content: {
        definition: "Les pensions de retraite sont soumises à des prélèvements sociaux : CSG (8,3% taux normal), CRDS (0,5%), CASA (0,3%), soit 9,1% au total.",
        calcul: "Nous estimons votre pension à 70% de votre dernier salaire brut et appliquons le taux de 9,1% de prélèvements sociaux en vigueur pour la retraite sous la Loi de Finances 2026.",
        variation: "Le taux de CSG varie selon votre revenu fiscal de référence (RFR) : exonération complète, taux réduit (3,8%), taux médian (6,6%) ou taux normal (8,3%).",
        sources: [
          { label: "Service-Public.fr - Prélèvements retraite", url: "https://www.service-public.fr/particuliers/vosdroits/F2329" },
          { label: "Assurance Retraite", url: "https://www.lassuranceretraite.fr/" }
        ]
      }
    },
    {
      id: 'succession',
      title: 'Droits de succession',
      icon: '⏳',
      content: {
        definition: "Les droits de succession sont calculés sur la part nette reçue par chaque héritier, après application des abattements selon le lien de parenté.",
        calcul: "Abattements 2026 : conjoint/PACS exonéré, enfant 100 000€, petit-enfant 1 594€, frère/sœur 15 932€. Le barème est progressif : de 5% à 45% en ligne directe, 35% à 45% entre frères/sœurs, 55% ou 60% pour les autres.",
        variation: "Les droits varient selon le lien de parenté, les donations antérieures (rappel fiscal de 15 ans réactivé en 2026), et l'assurance-vie (fiscalité spécifique dépendante de l'âge de versement).",
        sources: [
          { label: "impots.gouv.fr - Droits de succession", url: "https://www.impots.gouv.fr/portail/particulier/les-droits-de-succession" },
          { label: "Service-Public.fr - Barème succession", url: "https://www.service-public.fr/particuliers/vosdroits/F14198" }
        ]
      }
    }
  ];

  const faqs = [
    {
      q: "Qui porte le projet \"Passez à la caisse\" ?",
      a: "Ce projet est porté de façon bénévole par un collectif citoyen anonyme. Sans aucune affiliation politique ni ambition commerciale, notre seul objectif est d'offrir une transparence fiscale totale aux citoyens. L'anonymat protège l'indépendance de la démarche, et le code source de l'application est 100% libre et auditable."
    },
    {
      q: "Qu'est-ce qui change avec la Loi de Finances 2026 (LFi 2026) ?",
      a: "La Loi de Finances 2026 introduit plusieurs réajustements clés : \n1. Une réindexation des tranches de l'impôt sur le revenu de +0,9% pour protéger le pouvoir d'achat face à l'inflation.\n2. La hausse de la Flat Tax (PFU) à 31,4% pour les comptes titres (CTO), dividendes et obligations via la hausse des prélèvements sociaux de 17,2% à 18,6%.\n3. Le maintien des prélèvements sociaux à 17,2% pour l'assurance-vie, les PEA et les revenus fonciers.\n4. La fixation de la CSG sur les pensions de retraite à 8,3% au taux normal (9,1% de prélèvements sociaux globaux)."
    },
    {
      q: "Comment installer cette application sur mon ordinateur ou mon smartphone ?",
      a: "Notre calculateur est une Progressive Web App (PWA). Elle s'installe localement en quelques secondes pour fonctionner hors-ligne, sans consommer de réseau : \n- Sur Ordinateur (Chrome, Edge, Brave) : Cliquez sur l'icône de téléchargement présente dans votre barre d'adresse à droite, ou ouvrez le menu et cliquez sur 'Installer'.\n- Sur iPhone / iPad (Safari) : Appuyez sur l'icône de partage (carré avec une flèche vers le haut), faites défiler le menu vers le bas et sélectionnez 'Sur l'écran d'accueil'.\n- Sur Android (Chrome) : Appuyez sur les trois points en haut à droite, puis sélectionnez 'Ajouter à l'écran d'accueil' ou 'Installer l'application'."
    },
    {
      q: "Mes données financières sont-elles stockées ou vendues ?",
      a: "Absolument pas. L'application est statique et s'exécute intégralement dans votre navigateur web. Vos saisies (revenus, âges, patrimoines) ne sont envoyées à aucun serveur et ne quittent jamais votre appareil. Vos données restent 100% privées."
    },
    {
      q: "Quelle est votre politique sur les cookies ?",
      a: "Nous appliquons une politique stricte de 'cookies minimum vital'. Le site ne dépose aucun cookie publicitaire, tracker ou outil analytique tiers. Nous utilisons uniquement la mémoire locale de votre navigateur (localStorage) pour des fonctions techniques indispensables : mémoriser votre acceptation des conditions de l'outil et conserver le calculateur choisi d'une visite à l'autre."
    },
    {
      q: "Comment contacter l'équipe du projet ?",
      a: "Vous pouvez nous adresser vos questions, suggestions ou signalements par courriel à l'adresse : unbilletpourbercy@proton.me. Nous répondons avec plaisir à toutes les contributions citoyennes."
    }
  ];

  return (
    <div className="relative min-h-screen bg-navy text-white overflow-x-hidden">
      {/* Bouton retour accueil */}
      <button
        onClick={onBack}
        className="absolute top-3 left-3 sm:top-4 sm:left-4 z-40 flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-650 cursor-pointer shadow-lg text-sm"
      >
        <Home className="w-4 h-4 text-gold" />
        <span className="hidden sm:inline">Retour à l'accueil</span>
      </button>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* En-tête */}
        <div className="text-center mb-10 mt-12 animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/25 border border-gold mb-4">
            <BookOpen className="w-8 h-8 text-gold" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            Pédagogie & FAQ Citoyenne
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Comprenez le fonctionnement de nos calculateurs et découvrez vos droits sous les règles de la Loi de Finances 2026.
          </p>
        </div>

        {/* Navigation par Onglets */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('decryptage')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'decryptage'
                ? 'bg-gold text-navy shadow-lg shadow-gold/15'
                : 'bg-navy-light text-slate-350 hover:bg-navy-lighter hover:text-white border border-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            Décryptage par Impôt
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'faq'
                ? 'bg-gold text-navy shadow-lg shadow-gold/15'
                : 'bg-navy-light text-slate-350 hover:bg-navy-lighter hover:text-white border border-white/5'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            FAQ Citoyenne
          </button>
        </div>

        {/* Contenu Onglet 1 : Décryptage */}
        {activeTab === 'decryptage' && (
          <div className="space-y-8 animate-fade-up">
            {/* Sommaire */}
            <Card className="p-6 bg-gradient-to-br from-navy-light to-navy-lighter border border-white/10 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>📑</span> Sommaire de décryptage
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-3 p-3 bg-navy/40 rounded-lg hover:bg-navy-lighter hover:border-gold/30 border border-white/5 transition-all text-xs font-semibold text-slate-305 hover:text-white"
                  >
                    <span className="text-xl">{section.icon}</span>
                    <span>{section.title}</span>
                  </a>
                ))}
              </div>
            </Card>

            {/* Sections détaillées */}
            <div className="space-y-8">
              {sections.map((section) => (
                <Card key={section.id} id={section.id} className="p-8 scroll-mt-20 border border-white/10 bg-navy-light/40">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">{section.icon}</span>
                    <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-gold uppercase tracking-wider mb-2">Ce que c'est</h3>
                      <p className="text-sm text-slate-300 leading-relaxed">{section.content.definition}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-gold uppercase tracking-wider mb-2">Comment nous calculons</h3>
                      <p className="text-sm text-slate-300 leading-relaxed">{section.content.calcul}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-gold uppercase tracking-wider mb-2">Ce qui peut faire varier le calcul</h3>
                      <p className="text-sm text-slate-300 leading-relaxed">{section.content.variation}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-gold uppercase tracking-wider mb-2.5">Sources et références officielles</h3>
                      <div className="flex flex-col gap-2">
                        {section.content.sources.map((source, index) => (
                          <a
                            key={index}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors w-fit"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{source.label}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Contenu Onglet 2 : FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-6 animate-fade-up">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6 border border-white/10 bg-navy-light/30">
                <h3 className="text-lg font-bold text-white mb-3 flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed pl-7.5 whitespace-pre-line">
                  {faq.a}
                </p>
              </Card>
            ))}
          </div>
        )}

        {/* Note de méthodologie générale */}
        <Card className="p-6 mt-8 bg-blue-950/20 border border-blue-900/50 shadow-md">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <span>💡</span> Méthodologie générale 2026
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Toutes nos estimations sont basées sur des hypothèses simplifiées et des données statistiques moyennes (INSEE, impots.gouv.fr, URSSAF) adaptées à la législation 2026. Elles visent à donner un ordre de grandeur représentatif et pédagogique, pas un calcul fiscal au centime près.
          </p>
          <p className="text-[11px] text-slate-450">
            Pour toute étude personnalisée de votre patrimoine, le recours à un notaire ou un conseiller en gestion de patrimoine est fortement recommandé.
          </p>
        </Card>

        {/* Bouton bas de page */}
        <div className="mt-12 text-center">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold hover:bg-gold-light text-navy font-bold rounded-lg transition-colors cursor-pointer text-sm shadow-md"
          >
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}

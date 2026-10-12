import { Home, ExternalLink, BookOpen, FileText } from 'lucide-react';
import { Card } from './ui/Card';

export function SourcesPage({ onBack }) {
  const sources = [
    {
      categorie: 'Cotisations Sociales',
      icon: '💼',
      items: [
        {
          titre: 'URSSAF - Taux de cotisations 2026',
          url: 'https://www.urssaf.fr/portail/home/taux-et-baremes/taux-de-cotisations.html',
          description: 'Taux officiels des cotisations salariales et patronales en vigueur'
        },
        {
          titre: 'Simulateur URSSAF 2026',
          url: 'https://mon-entreprise.urssaf.fr/',
          description: 'Calculateur officiel Net → Brut → Coût employeur'
        },
        {
          titre: 'AGIRC-ARRCO - Retraite complémentaire',
          url: 'https://www.agirc-arrco.fr/particuliers/comprendre-retraite-complementaire/calcul-retraite/taux-cotisation/',
          description: 'Taux de cotisation retraite complémentaire révisés'
        }
      ]
    },
    {
      categorie: 'Impôt sur le Revenu',
      icon: '📊',
      items: [
        {
          titre: 'Ministère de l\'Économie / Impots.gouv.fr - Barème de l\'IR 2026',
          url: 'https://www.impots.gouv.fr/particulier/bareme-de-limpot-sur-le-revenu',
          description: 'Barème officiel 2026 (revenus 2025) : 0% (≤11 600€), 11% (11 601-29 579€), 30% (29 580-84 577€), 41% (84 578-181 917€), 45% (>181 917€) avec abattement forfaitaire de 10%'
        },
        {
          titre: 'Service-Public.fr - Quotient familial & Abattement 10%',
          url: 'https://www.service-public.fr/particuliers/vosdroits/F2705',
          description: 'Règles du quotient familial (parts du foyer) et déduction forfaitaire automatique de 10% pour frais pro/pensions'
        },
        {
          titre: 'Simulateur officiel impots.gouv.fr',
          url: 'https://www.impots.gouv.fr/simulateur-de-calcul',
          description: 'Simulateur officiel du Ministère de l\'Économie pour vérifier le calcul de l\'impôt sur le revenu'
        }
      ]
    },
    {
      categorie: 'TVA & Consommation',
      icon: '🛒',
      items: [
        {
          titre: 'Service-Public.fr - Taux de TVA',
          url: 'https://www.service-public.fr/particuliers/vosdroits/F23567',
          description: 'Taux de TVA en vigueur (20%, 10%, 5.5%, 2.1%)'
        },
        {
          titre: 'Impots.gouv.fr - La TVA',
          url: 'https://www.impots.gouv.fr/particulier/questions/quels-sont-les-taux-de-tva-en-vigueur',
          description: 'Détail des taux de TVA par catégorie de produits'
        }
      ]
    },
    {
      categorie: 'Taxes Énergie',
      icon: '⚡',
      items: [
        {
          titre: 'Ministère de la Transition Écologique',
          url: 'https://www.ecologie.gouv.fr/fiscalite-des-energies',
          description: 'TICPE (carburants), TICFE (électricité), TICGN (gaz) et taxe carbone'
        },
        {
          titre: 'CRE - Commission de régulation de l\'énergie',
          url: 'https://www.cre.fr/Electricite/Reseaux-d-electricite/tarifs-d-acces-aux-reseaux',
          description: 'Composition des factures d\'électricité et de gaz'
        }
      ]
    },
    {
      categorie: 'Logement',
      icon: '🏠',
      items: [
        {
          titre: 'Service-Public.fr - Frais de notaire',
          url: 'https://www.service-public.fr/particuliers/vosdroits/F16142',
          description: 'Droits de mutation et frais d\'acquisition immobilière 2026'
        },
        {
          titre: 'Impots.gouv.fr - Taxe foncière',
          url: 'https://www.impots.gouv.fr/particulier/la-taxe-fonciere',
          description: 'Calcul et taux de la taxe foncière nationale et locale'
        }
      ]
    },
    {
      categorie: 'Placements & Patrimoine',
      icon: '💰',
      items: [
        {
          titre: 'Impots.gouv.fr - Flat tax (PFU 2026)',
          url: 'https://www.impots.gouv.fr/particulier/le-prelevement-forfaitaire-unique-pfu',
          description: 'Prélèvement Forfaitaire Unique relevé à 31,4% (12.8% IR + 18.6% prélèvements sociaux) sur CTO, dividendes et intérêts'
        },
        {
          titre: 'Impots.gouv.fr - IFI',
          url: 'https://www.impots.gouv.fr/particulier/limpot-sur-la-fortune-immobiliere',
          description: 'Impôt sur la Fortune Immobilière - Barème et calcul en vigueur'
        }
      ]
    },
    {
      categorie: 'Droits de Succession',
      icon: '⏳',
      items: [
        {
          titre: 'Impots.gouv.fr - Droits de succession 2026',
          url: 'https://www.impots.gouv.fr/particulier/les-droits-de-succession',
          description: 'Barème, abattements parentaux et calcul des droits de succession'
        },
        {
          titre: 'Service-Public.fr - Barème succession',
          url: 'https://www.service-public.fr/particuliers/vosdroits/F14198',
          description: 'Taux de taxation selon le degré de parenté'
        },
        {
          titre: 'Notaires de France',
          url: 'https://www.notaires.fr/fr/donation-succession',
          description: 'Guide pratique et légal sur les donations et successions'
        }
      ]
    },
    {
      categorie: 'Retraite',
      icon: '🏖️',
      items: [
        {
          titre: 'Service-Public.fr - Prélèvements retraite 2026',
          url: 'https://www.service-public.fr/particuliers/vosdroits/F2329',
          description: 'CSG (8,3% au taux normal), CRDS (0,5%) et CASA (0,3%) sur les pensions de retraite'
        },
        {
          titre: 'L\'Assurance Retraite',
          url: 'https://www.lassuranceretraite.fr/',
          description: 'Calcul, conditions d\'âge et simulation de la pension de retraite'
        }
      ]
    },
    {
      categorie: 'Données Statistiques',
      icon: '📈',
      items: [
        {
          titre: 'INSEE - Revenus et salaires',
          url: 'https://www.insee.fr/fr/statistiques/zones/revenus-salaires',
          description: 'Statistiques nationales sur les revenus médians'
        },
        {
          titre: 'INSEE - Espérance de vie',
          url: 'https://www.insee.fr/fr/statistiques/esperance-de-vie',
          description: 'Tables de mortalité et espérance de vie résiduelle'
        },
        {
          titre: 'Budget de l\'État',
          url: 'https://www.budget.gouv.fr/',
          description: 'Lois de finances et répartition des prélèvements obligatoires'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-navy text-white">
      {/* Bouton retour accueil */}
      <button
        onClick={onBack}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-655 cursor-pointer shadow-lg text-sm"
      >
        <Home className="w-4 h-4 text-gold" />
        <span className="hidden sm:inline">Retour à l'accueil</span>
      </button>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* En-tête */}
        <div className="text-center mb-10 mt-12 animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/25 border border-gold mb-4">
            <FileText className="w-8 h-8 text-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Sources & Références
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Tous nos calculs sont basés sur des sources officielles, transparentes et vérifiables.
          </p>
        </div>

        {/* Note méthodologique */}
        <Card className="p-6 mb-8 bg-blue-950/20 border border-blue-900/50 shadow-md">
          <div className="flex items-start gap-4">
            <BookOpen className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-blue-100 mb-3">
                Méthodologie & Transparence
              </h3>
              <p className="text-sm text-slate-300 mb-3 leading-relaxed">
                Tous les barèmes, taux et hypothèses de calcul utilisés proviennent directement de sources institutionnelles officielles françaises (administrations fiscales, organismes de sécurité sociale et INSEE).
              </p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>✓ <strong>Barèmes 2026</strong> : Intégration complète de la Loi de Finances 2026 (indexation IR, hausse PFU).</li>
                <li>✓ <strong>Calculs vérifiés</strong> : Alignés sur les simulateurs officiels (URSSAF, impots.gouv.fr).</li>
                <li>✓ <strong>Code source ouvert</strong> : Formules documentées et auditables librement.</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Liste des sources par catégorie */}
        <div className="space-y-6">
          {sources.map((categorie, index) => (
            <Card key={index} className="p-6 border border-white/10 bg-navy-light/30">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-2xl">{categorie.icon}</span>
                {categorie.categorie}
              </h2>
              
              <div className="space-y-3">
                {categorie.items.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-navy/40 hover:bg-navy-light/60 rounded-lg border border-white/5 hover:border-gold/30 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <ExternalLink className="w-4 h-4 text-gold flex-shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-white mb-1 group-hover:text-gold transition-colors">
                          {source.titre}
                        </h3>
                        <p className="text-xs text-slate-350 leading-relaxed">
                          {source.description}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 break-all select-all">
                          {source.url}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Documentation technique */}
        <Card className="p-6 mt-8 bg-gradient-to-br from-navy-light to-navy-lighter border border-white/10 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-4">
            📚 Documentation Technique
          </h3>
          <p className="text-sm text-slate-300 mb-4 leading-relaxed">
            Consultez nos notes d'audit technique et fiscalités archivées pour vérifier nos formules :
          </p>
          <div className="space-y-2">
            <div className="p-3 bg-navy/40 rounded-lg border border-white/5">
              <p className="text-xs text-slate-350">
                <strong className="text-white">AUDIT_COTISATIONS_SOCIALES.md</strong> - 
                Décomposition complète Net → Brut → Super-Brut avec sources URSSAF
              </p>
            </div>
            <div className="p-3 bg-navy/40 rounded-lg border border-white/5">
              <p className="text-xs text-slate-350">
                <strong className="text-white">AUDIT_CALCULS_VIE_ENTIERE.md</strong> - 
                Validation de tous les calculs fiscaux avec exemples chiffrés
              </p>
            </div>
            <div className="p-3 bg-navy/40 rounded-lg border border-white/5">
              <p className="text-xs text-slate-350">
                <strong className="text-white">EQUIVALENCES_PEDAGOGIQUES.md</strong> - 
                Méthodologie des équivalences en prestations et services publics
              </p>
            </div>
          </div>
        </Card>

        {/* Disclaimer */}
        <Card className="p-6 mt-8 bg-yellow-950/10 border border-yellow-900/30">
          <h3 className="text-base font-bold text-yellow-200 mb-3">
            ⚠️ Avertissement Important
          </h3>
          <p className="text-xs text-slate-300 mb-2 leading-relaxed font-medium">
            Malgré notre rigueur et l'utilisation de sources officielles, ce calculateur reste un outil pédagogique produisant des estimations.
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4 leading-relaxed">
            <li>Les situations personnelles complexes peuvent nécessiter des règles d'exonération spécifiques non modélisées.</li>
            <li>Les barèmes officiels et lois fiscales sont sujets à modification lors des votes de budgets rectificatifs.</li>
            <li>Pour toute décision patrimoniale lourde, référez-vous à un professionnel (notaire ou avocat fiscaliste).</li>
          </ul>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold hover:bg-gold-light text-navy font-bold rounded-lg transition-colors cursor-pointer text-sm shadow-md"
          >
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </button>
        </div>

        <div className="mt-8 text-center text-slate-500 text-xs">
          <p>© 2025-2026 Passez à la caisse - Outil citoyen et pédagogique indépendant</p>
          <p className="mt-2">Mise à jour des sources : Loi de Finances 2026 (Janvier 2026)</p>
        </div>
      </div>
    </div>
  );
}

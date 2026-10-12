import { X, ShieldAlert, Scale, Lock, EyeOff } from 'lucide-react';

export function CguModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-navy-light border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-navy-lighter/30">
          <div className="flex items-center gap-2 text-gold">
            <Scale className="w-5 h-5" />
            <h2 className="text-xl font-bold text-white">Conditions Générales d'Utilisation</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300 leading-relaxed scrollbar-thin">
          
          {/* Section 1: DISCLAIMER FISCAL CRITIQUE */}
          <div className="p-5 border border-red-500/20 bg-red-950/10 rounded-xl">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-extrabold text-red-200 uppercase tracking-wide mb-2">
                  ⚠️ AVERTISSEMENT FISCAL MAJEUR (DISCLAIMER)
                </h3>
                <p className="text-xs text-slate-350 leading-relaxed">
                  <strong>Passez à la caisse</strong> est un simulateur à vocation exclusivement pédagogique et d'information générale. 
                  Il ne constitue en aucun cas un outil de conseil personnalisé, de consultation fiscale, juridique ou de gestion de patrimoine.
                </p>
                <ul className="list-disc pl-4 mt-2 space-y-1.5 text-xs text-slate-400">
                  <li><strong>Aucune Garantie :</strong> Les barèmes, formules et taux appliqués (notamment ceux liés à la Loi de Finances 2026) sont des modélisations simplifiées et peuvent comporter des inexactitudes, des omissions ou des bugs.</li>
                  <li><strong>Exclusion de Responsabilité :</strong> Le collectif citoyen anonyme portant ce projet décline toute responsabilité quant aux conséquences d'éventuelles erreurs de calcul. L'utilisation de cet outil et de ses résultats se fait à vos risques et périls.</li>
                  <li><strong>Consultez un Professionnel :</strong> Avant toute décision d'investissement, de donation, de structuration de patrimoine ou de déclaration d'impôts, vous devez impérativement solliciter l'avis d'un professionnel qualifié (notaire, avocat fiscaliste, conseiller en gestion de patrimoine).</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Objet de l'outil */}
          <div>
            <h3 className="font-bold text-white mb-2">1. Objet du simulateur</h3>
            <p>
              Le site propose deux moteurs de calcul : une estimation de la fiscalité globale sur une vie entière et une simulation des droits de succession et donations. L'objectif est d'aider les citoyens à appréhender les ordres de grandeur de la fiscalité française et d'encourager la compréhension des mécanismes fiscaux en vigueur pour l'année 2026.
            </p>
          </div>

          {/* Section 3: Statut Bêta & Bug */}
          <div>
            <h3 className="font-bold text-white mb-2">2. Statut Bêta et Limites Techniques</h3>
            <p>
              L'application est fournie en version Bêta. Elle est sujette à des modifications fréquentes et peut présenter des dysfonctionnements, des ralentissements ou des erreurs d'affichage. Les utilisateurs sont invités à signaler tout comportement anormal du simulateur.
            </p>
          </div>

          {/* Section 4: Respect de la Vie Privée */}
          <div>
            <h3 className="font-bold text-white mb-2">3. Protection des Données Personnelles</h3>
            <div className="flex items-start gap-2 bg-blue-950/15 p-3 rounded-lg border border-blue-900/30 text-xs">
              <Lock className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Zéro collecte :</strong> Aucune de vos données financières, personnelles ou de simulation n'est transmise à un serveur ou vendue à des tiers. Tous les calculs s'effectuent localement dans votre propre navigateur.
              </p>
            </div>
          </div>

          {/* Section 5: Cookies */}
          <div>
            <h3 className="font-bold text-white mb-2">4. Politique de Cookies minimum vitaux</h3>
            <p>
              Ce site n'utilise aucun cookie publicitaire ni aucun traceur tiers. L'usage du stockage local (`localStorage`) est strictement restreint au stockage technique des préférences de l'utilisateur (mémorisation de l'acceptation des conditions et du calculateur choisi).
            </p>
          </div>

          {/* Section 6: Liens Externes */}
          <div>
            <h3 className="font-bold text-white mb-2">5. Liens vers des tiers (Sources)</h3>
            <p>
              L'outil propose des liens vers des ressources externes (telles que les sources officielles). Ces recommandations sont faites à titre informatif et citoyen, sans aucun but ou accord commercial. Le collectif n'exerce aucun contrôle sur ces services tiers et ne saurait être tenu responsable de leur contenu ou de leur sécurité.
            </p>
          </div>

          {/* Section 7: Propriété intellectuelle */}
          <div>
            <h3 className="font-bold text-white mb-2">6. Code source libre</h3>
            <p>
              Le code source de l'application est ouvert et sous licence libre. Il peut être audité, copié ou modifié conformément aux termes de sa licence, garantissant une transparence démocratique totale.
            </p>
          </div>

          {/* Section 8: Contact */}
          <div>
            <h3 className="font-bold text-white mb-2">7. Contact & Collaboration</h3>
            <p>
              Pour toute demande de contact, signalement de bug, proposition d'amélioration ou de collaboration, vous pouvez joindre l'équipe citoyenne à l'adresse suivante : <a href="mailto:unbilletpourbercy@proton.me" className="text-gold underline hover:text-gold-light">unbilletpourbercy@proton.me</a>
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-navy-lighter/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gold hover:bg-gold-light text-navy font-bold rounded-lg transition-colors cursor-pointer text-xs"
          >
            Fermer les CGU
          </button>
        </div>
      </div>
    </div>
  );
}

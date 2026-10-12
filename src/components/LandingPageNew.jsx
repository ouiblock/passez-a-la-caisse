import { useState } from 'react';
import { Calculator, TrendingUp, BookOpen, Shield, Lock, Eye, FileText, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';
import { StatsCounter } from './StatsCounter';

export function LandingPageNew({ onSelectCalculator, onOpenCgu }) {
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);  return (
    <div className="min-h-screen bg-navy text-white font-sans overflow-x-hidden">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      <div className="relative container mx-auto px-4 py-8 md:py-16 max-w-5xl">
        
        {/* ── Hero Section ── */}
        <header className="flex flex-col items-center text-center mb-16 animate-fade-up">


          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight">
            Découvrez combien l'État vous prendra <br className="hidden md:block"/>
            <span className="text-gold-gradient">(vraiment)</span> au cours de votre vie.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Le simulateur fiscal gratuit et 100% anonyme qui vous dit la vérité sur vos prélèvements obligatoires : TVA, cotisations, IR, taxes locales, et droits de succession.
          </p>

          <div className="flex flex-col items-center justify-center gap-6 mb-6">
            <label className="flex items-start gap-3 cursor-pointer p-4 bg-navy-light/40 border border-white/10 rounded-xl hover:border-gold/30 transition-colors max-w-2xl text-left">
              <input 
                type="checkbox" 
                checked={disclaimerChecked}
                onChange={(e) => setDisclaimerChecked(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-white/20 bg-navy text-gold focus:ring-gold/50 cursor-pointer"
              />
              <span className="text-sm text-slate-300 leading-relaxed">
                Je comprends que ce simulateur est un outil <strong>pédagogique</strong>. Il ne s'agit pas d'un conseil fiscal. J'accepte les <button onClick={(e) => { e.preventDefault(); onOpenCgu(); }} className="underline text-gold hover:text-gold-light">conditions d'utilisation (CGU)</button>.
              </span>
            </label>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Button
                variant="primary"
                size="xl"
                disabled={!disclaimerChecked}
                onClick={() => onSelectCalculator('lifetime')}
                className={`w-full sm:w-auto text-lg px-8 py-4 ${disclaimerChecked ? 'shadow-[0_0_40px_rgba(184,149,90,0.3)] hover:scale-105 group cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
              >
                <TrendingUp className="w-6 h-6 mr-2 group-hover:-translate-y-1 transition-transform" />
                Calculer ma note fiscale globale
              </Button>
              
              <Button
                variant="outline"
                size="xl"
                disabled={!disclaimerChecked}
                onClick={() => onSelectCalculator('succession')}
                className={`w-full sm:w-auto text-lg px-8 py-4 border-white/20 text-white ${disclaimerChecked ? 'hover:bg-white/5 hover:border-white/40 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
              >
                <Calculator className="w-5 h-5 mr-2" />
                Simuler ma succession
              </Button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <Shield className="w-4 h-4" /> 100% gratuit
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 rounded-full border border-blue-500/20">
              <Lock className="w-4 h-4" /> Zéro tracking
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 rounded-full border border-amber-500/20">
              <Eye className="w-4 h-4" /> Open source
            </span>
          </div>
        </header>

        {/* ── Illustration / Preview ── */}
        <section className="mb-20 animate-fade-up-delay-1 relative flex justify-center px-4">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-navy-light p-2 max-w-3xl w-full">
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent z-10" />
              <img 
                src="/images/bercy-caisse-photo.jpg" 
                alt="Illustration - Addition salée DGFIP" 
                className="w-full h-auto object-cover rounded-xl opacity-90"
              />
              <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center">
                 <Button
                    variant="primary"
                    disabled={!disclaimerChecked}
                    onClick={() => onSelectCalculator('lifetime')}
                    className={`shadow-2xl ${disclaimerChecked ? 'hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                  >
                    Faire le test maintenant <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
              </div>
            </div>
        </section>

        {/* ── Pédagogie : La jungle fiscale ── */}
        <section className="mb-20 animate-fade-up-delay-2">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-white mb-4">Comprendre la "jungle" fiscale</h3>
          <p className="text-center text-slate-400 mb-10 max-w-2xl mx-auto text-lg">
            Le terme "impôt" est souvent utilisé à tort pour tout désigner. En réalité, le système se décline en 4 grandes familles de prélèvements obligatoires.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-navy-light/40 border border-white/5 rounded-2xl p-6 hover:border-gold/30 transition-colors">
              <h4 className="text-gold font-bold mb-3 flex items-center gap-2 text-lg">📊 Les Impôts</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Financent le budget général sans contrepartie directe. 
                <br/><span className="text-slate-400 text-xs mt-2 block">(Ex: Impôt sur le revenu, impôt sur les sociétés)</span>
              </p>
            </div>
            <div className="bg-navy-light/40 border border-white/5 rounded-2xl p-6 hover:border-gold/30 transition-colors">
              <h4 className="text-gold font-bold mb-3 flex items-center gap-2 text-lg">🛒 Les Taxes</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Perçues à l'occasion de la consommation ou d'un service.
                <br/><span className="text-slate-400 text-xs mt-2 block">(Ex: TVA, taxes sur l'énergie, taxe foncière)</span>
              </p>
            </div>
            <div className="bg-navy-light/40 border border-white/5 rounded-2xl p-6 hover:border-gold/30 transition-colors">
              <h4 className="text-gold font-bold mb-3 flex items-center gap-2 text-lg">💼 Les Cotisations</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Ouvrent un droit direct à des prestations sociales.
                <br/><span className="text-slate-400 text-xs mt-2 block">(Ex: Retraite, santé, chômage)</span>
              </p>
            </div>
            <div className="bg-navy-light/40 border border-white/5 rounded-2xl p-6 hover:border-gold/30 transition-colors">
              <h4 className="text-gold font-bold mb-3 flex items-center gap-2 text-lg">⚖️ Les Droits</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Liés à la transmission d'un patrimoine, d'un acte juridique ou au passage d'une frontière.
                <br/><span className="text-slate-400 text-xs mt-2 block">(Ex: Droits de succession, frais de notaire, droits de douane)</span>
              </p>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="mb-20 animate-fade-up-delay-3">
          <h3 className="text-2xl font-bold text-center text-white mb-10">Une démarche simple en 3 étapes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Renseigner', desc: 'Complétez un formulaire ultra-rapide avec des valeurs par défaut réalistes.', icon: FileText },
              { step: '2', title: 'Simuler', desc: 'Découvrez instantanément où va votre argent grâce à des graphiques clairs.', icon: TrendingUp },
              { step: '3', title: 'Comprendre', desc: 'Consultez la section pédagogique pour décrypter les mécanismes fiscaux.', icon: BookOpen },
            ].map((item) => {
              const StepIcon = item.icon;
              return (
                <div key={item.step} className="bg-navy-light/40 border border-white/5 rounded-2xl p-6 text-center hover:border-gold/30 transition-colors">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold/10 border border-gold/20 mb-5">
                    <StepIcon className="w-6 h-6 text-gold" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="mb-20">
          <StatsCounter />
        </section>

        {/* ── Projet, Méthodologie & PWA ── */}
        <section className="mb-20">
          <h3 className="text-2xl font-bold text-center text-white mb-8">Un outil indépendant et sécurisé</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-navy/40 border border-white/10">
              <h4 className="font-bold text-white text-lg mb-3 flex items-center gap-2">👥 Collectif Citoyen</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Développé et maintenu bénévolement. Sans étiquette politique ni vocation commerciale, ce simulateur vise uniquement la transparence fiscale.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-navy/40 border border-white/10">
              <h4 className="font-bold text-white text-lg mb-3 flex items-center gap-2">📚 Méthodologie</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Les calculs intègrent les taux réels de la Loi de Finances 2026. Ils fournissent des estimations pédagogiques (ceci n'est pas un conseil fiscal personnalisé).
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-navy/40 border border-white/10">
              <h4 className="font-bold text-white text-lg mb-3 flex items-center gap-2">🔒 Vie Privée</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Vos saisies restent locales (dans votre navigateur). Aucun cookie publicitaire, aucun serveur centralisé. Zéro tracking garanti.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-navy/40 border border-white/10">
              <h4 className="font-bold text-white text-lg mb-3 flex items-center gap-2">📱 Installation PWA</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Installez l'app localement. Sur iPhone (Safari) : <em>Partager {'>'} Sur l'écran d'accueil</em>. Sur Android/PC (Chrome) : <em>Options {'>'} Installer</em>.
              </p>
            </div>
          </div>
        </section>

        {/* ── Secondary CTA section ── */}
        <section className="mb-20 text-center">
          <h2 className="text-3xl font-black mb-6">Prêt à faire les comptes ?</h2>
          <Button
            variant="primary"
            size="xl"
            disabled={!disclaimerChecked}
            onClick={() => onSelectCalculator('lifetime')}
            className={`text-lg px-8 py-4 shadow-xl ${disclaimerChecked ? 'hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
          >
            Lancer la simulation gratuite
          </Button>
          {!disclaimerChecked && (
             <p className="text-xs text-slate-400 mt-4">
               Veuillez accepter les CGU en haut de la page pour démarrer.
             </p>
          )}
        </section>



        {/* ── Contact ── */}
        <section className="mb-12 text-center">
          <div className="inline-flex flex-col items-center p-6 bg-navy-light/30 border border-white/5 rounded-2xl">
            <h3 className="font-bold text-white mb-2 text-lg">Contact & Collaboration</h3>
            <p className="text-sm text-slate-400 mb-4">
              Une remarque, une idée d'amélioration ou une proposition de collaboration ?
            </p>
            <a href="mailto:unbilletpourbercy@proton.me" className="text-gold hover:text-gold-light font-medium underline transition-colors">
              unbilletpourbercy@proton.me
            </a>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-white/5 pt-8 pb-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2025-2026 Passez à la caisse — Outil citoyen et pédagogique indépendant</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => onSelectCalculator('sources')}
                className="text-slate-400 hover:text-gold transition-colors cursor-pointer"
              >
                📚 Sources
              </button>
              <span className="text-slate-700">•</span>
              <button
                type="button"
                onClick={() => onSelectCalculator('pedagogie')}
                className="text-slate-400 hover:text-gold transition-colors cursor-pointer"
              >
                📖 Pédagogie & FAQ
              </button>
              <span className="text-slate-700">•</span>
              <button
                type="button"
                onClick={onOpenCgu}
                className="text-slate-400 hover:text-gold transition-colors cursor-pointer font-bold"
              >
                ⚖️ CGU & Disclaimer
              </button>
              <span className="text-slate-700">•</span>
              <button
                type="button"
                onClick={onOpenCgu}
                className="text-slate-400 hover:text-gold transition-colors cursor-pointer flex items-center gap-1 font-medium"
              >
                🔒 Données Personnelles (RGPD)
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/**
 * Adaptateur pour le moteur de calcul et recommandations
 */

export function currency(n) {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(n);
}

export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/**
 * Crée un engine adapter pour les recommandations
 */
export function createEngine(state, setState, calculerDroitsAvecAV) {
  return {
    /**
     * Simule les droits avec l'état actuel ou modifié
     */
    simulate(appState) {
      const montantTransmissible = (appState.patrimImmobilier || 0) + (appState.patrimFinancier || 0);
      
      // Enrichir les bénéficiaires avec leurs donations
      const benefsAvecDonations = appState.beneficiaires.map(b => ({
        ...b,
        donations: appState.donations?.[b.type] || b.dons || []
      }));

      const { totalDroits } = calculerDroitsAvecAV(
        benefsAvecDonations,
        montantTransmissible,
        appState.avAvant70 || 0,
        appState.avApres70 || 0,
        appState.isCouple || false
      );

      // Estimation sans optimisation (30% de plus)
      const droitsSansOpti = totalDroits * 1.3;
      
      return { 
        droitsSansOpti, 
        droitsAvecOpti: totalDroits 
      };
    },

    /**
     * Applique une fenêtre de donation
     */
    applyDonationWindow(who, classiqueParEnfant, g790ParEnfant) {
      const now = new Date().getFullYear();
      
      setState(prev => {
        const newBeneficiaires = prev.beneficiaires.map(b => {
          if (b.type !== 'enfant') return b;
          
          const newDonations = [...(b.donations || [])];
          
          if (classiqueParEnfant > 0) {
            newDonations.push({
              montant: Math.min(classiqueParEnfant, 100000),
              annee: now,
              type: 'classique',
              par: who
            });
          }
          
          if (g790ParEnfant > 0) {
            newDonations.push({
              montant: Math.min(g790ParEnfant, 31865),
              annee: now,
              type: '790G',
              par: who
            });
          }
          
          return { ...b, donations: newDonations };
        });

        // Mettre à jour aussi montants.donations pour la cohérence
        const newMontants = { ...prev.montants };
        if (!newMontants.donations) {
          newMontants.donations = {};
        }
        
        newBeneficiaires.forEach(b => {
          newMontants.donations[b.type] = b.donations || [];
        });

        return { 
          ...prev, 
          beneficiaires: newBeneficiaires,
          montants: newMontants
        };
      });
    },

    /**
     * Supprime une donation spécifique
     */
    removeDonation(benefType, donationIndex) {
      setState(prev => {
        const newBeneficiaires = prev.beneficiaires.map(b => {
          if (b.type !== benefType) return b;
          
          const newDonations = [...(b.donations || [])];
          newDonations.splice(donationIndex, 1);
          
          return { ...b, donations: newDonations };
        });

        // Mettre à jour aussi montants.donations
        const newMontants = { ...prev.montants };
        if (!newMontants.donations) {
          newMontants.donations = {};
        }
        
        newBeneficiaires.forEach(b => {
          newMontants.donations[b.type] = b.donations || [];
        });

        return { 
          ...prev, 
          beneficiaires: newBeneficiaires,
          montants: newMontants
        };
      });
    },

    /**
     * Applique une répartition d'assurance-vie
     */
    applyAssuranceVieSplit(mapping) {
      // Calculer le total AV à partir du mapping
      const totalAV = Object.values(mapping).reduce((sum, val) => sum + (val || 0), 0);
      
      setState(prev => ({
        ...prev,
        _avSplit: mapping,
        montants: {
          ...prev.montants,
          avAvant70: totalAV,  // Mettre à jour le montant AV
          avApres70: 0  // Reset AV après 70
        }
      }));
    },

    /**
     * Applique un démembrement
     */
    applyDemembrement(on, params) {
      setState(prev => ({
        ...prev,
        usufruit: on ? (
          params?.viagerAge 
            ? { type: 'viager', age: params.viagerAge }
            : { type: 'temporaire', duree: params?.temporaireDuree || 10 }
        ) : undefined
      }));
    },

    /**
     * Applique une donation de nue-propriété (démembrement inter vivos)
     */
    applyDemembrementNP(params) {
      const { calcDemembrement, droitsDonationNP } = require('./demembrement_inter_vivos');
      const now = new Date().getFullYear();
      
      // Calcul US/NP
      const dm = calcDemembrement(
        params.kind === 'viager'
          ? { kind: params.kind, ageUsufruitier: params.ageUsufruitier, pleinePropriete: params.pleinePropriete }
          : { kind: params.kind, dureeAnnees: params.dureeAnnees, pleinePropriete: params.pleinePropriete }
      );
      
      // Calcul droits de donation
      const dDon = droitsDonationNP(dm.valNP, params.lien, params.dejaConsoAbatt);
      
      setState(prev => {
        const newState = { ...prev };
        
        // Enregistrer la donation de NP
        if (!newState.donationsNP) {
          newState.donationsNP = [];
        }
        
        newState.donationsNP.push({
          annee: now,
          pleinePropriete: params.pleinePropriete,
          valeurNP: dm.valNP,
          valeurUS: dm.valUS,
          usPct: dm.usPct,
          npPct: dm.npPct,
          kind: params.kind,
          ageUsufruitier: params.ageUsufruitier,
          dureeAnnees: params.dureeAnnees,
          lien: params.lien,
          droitsDonation: dDon.droits,
          abattementConsomme: dDon.abattementTheorique - dDon.abattementDisponible + params.dejaConsoAbatt
        });
        
        return newState;
      });
    }
  };
}

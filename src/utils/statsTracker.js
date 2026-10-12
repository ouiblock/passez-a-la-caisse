/**
 * Service de suivi des métriques utilisateur.
 * Persistance locale avec synchronisation serveur prévue.
 */

const STORAGE_KEY = 'palc_m';

export function enregistrerSimulation({ montantTotal = 0, economiesPotentielles = 0, type = 'vie' }) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let data = { s: 0, m: 0, e: 0 };

    if (raw) {
      data = JSON.parse(raw);
    }

    data.s += 1;
    data.m = (data.m || 0) + montantTotal;
    data.e = (data.e || 0) + economiesPotentielles;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    return {
      totalSimulations: data.s,
      montantTotalCalcule: data.m,
      totalEconomies: data.e
    };
  } catch (err) {
    return null;
  }
}

export function getStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return {
        totalSimulations: data.s || 0,
        montantTotalCalcule: data.m || 0,
        totalEconomies: data.e || 0
      };
    }
    return { totalSimulations: 0, montantTotalCalcule: 0, totalEconomies: 0 };
  } catch (err) {
    return { totalSimulations: 0, montantTotalCalcule: 0, totalEconomies: 0 };
  }
}

/**
 * Service de suivi des métriques utilisateur et communautaires.
 * - Anonyme et respectueux de la vie privée (zéro cookie, zéro IP).
 * - Enregistre localement les simulations utilisateur.
 * - Synchronise de manière transparente avec l'API serveur pour les vraies visites/simulations.
 */

const STORAGE_KEY = 'palc_m';
const SESSION_VISIT_KEY = 'palc_visited_session';

/**
 * Enregistre une visite réelle (une fois par session de navigation pour éviter les doublons F5).
 */
export async function enregistrerVisiteReelle() {
  try {
    if (typeof window === 'undefined') return;

    // Éviter de compter plusieurs fois la même session
    if (sessionStorage.getItem(SESSION_VISIT_KEY)) {
      return;
    }
    sessionStorage.setItem(SESSION_VISIT_KEY, '1');

    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'visit' })
    }).catch(() => {});
  } catch (err) {
    // Silencieux
  }
}

/**
 * Récupère le nombre de vraies visites et de simulations réelles enregistrées sur le serveur.
 */
export async function getRealServerStats() {
  try {
    const res = await fetch('/api/analytics', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      return {
        realVisits: Number(data.realVisits) || 0,
        realSimulations: Number(data.realSimulations) || 0
      };
    }
  } catch (err) {
    // Mode hors-ligne ou fallback
  }
  return { realVisits: 0, realSimulations: 0 };
}

/**
 * Enregistre une simulation effectuée (localement + ping anonyme au serveur).
 */
export function enregistrerSimulation({ montantTotal = 0, economiesPotentielles = 0, type = 'vie' } = {}) {
  try {
    // 1. Sauvegarde locale
    const raw = localStorage.getItem(STORAGE_KEY);
    let data = { s: 0, m: 0, e: 0 };

    if (raw) {
      data = JSON.parse(raw);
    }

    data.s += 1;
    data.m = (data.m || 0) + (typeof montantTotal === 'number' ? montantTotal : 0);
    data.e = (data.e || 0) + (typeof economiesPotentielles === 'number' ? economiesPotentielles : 0);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    // 2. Ping serveur anonyme asynchrone (+1 simulation réelle)
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'simulation' })
    }).catch(() => {});

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

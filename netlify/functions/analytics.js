import { getStore } from '@netlify/blobs';

/**
 * Netlify Function: Suivi anonyme des métriques collectives
 * Respecte à 100% la vie privée : aucun IP stocké, aucun cookie, aucun fingerprint.
 * Compte simplement les visites uniques de session et les simulations.
 */
export default async (req) => {
  // Configurer CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    const store = getStore('community_metrics');
    
    // Récupérer les stats actuelles ou initialiser
    let stats = await store.get('stats', { type: 'json' });
    if (!stats) {
      stats = {
        realVisits: 0,
        realSimulations: 0
      };
    }

    if (req.method === 'POST') {
      let body = {};
      try {
        body = await req.json();
      } catch (e) {
        body = {};
      }

      if (body.type === 'simulation') {
        stats.realSimulations = (stats.realSimulations || 0) + 1;
      } else {
        // Par défaut, c'est une visite de page
        stats.realVisits = (stats.realVisits || 0) + 1;
      }

      await store.setJSON('stats', stats);
    }

    return new Response(
      JSON.stringify({
        success: true,
        realVisits: stats.realVisits || 0,
        realSimulations: stats.realSimulations || 0
      }),
      { status: 200, headers }
    );
  } catch (error) {
    // Si Netlify Blobs n'est pas encore initialisé localement ou en cas d'erreur de store
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        realVisits: 0,
        realSimulations: 0
      }),
      { status: 200, headers }
    );
  }
};

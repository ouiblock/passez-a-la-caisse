/**
 * Téléchargement du livre officiel :
 * "La Bible (très) humoristique des taxes et impôts de France"
 * Des Gaulois au prélèvement à la source : 2 000 ans de « passez à la caisse »
 * Écrit par Jean-Luc Chat, ancien inspecteur des impôts et chat officiel de passezalacaisse.org
 */

export async function exportBibleFiscalePDF() {
  const fileUrl = '/la-bible-tres-humoristique-des-taxes-et-impots-de-france.pdf';
  const fileName = 'la-bible-tres-humoristique-des-taxes-et-impots-de-france.pdf';

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error('Fichier non trouvé');
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (e) {
    // Fallback direct
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

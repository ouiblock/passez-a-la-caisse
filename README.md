# Passez à la caisse 💰

**Application web de simulation pédagogique des droits de donation et succession en France**

**Version 2.0** - Avec paramètres JSON structurés et suite de tests chiffrés

---

## 🚀 Démarrage rapide (2 minutes)

```bash
# Installation
npm install

# Lancement
npm run dev
```

→ Ouvrir http://localhost:5173

---

## 🧪 Valider le moteur de calcul (30 secondes)

```bash
npm test
```

**Résultat attendu** : 10/10 tests réussis ✅

---

## 📚 Documentation complète

| Document | Description |
|----------|-------------|
| **[INDEX.md](INDEX.md)** | 📑 Index de toute la documentation |
| **[QUICKSTART.md](QUICKSTART.md)** | 🚀 Guide de démarrage rapide |
| **[README_APP.md](README_APP.md)** | 📖 Documentation complète de l'application |
| **[GUIDE_TESTS.md](GUIDE_TESTS.md)** | 🧪 Guide d'utilisation des tests |
| **[PATCH_SUMMARY.md](PATCH_SUMMARY.md)** | 📝 Résumé du patch v2.0 |

**→ Commencez par [INDEX.md](INDEX.md) pour naviguer dans la documentation**

---

## ✨ Fonctionnalités principales

### Flow en 4 étapes
1. **Qui êtes-vous ?** - Sélection du rôle
2. **À qui léguer ?** - Choix des bénéficiaires et répartition
3. **Combien ?** - Patrimoine, assurance-vie, donations
4. **Résultats** - Calculs détaillés, préconisations, export PDF

### Nouveautés v2.0
- ✅ **Paramètres JSON** structurés (donation/succession)
- ✅ **10 tests chiffrés** avec résultats attendus
- ✅ **Interface de test** intégrée (🧪 ou Ctrl+Shift+T)
- ✅ **Documentation complète** pour développeurs et utilisateurs

---

## 🎯 Cas d'usage

### Utilisateur
→ Lire [QUICKSTART.md](QUICKSTART.md) puis faire une simulation

### Développeur
→ Lire [README_APP.md](README_APP.md) puis [CHANGELOG.md](CHANGELOG.md)

### Testeur
→ Lire [GUIDE_TESTS.md](GUIDE_TESTS.md) puis exécuter `npm test`

### Expert fiscal
→ Consulter [fiscal_params.json](public/data/fiscal_params.json) et [TEST_RESULTS_EXPECTED.md](TEST_RESULTS_EXPECTED.md)

---

## 📊 Tests du moteur de calcul

**10 tests chiffrés** couvrant tous les cas :
1. Barème ligne directe → 38 194,35 €
2. Abattement avec donations < 15 ans
3. Petit-enfant donation (790B) vs succession
4. Assurance-vie avant 70 ans (3 cas)
5. Barème frères/sœurs → 42 557 €
6. Barème tiers (60%)
7. Cas complet 2 enfants → 55 388,70 €
8. Don familial 790G → 31 865 €
9. Rechargement abattements > 15 ans
10. Neveu/nièce collatéraux (55%)

**Détails** : Voir [TESTS.md](TESTS.md)

---

## 🔧 Commandes

```bash
npm run dev      # Lancer le serveur de développement
npm test         # Exécuter les tests
npm run build    # Build pour production
npm run preview  # Prévisualiser le build
npm run lint     # Vérifier le code
```

---

## 📦 Technologies

- **React 19** - Framework UI
- **Vite 7** - Build tool ultra-rapide
- **Tailwind CSS 4** - Styling moderne
- **Lucide React** - Icônes
- **jsPDF** - Export PDF

---

## ⚠️ Disclaimer

**Simulation indicative uniquement.**

Les règles fiscales évoluent. La réserve héréditaire et les situations personnelles nécessitent une validation par un notaire ou avocat fiscaliste.

Cet outil est à but pédagogique et ne constitue pas un conseil juridique ou fiscal.

---

## 📞 Support

### Documentation
- 📑 [INDEX.md](INDEX.md) - Navigation complète
- 🚀 [QUICKSTART.md](QUICKSTART.md) - Démarrage rapide
- 📖 [README_APP.md](README_APP.md) - Documentation complète

### Tests
- 🧪 [GUIDE_TESTS.md](GUIDE_TESTS.md) - Guide des tests
- 📋 [TESTS.md](TESTS.md) - Description détaillée
- 📊 [TEST_RESULTS_EXPECTED.md](TEST_RESULTS_EXPECTED.md) - Résultats attendus

---

**© 2025 Passez à la caisse - Outil pédagogique**

**Version 2.0** - Patch appliqué le 27 octobre 2025

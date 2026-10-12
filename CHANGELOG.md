# Changelog - Passez à la caisse

## Version 2.0 - Patch paramètres JSON + Tests chiffrés

### 🎯 Objectifs
- Séparation donation/succession dans les paramètres
- Ajout des articles 790B et 790G
- Précision sur l'assurance-vie (990 I / 757 B)
- Suite de tests chiffrés avec résultats attendus

---

## ✨ Nouveautés

### 1. Paramètres JSON structurés
**Fichier** : `/public/data/fiscal_params.json`

#### Séparation donation/succession
```json
{
  "abattements": {
    "donation": {
      "enfant": 100000,
      "petit_enfant_790B": 31865,
      "don_familial_790G": 31865,
      ...
    },
    "succession": {
      "enfant": 100000,
      "freres_soeurs": 15932,
      ...
    }
  }
}
```

#### Nouveaux articles
- **790B** : Don grand-parent → petit-enfant (31 865 €)
- **790G** : Don familial d'argent (31 865 €, conditions spécifiques)

#### Assurance-vie précisée
- **990 I** : Avant 70 ans (152 500 € / bénéficiaire, puis 20%/31,25%)
- **757 B** : Après 70 ans (30 500 € global, puis barème civil)

#### Usufruit art. 669
- Viager : Barème par tranche d'âge
- Temporaire : 23% par tranche de 10 ans

---

### 2. Moteur de calcul mis à jour

**Fichier** : `/src/utils/calculations.js`

#### Fonction `getAbattement()` améliorée
```javascript
getAbattement(typeBeneficiaire, mode = 'succession')
```
- Mode 'donation' ou 'succession'
- Gestion spécifique petit-enfant :
  - Donation : 31 865 € (790B)
  - Succession : 1 594 € (sauf représentation)

#### Rechargement dynamique
```javascript
const rechargeAns = FISC.regles?.recharge_abattements_ans || 15;
```

#### Noms de paramètres cohérents
- `avant70_990I` → `abattement_par_beneficiaire`, `palier_20_pourcent`, `taux_au_dela`
- `apres70_757B` → `abattement_global`

---

### 3. Suite de tests chiffrés

**Fichier** : `/src/tests/calculations.test.js`

#### 10 tests implémentés

1. ✅ **Barème ligne directe** (200k → 38 194,35 €)
2. ✅ **Abattement avec donations < 15 ans**
3. ✅ **Petit-enfant donation vs succession** (31 865 € vs 1 594 €)
4. ✅ **Assurance-vie avant 70 ans** (3 cas : < abattement, < 700k, > 700k)
5. ✅ **Barème frères/sœurs** (100k → 42 557 €)
6. ✅ **Barème tiers** (50k → 30 000 €)
7. ✅ **Cas complet 2 enfants** (patrimoine + AV → 55 388,70 €)
8. ✅ **Don familial 790G** (31 865 €)
9. ✅ **Rechargement abattements** (> 15 ans)
10. ✅ **Neveu/nièce collatéraux** (55%)

#### Résultats attendus documentés
Chaque test inclut :
- Données d'entrée
- Calcul détaillé étape par étape
- Résultat attendu avec précision (±0,01 €)

---

### 4. Interface de test intégrée

**Fichier** : `/src/components/TestPanel.jsx`

#### Fonctionnalités
- 🧪 Bouton icône fiole dans le header
- ⌨️ Raccourci clavier : **Ctrl+Shift+T**
- 📊 Affichage des résultats (réussis/échoués/total)
- 📝 Console de logs détaillée
- ✅ Statut global avec couleurs

#### Utilisation
```
1. Cliquer sur l'icône 🧪 en haut à droite
2. Ou appuyer sur Ctrl+Shift+T
3. Cliquer sur "Lancer les tests"
4. Consulter les résultats détaillés
```

---

## 📁 Fichiers modifiés

### Nouveaux fichiers
- ✨ `/public/data/fiscal_params.json` - Paramètres JSON structurés
- ✨ `/src/tests/calculations.test.js` - Suite de tests chiffrés
- ✨ `/src/tests/runTests.js` - Runner Node.js
- ✨ `/src/components/TestPanel.jsx` - Interface de test
- ✨ `/TESTS.md` - Documentation des tests
- ✨ `/CHANGELOG.md` - Ce fichier

### Fichiers modifiés
- 🔧 `/src/constants/fiscal.js` - Séparation donation/succession
- 🔧 `/src/utils/calculations.js` - Fonctions mises à jour
- 🔧 `/src/App.jsx` - Mode test intégré

---

## 🎓 Règles fiscales documentées

### Représentation en succession
> "Les petits-enfants reprennent et partagent l'abattement de 100k si représentation d'un parent prédécédé/renonçant ; sinon 1 594 €"

### Don familial 790G
> "Donateur < 80 ans et donataire majeur/émancipé ; cumulable avec abattements classiques ; déclaration 2735"

### Assurance-vie
> "Pas de représentation en assurance-vie"

### Réunion usufruit/nue-propriété
> "Réunion sans droits au décès de l'usufruitier"

---

## 🚀 Commandes

### Lancer l'application
```bash
npm run dev
```

### Exécuter les tests (Node.js)
```bash
node src/tests/runTests.js
```

### Exécuter les tests (navigateur)
```javascript
// Dans la console du navigateur
window.runFiscalTests()
```

---

## 📊 Résultats attendus

### Exemple : Parent → 2 enfants (400k patrimoine + 400k AV)

**Enfant 1** :
- Patrimoine : 200k - 100k (abattement) = 100k taxable → 18 194,35 €
- AV avant 70 : 200k - 152,5k (abattement) = 47,5k taxable → 9 500 €
- **Total : 27 694,35 €**

**Enfant 2** : Identique

**Total général : 55 388,70 €**

---

## ⚠️ Notes importantes

1. **Tolérance** : Les tests acceptent une différence de ±0,01 € (erreurs d'arrondi)

2. **Mode succession par défaut** : La fonction `getAbattement()` utilise le mode 'succession' par défaut

3. **Rechargement 15 ans** : Configurable via `FISC.regles.recharge_abattements_ans`

4. **Petit-enfant** : Attention à la distinction donation (790B) vs succession (avec/sans représentation)

5. **Assurance-vie** : Les abattements sont par bénéficiaire (990 I) ou global (757 B)

---

## 🔮 Prochaines étapes (V3)

- [ ] Chargement dynamique des paramètres JSON
- [ ] Mode donation vs succession dans l'interface
- [ ] Calcul du démembrement (usufruit/nue-propriété)
- [ ] Gestion de la représentation en succession
- [ ] Export des résultats de tests en PDF
- [ ] Tests unitaires automatisés (Jest/Vitest)

---

**© 2025 Passez à la caisse - Version 2.0**

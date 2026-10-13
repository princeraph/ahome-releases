# ahome-releases — conventions

**Dépôt PUBLIC.** Tout ce qui est écrit ici — fichiers, messages de commit, notes de version, journaux d’Actions —
est lisible par tous. Jamais : le nom du dépôt du code source, un chemin ou un document interne, l’adresse du relais
de synchro, un nom de famille, une donnée du foyer, un lien d’invitation réel.

## Ce qui vit ici

- GitHub Pages (branche `main`, racine) : `index.html` (téléchargement) et `rejoindre.html` (invitation).
- Les versions (Releases `v<version>`) : `Ahome-Setup.exe`, `.blockmap`, `latest.yml`. L’appli installée lit
  `latest.yml` pour se mettre à jour ; l’URL stable
  `https://github.com/princeraph/ahome-releases/releases/latest/download/Ahome-Setup.exe` sert toujours la dernière.

## Règles des pages

- **Rien n’est chargé d’ailleurs** : CSP `default-src 'none'`, scripts et styles en fichiers du dépôt seulement,
  polices du système, `no-referrer`. Le fragment (`#…`) est l’invitation : il n’entre que dans l’attribut du lien
  « Ouvrir dans Ahome » et dans le presse-papiers, jamais dans le texte de la page.
- `regle.js` applique **la même règle** que l’appli. Les cas partagés (`tests/cas-liens.json`) sont une copie
  identique de ceux de l’appli : changer l’un, c’est changer l’autre. `node --test tests/regle.test.mjs` ;
  avec `AHOME_SOURCE=<code source>`, le test compare aussi les deux règles directement.

## Publier une version

1. Dans le code source : augmenter la version de l’appli (sinon la publication refuse).
2. Ici : Actions › « Publier une version » › Run workflow (`ref` : `main` par défaut).
3. Le workflow construit l’installateur depuis Linux, refuse si un contrôle échoue, puis crée la version.

Secrets attendus : `AHOME_SOURCE_REPO`, `AHOME_SOURCE_TOKEN` (lecture seule). Aucune commande ne les affiche.

## Minutes Actions

Dépôt public : minutes des exécuteurs standard gratuites. Garder `workflow_dispatch` seul, `timeout-minutes`, et
`cancel-in-progress: false` (une publication coupée laisserait une version à moitié téléversée). Coût estimé en tête
de chaque workflow.

## Git

Auteur `Claude <noreply@anthropic.com>` ; pas de lien de session dans les commits ; `Co-Authored-By` gardé.

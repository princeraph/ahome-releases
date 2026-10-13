# Ahome — versions publiées

Ahome est le hub du foyer : finances, valeurs et projets, partagés entre les membres d’un foyer. Ce dépôt ne contient
que ce qui sert à l’installer : la page de téléchargement, la page qui accueille une invitation, et les versions
publiées (onglet **Releases**). Le code de l’appli n’est pas ici.

## Installer

Page de téléchargement : <https://princeraph.github.io/ahome-releases/>

- Windows 10 ou 11, 64 bits.
- L’installateur n’est pas signé : si Windows affiche « Windows a protégé votre ordinateur », cliquez sur
  **Informations complémentaires**, puis **Exécuter quand même**.
- Une fois installée, Ahome se met à jour seule : elle télécharge la nouvelle version en arrière-plan, la vérifie,
  puis propose de redémarrer. Rien ne redémarre sans votre accord.

## Rejoindre un foyer

On vous a envoyé un lien qui commence par `https://princeraph.github.io/ahome-releases/rejoindre.html#…` : ouvrez-le.
La page vous fait installer Ahome, puis ouvrir l’invitation dans l’appli.

La partie du lien après `#` est l’invitation. Votre navigateur ne l’envoie jamais au serveur, et la page ne charge
rien d’autre qu’elle-même : ni police, ni script tiers, ni mesure d’audience.

## Contenu

| Fichier | Rôle |
|---|---|
| `index.html` | Page de téléchargement |
| `rejoindre.html`, `rejoindre.js` | Page d’invitation |
| `regle.js` | La règle qui reconnaît un lien d’invitation complet (la même que dans l’appli) |
| `style.css` | Thème d’Ahome |
| `tests/` | Vérifie la règle et les pages : `node --test tests/regle.test.mjs` |
| `.github/workflows/publier.yml` | Publication d’une version (lancée à la main) |

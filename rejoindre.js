// L'invitation lue dans l'adresse de la page, après « # ». Le navigateur n'envoie jamais cette partie au serveur, et
// cette page ne charge rien d'autre qu'elle-même (voir la règle CSP de rejoindre.html) : l'invitation ne quitte cet
// ordinateur que vers Ahome (« Ouvrir dans Ahome ») ou le presse-papiers (« Copier le lien »). Elle n'est jamais
// écrite dans le texte de la page.
(function () {
  'use strict';
  var fragment = window.location.hash.slice(1);
  var valide = AhomeLien.fragmentValide(fragment);
  document.getElementById(valide ? 'invitation' : 'incomplet').hidden = false;
  // Une autre invitation collée dans la barre d'adresse : la page la relit depuis le début.
  window.addEventListener('hashchange', function () {
    window.location.reload();
  });
  if (!valide) return;

  var lien = AhomeLien.PREFIXE_APPLI + fragment;
  document.getElementById('ouvrir').setAttribute('href', lien);

  var etat = document.getElementById('copie-etat');
  document.getElementById('copier').addEventListener('click', function () {
    var refus = function () {
      etat.textContent =
        'Le navigateur refuse la copie. Copiez plutôt l’adresse de cette page (barre d’adresse), puis collez-la dans « Rejoindre un foyer ».';
    };
    if (!navigator.clipboard || !navigator.clipboard.writeText) return refus();
    navigator.clipboard.writeText(lien).then(function () {
      etat.textContent = 'Lien copié. Dans Ahome, choisissez « Rejoindre un foyer », puis collez-le.';
    }, refus);
  });
})();

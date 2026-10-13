// La règle du lien d'invitation, la même que dans l'appli Ahome : le fragment (après « # ») passe seulement s'il a
// EXACTEMENT la forme d'une invitation — trois identifiants, un secret de 32 octets et une empreinte de 16 octets,
// en base64url canonique —, et une longueur bornée. Tout le reste : « lien incomplet ».
// Cas partagés avec l'appli : tests/cas-liens.json.
var AhomeLien = (function () {
  'use strict';
  var PARTIE = '[A-Za-z0-9_-]{4,64}';
  var FORME = new RegExp('^' + PARTIE + '\\.' + PARTIE + '\\.[A-Za-z0-9_-]{43}\\.' + PARTIE + '\\.[A-Za-z0-9_-]{22}$');
  var LONGUEUR_MAX = 3 * 64 + 43 + 22 + 4;
  var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

  // Base64url canonique : les bits de remplissage du dernier caractère sont nuls (43 caractères pour 32 octets :
  // 2 bits ; 22 pour 16 octets : 4 bits). Sinon deux textes différents désigneraient les mêmes octets.
  function canonique(texte, octets) {
    var bits = texte.length * 6 - octets * 8;
    var dernier = B64.indexOf(texte.charAt(texte.length - 1));
    return dernier >= 0 && (dernier & ((1 << bits) - 1)) === 0;
  }

  function fragmentValide(fragment) {
    if (typeof fragment !== 'string' || fragment.length > LONGUEUR_MAX || !FORME.test(fragment)) return false;
    var parties = fragment.split('.');
    return canonique(parties[2], 32) && canonique(parties[4], 16);
  }

  return { fragmentValide: fragmentValide, PREFIXE_APPLI: 'ahome://rejoindre#' };
})();

// La page rejoindre.html et l'appli Ahome jugent un lien d'invitation avec la MÊME règle.
//   node --test tests/regle.test.mjs                       les cas partagés (tests/cas-liens.json) et la forme des pages
//   AHOME_SOURCE=<dossier du code d’Ahome> node --test tests/regle.test.mjs
//                                            en plus : la règle de l'appli elle-même, sur les mêmes cas et sur
//                                            20 000 liens abîmés au hasard ; la copie des cas identique à la sienne
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const racine = fileURLToPath(new URL('..', import.meta.url));
const lire = (f) => readFileSync(join(racine, f), 'utf8');

/** La règle de la page, telle que le navigateur la charge. */
function reglePage() {
  const contexte = vm.createContext({});
  vm.runInContext(lire('regle.js'), contexte);
  return contexte.AhomeLien;
}

const { cas } = JSON.parse(lire('tests/cas-liens.json'));
const CAS = cas.map((c) => ({ ...c, fragment: c.ajout ? c.fragment + c.ajout.repeat(c.fois ?? 1) : c.fragment }));

test('les cas partagés : les verdicts attendus', () => {
  const { fragmentValide, PREFIXE_APPLI } = reglePage();
  assert.equal(PREFIXE_APPLI, 'ahome://rejoindre#');
  assert.ok(CAS.length > 30);
  for (const c of CAS) assert.equal(fragmentValide(c.fragment), c.valide, c.pourquoi);
  for (const v of [undefined, null, 42, {}, []]) assert.equal(fragmentValide(v), false);
});

test('les pages : rien de chargé d’ailleurs, CSP stricte, aucun référent, l’invitation jamais écrite dans le texte', () => {
  for (const page of ['index.html', 'rejoindre.html']) {
    const html = lire(page);
    const csp = /<meta http-equiv="Content-Security-Policy" content="([^"]+)">/.exec(html)?.[1];
    assert.ok(csp, `${page} : CSP`);
    assert.match(csp, /^default-src 'none';/, `${page} : default-src 'none'`);
    assert.doesNotMatch(csp, /unsafe|https?:|\*|data:/, `${page} : rien d'autre que 'self'`);
    assert.match(html, /<meta name="referrer" content="no-referrer">/, `${page} : no-referrer`);
    assert.doesNotMatch(html, /\sstyle="/, `${page} : pas de style en ligne`);
    assert.doesNotMatch(html, /<script(?![^>]*\bsrc="[a-z]+\.js")/, `${page} : pas de script en ligne ni tiers`);
    assert.doesNotMatch(html, /<(?:link|script|img|iframe|object|embed|source|video|audio)\b[^>]*\b(?:src|href)="(?:https?:)?\/\//, `${page} : aucune ressource externe`);
    for (const [, href] of html.matchAll(/href="(https?:[^"]+)"/g)) {
      assert.ok(href.startsWith('https://github.com/princeraph/ahome-releases/releases'), `${page} : lien inattendu ${href}`);
    }
  }
  const rejoindre = lire('rejoindre.html');
  assert.match(rejoindre, /script-src 'self'/);
  assert.deepEqual([...rejoindre.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]), ['regle.js', 'rejoindre.js']);
  const js = lire('rejoindre.js');
  // Le fragment n'entre que dans l'attribut du lien et dans le presse-papiers ; jamais dans le texte de la page.
  assert.doesNotMatch(js, /innerHTML|outerHTML|insertAdjacentHTML|document\.write|\.value\s*=/);
  assert.doesNotMatch(js, /textContent\s*=\s*[^'\n]*(lien|fragment)/);
  assert.doesNotMatch(js, /fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|new Image|localStorage|sessionStorage|indexedDB/);
  assert.match(lire('index.html'), /href="https:\/\/github\.com\/princeraph\/ahome-releases\/releases\/latest\/download\/Ahome-Setup\.exe"/);
});

const SOURCE = process.env.AHOME_SOURCE;

test('la règle de l’appli (AHOME_SOURCE) : mêmes verdicts, mêmes cas', { skip: !SOURCE && 'AHOME_SOURCE absent' }, async () => {
  const casSource = join(SOURCE, 'packages/core/test/fixtures/cas-liens-invitation.json');
  assert.ok(existsSync(casSource), 'cas partagés absents de la source');
  assert.equal(readFileSync(casSource, 'utf8'), lire('tests/cas-liens.json'), 'les deux copies des cas diffèrent');

  // La règle du noyau, construite depuis la source avec son propre esbuild.
  const require = createRequire(join(SOURCE, 'package.json'));
  const { build } = require('esbuild');
  const dossier = mkdtempSync(join(tmpdir(), 'regle-'));
  try {
    const sortie = join(dossier, 'regle.cjs');
    await build({
      stdin: { contents: "export { inviteFragmentOf, pastedInviteLink, INVITE_PAGE_PREFIX } from './src/sync/invite-link';", resolveDir: join(SOURCE, 'packages/core'), loader: 'ts' },
      bundle: true, platform: 'node', format: 'cjs', outfile: sortie, logLevel: 'error',
    });
    const appli = createRequire(sortie)(sortie);
    const { fragmentValide } = reglePage();
    assert.equal(appli.INVITE_PAGE_PREFIX, 'https://princeraph.github.io/ahome-releases/rejoindre.html#');
    for (const c of CAS) {
      assert.equal(appli.inviteFragmentOf(c.fragment) !== null, fragmentValide(c.fragment), c.pourquoi);
      if (c.fragment === c.fragment.trimEnd()) assert.equal(appli.pastedInviteLink(appli.INVITE_PAGE_PREFIX + c.fragment) !== null, c.valide, `collé : ${c.pourquoi}`);
    }
    // Des liens abîmés au hasard (graine fixe) : un caractère changé, ajouté, retiré ; une coupure.
    const valides = CAS.filter((c) => c.valide).map((c) => c.fragment);
    const alphabet = 'AZaz09-_.+/=%# \n\u0000éа．Qgwv';
    let graine = 20261013;
    const hasard = (n) => ((graine = (graine * 1103515245 + 12345) % 2147483648) % n);
    let acceptes = 0;
    for (let i = 0; i < 20000; i++) {
      let f = valides[hasard(valides.length)];
      const coups = 1 + hasard(3);
      for (let k = 0; k < coups; k++) {
        const at = hasard(f.length + 1);
        const ch = alphabet[hasard(alphabet.length)];
        const op = hasard(4);
        f = op === 0 ? f.slice(0, at) + ch + f.slice(at + 1) : op === 1 ? f.slice(0, at) + ch + f.slice(at) : op === 2 ? f.slice(0, at) + f.slice(at + 1) : f.slice(0, at);
      }
      const page = fragmentValide(f);
      assert.equal(appli.inviteFragmentOf(f) !== null, page, JSON.stringify(f));
      if (page) acceptes++;
    }
    // Les deux issues sont exercées : des liens abîmés encore valides (un id changé), et des refus.
    assert.ok(acceptes > 100 && acceptes < 19000, `acceptés : ${acceptes}`);
  } finally {
    rmSync(dossier, { recursive: true, force: true });
  }
});

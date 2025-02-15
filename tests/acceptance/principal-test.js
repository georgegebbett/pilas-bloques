import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { create, visitable, text, count } from 'ember-cli-page-object';
import setupMirage from "ember-cli-mirage/test-support/setup-mirage";
import { currentURL } from '@ember/test-helpers';

const page = create({
  scope: '.contenido-principal',
  visit: visitable('/'),
  tituloModal: text('h4', { scope: '.ember-modal-dialog', resetScope: true }),
  cantidadDeImagenes: count('img'),
  cantidadDeLinks: count('a'),
  translatedText: text(),
});

module('Acceptance | principal', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('visiting /', async function (assert) {
    await page.visit();
    assert.equal(page.cantidadDeLinks, 7, "La cantidad de links en pantalla renderiza bien.");
    // test translations
    assert.equal(currentURL(), '/libros', " current url is "+currentURL()+" instead of /libros");
    assert.true(page.translatedText.includes("Los desafíos que ofrecemos están organizados en dos grupos:"),"text should be tranlated "+page.translatedText)
    assert.false(page.translatedText.includes("Missing translation"),"no translations should be missing")
  });
});

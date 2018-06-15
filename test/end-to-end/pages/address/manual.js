function enterAddressManually(stepUrl) {

  const I = this;

  I.waitUrlEquals(stepUrl);
  I.click('#enter-manual');
  I.fillField('addressManual', 'some address entered manually');
  I.navByClick('Continue');
}
module.exports = { enterAddressManually };
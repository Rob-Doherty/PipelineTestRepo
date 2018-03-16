const supertest = require('supertest');
const statusCode = require('http-status-codes');
const server = require('app');
const CONF = require('config');

const modulePath = 'app/services/featureToggleList';

describe(modulePath, () => {
  describe('displays the correct data based on the default config', () => {
    let s = {};

    beforeEach(() => {
      s = server.init();
    });

    afterEach(() => {
      s.http.close();
    });

    it('should return success', done => {
      //  note that the features (idam, foreignMarriageCerts, onlineSubmission) are hardcoded into the app.js

      const defaultToggles = {
        idam: {
          feature: 'idam',
          defaultState: CONF.features.idam,
          origin: 'default config'
        },
        foreignMarriageCerts: {
          feature: 'foreignMarriageCerts',
          defaultState: CONF.features.foreignMarriageCerts,
          origin: 'default config'
        },
        onlineSubmission: {
          feature: 'onlineSubmission',
          defaultState: CONF.features.onlineSubmission,
          origin: 'default config'
        }
      };

      supertest(s.app).get('/status/feature-toggles')
        .expect('Content-Type', /json/)
        .expect(statusCode.OK)
        .expect(defaultToggles, done);
    });
  });

  describe('displays the correct data based on idam being process variables', () => {
    let s = {};
    let idam = null;

    beforeEach(() => {
      idam = process.env.idam;
      process.env.idam = false;
      s = server.init();
    });

    afterEach(() => {
      s.http.close();
      if (!idam) delete process.env.idam;
    });

    it('should return success', done => {
      const featureToggles = {
        idam: {
          defaultState: process.env.idam,
          feature: 'idam',
          origin: 'process env'
        },
        foreignMarriageCerts: {
          defaultState: CONF.features.foreignMarriageCerts,
          feature: 'foreignMarriageCerts',
          origin: 'default config'
        },
        onlineSubmission: {
          feature: 'onlineSubmission',
          defaultState: true,
          origin: 'default config'
        }
      };

      supertest(s.app).get('/status/feature-toggles')
        .expect('Content-Type', /json/)
        .expect(statusCode.OK)
        .expect(featureToggles, done);
    });
  });

  describe('displays the correct data based on idam not being set', () => {
    let s = {};
    let features = null;

    beforeEach(() => {
      features = Object.assign({}, CONF.features);
      delete CONF.features.idam;
      s = server.init();
    });

    afterEach(() => {
      CONF.features = features;
      s.http.close();
    });

    it('should return success', done => {
      const featureToggles = {
        idam: {
          feature: 'idam',
          defaultState: false,
          origin: 'other'
        },
        foreignMarriageCerts: {
          feature: 'foreignMarriageCerts',
          defaultState: CONF.features.foreignMarriageCerts,
          origin: 'default config'
        },
        onlineSubmission: {
          defaultState: true,
          feature: 'onlineSubmission',
          origin: 'default config'
        }
      };

      supertest(s.app).get('/status/feature-toggles')
        .expect('Content-Type', /json/)
        .expect(statusCode.OK)
        .expect(featureToggles, done);
    });
  });
});

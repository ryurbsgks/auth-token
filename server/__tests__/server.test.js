const app = require('../index');
const request = require('supertest');
const agent = request(app);
const authenticatedUser = request.agent(app);
const { sign, verify } = require('jsonwebtoken');
const factoryService = require('./helper/FactoryService');
const databaseConnector = require('../lib/databaseConnector');
const DB_CONNECTOR = new databaseConnector();
const { expect, assert } = require('chai');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

describe('Authentication - Server', () => {
  before(async () => {
    await factoryService.init();
    console.log('\n  🏭factory service started.\n');
  });

  describe('Authentication - Database', () => {
    after(async () => {
      await DB_CONNECTOR.terminate();
    });

    it('Should connect to database', async () => {
      let response;

      console.log('DB configurations');
      console.table(DB_CONNECTOR['config']);

      try {
        response = await DB_CONNECTOR.init();
      } catch (e) {
        console.log(e);
      }

      assert.strictEqual(response, 'ok');
    });

    it('should have table `Users` in database', async () => {
      await DB_CONNECTOR.init();

      try {
        await DB_CONNECTOR.query('DESCRIBE Users');
      } catch (error) {
        throw error;
      }
    });
  });

  describe('Authentication - Server', () => {
    before(async () => {
      await DB_CONNECTOR.init();
    });

    after(async () => {
      await DB_CONNECTOR.terminate();
    });

    beforeEach(async () => {
      await factoryService.setup();
      await factoryService.insertTestUser();
    });

    afterEach(async () => {
      await factoryService.deleteTestUser({
        email: `"kimcoding@codestates.com"`,
      });
    });

    const tokenBodyData = {
      id: 1,
      userId: 'kimcoding',
      email: 'kimcoding@codestates.com',
      createdAt: '2020-11-18T10:00:00.000Z',
      updatedAt: '2020-11-18T10:00:00.000Z',
    };

    describe('POST /login', () => {
      it("invalid userId or password request should respond with message 'not authorized'", async () => {
        const response = await agent.post('/login').send({
          userId: 'kimcoding',
          password: 'helloWorld',
        });

        expect(response.body.message).to.eql('not authorized');
      });

      it("valid userId and password request should respond with message 'ok'", async () => {
        const response = await agent.post('/login').send({
          userId: 'kimcoding',
          password: '1234',
        });

        expect(response.body.message).to.eql('ok');
      });

      it('valid userId and password request should respond with access token', async () => {
        const response = await agent.post('/login').send({
          userId: 'kimcoding',
          password: '1234',
        });

        expect(response.body.data.accessToken).to.exist;
      });

      it(`access token in response body should be a jsonwebtoken
      \t- use process.env.ACCESS_SECRET to sign the token.
      `, async () => {
        const response = await agent.post('/login').send({
          userId: 'kimcoding',
          password: '1234',
        });
        const tokenData = verify(
          response.body.data.accessToken,
          process.env.ACCESS_SECRET
        );

        expect(tokenData).to.exist;
        expect(Object.keys(tokenData)).to.eql([
          'id',
          'userId',
          'email',
          'createdAt',
          'updatedAt',
          'iat',
          'exp',
        ]);
      });

      it(`refresh token should be stored in response's cookie`, async () => {
        const response = await agent.post('/login').send({
          userId: 'kimcoding',
          password: '1234',
        });
        const refreshTokenCookieExists = response.headers[
          'set-cookie'
        ].some((cookie) => cookie.includes('refreshToken'));

        expect(refreshTokenCookieExists).to.eql(true);
      });
    });

    describe('GET /accesstokenrequest', () => {
      it(`should filter requests that do not have authorization headers`, async () => {
        const response = await agent.get('/accesstokenrequest');

        expect(response.body.data).to.eql(null);
        expect(response.body.message).to.eql('invalid access token');
      });

      it(`should filter requests that has invalid access token in authorization headers`, async () => {
        const accessToken = sign(tokenBodyData, process.env.ACCESS_SECRET);
        const response = await agent
          .get('/accesstokenrequest')
          .set({ authorization: `Bearer ${accessToken}` });

        expect(response.body.data).to.have.keys('userInfo');
        expect(response.body.data.userInfo).to.not.have.keys('password');
        expect(response.body.data.userInfo).to.eql(tokenBodyData);
        expect(response.body.message).to.eql('ok');
      });
    });

    describe('GET /refreshtokenrequest', () => {
      it(`should filter requests that does not have refresh token in cookies`, async () => {
        const response = await agent.get('/refreshtokenrequest');

        expect(response.body.data).to.eql(null);
        expect(response.body.message).to.eql('refresh token not provided');
      });

      it(`should filter invalid refresh token`, async () => {
        const response = await agent
          .get('/refreshtokenrequest')
          .set('Cookie', 'refreshToken=invalidtoken');

        expect(response.body.data).to.eql(null);
        expect(response.body.message).to.eql(
          'invalid refresh token, please log in again'
        );
      });

      it(`should respond with accessToken, userInfo, and message 'ok' when a valid refresh token is sent`, async () => {
        const refreshToken = sign(tokenBodyData, process.env.REFRESH_SECRET);
        const response = await agent
          .get('/refreshtokenrequest')
          .set('Cookie', `refreshToken=${refreshToken}`);

        expect(response.body.data).to.have.all.keys('accessToken', 'userInfo');
        expect(response.body.data.userInfo).to.not.have.keys('password');
        expect(response.body.data.userInfo).to.eql(tokenBodyData);
        expect(response.body.message).to.eql('ok');
      });
    });
  });

  after(async () => {
    await factoryService.terminate();
    console.log('\n  🏭factory service terminated.\n');
  });
});

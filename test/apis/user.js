/*global describe it beforeEach after */
'use strict';

let expect = require('chai').expect;
let request = require('supertest');
let fixture = require('../fixtures/users.json');

module.exports = (app, db) => {
  describe('User API', () => {
    // setup the model
    let Model = db.User;
    let user1 = new Model(fixture[0]);
    let user2 = new Model(fixture[1]);

    beforeEach((done) => {
      Model.remove()
        .then(() => { user1 = new Model(fixture[0]); })
        .then(user1.save())
        .then(() => { user2 = new Model(fixture[1]); })
        .then(user2.save)
        .then(done());
    });

    after((done) => done());

    it('should list all users', (done) => {
      request(app)
        .get('/api/users')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res.body[0].username).to.equal(user1.username);
          expect(res.body[1].username).to.equal(user2.username);
          done();
        });
    });

    it('should get a user by id', (done) => {
      request(app)
        .get('/api/users/' + user1._id)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res.body.username).to.equal(user1.username);
          done();
        });
    });
  });
};

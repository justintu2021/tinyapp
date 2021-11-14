const { assert } = require('chai');

const { gerUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('gerUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = gerUserByEmail("user@example.com", testUsers)["id"]
    const expectedUserID = "userRandomID";
    assert.strictEqual(user, expectedUserID, 'user exists in our database');

  });

  it('should return undefined', function() {
    const user = gerUserByEmail("user3@example.com", testUsers)
    const expectedUserID = null;
    assert.strictEqual(user, expectedUserID, 'user exists in our database');

  });


});
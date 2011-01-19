var vows = require('vows'),
    assert = require('assert'),
    OAuth2 = require('../lib/oauth2').OAuth2;

vows.describe('OAuth2').addBatch({
  'When getting access token': {
    'get access token': {
      topic: OAuth2,
        'new OAuth2': function(oa){
            assert.ok(new OAuth2(), 'OK');
        }
    }
  }
});

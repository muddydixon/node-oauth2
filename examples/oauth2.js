var OAuth2 = require('../lib/oauth2.js').OAuth2,
    http = require('http'),
    querystring = require('querystring');

// app constant
var CONSUMER_KEY = '',
    CONSUMER_SECRET = '',
    CODE_DOMAIN = 'mixi.jp',
    CODE_PATH = '/connect_authorize.pl',
    AUTH_DOMAIN = 'secure.mixi-platform.com',
    AUTH_PATH = '/2/token',
    MIXI_API_URI = 'api.mixi-platform.com';

    console.log('open below url in your browser and authorization');
    console.log('https://'+CODE_DOMAIN+CODE_PATH+'?'+querystring.stringify({client_id: CONSUMER_KEY, response_type: 'code', scope: 'r_profile r_voice', display: 'pc'}));
    console.log('input query of code in redirected url');
    var mixiOAuth = function(code){
        var mixi = new OAuth2(CONSUMER_KEY, CONSUMER_SECRET, code, AUTH_DOMAIN, AUTH_PATH, 'http://yourredirecteduri', function(){
            if(this._accessToken){
                console.log('success exchange access token');
                this.get('GET', MIXI_API_URI, '/2/people/@me/@self', function(me){
                    this.get('GET', MIXI_API_URI, '/2/voice/statuses/friends_timeline/', function(voices){
                        console.log(voices);
                    });
                });
            }else{
                console.log('failure exchange access token');
                console.log(this);
            }
        });
    };

    var code = '';
    var stdin = process.openStdin();
    stdin.on('data', function(chunk){
        code += chunk;
        if((''+chunk).match(/\n/)){
            code = code.replace(/\n/g, '');
            mixiOAuth(code)
        }
    });


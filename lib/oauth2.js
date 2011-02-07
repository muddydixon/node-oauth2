var http = require('http'),
    querystring = require('querystring'),
    OAuth2 = exports.OAuth2 = function(){this.initialize.apply(this, arguments);};
    OAuth2.prototype = {
        initialize: function(clientId, clientSecret, authCode, authServer, authPath, redirectUri, callback){
            this._authServer = authServer;
            this._authPath = authPath;
            this._clientId = clientId;
            this._clientSecret = clientSecret;
            var self = this,
                _headers = {
                    'HOST': this._authServer,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'NodeJS Client'
                },
            _postData = {
                'grant_type': 'authorization_code',
                'client_id': this._clientId,
                'client_secret': this._clientSecret,
                'code': authCode,
                'redirect_uri': redirectUri
            },
            _request;
            _headers['Content-Length'] = querystring.stringify(_postData).length;
            this._client = http.createClient(443, authServer, true);
            _request = this._client.request('POST', this._authPath, _headers);
            _request.write(querystring.stringify(_postData), 'utf-8');
            _request.on('response', function(response){
                var _result = '';
                response.setEncoding('utf-8');
                response.on('data', function(chunk){
                    _result += chunk;
                });
                response.on('end', function(){
                    self._accessToken = self._refreshToken = self._expiresIn = self._scope = undefined;
                    if(response.statusCode === 200){
                        try{
                            _result = JSON.parse(_result);
                        }catch(ex){
                            _result = querystring.parse(_result);
                        }
                        self._accessToken = _result['access_token'];
                        self._refreshToken = _result['refresh_token'];
                        self._expiresIn = _result['expires_in'];
                        self._scope = (_result['scope']+'').split(' ');
                    }
                    callback.apply(self);
                });
            });
            _request.end();
        },
        refreshToken: function(callback){
            var self = this,
                _headers = {
                    'HOST': this._authServer,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'NodeJS Client'
                },
            _postData = {
                'grant_type': 'refresh_token',
                'client_id': this._clientId,
                'client_secret': this._clientSecret,
                'refresh_token': this._refreshToken
            },
            _request = this._client.request('POST', this._authPath, _headers);
            _request.write(querystring.stringify(_postData), 'utf-8');
            _request.on('response', function(response){
                var _result = '';
                response.setEncoding('utf-8');
                response.on('data', function(chunk){
                    _result += chunk;
                });
                response.on('end', function(){
                    self._accessToken = self._refreshToken = self._expiresIn = self._scope = undefined;
                    if(response.statusCode === 200){
                        try{
                            _result = JSON.parse(_result);
                        }catch(ex){
                            _result = querystring.parse(_result);
                        }
                        self._accessToken = _result['access_token'];
                        self._refreshToken = _result['refresh_token'];
                        self._expiresIn = _result['expires_in'];
                    }
                    callback.apply(self);
                });
            });
            _request.end();
        },
        get: function(method, apiServer, path, data, callback){
            var self = this,
                _client = http.createClient(80, apiServer),
                _headers = {'HOST': apiServer, 'Authorization': 'OAuth '+this._accessToken, 'Content-Type': 'application/x-www-form-urlencoded'},
                _request = _client.request(method, path, _headers);
            if(data){
              var _data = data;
              if(typeof data !== 'string'){
                _data = querystring.stringify(data);
              }
              _request.write(_data);
            }
            _request.on('response', function(response){
                var _result = '';
                response.on('data', function(chunk){
                    _result += chunk;
                });
                response.on('end', function(){
                    if(response.statusCode === 200){
                        try{
                            _result = JSON.parse(_result);
                        }catch(ex){
                            _result = querystring.parse(_result);
                        }
                    }
                    if(!_result.error){
                        callback.apply(self, [_result ? _result : undefined]);
                    }else if(_result.error === 'expired_token'){
                        self.refreshToken(function(){
                            self.get.apply(self, [method, apiServer, path, callback]);
                        });
                    }
                });
            });
            _request.end();
        }
    };


angular.module('PrivateBower')
    .controller('authenticationController', function($q, $http, userContextService, notAuthenticatedInterceptor) {
        var self = angular.extend(this, {
            error: null,
            originalCallRejection: null,
            authenticationDeferred: null,
            authenticationDialogOpened: false,

            authenticate: _authenticate,
            cancelAuthentication: _cancelAuthentication
        });

        _init();
        function _init() {
            if(!notAuthenticatedInterceptor.authenticationResolver) {
                notAuthenticatedInterceptor.authenticationResolver = _onAuthenticationError;
            }
        }

        function _onAuthenticationError(originalCallRejection) {
            if(self.authenticationDialogOpened && self.authenticationDeferred) {
                return $q.reject(originalCallRejection);
            }

            self.authenticationDeferred = $q.defer();
            self.originalCallRejection = originalCallRejection;

            self.authenticationDialogOpened = true;

            return self.authenticationDeferred.promise;
        }

        function _authenticate(authenticationToken) {
            userContextService.setAuthenticationToken(authenticationToken);

            makeOriginalCall();

            function makeOriginalCall() {
                var originalCall = self.originalCallRejection.config;
                $http[originalCall.method.toLowerCase()](originalCall.url, originalCall.data)
                    .success(function(data) {
                        self.error = null;
                        self.authenticationDialogOpened = false;
                        self.authenticationDeferred.resolve(data);
                        self.authenticationDeferred = null;
                        self.originalCallRejection = null;
                    })
                    .error(function() {
                        self.error = 'Invalid authentication token!';
                    });
            }
        }

        function _cancelAuthentication() {
            self.error = null;
            self.authenticationDialogOpened = false;

            self.authenticationDeferred.reject({
                data: 'Authentication failed!'
            });

            self.authenticationDeferred = null;
            self.originalCallRejection = null;
        }
    });
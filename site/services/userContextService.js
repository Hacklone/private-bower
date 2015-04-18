angular.module('PrivateBower')
    .service('userContextService', function UserContextService($http) {
        var self = {
            authenticationToken: null,

            setAuthenticationToken: _setAuthenticationToken
        };

        function _setAuthenticationToken(authenticationToken) {
            self.authenticationToken = authenticationToken;

            $http.defaults.headers.common['Auth-Key'] = self.authenticationToken;
        }

        return self;
    });
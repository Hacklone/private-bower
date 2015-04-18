angular.module('PrivateBower')
    .factory('notAuthenticatedInterceptor', function NotAuthenticatedInterceptor($q) {
        var self = {
            authenticationResolver: null,

            responseError: _onResponseError,
            setAuthenticationResolver: _setAuthenticationResolver
        };

        function _onResponseError(rejection) {
            if(rejection.status === 401 && self.authenticationResolver) {
                return self.authenticationResolver(rejection);
            }

            return $q.reject(rejection);
        }

        function _setAuthenticationResolver(authenticationResolver) {
            self.authenticationResolver = authenticationResolver;
        }

        return self;
    })
    .config(function($httpProvider) {
        $httpProvider.interceptors.push('notAuthenticatedInterceptor');
    });
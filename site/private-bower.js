angular.module('PrivateBower', ['ngAnimate'])
    .controller('mainController', function($scope, $http) {
        angular.extend($scope, {
            packages: null,
            error: false
        });

        init();
        function init() {
            $http.get('/packages')
                .success(function(packages) {
                    $scope.packages = packages;
                })
                .error(function(error) {
                    $scope.error = true;
                });
        }
    });
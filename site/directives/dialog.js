angular.module('PrivateBower')
    .directive('dialog', function() {
        return {
            restrict: 'E',
            template: '<div class="dialog" ng-show="isOpened"><div class="dimmer"><div class="inner"><div ng-transclude=""></div></div></div></div>',
            transclude: true,
            replace: true,
            scope: {
                isOpened: '=',
                onClose: '&'
            }
        };
    });
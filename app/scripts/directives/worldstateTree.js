angular.module(
    'de.cismet.crisma.widgets.worldstateTreeWidget.directives'
).directive('worldstateTree',
    [
        function () {
            'use strict';
            return {
                templateUrl: 'templates/worldstate-tree.html',
                restrict: 'E',
                scope: {
                    selectedWorldstates: '=',
                    activeWorldstate: '=',
                    options: '='
                },
                controller: 'de.cismet.crisma.widgets.worldstateTreeWidget.WorldstateTreeCtrl'
            };
        }
    ]);

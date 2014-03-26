angular.module(
        'de.cismet.crisma.widgets.worldstateTreeWidget.directives',
        [
             'de.cismet.commons.angular.angularTools',
            'de.cismet.crisma.widgets.worldstateTreeWidget.services'
        ]
        ).directive('catalogueFilter',
        [
            'de.cismet.commons.angular.angularTools.AngularTools',
            'de.cismet.crisma.widgets.worldstateTreeWidget.services.Nodes',
            function(AngularTools, Nodes) {
                'use strict';
                return {
                    templateUrl: 'templates/catalogue-filter.html',
                    restrict: 'E',
//                link: function postLink(scope, element) {
//                    
//                },
                    controller: function($scope) {
                        $scope.$watch('filterExpression', function() {
                            if($scope.filterExpression){
                                $scope.filterResult = Nodes.query({
                                    filter: 'name:.*'+$scope.filterExpression+'.*'
                                }, function(data) {
                                    AngularTools.safeApply($scope);
                                });
                            }
                        });
                    },
                    replace: true,
                    scope: {
                        filterResult: '='
                    }
                };
            }
        ]
        );


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
                        $scope.filterClass = {
                            'has-success': false,
                            'has-error': false
                        };
                        $scope.filterIcon = {
                            'glyphicon-ok': false,
                            'glyphicon-warning-sign': false
                        }

                        $scope.$watch('filterExpression', function(newVal, oldVal) {
                            if (newVal !== oldVal) {
                                if ($scope.filterExpression) {
                                    $scope.filterResult = Nodes.query({
                                        filter: 'name:.*' + $scope.filterExpression + '.*'
                                    }, function(data) {
                                        if (data && data.length > 0) {
                                            $scope.filterClass['has-error'] = false;
                                            $scope.filterClass['has-success'] = true;
                                            $scope.filterIcon['glyphicon-ok'] = true;
                                            $scope.filterIcon['glyphicon-warning-sign'] = false;
                                        } else {
                                            $scope.filterClass['has-error'] = true;
                                            $scope.filterClass['has-success'] = false;
                                            $scope.filterIcon['glyphicon-ok'] = false;
                                            $scope.filterIcon['glyphicon-warning-sign'] = true;
                                        }
                                    });
                                } else {
                                    $scope.filterResult = [];
                                    $scope.filterClass['has-error'] = false;
                                    $scope.filterClass['has-success'] = false;
                                    $scope.filterIcon['glyphicon-ok'] = false;
                                    $scope.filterIcon['glyphicon-warning-sign'] = false;
                                }
                            }
                            AngularTools.safeApply($scope);
                        }, false);
                    },
                    replace: true,
                    scope: {
                        filterResult: '='
                    }
                };
            }
        ]
        );


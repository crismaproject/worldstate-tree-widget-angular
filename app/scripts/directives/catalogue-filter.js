angular.module(
    'de.cismet.crisma.widgets.worldstateTreeWidget.directives'
    ).directive('catalogueFilter',
    [
        'de.cismet.crisma.widgets.worldstateTreeWidget.services.Nodes',
        'de.cismet.crisma.widgets.worldstateTreeWidget.services.WorldStateFilterService',
        function (Nodes, WsFilter) {
            'use strict';
            return {
                templateUrl: 'templates/catalogue-filter.html',
                restrict: 'E',
                controller: function ($scope) {
                    $scope.filterClass = {
                        'has-success': false,
                        'has-error': false
                    };
                    $scope.filterIcon = {
                        'glyphicon-ok': false,
                        'glyphicon-warning-sign': false
                    };

                    $scope.$watch('filterExpression', function (newVal, oldVal) {
                        if (newVal !== oldVal) {
                            if ($scope.filterExpression) {
                                Nodes.query({
                                    filter: 'name:.*' + $scope.filterExpression + '.*'
                                }, function (data) {
                                    WsFilter.filterResult.splice(0, WsFilter.filterResult.length);
                                    if (data && data.length > 0) {
                                        WsFilter.filterResult = WsFilter.filterResult.concat(data);
                                    }
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
                                WsFilter.filterResult = [];
                                $scope.filterClass['has-error'] = false;
                                $scope.filterClass['has-success'] = false;
                                $scope.filterIcon['glyphicon-ok'] = false;
                                $scope.filterIcon['glyphicon-warning-sign'] = false;
                            }
                        }
                    }, false);
                },
                replace: true
            };
        }
    ]
    );


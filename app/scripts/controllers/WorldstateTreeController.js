angular.module(
    'de.cismet.crisma.widgets.worldstateTreeWidget.controllers'
    ).controller(
    'de.cismet.crisma.widgets.worldstateTreeWidget.WorldstateTreeCtrl',
    [
        '$scope',
        'de.cismet.collidingNameService.Nodes',
        'de.cismet.crisma.ICMM.Worldstates',
        '$q',
        function ($scope, Nodes, Worldstates, $q) {
            'use strict';
            var activeWorldstateWatchChanged, selectedWorldstateWatchChanged;
            activeWorldstateWatchChanged = false;
            selectedWorldstateWatchChanged = false;

            function getNodeKeyForWorldstate(ws) {
                var defer;
                defer = $q.defer();
                Worldstates.get(
                    {
                        'wsId': ws.id,
                        level: 100,
                        field: 'parentworldstate,id',
                        deduplicate: true
                    },
                    function (parents) {
                        var key;
                        key = parents.id;
                        while (parents.parentworldstate) {
                            parents = parents.parentworldstate;
                            key += '.' + parents.id;
                        }
                        key = '' + key;
                        defer.resolve(key.split('.').reverse().join('.'));
                    }
                );
                return defer.promise;
            }

            function getNodeForWorldState(ws) {
                var def = $q.defer();

                getNodeKeyForWorldstate(ws).then(function (key) {
                    Nodes.get({nodeId: Nodes.utils.getRequestIdForNodeKey(key)}, function (node) {
                        def.resolve(node);
                    });
                });

                return def.promise;
            }

            /*
             * when the activeNode changes, the user has activated a node in the tree
             * we need to the fetch the corresponding worldstate for that node and 
             * update the activeWorldstate property.
             * This watch is also fired since the activeWorldstate watch updates the active node
             * In that case we must ensure that this watch does not updates the activeNode 
             * to avoid an infinite loop of watch calls.
             */
            $scope.activeNode = {};
            $scope.$watch('activeNode', function (newVal, oldVal) {
                var id;
                if (activeWorldstateWatchChanged) {
                    activeWorldstateWatchChanged = false;
                    return;
                }
                if (!angular.equals(newVal, oldVal)) {
                    id = $scope.activeNode.objectKey;
                    id = id.substring(id.lastIndexOf('/') + 1, id.length);
                    Worldstates.get({wsId: id, level: 2}, function (worldstate) {
                        $scope.activeWorldstate = worldstate;
                    });
                }
            });

            /*
             * the active worldstate can change when the object was chagned from the directive
             * outer scope or from the activeNode watch.
             */
            $scope.$watch('activeWorldstate', function (newVal, oldVal) {
                if (!angular.equals(newVal, oldVal)) {
                    getNodeForWorldState($scope.activeWorldstate).then(function (node) {
                        activeWorldstateWatchChanged = true;
                        $scope.activeNode = node;
                    });
                }
            });

            /*
             * when the selectedNodes changes the user has selected a node in the tree.
             * we need to fetch the worldstate for that node and update the selectedWorldstate 
             * array.
             * the selectedNodes can also be changed from the selectedWorldstate watch. In that
             * case we must ensure that this watch does not updates the selectedWorldstates 
             * to avoid an infinite loop of watch calls.
             */
            $scope.selectedNodes = [];
            $scope.$watch('selectedNodes', function (newVal, oldVal) {
                var i, newSelectedWorldstates, id;
                if (selectedWorldstateWatchChanged && angular.equals(newVal, oldVal)) {
                    selectedWorldstateWatchChanged = false;
                    return;
                }
                if (!angular.equals(newVal, oldVal)) {
                    //if the selectedNodes array is empty we must empty the selectedWorldstates array
                    if (newVal.length === 0) {
                        $scope.selectedWorldstates.splice(0, $scope.selectedWorldstates.length);
                    } else {
                        newSelectedWorldstates = [];
                        for (i = 0; i < $scope.selectedNodes.length; i++) {
                            id = $scope.selectedNodes[i].objectKey;
                            id = id.substring(id.lastIndexOf('/') + 1, id.length);
                            /*jshint -W083 */
                            Worldstates.get({wsId: id, level: 2}, function (worldstate) {
                                newSelectedWorldstates.push(worldstate);
                                if (newSelectedWorldstates.length === $scope.selectedNodes.length) {
                                    $scope.selectedWorldstates = newSelectedWorldstates;
                                }
                            });
                        }
                        $q.all(newSelectedWorldstates).then(function (worldstates) {
                            $scope.selectedWorldstates = worldstates;
                        });
                    }
                }
            }, true);

            /*
             * the  selectedWorldstate array can change when the object was changed in scope outside
             * the directive or from the selectedNodes watch.
             */
            $scope.$watch('selectedWorldstates', function (newVal, oldVal) {
                var i, newSelectedNodes;
                if (!angular.equals(newVal, oldVal)) {
                    newSelectedNodes = [];
                    for (i = 0; i < $scope.selectedWorldstates.length; i++) {
                        newSelectedNodes.push(getNodeForWorldState($scope.selectedWorldstates[i]));
                    }
                    $q.all(newSelectedNodes).then(function (selectedNodes) {
                        if (!angular.equals(selectedNodes, $scope.selectedNodes)) {
                            selectedWorldstateWatchChanged = true;
                        }
                        $scope.selectedNodes = selectedNodes;
                    });
                }
            }, true);

            /*
             * We need to fetch the top level worldstates of the tree 
             * and convert them to nodes.
             */
            Worldstates.query({level: 2, filter: 'parentworldstate:null'}, function (wsArr) {
                var i, wsNodesPromises;
                if (wsArr && wsArr.length > 0) {
                    wsNodesPromises = [];
                    for (i = 0; i < wsArr.length; i++) {
                        wsNodesPromises.push(getNodeForWorldState(wsArr[i]));
                    }
                    $q.all(wsNodesPromises).then(function (data) {
                        $scope.topLevelNodes = data;
                    });
                }
            });

        }
    ]
    );
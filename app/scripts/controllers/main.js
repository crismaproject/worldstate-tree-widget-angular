angular.module(
    'de.cismet.crisma.widgets.worldstateTreeWidget.controllers',
    [
        'de.cismet.crisma.widgets.worldstateTreeWidget.services'
    ]
).controller(
    'MainCtrl',
    [
        '$scope',
        'de.cismet.crisma.widgets.worldstateTreeWidget.services.Nodes',
        'de.cismet.crisma.widgets.worldstateTreeWidget.services.WorldStateFilterService',
        function ($scope, Nodes, WsFilter) {
            'use strict';
            $scope.WsFilter = WsFilter;
            $scope.treeSelection = [];
            $scope.showFilter = true;
            $scope.activeItem = {};
            $scope.isWorldstateIcon = false;
            $scope.treeOptions = {
                checkboxClass: 'glyphicon glyphicon-unchecked',
                folderIconClosed: 'icon-folder-close.png',
                folderIconOpen: 'icon-folder-open.png',
                leafIcon: 'icon-file.png',
                imagePath: './images/',
                multiSelection: false,
                showFilter: true
            };
            $scope.switchIcon = function () {
                if (!$scope.isWorldstateIcon) {
                    $scope.treeOptions.folderIconClosed = 'icon-world.png';
                    $scope.treeOptions.folderIconOpen = 'icon-world.png';
                    $scope.treeOptions.leafIcon = 'icon-world.png';
                } else {
                    $scope.treeOptions.folderIconClosed = 'icon-folder-close.png';
                    $scope.treeOptions.folderIconOpen = 'icon-folder-open.png';
                    $scope.treeOptions.leafIcon = 'icon-file.png';
                }
                $scope.isWorldstateIcon = !$scope.isWorldstateIcon;
            };
            $scope.switchTreeMode = function () {
                $scope.treeOptions.multiSelection = !$scope.treeOptions.multiSelection;
            };
            $scope.nodes = Nodes.query({
                filter: 'parentworldstate:null'
            });
        }
    ]
);
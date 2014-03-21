'use strict';

angular.module('de.cismet.crisma.widgets.worldstateTreeWidget.controllers', ["de.cismet.crisma.widgets.worldstateTreeWidget.services"])
        .controller('MainCtrl', ['$scope', '$timeout', 'de.cismet.crisma.widgets.worldstateTreeWidget.services.Nodes', function($scope, $timeout, Nodes) {
                $scope.treeSelection = [];
                $scope.activeItem;
                $scope.isWorldstateIcon = false;
                $scope.treeOptions = {
                    checkboxClass: "glyphicon glyphicon-unchecked",
                    folderIconClosed: "icon-folder-close.png",
                    folderIconOpen: "icon-folder-open.png",
                    leafIcon: "icon-file.png",
                    imagePath: "./images/",
                    multiSelection: false
                };

                $scope.switchIcon = function() {
                    if (!$scope.isWorldstateIcon) {
                        $scope.treeOptions.folderIconClosed = "icon-world.png";
                        $scope.treeOptions.folderIconOpen = "icon-world.png";
                        $scope.treeOptions.leafIcon = "icon-world.png";
                    } else {
                        $scope.treeOptions.folderIconClosed = "icon-folder-close.png";
                        $scope.treeOptions.folderIconOpen = "icon-folder-open.png";
                        $scope.treeOptions.leafIcon = "icon-file.png";
                    }
                    $scope.isWorldstateIcon = !$scope.isWorldstateIcon;
                }
                $scope.switchTreeMode = function() {
                    $scope.treeOptions.multiSelection = !$scope.treeOptions.multiSelection;
                };
                $scope.nodes = Nodes.query(function(data) {
                    console.log(data);
                });
            }]);

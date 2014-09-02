angular.module('de.cismet.crisma.widgets.worldstateTreeWidget', [
  'de.cismet.crisma.widgets.worldstateTreeWidget.directives',
  'de.cismet.crisma.widgets.worldstateTreeWidget.controllers'
]);
angular.module('de.cismet.crisma.widgets.worldstateTreeWidget.controllers', ['de.cismet.cids.rest.collidngNames.Nodes']).controller('MainCtrl', [
  '$scope',
  'de.cismet.collidingNameService.Nodes',
  function ($scope, Nodes) {
    'use strict';
    $scope.activeItem = {};
    $scope.isWorldstateIcon = false;
    $scope.treeOptions = {
      checkboxClass: 'glyphicon glyphicon-unchecked',
      folderIconClosed: 'icon-folder-close.png',
      folderIconOpen: 'icon-folder-open.png',
      leafIcon: 'icon-file.png',
      imagePath: './images/',
      multiSelection: true
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
    $scope.treeSelection = [];
    Nodes.query(function (data) {
      $scope.nodes = data;
    });
  }
]);
angular.module('de.cismet.crisma.widgets.worldstateTreeWidget.directives', ['de.cismet.commons.angular.angularTools']).directive('catalogueTree', [
  'de.cismet.commons.angular.angularTools.AngularTools',
  function (AngularTools) {
    'use strict';
    return {
      templateUrl: 'templates/catalogue-tree.html',
      restrict: 'E',
      link: function postLink(scope, element) {
        var dynaTreeRootNodes = [], scopeOptionsValue, dynatreeOptions, deregisterWatch, regardSelection, isInitialized = false, defaultClassNames = {
            container: 'dynatree-container',
            node: 'dynatree-node',
            folder: 'dynatree-folder',
            empty: 'dynatree-empty',
            vline: 'dynatree-vline',
            expander: 'dynatree-expander',
            connector: 'dynatree-connector',
            checkbox: 'dynatree-checkbox',
            nodeIcon: 'dynatree-icon',
            title: 'dynatree-title',
            noConnector: 'dynatree-no-connector',
            nodeError: 'dynatree-statusnode-error',
            nodeWait: 'dynatree-statusnode-wait',
            hidden: 'dynatree-hidden',
            combinedExpanderPrefix: 'dynatree-exp-',
            combinedIconPrefix: 'dynatree-ico-',
            hasChildren: 'dynatree-has-children',
            active: 'dynatree-active',
            selected: 'dynatree-selected',
            expanded: 'dynatree-expanded',
            lazy: 'dynatree-lazy',
            focused: 'dynatree-focused',
            partsel: 'dynatree-partsel',
            lastsib: 'dynatree-lastsib'
          }, copyDefaultOptions = function () {
            var cn = {}, prop;
            for (prop in defaultClassNames) {
              if (defaultClassNames.hasOwnProperty(prop)) {
                cn[prop] = defaultClassNames[prop];
              }
            }
            return cn;
          }, getIcon = function (isLeaf, isExpanded) {
            var icon;
            if (isLeaf) {
              icon = scope.options.leafIcon || '';
            } else {
              if (isExpanded) {
                icon = scope.options.folderIconOpen || '';  // "icon-folder-open.png";
              } else {
                icon = scope.options.folderIconClosed || '';  //"icon-folder-close.png";
              }
            }
            return icon;
          }, creatDynaTreeNode = function (cidsNode) {
            var icon, dynaTreeNode;
            icon = getIcon(cidsNode.isLeaf, false, cidsNode);
            dynaTreeNode = {
              title: cidsNode.name,
              isFolder: !cidsNode.isLeaf,
              isLazy: !cidsNode.isLeaf,
              cidsNode: cidsNode,
              icon: icon
            };
            return dynaTreeNode;
          },
          //apply the modus for the interaction type to the dynatree options
          registerEventCallbacks = function (useMultiSelect, atRutnime) {
            var dblClickCb, onKeyDownCB, checkBox, clickfolderMode, autoFocus, onClickCB, onFocusCB, cn = copyDefaultOptions();
            if (useMultiSelect) {
              checkBox = true;
              dblClickCb = function (node, event) {
                // We should not toggle, if target was "checkbox", because this
                // would result in double-toggle (i.e. no toggle)
                if (node.getEventTargetType(event) === 'title') {
                  node.toggleSelect();
                }
              };
              onKeyDownCB = function (node, event) {
                if (event.which === 32) {
                  node.toggleSelect();
                  return false;
                }
              };
            } else {
              clickfolderMode = 1;
              cn.selected = 'tree-select';
              autoFocus = false;
              onClickCB = function (node, event) {
                var j, selectedDynaTreeNodes;
                if (node.getEventTargetType(event) === 'expander') {
                  node.expand(!node.isExpanded());
                }
                if (node.getEventTargetType(event) === 'checkbox') {
                  return true;
                }
                if (!event.ctrlKey) {
                  //single selection => clear selection
                  selectedDynaTreeNodes = node.tree.getSelectedNodes();
                  for (j = 0; j < selectedDynaTreeNodes.length; j++) {
                    selectedDynaTreeNodes[j].select(false);
                  }
                }
                node.activate();
                node.toggleSelect();
                return false;
              };
              dblClickCb = function (node, event) {
                if (node.getEventTargetType(event) === 'title') {
                  node.expand(!node.isExpanded());
                  return false;
                }
              };
              onFocusCB = function (node) {
                var tree = element.dynatree('getTree'), selectedNodes = tree.getSelectedNodes(false), j, tmpNode;
                for (j = 0; j < selectedNodes.length; j++) {
                  tmpNode = selectedNodes[j];
                  tmpNode.toggleSelect();
                }
                node.activate();
                node.select(true);
                return true;
              };
            }
            if (atRutnime) {
              element.dynatree('option', 'checkbox', checkBox || false);
              element.dynatree('option', 'onDblClick', dblClickCb || null);
              element.dynatree('option', 'onClick', onClickCB || null);
              element.dynatree('option', 'onFocus', onFocusCB || null);
              element.dynatree('option', 'onKeydown', onKeyDownCB || null);
              element.dynatree('option', 'clickFolderMode', clickfolderMode || 3);
              element.dynatree('option', 'classNames', cn);
              element.dynatree('option', 'autoFocus', autoFocus || true);
            } else {
              dynatreeOptions.checkbox = checkBox || false;
              dynatreeOptions.onDblClick = dblClickCb || null;
              dynatreeOptions.onKeydown = onKeyDownCB || null;
              dynatreeOptions.clickFolderMode = clickfolderMode || 3;
              dynatreeOptions.classNames = cn;
              dynatreeOptions.autoFocus = autoFocus || true;
              dynatreeOptions.onClick = onClickCB || null;
              dynatreeOptions.onFocus = onFocusCB || null;
            }
          };
        // when the directive is initialized the nodes array can be empty. 
        // This watch listens for changes in the array builds the first level nodes from it.
        deregisterWatch = scope.$watchCollection('nodes', function (newVal, oldval) {
          var j, k, dynatreeRoot, cidsNode, dynatreeNode, childNode;
          if (newVal !== oldval) {
            //                      scope.selectedNodes.splice(0,scope.selectedNodes.length);
            if (scope.selectedNodes && scope.selectedNodes.length > 0) {
              regardSelection = true;
            }
            scope.activeNode = undefined;
            dynatreeRoot = element.dynatree('getRoot');
            dynatreeRoot.removeChildren();
            for (j = 0; j < newVal.length; j++) {
              cidsNode = newVal[j];
              dynatreeNode = creatDynaTreeNode(cidsNode);
              childNode = dynatreeRoot.addChild(dynatreeNode);
              if (regardSelection) {
                for (k = 0; j < scope.selectedNodes.length; k++) {
                  if (scope.selectedNodes[k].key === dynatreeNode.cidsNode.key) {
                    childNode.toggleSelect();
                    break;
                  }
                }
              }
            }
          }
        });
        // it can happen that the selectedNodes array bounded to this directive contains 
        // the same worldstate object multiple times. This directive still works properly in that case
        // but we log an error that to propagate this deficiency
        scope.$watch('selectedNodes', function () {
          var i, selNode, visitedNode;
          visitedNode = [];
          if (scope.selectedNodes) {
            for (i = 0; i < scope.selectedNodes.length; i++) {
              selNode = scope.selectedNodes[i];
              if (visitedNode[selNode.key]) {
                console.error('The worldstate ' + selNode.key + ' is contained multiple times in the ' + 'selectedNodes property bound to the worldstateTreeWidget. Multiple items ' + 'are ignored by the worldstateTreeWidget but should be avoided');
              } else {
                visitedNode[selNode.key] = selNode;
              }
            }
          }
        });
        // watch for changes in the option object
        scope.$watch('options', function (newVal, oldVal) {
          var iconChanged = false, value, oldValue, hasChanged, key, isNewProp;
          if (isInitialized) {
            for (key in scope.options) {
              value = newVal[key];
              oldValue = oldVal[key];
              hasChanged = value !== oldValue;
              isNewProp = value && !oldValue;
              if (hasChanged || isNewProp) {
                switch (key) {
                case 'checkboxClass':
                  element.dynatree('option', 'classNames.checkbox', value);
                  break;
                case 'checkboxEnabled':
                  element.dynatree('option', 'checkbox', value);
                  break;
                case 'imagePath':
                  element.dynatree('option', 'imagePath', value);
                  break;
                case 'multiSelection':
                  registerEventCallbacks(value, true);
                  break;
                case 'folderIconClosed':
                  iconChanged = true;
                  break;
                case 'folderIconOpen':
                  iconChanged = true;
                  break;
                case 'leafIcon':
                  iconChanged = true;
                  break;
                }
              }
            }
          } else {
            isInitialized = true;
          }
          element.dynatree('getRoot').visit(function (node) {
            if (iconChanged) {
              node.data.icon = getIcon(node.data.cidsNode.isLeaf, node.isExpanded(), node.data.cidsNode);
            }
            node.render();
          }, false);
        }, true);
        //Common options for the dynatree
        dynatreeOptions = {
          selectMode: 2,
          children: dynaTreeRootNodes,
          classNames: defaultClassNames,
          onActivate: function (node) {
            scope.activeNode = node.data.cidsNode;
            AngularTools.safeApply(scope);
          },
          onSelect: function (selected, node) {
            var index, selectedCidsObject;
            selectedCidsObject = node.data.cidsNode;
            if (selected) {
              //check if the node is not already contained..
              if (scope.selectedNodes.indexOf(selectedCidsObject) === -1) {
                scope.selectedNodes.push(selectedCidsObject);
              }
            } else {
              index = scope.selectedNodes.indexOf(selectedCidsObject);
              if (index >= 0) {
                scope.selectedNodes.splice(index, 1);
              }
            }
            AngularTools.safeApply(scope);
            return false;
          },
          onExpand: function (node) {
            node.data.icon = getIcon(node.data.cidsNode.isLeaf, node.isExpanded(), node.data.cidsNode);
            node.render();
            return true;
          },
          onLazyRead: function (node) {
            var cidsNode, callback, childNode, addedChildNode;
            cidsNode = node.data.cidsNode;
            node.data.addClass = 'dynatree-loading';
            node.render();
            callback = function (children) {
              var i, cidsNodeCB;
              for (i = 0; i < children.length; i++) {
                cidsNodeCB = children[i];
                childNode = creatDynaTreeNode(cidsNodeCB);
                addedChildNode = node.addChild(childNode);
                if (regardSelection) {
                  for (var j = 0; j < scope.selectedNodes.length; j++) {
                    if (scope.selectedNodes[j].key === childNode.cidsNode.key) {
                      addedChildNode.toggleSelect();
                      break;
                    }
                  }
                }
              }
              node.data.addClass = '';
              /*jshint camelcase: false */
              node.setLazyNodeStatus(DTNodeStatus_Ok);
              node.data.icon = getIcon(node.data.cidsNode.isLeaf, node.isExpanded(), node.data.cidsNode);
              node.render();
            };
            cidsNode.getChildren(callback);
          }
        };
        //apply the options defined in the directive to the dynatree object
        if (scope.options) {
          for (var key in scope.options) {
            scopeOptionsValue = scope.options[key];
            switch (key) {
            case 'checkboxClass':
              dynatreeOptions.classNames.checkbox = scopeOptionsValue;
              break;
            case 'checkboxEnabled':
              dynatreeOptions.checkbox = scopeOptionsValue || false;
              break;
            case 'imagePath':
              dynatreeOptions.imagePath = scopeOptionsValue;
              break;
            case 'multiSelection':
              registerEventCallbacks(scopeOptionsValue);
              break;
            }
          }
        }
        element.dynatree(dynatreeOptions);
      },
      replace: true,
      scope: {
        nodes: '=',
        selectedNodes: '=selection',
        activeNode: '=?',
        options: '=?'
      }
    };
  }
]);
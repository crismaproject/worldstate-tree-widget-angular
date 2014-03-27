angular.module(
        'de.cismet.crisma.widgets.worldstateTreeWidget.directives'
        ).directive('catalogueTree',
        [
            'de.cismet.commons.angular.angularTools.AngularTools',
            function(AngularTools) {
                'use strict';
                return {
                    templateUrl: 'templates/catalogue-tree.html',
                    restrict: 'E',
                    link: function postLink(scope, element) {
                        var dynaTreeRootNodes = [], scopeOptionsValue,
                                dynatreeOptions, deregisterWatch,
                                treeBackup, backupNeeded = true,
                                isInitialized = false,
                                // get the div element we wont to put the dynatree
//                        elemChilds = element.children(),
                                dynatreeRootElem = angular.element("#tree"),
                                defaultClassNames = {
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
                                },
                        copyDefaultOptions = function() {
                            var cn = {};
                            for (var prop in defaultClassNames) {
                                if (defaultClassNames.hasOwnProperty(prop)) {
                                    cn[prop] = defaultClassNames[prop];
                                }
                            }
                            return cn;
                        },
                                getIcon = function(isLeaf, isExpanded) {
                                    var icon;
                                    if (isLeaf) {
                                        icon = scope.options.leafIcon || '';
                                    } else {
                                        if (isExpanded) {
                                            icon = scope.options.folderIconOpen || '';// "icon-folder-open.png";
                                        } else {
                                            icon = scope.options.folderIconClosed || '';//"icon-folder-close.png";
                                        }
                                    }
                                    return icon;
                                },
                                creatDynaTreeNode = function(cidsNode) {
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
                                registerEventCallbacks = function(useMultiSelect, atRutnime) {
                                    var dblClickCb, onKeyDownCB, checkBox, clickfolderMode,
                                            autoFocus, onClickCB, onFocusCB,
                                            cn = copyDefaultOptions();
                                    if (useMultiSelect) {
                                        checkBox = true;
                                        dblClickCb = function(node, event) {
                                            // We should not toggle, if target was "checkbox", because this
                                            // would result in double-toggle (i.e. no toggle)
                                            if (node.getEventTargetType(event) === 'title') {
                                                node.toggleSelect();
                                            }
                                        };

                                        onKeyDownCB = function(node, event) {
                                            if (event.which === 32) {
                                                node.toggleSelect();
                                                return false;
                                            }
                                        };

                                    } else {
                                        clickfolderMode = 1;
                                        cn.selected = 'tree-select';
                                        autoFocus = false;
                                        onClickCB = function(node, event) {
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

                                        dblClickCb = function(node, event) {
                                            if (node.getEventTargetType(event) === 'title') {
                                                node.expand(!node.isExpanded());
                                                return false;
                                            }
                                        };
                                        onFocusCB = function(node) {
                                            var tree = dynatreeRootElem.dynatree('getTree'),
                                                    selectedNodes = tree.getSelectedNodes(false),
                                                    j,
                                                    tmpNode;
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
                                        dynatreeRootElem.dynatree('option', 'checkbox', checkBox || false);
                                        dynatreeRootElem.dynatree('option', 'onDblClick', dblClickCb || null);
                                        dynatreeRootElem.dynatree('option', 'onClick', onClickCB || null);
                                        dynatreeRootElem.dynatree('option', 'onFocus', onFocusCB || null);
                                        dynatreeRootElem.dynatree('option', 'onKeydown', onKeyDownCB || null);
                                        dynatreeRootElem.dynatree('option', 'clickFolderMode', clickfolderMode || 3);
                                        dynatreeRootElem.dynatree('option', 'classNames', cn);
                                        dynatreeRootElem.dynatree('option', 'autoFocus', autoFocus || true);
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
                        deregisterWatch = scope.$watchCollection('nodes', function(newVal) {
                            var j, dynatreeRoot, cidsNode;
                            for (j = 0; j < newVal.length; j++) {
                                cidsNode = newVal[j];
                                dynatreeRoot = dynatreeRootElem.dynatree('getRoot');
                                dynatreeRoot.addChild(creatDynaTreeNode(cidsNode));
                            }
                            deregisterWatch();
                        });

                        scope.$watch('filterResult', function(newVal, oldVal) {
                            var dynatreeRoot, node;
                            // if the filter result changes, we need to save the current tree
                            // and need to make a new tree with the filter result
                            if (newVal !== oldVal) {
                                //we need to change the tree
                                dynatreeRoot = dynatreeRootElem.dynatree('getRoot');
                                if (backupNeeded) {
                                    treeBackup = dynatreeRoot.getChildren();
                                    backupNeeded = false;
                                }
                                dynatreeRoot.removeChildren();
                                if (scope.filterResult.length <= 0) {
                                    for (var i = 0; i < treeBackup.length; i++) {
                                        node = treeBackup[i];
                                        dynatreeRoot.addChild(creatDynaTreeNode(node.data.cidsNode));
                                    }
                                } else {
                                    for (var i = 0; i < newVal.length; i++) {
                                        node = newVal[i];
                                        dynatreeRoot.addChild(creatDynaTreeNode(node));
                                    }
                                    dynatreeRootElem.dynatree('getRoot').visit(function(node) {
                                        node.render();
                                    });
                                }
                             }
                        }, true);

                        // watch for changes in the option object
                        scope.$watch('options', function(newVal, oldVal) {
                            var iconChanged = false, value, oldValue, hasChanged,
                                    isNewProp;
                            if (isInitialized) {
                                for (var key in scope.options) {
                                    value = newVal[key];
                                    oldValue = oldVal[key];
                                    hasChanged = value !== oldValue;
                                    isNewProp = value && !oldValue;
                                    if (hasChanged || isNewProp) {
                                        switch (key) {
                                            case 'checkboxClass':
                                                dynatreeRootElem.dynatree('option', 'classNames.checkbox', value);
                                                break;
                                            case 'checkboxEnabled':
                                                dynatreeRootElem.dynatree('option', 'checkbox', value);
                                                break;
                                            case 'imagePath':
                                                dynatreeRootElem.dynatree('option', 'imagePath', value);
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
                                            case 'showFilter':
                                                scope.showFilter=value;
                                                break;
                                        }
                                    }
                                }
                            } else {
                                isInitialized = true;
                            }
                            dynatreeRootElem.dynatree('getRoot').visit(function(node) {
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
                            onActivate: function(node) {
                                scope.activeNode = node.data.cidsNode;
                                AngularTools.safeApply(scope);
                            },
                            onSelect: function(selected, node) {
                                var index, selectedCidsObject;
                                selectedCidsObject = node.data.cidsNode;
                                if (selected) {
                                    scope.selectedNodes.push(selectedCidsObject);
                                } else {
                                    index = scope.selectedNodes.indexOf(selectedCidsObject);
                                    if (index >= 0) {
                                        scope.selectedNodes.splice(index, 1);
                                    }
                                }
                                AngularTools.safeApply(scope);
                                return false;
                            },
                            onExpand: function(node) {
                                node.data.icon = getIcon(node.data.cidsNode.isLeaf, node.isExpanded(), node.data.cidsNode);
                                node.render();
                                return true;
                            },
                            onLazyRead: function(node) {
                                var cidsNode, callback, childNode;
                                cidsNode = node.data.cidsNode;
                                node.data.addClass = 'dynatree-loading';
                                node.render();
                                callback = function(children) {
                                    var i, cidsNodeCB;
                                    for (i = 0; i < children.length; i++) {
                                        cidsNodeCB = children[i];
                                        childNode = creatDynaTreeNode(cidsNodeCB);
                                        node.addChild(childNode);
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
                                    case 'showFilter':
                                        scope.showFilter=scopeOptionsValue;
                                        break;
                                }
                            }
                        }

                        dynatreeRootElem.dynatree(dynatreeOptions);
                    },
                    controller: function($scope) {
                        $scope.filterResult = [];
                    },
                    replace: true,
                    scope: {
                        nodes: '=',
                        selectedNodes: '=selection',
                        activeNode: '=?',
                        options: '=?',
                    }
                };
            }
        ]
        );

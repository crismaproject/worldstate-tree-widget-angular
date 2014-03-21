'use strict';
angular.module('de.cismet.crisma.widgets.worldstateTreeWidget.directives', ["de.cismet.commons.angular.angularTools"])
        .directive('catalogueTree', ["de.cismet.commons.angular.angularTools.AngularTools", function(AngularTools) {
                return {
                    templateUrl: 'templates/catalogue-tree.html',
                    restrict: 'E',
                    link: function postLink(scope, element, attrs) {
                        var dynaTreeRootNodes = [];
                        var deregisterWatch, i, cidsNode, dynatreeOptions, creatDynaTreeNode, getIcon;
                        var isInitialized = false;
                        var defaultClassNames = {
                            container: "dynatree-container",
                            node: "dynatree-node",
                            folder: "dynatree-folder",
                            empty: "dynatree-empty",
                            vline: "dynatree-vline",
                            expander: "dynatree-expander",
                            connector: "dynatree-connector",
                            checkbox: "dynatree-checkbox",
                            nodeIcon: "dynatree-icon",
                            title: "dynatree-title",
                            noConnector: "dynatree-no-connector",
                            nodeError: "dynatree-statusnode-error",
                            nodeWait: "dynatree-statusnode-wait",
                            hidden: "dynatree-hidden",
                            combinedExpanderPrefix: "dynatree-exp-",
                            combinedIconPrefix: "dynatree-ico-",
                            hasChildren: "dynatree-has-children",
                            active: "dynatree-active",
                            selected: "dynatree-selected",
                            expanded: "dynatree-expanded",
                            lazy: "dynatree-lazy",
                            focused: "dynatree-focused",
                            partsel: "dynatree-partsel",
                            lastsib: "dynatree-lastsib"
                        };
                        var copyDefaultOptions = function() {
                            var cn = {};
                            for (var prop in defaultClassNames) {
                                cn[prop] = defaultClassNames[prop];
                            }
                            return cn;
                        }
                        creatDynaTreeNode = function(cidsNode) {
                            var icon, dynaTreeNode;
                            icon = getIcon(cidsNode.isLeaf, false, cidsNode);

                            dynaTreeNode = {
                                title: cidsNode.name,
                                isFolder: !cidsNode.isLeaf,
                                isLazy: !cidsNode.isLeaf,
                                cidsNode: cidsNode,
                                icon: icon,
                            };
                            return dynaTreeNode;
                        };

                        getIcon = function(isLeaf, isExpanded, cidsNode) {
                            var icon;
                            if (isLeaf) {
                                icon = scope.options.leafIcon || "";//icon-file.png";
                            } else {
                                if (isExpanded) {
                                    icon = scope.options.folderIconOpen || "";// "icon-folder-open.png";
                                } else {
                                    icon = scope.options.folderIconClosed || "";//"icon-folder-close.png";
                                }
                            }
                            return icon;
                        };

                        // when the directive is initialized the nodes array can be empty. 
                        // This watch listens for changes in the array builds the first level nodes from it.
                        deregisterWatch = scope.$watchCollection('nodes', function(newVal, oldVal) {
                            var i, dynatreeRoot;

                            for (i = 0; i < newVal.length; i++) {
                                cidsNode = newVal[i];
                                dynatreeRoot = element.dynatree("getRoot");
                                dynatreeRoot.addChild(creatDynaTreeNode(cidsNode));
                            }

                            deregisterWatch();
                        });

                        // watch for changes in the option object
                        scope.$watch('options', function(newVal, oldVal) {
                            var iconChanged = false;
                            if (isInitialized) {
                                for (var key in scope.options) {
                                    var value = newVal[key];
                                    var oldValue = oldVal[key];
                                    var hasChanged = value !== oldValue;
                                    var isNewProp = value && !oldValue;
                                    if (hasChanged || isNewProp) {
                                        switch (key) {
                                            case "checkboxClass":
                                                element.dynatree("option", "classNames.checkbox", value);
                                                break;
                                            case "checkboxEnabled":
                                                element.dynatree("option", "checkbox", value);
                                                break;
                                            case "imagePath":
                                                element.dynatree("option", "imagePath", value);
                                                break;
                                            case "multiSelection":
                                                registerEventCallbacks(value, true);
                                                break;
                                            case "folderIconClosed":
                                                iconChanged = true;
                                                break;
                                            case "folderIconOpen":
                                                iconChanged = true;
                                                break;
                                            case "leafIcon":
                                                iconChanged = true;
                                                break;
                                        }
                                    }
                                }
                            } else {
                                isInitialized = true;
                            }
//                            element.dynatree("getTree").redraw();
                            element.dynatree("getRoot").visit(function(node) {
                                if (iconChanged) {
                                    node.data.icon = getIcon(node.data.cidsNode.isLeaf, node.isExpanded(), node.data.cidsNode);
                                }
                                node.render();
                            }, false);
                        }, true);

                        //apply the modus for the interaction type to the dynatree options
                        var registerEventCallbacks = function(useMultiSelect, atRutnime) {
                            var dblClickCb, onKeyDownCB, checkBox, clickfolderMode,
                                    autoFocus, onClickCB, onFocusCB;
                            var cn = copyDefaultOptions();
                            if (useMultiSelect) {
                                checkBox = true;
                                dblClickCb = function(node, event) {
                                    // We should not toggle, if target was "checkbox", because this
                                    // would result in double-toggle (i.e. no toggle)
                                    if (node.getEventTargetType(event) === "title")
                                        node.toggleSelect();
                                };

                                onKeyDownCB = function(node, event) {
                                    if (event.which === 32) {
                                        node.toggleSelect();
                                        return false;
                                    }
                                };

                            } else {
                                clickfolderMode = 1;
                                cn.selected = "tree-select";
                                autoFocus = false;
                                onClickCB = function(node, event) {
                                    var flag;
                                    if (node.getEventTargetType(event) === "expander") {
                                        node.expand(!node.isExpanded());
                                    }
                                    if (node.getEventTargetType(event) === "checkbox") {
                                        return true;
                                    }
                                    flag = false;
                                    if (!event.ctrlKey) {
                                        //single selection => clear selection
                                        var i, selectedDynaTreeNodes;
                                        selectedDynaTreeNodes = node.tree.getSelectedNodes();
                                        for (i = 0; i < selectedDynaTreeNodes.length; i++) {
                                            selectedDynaTreeNodes[i].select(false);
                                        }
                                        flag = true;
                                    }
                                    node.activate();
                                    node.toggleSelect();
                                    return false;
                                };

                                dblClickCb = function(node, event) {
                                    if (node.getEventTargetType(event) === "title") {
                                        node.expand(!node.isExpanded());
                                        return false;
                                    }
                                };
                                onFocusCB = function(node) {
                                    var tree = element.dynatree("getTree");
                                    var selectedNodes = tree.getSelectedNodes(false);
                                    var i;
                                    for (i = 0; i < selectedNodes.length; i++) {
                                        var n = selectedNodes[i];
                                        n.toggleSelect();
                                    }
                                    node.activate();
                                    node.select(true);
                                    return true;
                                };
                            }
                            ;

                            if (atRutnime) {
                                element.dynatree("option", "checkbox", checkBox || false);
                                element.dynatree("option", "onDblClick", dblClickCb || null);
                                element.dynatree("option", "onClick", onClickCB || null);
                                element.dynatree("option", "onFocus", onFocusCB || null);
                                element.dynatree("option", "onKeydown", onKeyDownCB || null);
                                element.dynatree("option", "clickFolderMode", clickfolderMode || 3);
                                element.dynatree("option", "classNames", cn);
                                element.dynatree("option", "autoFocus", autoFocus || true);
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
                                var index, i, selectedCidsObject;
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
                            onExpand: function(expand, node) {
                                node.data.icon = getIcon(node.data.cidsNode.isLeaf, node.isExpanded(), node.data.cidsNode);
                                node.render();
                                return true;
                            },
                            onLazyRead: function(node) {
                                var cidsNode, callback, childNode;
                                cidsNode = node.data.cidsNode;
                                node.data.addClass = "dynatree-loading";
                                node.render();
                                callback = function(children) {
                                    var i, cidsNode;
                                    for (i = 0; i < children.length; i++) {
                                        cidsNode = children[i];
                                        childNode = creatDynaTreeNode(cidsNode);
                                        node.addChild(childNode);
                                    }

                                    node.data.addClass = "";
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
                                var value = scope.options[key];
                                switch (key) {
                                    case "checkboxClass":
                                        dynatreeOptions.classNames.checkbox = value;
                                        break;
                                    case "checkboxEnabled":
                                        dynatreeOptions.checkbox = value || false;
                                        break;
                                    case "imagePath":
                                        dynatreeOptions.imagePath = value;
                                        break;
                                    case "multiSelection":
                                        registerEventCallbacks(value);
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
                        options: '=?',
                    }
                };
            }]);

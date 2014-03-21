'use strict';
angular.module('de.cismet.crisma.widgets.worldstateTreeWidget.services',
        [
            'ngResource'
        ])
        .service('de.cismet.crisma.widgets.worldstateTreeWidget.services.Nodes', [
            '$resource',
            '$timeout',
            'CRISMA_ICMM_API',
            'CRISMA_DOMAIN',
            function($resource, $timeout,CRISMA_ICMM_API,CRISMA_DOMAIN) {
                var Nodes = $resource(
                        CRISMA_ICMM_API+'/nodes',
                        {nodeId: '@id', domain: CRISMA_DOMAIN},
                {
                    //belongs to the GET /nodes/{domain}.{nodekey} action of the icmm api
                    get: {method: 'GET', params: {deduplicate: true}, url: CRISMA_ICMM_API+'/'+CRISMA_DOMAIN+'.worldstates'},
                    // belongs to the /nodes action of the icmm api
                    query: {method: 'GET', isArray: true, url: CRISMA_ICMM_API+'/'+CRISMA_DOMAIN+'.worldstates?limit=100&offset=0&level=1&filter=parentworldstate%3Anull&omitNullValues=false&deduplicate=true',
                        transformResponse: function(data) {
                            return transformResult(data);
                        }},
                    children: {method: 'GET', isArray: true, params: {level: 2}, url: CRISMA_ICMM_API+'/'+CRISMA_DOMAIN+'.worldstates', transformResponse: function(data) {
                            return transformResult(data);
                        },
                        //belongs to post /nodes/{domain}/children
                        dynamicChildren: {
                            method: 'POST',
                            url: '',
                            transformResult: function() {
                                return transformResult(data);
                            }
                        }
                    }});

                var transformResult = function(data) {
                    var col, res, i;
                    col = JSON.parse(data).$collection;
                    res = [];
                    for (i = 0; i < col.length; ++i) {
                        var ws = col[i];
                        var hasChilds = ws.childworldstates.length > 0 ? true : false;
//                        var icon = "";
                        var icon = hasChilds ? 'glyphicon glyphicon-folder-close' : 'glyphicon glyphicon-map-marker';
                        var node = {
                            key: ws.id,
                            name: ws.name,
                            classKey: 42,
                            objectKey: ws.id,
                            type: 'objectNode',
                            org: '',
                            dynamicChildren: '',
                            clientSort: false,
                            derivePermissionsFromClass: false,
                            icon: icon,
                            isLeaf: !hasChilds,
                            object: ws,
                            // we augment the node object of the rest api with a method how the children are generated
                            getChildren: function(callback) {
                                var that = this;
                                $timeout(function() {
                                    Nodes.children({filter: 'parentworldstate.id:' + that.object.id}, callback);
                                }, 1000);
                            }
                        };
                        res.push(node);
                    }
                    return res;
                };
                return Nodes;
            }
        ]);

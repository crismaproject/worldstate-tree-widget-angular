/* Services */
angular.module(
    'de.cismet.crisma.widgets.worldstateTreeWidget.services',
    [
        'ngResource'
    ]
).service(
    'de.cismet.crisma.widgets.worldstateTreeWidget.services.Nodes',
    [
        '$resource',
        '$timeout',
        'CRISMA_ICMM_API',
        'CRISMA_DOMAIN',
        function ($resource, $timeout, CRISMA_ICMM_API, CRISMA_DOMAIN) {
            'use strict';
            var transformResult, Nodes;
            transformResult = function (data) {
                var col = JSON.parse(data).$collection, res = [], i, ws,
                    hasChilds, icon, node, that,
                    getChildrenFunc = function (callback) {
                        that = this;
                        $timeout(function () {
                            Nodes.children({filter: 'parentworldstate.id:' + that.object.id}, callback);
                        }, 1000);
                    };

                for (i = 0; i < col.length; ++i) {
                    ws = col[i];
                    hasChilds = ws.childworldstates.length > 0 ? true : false;
//                        var icon = "";
                    icon = hasChilds ? 'glyphicon glyphicon-folder-close' : 'glyphicon glyphicon-map-marker';

                    node = {
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
                        getChildren: getChildrenFunc
                    };
                    res.push(node);
                }
                return res;
            };
            Nodes = $resource(
                CRISMA_ICMM_API + '/nodes',
                {nodeId: '@id', domain: CRISMA_DOMAIN},
                {
                    //belongs to the GET /nodes/{domain}.{nodekey} action of the icmm api
                    get: {
                        method: 'GET',
                        params: {deduplicate: true},
                        url: CRISMA_ICMM_API + '/' + CRISMA_DOMAIN + '.worldstates?limit=100&offset=0&level=1',
                        transformResponse: function (data) {
                            return transformResult(data);
                        }
                    },
                    // belongs to the /nodes action of the icmm api
                    query: {
                        method: 'GET',
                        isArray: true,
                        url: CRISMA_ICMM_API + '/' + CRISMA_DOMAIN + '.worldstates?limit=100&offset=0&level=1&omitNullValues=false&deduplicate=true',
                        transformResponse: function (data) {
                            return transformResult(data);
                        }
                    },
                    children: {
                        method: 'GET',
                        isArray: true,
                        params: {level: 2},
                        url: CRISMA_ICMM_API + '/' + CRISMA_DOMAIN + '.worldstates',
                        transformResponse: function (data) {
                            return transformResult(data);
                        },
                        //belongs to post /nodes/{domain}/children
                        dynamicChildren: {
                            method: 'POST',
                            url: '',
                            transformResult: function (data) {
                                return transformResult(data);
                            }
                        }
                    }
                }
            );
            return Nodes;
        }
    ]
);

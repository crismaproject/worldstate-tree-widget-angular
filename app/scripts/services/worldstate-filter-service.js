/* Services */
angular.module(
    'de.cismet.crisma.widgets.worldstateTreeWidget.services'
).service(
    'de.cismet.crisma.widgets.worldstateTreeWidget.services.WorldStateFilterService',
        function () {
            'use strict';
            var Service = {
                filterResult : []
            };
            return Service;
        }
);
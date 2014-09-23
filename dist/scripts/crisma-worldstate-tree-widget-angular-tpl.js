angular.module('de.cismet.crisma.widgets.worldstateTreeWidget.directives').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/catalogue-tree.html',
    "<div id=\"tree\">\n" +
    "\n" +
    "</div>"
  );


  $templateCache.put('templates/worldstate-tree.html',
    "<div >\n" +
    "    <catalogue-tree class=\"catalagoue-tree\" options=\"options\" nodes=\"topLevelNodes\" selection=\"selectedNodes\" active-node=\"activeNode\"></catalogue-tree>\n" +
    "</div>"
  );

}]);

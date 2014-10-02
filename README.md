worldstate-tree-widget-angular
==============================

The AngularJS implementation of the Worldstate Tree Widget Functional Building Block.

![worldstate_tree_widget_example](https://f.cloud.github.com/assets/1785245/2498920/b8d69a0e-b34d-11e3-95be-7a1493b41f23.png)

## Get started

Simply pull in the libraries and all its dependencies via [bower](http://bower.io/)

```sh
  bower install --save crisma-worldstate-tree-widget-angular
```

There is basically one directive available in this AngularJS module that is important for you:

```xml
  <worldstate-tree class="catalagoue-tree"
                   options="treeOptions"
                   selected-worldstates="treeSelection"
                   active-worldstate="activeItem"></worldstate-tree>
```

However, this will only work correctly if you provide info where to finde the ICMM instance to use:

```javascript
angular.module(
    'myCoolModule'
).config(
  [
    '$provide',
    function ($provide) {
        'use strict';

        $provide.constant('CRISMA_DOMAIN', 'CRISMA');                       // the name of the CRISMA domain to use
        $provide.constant('CRISMA_ICMM_API', 'http://url/to/the/icmm/api'); // the url to the API of the ICMM instance to use
      }
    }
  ]
);

```

Put the directive in your html, provide the constants and bind your model to the selected and active items. The options are used for initialising the tree.

### options
```json
$scope.treeOptions = {
  checkboxClass: 'glyphicon glyphicon-unchecked', // the css class that shall be used for the checkbox (if rendered)
  folderIconClosed: 'path/to/my/icon.png',        // icon that shall be used if a folder in the tree is closed (not expanded), relative to imagePath
  folderIconOpen: 'path/to/my/icon.png',          // icon that shall be used if a folder in the tree is opened (expanded), relative to imagePath
  leafIcon: 'path/to/my/icon.png',                // icon that shall be used for a leaf in the tree (node without children), relative to imagePath
  imagePath: 'my/base/url',                       // base url for the images
  multiSelection: true,                           // whether or not multiple nodes may be selected, true or false
  clickFolderMode: 1                              // behaviour of user click on folder, 1 = toggle node active state only, 2 = toggle node active and selected state, 3 = toggle node selected state only
};
```
### selected-worldstates
array of worldstate objects

### active-worldstate
single worldstate object

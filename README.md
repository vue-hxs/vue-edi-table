# vue-edi-table

Excel like table edit

[https://vue-hxs.github.io/vue-edi-table/](https://vue-hxs.github.io/vue-edi-table/)

### TODO:

* [ ] Possibly separate rows or cells into independent components
* [ ] Fidn a way to move .header back to thead since cell size was desynching
* [ ] Improve code on vue template possibly by using computed or even methods
      to return data
* [ ] custom operations as sort, filter etc or a simple way to add components to header
      this way we can set a custom header with controls to manipulate data
* [ ] lazy loading from an endpoint or list object
* [x] Transform headers to an array (is currently an object)
      this way we can present same field twice with different view
* [x] Fix focusing on input elements within cells
* [x] New row
  * [x] new row is done, but commit order should be fixed, on new rows the
        order should be 'add' last with same info as latest update
* [x] Fix table dimension to fill parent somehow
* [x] completelly separate state manipulation methods from events in Table
* [x] Implement readonly fields
* [x] Delete
* [x] Change
* [x] Row selection
* [x] Selection shift
* [x] undo with several rows at same time
      usefull for delete 5, undo delete 5

### Changes:

* Changed everything to position:sticky,
* Scroll is now on table
* Remove 'div.editor' favouring conditional inputs on 'table td'
* Reduced complexity
* Added dynamic optional component for while on editing

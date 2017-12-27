# editable TODO:

Excel like edit table

vue-edi-table future

Scrollable content

TODO:

* [ ] Improve code, on vue template possibly by using computed or even methods
      to return data
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

Changes:

* Changed everything to position:sticky,
* Scroll is now on table
* Remove 'div.editor' favouring conditional inputs on 'table td'

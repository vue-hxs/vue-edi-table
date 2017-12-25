vue-edi-table future

Scrollable content

Editable portions,
optional header types/visibility

Row selection/ Save/delete button

Implement history set like other editable

TODO:

* [ ] New
* [x] completelly separate state manipulation methods from events in Table
* [x] Implement readonly fields
* [x] Delete
* [x] Change
* [x] Row selection
* [x] Selection shift
* [x] undo with several rows at same time
      usefull for delete 5, undo delete 5

// Separate operations in mixins
EditorOps?
rowsOps?
cursorOps?

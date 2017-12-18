/**
 * A node in the DOM tree.
 *
 * @external DOMElement
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element DOMElement}
 *
 * @external DOMEvent
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Event DOMEvent}
 */

// import ContextMenu from '../contextmenu/contextmenu.vue'

export default {
  props: {
    columns: Object,
    dataList: Array,
    editable: {type: Boolean, default: true},
    debug: {type: Boolean, default: false}
  },
  data () {
    return {
      rows: this.getRows(this.dataList),
      cols: Object.keys(this.columns),
      // data: JSON.parse(JSON.stringify(this.propdata)),
      //
      //
      cursor: null, // cel At Cursor
      newRow: {},
      // changeSet: [],
      historySet: [], // New Testing
      selectedRows: [],
      editMode: false,
      currentValue: '',
      hoverValue: ''
    }
  },
  watch: {
    dataList: function (val, oldVal) {
      this.rows = this.getRows(val)
      // Reset changes?
      // this.changeSet = {update: [], delete: []} // reset changeset on new list
      // this.changeSet = [] // reset changeset on new list
      this.historySet = []
    }
  },
  mounted () { // Cache elements
    // this.selElement = this.$el.querySelector('#selection')
    var relEl = this.$refs.selection
    while (true) { // Find relative parent
      if (relEl == null) {
        break
      }
      let s = window.getComputedStyle(relEl, null)
      if (s['position'] === 'relative') {
        break // found
      }
      relEl = relEl.parentElement
    }
    if (relEl == null) {
      relEl = document.body
    }
    this.selRelParent = relEl

    // console.log("El is:", this.$el)
    // this.$refs.tabletableElement = this.$el.querySelector('table')
    // console.log('Component started')
    document.addEventListener('keydown', this.keyEvent)
    window.addEventListener('resize', this.resizeEvent)
    this.resizeEvent()
  },
  destroyed () {
    // console.log('component destroyed')
    document.removeEventListener('keydown', this.keyEvent)
    window.removeEventListener('resize', this.resizeEvent)
  },
  methods: {
    /* dragStart (e) {
      e.preventDefault()
      var el = e.currentTarget
      this.cursor = el
    },
    dragOver (e) {
      // e.currentTarget.classList.add('selected')
      console.log('Draging over:', e.currentTarget)
      var el = e.currentTarget
      var x = el.cellIndex
      var y = el.parentElement.rowIndex

      this.setCursor(
        this.selecting.start.x,
        this.selecting.start.y,
        x, y)
    }, /**/
    // Iterate rows and fetch a thingy Transform data into editable rows

    getRows (data) {
      return data.map(e => { return {data: e} })
    },

    /**
     * Handle html window resize event
     * @param {DOMEvent} e
     */
    resizeEvent (e) {
      setTimeout(() => {
        document.activeElement.blur()
        var theadEl = this.$refs.table.querySelector('thead') // should be in this div
        theadEl.style['padding-right'] = (getScrollbarWidth() - 1) + 'px'
        // console.log('Resize thead', getScrollbarWidth(), theadEl.style)
      }) // nextTick
    },

    /**
     * Handle global key event
     * @param {DOMEvent}
     */
    keyEvent (e) {
      if (this.editable !== true) { // ignore if not editable
        return
      }
      // console.log('Key event', e.which)
      var el = document.activeElement
      if (el === document.body && !el.classList.contains('edit') /* !el.matches('.edit') */) { // Something is focused but its not our edit
        return
      }
      // var el = e.currentTarget
      if (this.editMode === true) {
        if (e.which === 27) { // ESC blur element
          this.editMode = false
          e.preventDefault()
          el.readOnly = true
        }
        // ENTER key submit change and move to next cell
        if (e.which === 13) {
          var ptd = el.parentElement // upQuerySelector(el, 'td') // using parentElement breaks support for complex inputs
          /* eslint-disable no-undef */
          el.dispatchEvent(new Event('change'))
          el.readOnly = true
          this.editMode = false
          let nextCell = this.cellNext(el)
          if (nextCell === null) {
            this.rowAdd() // Special case
            setTimeout(() => { // Next tick
              var newCell = this.cellAt(1, ptd.parentElement.rowIndex)
              newCell.focus()
            })
            return
          }
          nextCell.focus()
        }
        return
      }
      /*********************
       * Not Editing
       *************/

      // Trick enable editing if key is a single char , works on chrome not sure others
      // ANY CHAR KEY
      if (el !== undefined) {
        if (e.key.length === 1) {
          this.cellEdit(el)
          return
        }
        // ENTER KEY - Start editing on focused cell
        if (e.which === 13) {
          if (this.cellEdit(el) !== true) {
            let nextCell = this.cellNext(el)
            if (nextCell === undefined) return
            nextCell.focus()
          }
          return
        }
        // Handle direction keys
        var arrow = {38: [0, -1], 40: [0, 1], 39: [1, 0], 37: [-1, 0]}
        let v
        if ((v = arrow[e.which]) !== undefined) {
          var nel = this.cellRelAt(el, ...v)
          if (nel === null) {
            return
          }
          nel.focus()
          e.preventDefault()
          return
        }
      }
      // DELETE KEY - deletes selected rows
      if (e.which === 46) { // delete key
        e.preventDefault()
        if (this.selectedRows.length === 0) return
        this.rowDelete(this.selectedRows)
      }
    },

    /**
     * Start editing a cell or ignore if cell is not editable
     * @param {DOMElement} el
     * @returns {Boolean} - true if edit allowed, false ignore
     */
    cellEdit (el) {
      var pTd = el.parentElement // upQuerySelector(el, 'td') // using parentElement breaks support for complex inputs
      if (pTd == null) {
        return
      }
      var cols = Object.keys(this.columns)
      var col = this.columns[cols[pTd.cellIndex - 1]] // exclude header
      if (col.editable === false || this.editable !== true) {
        return false// No edit
      }
      this.editMode = true
      var editEl = pTd.querySelector('.edit')
      editEl.readOnly = false

      // editEl.select() // Select all and pass key over?
      return true
    },

    /**
     * Helper to find next cell (after enter key for example)
     * @param {DOMElement} el - starting element
     * @returns {DOMElement} - next cell
     */
    cellNext (el) {
      let nextCell
      if ((nextCell = this.cellRelAt(el, 0, 1)) === null) {
        if ((nextCell = this.cellRelAt(el, 1, 0)) === null) {
          /* this.rowAdd() // Special case
          setTimeout(() => { // Next tick
            var newCell = this.cellAt(1, ptd.parentElement.rowIndex)
            newCell.focus()
          })
          return */
        }
      }
      return nextCell
    },

    /**
     * Retrieve .edit element of a cell at specific position
     * @param {Number} colIndex - column index
     * @param {rowIndex} rowIndex - row Index
     * @returns {DOMElement} - the cell input DOMElement
     */
    cellAt (colIndex, rowIndex) {
      if (this.$refs.table.rows[rowIndex] === undefined) {
        return null
      }
      var targetCell = this.$refs.table.rows[rowIndex].cells[colIndex]
      if (targetCell === undefined) {
        return null
      }
      return targetCell.querySelector('.edit')
    },

    /**
     * Relative .edit element from cell at position of el
     * @param {DOMElement} el
     * @param {Number} x - Relative horizontal: X -1 goes left, 1 goes right
     * @param {Number} y - Number relative vertical: -1 goes up, 1 goes down
     * @returns {DOMElement} - returns the input cell
     */
    cellRelAt (el, x, y) {
      var pTd = el.parentElement // upQuerySelector(el, 'td') // using parentElement breaks support for complex inputs
      if (pTd === null) {
        return
      }
      var curCI = pTd.cellIndex + x
      var curRI = pTd.parentElement.rowIndex + y

      return this.cellAt(curCI, curRI)
    },

    /**
     * Sets the value of underlying input
     * @param {DOMEvent} e - event
     */
    cellHoverEvent (e) {
      // var el = e.currentTarget
      /* Drag case
      if (this.cursor !== null && e.buttons === 1) {
        // select area
        this.setCursor(
          this.cursor.cellIndex,
          this.cursor.parentElement.rowIndex,
          el.cellIndex,
          el.parentElement.rowIndex)
      }
      */

      // const editor = el.querySelector('.edit')
      // if (editor === undefined) return

      // this.hoverValue = editor.value
    },

    /**
     * On mouse down it will focus on target Element and if click
     * again it will start editing
     * @param {DOMEvent} e - event
     **/
    cellDownEvent (e) { // downEvent // or up?
      var el = e.currentTarget
      this.cursor = el

      var editor = el.querySelector('.edit')
      if (editor === document.activeElement) {
        if (this.editMode === true) {
          return
        }
        this.cellEdit(editor) // Start editing
      }
      // cellDown already focus event
      // editor.focus() // in case the mousedown was on TD
    },

    /**
     * cell Change Event
     * @param {DOMEvent} evt - default dom event
     * @param {Number} ri - Row index
     * @param {Column} k - Column name which changed
     */
    // called after cell edit
    cellChangeEvent (evt, ri, k) {
      if (this.rows[ri].data[k] === evt.currentTarget.value) {
        return
      }
      // Deep clone
      var oldRow = JSON.parse(JSON.stringify(this.rows[ri]))

      if (this.columns[k].type === 'checkbox') { // Special case
        this.rows[ri].data[k] = evt.currentTarget.checked
      } else {
        this.rows[ri].data[k] = evt.currentTarget.value
      }
      // Update data here

      // Mark modifiedj
      this.rows[ri].modified = true

      this.historySet.push({op: 'update', row: this.rows[ri], index: ri, oldRow: oldRow})
      // XXX: Auto commit here
    },

    /**
     * Same as cellChange but for the extra new row
     * XXX: Should be changed to cellNewChangeEvent
     * @param {DOMEvent} e - default dom event
     * @param {Object} k - row data object
     */
    cellNewChange (e, k) {
      if (this.columns[k].type === 'checkbox') { // Special case
        this.newRow[k] = e.currentTarget.checked
      } else {
        this.newRow[k] = e.currentTarget.value
      }
    },

    /**
     * Handle cellBlur event, deselect cell and disable editMode
     * @param {DOMEvent} e - default dom event
     */
    cellBlurEvent (e) {
      // console.log('BLUR setting readonly', e.currentTarget)
      var el = e.currentTarget
      el.parentElement.classList.remove('active')
      e.currentTarget.readOnly = true
      this.editMode = false
      this.setCursor() // Disable cursor
    },

    /**
     * Handle cellFocus event, select text internally
     * @param {DOMEvent} e - default dom event
     */
    cellFocusEvent (e) {
      if (this.editable !== true) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }

      var el = e.currentTarget
      this.currentValue = el.value
      el.parentElement.classList.add('active')
      // el.setSelectionRange(0, 0)

      if (this.editMode) { // not needed anymore?
        el.readOnly = false
      }
      el.select()

      // Test
      var pTd = el
      while (pTd !== null && pTd.tagName !== 'TD') {
        pTd = pTd.parentElement
      }

      this.setCursor(pTd.cellIndex, pTd.parentElement.rowIndex)
    },

    /**
     * Deselect all selected cells
     */
    deselectAll () {
      let elList = this.$el.querySelectorAll('td.selected')
      for (let e of elList) { e.classList.remove('selected') }
      this.selectedRows = []
    },

    /**
     * Row click event
     * @param {DOMEvent} e - default dom event
     */
    rowClickEvent (e) {
      var ri = e.currentTarget.rowIndex - 1

      this.$emit('rowClick', this.rows[ri].data)
      // pass event trough
    },

    /**
     * handle rowAdd event (the plus button bottom left)
     * @param {DOMEvent} e - default dom event
     */
    rowAdd () { // from newRow object
      // Add to row
      var newRow = {}
      for (var k in this.columns) {
        if (this.newRow[k] === undefined || this.newRow[k] === '') {
          newRow[k] = this.columns[k].default
          continue
        }
        newRow[k] = this.newRow[k]
      }
      this.rows.push({data: newRow, modified: true})
      var ri = this.rows.length - 1

      // this.changeSet.push({op: 'add', row: this.rows[ri].data})
      this.historySet.push({op: 'add', row: this.rows[ri], index: ri})

      this.newRow = {}
    },

    /**
     * handle rowheader click
     * XXX: rowHeaderClick??
     * @param {DOMEvent} e - default dom event
     */
    rowSelect (e) {
      // this.showMenu = true; deprecated
      // check if row is selected and toggle
      var el = e.currentTarget
      var elList = el.parentElement.querySelectorAll('td')
      var ri = el.parentElement.rowIndex - 1

      // Deselect if found
      var found = this.selectedRows.indexOf(this.rows[ri])
      if (found !== -1 && (e.ctrlKey || this.selectedRows.length === 1)) { // deselect one
        for (let e of elList) { e.classList.remove('selected') }
        this.selectedRows.splice(found, 1)
        return
      }
      if (!e.ctrlKey) {
        this.deselectAll()
      }

      for (let e of elList) { e.classList.add('selected') }
      this.selectedRows.push(this.rows[ri])
      // Add row to selectionList
    },
    /**
     * delete list of rows
     * @param {Array} rowList - list of rows
     */
    rowDelete (rowList) {
      for (let item of this.selectedRows) {
        /*
        let found
        // Find existent operation
        if ((found = this.changeSet.find(e => e.row === item.data))) {
          // Change op to delete
          found.op = 'delete'
        } else {
          // Not found we push
          this.changeSet.push({op: 'delete', row: item.data})
        }
        */

        // delete from rows
        var vindex = this.rows.indexOf(item)
        if (vindex === -1) continue
        this.historySet.push({op: 'delete', row: item, index: vindex, oldRow: JSON.parse(JSON.stringify(item))})
        this.rows.splice(vindex, 1)
      }
      this.deselectAll()
      // XXX: If auto commit, commit changes here
      if (this.autocommit === true) {
        this.commitChanges()
      }
    },
    /**
     * Multi cell selector
     *
     * if No param it will remove cursor
     * @param {Number} c1 - starting column
     * @param {Number} r1 - starting row
     * @param {Number} c2 - last column
     * @param {Number} r2 - last row
     */
    // Set the cell/multicell cursor or disable cursor if no arguments
    setCursor (c1, r1, c2, r2) {
      if (c1 === undefined) {
        this.$refs.selection.classList.remove('active')
        return
      }
      if (c2 < c1) [c1, c2] = [c2, c1]
      if (r2 < r1) [r1, r2] = [r2, r1]
      // Find relative parent from selection
      var relEl = this.selRelParent
      // console.log('Setting selection to:', r1, c1)
      // Get position of those cells
      // var tbodyEl = this.tableElement.querySelector('tbody')
      var relRect = relEl.getBoundingClientRect()
      // First cell
      var cellEl = this.$refs.table.rows[r1].cells[c1]
      var rect = cellEl.getBoundingClientRect()

      this.$refs.selection.classList.add('active')
      this.$refs.selection.style.left = (rect.left - relRect.left + relEl.scrollLeft) + 'px'
      this.$refs.selection.style.top = (rect.top - relRect.top + relEl.scrollTop) + 'px'

      var width = rect.width
      var height = rect.height
      if (c2 !== undefined && r2 !== undefined) { // Square selection
        // Sum widths
        for (let i = c1 + 1; i <= c2; i++) {
          width += this.tableElement.rows[r1].cells[i]
            .getBoundingClientRect().width
        }
        for (let i = r1 + 1; i <= r2; i++) {
          height += this.tableElement.rows[i].cells[c1]
            .getBoundingClientRect().height + 1 // border compensation
        }
      }
      // Width & Height
      this.$refs.selection.style.width = width + 'px'
      this.$refs.selection.style.height = height + 'px'
    },

    /**
     * Experimental undo
     */
    undoLast () {
      var change = this.historySet.pop()
      var vindex
      switch (change.op) {
        case 'add':
          vindex = this.rows.indexOf(change.row)
          this.rows.splice(vindex, 1) // delete row
          break
        case 'update':
          // vindex = this.rows.indexOf(change.row)
          this.rows[change.index] = change.oldRow
          break
        case 'delete':
          this.rows.splice(change.index, 0, change.row)
          break
      }
    },
    /**
     * Will send event to parent element
     */
    commitChanges () {
      // build changeSet from history
      var changeControl = new Map()
      for (var histItem of this.historySet) {
        changeControl.set(histItem.row, histItem.op)
      }
      var changeSet = []

      for ([row, op] of changeControl) {
        changeSet.push({op: op, data: row.data})
      }
      console.log('final:', changeSet)
      this.$emit('commit', changeSet)
    }
  }
}

// Helper function to get scrollbar Width
function getScrollbarWidth () {
  var outer = document.createElement('div')
  outer.style.visibility = 'hidden'
  outer.style.width = '100px'
  outer.style.msOverflowStyle = 'scrollbar' // needed for WinJS apps

  document.body.appendChild(outer)

  var widthNoScroll = outer.offsetWidth
  // force scrollbars
  outer.style.overflow = 'scroll'

  // add innerdiv
  var inner = document.createElement('div')
  inner.style.width = '100%'
  outer.appendChild(inner)

  var widthWithScroll = inner.offsetWidth

  // remove divs
  outer.parentNode.removeChild(outer)

  return widthNoScroll - widthWithScroll
}
// Search up to 10
/* function upQuerySelector (el, selector) {
  var pel = el
  var max = 50
  while (max > 0 && pel !== null && !pel.matches(selector)) {
    pel = pel.parentElement
    max-- // Safe trigger
  }
  return pel
} */

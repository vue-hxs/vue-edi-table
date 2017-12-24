import _ from 'lodash'

/*
--row-height: 40px;
  --header-height: 25px;
  --index-width: 30px;
  --scroll-offset: 12px;
  */

const arrow = {
  // MS Edge stupidity
  'Up': [0, -1],
  'Down': [0, 1],
  'Right': [1, 0],
  'Left': [-1, 0],

  'ArrowUp': [0, -1],
  'ArrowDown': [0, 1],
  'ArrowRight': [1, 0],
  'ArrowLeft': [-1, 0]}

var scrollTop = 0
var scrollLeft = 0
var scrollTicking = false

export default {
  props: {
    'headers': {type: Object, default: {}},
    'rows': {type: Array, default: []},

    'headerHeight': {type: String, default: '40px'},
    'rowHeight': {type: String, default: '30px'},
    'indexWidth': {type: String, default: '30px'}
  },
  data () {
    return {
      editable: true,

      state: {
        cursor: {
          rowi: 0,
          coli: 0,
          editing: false,
          value: ''
        },

        headers: this.headers,
        rows: this.transformRows(this.rows),
        selectedRows: [],
        historySet: []
      }
    }
  },
  watch: {
    rows (val, oldVal) {
      this.state.rows = this.transformRows(val)
    }
  },
  computed: {
  },
  // Define some styling here?
  mounted () {
    const scrollSize = getScrollbarWidth()
    // how compatible is this?
    this.$el.style.setProperty('--header-height', this.headerHeight)
    this.$el.style.setProperty('--row-height', this.rowHeight)
    this.$el.style.setProperty('--index-width', this.indexWidth)

    this.$el.style.setProperty('--scroll-offset', scrollSize + 'px')
    this.setCursor() // nothing

    // this.$el.addEventListener('keydown', this.keyEvent.bind(this))
    // document.addEventListener('keydown', this.keyEvent.bind(this))
  },
  methods: {
    nullEvt (e) { // Direct input
      e.preventDefault()
      e.stopPropagation()
      return false
    },
    transformRows (rows) {
      return rows.map(row => { return {data: _.cloneDeep(row)} })
    },
    editorStyle () {
      const {coli, rowi} = this.state.cursor
      if (!this.state.cursor.editing) {
        return {display: 'none'}
      }
      if (this.$el === undefined || rowi === undefined || coli === undefined) {
        return {display: 'none'}
      }
      var relRect = this.$refs.tbody.getBoundingClientRect()
      var rect = this.$refs.tbody.rows[rowi].cells[coli].getBoundingClientRect()
      return {
        display: 'block',
        left: (rect.left - relRect.left + this.$refs.tbody.scrollLeft) + 'px',
        top: (rect.top - relRect.top + this.$refs.tbody.scrollTop) + 'px',
        width: rect.width + 'px',
        height: rect.height + 'px'
      }
    },

    keyEvent (e) {
      if (this.editable === false) {
        return
      }
      // Both
      if (e.key === 'Tab') {
        e.preventDefault()
        this.$refs.input.blur()
        let dir = 1
        if (e.shiftKey) dir = -1
        this.$nextTick(() => {
          this.moveCursor(dir, 0, true)
        })
      }
      if (e.key === 'Enter') {
        if (this.state.cursor.editing) {
          console.log('Bluring and move down')
          this.$refs.input.blur() // Stop editing somehow
          this.$nextTick(() => {
            this.moveCursor(0, 1)
          })
        } else {
          this.editStart()
        }
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (this.state.cursor.editing) {
          return
        }
        this.state.rows[this.state.cursor.rowi].data[this.state.cursor.field] = ''
      }

      let dir = arrow[e.key]
      if (dir !== undefined) {
        if (this.state.cursor.editing) {
          return
        }
        // move selection and blur whatever is focused
        // check if we can select further
        this.moveCursor(dir[0], dir[1], true)
        e.preventDefault()
        return
      }
      // Single key as a char
      if (e.key.length === 1) {
        if (this.state.cursor.editing) {
          return
        }
        e.preventDefault()
        this.editStart()
        this.$nextTick(() => {
          this.state.cursor.value = e.key
        })
        // Start edit clear and add this key as a value?
        // this.state.rows[this.state.cursor.rowi].data[this.state.cursor.field] = e.key
      }
    },
    scrollEvent (e) {
      scrollLeft = e.currentTarget.scrollLeft
      scrollTop = e.currentTarget.scrollTop

      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          this.doScroll(scrollLeft, scrollTop)
          scrollTicking = false
        })
        scrollTicking = true
      }
    },
    // syncScroll
    doScroll (left, top) {
      // visual link scrolls
      this.$refs.indexes.scrollTop = top
      this.$refs.header.scrollLeft = left

      // Make css how of this by changing classes
      /* if (e.target.scrollTop > 0) {
        this.$refs.header.style['box-shadow'] = '0px 2px 2px rgba(10,10,10,0.4)'
      } else {
        this.$refs.header.style['box-shadow'] = 'none'
      }
      if (e.target.scrollLeft > 0) {
        this.$refs.indexes.style['box-shadow'] = '2px 0px 2px rgba(10,10,10,0.4)'
      } else {
        this.$refs.indexes.style['box-shadow'] = 'none'
      } */
    },
    editStart () {
      this.state.cursor.editing = true

      //
      var {rowi, field} = this.state.cursor
      this.state.cursor.value = this.state.rows[rowi].data[field]
      this.$nextTick(() => {
        // Reposition the thing here
        var lstyle = this.editorStyle()
        for (var k in lstyle) {
          this.$refs.editor.style[k] = lstyle[k]
        }

        this.$refs.input.focus()
      })
    },
    editStop (e) { // or Blur
      this.state.cursor.editing = false

      var lstyle = this.editorStyle()
      for (var k in lstyle) {
        this.$refs.editor.style[k] = lstyle[k]
      }

      // commit changes
      const {rowi, field} = this.state.cursor

      // Deep clone
      var oldRow = _.cloneDeep(this.state.rows[rowi]) // Save current
      this.state.rows[rowi].data[field] = this.state.cursor.value // set new value
      // Mark modifiedj
      this.state.rows[rowi].modified = true // Set as modified
      this.state.historySet.push({op: 'update', row: this.rows[rowi], index: rowi, oldRow: oldRow})
      this.$el.focus() // Back to parent focus
    },

    // cellSelection
    cellClick (e) {
      if (this.state.cursor.editing) {
        return
      }
      const el = e.currentTarget
      this.setCursor(el.cellIndex, el.parentElement.sectionRowIndex)
      // but if cursor is same, we start edit on double click?
    },
    cellDblClick (e) {
      if (this.state.cursor.editing) {
        e.preventDefault()
        return
      }
      const el = e.currentTarget
      this.setCursor(el.cellIndex, el.parentElement.sectionRowIndex)

      this.editStart()
      // Start edit the cell
    },
    rowClick (e, rowi) { // Add
      // Deselect if found
      var found = this.state.selectedRows.indexOf(this.state.rows[rowi])
      if (found !== -1 && (e.ctrlKey || this.state.selectedRows.length === 1)) { // deselect one
        this.state.selectedRows[found].selected = false
        this.state.selectedRows.splice(found, 1)
        return
      }
      if (!e.ctrlKey) {
        this.deselectAll()
      }
      this.state.selectedRows.push(this.state.rows[rowi])
      // Add row to selectionList

      console.log('Selecting row:', rowi)
      this.state.rows[rowi].selected = true

      this.$forceUpdate()
      // Why not reactive
    },
    deselectAll () {
      console.log('Deselecting all')
      for (let row of this.state.selectedRows) {
        row.selected = false
      }
      this.state.selectedRows = []
    },
    // Set the cell/multicell cursor or disable cursor if no arguments
    setCursor (coli, rowi) {
      this.state.cursor.rowi = rowi
      this.state.cursor.coli = coli
      if (rowi === undefined && coli === undefined) {
        return
      }

      var cellEl = this.$refs.tbody.rows[rowi].cells[coli]
      this.state.cursor.field = cellEl.getAttribute('data-field')
      // Focus hack to scroll to right position
      cellEl.setAttribute('contenteditable', true)
      cellEl.focus()
      cellEl.removeAttribute('contenteditable')

      // Oddly setting this manually
      /* var lstyle = this.cursorStyle()
      for (var k in lstyle) {
        this.$refs.cursor.style[k] = lstyle[k]
      } */
      this.$el.focus()
    },
    moveCursor (colm, rowm, circle) {
      let newColi = this.state.cursor.coli + colm
      let newRowi = this.state.cursor.rowi + rowm

      if (circle) {
        var tEl = this.$refs.tbody
        // Round about
        if (newColi >= tEl.rows[0].cells.length) {
          newRowi++
          newColi = 0
        } else if (newColi < 0) {
          newColi = tEl.rows[0].cells.length - 1
          newRowi--
        }
        // vertical round
        if (newRowi >= tEl.rows.length) {
          newRowi = 0
        } else if (newRowi < 0) {
          newRowi = tEl.rows.length - 1
        }
      }
      newColi = limit(newColi, 0, this.$refs.tbody.rows[0].cells.length - 1)
      newRowi = limit(newRowi, 0, this.state.rows.length - 1)
      this.setCursor(newColi, newRowi)
      // Cell Blur and focus
    },
    /**
     * Experimental undo
     */
    undoLast () {
      console.log('Undoing')
      var change = this.state.historySet.pop()
      var vindex
      switch (change.op) {
        case 'add':
          vindex = this.state.rows.indexOf(change.row)
          this.state.rows.splice(vindex, 1) // delete row
          break
        case 'update':
          // vindex = this.rows.indexOf(change.row)
          this.state.rows[change.index] = change.oldRow
          break
        case 'delete':
          this.state.rows.splice(change.index, 0, change.row)
          break
      }
    },
    commitChanges () {
      // build changeSet from history
      var changeControl = new Map()
      for (var histItem of this.state.historySet) {
        changeControl.set(histItem.row, histItem.op)
      }
      var changeSet = []

      for (let [row, op] of changeControl) {
        changeSet.push({op: op, data: row.data})
      }
      console.log('final:', changeSet)
      this.$emit('commit', changeSet)
    }
  }
}

function limit (val, min, max) {
  return Math.min(Math.max(val, min), max)
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

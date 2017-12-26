// import _ from 'lodash'
import DataList from './dataList'

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
  mixins: [DataList],
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
        scroll: {
          top: 0,
          left: 0
        },
        cursor: {
          rowi: 0,
          coli: 0,
          editing: false,
          value: ''
        },

        headers: this.headers
      }
    }
  },
  // Define some styling here?
  mounted () {
    const scrollSize = getScrollbarWidth()
    // how compatible is this?
    this.$el.style.setProperty('--header-height', this.headerHeight)
    this.$el.style.setProperty('--row-height', this.rowHeight)
    this.$el.style.setProperty('--index-width', this.indexWidth)

    this.$el.style.setProperty('--scroll-offset', scrollSize + 'px')
    this.cursorSet() // nothing
  },
  methods: {
    editorStyle () {
      const {coli, rowi} = this.state.cursor
      if (!this.state.cursor.editing) {
        return {display: 'none'}
      }
      if (this.$el === undefined || rowi === undefined || coli === undefined) {
        return {display: 'none'}
      }
      var relRect = this.$refs.table.getBoundingClientRect()
      var rect = this.$refs.tbody.rows[rowi].cells[coli + 1].getBoundingClientRect()
      return {
        display: 'block',
        left: (rect.left - relRect.left + this.$refs.table.scrollLeft) + 'px',
        top: (rect.top - relRect.top + this.$refs.table.scrollTop) + 'px',
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
          this.cursorMove(dir, 0, true)
        })
        return
      }
      if (e.key === 'Enter') {
        if (this.state.cursor.editing) {
          this.$refs.input.blur() // Stop editing somehow
          this.$nextTick(() => {
            this.cursorMove(0, 1)
          })
        } else {
          this.editStart()
        }
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (this.state.cursor.editing) {
          return
        }
        this.rowChange(this.state.cursor.rowi, this.state.cursor.field, '')
        // this.state.rows[this.state.cursor.rowi].data[this.state.cursor.field] = ''
      }

      let dir = arrow[e.key]
      if (dir !== undefined) {
        if (this.state.cursor.editing) {
          return
        }
        // move selection and blur whatever is focused
        // check if we can select further
        this.cursorMove(dir[0], dir[1], true)
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
      this.state.scroll.top = e.currentTarget.scrollTop
      this.state.scroll.left = e.currentTarget.scrollLeft
    },
    editStart () {
      var {rowi, field} = this.state.cursor
      if (this.state.headers[field].readonly) {
        return
      }
      this.state.cursor.editing = true

      //
      this.state.cursor.value = this.state.rows[rowi].data[field]
      this.$nextTick(() => {
        // Reposition the thing here computed would be better?
        var lstyle = this.editorStyle()
        for (var k in lstyle) {
          this.$refs.editor.style[k] = lstyle[k]
        }

        this.$refs.input.focus()
      })
    },
    editStop (e) { // or Blur
      this.state.cursor.editing = false

      this.$nextTick(() => {
        var lstyle = this.editorStyle()
        for (var k in lstyle) {
          this.$refs.editor.style[k] = lstyle[k]
        }

        // commit changes
        const {rowi, field} = this.state.cursor
        this.rowChange(rowi, field, this.state.cursor.value)
        this.$refs.table.focus() // Back to parent focus
      })
    },
    // cellEvents
    cellClick (e, rowi, coli) {
      if (this.state.cursor.editing) {
        return
      }
      this.cursorSet(coli, rowi)
      // but if cursor is same, we start edit on double click?
    },
    cellChange (rowi, field, value) {
      this.rowChange(rowi, field, value)
      this.$refs.table.focus()
    },
    cellDblClick (e, rowi, coli) {
      if (this.state.cursor.editing) {
        e.preventDefault()
        return
      }
      this.cursorSet(coli, rowi)

      this.editStart()
      // Start edit the cell
    },

    // This could be in history
    // Possible improve this into dataList.js
    rowClick (e, rowi) {
      e.preventDefault()
      e.stopPropagation()

      if (e.shiftKey && this.state.selection.last !== null) {
        this.rowDeselectAll()
        // selectRange
        let start = rowi
        let end = this.state.selection.last
        this.rowSelectRange(start, end)
        this.$forceUpdate()
        return
      }
      // Deselect if found is selected
      var found = this.state.selection.rows.indexOf(this.state.rows[rowi])
      if (found !== -1 && (e.ctrlKey || this.state.selection.rows.length === 1)) { // deselect one
        this.rowSelect(found, false)
        return
      }
      if (!e.ctrlKey) {
        this.rowDeselectAll()
      }
      this.rowSelect(rowi, true)

      // Why not reactive
      this.$forceUpdate()
    },
    // Set the cell/multicell cursor or disable cursor if no arguments
    cursorSet (coli, rowi) {
      this.state.cursor.rowi = rowi
      this.state.cursor.coli = coli
      if (rowi === undefined && coli === undefined) {
        return
      }

      var cellEl = this.$refs.tbody.rows[rowi].cells[coli + 1]
      this.state.cursor.field = cellEl.getAttribute('data-field')

      // cellEl.setAttribute('contenteditable', true)
      // cellEl.focus()
      // cellEl.removeAttribute('contenteditable')
      // this.$refs.table.focus()

      // Auto scroller
      var cellRect = cellEl.getBoundingClientRect()
      var pRect = this.$refs.table.getBoundingClientRect()
      // relaative to the scroller
      //
      const relRect = {
        top: cellRect.top - pRect.top,
        left: cellRect.left - pRect.left
      }
      // Scrolling operation
      if (relRect.top > (pRect.height - cellRect.height * 2)) {
        // Remove excess?
        const top = (pRect.height - cellRect.height * 2) - relRect.top
        this.$refs.table.scrollTop -= top
      }
      if (relRect.top < cellRect.height * 2) {
        this.$refs.table.scrollTop += relRect.top - cellRect.height * 2
      }
      if (relRect.left > (pRect.width - cellRect.width)) {
        const left = (pRect.width - cellRect.width) - relRect.left
        this.$refs.table.scrollLeft -= left
      }
      if (relRect.left < cellRect.width) {
        this.$refs.table.scrollLeft += relRect.left - cellRect.width
      }
    },
    cursorMove (colm, rowm, circle) {
      // if we have focus, we blur
      let newColi = this.state.cursor.coli + colm
      let newRowi = this.state.cursor.rowi + rowm

      if (circle) {
        var tEl = this.$refs.tbody
        // Round about
        if (newColi >= tEl.rows[0].cells.length - 1) {
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
      newColi = limit(newColi, 0, this.$refs.tbody.rows[0].cells.length - 2)
      newRowi = limit(newRowi, 0, this.state.rows.length - 1)
      this.cursorSet(newColi, newRowi)
      // Cell Blur and focus
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

import DataList from './dataList'

const arrow = {
  // MS Edge stupidity
  'Up': [0, -1],
  'Down': [0, 1],
  'Right': [1, 0],
  'Left': [-1, 0],

  'ArrowUp': [0, -1],
  'ArrowDown': [0, 1],
  'ArrowRight': [1, 0],
  'ArrowLeft': [-1, 0]
}

export default {
  mixins: [DataList], // Extends?
  props: {
    'editable': {type: Boolean, default: true}
  },
  data () {
    return {
      state: {
        scroll: { top: 0, left: 0 },
        cursor: {
          rowi: 0,
          coli: 0,
          editing: false,
          value: ''
        }
      }
    }
  },
  mounted () {
    this.cursorSet()
  },
  filters: {
    localTime (val) {
      return new Date(val).toLocaleDateString()
    }
  },
  methods: {
    inputEl () {
      const {coli, rowi} = this.state.cursor
      if (coli === undefined || rowi === undefined) return
      return this.cellElAt(coli, rowi).querySelector('.input')
    },
    inputBlur () {
      const el = this.inputEl()
      if (!el) return
      el.blur()
    },
    inputFocus () {
      const el = this.inputEl()
      if (!el) return
      el.focus()
    },
    keyEvent (e) {
      if (this.editable === false) {
        return
      }
      switch (e.key) {
        case 'Tab':
          e.preventDefault()
          this.inputBlur()
          let dir = 1
          if (e.shiftKey) dir = -1
          this.$nextTick(() => {
            this.cursorMove(dir, 0, true)
          })
          return
        case 'Escape':
          if (this.state.cursor.editing) {
            this.editStop(false)
          } else {
            this.cursorSet() // disable cursor
          }
          break
        case 'Enter':
          if (this.state.cursor.editing) {
            this.inputBlur() // Stop editing somehow
            this.$nextTick(() => {
              this.cursorEnterNext()
            })
          } else {
            if (!this.editStart()) {
              this.cursorMove(1, 0, true)
            }
          }
          break
        case 'Delete':
        case 'Backspace':
          if (this.state.cursor.editing) {
            return
          }
          this.rowChange(this.state.cursor.rowi, this.state.cursor.field, '')
          // this.state.rows[this.state.cursor.rowi].data[this.state.cursor.field] = ''
          break
        default:
          let arrowDir = arrow[e.key]
          if (arrowDir !== undefined) {
            if (this.state.cursor.editing) {
              // do nothing
              return
            }
            e.preventDefault()
            // move selection and blur whatever is focused
            // check if we can select further
            this.cursorMove(arrowDir[0], arrowDir[1], true)
            return
          }
          // Single key as a char
          if (e.key.length === 1) {
            if (this.state.cursor.editing) {
              return
            }
            e.preventDefault()
            this.$nextTick(() => {
              this.editStart() // focus etc
              this.state.cursor.value = e.key
            })
            // Start edit clear and add this key as a value?
            // this.state.rows[this.state.cursor.rowi].data[this.state.cursor.field] = e.key
          }
      }
    },
    fieldIsReadOnly (field) { // field or header
      if (!this.editable) return true
      return this.state.headers[field].readonly
    },

    tableBlur (e) {
      // TODO: when clicked outside table
      // Find parent
      /* console.log('Table blur')
      let nodeEl = document.activeElement
      for (;nodeEl !== document && nodeEl !== this.$refs.table; nodeEl = nodeEl.parentNode) {
        console.log('Searching cur:', nodeEl)
      }
      if (nodeEl !== this.$refs.table) {
        console.log('Parent is not a table')
        this.cursorSet()
      } */
    },
    tableScroll (e) {
      this.state.scroll.top = e.currentTarget.scrollTop
      this.state.scroll.left = e.currentTarget.scrollLeft
    },
    editFocusStart (coli, rowi) {
      if (!this.state.cursor.editing) {
        return
      }
      this.cursorSet(coli, rowi)
      this.editStart()
    },
    editStart () {
      if (this.editable === false) {
        return false
      }
      var {rowi, field} = this.state.cursor
      if (rowi === undefined || field === undefined) {
        return false
      }
      if (this.state.headers[field].readonly) {
        return false
      }
      this.state.cursor.editing = true
      //
      this.state.cursor.value = this.state.rows[rowi].data[field]
      this.$nextTick(() => {
        this.inputFocus()
      })
      return true
    },
    // if val === false we undo the change
    editStop (val) { // or Blur
      if (this.state.cursor.editing === false || this.editable === false) {
        return
      }
      this.state.cursor.editing = false

      this.$nextTick(() => {
        // Object.assign(this.$refs.editor.style, this.editorStyle())
        // commit changes
        const {rowi, field} = this.state.cursor
        if (val !== false) this.rowChange(rowi, field, this.state.cursor.value)
        this.$refs.table.focus() // Back to parent focus
      })
    },
    cellIsEditing (coli, rowi) {
      return this.state.cursor.editing &&
        this.state.cursor.coli === coli &&
        this.state.cursor.rowi === rowi
    },
    cellElAt (coli, rowi) {
      return this.$refs.tbody.rows[rowi + 1].cells[coli + 1]
    },
    // cellEvents
    cellClick (e, rowi, coli) {
      if (this.editable === false) {
        return
      }
      if (this.state.cursor.editing &&
        this.state.cursor.rowi === rowi &&
      this.state.cursor.coli) {
        return
      }
      this.cursorSet(coli, rowi)
    },
    cellChange (rowi, field, value) {
      if (this.editable === false) {
        return
      }
      this.rowChange(rowi, field, value)
      this.state.cursor.editing = false
      this.$refs.table.focus()
    },
    cellDblClick (e, rowi, coli) {
      if (this.editable === false) {
        return
      }

      if (this.state.cursor.editing) {
        e.preventDefault()
        return
      }
      this.cursorSet(coli, rowi)

      this.editStart()
      // Start edit the cell
    },
    rowAddEvent (e) {
      if (this.editable === false) {
        return
      }

      this.rowAdd()
      this.$nextTick(() => {
        // TODO: {lpf} improve, use as computed?
        let coli = 0
        for (var k in this.state.headers) {
          if (!this.state.headers[k].readonly) {
            break
          }
          coli++
        }
        this.cursorSet(coli, this.state.rows.length - 1)
        this.editStart()
      })
    },
    // This could be in history
    // Possible improve this into dataList.js
    rowClick (e, rowi) {
      if (this.editable === false) {
        return
      }
      e.preventDefault()
      e.stopPropagation()

      if (e.shiftKey && this.state.selection.lasti !== null) {
        this.rowDeselectAll()
        let start = rowi
        let end = this.state.selection.lasti
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

      this.$forceUpdate()
    },
    cursorSet (coli, rowi) {
      if (this.editable === false) {
        return
      }
      this.state.cursor.editing = false // cancel editing if editing

      // Same as before
      if (coli === this.state.cursor.coli &&
        rowi === this.state.cursor.rowi) {
        return false
      }
      this.state.cursor.rowi = rowi
      this.state.cursor.coli = coli
      if (rowi === undefined && coli === undefined) {
        return false
      }
      var cellEl = this.cellElAt(coli, rowi)
      this.state.cursor.field = cellEl.getAttribute('data-field')

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
      return true
    },
    cursorMove (colm, rowm, circle) {
      if (this.editable === false) {
        return
      }
      // if we have focus, we blur
      let newColi = this.state.cursor.coli + colm
      let newRowi = this.state.cursor.rowi + rowm

      if (circle) {
        var tEl = this.$refs.tbody
        if (newColi >= tEl.rows[0].cells.length - 1) {
          newRowi++
          newColi = 0
        } else if (newColi < 0) {
          newColi = tEl.rows[0].cells.length - 1
          newRowi--
        }
        if (newRowi >= tEl.rows.length) {
          newRowi = 0
        } else if (newRowi < 0) {
          newRowi = tEl.rows.length - 1
        }
      }
      newColi = limit(newColi, 0, this.$refs.tbody.rows[0].cells.length - 2)
      newRowi = limit(newRowi, 0, this.state.rows.length - 1)
      return this.cursorSet(newColi, newRowi)
    },
    cursorEnterNext () {
      if (!this.cursorMove(0, 1)) {
        return this.cursorMove(1, 0)
      }
      return true
    }

  }
}

function limit (val, min, max) {
  return Math.min(Math.max(val, min), max)
}

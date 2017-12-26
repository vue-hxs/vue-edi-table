/* row code */

// Data handler
export default {
  props: {
    'headers': {type: Object, default: {}},
    'rows': {type: Array, default: []}
  },
  data () {
    return {
      state: {
        rows: this.transformRows(this.rows),
        selection: {
          rows: [],
          lasti: null
        },
        historySet: [],
        headers: this.headers
      }
    }
  },
  watch: {
    rows (val, oldVal) {
      this.rowsSet(val)
    }
  },
  methods: {
    rowsSet (rows) {
      this.state.historySet = []
      this.state.selection.rows = []
      this.state.rows = this.transformRows(rows)
    },
    transformRows (rows) {
      return rows.map(row => { return {data: clone(row)} })
    },
    rowHasSelected () {
      return this.state.selection.rows.length > 0
    },
    rowSelect (rowi, val) { // or ref?
      if (val === false) {
        this.state.selection.rows[rowi].selected = false
        this.state.selection.rows.splice(rowi, 1)
        return
      }
      this.state.selection.lasti = rowi
      this.state.selection.rows.push(this.state.rows[rowi])
      this.state.rows[rowi].selected = true
    },
    rowSelectRange (start, end) {
      if (start > end) {
        [start, end] = [end, start]
      }
      for (let i = start; i <= end; i++) {
        this.state.selection.rows.push(this.state.rows[i])
        this.state.rows[i].selected = true
      }
    },
    rowDeselectAll () {
      console.log('Deselecting all')
      for (let row of this.state.selection.rows) {
        row.selected = false
      }
      this.state.selection.rows = []
    },
    rowAdd () {
      let changes = []
      var newRow = {}
      for (var k in this.state.headers) {
        newRow[k] = this.state.headers[k].default || ''
      }
      this.state.rows.push({data: newRow, modified: true})
      var rowi = this.state.rows.length - 1
      changes.push({row: this.state.rows[rowi], index: rowi})
      // this.changeSet.push({op: 'add', row: this.rows[ri].data})
      this.state.historySet.push({op: 'add', rows: changes})
    },
    rowDelete (rowList) {
      let changes = []
      for (let row of rowList) {
        let oldRow = clone(row) // Save current
        let vindex = this.state.rows.indexOf(row)
        if (vindex === -1) continue

        changes.push({row: row, index: vindex, oldRow: oldRow})
        this.state.rows.splice(vindex, 1)
      }
      this.state.historySet.push({op: 'delete', rows: changes})
      this.rowDeselectAll()
      // XXX: If auto commit, commit changes here
      /* if (this.autocommit === true) {
        this.commitChanges()
      } */
    },
    // Manipulators, mutators whatever?
    rowChange (rowi, field, newValue) {
      if (this.state.headers[field].readonly) {
        return false
      }
      if (this.state.rows[rowi].data[field] === newValue) {
        return false
      }
      var oldRow = clone(this.state.rows[rowi]) // Save current
      this.state.rows[rowi].data[field] = newValue
      this.state.rows[rowi].modified = true // Set as modified
      this.state.historySet.push(
        {
          op: 'update',
          rows: [
            { row: this.state.rows[rowi], index: rowi, oldRow: oldRow }
          ]
        })
    },
    /**
     * Experimental undo
     */
    // actionsUndo
    changesUndo () {
      var change = this.state.historySet.pop()
      var vindex
      switch (change.op) {
        case 'add':
          for (let i = change.rows.length - 1; i >= 0; i--) {
            let changeItem = change.rows[i]
            vindex = this.state.rows.indexOf(changeItem.row)
            this.state.rows.splice(vindex, 1) // delete row
          }
          break
        case 'update':
          for (let i = change.rows.length - 1; i >= 0; i--) {
            let changeItem = change.rows[i]
            // vindex = this.rows.indexOf(change.row)
            this.state.rows[changeItem.index] = changeItem.oldRow
          }
          break
        case 'delete':
          this.rowDeselectAll()
          for (let i = change.rows.length - 1; i >= 0; i--) {
            let changeItem = change.rows[i]
            this.state.rows.splice(changeItem.index, 0, changeItem.row)
            this.state.rows[changeItem.index].selected = true
            this.state.selection.rows.push(this.state.rows[changeItem.index])
          }
          break
      }
    },
    // actionsCommit
    changesCommit () {
      // Flatten the changes
      // build changeSet from history
      var changeControl = new Map()
      for (var histItem of this.state.historySet) {
        for (var data of histItem.rows) {
          let op = changeControl.get(data.row)
          if (op === 'add') { // Special case, merge updates into add
            switch (histItem.op) {
              case 'update':
                changeControl.set(data.row, op)
                break
              case 'delete':
                changeControl.delete(data.row)
                break
            }
            continue
          }
          changeControl.set(data.row, histItem.op)
        }
      }
      var changeSet = []

      for (let [row, op] of changeControl) {
        changeSet.push({op: op, data: row.data})
      }
      this.$emit('commit', changeSet)
    }

  }
}

function clone (obj) {
  return JSON.parse(JSON.stringify(obj))
}

/* row code */

// Data handler
export default {
  data () {
    return {
      state: {
        rows: this.transformRows(this.rows),
        selection: {
          rows: [],
          last: null
        },
        historySet: []
      }
    }
  },
  watch: {
    rows (val, oldVal) {
      this.setRows(val)
    }
  },
  methods: {
    rowsSet (rows) {
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
      this.state.selection.last = rowi
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
          changeControl.set(data.row, histItem.op)
        }
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

function clone (obj) {
  return JSON.parse(JSON.stringify(obj))
}

<template>
  <div class="app">
    <div class="controls"/>
    <div class="tables">
      <Split :resizeable="true" dir="horizontal" split="20%">
        <Pane title="vue-edi-table">
          <div class="doc">
            <h2>vue-edi-table</h2>
            <p>Source: <a href="https://github.com/vue-hxs/vue-edi-table">https://github.com/vue-hxs/vue-edi-table</a></p>
            <p>For the key events to work the table must be focused</p>
            <h4>Cell editing</h4>
            <p>
              <ul>
                <li>double click to initiate edit</li>
                <li>Start typing on focused cell to replace cell content and edit</li>
                <li><kbd>Backspace</kbd> or <kbd>Del</kbd> erases cell content </li>
                <li><kbd>Enter</kbd> starts edit, if cell is readonly move to the next cell</li>
                <li><kbd>Tab</kbd> moves to cell on the right</li>
                <li> While editing
                  <ul>
                    <li><kbd>Enter</kbd> moves to the cell on next row if last row it will move to the next cell on the right</li>
                    <li><kbd>Tab</kbd> moves to cell on the right</li>
                    <li><kbd>Esc</kbd> Cancels editing</li>
                  </ul>
                </li>
                <li>Certain fields change values just by interacting (checkbox)</li>
                <li>Arrow keys changes cell position looping around,
                if the cell is the right most it will move to the first cell on the next row</li>
              </ul>
              <small>* Some custom components in cell consumes key events that prevent table to receive those so some keys might not work as expected in table while focused on these components</small>
            </p>
            <h4>Click on indexes for Row selection:</h4>
            <p>
              <ul>
                <li>click - select/deselect row</li>
                <li>Ctrl click - select multiple rows</li>
                <li>Shift click - select range of rows from last clicked</li>
              </ul>
            </p>
          </div>
        </Pane>
        <Split resizeable="true" dir="vertical" split="80%">
          <Pane title="editable">
            <button @click="editable=!editable">editable {{ editable }}</button>
            <editable
              :headers="headers"
              :rows="dataList"
              :editable="editable"
              @commit="commit"
            />
          </Pane>
          <Pane title="standard table">
            <table>
              <thead>
                <tr>
                  <th
                    v-for="(header,coli) in headers"
                    :key="'header-'+coli">
                    {{ header.text }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row,rowi) in dataList"
                  :key="rowi">
                  <td v-for="(header,coli) in headers" :key="rowi+'-'+coli">
                    {{ row[header.field] }}
                  </td>
                </tr>
              </tbody>
            </table>
          </Pane>
        </Split>
      </Split>
    </div>
  </div>
</template>
<script>
import Editable from '..'
import {Split} from 'vue-split-layout'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en'
import Vue from 'vue'

Vue.use(ElementUI, {locale})

export default {
  components: {Editable, Split},
  data () {
    var dataList = []

    for (let i = 0; i < 4; i++) {
      dataList.push(
        {id: i * 4 + 1, datetime: '', name: 'Samsung', model: 'Note 4', active: true, password: '123', rdonly: true},
        {id: i * 4 + 2, datetime: '', name: 'Samsung', model: 'Note 5', active: true, password: '123', rdonly: false},
        {id: i * 4 + 3, datetime: '', name: 'Apple', model: 'iPhone 4', active: false, password: '123', rdonly: true},
        {id: i * 4 + 4, datetime: '', name: 'Apple', model: 'iPhone X', active: true, password: '123', rdonly: true}
      )
    }
    return {
      editable: true,
      headers: [
        {
          field: 'id', // proper name maybe?
          text: 'Id',
          style: {'flex': '0 0 40px'},
          readonly: true
        },
        {field: 'name', text: 'Brands'},
        {field: 'model', text: 'model'},
        {field: 'active', text: 'active', type: 'checkbox'},
        {field: 'password', text: 'Password', type: 'password', placeholder: 'type password'},
        {
          field: 'datetime',
          text: 'datetime',
          component: {
            name: 'el-date-picker',
            props: {'type': 'datetime'}
          },
          style: {'flex': '2', 'min-width': '200px'}
        },
        {
          field: 'datetime',
          text: 'Same as datetime, but component is on edit only',
          editComponent: {
            name: 'el-date-picker',
            props: {'type': 'datetime'}
          },
          style: {'flex': '2', 'min-width': '200px'}
        },

        {field: 'rdonly', text: 'readonly checkbox', type: 'checkbox', readonly: true}
      ],
      dataList: dataList
    }
  },
  methods: {
    commit (c) {
      console.log('Commit data:', c)
      for (let entry of c) {
        switch (entry.op) {
          case 'update':
            this.dataList.forEach((v, i) => {
              if (v.id === entry.data.id) {
                this.$set(this.dataList, i, entry.data)
              }
            })
            break
          case 'delete':
            let id = this.dataList.findIndex(d => d.id === entry.data.id)
            this.dataList.splice(id, 1)
            break
          case 'add':
            this.dataList.push(entry.data)
            break
        }
      }
    }
  }
}
</script>
<style>

body {
  margin:0;
  padding:0;
  height:100vh;
}

kbd {
  padding:1px 2px;
  background: #f1f1f1;
  border: solid 1px #aaa;

  border-radius: 3px;
  box-shadow: 1px 1px 2px rgba(150,150,150,0.3);
}
button {
  cursor:pointer;
  border: none;
  border-radius:none;
  background: #eee;
  outline:none;
  padding: 0px 20px;
  min-height:30px;
  position:relative;
  border: solid 1px rgba(0,0,0,0.1);
}
button::after {
  content:" ";
  position:absolute;
  top:0;
  right:0;
  bottom:0;
  left:0;
  transition: all .3s;
}

button:hover::after {
  background: rgba(0,0,0,0.1);
  pointer-events: none;
}

/* Let's get this party started */
::-webkit-scrollbar {
  padding-top:10px;
  width: 8px;
  height: 8px;
}

/* Track */
::-webkit-scrollbar-track {
  border-radius: 0px;
  width:3px;
  height:3px;
  background: rgba(55,55,55,0.1);
}

/* Handle */
::-webkit-scrollbar-thumb {
    border-radius: 0px;
  width:8px;
  height:8px;
  background: rgba(155,155,155,0.8);
}
::-webkit-scrollbar-thumb:window-inactive {
	background: rgba(55,55,55,0.8);
}
* {
  box-sizing:border-box;
}
.app {
  display:flex;
  flex-flow:column;
  background: #f9f9f9;
  height:100%;
}
.doc {
  padding:10px;
  background: #Fff;
}
.tables {
  flex:1;
  display:block;
}
.editable-container {
  padding:10px;
  display:flex;
  flex-flow:column;
  overflow:hidden;
  max-height:500px;
}

.split >.content {
  overflow:initial;
}
.splitter {
  background: rgba(0,0,0,0.1) !important;
}
.el-date-editor.el-input {
  width:100%;
  margin:4px;
  padding:0;
  background:transparent;
}
.el-input__inner {
  background:transparent;
  border:none;
  border-radius:0px;
  margin:0px;
}
.pane {
  box-shadow: 0px 2px 12px rgba(0,0,0,0.2);
}
</style>

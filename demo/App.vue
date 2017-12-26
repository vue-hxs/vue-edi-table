<template>
  <div class="app">
    <div class="controls">
      <button @click="editable=!editable">editable {{ editable }}</button>
    </div>
    <div class="tables">
      <Split :resizeable="true" dir="horizontal">
        <editable
          :headers="headers"
          :rows="dataList"
          :editable="editable"
          @commit="commit"
        />
        <div/>
      </Split>
    </div>
  </div>
</template>
<script>
import Editable from '../src'
import {Split} from 'vue-split-layout'

export default {
  components: {Editable, Split},
  data () {
    var dataList = []

    for (let i = 0; i < 2; i++) {
      dataList.push(
        {id: i * 4 + 1, name: 'Samsung', model: 'Note 4', active: true, password: '123', rdonly: true},
        {id: i * 4 + 2, name: 'Samsung', model: 'Note 5', active: true, password: '123', rdonly: false},
        {id: i * 4 + 3, name: 'Apple', model: 'iPhone 4', active: false, password: '123', rdonly: true},
        {id: i * 4 + 4, name: 'Apple', model: 'iPhone X', active: true, password: '123', rdonly: true}
      )
    }
    return {
      editable: true,
      headers: {
        id: {header: 'Id', text: 'Id', readonly: true},
        name: {header: 'Brands', text: 'Brands'},
        model: {header: 'model', text: 'model'},
        active: {header: 'active', text: 'active', type: 'checkbox'},
        password: {header: 'Password', text: 'Password', type: 'password'},
        rdonly: {header: 'Big ass header testing Readonly checkbox', text: 'Big ass header testing Readonly checkbox', type: 'checkbox', readonly: true}
      },
      dataList: dataList
    }
  },
  methods: {
    commit (c) {
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
.app {
  display:flex;
  flex-flow:column;
  background: #f9f9f9;
  height:100%;
}
.tables {
  flex:1;
  min-height:400px;
  display:flex;
  flex-flow:column;
}
</style>

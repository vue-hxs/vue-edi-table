<template>
  <div class="app">
    <div class="controls">
      <button @click="editable=!editable">editable {{ editable }}</button>
      <input type="text" value="focus test">
    </div>

    <Split :resizeable="true" dir="horizontal">
      <div>
        <editable-new
          :headers="columns"
          :rows="dataList"
          :editable="editable"
          @commit="commit"
          row-height="40px"
          index-width="40px"/>
      </div>
      <div/>
      <!--  <div class="old-editable">-->
      <!--<Editable
        :columns="columns"
        :data-list="dataList"
        :editable="editable"/>-->
    </Split>
  </div>
</template>
<script>
import {Editable} from '../src'
import {EditableNew} from '../src/table'
import {Layout} from 'vue-split-layout'

export default {
  components: {Editable, EditableNew, Layout},
  data () {
    var dataList = []

    for (let i = 0; i < 50; i++) {
      dataList.push(
        {id: i * 4 + 1, name: 'Samsung', model: 'Note 4', active: true, password: '123', rdonly: true},
        {id: i * 4 + 2, name: 'Samsung', model: 'Note 5', active: true, password: '123', rdonly: false},
        {id: i * 4 + 3, name: 'Apple', model: 'iPhone 4', active: false, password: '123', rdonly: true},
        {id: i * 4 + 4, name: 'Apple', model: 'iPhone X', active: true, password: '123', rdonly: true}
      )
    }
    return {
      splits: {
        dir: 'horizontal',
        split: '50%',
        first: 0,
        second: 1
      },
      editable: true,
      columns: {
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
      console.log('Commiting changes:', c)
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
  position:relative;
  height:100%;
}
.layout-container {
  height:100%;
}
</style>

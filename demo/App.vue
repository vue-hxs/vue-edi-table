<template>
  <div class="app">
    <div class="controls">
      <button @click="editable=!editable">editable {{editable}}</button>
      <input type="text" value="focus test">
    </div>
    <Editable
      :columns="columns"
      :data-list="dataList"
      :editable="editable"
      ></Editable>
  </div>
</template>
<script>
import {Editable} from '../src'

export default {
  components: {Editable},
  data () {
    var dataList = []

    for (let i = 0; i < 50; i++) {
      dataList.push(
        {name: 'Samsung', model: 'Note 4'},
        {name: 'Samsung', model: 'Note 5'},
        {name: 'Apple', model: 'iPhone 4'},
        {name: 'Apple', model: 'iPhone X'}
      )
    }

    return {
      editable: true,
      columns: {
        name: {header: 'Brands'},
        model: {header: 'model'}
      },
      dataList: dataList
    }
  }
}
</script>

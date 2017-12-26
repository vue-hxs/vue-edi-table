<template>
  <div
    id="editable"
    :class="{editable:editable}"
    @keydown="keyEvent">
    <div class="actions">
      <button
        v-if="editable"
        :disabled="state.historySet.length == 0"
        class="primary-inv"
        @click="changesCommit">save</button>
      <button
        v-if="editable && rowHasSelected()"
        @click="rowDelete(state.selection.rows)">Delete selected rows</button>
      <button
        v-if="state.historySet.length > 0"
        @click="changesUndo">&lt; Undo</button>
    </div>
    <div class="table-container">
      <table
        ref="table"
        tabindex="1"
        @blur="tableBlur"
        @scroll="tableScroll"
        :class="{scrollingTop: state.scroll.top > 0, scrollingLeft: state.scroll.left > 0}">

        <!-- this is the editor -->
        <div
          v-if="editable"
          ref="editor"
          class="editor"
        >
          <input
            v-if="state.cursor.field != undefined && state.headers[state.cursor.field].type == 'checkbox'"
            class="input"
            ref="input"
            type="checkbox"
            @blur="editStop"
            v-model="state.cursor.value"
          >
          <input
            v-else
            class="input"
            ref="input"
            :type="state.cursor.field ? state.headers[state.cursor.field].type:''"
            @blur="editStop"
            v-model="state.cursor.value"
          >
        </div>

        <thead ref="thead">
          <tr>
            <th class="index header">#</th>
            <th
              class="header"
              :key="k"
              v-for="(header,k) in headers"
              v-if="header.visible != false">
              {{ header.text == undefined? k: header.text }}
            </th>
          </tr>
        </thead>
        <!-- DATA -->
        <tbody
          ref="tbody"
        >
          <tr
            v-for="(row,rowi) in state.rows"
            :class="{modified: row.modified, selected: row.selected}"
            :key="rowi">
            <td
              :class="{header:true, index:true, modified: row.modified, selected: row.selected}"
              @click="rowClick($event,rowi)">
              {{ rowi }}
            </td>
            <td
              v-for="(header, field, coli) in headers"
              v-if="header.visible != false"
              @click="cellClick($event,rowi,coli)"
              @dblclick="cellDblClick($event,rowi,coli)"
              :class="{active:state.cursor.rowi == rowi && state.cursor.coli == coli}"
              :data-field="field"
              :key ="field">
              <template v-if="!(state.cursor.editing && state.cursor.rowi == rowi && state.cursor.field == field)">
                <template v-if="header.type == 'checkbox'">
                  <input
                    type="checkbox"
                    :checked="row.data[field]"
                    @change="cellChange(rowi,field, $event.target.checked)"
                    :class="{readonly:state.headers[field].readonly || !editable}"
                  >
                </template>
                <template v-else-if="header.type != undefined">
                  <input
                    :type="header.type"
                    :value="row.data[field]"
                    :class="{readonly:state.headers[field].readonly || !editable}"
                    readonly>
                </template>
                <template v-else>
                  {{ row.data[field] }}
                </template>
              </template>
            </td>
          </tr>
        </tbody>
        <tfoot v-if="editable">
          <tr>
            <td class="add" @click="rowAddEvent">+</td>
          </tr>
        </tfoot>
      <!-- not a footer but actually the indexes -->
      </table>
    </div>

  </div>
</template>

<script src="./Table.vue.js"/>

<style src="./Table.css" scoped></style>
<style src="./Table.theme.css"></style>

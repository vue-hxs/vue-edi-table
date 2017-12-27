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
        :class="{scrollingTop: state.scroll.top > 0, scrollingLeft: state.scroll.left > 0,editing:state.cursor.editing}">
        <!-- DATA -->
        <tbody ref="tbody" >
          <tr class="thead">
            <th class="index header">#</th>
            <th
              class="header"
              :key="k"
              v-for="(header,k) in headers"
              v-if="header.visible != false">
              {{ header.text == undefined? k: header.text }}
            </th>
          </tr>

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

              <input
                v-if="header.type != undefined || cellIsEditing(coli,rowi)"
                class="input"
                :type="header.type"
                :placeholder="header.placeholder"
                :class="{readonly: fieldIsReadOnly(field)}"
                v-model="!cellIsEditing(coli,rowi)?row.data[field]:state.cursor.value"
                @focus="editFocusStart(coli,rowi)"
                @blur="editStop"
              >
              <template v-else>
                {{ row.data[field] }}
              </template>
            </td>
          </tr>
        </tbody>
        <tfoot v-if="editable">
          <tr>
            <td
              class="add"
              @click="rowAddEvent">+</td>
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

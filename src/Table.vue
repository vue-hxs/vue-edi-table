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
    <!--<div class="table-container">-->
    <table
      ref="table"
      tabindex="1"
      @blur="tableBlur"
      @scroll="tableScroll"
      :class="{scrollingTop: state.scroll.top > 0, scrollingLeft: state.scroll.left > 0,editing:state.cursor.editing}">
      <!-- DATA -->
      <tbody ref="tbody" >
        <tr class="thead">
          <td class="index header">#</td>
          <td
            v-for="(header,k) in headers"
            v-if="header.visible != false"
            class="header"
            :key="k"
            :style="header.style">
            {{ header.text == undefined? k: header.text }}
          </td>
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
            :style="header.style"
            :key ="field">
            <component
              v-if="header.component"
              v-bind="header.props"
              v-model="!cellIsEditing(coli,rowi)?row.data[field]:state.cursor.value"
              :class="{input:true,editing:cellIsEditing(coli,rowi),readonly:fieldIsReadOnly(field)}"
              :id="'comp' + field + rowi"
              :is="header.component"
              @focus="editFocusStart(coli,rowi)"
              @blur="editStop"
            />
            <input
              v-else-if="header.type != undefined || cellIsEditing(coli,rowi)"
              v-model="!cellIsEditing(coli,rowi)?row.data[field]:state.cursor.value"
              :class="{input:true,editing:cellIsEditing(coli,rowi),readonly:fieldIsReadOnly(field)}"
              :type="header.type"
              :placeholder="header.placeholder"
              @focus="editFocusStart(coli,rowi)"
              @blur="editStop"
            >
            <template v-else>
              {{ row.data[field] }}
            </template>
          </td>
        </tr>
        <tr>
          <td
            class="add index"
            @click="rowAddEvent">+</td>
        </tr>
      </tbody>
    </table>
    <!--</div>-->

  </div>
</template>

<script src="./Table.vue.js"/>

<style src="./Table.css" scoped></style>
<style src="./Table.theme.css"></style>

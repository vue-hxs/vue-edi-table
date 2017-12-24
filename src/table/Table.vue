<template>
  <div
    id="table2"
    tabindex="1"
    @keydown="keyEvent">
    <div class="actions">
      <button
        v-if="editable"
        :disabled="state.historySet.length == 0"
        class="primary-inv"
        @click="commitChanges">save</button>
      <button
        v-if="editable && state.selectedRows.length > 0"
        @click="rowDelete(state.selectedRows)">Delete selected rows</button>
      <button
        v-if="state.historySet.length > 0"
        @click="undoLast">&lt; Undo</button>
    </div>

    <table ref="table">
      <thead
        ref="header"
        class="header">
        <tr >
          <th
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
        @scroll="scrollEvent"
        @touchmove="scrollEvent"
      >
        <tr
          v-for="(row,rowi) in state.rows"
          :class="{modified: row.modified, selected: row.selected}"
          :key="rowi">
          <td
            v-for="(header, field, coli) in headers"
            v-if="header.visible != false"
            @click="cellClick($event, rowi,field)"
            @dblclick="cellDblClick($event, rowi,field)"
            :class="{active:state.cursor.rowi == rowi && state.cursor.coli == coli}"
            :data-field="field"
            :key ="field">
            <template v-if="!(state.cursor.editing && state.cursor.rowi == rowi && state.cursor.field == field)">
              <template v-if="header.type == 'checkbox'">
                <input
                  type="checkbox"
                  :checked="row.data[field]"
                  @change="nullEvt"
                  @click="nullEvt"
                  readonly>
              </template>
              <template v-else-if="header.type != undefined">
                <input
                  :type="header.type"
                  :value="row.data[field]"
                  readonly>
              </template>
              <template v-else>
                {{ row.data[field] }}
              </template>
            </template>
          </td>
        </tr>
        <!-- Maybe a new TR containing the new row here -->
        <!-- this is the editor -->
        <div
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
        <!--<div
          ref="selection"
          class="selection"
          :style="selectionStyle">
          <div class="handle"/>
        </div>-->
      </tbody>
      <!-- not a footer but actually the indexes -->
      <tfoot
        ref="indexes"
        class="indexes">
        <tr
          v-for="(row,rowi) in state.rows"
          :class="{modified: row.modified, selected: row.selected}"
          :key="rowi"
          @click="rowClick($event,rowi)">
          <td >
            {{ rowi }}
          </td>
        </tr>
      </tfoot>

    </table>
    <div class="table-debug">
      test:
      {{ state.focus }}
    </div>

  </div>
</template>

<script src="./Table.vue.js"/>

<style src="./Table.css"/>
<style src="./Table.theme.css"></style>

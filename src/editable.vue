<template>
  <div class="editable">

    <datalist
      v-for="(c,k) in columns"
      :key="k"
      v-if="c.list"
      :id="k +'dtlist'">
      <option
        v-for="it in c.list"
        :key="it"
        :value="it"/>
    </datalist>

    <div class="actions">
      <button
        v-if="editable"
        :disabled="historySet.length == 0"
        class="primary-inv"
        @click="commitChanges">save</button>
      <button
        v-if="editable && selectedRows.length > 0"
        @click="rowDelete(selectedRows)">Delete selected rows</button>
      <button
        v-if="historySet.length > 0"
        @click="undoLast()">&lt; Undo</button>
    </div>

    <div class="table-container">
      <table
        ref="table"
        :class="{editable:editable}">
        <thead>
          <tr>
            <th class="header">#</th>
            <th
              class="header"
              v-for="(c,k) in columns"
              :key="k"
              :style="c.style">{{ c.header ? c.header : k }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, ri) in rows"
            :key="ri"
            :class="{modified: row.modified}"
            @click="rowClickEvent">
            <td
              class="header"
              @click="rowSelect"
              contextmenu="mymenu">{{ ri }}</td>
            <td
              v-for="(c,k) in columns"
              :key="k"
              :style="c.style"
              @mouseover="cellHoverEvent"
              @mousedown="cellDownEvent"
              @dragstart="(e) => e.preventDefault()"
            >
              <!-- editing -->
              <!--<template>
                {{row.data[k]}}
              </template>-->
              <textarea
                class="edit"
                @change="cellChangeEvent($event, ri,k)"
                @focus="cellFocusEvent"
                @blur="cellBlurEvent"
                v-if="c.type == 'textarea'"
                readonly
              >
                {{ row.data[k] }}
              </textarea>
              <input
                class="edit"
                @change="cellChangeEvent($event, ri,k)"
                @focus="cellFocusEvent"
                @blur="cellBlurEvent"
                v-else-if="c.type == 'checkbox'"
                :type="c.type"
                :checked="row.data[k]"
                readonly>
              <input
                class="edit"
                @change="cellChangeEvent($event, ri,k)"
                @focus="cellFocusEvent"
                @blur="cellBlurEvent"
                v-else
                :type="c.type"
                :value="row.data[k]"
                :placeholder="c.placeholder"
                :list="k +'dtlist'"
                readonly>
            </td>
          </tr>
          <tr v-if="editable"> <!-- same as above but for new entry ? -->
            <td
              class="header plus"
              @click="rowAdd">+</td> <!-- Special add -->
            <td
              v-for="(c,k) in columns"
              :style="c.style"
              :key="k"
              @mouseover="cellHoverEvent"
              @mousedown="cellDownEvent">
              <textarea
                v-if="c.type == 'textarea'"
                class="edit"
                @change="cellNewChange($event, k)"
                @focus="cellFocusEvent"
                @blur="cellBlurEvent"
                readonly> {{ newRow[k] }}</textarea>
              <input
                v-else-if="c.type == 'checkbox'"
                :type="c.type"
                class="edit"
                :checked="newRow[k]"
                @change="cellNewChange($event, k)"
                @focus="cellFocusEvent"
                @blur="cellBlurEvent">
              <input
                v-else
                class="edit"
                :type="c.type"
                :value="newRow[k]"
                @change="cellNewChange($event, k)"
                @focus="cellFocusEvent"
                @blur="cellBlurEvent"
                :list="k +'dtlist'"
                readonly>
            </td>
          </tr>
          <div
            id="selection"
            ref="selection">
            <div class="handle"/>
          </div>
        </tbody>
      </table>
    </div> <!-- /table-container -->

    <div v-if="debug" style="color:rgba(0,0,0,0.2);position:relative;">
      DEBUG
      EditMode: {{ editMode }}
      <div>Current: {{ currentValue }}</div>
      <div>Hover: {{ hoverValue }}</div>

      History set:
      <div>{{ historySet }}</div>
    </div>

  </div>
</template>
<script src='./editable.vue.js' />
<style lang="scss" scoped>
@import './editable.scss';
</style>

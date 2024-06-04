<template>
  <HeatmapCalendar v-model="val" label="Vite + Vue" />
</template>

<script setup lang="ts">
//@ts-ignore
import { ref } from "vue";
import HeatmapCalendar from "./components/HeatmapCalendar.vue";

const val = ref(false);

components: {
  HeatmapCalendar
  }
</script>

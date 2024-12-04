<template>
  <HeatmapCalendar 
    :system-of-records="systemOfRecords" 
    @on-filter-date-change="handleDateChange"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import HeatmapCalendar from "./components/HeatmapCalendar.vue";

const handleDateChange = (data: {
  period: string;
  date: string;
  url: string;
  downloadedUrls?: Record<string, any[]>;
}) => {
  console.log(data);
};

const systemOfRecords = ref(false);
</script>
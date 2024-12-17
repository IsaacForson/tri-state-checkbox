import { defineComponent, h } from "vue";
import HeatmapCalendarComponent from "./components/HeatmapCalendar.vue";
export const HeatmapCalendar = defineComponent({
  name: "HeatmapCalendar",
  components: {
    HeatmapCalendarComponent,
  },
  setup() {
    return () => h(HeatmapCalendarComponent);
  },
});
export default HeatmapCalendar;
// Add this line to export the type
export type { PropType as HeatmapCalendarProps } from "vue";
<template>
  <div>
    <button @click="toggleDatePickerVisibility" class="new_calendar_toggle_button" ref="dateInput">
      {{ appliedDateRange }}
    </button>

    <div class="new_calendar_wrapper">
      <div class="new_calendar_date_range_picker" v-show="showDatePicker" ref="datePicker">
        <div class="new_calendar_header">
          <div class="new_calendar_input_wrapper">
            <input type="date" v-model="dateInputs.start" @input="handleStartDateInput" class="new_calendar_date_input" id="new_calendar_left_input" /> <span> - </span>
            <input type="date" v-model="dateInputs.end" @input="handleEndDateInput" class="new_calendar_date_input" id="new_calendar_right_input" />
            <button id="new_calendar_code_counter">
              &lt;/&gt;
              <span style="padding-left: 2px"> {{ bookedDaysCount }}</span>
            </button>
          </div>
          <div id="new_calendar_arrows_wrapper">
            <button @click="clearDates">×</button>
            <div style="display: flex; align-items: center; margin-left: auto">
    <select @change="handleQuickSelect" v-model="selectedQuickOption" id="new_calendar_quick_select">
    <option value="" selected>Quick Select</option>
    <option value="today">Today</option>
    <option value="last7days">Last 7 days</option>
    <option value="last30days">Last 30 days</option>
    <option value="last90days">Last 90 days</option>
    <option value="custom" disabled>Custom</option>
  </select>
  </div>
          </div>
        </div>

        <div class="new_calendar_datepicker_container">
          <div class="new_calendar_wrapper">
            <div class="new_calendar" ref="startCalendar">
              <div class="new_calendar_month" style="text-align: center">
                <span>{{ startMonth }} {{ startYear }}</span>
              </div>
              <div class="new_calendar_days_of_week">
                <div v-for="(dayName, index) in dayNames" :key="index" class="new_calendar_day_of_week">
                  {{ dayName }}
                </div>
              </div>
              <div class="new_calendar_days">
                <div class="new_calendar_day" v-for="(day, index) in daysInMonth(
                  startYear,
                  startMonthIndex
                )" :key="index" :class="{
                    selected: isSelected(Number(day), startMonthIndex),
                    highlighted: isHighlighted(Number(day), startMonthIndex),
                    'start-date': isStartDate(Number(day), startMonthIndex),
                    'end-date': isEndDate(Number(day), startMonthIndex),
                    booked: isBooked(Number(day), startMonthIndex),
                  }" @click="selectDate(Number(day), startMonthIndex)">
                  {{ day }}
                  <div v-if="isBooked(Number(day), startMonthIndex)" class="new_calendar_tooltip"
                  v-show="tooltipVisible[index]">
                  <h6 class="new_calendar_tooltip_header">
                    Major Code Changes
                  </h6>
                  <p class="new_calendar_tooltip_list">{{ getChangeDescription(Number(day), startMonthIndex) }}</p>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="new_calendar_apply_button_wrapper">
          <button @click="applyDateRange" class="new_calendar_apply_button"   :disabled="isApplyDisabled">
            Apply
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
//@ts-ignore
import { ref, computed, onBeforeUnmount, onMounted, Ref, defineEmits, reactive, watch } from "vue";


interface DateTooltip {
  [key: number]: boolean;
}

export default {
  name: "CalendarModal",
  emits: ["on-filter-date-change"],
  watch: {
    'dateInputs.start': 'checkDateInputs',
    'dateInputs.end': 'checkDateInputs'
  },
  //@ts-ignore
  setup(props, { emit }) {
    const selectedQuickOption = ref('');
    const showDatePicker = ref(false);
    const startDate: Ref<Date | null> = ref(null);
    const endDate: Ref<Date | null> = ref(null);
    const startDateInput = ref('');
    const endDateInput = ref('');
    const datePicker = ref<HTMLElement | null>(null);
    const dateInput = ref<HTMLElement | null>(null);
    const currentUrl = ref(window.location.href);
    const dateRange = ref("");
    const appliedDateRange = ref("");
    const today = new Date();
    const startMonthIndex = ref<number>(today.getMonth());
    const endMonthIndex = ref<number>((today.getMonth() + 1) % 12);
    const startMonth = computed(() => monthNames[startMonthIndex.value]);
    const endMonth = computed(() => monthNames[endMonthIndex.value % 12]);
    const startYear = ref(today.getFullYear());
    const endYear = ref(today.getFullYear());
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const monthNames = [ "January","February","March","April","May","June","July","August","September","October","November","December",];
    const bookedDates = ref<Date[]>([]);
    const changeDescriptionsRef: Ref<Record<string, string>> = ref({});
    const tooltipVisible: Ref<DateTooltip> = ref({});
    onMounted(async () => {
    const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDatesFromUrl();

    if (endMonthIndex.value > 11) {
      endMonthIndex.value -= 12;
      endYear.value += 1;
    }
  
  // Ensure the dates are not null
  const start = defaultStartDate || new Date();
  const end = defaultEndDate || new Date();
  
  startDate.value = start;
  endDate.value = end;
  dateRange.value = `${formatDate(start)} - ${formatDate(end)}`;
  appliedDateRange.value = dateRange.value;

  console.log('Default Start Date:', formatDate(start));
  console.log('Default End Date:', formatDate(end));

  document.addEventListener('click', handleClickOutside);

  await loadWebVariants(); // Fetch booked dates from the API
});

const dateInputs = reactive({
  start: '',
  end: ''
});

const handleStartDateInput = () => {
  if (dateInputs.start) {
    startDate.value = new Date(dateInputs.start);
    updateDateRange();
  }
};

const handleEndDateInput = () => {
  if (dateInputs.end) {
    endDate.value = new Date(dateInputs.end);
    updateDateRange();
  }
};

const checkDateInputs = () => {
      const leftInput = document.getElementById('new_calendar_left_input');
      if ((dateInputs.start === null || dateInputs.start === '') && (dateInputs.end === null || dateInputs.end === '')) {
        if (leftInput) {
          leftInput.style.marginRight = '7px';
        }
      } else {
        if (leftInput) {
          leftInput.style.marginRight = '0px';
        }
      }
    }
  

    // getting items using url
    const getItemFromUrl = (item: string) => {
      const parsedUrl = new URL(currentUrl.value);
      const searchParams = new URLSearchParams(parsedUrl.search);
      const hashParams = new URLSearchParams(parsedUrl.hash.slice(1));
      return searchParams.get(item) || hashParams.get(item);
    };

    //  Defined loadWebVariants function 
    async function loadWebVariants() {
      const url = `/index.php?module=API&format=json&method=HeatmapSessionRecording.loadWebVariants&idSite=${getItemFromUrl('idSite')}&idSiteHsr=${getItemFromUrl('subcategory')}&deviceType=${getItemFromUrl('deviceType')}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(response);
        bookedDates.value = data.result.map((item: any) => new Date(item.raw_date));

        // storing change description for future use
        const changeDescriptions = data.result.reduce((acc: any, item: any) => {
          acc[item.raw_date] = item.changeDescription;
          return acc;
        }, {});
        changeDescriptionsRef.value = changeDescriptions;
        
          console.log(data);
        } catch (error) {
          console.error(error);
        }
          }

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
    });
    
    // getting default dates from url
    const getDefaultDatesFromUrl = () => {
    var url = window.location.href;
    var urlObj = new URL(url);
    var fragment = urlObj.hash.substring(1);
    var fragmentParams = new URLSearchParams(fragment);
    var periodParam = fragmentParams.get('period');

    if (periodParam === 'day') {
      var today = new Date();
      return { startDate: today, endDate: today };
  } 
  // Get the date 7 days ago
  else if (periodParam === 'week') {
    var today = new Date();
    var date7DaysAgo = new Date();
    date7DaysAgo.setDate(today.getDate() - 7);
    return { startDate: date7DaysAgo, endDate: today };
  } 
  // Get the date in range
  else if (periodParam === 'range') {
    var dateRange = fragmentParams.get('date')?.split(',');
    var startDate = dateRange ? new Date(dateRange[0]) : null;
    var endDate = dateRange ? new Date(dateRange[1]) : null;
    return { startDate: startDate, endDate: endDate };
    
  } 
  // Get the date in month
  else if (periodParam === 'month') {
    var today = new Date();
    var date30DaysAgo = new Date();
    date30DaysAgo.setDate(today.getDate() - 30);
    return { startDate: date30DaysAgo, endDate: today };
  }
  return { startDate: new Date(), endDate: new Date() };
}

// getting description from versions
const getChangeDescription = (day: number, monthIndex: number) => {
  const date = new Date(startYear.value, monthIndex, day);
  const dateString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  return changeDescriptionsRef.value[dateString] || 'No description available';
};


  // toggling date button (visible / hidden)
    const toggleDatePickerVisibility = () => {
      showDatePicker.value = !showDatePicker.value;
    };

    // used for handling input (user will be able to type in input field)
    const handleDateInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  const dates = value.split(" - ");
  if (dates.length === 2) {
    const start = new Date(dates[0]);
    const end = new Date(dates[1]);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      startDate.value = start;
      endDate.value = end;
    }
  }
};

// tooltip show on hover
    const toggleDatePicker = () => {
      showDatePicker.value = true;
    };

    // creation of days of the month
    const daysInMonth = (year: number, month: number) => {
      const numDays = new Date(year, month + 1, 0).getDate();
      const firstDay = firstDayOfMonth(year, month);
      const daysArray = [];

      for (let i = 0; i < firstDay; i++) {
        daysArray.push("");
      }

      for (let i = 1; i <= numDays; i++) {
        daysArray.push(i);
      }

      return daysArray;
    };

    // selecting the first day of the month
    const firstDayOfMonth = (year: number, month: number) => {
      return new Date(year, month, 1).getDay();
    };

    // checking if there is a booked day
    const isBooked = (day: number, month: number) => {
      return bookedDates.value.some(
        (bookedDate: Date) =>
          bookedDate.getDate() === day &&
          bookedDate.getMonth() === month &&
          bookedDate.getFullYear() === startYear.value
      );
    };

    // showing of tooltip
    const showTooltip = (index: number) => {
      tooltipVisible.value = { ...tooltipVisible.value, [index]: true };
    };

    // hiding of tooltip
    const hideTooltip = (index: number) => {
      tooltipVisible.value = { ...tooltipVisible.value, [index]: false };
    };

    // selecting date on the calendar
    const selectDate = (day: number, monthIndex: number) => {
  if (typeof day !== "number" || day === 0) return;
  const selectedYear = monthIndex < startMonthIndex.value ? endYear.value : startYear.value;
  const date = new Date(selectedYear, monthIndex, day);
  if (!startDate.value) {
    startDate.value = date;
  } else if (!endDate.value) {
    endDate.value = date;
    if (endDate.value < startDate.value) {
      [startDate.value, endDate.value] = [endDate.value, startDate.value];
    }
  } else {
    startDate.value = date;
    endDate.value = null;
  }
  updateDateRange();
  checkIfCustomDateRange();
};

const updateDateRange = () => {
  if (startDate.value) {
    dateInputs.start = startDate.value.toISOString().split('T')[0];
    dateRange.value = formatDate(startDate.value);
    if (endDate.value) {
      dateInputs.end = endDate.value.toISOString().split('T')[0];
      dateRange.value += " - " + formatDate(endDate.value);
    } else {
      dateInputs.end = '';
    }
  } else {
    dateInputs.start = '';
    dateInputs.end = '';
    dateRange.value = "";
  }
};

    // button that clears all date range text from input field
    const clearDates = () => {
  startDate.value = null;
  endDate.value = null;
  dateInputs.start = '';
  dateInputs.end = '';
  dateRange.value = "";
};

    // arrow button for showing previous months
    const prevMonth = () => {
      if (startMonthIndex.value > 0) {
        startMonthIndex.value -= 1;
      } else {
        startMonthIndex.value = 11;
        startYear.value -= 1;
      }
      if (endMonthIndex.value > 0) {
        endMonthIndex.value -= 1;
      } else {
        endMonthIndex.value = 11;
        endYear.value -= 1;
      }
    };

    // arrow button for showing following months
    const nextMonth = () => {
      if (startMonthIndex.value < 11) {
        startMonthIndex.value += 1;
      } else {
        startMonthIndex.value = 0;
        startYear.value += 1;
      }
      if (endMonthIndex.value < 11) {
        endMonthIndex.value += 1;
      } else {
        endMonthIndex.value = 0;
        endYear.value += 1;
      }
    };

    // button that selects only today
    const selectToday = () => {
  const start = new Date();
  const end = new Date();
  startDate.value = start;
  endDate.value = null;
  dateRange.value = `${formatDate(start)}`;
  
  // Update the start date input
  dateInputs.start = start.toISOString().split('T')[0];
  // Clear the end date input
  dateInputs.end = end.toISOString().split('T')[0];;
};

    // total count for versions
    const bookedDaysCount = computed(() => {
      const start = startDate.value?.getTime();
      const end = endDate.value?.getTime();
      if (start === undefined || end === undefined) {
        return 0;
      }
      return bookedDates.value.filter(
        (bookedDate: Date) =>
          bookedDate.getTime() >= start && bookedDate.getTime() <= end
      ).length;
    });

//  button that applies / save date range
 const applyDateRange = () => {
  let period = "range";
  let date = "";

  if (startDate.value && endDate.value) {
    date = `${startDate.value.toLocaleDateString()} - ${endDate.value.toLocaleDateString()}`;
  } else if (startDate.value) {
    period = "day";
    date = startDate.value.toLocaleDateString();
  }

  appliedDateRange.value = date;
  toggleDatePickerVisibility();

  const dateValue = period === "range"
    ? `${startDate.value!.toISOString().split("T")[0]},${endDate.value!.toISOString().split("T")[0]}`
    : startDate.value!.toISOString().split("T")[0];

  // Constructing the new URL with the updated date selection
  const url = new URL(window.location.href);
  const fragment = url.hash.substring(1);
  const fragmentParams = new URLSearchParams(fragment);

  // Remove the leading `/` if present
  if (fragment.startsWith('/')) {
    fragmentParams.delete('');
  }

  fragmentParams.set('period', period);
  fragmentParams.set('date', dateValue);

  // Construct the final hash with a leading `?`
  url.hash = `?${fragmentParams.toString().replace(/%2C/g, ',')}`;

  const data = {
    period,
    date: dateValue,
    url: url.toString()
  };

  console.log("Emitted Data :", data);
  emit("on-filter-date-change", data);
};

// highlighting selected date range
const isHighlighted = (day: number, monthIndex: number) => {
  if (!startDate.value || !endDate.value) return false;
  const year = monthIndex < startMonthIndex.value ? endYear.value : startYear.value;
  const selectedDate = new Date(year, monthIndex, day);
  return selectedDate > startDate.value && selectedDate < endDate.value;
};

    // begining od date range
    const isStartDate = (day: number, month: number) => {
  const year = month < startMonthIndex.value ? endYear.value : startYear.value;
  return (
    startDate.value &&
    startDate.value.getDate() === day &&
    startDate.value.getMonth() === month &&
    startDate.value.getFullYear() === year
  );
};

// palce where i set end date
const isEndDate = (day: number, month: number) => {
  const year = month < startMonthIndex.value ? endYear.value : startYear.value;
  return (
    endDate.value &&
    endDate.value.getDate() === day &&
    endDate.value.getMonth() === month &&
    endDate.value.getFullYear() === year
  );
};
    const isSelected = (day: number, month: number) => {
  const year = month < startMonthIndex.value ? endYear.value : startYear.value;
  const date = new Date(year, month, day);
  return (
    startDate.value &&
    endDate.value &&
    date >= startDate.value &&
    date <= endDate.value
  );
};

    const formatDate = (date: Date) => {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };

    const appliedHasBookedDaysInRange = computed(() => {
      if (!appliedDateRange.value) {
        return false;
      }
      const [start, end] = appliedDateRange.value
        .split(" - ")
        .map((date: string) => new Date(date));
      return bookedDates.value.some(
        (bookedDate: Date) => bookedDate >= start && bookedDate <= end
      );
    });

    const appliedBookedDaysCount = computed(() => {
      if (!appliedDateRange.value) {
        return 0;
      }
      const [start, end] = appliedDateRange.value
        .split(" - ")
        .map((date: string) => new Date(date));
      return bookedDates.value.filter(
        (bookedDate: Date) => bookedDate >= start && bookedDate <= end
      ).length;
    });

    const formatRange = (start: Date | null, end: Date | null) => {
      const startString = start
        ? `${start.getMonth() + 1}/${start.getDate()}/${start.getFullYear()}`
        : "--/--/----";
      const endString = end
        ? `${end.getMonth() + 1}/${end.getDate()}/${end.getFullYear()}`
        : "--/--/----";
      return `${startString} - ${endString}`;
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        datePicker.value && dateInput.value && !datePicker.value.contains(target) && !dateInput.value.contains(target)
      ) {
        showDatePicker.value = false;
      }
    };

    const isApplyDisabled = computed(() => {
  return !startDate.value && !endDate.value;
});

const handleQuickSelect = (event) => {
  const selectedValue = event.target.value;
  const today = new Date();
  let start, end;

  switch (selectedValue) {
    case 'today':
      start = new Date(today);
      end = new Date(today);
      break;
    case 'last7days':
      end = new Date(today);
      start = new Date(today);
      start.setDate(start.getDate() - 6);
      break;
    case 'last30days':
      end = new Date(today);
      start = new Date(today);
      start.setDate(start.getDate() - 29);
      break;
    case 'last90days':
      end = new Date(today);
      start = new Date(today);
      start.setDate(start.getDate() - 89);
      break;
    case 'custom':
      // Do nothing here, as we want to keep the manually selected dates
      return;
    default:
      return;
  }

  startDate.value = start;
  endDate.value = end;
  updateDateRange();
  checkIfCustomDateRange();
};

// Add these watchers
watch(startDate, () => {
  checkIfCustomDateRange();
});

watch(endDate, () => {
  checkIfCustomDateRange();
});

const checkIfCustomDateRange = () => {
  if (startDate.value && endDate.value) {
    const today = new Date();
    const diffDays = Math.round((endDate.value - startDate.value) / (1000 * 60 * 60 * 24));

    if (diffDays === 0 && startDate.value.toDateString() === today.toDateString()) {
      selectedQuickOption.value = 'today';
    } else if (diffDays === 6 && endDate.value.toDateString() === today.toDateString()) {
      selectedQuickOption.value = 'last7days';
    } else if (diffDays === 29 && endDate.value.toDateString() === today.toDateString()) {
      selectedQuickOption.value = 'last30days';
    } else if (diffDays === 89 && endDate.value.toDateString() === today.toDateString()) {
      selectedQuickOption.value = 'last90days';
    } else {
      selectedQuickOption.value = 'custom';
    }
  }
};

    return {
      showDatePicker,
      toggleDatePickerVisibility,
      dateRange,
      appliedDateRange,
      today,
      startMonthIndex,
      endMonthIndex,
      startYear,
      endYear,
      dayNames,
      startMonth,
      endMonth,
      daysInMonth,
      isBooked,
      selectDate,
      clearDates,
      prevMonth,
      nextMonth,
      selectToday,
      applyDateRange,
      isSelected,
      isHighlighted,
      isStartDate,
      isEndDate,
      tooltipVisible,
      showTooltip,
      hideTooltip,
      appliedHasBookedDaysInRange,
      appliedBookedDaysCount,
      handleDateInput,
      toggleDatePicker,
      bookedDaysCount,
      formatDate,
      formatRange,
      updateDateRange,
      handleClickOutside,
      datePicker,
      dateInput,
      bookedDates,
      getDefaultDatesFromUrl,
      loadWebVariants,
      getChangeDescription,
      getItemFromUrl,
      handleStartDateInput,
      handleEndDateInput,
      startDateInput,
      endDateInput,
      dateInputs,
      isApplyDisabled,
      checkDateInputs,
      handleQuickSelect,
      selectedQuickOption
    };
  },
};
</script>

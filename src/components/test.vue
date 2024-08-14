<template>
  <div>
    <button @click="toggleDatePickerVisibility" class="new_calendar_toggle_button" ref="dateInput">
      <svg style="margin-right: 10px" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
        fill="none">
        <path
          d="M7.25 17.5534V17.4688M12.3125 17.5534V17.4688M12.3125 12.9688V12.8842M16.8125 12.9688V12.8842M3.875 8.46875H19.625M5.91071 2V3.68771M17.375 2V3.6875M17.375 3.6875H6.125C4.26104 3.6875 2.75 5.19854 2.75 7.0625V18.3126C2.75 20.1766 4.26104 21.6876 6.125 21.6876H17.375C19.239 21.6876 20.75 20.1766 20.75 18.3126L20.75 7.0625C20.75 5.19854 19.239 3.6875 17.375 3.6875Z"
          stroke="#4D5861" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      {{ appliedDateRange }}
      <!-- <span class="calendar_toggle_btn" v-if="appliedHasBookedDaysInRange">
        &lt;/&gt; {{ appliedBookedDaysCount }}</span> -->
    </button>

    <div class="new_calendar_wrapper">
      <div class="new_calendar_date_range_picker" v-show="showDatePicker" ref="datePicker">
        <div class="new_calendar_header">
          <div class="new_calendar_input_wrapper">
            <!-- input fields to type date manually -->
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
  <button class="new_calendar_date_picker_arrows">
    <svg @click="prevMonth" class="new_calendar_arrow" xmlns="http://www.w3.org/2000/svg" width="20"
      height="20" viewBox="0 0 20 20" fill="none">
      <path d="M12.5 15L7.5 10L12.5 5" stroke="#34404B" stroke-width="1.5" stroke-linecap="square"
        stroke-linejoin="round" />
    </svg>
    <svg @click="nextMonth" class="new_calendar_arrow" xmlns="http://www.w3.org/2000/svg" width="20"
      height="20" viewBox="0 0 20 20" fill="none">
      <path d="M7.5 15L12.5 10L7.5 5" stroke="#34404B" stroke-width="1.5" stroke-linecap="square"
        stroke-linejoin="round" />
    </svg>
  </button>
   <!--  <select @change="handleQuickSelect" v-model="selectedQuickOption" id="new_calendar_quick_select">
    <option value="">Quick Select</option>
    <option value="today">Today</option>
    <option value="last7days">Last 7 days</option>
    <option value="last30days">Last 30 days</option>
    <option value="last90days">Last 90 days</option>
    <option value="custom" disabled>Custom</option>
  </select> -->

  <div class="custom-dropdown" @click="toggleDropdown">
    <div class="selected-option">
      {{ selectedOptionText }}
    </div>
    <div class="dropdown-options" v-if="isDropdownOpen">
      <div 
        v-for="option in options" 
        :key="option.value" 
        :class="{ 'dropdown-option': true, 'disabled': option.disabled }"
        @click="selectOption(option)"
      >
        {{ option.text }}
      </div>
    </div>
  </div>
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
            <div class="new_calendar" ref="endCalendar">
              <div class="new_calendar_month">
                <span>{{ endMonth }} {{ endYear }}</span>
              </div>
              <div class="new_calendar_days_of_week">
                <div v-for="(dayName, index) in dayNames" :key="index" class="new_calendar_day_of_week">
                  {{ dayName }}
                </div>
              </div>
              <div class="new_calendar_days">
                <div class="new_calendar_day" v-for="(day, index) in daysInMonth(endYear, endMonthIndex)" :key="index"
                  :class="{
                    selected: isSelected(Number(day), endMonthIndex),
                    highlighted: isHighlighted(Number(day), endMonthIndex),
                    'start-date': isStartDate(Number(day), endMonthIndex),
                    'end-date': isEndDate(Number(day), endMonthIndex),
                    booked: isBooked(Number(day), endMonthIndex),
                  }" @click="selectDate(Number(day), endMonthIndex)">
                  {{ day }}
                  <div v-if="isBooked(Number(day), endMonthIndex)" class="new_calendar_tooltip"  v-show="tooltipVisible[index]">
                  <h6 class="new_calendar_tooltip_header">
                    Major Code Changes
                  </h6>
                  <p class="new_calendar_tooltip_list">{{ getChangeDescription(Number(day), endMonthIndex) }}</p>
                </div>
                </div>
              </div>
            </div>
          </div>
         <!--  <p class="new_calendar_total_code_change_text">
            {{ bookedDates.length }} Total Code Changes (to date)
          </p> -->
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
// import { ref, computed, onBeforeUnmount, onMounted, Ref, defineEmits, reactive } from "vue";
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

  // toggling date button (visible / hidden)
    const toggleDatePickerVisibility = () => {
      showDatePicker.value = !showDatePicker.value;
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
      
    };
  },
};
</script>

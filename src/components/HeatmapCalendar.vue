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
  <div class="new_calendar_custom-dropdown" ref="dropdownRef">
    <button @click.stop="toggleDropdown" class="new_calendar_dropdown-toggle">
      <span style="font-size: 12px; font-weight: 500;">{{ displayQuickOption }}</span>

      <svg class="new_calendar_dropdown-icon" xmlns="http://www.w3.org/2000/svg" :class="{ 'open': isDropdownOpen }" width="20" height="20" viewBox="0 0 20 20" fill="none">
<path d="M5 7.5L10 12.5L15 7.5" stroke="#34404B" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="round"/>
</svg>
    </button>
    <ul v-if="isDropdownOpen" class="new_calendar_dropdown-menu">
      <li @click="selectOption('today', $event)">Today</li>
      <li @click="selectOption('last7days', $event)">Last 7 days</li>
      <li @click="selectOption('last30days', $event)">Last 30 days</li>
      <li @click="selectOption('last90days', $event)">Last 90 days</li>
    </ul>
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
import { ref, computed, onBeforeUnmount, onMounted, onUnmounted, Ref, defineEmits, reactive, watch } from "vue";


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
    type QuickOptionKey = 'today' | 'last7days' | 'last30days' | 'last90days' | 'custom';
    // const selectedQuickOption = ref('');
    const selectedQuickOption = ref<QuickOptionKey | ''>('');
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

const displayQuickOption = computed(() => {
  const options: Record<QuickOptionKey, string> = {
    'today': 'Today',
    'last7days': '7 days',
    'last30days': '30 days',
    'last90days': '90 days',
    'custom': 'Custom'
  };
  return selectedQuickOption.value ? options[selectedQuickOption.value] : 'Quick Select';
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
 /*    const getDefaultDatesFromUrl = () => {
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
} */
const getDefaultDatesFromUrl = () => {
  var url = window.location.href;
  var urlObj = new URL(url);
  var fragment = urlObj.hash.substring(1);
  var fragmentParams = new URLSearchParams(fragment);
  var periodParam = fragmentParams.get('period');

  // Check local storage first
  const storedStartDate = localStorage.getItem('selectedStartDate');
  const storedEndDate = localStorage.getItem('selectedEndDate');
  if (storedStartDate && storedEndDate) {
    return { 
      startDate: new Date(storedStartDate), 
      endDate: new Date(storedEndDate) 
    };
  }

  if (periodParam === 'day') {
    var today = new Date();
    return { startDate: today, endDate: today };
  } 
  else if (periodParam === 'week') {
    var today = new Date();
    var date30DaysAgo = new Date();
    date30DaysAgo.setDate(today.getDate() - 30);  // Changed from 7 to 30
    return { startDate: date30DaysAgo, endDate: today };
  } 
  else if (periodParam === 'range') {
    var dateRange = fragmentParams.get('date')?.split(',');
    var startDate = dateRange ? new Date(dateRange[0]) : null;
    var endDate = dateRange ? new Date(dateRange[1]) : null;
    return { startDate: startDate, endDate: endDate };
  } 
  else if (periodParam === 'month') {
    var today = new Date();
    var date30DaysAgo = new Date();
    date30DaysAgo.setDate(today.getDate() - 30);
    return { startDate: date30DaysAgo, endDate: today };
  }
  
  // Default to 30 days if no valid period is found
  var today = new Date();
  var date30DaysAgo = new Date();
  date30DaysAgo.setDate(today.getDate() - 29);
  return { startDate: date30DaysAgo, endDate: today };
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
    // Save to local storage
    localStorage.setItem('selectedStartDate', startDate.value.toISOString());
    localStorage.setItem('selectedEndDate', endDate.value.toISOString());
  } else if (startDate.value) {
    period = "day";
    date = startDate.value.toLocaleDateString();
    // Save to local storage
    localStorage.setItem('selectedStartDate', startDate.value.toISOString());
    localStorage.setItem('selectedEndDate', startDate.value.toISOString());
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

const handleQuickSelect = (event:any) => {
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
    // const diffDays = Math.round((endDate.value - startDate.value) / (1000 * 60 * 60 * 24));
    const diffDays = Math.round(((endDate.value as Date).getTime() - (startDate.value as Date).getTime()) / (1000 * 60 * 60 * 24));

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

const isDropdownOpen = ref(false);
    // const dropdownRef = ref(null);
    const dropdownRef: Ref<HTMLElement | null> = ref(null);



    const toggleDropdown = (event: Event) => {
  event.stopPropagation();
  isDropdownOpen.value = !isDropdownOpen.value;
};

    const selectOption = (option: QuickOptionKey, event?: Event) => {
      if (event) {
    event.stopPropagation();
  }
      selectedQuickOption.value = option;
      handleQuickSelect({ target: { value: option } });
      isDropdownOpen.value = false;
    };

    const closeDropdownOnClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && event.target instanceof Node) {
    if (!dropdownRef.value.contains(event.target)) {
      isDropdownOpen.value = false;
    }
  }
};

    onMounted(() => {
      document.addEventListener('click', closeDropdownOnClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('click', closeDropdownOnClickOutside);
    });

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
      selectedQuickOption,
      isDropdownOpen,
      toggleDropdown,
      selectOption,
      dropdownRef,
      displayQuickOption
    };
  },
};
</script>

<style scoped>
.new_calendar_wrapper {
  position: relative;
}

.new_calendar_date_range_picker {
  position: absolute;
  top: 9px;
  flex-direction: column;
  align-items: center;
  width: 480px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  background-color: #fff;
}

.new_calendar_toggle_button {
  display: flex;
  align-items: center;
  border-radius: 10px;
  border: 1px solid var(--Grey-200, #e6e7e8);
  /* padding: 10px; */
  padding: 12.5px 10px;
  background: var(--Grey-White, #fff);
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09);
  color: var(--Grey-800, #34404b);
  font-size: 13px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: -0.05px;
  cursor: pointer;
}

.calendar_toggle_btn {
  display: unset !important;
  border-radius: 4px;
  background: #449ff4;
  padding: 2px 7px;
  font-size: 12px;
  color: #fff;
  font-weight: 700;
  margin-left: 10px;
}

.new_calendar_date_picker_arrows {
  display: flex;
  align-items: center;
}

.new_calendar_arrow {
  margin-bottom: 0px;
  margin-left: 4px;
  margin-right: 4px;
  border-radius: 4px;
  border: 1px solid var(--Grey-200, #e6e7e8);
  background: var(--Grey-White, #fff);
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09);
}

.new_calendar_input_wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* width: 50%; */
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;

  input[type="date"]::-webkit-calendar-picker-indicator {
    display: none;
  }
}

#new_calendar_left_input{
  width: 82px;
}

#new_calendar_right_input{
  margin-left: 7px;
}

.new_calendar_header {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
}

.new_calendar_date_input {
  padding: 6px;
  border: none !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  border-bottom: none !important;
  height: auto !important;
  margin-bottom: 0px !important;
}



.new_calendar_date_input:focus {
  outline: none;
}

.new_calendar_header button {
  background: none;
  border: none;
  cursor: pointer;
  /* margin-left: 5px; */
  font-size: 1.5em;
}

.new_calendar_datepicker_container {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.new_calendar_wrapper {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.new_calendar {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

#new_calendar_code_counter {
  border-radius: 4px;
  background: #449ff4;
  padding: 5px 7px;
  font-size: 12px;
  color: #fff;
  font-weight: 700;
  display: none;
}

#new_calendar_arrows_wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 60%;
  margin-left: 15px;
}

#new_calendar_select_today {
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
  border: 1px solid var(--Grey-200, #e6e7e8);
  background: var(--Grey-White, #fff);
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09);
  padding: 8px;
}

.new_calendar_month {
  text-align: center;
  margin-bottom: 10px;
}

.new_calendar_days_of_week {
  margin-bottom: 10px;
}

.new_calendar_days,
.new_calendar_days_of_week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
}

.new_calendar_day {
  text-align: center;
  padding: 5px;
  cursor: pointer;
  position: relative;
}

.new_calendar_day:hover {
  background: #03c191;
  transition: 0.1s ease-in-out;
  border-radius: 4px;
}

.new_calendar_day.selected {
  background: #03c191;
}

.new_calendar_day.highlighted {
  background-color: #d7ffed;
}

.new_calendar_day.start-date {
  border-radius: 12px 0px 0px 12px;
  background: #03c191;
}

.new_calendar_day.end-date {
  border-radius: 0px 12px 12px 0px;
  background: #03c191;
}

.new_calendar_day.booked {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    flex-shrink: 0;
    color: inherit;
    position: relative;
}

.new_calendar_day.booked:hover {
  border-radius: 0px;
}

.new_calendar_tooltip {
  width: 200px;
  position: absolute;
  top: 100%;
  /* left: 350%; */
  left: 330%;
  transform: translateX(-50%);
  background: #fff;
  color: #000;
  padding: 10px 10px 0px 10px;
  /* padding-bottom: 0px; */
  z-index: 999;
  display: none;
  text-align: start;

  border-radius: 10px;
  border: 1px solid var(--Grey-200, #e6e7e8);
  background: var(--Grey-White, #fff);
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09);
}

.new_calendar_day.booked:hover .new_calendar_tooltip {
  display: block;
}

.new_calendar_tooltip_header {
  color: var(--Grey-800, #34404b);
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  padding: 0px;
  margin: 0px;
}

.new_calendar_tooltip_list {
  list-style-type: none;
  margin: 10px 0px 10px 0px;
  color: var(--Grey-800, #34404b);
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 12px;

  /* new style */
  white-space: pre-wrap;
    word-wrap: break-word;
    line-height: 180%;
        padding-bottom: 0px;
}

.new_calendar_total_code_change_text {
  width: 100%;
  text-align: end;
  color: #225caf;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: 12px;
  margin-top: 20px;
}

.new_calendar_apply_button_wrapper {
  display: flex;
  justify-content: end;
  border-top: 2px solid #e6e7e8;
  padding-top: 10px;
}

.new_calendar_apply_button {
  border: none;
  border-radius: var(--Padding-Corner, 6px);
  font-size: 15px;
  color: #fff;
  font-style: normal;
  font-weight: 600;
  background: var(--Primary-03-Main, #00936f);
  display: flex;
  padding: var(--Padding-Horizontal-padding, 10px) var(--Padding-Vertical-padding, 16px);
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}

.new_calendar_apply_button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/*@@@@@@@@@@@@@@@@ quick days selection style @@@@@@@@@@@@@@@@*/
#new_calendar_quick_select {
  margin-left: 10px;
  padding: 5px;
  border: 1px solid #f5e9e9;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
}

.new_calendar_custom-dropdown {
  position: relative;
  display: inline-block;
  border: 1px solid #E6E7E8;
  background: #FFF;
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09);;
  font-size: 10px;
  border-radius: 4px;
}

.new_calendar_dropdown-toggle {
  padding: 5px 10px;
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 100px;
  border-right: 3px solid green;
  font-size: 10px;
}

.new_calendar_dropdown-menu {
  position: absolute;
  top: 100%;
  left: 70px;
  z-index: 1000;
  display: block;
  min-width: 200px;
  padding: 5px 0;
  margin: 2px 0 0;
  font-size: 14px;
  text-align: left;
  list-style: none;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0,0,0,.15);
  border-radius: 10px;
  box-shadow: 0 6px 12px rgba(0,0,0,.175);
  padding: 5px 0px;
}

.new_calendar_dropdown-menu li {
  padding: 5px 10px;
  margin-bottom: 5px;
  cursor: pointer;
  font-size: 12px;
}

.new_calendar_dropdown-menu li:hover {
  background-color: #f5f5f5;
}

.new_calendar_dropdown-menu li.disabled {
  color: #6c757d;
  pointer-events: none;
  cursor: not-allowed;
}

.new_calendar_dropdown-icon{
border-left: 1px solid #E6E7E8;
/* border-right: 1px solid #E6E7E8; */
margin-left: 15px;
padding: 1px 0px 1px 5px;
}

</style>
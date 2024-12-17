<template>
  <div>
    <button class="new_heatmap_calendar_date-trigger" @click="toggleCalendar">
      <svg style="margin-right: 10px" xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24" fill="none">
        <path d="M7.25 17.5534V17.4688M12.3125 17.5534V17.4688M12.3125 12.9688V12.8842M16.8125 12.9688V12.8842M3.875 8.46875H19.625M5.91071 2V3.68771M17.375 2V3.6875M17.375 3.6875H6.125C4.26104 3.6875 2.75 5.19854 2.75 7.0625V18.3126C2.75 20.1766 4.26104 21.6876 6.125 21.6876H17.375C19.239 21.6876 20.75 20.1766 20.75 18.3126L20.75 7.0625C20.75 5.19854 19.239 3.6875 17.375 3.6875Z" stroke="#4D5861" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      {{ appliedDateRange }}
      <span v-if="hasBookedDaysInRange" class="new_heatmap_calendar_booked-count">
         {{ bookedDaysCount }}
      </span>
      <span class="new_heatmap_calendar_dropdown-arrow" 
      :class="{ 'flipped': isCalendarVisible }" 
      style="margin-left: 10px;">
      <img style="width: 16px;" src="https://i.ibb.co/bRszW9x/Drop.png" alt="">
      </span>
    </button>

    <div v-if="isCalendarVisible" class="new_heatmap_calendar_container">
      <div class="new_heatmap_calendar_header">
        <button class="new_heatmap_calendar_nav-button" @click="previousMonth">
          <span><img style="width: 24px;" src="https://i.ibb.co/9pxmXKv/Arrow-Right-1.png" alt=""></span>
        </button>
        <h2>{{ format(currentMonth, 'MMMM yyyy') }}</h2>
        <button class="new_heatmap_calendar_nav-button" @click="nextMonth">
          <span><img style="width: 24px;" src="https://i.ibb.co/4RZXQrt/Arrow-Right.png" alt=""></span>
        </button>
      </div>

      <div class="new_heatmap_calendar_date-range">
        <div class="new_heatmap_calendar_date-input">
          <input 
            class="new_heatmap_calendar_input"
            type="text" 
            v-model="startDateInput"
            @input="handleStartDateInput"
            placeholder="MMM D, YYYY"
          />
          <span>-</span>
          <input 
            class="new_heatmap_calendar_input"
            type="text" 
            v-model="endDateInput"
            @input="handleEndDateInput"
            placeholder="MMM D, YYYY"
          />
        </div>
      </div>

      <div class="new_heatmap_calendar_quick-select">
        <button 
            class="new_heatmap_calendar_quick-select-button" 
            @click="toggleDropdown">
            {{ selectedRange }}
            <span class="new_heatmap_calendar_dropdown-arrow"
                  :class="{ 'flipped': showDropdown }">
              <img style="width: 16px;" src="https://i.ibb.co/bRszW9x/Drop.png" alt="">
            </span>
          </button>
          <div v-if="showDropdown" class="new_heatmap_calendar_dropdown-menu" @click.stop>
            <div @click="selectRange('Today')">Today</div>
            <div @click="selectRange('Yesterday')">Yesterday</div>
            <div @click="selectRange('Last 7 Days')">Last 7 Days</div>
            <div @click="selectRange('Last 30 Days')">Last 30 Days</div>
            <div @click="selectRange('Last 90 Days')">Last 90 Days</div>
            <div @click="selectRange('Last 365 Days')">Last 365 Days</div>
            <div @click="selectRange('Last Week')">Last Week</div>
            <div @click="selectRange('Last Month')">Last Month</div>
            <div @click="selectRange('Last Year')">Last Year</div>
          </div>
      </div>

      <div class="new_heatmap_calendar_grid">
        <div v-for="weekDay in weekDays" :key="weekDay" class="new_heatmap_calendar_weekday">
          {{ weekDay }}
        </div>

        <div 
          v-for="day in calendarDays" 
          :key="day.date as any" 
          class="new_heatmap_calendar_day"
          :class="{
            'new_heatmap_calendar_selected': isSelected(day.date),
            'new_heatmap_calendar_both-dates-selected': startDate && endDate && isSelected(day.date),
            'new_heatmap_calendar_in-range': isInRange(day.date),
            'new_heatmap_calendar_today': isToday(day.date),
            'new_heatmap_calendar_disabled': !isSameMonth(day.date, currentMonth),
            'new_heatmap_calendar_booked': isBooked(day.date),
            'new_heatmap_calendar_range-start': isRangeStart(day.date),
            'new_heatmap_calendar_range-end': isRangeEnd(day.date)
          }"
          @click="selectDate(day.date)"
          @mouseenter="showTooltip(day.date)"
          @mouseleave="hideTooltip"
        >
          <span v-if="isRangeStart(day.date) || isRangeEnd(day.date)" class="new_heatmap_calendar_base-background"></span>
          <span v-if="isRangeStart(day.date) || isRangeEnd(day.date)" class="new_heatmap_calendar_overlay-background"></span>
          {{ format(day.date, 'd') }}
          <div v-if="isBooked(day.date) && activeTooltip === format(day.date, 'yyyy-MM-dd')" 
               class="new_heatmap_calendar_day-tooltip">
            {{ getBookedDescription(day.date) }}
          </div>
        </div>
      </div>

      <div class="new_heatmap_calendar_action-buttons">
        <button class="new_heatmap_calendar_cancel-button" @click="cancel" style="margin-right: 25px;">Cancel</button>
        <button style="display: flex;" class="new_heatmap_calendar_apply-button" @click="applyAndClose">
          <span>Apply</span>
          <img class=".new_heatmap_calendar_apply-button-img" src="https://i.ibb.co/TL3Cd6G/system-solid-31-check-hover-check-1.png" alt="">
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { format, 
  parse, 
  isValid, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek,
  startOfYear,
  endOfYear,
  isSameMonth, 
  isToday, 
  addMonths, 
  subMonths,
  subYears,
  subDays, 
  isBefore, 
  isAfter, 
  isSameDay, 
  differenceInDays
 } from 'date-fns'

const props = defineProps({
  systemOfRecords: {
    type: Boolean,
    default: false
  },
  webVariantsData: {
    type: Object,
    default: () => ({})
  }
})
const emit = defineEmits(['on-filter-date-change'])

// State
const currentMonth = ref(new Date())
const startDate = ref<any>(null)
const endDate = ref<any>(null)
/* const dateRange = ref<any>('')
const dateInputs = {
  start: '',
  end: ''
} */
const showDropdown = ref<any>(false)
const selectedRange = ref<any>('Last 30 Days')
const isCalendarVisible = ref<any>(false)
const startDateInput = ref<any>('')
const endDateInput = ref<any>('')
const activeTooltip = ref<any>(null)
const appliedDateRange = ref<any>('')
const webVariantsData = ref<any>({})
/* const variants = ref({})
const activeVariantTooltip = ref(null)
const variantDescriptions = ref({}) */
const bookedDates = ref<any>([])
const changeDescriptionsRef = ref<any>({})
const currentUrl = ref<any>(window.location.href);

// Computed
const weekDays = computed(() => {
  return ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
})

const calendarDays = computed(() => {
  const start = startOfWeek(startOfMonth(currentMonth.value))
  const end = endOfWeek(endOfMonth(currentMonth.value))
  
  return eachDayOfInterval({ start, end }).map(date => ({
    date,
    isCurrentMonth: isSameMonth(date, currentMonth.value)
  }))
})

const hasBookedDaysInRange = computed(() => {
  if (!startDate.value || !endDate.value) return false
  return Object.keys(webVariantsData.value).some(date => {
    const currentDate = new Date(date)
    return currentDate >= startDate.value && currentDate <= endDate.value
  })
})

const bookedDaysCount = computed(() => {
  if (!startDate.value || !endDate.value) return 0
  return Object.keys(webVariantsData.value).filter(date => {
    const currentDate = new Date(date)
    return currentDate >= startDate.value && currentDate <= endDate.value
  }).length
})

// Methods
const toggleCalendar = () => {
  isCalendarVisible.value = !isCalendarVisible.value
}

const previousMonth = () => {
  currentMonth.value = subMonths(currentMonth.value, 1)
}

const nextMonth = () => {
  currentMonth.value = addMonths(currentMonth.value, 1)
}

const handleStartDateInput = () => {
  try {
    const parsedDate = parse(startDateInput.value, 'MMM d, yyyy', new Date())
    if(isValid(parsedDate)) {
      startDate.value = parsedDate
      checkCustomRange()
    }
  } catch(e) {
    console.log('Invalid date format')
  }
}

const handleEndDateInput = () => {
  try {
    const parsedDate = parse(endDateInput.value, 'MMM d, yyyy', new Date())
    if(isValid(parsedDate)) {
      endDate.value = parsedDate 
      checkCustomRange()
    }
  } catch(e) {
    console.log('Invalid date format')
  }
}

const selectDate = (date:any) => {
  if (!startDate.value || (startDate.value && endDate.value)) {
    startDate.value = date;
    endDate.value = null;
    startDateInput.value = format(date, 'MMM d, yyyy');
    endDateInput.value = '';
    selectedRange.value = 'Custom';
  } else {
    if (isBefore(date, startDate.value)) {
      endDate.value = startDate.value;
      startDate.value = date;
      startDateInput.value = format(date, 'MMM d, yyyy');
      endDateInput.value = format(endDate.value, 'MMM d, yyyy');
    } else {
      endDate.value = date;
      endDateInput.value = format(date, 'MMM d, yyyy');
    }
    checkCustomRange();
  }
}

const isSelected = (date:any) => {
  return (
    (startDate.value && isSameDay(date, startDate.value)) ||
    (endDate.value && isSameDay(date, endDate.value))
  )
}

const isInRange = (date:any) => {
  if (!startDate.value || !endDate.value) return false
  return (
    isAfter(date, startDate.value) &&
    isBefore(date, endDate.value)
  )
}

const isRangeStart = (date:any) => {
  return startDate.value && isSameDay(date, startDate.value)
}

const isRangeEnd = (date:any) => {
  return endDate.value && isSameDay(date, endDate.value)
}

const isBooked = (date:any) => {
  const dateString = format(date, 'yyyy-MM-dd')
  return !!props.webVariantsData[dateString]
}

const showTooltip = (date:any) => {
  if(isBooked(date)) {
    activeTooltip.value = format(date, 'yyyy-MM-dd')
  }
}

const hideTooltip = () => {
  activeTooltip.value = null
}

const getBookedDescription = (date:any) => {
  const dateString = format(date, 'yyyy-MM-dd')
  return props.webVariantsData[dateString]?.[0]?.changeDescription || ''
}

const checkCustomRange = () => {
  if(!startDate.value || !endDate.value) return
  
  const diffDays = differenceInDays(endDate.value, startDate.value)
  const today = new Date()
  
  if(isSameDay(startDate.value, endDate.value)) {
    if(isSameDay(startDate.value, today)) {
      selectedRange.value = 'Today'
    } else if(isSameDay(startDate.value, subDays(today, 1))) {
      selectedRange.value = 'Yesterday'
    } else {
      selectedRange.value = 'Custom'
    }
  } else if(isSameDay(endDate.value, today)) {
    if(diffDays === 6) {
      selectedRange.value = 'Last 7 Days'
    } else if(diffDays === 29) {
      selectedRange.value = 'Last 30 Days'
    } else if(diffDays === 89) {
      selectedRange.value = 'Last 90 Days'
    } else if(diffDays === 364) {
      selectedRange.value = 'Last 365 Days'
    } else {
      selectedRange.value = 'Custom'
    }
  } else {
    // Check for Last Week
    const lastWeekEnd = startOfWeek(subDays(today, 7), { weekStartsOn: 1 })
    const lastWeekStart = startOfWeek(lastWeekEnd, { weekStartsOn: 1 })
    if(isSameDay(startDate.value, lastWeekStart) && isSameDay(endDate.value, endOfWeek(lastWeekEnd, { weekStartsOn: 1 }))) {
      selectedRange.value = 'Last Week'
    } 
    // Check for Last Month
    else {
      const lastMonth = subMonths(today, 1)
      if(isSameDay(startDate.value, startOfMonth(lastMonth)) && isSameDay(endDate.value, endOfMonth(lastMonth))) {
        selectedRange.value = 'Last Month'
      }
      // Check for Last Year
      else {
        const lastYear = subYears(today, 1)
        if(isSameDay(startDate.value, startOfYear(lastYear)) && isSameDay(endDate.value, endOfYear(lastYear))) {
          selectedRange.value = 'Last Year'
        } else {
          selectedRange.value = 'Custom'
        }
      }
    }
  }
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const selectRange = (range:any) => {
  selectedRange.value = range
  const today = new Date()
  
  switch (range) {
    case 'Today':
      startDate.value = today
      endDate.value = today
      break
    case 'Yesterday':
      const yesterday = subDays(today, 1)
      startDate.value = yesterday
      endDate.value = yesterday
      break
    case 'Last 7 Days':
      endDate.value = today
      startDate.value = subDays(today, 6)
      break
    case 'Last Week':
      // Get last week's Monday to Sunday
      const lastWeekEnd = startOfWeek(subDays(today, 7), { weekStartsOn: 1 })
      startDate.value = startOfWeek(lastWeekEnd, { weekStartsOn: 1 })
      endDate.value = endOfWeek(lastWeekEnd, { weekStartsOn: 1 })
      break
    case 'Last 30 Days':
      endDate.value = today
      startDate.value = subDays(today, 29)
      break
    case 'Last Month':
      // Get the first and last day of previous month
      const lastMonth = subMonths(today, 1)
      startDate.value = startOfMonth(lastMonth)
      endDate.value = endOfMonth(lastMonth)
      break
    case 'Last 90 Days':
      endDate.value = today
      startDate.value = subDays(today, 89)
      break
    case 'Last 365 Days':
      endDate.value = today
      startDate.value = subDays(today, 364)
      break
    case 'Last Year':
      // Get the first and last day of previous year
      const lastYear = subYears(today, 1)
      startDate.value = startOfYear(lastYear)
      endDate.value = endOfYear(lastYear)
      break
    case 'Custom':
      startDate.value = null
      endDate.value = null
      break
  }
  
  if (startDate.value) {
    startDateInput.value = format(startDate.value, 'MMM d, yyyy')
  }
  if (endDate.value) {
    endDateInput.value = format(endDate.value, 'MMM d, yyyy')
  }
  showDropdown.value = false
}

const constructUrl = (period:any) => {
  const url = new URL(window.location.href)
  const fragment = url.hash.substring(1)
  const fragmentParams = new URLSearchParams(fragment)

  if (fragment.startsWith('/')) {
    fragmentParams.delete('')
  }

  fragmentParams.set('period', period)
  fragmentParams.set('date', period === "range"
    ? `${startDate.value.toISOString().split("T")[0]},${endDate.value.toISOString().split("T")[0]}`
    : startDate.value.toISOString().split("T")[0])

  url.hash = `?${fragmentParams.toString().replace(/%2C/g, ',')}`
  return url.toString()
}

const getItemFromUrl = (item:any) => {
  const parsedUrl = new URL(currentUrl.value);
  const searchParams = new URLSearchParams(parsedUrl.search);
  const hashParams = new URLSearchParams(parsedUrl.hash.slice(1));
  return searchParams.get(item) || hashParams.get(item);
};

async function loadWebVariants() {
  if (!props.systemOfRecords) {
    bookedDates.value = []
    changeDescriptionsRef.value = {}
    webVariantsData.value = {}
    return
  }

  const url = `/index.php?module=API&format=json&method=HeatmapSessionRecording.loadWebVariants&idSite=${getItemFromUrl('idSite')}&idSiteHsr=${getItemFromUrl('subcategory')}`
  
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
    const data = await response.json()

    if (data.status === "success" && Array.isArray(data.result)) {
      const dataByDate : any = {}
      
      data.result.forEach((item:any) => {
        const date = item.raw_date
        if (!dataByDate[date]) {
          dataByDate[date] = []
        }
        dataByDate[date].push(item)
      })

      webVariantsData.value = dataByDate
      bookedDates.value = Object.keys(dataByDate).map(date => new Date(date))
      changeDescriptionsRef.value = Object.entries(dataByDate).reduce((acc, [date, items]) => {
        (acc as any)[date] = (items as any)[0].changeDescription
        return acc
      }, {})
    }
  } catch (error) {
    console.error('Error loading web variants:', error)
    webVariantsData.value = {}
    bookedDates.value = []
    changeDescriptionsRef.value = {}
  }
}

/* const getBookedDaysDescriptions = computed(() => {
  if (!startDate.value || !endDate.value) return []
  return Object.entries(webVariantsData.value)
    .filter(([date]) => {
      const currentDate = new Date(date)
      return currentDate >= startDate.value && currentDate <= endDate.value
    })
    .flatMap(([date, items]) => {
      const description = items[0]?.changeDescription || 'No description available'
      return {
        date: new Date(date),
        description
      }
    })
}) */

const applyDateRange = () => {
  let period = endDate.value ? "range" : "day"
  let downloadedUrls = {}

  // Determine what text to display based on selectedRange
  if (selectedRange.value === 'Custom') {
    // For custom dates, show the date range
    appliedDateRange.value = `${format(startDate.value, 'M/d/yyyy')} - ${format(endDate.value, 'M/d/yyyy')}`
  } else {
    // For preset ranges, show the selected range name
    appliedDateRange.value = selectedRange.value
  }

  if (startDate.value && endDate.value) {
    localStorage.setItem('selectedStartDate', startDate.value.toISOString())
    localStorage.setItem('selectedEndDate', endDate.value.toISOString())
    // Also store the selectedRange text
    localStorage.setItem('selectedRangeText', selectedRange.value)

    Object.entries(webVariantsData.value).forEach(([date, data]) => {
      const currentDate = new Date(date)
      if (currentDate >= startDate.value && currentDate <= endDate.value) {
        (data as any).forEach((item:any) => {
          const deviceType = item.s3_path_url.includes('desktop') ? 'desktop' :
                           item.s3_path_url.includes('mobile') ? 'mobile' :
                           item.s3_path_url.includes('tablet') ? 'tablet' : 'other'
          
          if (!(downloadedUrls as any)[deviceType]) {
            (downloadedUrls as any)[deviceType] = []
          }
          (downloadedUrls as any)[deviceType].push(item)
        })
      }
    })
  }
  
  const data = {
    period,
    date: period === "range" 
      ? `${startDate.value.toISOString().split("T")[0]},${endDate.value.toISOString().split("T")[0]}`
      : startDate.value.toISOString().split("T")[0],
    url: constructUrl(period)
  }

  if (Object.keys(downloadedUrls).length > 0) {
    (data as any).downloadedUrls = downloadedUrls
  }

  const plainData = JSON.parse(JSON.stringify(data));
  console.log("Emitted data:", plainData);
  emit("on-filter-date-change", data);
}


const applyAndClose = () => {
  applyDateRange()
  isCalendarVisible.value = false
}

const cancel = () => {
  startDate.value = null
  endDate.value = null
  startDateInput.value = ''
  endDateInput.value = ''
  isCalendarVisible.value = false
}

const handleClickOutside = (e:any) => {
  const calendar = document.querySelector('.new_heatmap_calendar_container')
  const trigger = document.querySelector('.new_heatmap_calendar_date-trigger')
  const dropdown = document.querySelector('.new_heatmap_calendar_dropdown-menu')
  
  if (calendar && 
      !calendar.contains(e.target) && 
      !(trigger as any).contains(e.target) && 
      (!dropdown || !dropdown.contains(e.target))) {
    isCalendarVisible.value = false
  }
}

const getDefaultDatesFromUrl = () => {
  var url = window.location.href;
  var urlObj = new URL(url);
  var fragment = urlObj.hash.substring(1);
  var fragmentParams = new URLSearchParams(fragment);
  var periodParam = fragmentParams.get('period');

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
    date30DaysAgo.setDate(today.getDate() - 6);
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
    date30DaysAgo.setDate(today.getDate() - 29);
    return { startDate: date30DaysAgo, endDate: today };
  }

  // Default to 30 days if no valid period is found
  var today = new Date();
  var date30DaysAgo = new Date();
  date30DaysAgo.setDate(today.getDate() - 29);
  return { startDate: date30DaysAgo, endDate: today };
}

onMounted(async () => {
  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDatesFromUrl();

  // Ensure the dates are not null
  const start = defaultStartDate || new Date();
  const end = defaultEndDate || new Date();

  // Set the component's date values
  startDate.value = start;
  endDate.value = end;
  checkCustomRange();
  
  // Set input field values
  startDateInput.value = format(start, 'MMM d, yyyy');
  endDateInput.value = format(end, 'MMM d, yyyy');

  // Get the stored range text or calculate it
  const storedRangeText = localStorage.getItem('selectedRangeText');
  if (storedRangeText && selectedRange.value !== 'Custom') {
    appliedDateRange.value = storedRangeText;
  } else if (selectedRange.value === 'Custom') {
    appliedDateRange.value = `${format(start, 'M/d/yyyy')} - ${format(end, 'M/d/yyyy')}`;
  } else {
    appliedDateRange.value = selectedRange.value;
  }

  // Add event listener for clicks outside calendar
  document.addEventListener('click', handleClickOutside);

  // Load web variants data
  await loadWebVariants();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.new_heatmap_calendar_date-trigger {
  display: flex;
  align-items: center;
  border-radius: 10px;
  border: 1px solid var(--Grey-200, #e6e7e8);
  padding: 12px 10px;
  background: var(--Grey-White, #fff);
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09);
  color: var(--Grey-800, #34404b);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.new_heatmap_calendar_booked-count {
  border-radius: 4px;
  background: #449ff4;
  padding: 2px 7px;
  font-size: 12px;
  color: #fff;
  font-weight: 700;
  margin-left: 10px;
}

.new_heatmap_calendar_container {
  position: absolute;
  width: 270px;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 1000;
}

.new_heatmap_calendar_header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.new_heatmap_calendar_header h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.new_heatmap_calendar_nav-button {
  border: none;
  background: none;
  cursor: pointer;
  padding: 8px;
}

.new_heatmap_calendar_date-range {
  margin-bottom: 16px;
}

.new_heatmap_calendar_date-input {
  display: flex;
  gap: 8px;
  align-items: center;
}

.new_heatmap_calendar_input {
  padding: 12px;
  border: 1px solid #E6E7E8;
  border-radius: 8px;
  font-size: 14px;
  width: 99px;
  color: #7F7F7F;
}
.new_heatmap_calendar_input::placeholder {
  font-size: 14px;
  text-transform: lowercase;
  color: #7F7F7F;
}

.new_heatmap_calendar_quick-select {
  position: relative;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.new_heatmap_calendar_quick-select-button {
  width: 100%;
  padding: 12px;
  border: 1px solid #E6E7E8;
  border-radius: 8px;
  background: #FBFBFB;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  cursor: pointer;
}

.new_heatmap_calendar_dropdown-menu {
  background: white;
  border: 1px solid #E6E7E8;
  border-radius: 8px;
  z-index: 10;
  width: 100%;
}

.new_heatmap_calendar_dropdown-menu div {
  padding: 12px;
  cursor: pointer;
  font-size: 14px;
}

.new_heatmap_calendar_dropdown-menu div:hover {
  background: #f5f5f5;
}

.new_heatmap_calendar_grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  padding-bottom: 5px;
  border-bottom: 1px solid #DDDDDD;
}

.new_heatmap_calendar_weekday {
  text-align: center;
  font-size: 14px;
  color: #666;
  padding: 8px;
}

.new_heatmap_calendar_day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  cursor: pointer;
  position: relative;
  z-index: 2;
}

.new_heatmap_calendar_base-background {
  position: absolute;
  width: 32px;
  height: 32px;
  background: #DAFBED;
  border-radius: 8px;
  z-index: -2;
}

.new_heatmap_calendar_overlay-background {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #2EC666;
  border-radius: 50%;
  z-index: -1;
}

.new_heatmap_calendar_day.new_heatmap_calendar_selected {
  color: white;
  z-index: 2;
}

.new_heatmap_calendar_day.new_heatmap_calendar_both-dates-selected {
  background: #DAFBED;
}

.new_heatmap_calendar_day.new_heatmap_calendar_in-range {
  background: #DAFBED;
  border-radius: 0;
  position: relative;
  z-index: 2;
}

.new_heatmap_calendar_day.new_heatmap_calendar_in-range::before {
  content: '';
  position: absolute;
  top: 0;
  left: -4px;
  right: -4px;
  bottom: 0;
  background: #DAFBED;
  z-index: -1;
}

.new_heatmap_calendar_day.new_heatmap_calendar_range-end::before {
  background: transparent;
}

.new_heatmap_calendar_day.new_heatmap_calendar_range-start::before {
  background: transparent;
}

.new_heatmap_calendar_day.new_heatmap_calendar_range-start {
  border-radius: 20px 0px 0px 20px;
}

.new_heatmap_calendar_day.new_heatmap_calendar_range-end {
  border-radius: 0px 20px 20px 0px;
}

.new_heatmap_calendar_day.new_heatmap_calendar_today {
  font-weight: bold;
}

.new_heatmap_calendar_day.new_heatmap_calendar_disabled {
  color: #ccc;
  cursor: default;
}

.new_heatmap_calendar_day.new_heatmap_calendar_booked {
  background: #F6F6F6;
  color: white;
  border-radius: 50%;
}

.new_heatmap_calendar_day-tooltip {
  position: absolute;
  top: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 1px solid #E6E7E8;
  border-radius: 4px;
  padding: 8px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.new_heatmap_calendar_action-buttons {
  display: flex;
  justify-content:flex-end;
  margin-top: 18px;
}

.new_heatmap_calendar_cancel-button,
.new_heatmap_calendar_apply-button {
  padding: 10px 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.new_heatmap_calendar_cancel-button {
  background: transparent;
  border: none;
  color: #666;
}

.new_heatmap_calendar_apply-button {
  background: #2EC666;
  border: none;
  color: white;
  display: flex;
  align-items: center;
}
.new_heatmap_calendar_apply-button:hover {
  background: #27c160;
  border: none;
  color: white;
  display: flex;
  align-items: center;
}

.new_heatmap_calendar_apply-button img {
  margin-left: 8px;
  width: 20px; margin-left: 5px;
}

.new_heatmap_calendar_apply-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* flip */
.new_heatmap_calendar_dropdown-arrow {
  transition: transform 0.2s ease;
  display: inline-block;
}

.new_heatmap_calendar_dropdown-arrow.flipped {
  transform: rotate(180deg);
}
</style>
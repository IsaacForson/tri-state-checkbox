<template>
  <div>
    <button class="date-trigger" @click="toggleCalendar">
      <svg style="margin-right: 10px" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M7.25 17.5534V17.4688M12.3125 17.5534V17.4688M12.3125 12.9688V12.8842M16.8125 12.9688V12.8842M3.875 8.46875H19.625M5.91071 2V3.68771M17.375 2V3.6875M17.375 3.6875H6.125C4.26104 3.6875 2.75 5.19854 2.75 7.0625V18.3126C2.75 20.1766 4.26104 21.6876 6.125 21.6876H17.375C19.239 21.6876 20.75 20.1766 20.75 18.3126L20.75 7.0625C20.75 5.19854 19.239 3.6875 17.375 3.6875Z" stroke="#4D5861" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      {{ appliedDateRange }}
      <span v-if="hasBookedDaysInRange" class="booked-count">
         {{ bookedDaysCount }}
      </span>
    </button>

    <div v-if="isCalendarVisible" class="calendar-container">
      <!-- Header -->
      <div class="calendar-header">
        <button class="nav-button" @click="previousMonth">
          <span><img style="width: 24px;" src="https://i.ibb.co/9pxmXKv/Arrow-Right-1.png" alt=""></span>
        </button>
        <h2>{{ format(currentMonth, 'MMMM yyyy') }}</h2>
        <button class="nav-button" @click="nextMonth">
          <span><img style="width: 24px;" src="https://i.ibb.co/4RZXQrt/Arrow-Right.png" alt=""></span>
        </button>
      </div>

      <!-- Date Range Display -->
      <div class="date-range">
        <div class="date-input">
          <input 
          class="new_calendar_input"
            type="text" 
            v-model="startDateInput"
            @input="handleStartDateInput"
            placeholder="MMM D, YYYY"
          />
          <span>-</span>
          <input 
          class="new_calendar_input"
            type="text" 
            v-model="endDateInput"
            @input="handleEndDateInput"
            placeholder="MMM D, YYYY"
          />
        </div>
      </div>

      <!-- Quick Select -->
      <div class="quick-select">
        <button 
          class="quick-select-button" 
          @click="toggleDropdown"
        >
          {{ selectedRange }}
          <span class="dropdown-arrow">
            <img style="width: 16px;" src="https://i.ibb.co/bRszW9x/Drop.png" alt="">
          </span>
        </button>
        <div v-if="showDropdown" class="dropdown-menu" @click.stop>
          <div @click="selectRange('Last 7 Days')">Last 7 Days</div>
          <div @click="selectRange('Last 30 Days')">Last 30 Days</div>
          <div @click="selectRange('Last 90 Days')">Last 90 Days</div>
          <div @click="selectRange('Custom')">Custom</div>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="calendar-grid">
        <div v-for="weekDay in weekDays" :key="weekDay" class="weekday">
          {{ weekDay }}
        </div>

        <div
          v-for="day in calendarDays"
          :key="day.date"
          class="day"
          :class="{
            'selected': isSelected(day.date),
            'in-range': isInRange(day.date),
            'today': isToday(day.date),
            'disabled': !isSameMonth(day.date, currentMonth),
            'booked': isBooked(day.date),
            'range-start': isRangeStart(day.date),
            'range-end': isRangeEnd(day.date)
          }"
          @click="selectDate(day.date)"
          @mouseenter="showTooltip(day.date)"
          @mouseleave="hideTooltip"
        >
          {{ format(day.date, 'd') }}
          <div v-if="isBooked(day.date) && activeTooltip === format(day.date, 'yyyy-MM-dd')" 
               class="day-tooltip">
            {{ getBookedDescription(day.date) }}
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button class="cancel-button" @click="cancel">Cancel</button>
        <button style="display: flex;" class="apply-button" @click="applyAndClose">
          <span>Apply</span>
          <img style="width: 20px; margin-left: 5px;" src="https://i.ibb.co/TL3Cd6G/system-solid-31-check-hover-check-1.png" alt="">
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { 
  format,
  parse,
  isValid,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
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
const startDate = ref(null)
const endDate = ref(null)
const showDropdown = ref(false)
const selectedRange = ref('Last 7 Days')
const isCalendarVisible = ref(false)
const startDateInput = ref('')
const endDateInput = ref('')
const activeTooltip = ref(null)
const appliedDateRange = ref('')
const webVariantsData = ref({})
const variants = ref({})
const activeVariantTooltip = ref(null)
const variantDescriptions = ref({})
const bookedDates = ref([])
const changeDescriptionsRef = ref({})

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

const selectDate = (date) => {
  if (!startDate.value || (startDate.value && endDate.value)) {
    startDate.value = date
    endDate.value = null
    startDateInput.value = format(date, 'MMM d, yyyy')
  } else {
    if (isBefore(date, startDate.value)) {
      endDate.value = startDate.value
      startDate.value = date
    } else {
      endDate.value = date
    }
    endDateInput.value = format(endDate.value, 'MMM d, yyyy')
    checkCustomRange()
  }
}

const isSelected = (date) => {
  return (
    (startDate.value && isSameDay(date, startDate.value)) ||
    (endDate.value && isSameDay(date, endDate.value))
  )
}

const isInRange = (date) => {
  if (!startDate.value || !endDate.value) return false
  return (
    isAfter(date, startDate.value) &&
    isBefore(date, endDate.value)
  )
}

const isRangeStart = (date) => {
  return startDate.value && isSameDay(date, startDate.value)
}

const isRangeEnd = (date) => {
  return endDate.value && isSameDay(date, endDate.value)
}

const isBooked = (date) => {
  const dateString = format(date, 'yyyy-MM-dd')
  return !!props.webVariantsData[dateString]
}

const showTooltip = (date) => {
  if(isBooked(date)) {
    activeTooltip.value = format(date, 'yyyy-MM-dd')
  }
}

const hideTooltip = () => {
  activeTooltip.value = null
}

const getBookedDescription = (date) => {
  const dateString = format(date, 'yyyy-MM-dd')
  return props.webVariantsData[dateString]?.[0]?.changeDescription || ''
}

const checkCustomRange = () => {
  if(!startDate.value || !endDate.value) return
  
  const diffDays = differenceInDays(endDate.value, startDate.value)
  const today = new Date()
  
  if(isSameDay(endDate.value, today)) {
    if(diffDays === 6) {
      selectedRange.value = 'Last 7 Days'
    } else if(diffDays === 29) {
      selectedRange.value = 'Last 30 Days' 
    } else if(diffDays === 89) {
      selectedRange.value = 'Last 90 Days'
    } else {
      selectedRange.value = 'Custom'
    }
  } else {
    selectedRange.value = 'Custom'
  }
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const selectRange = (range) => {
  selectedRange.value = range
  const today = new Date()
  
  switch (range) {
    case 'Last 7 Days':
      endDate.value = today
      startDate.value = subDays(today, 6)
      break
    case 'Last 30 Days':
      endDate.value = today
      startDate.value = subDays(today, 29)
      break
    case 'Last 90 Days':
      endDate.value = today
      startDate.value = subDays(today, 89)
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

const constructUrl = (period) => {
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

// Add this new method for loading variants
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
      const dataByDate = {}
      
      data.result.forEach(item => {
        const date = item.raw_date
        if (!dataByDate[date]) {
          dataByDate[date] = []
        }
        dataByDate[date].push(item)
      })

      webVariantsData.value = dataByDate
      bookedDates.value = Object.keys(dataByDate).map(date => new Date(date))
      changeDescriptionsRef.value = Object.entries(dataByDate).reduce((acc, [date, items]) => {
        acc[date] = items[0].changeDescription
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

// Add these new computed properties
const getBookedDaysDescriptions = computed(() => {
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
})

const applyDateRange = () => {
  let period = endDate.value ? "range" : "day"
  let date = ""
  let downloadedUrls = {}

  if (startDate.value && endDate.value) {
    date = `${format(startDate.value, 'M/d/yyyy')} - ${format(endDate.value, 'M/d/yyyy')}`
    localStorage.setItem('selectedStartDate', startDate.value.toISOString())
    localStorage.setItem('selectedEndDate', endDate.value.toISOString())

    Object.entries(webVariantsData.value).forEach(([date, data]) => {
      const currentDate = new Date(date)
      if (currentDate >= startDate.value && currentDate <= endDate.value) {
        data.forEach((item) => {
          const deviceType = item.s3_path_url.includes('desktop') ? 'desktop' :
                           item.s3_path_url.includes('mobile') ? 'mobile' :
                           item.s3_path_url.includes('tablet') ? 'tablet' : 'other'
          
          if (!downloadedUrls[deviceType]) {
            downloadedUrls[deviceType] = []
          }
          downloadedUrls[deviceType].push(item)
        })
      }
    })
  }

  appliedDateRange.value = date
  
  const data = {
    period,
    date: period === "range" 
      ? `${startDate.value.toISOString().split("T")[0]},${endDate.value.toISOString().split("T")[0]}`
      : startDate.value.toISOString().split("T")[0],
    url: constructUrl(period)
  }

  if (Object.keys(downloadedUrls).length > 0) {
    data.downloadedUrls = downloadedUrls
  }

  console.log("About to emit:", data);
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

const handleClickOutside = (e) => {
  const calendar = document.querySelector('.calendar-container')
  const trigger = document.querySelector('.date-trigger')
  const dropdown = document.querySelector('.dropdown-menu')
  
  // Don't close if clicking inside calendar, trigger, or dropdown
  if (calendar && 
      !calendar.contains(e.target) && 
      !trigger.contains(e.target) && 
      (!dropdown || !dropdown.contains(e.target))) {
    isCalendarVisible.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
  await loadWebVariants()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

</script>

<style scoped>
.date-trigger {
  display: flex;
  align-items: center;
  border-radius: 10px;
  border: 1px solid var(--Grey-200, #e6e7e8);
  padding: 12.5px 10px;
  background: var(--Grey-White, #fff);
  box-shadow: 0px 1px 2px 0px rgba(26, 40, 53, 0.09);
  color: var(--Grey-800, #34404b);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.booked-count {
  border-radius: 4px;
  background: #449ff4;
  padding: 2px 7px;
  font-size: 12px;
  color: #fff;
  font-weight: 700;
  margin-left: 10px;
}

.calendar-container {
  position: absolute;
  width: 311px;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 1000;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.calendar-header h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.nav-button {
  border: none;
  background: none;
  cursor: pointer;
  padding: 8px;
}

.date-range {
  margin-bottom: 16px;
}

.date-input {
  display: flex;
  gap: 8px;
  align-items: center;
}

.date-input .new_calendar_input {
  padding: 12px;
  border: 1px solid #E6E7E8;
  border-radius: 8px;
  font-size: 15px;
  width: 120px;
  color: #7F7F7F;
}

.quick-select {
  position: relative;
  margin-bottom: 24px;
}

.quick-select-button {
  width: 100%;
  padding: 12px;
  border: 1px solid #E6E7E8;
  border-radius: 8px;
  background: white;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #E6E7E8;
  border-radius: 8px;
  margin-top: 4px;
  z-index: 10;
}

.dropdown-menu div {
  padding: 12px;
  cursor: pointer;
  font-size: 14px;
}

.dropdown-menu div:hover {
  background: #f5f5f5;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.weekday {
  text-align: center;
  font-size: 14px;
  color: #666;
  padding: 8px;
}

.day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  position: relative;
  z-index: 2;
}

.day.selected {
  background: #2EC666;
  color: white;
  z-index: 2;
}

.day.in-range {
  background: #DAFBED;
  border-radius: 0;
  position: relative;
  z-index: 2;
}

.day.in-range::before {
  content: '';
  position: absolute;
  top: 0;
  left: -4px;
  right: -4px;
  bottom: 0;
  background: #DAFBED;
  z-index: -1;
}

.day.range-start {
  border-radius: 50%;
}

.day.range-end {
  border-radius: 50%;
}

.day.today {
  font-weight: bold;
}

.day.disabled {
  color: #ccc;
  cursor: default;
}

.day.booked {
  background: #F6F6F6;
  color: white;
  border-radius: 50%;
}

.day-tooltip {
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

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}

.cancel-button, .apply-button {
  padding: 12px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.cancel-button {
  background: white;
  border: 1px solid #E6E7E8;
  color: #666;
}

.apply-button {
  background: #2EC666;
  border: none;
  color: white;
  display: flex;
  align-items: center;
}

.apply-button img {
  margin-left: 8px;
}

.apply-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
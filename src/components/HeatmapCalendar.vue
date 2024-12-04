<template>
  <div class="calendar-container">
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
          type="text" 
          :value="startDate ? format(startDate, 'MMM d, yyyy') : ''" 
          readonly
        />
        <span>-</span>
        <input 
          type="text" 
          :value="endDate ? format(endDate, 'MMM d, yyyy') : ''" 
          readonly
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
        <span class="dropdown-arrow"> <img style="width: 16px;" src="https://i.ibb.co/bRszW9x/Drop.png" alt=""> </span>
      </button>
      <div v-if="showDropdown" class="dropdown-menu">
        <div @click="selectRange('Last 7 Days')">Last 7 Days</div>
        <div @click="selectRange('Last 30 Days')">Last 30 Days</div>
        <div @click="selectRange('Last 90 Days')">Last 90 Days</div>
        <div @click="selectRange('Custom')">Custom</div>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <!-- Weekday headers -->
      <div v-for="weekDay in weekDays" :key="weekDay" class="weekday">
        {{ weekDay }}
      </div>

      <!-- Calendar days -->
      <div
        v-for="day in calendarDays"
        :key="day.date"
        class="day"
        :class="{
          'selected': isSelected(day.date),
          'in-range': isInRange(day.date),
          'today': isToday(day.date),
          'disabled': !isSameMonth(day.date, currentMonth)
        }"
        @click="selectDate(day.date)"
      >
        {{ format(day.date, 'd') }}
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button class="cancel-button" @click="cancel">Cancel</button>
      <button style="display: flex;" class="apply-button" @click="apply"> <span>Apply</span>  <img style="width: 20px; margin-left: 5px;"src="https://i.ibb.co/TL3Cd6G/system-solid-31-check-hover-check-1.png" alt=""></button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  format,
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
  isSameDay
} from 'date-fns'

// State
const currentMonth = ref(new Date())
const startDate = ref(null)
const endDate = ref(null)
const showDropdown = ref(false)
const selectedRange = ref('Last 7 Days')

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

// Methods
const previousMonth = () => {
  currentMonth.value = subMonths(currentMonth.value, 1)
}

const nextMonth = () => {
  currentMonth.value = addMonths(currentMonth.value, 1)
}

const selectDate = (date) => {
  if (!startDate.value || (startDate.value && endDate.value)) {
    startDate.value = date
    endDate.value = null
  } else {
    if (isBefore(date, startDate.value)) {
      endDate.value = startDate.value
      startDate.value = date
    } else {
      endDate.value = date
    }
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
  showDropdown.value = false
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const apply = () => {
  // Emit selected date range
  emit('update:dateRange', { start: startDate.value, end: endDate.value })
}

const cancel = () => {
  startDate.value = null
  endDate.value = null
}
</script>

<style scoped>
.calendar-container {
  width: 311px;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.calendar-header h2 {
  font-size: 24px;
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

.date-input input {
  padding: 12px;
  border: 1px solid #E6E7E8;
  border-radius: 8px;
  font-size: 16px;
  width: 120px;
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
}

.dropdown-menu div:hover {
  background: #f5f5f5;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
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
  border-radius: 50%;
  cursor: pointer;
}

.day.selected {
  background: #2EC666;
  color: white;
}

.day.in-range {
  background: rgba(64, 184, 123, 0.1);
}

.day.today {
  font-weight: bold;
}

.day.disabled {
  color: #ccc;
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
}
</style>
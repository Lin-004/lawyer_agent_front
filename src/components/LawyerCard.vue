<template>
  <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col sm:flex-row items-start gap-6">
    <div class="relative">
      <img 
        :src="lawyer.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + lawyer.name" 
        class="w-24 h-24 rounded-xl object-cover bg-gray-100"
      >
      <div class="absolute -bottom-2 -right-2 bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full border border-white shadow-sm">
        <i class="fa-solid fa-star text-yellow-500 mr-1"></i>{{ lawyer.score || 4.9 }}
      </div>
    </div>
    <div class="flex-1 w-full">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-xl font-bold text-gray-900 flex items-center">
            {{ lawyer.name }}
            <i 
              v-if="lawyer.status === 'approved'"
              class="fa-solid fa-circle-check text-blue-500 ml-2 text-sm" 
              title="平台认证"
            ></i>
          </h3>
          <p class="text-sm text-gray-500 mt-1">
            {{ lawyer.lawFirm || '律师事务所' }} | 执业{{ lawyer.years || 0 }}年
          </p>
        </div>
        <div class="text-right hidden sm:block">
          <div class="text-xl font-bold text-brand-600">
            ¥{{ lawyer.price || 300 }}<span class="text-sm text-gray-400 font-normal">/次</span>
          </div>
          <div class="text-xs text-gray-400">已服务 {{ lawyer.serviceCount || 0 }} 人</div>
        </div>
      </div>
      
      <div class="flex flex-wrap gap-2 my-3">
        <span 
          v-for="(spec, index) in displaySpecialties" 
          :key="index"
          class="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md"
        >
          {{ spec }}
        </span>
      </div>
      
      <p class="text-sm text-gray-600 line-clamp-2 mb-4">
        {{ lawyer.description || '专业律师，经验丰富，服务周到。' }}
      </p>

      <div class="flex gap-3 sm:hidden items-center justify-between border-t pt-3 mt-3">
        <div class="text-lg font-bold text-brand-600">
          ¥{{ lawyer.price || 300 }}<span class="text-sm text-gray-400 font-normal">/次</span>
        </div>
        <button 
          @click="$emit('consult', lawyer)"
          class="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700"
        >
          立即咨询
        </button>
      </div>

      <div class="hidden sm:flex gap-3">
        <button 
          @click="$emit('consult', lawyer)"
          class="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-lg transition shadow-sm font-medium"
        >
          立即咨询
        </button>
        <button 
          @click="handleAppointment"
          class="flex-1 bg-white border border-gray-200 hover:border-brand-500 hover:text-brand-600 text-gray-700 py-2 rounded-lg transition font-medium"
        >
          预约咨询
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  lawyer: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['consult', 'appointment'])

const displaySpecialties = computed(() => {
  if (Array.isArray(props.lawyer.specialty)) {
    return props.lawyer.specialty
  }
  if (typeof props.lawyer.specialty === 'string') {
    try {
      return JSON.parse(props.lawyer.specialty)
    } catch {
      return props.lawyer.specialty.split(',').filter(Boolean)
    }
  }
  return []
})

const handleAppointment = () => {
  emit('appointment', props.lawyer)
}
</script>


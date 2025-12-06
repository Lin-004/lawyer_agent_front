<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    <!-- 菜单备用显示 -->
    <div class="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center cursor-pointer" @click="$router.push('/')">
            <i class="fa-solid fa-scale-balanced text-brand-700 text-2xl mr-2"></i>
            <span class="font-bold text-xl text-slate-900 tracking-tight">法信 LawChat</span>
          </div>
          <div class="hidden md:flex space-x-8">
            <button 
              @click="$router.push({name: 'Home'})" 
              class="text-gray-600 hover:text-brand-700 px-1 py-4 transition-colors"
            >
              首页
            </button>
            <button 
              @click="$router.push({name: 'Lawyers'})" 
              class="text-brand-700 border-b-2 border-brand-700 px-1 py-4 transition-colors"
            >
              找律师
            </button>
            <button 
              @click="$router.push({name: 'Knowledge'})" 
              class="text-gray-600 hover:text-brand-700 px-1 py-4 transition-colors"
            >
              法律文库
            </button>
            <button 
              @click="$router.push({name: 'Profile'})" 
              class="text-gray-600 hover:text-brand-700 px-1 py-4 transition-colors"
            >
              个人中心
            </button>
          </div>
          <div class="hidden md:flex items-center space-x-4">
            <button class="text-gray-500 hover:text-brand-600">
              <i class="fa-regular fa-bell text-lg"></i>
            </button>
            <div 
              v-if="isLoggedIn"
              class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded-full pr-3 transition"
              @click="$router.push({name: 'Profile'})"
            >
              <img 
                :src="userAvatar" 
                class="h-8 w-8 rounded-full border border-gray-200" 
                alt="User Avatar"
              >
              <span class="text-sm font-medium text-gray-700">{{ userName }}</span>
            </div>
            <button 
              v-else
              class="px-4 py-2 bg-brand-600 text-white text-sm rounded-full hover:bg-brand-700 transition"
              @click="$router.push({name: 'Auth'})"
            >
              登录 / 注册
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="pt-8">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="flex flex-col md:flex-row gap-8">
          <!-- Sidebar Filters -->
          <div class="w-full md:w-64 flex-shrink-0 space-y-6">
            <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 class="font-bold text-gray-800 mb-4">筛选条件</h3>
              
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-600 mb-2">擅长领域</label>
                <div class="space-y-2">
                  <label 
                    v-for="specialty in specialties" 
                    :key="specialty"
                    class="flex items-center"
                  >
                    <input 
                      type="checkbox" 
                      :value="specialty"
                      v-model="filters.specialty"
                      class="rounded text-brand-600 border-gray-300 mr-2"
                    >
                    {{ specialty }}
                  </label>
                </div>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-600 mb-2">执业地区</label>
                <select 
                  v-model="filters.province" 
                  class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="">不限</option>
                  <option v-for="prov in provinces" :key="prov" :value="prov">
                    {{ prov }}
                  </option>
                </select>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-600 mb-2">执业年限</label>
                <select 
                  v-model="filters.years" 
                  class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="">不限</option>
                  <option value="1-3">1-3年</option>
                  <option value="3-5">3-5年</option>
                  <option value="5-10">5-10年</option>
                  <option value="10+">10年以上</option>
                </select>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-600 mb-2">服务价格</label>
                <input 
                  type="range" 
                  min="100" 
                  max="2000" 
                  v-model.number="filters.maxPrice"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                >
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>¥100</span>
                  <span>¥{{ filters.maxPrice || 2000 }}+</span>
                </div>
              </div>

              <button 
                @click="applyFilters"
                class="w-full bg-brand-600 text-white py-2 rounded-lg hover:bg-brand-700 transition"
              >
                应用筛选
              </button>
            </div>
          </div>

          <!-- Lawyer List -->
          <div class="flex-1">
            <div class="mb-4 flex justify-between items-center">
              <span class="text-gray-500">找到 {{ totalLabel }} 位相关律师</span>
              <div class="flex space-x-2 text-sm">
                <button 
                  v-for="sort in sortOptions"
                  :key="sort.value"
                  @click="currentSort = sort.value; loadLawyers()"
                  :class="[
                    'px-3 py-1 rounded-full font-medium transition',
                    currentSort === sort.value 
                      ? 'bg-brand-50 text-brand-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  ]"
                >
                  {{ sort.label }}
                </button>
              </div>
            </div>

            <div v-if="loading" class="text-center py-12">
              <i class="fa-solid fa-spinner fa-spin text-3xl text-gray-400"></i>
              <p class="text-gray-500 mt-4">加载中...</p>
            </div>

            <div v-else-if="displayedLawyers.length === 0" class="text-center py-12">
              <p class="text-gray-500">暂无符合条件的律师</p>
            </div>

            <div v-else class="space-y-4">
              <LawyerCard 
                v-for="lawyer in displayedLawyers" 
                :key="lawyer.id"
                :lawyer="lawyer"
                @consult="handleConsult"
                @appointment="handleAppointment"
              />
            </div>
            
            <div v-if="displayedLawyers.length > 0" class="mt-8 text-center">
              <button 
                @click="loadMore"
                :disabled="loading || !hasMore"
                class="px-6 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
              >
                {{ hasMore ? '加载更多律师' : '没有更多了' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointment Modal -->
    <teleport to="body" v-if="appointmentModal.show">
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
          <!-- Modal Header -->
          <div class="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <h3 class="text-xl font-bold text-gray-900">预约面谈 - {{ appointmentModal.lawyer?.name }}</h3>
            <button @click="closeAppointmentModal" class="text-gray-400 hover:text-gray-600">
              <i class="fa-solid fa-times text-xl"></i>
            </button>
          </div>

          <!-- Modal Content -->
          <div class="p-6 space-y-6">
            <!-- Lawyer Info -->
            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <img 
                :src="appointmentModal.lawyer?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'" 
                class="w-16 h-16 rounded-lg object-cover"
              >
              <div>
                <p class="font-bold text-gray-900">{{ appointmentModal.lawyer?.name }}</p>
                <p class="text-sm text-gray-600">{{ appointmentModal.lawyer?.lawFirm }}</p>
                <p class="text-sm text-brand-600 font-medium mt-1">¥{{ appointmentModal.lawyer?.price || 300 }}/次</p>
              </div>
            </div>

            <!-- Schedule Selection -->
            <div>
              <h4 class="font-bold text-gray-900 mb-3">选择预约时间段</h4>
              <div v-if="appointmentModal.loading" class="text-center py-8 text-gray-400">
                <i class="fa-solid fa-spinner fa-spin mr-2"></i>加载可预约时间...
              </div>
              <div v-else-if="appointmentModal.schedules.length === 0" class="text-center py-8 text-gray-500">
                该律师暂无可预约时间段
              </div>
              <div v-else class="space-y-3 max-h-96 overflow-y-auto">
                <label 
                  v-for="schedule in appointmentModal.schedules" 
                  :key="schedule.id"
                  class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-brand-500 hover:bg-blue-50 cursor-pointer transition"
                  :class="{ 'border-brand-500 bg-blue-50': appointmentModal.selectedScheduleId === schedule.id }"
                >
                  <input 
                    type="radio"
                    :value="schedule.id"
                    v-model="appointmentModal.selectedScheduleId"
                    class="w-4 h-4 text-brand-600 cursor-pointer"
                  >
                  <div class="ml-4 flex-1">
                    <p class="font-medium text-gray-900">{{ schedule.date }}</p>
                    <p class="text-sm text-gray-600">
                      {{ formatSlotTime(schedule) }}
                      <span 
                        :class="getScheduleStatusClass(schedule.status)"
                        class="ml-2 px-2 py-0.5 rounded text-xs font-medium"
                      >
                        {{ getScheduleStatusText(schedule.status) }}
                      </span>
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Remarks -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">备注（可选）</label>
              <textarea 
                v-model="appointmentModal.remarks"
                placeholder="请输入您的需求或特殊说明..."
                rows="3"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              ></textarea>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 pt-4 border-t border-gray-100">
              <button 
                @click="closeAppointmentModal"
                class="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                取消
              </button>
              <button 
                @click="submitAppointment"
                :disabled="!appointmentModal.selectedScheduleId || appointmentModal.submitting"
                class="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {{ appointmentModal.submitting ? '提交中...' : '确认预约' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <Footer />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import LawyerCard from '@/components/LawyerCard.vue'
import { getLawyerList, getSpecialties } from '@/api/lawyer'
import { createAppointment, getLawyerSchedules } from '@/api/appointment'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const rawLawyers = ref([])
const specialties = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const currentSort = ref('')

const userName = computed(() => userStore.userInfo?.nickname || '游客')
const userAvatar = computed(() => 
  userStore.userInfo?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User123'
)
const isLoggedIn = computed(() => userStore.isLoggedIn)

const filters = ref({
  specialty: [],
  years: '',
  maxPrice: 2000,
  province: ''
})

// 省份数据
const provinces = ref([
  '北京市', '天津市', '河北省', '山西省', '内蒙古自治区',
  '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省',
  '浙江省', '安徽省', '福建省', '江西省', '山东省',
  '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区',
  '海南省', '重庆市', '四川省', '贵州省', '云南省',
  '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区',
  '新疆维吾尔自治区'
])

const appointmentModal = ref({
  show: false,
  lawyer: null,
  schedules: [],
  selectedScheduleId: null,
  remarks: '',
  loading: false,
  submitting: false
})

const sortOptions = [
  { label: '综合排序', value: '' },
  { label: '评分最高', value: 'score_desc' },
  { label: '评分最低', value: 'score_asc' }
]

const displayedLawyers = computed(() => {
  let list = [...rawLawyers.value]

  // 省份筛选
  if (filters.value.province) {
    list = list.filter((item) => item.province === filters.value.province)
  }

  if (filters.value.specialty.length) {
    list = list.filter((item) => {
      const specs = Array.isArray(item.specialty) ? item.specialty : []
      return filters.value.specialty.every((tag) => specs.includes(tag))
    })
  }

  if (filters.value.years) {
    list = list.filter((item) => {
      const years = Number(item.years) || 0
      switch (filters.value.years) {
        case '1-3':
          return years >= 1 && years <= 3
        case '3-5':
          return years >= 3 && years <= 5
        case '5-10':
          return years >= 5 && years <= 10
        case '10+':
          return years >= 10
        default:
          return true
      }
    })
  }

  if (filters.value.maxPrice) {
    list = list.filter((item) => {
      const price = Number(item.price) || 0
      return price <= filters.value.maxPrice
    })
  }

  if (currentSort.value === 'score_desc') {
    list.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
  } else if (currentSort.value === 'score_asc') {
    list.sort((a, b) => (Number(a.score) || 0) - (Number(b.score) || 0))
  }

  return list
})

const totalLabel = computed(() => (total.value || displayedLawyers.value.length))

const normalizeLawyers = (records = []) =>
  records.map((item) => ({
    ...item,
    specialty: (() => {
      if (Array.isArray(item.specialty)) return item.specialty
      if (typeof item.specialty === 'string') {
        try {
          const parsed = JSON.parse(item.specialty)
          return Array.isArray(parsed) ? parsed : item.specialty.split(',').filter(Boolean)
        } catch {
          return item.specialty.split(',').filter(Boolean)
        }
      }
      return []
    })()
  }))

const loadLawyers = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    if (currentSort.value) {
      params.sort = currentSort.value
    }

    const res = await getLawyerList(params)
    const pageData = res?.data ?? res ?? {}
    const records = normalizeLawyers(pageData.records || [])

    if (currentPage.value === 1) {
      rawLawyers.value = records
    } else {
      rawLawyers.value = rawLawyers.value.concat(records)
    }
    total.value = pageData.total ?? (pageData.records?.length ?? 0)
    const totalPages = (pageData.pages ?? Math.ceil((total.value || 0) / pageSize.value)) || 1
    hasMore.value = currentPage.value < totalPages
  } catch (error) {
    console.error('加载律师列表失败:', error)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (hasMore.value && !loading.value) {
    currentPage.value++
    loadLawyers()
  }
}

const applyFilters = () => {
  currentPage.value = 1
  rawLawyers.value = []
  loadLawyers()
}

const handleConsult = (lawyer) => {
  router.push({ name: 'Chat', query: { lawyerId: lawyer.id } })
}

const handleAppointment = async (lawyer) => {
  if (!isLoggedIn.value) {
    alert('请先登录')
    router.push({ name: 'Auth' })
    return
  }
  
  appointmentModal.value.lawyer = lawyer
  appointmentModal.value.schedules = []
  appointmentModal.value.selectedScheduleId = null
  appointmentModal.value.remarks = ''
  appointmentModal.value.show = true
  
  // 加载律师的可预约时间段
  appointmentModal.value.loading = true
  try {
    const res = await getLawyerSchedules(lawyer.id)
    if (res.success && Array.isArray(res.data)) {
      // 过滤可预约的时间段（status === 1）
      appointmentModal.value.schedules = res.data.filter(s => s.status === 1)
      if (appointmentModal.value.schedules.length === 0) {
        alert('该律师暂无可预约时间段')
      }
    }
  } catch (error) {
    console.error('加载律师可预约时间段失败', error)
    alert('加载时间段失败，请稍后重试')
  } finally {
    appointmentModal.value.loading = false
  }
}

const closeAppointmentModal = () => {
  appointmentModal.value.show = false
  appointmentModal.value.lawyer = null
  appointmentModal.value.schedules = []
  appointmentModal.value.selectedScheduleId = null
  appointmentModal.value.remarks = ''
}

const formatSlotTime = (slot) => {
  if (!slot) return '--'
  const formatTime = (timeObj) => {
    if (typeof timeObj === 'string') {
      return timeObj.substring(0, 5)
    }
    if (timeObj && typeof timeObj.hour !== 'undefined') {
      const pad = (n) => String(n ?? 0).padStart(2, '0')
      return `${pad(timeObj.hour)}:${pad(timeObj.minute)}`
    }
    return '--'
  }
  return `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`
}

const getScheduleStatusText = (status) => {
  const map = {
    1: '可预约',
    2: '已预约',
    3: '不可用'
  }
  return map[status] || '可预约'
}

const getScheduleStatusClass = (status) => {
  const map = {
    1: 'bg-green-50 text-green-700',
    2: 'bg-amber-50 text-amber-700',
    3: 'bg-gray-100 text-gray-600'
  }
  return map[status] || 'bg-green-50 text-green-700'
}

const submitAppointment = async () => {
  if (!appointmentModal.value.selectedScheduleId) {
    alert('请选择预约时间段')
    return
  }
  
  appointmentModal.value.submitting = true
  try {
    const res = await createAppointment({
      userId: userStore.userInfo?.id,
      lawyerId: appointmentModal.value.lawyer.id,
      scheduleId: appointmentModal.value.selectedScheduleId,
      status: 1,
      remarks: appointmentModal.value.remarks
    })
    
    if (res.success) {
      alert('预约请求已提交，请等待律师确认')
      closeAppointmentModal()
    } else {
      alert(res.message || '预约失败，请稍后重试')
    }
  } catch (error) {
    console.error('提交预约失败', error)
    alert('提交预约失败，请稍后重试')
  } finally {
    appointmentModal.value.submitting = false
  }
}

const loadSpecialties = async () => {
  try {
    const res = await getSpecialties()
    const list = res?.data ?? res
    if (Array.isArray(list)) {
      specialties.value = list
    } else {
      specialties.value = []
    }
  } catch (error) {
    console.error('加载专业领域失败:', error)
    specialties.value = []
  }
}

onMounted(() => {
  // 如果路由带有 `specialty` 查询参数，先把它放到筛选条件中
  const q = route.query.specialty
  if (q) {
    if (Array.isArray(q)) {
      filters.value.specialty = q.map((s) => String(s))
    } else if (typeof q === 'string') {
      filters.value.specialty = q.split(',').map((s) => s.trim()).filter(Boolean)
    }
  }

  loadSpecialties()
  // 以当前 filters 加载律师（已将 specialty 应用）
  currentPage.value = 1
  rawLawyers.value = []
  loadLawyers()
})
</script>

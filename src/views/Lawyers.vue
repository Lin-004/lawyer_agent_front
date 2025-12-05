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
                <label class="block text-sm font-medium text-gray-600 mb-2">执业年限</label>
                <select 
                  v-model="filters.years" 
                  class="w-full border-gray-200 rounded-lg text-sm focus:ring-brand-500 focus:border-brand-500"
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
  maxPrice: 2000
})

const sortOptions = [
  { label: '综合排序', value: '' },
  { label: '评分最高', value: 'score_desc' },
  { label: '评分最低', value: 'score_asc' }
]

const displayedLawyers = computed(() => {
  let list = [...rawLawyers.value]

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


<template>
  <div class="bg-gray-50 text-slate-800 font-sans h-screen overflow-hidden flex">
    <!-- Sidebar -->
    <aside
      class="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-full z-20 transition-transform duration-300 absolute md:relative -translate-x-full md:translate-x-0"
      :class="{ 'translate-x-0': sidebarOpen }"
      id="sidebar"
    >
      <div class="h-16 flex items-center px-6 border-b border-gray-100">
        <i class="fa-solid fa-scale-balanced text-brand-600 text-xl mr-2"></i>
        <span class="font-bold text-lg text-slate-900">法信 · 律师端</span>
      </div>

      <nav class="flex-1 py-4 overflow-y-auto">
        <ul class="space-y-1">
          <li>
            <button
              class="w-full text-left sidebar-link flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-colors"
              :class="{ 'bg-brand-50 text-brand-600 border-r-4 border-brand-600': activeView === 'dashboard' }"
              @click="switchView('dashboard')"
            >
              <i class="fa-solid fa-chart-line w-6"></i>
              <span class="font-medium">工作台</span>
            </button>
          </li>
          <li>
            <button
              class="w-full text-left sidebar-link flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-colors justify-between"
              :class="{ 'bg-brand-50 text-brand-600 border-r-4 border-brand-600': activeView === 'orders' }"
              @click="switchView('orders')"
            >
              <div class="flex items-center">
                <i class="fa-solid fa-file-contract w-6"></i>
                <span class="font-medium">案件订单</span>
              </div>
              <span
                v-if="metrics.pendingOrders > 0"
                class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"
              >
                {{ metrics.pendingOrders }}
              </span>
            </button>
          </li>
          <li>
            <button
              class="w-full text-left sidebar-link flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-colors"
              :class="{ 'bg-brand-50 text-brand-600 border-r-4 border-brand-600': activeView === 'chat' }"
              @click="switchView('chat')"
            >
              <i class="fa-solid fa-comments w-6"></i>
              <span class="font-medium">咨询会话</span>
            </button>
          </li>
          <li class="pt-4 pb-2 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">账号管理</li>
          <li>
            <div
              class="sidebar-link flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-colors"
            >
              <i class="fa-solid fa-id-card w-6"></i>
              <span class="font-medium">资质认证</span>
              <i class="fa-solid fa-circle-check text-green-500 ml-auto text-sm"></i>
            </div>
          </li>
          <li>
            <div
              class="sidebar-link flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-colors"
            >
              <i class="fa-solid fa-wallet w-6"></i>
              <span class="font-medium">我的收益</span>
            </div>
          </li>
        </ul>
      </nav>

      <div class="p-4 border-t border-gray-100 space-y-4">
        <div class="flex items-center">
          <img :src="lawyerAvatar" class="w-10 h-10 rounded-full bg-gray-100 border border-gray-200" />
          <div class="ml-3">
            <p class="text-sm font-bold text-gray-900">{{ lawyerName }}</p>
            <p class="text-xs text-green-600 flex items-center">
              <span class="w-2 h-2 bg-green-500 rounded-full mr-1"></span> 在线接单中
            </p>
          </div>
        </div>
        <button
          class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition"
          @click="handleLogout"
        >
          <i class="fa-solid fa-arrow-right-from-bracket w-4 mr-2"></i> 退出登录
        </button>
      </div>
    </aside>

    <!-- Mobile Overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-full overflow-hidden bg-gray-50 w-full">
      <!-- Header (Mobile Only) -->
      <header
        class="md:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between flex-shrink-0 z-10"
      >
        <div class="flex items-center">
          <button @click="sidebarOpen = !sidebarOpen" class="text-gray-600 focus:outline-none mr-4">
            <i class="fa-solid fa-bars text-xl"></i>
          </button>
          <span class="font-bold text-lg text-slate-900">{{ currentTitle }}</span>
        </div>
        <button class="relative text-gray-500">
          <i class="fa-solid fa-bell text-xl"></i>
          <span class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </header>

      <!-- Views -->
      <div class="flex-1 overflow-y-auto p-4 md:p-8 hide-scrollbar">
        <!-- Dashboard -->
        <section v-show="activeView === 'dashboard'" class="max-w-6xl mx-auto fade-in">
          <div class="flex justify-between items-end mb-6">
            <div>
              <h1 class="text-2xl font-bold text-slate-800">下午好，{{ lawyerName }}</h1>
              <p class="text-gray-500 text-sm mt-1">
                今日还有 {{ metrics.pendingTasks }} 个待处理事项，请及时查看。
              </p>
            </div>
            <div class="hidden md:block text-right">
              <span class="text-sm text-gray-500">本月累计收益</span>
              <div class="text-2xl font-bold text-brand-600">¥ {{ metrics.monthIncome.toFixed(2) }}</div>
            </div>
          </div>

          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center">
              <div
                class="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl mr-4"
              >
                <i class="fa-solid fa-user-check"></i>
              </div>
              <div>
                <div class="text-sm text-gray-500">已完成预约</div>
                <div class="text-xl font-bold text-gray-900">
                  {{ metrics.todayConsultations }}
                </div>
              </div>
            </div>
            <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center">
              <div
                class="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xl mr-4"
              >
                <i class="fa-solid fa-clock"></i>
              </div>
              <div>
                <div class="text-sm text-gray-500">待处理预约</div>
                <div class="text-xl font-bold text-gray-900">{{ metrics.pendingAppointments }}</div>
              </div>
            </div>
            <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center">
              <div
                class="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mr-4"
              >
                <i class="fa-solid fa-star"></i>
              </div>
              <div>
                <div class="text-sm text-gray-500">客户评分</div>
                <div class="text-xl font-bold text-gray-900">{{ metrics.score.toFixed(1) }}</div>
              </div>
            </div>
            <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center md:hidden">
              <div
                class="w-12 h-12 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xl mr-4"
              >
                <i class="fa-solid fa-yen-sign"></i>
              </div>
              <div>
                <div class="text-sm text-gray-500">本月收益</div>
                <div class="text-xl font-bold text-gray-900">¥ {{ metrics.monthIncome.toFixed(0) }}</div>
              </div>
            </div>
          </div>

          <!-- Main Work Area (appointments list) -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-6">
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 class="font-bold text-gray-800">最新预约请求</h3>
                  <span
                    class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full"
                    v-if="latestAppointments.length > 0"
                  >
                    {{ latestAppointments.length }} 个新预约
                  </span>
                </div>
                <div class="divide-y divide-gray-50" v-if="latestAppointments.length">
                  <div
                    v-for="item in latestAppointments"
                    :key="item.id"
                    class="p-6 hover:bg-gray-50 transition"
                  >
                    <div class="flex justify-between items-start mb-2">
                      <div class="flex items-center">
                        <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        <span class="font-bold text-gray-900">预约咨询 - {{ item.userName || '用户' }}</span>
                        <span class="ml-2 text-xs text-gray-400">{{ item.appointmentTime || '待确认时间' }}</span>
                      </div>
                      <div class="font-bold text-brand-600 text-sm">
                        {{ item.scheduleDate }} {{ item.startTime }}-{{ item.endTime }}
                      </div>
                    </div>
                    <div class="flex space-x-3">
                      <button
                        class="px-4 py-2 bg-brand-600 text-white text-sm rounded hover:bg-brand-700 transition"
                        @click="handleAcceptAppointment(item)"
                      >
                        接受预约
                      </button>
                      <button
                        class="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm rounded hover:bg-gray-50"
                        @click="handleRejectAppointment(item)"
                      >
                        拒绝
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else class="p-6 text-center text-gray-400 text-sm">
                  暂无新的预约请求
                </div>
              </div>
            </div>

            <div class="lg:col-span-1">
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
                <h3 class="font-bold text-gray-800 mb-4">今日日程</h3>
                <div v-if="todaySchedule.length" class="space-y-4">
                  <div v-for="(event, idx) in todaySchedule" :key="idx" class="flex items-start">
                    <div class="flex-shrink-0 w-14 text-center">
                      <div class="text-xs text-gray-500">{{ event.time }}</div>
                      <div class="h-full border-r border-gray-200 mx-auto w-px my-1"></div>
                    </div>
                    <div
                      class="p-3 rounded-lg w-full ml-2 border-l-4"
                      :class="event.type === 'primary' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'"
                    >
                      <div class="font-bold text-sm text-gray-900">{{ event.title }}</div>
                      <div class="text-xs text-gray-500 mt-1">{{ event.desc }}</div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center text-gray-400 text-sm">
                  今日暂无安排
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Chat View -->
        <section
          v-show="activeView === 'chat'"
          class="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] max-w-7xl mx-auto flex rounded-xl shadow-sm border border-gray-200 overflow-hidden bg-white"
        >
          <!-- 简化版：右侧为当前会话，左侧列表静态展示 -->
          <div class="w-80 border-r border-gray-100 bg-gray-50 hidden md:flex flex-col">
            <div class="p-4 border-b border-gray-100">
              <input
                type="text"
                placeholder="搜索联系人..."
                class="w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
            <div class="flex-1 overflow-y-auto">
              <div class="p-3 hover:bg-white hover:shadow-sm cursor-pointer transition border-l-4 border-brand-600 bg-white">
                <div class="flex justify-between items-start">
                  <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div class="ml-3">
                      <div class="font-bold text-sm text-gray-900">王小明</div>
                      <div class="text-xs text-gray-500 truncate w-32">好的，我把证据发给您...</div>
                    </div>
                  </div>
                  <div class="text-xs text-gray-400">14:20</div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex-1 flex flex-col bg-white">
            <div class="h-16 border-b border-gray-100 flex justify-between items-center px-6">
              <div class="flex items-center">
                <button class="md:hidden mr-3 text-gray-500" @click="switchView('dashboard')">
                  <i class="fa-solid fa-arrow-left"></i>
                </button>
                <h3 class="font-bold text-gray-800">当前咨询会话</h3>
                <span class="ml-3 text-xs bg-green-100 text-green-600 px-2 py-1 rounded">服务中</span>
              </div>
              <div class="flex space-x-4 text-gray-400">
                <button title="结束服务" class="hover:text-red-500"><i class="fa-solid fa-power-off"></i></button>
                <button title="发送文件" class="hover:text-brand-600"><i class="fa-solid fa-folder-open"></i></button>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto p-6 bg-gray-50/30 space-y-4">
              <div class="text-center text-xs text-gray-400 my-4">会话记录示例（实际聊天在用户端）</div>
              <!-- 这里可以后续接入真实聊天记录 -->
            </div>
          </div>

          <div class="w-64 border-l border-gray-100 bg-white hidden xl:block flex flex-col">
            <div class="p-4 border-b border-gray-100">
              <h4 class="font-bold text-sm text-gray-800">案件笔记</h4>
            </div>
            <div class="p-4 flex-1 overflow-y-auto">
              <textarea
                class="w-full h-full bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-gray-700 focus:outline-none resize-none"
                placeholder="在此记录案情重点、关键时间节点..."
              ></textarea>
            </div>
          </div>
        </section>

        <!-- Orders View -->
        <section v-show="activeView === 'orders'" class="max-w-6xl mx-auto fade-in">
          <h1 class="text-2xl font-bold text-slate-800 mb-6">案件订单管理</h1>
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="flex border-b border-gray-100 overflow-x-auto">
              <button
                class="px-6 py-4 text-sm font-medium"
                :class="orderStatus === undefined ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-brand-600'"
                @click="changeOrderStatus(undefined)"
              >
                全部订单
              </button>
              <button
                class="px-6 py-4 text-sm font-medium"
                :class="orderStatus === 1 ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-brand-600'"
                @click="changeOrderStatus(1)"
              >
                服务中
              </button>
              <button
                class="px-6 py-4 text-sm font-medium"
                :class="orderStatus === 0 ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-brand-600'"
                @click="changeOrderStatus(0)"
              >
                待支付
              </button>
              <button
                class="px-6 py-4 text-sm font-medium"
                :class="orderStatus === 2 ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-brand-600'"
                @click="changeOrderStatus(2)"
              >
                已取消
              </button>
            </div>
            <table class="min-w-full text-left text-sm whitespace-nowrap">
              <thead class="uppercase tracking-wider border-b border-gray-100 bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th class="px-6 py-4">订单号/服务</th>
                  <th class="px-6 py-4">客户</th>
                  <th class="px-6 py-4">金额</th>
                  <th class="px-6 py-4">状态</th>
                  <th class="px-6 py-4">时间</th>
                  <th class="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-if="ordersLoading">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-400">
                    <i class="fa-solid fa-spinner fa-spin mr-2"></i> 加载中...
                  </td>
                </tr>
                <tr v-else-if="lawyerOrders.length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-400 text-sm">暂无订单记录</td>
                </tr>
                <tr
                  v-else
                  v-for="order in lawyerOrders"
                  :key="order.orderId"
                  class="hover:bg-gray-50 transition"
                >
                  <td class="px-6 py-4">
                    <div class="font-bold text-gray-900">#{{ order.orderId }}</div>
                    <div class="text-xs text-gray-500">{{ order.description || '咨询服务' }}</div>
                  </td>
                  <td class="px-6 py-4 flex items-center">
                    <div
                      class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-2"
                    >
                      {{ order.userName?.[0] || '客' }}
                    </div>
                    {{ order.userName || '客户' }}
                  </td>
                  <td class="px-6 py-4 font-medium">¥ {{ order.amount?.toFixed?.(2) ?? order.amount }}</td>
                  <td class="px-6 py-4">
                    <span :class="statusClass(order.status)" class="px-2 py-1 rounded text-xs font-medium">
                      {{ statusText(order.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-gray-500">{{ order.createTime }}</td>
                  <td class="px-6 py-4 text-right space-x-2">
                    <button
                      class="text-brand-600 hover:underline"
                      @click="goToChatFromOrder(order)"
                    >
                      进入会话
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getLawyerOrders } from '@/api/order'
import { getLawyerAppointmentList, acceptAppointment, rejectAppointment } from '@/api/appointment'

const router = useRouter()
const userStore = useUserStore()

const activeView = ref('dashboard')
const sidebarOpen = ref(false)

const lawyerName = computed(() => userStore.userInfo?.nickname || userStore.userInfo?.userName || '张伟律师')
const lawyerAvatar = computed(
  () => userStore.userInfo?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
)

const metrics = reactive({
  todayConsultations: 0,
  pendingAppointments: 0,
  pendingOrders: 0,
  monthIncome: 0,
  score: 4.9,
  pendingTasks: 0
})

const latestAppointments = ref([])
const todaySchedule = ref([])
const lawyerOrders = ref([])
const ordersLoading = ref(false)
const orderStatus = ref(undefined)

const currentTitle = computed(() => {
  if (activeView.value === 'orders') return '案件订单'
  if (activeView.value === 'chat') return '咨询会话'
  return '工作台'
})

const switchView = (view) => {
  activeView.value = view
  if (view === 'orders') {
    loadOrders()
  }
  if (view === 'dashboard') {
    loadAppointments()
  }
  if (window.innerWidth < 768) {
    sidebarOpen.value = false
  }
}

const statusText = (status) => {
  const map = {
    0: '未支付',
    1: '服务中',
    2: '已取消',
    3: '已完成'
  }
  return map[status] || '未知'
}

const statusClass = (status) => {
  const map = {
    0: 'bg-yellow-100 text-yellow-700',
    1: 'bg-green-100 text-green-700',
    2: 'bg-gray-100 text-gray-700',
    3: 'bg-blue-100 text-blue-700'
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

const changeOrderStatus = (status) => {
  orderStatus.value = status
  loadOrders()
}

const loadOrders = async () => {
  ordersLoading.value = true
  try {
    const params = {
      page: 1,
      size: 10
    }
    if (orderStatus.value !== undefined) {
      params.status = orderStatus.value
    }
    const res = await getLawyerOrders(params)
    if (res.success && res.data) {
      lawyerOrders.value = res.data.records || []
      metrics.pendingOrders = lawyerOrders.value.filter((o) => o.status === 0).length
      metrics.monthIncome = lawyerOrders.value
        .filter((o) => o.status === 3)
        .reduce((sum, o) => sum + (Number(o.amount) || 0), 0)
    }
  } catch (e) {
    console.error('加载律师订单失败', e)
  } finally {
    ordersLoading.value = false
  }
}

const loadAppointments = async () => {
  try {
    const lawyerId = userStore.userInfo?.id

    // 待处理预约：status = 1
    const pendingRes = await getLawyerAppointmentList({
      lawyerId,
      status: 1
    })
    if (pendingRes.success && Array.isArray(pendingRes.data)) {
      latestAppointments.value = pendingRes.data.slice(0, 3)
      metrics.pendingAppointments = pendingRes.data.length
      metrics.pendingTasks = pendingRes.data.length
      todaySchedule.value = pendingRes.data.slice(0, 2).map((item) => ({
        time: item.startTime || '待定',
        title: `预约 - ${item.userName || '用户'}`,
        desc: `${item.scheduleDate || ''} ${item.startTime || ''}-${item.endTime || ''}`,
        type: 'primary'
      }))
    } else {
      latestAppointments.value = []
      metrics.pendingAppointments = 0
      metrics.pendingTasks = 0
      todaySchedule.value = []
    }

    // 已完成预约：status = 3
    const finishedRes = await getLawyerAppointmentList({
      lawyerId,
      status: 3
    })
    if (finishedRes.success && Array.isArray(finishedRes.data)) {
      metrics.todayConsultations = finishedRes.data.length
    } else {
      metrics.todayConsultations = 0
    }
  } catch (e) {
    console.error('加载预约记录失败', e)
  }
}

const handleAcceptAppointment = async (item) => {
  try {
    await acceptAppointment({
      appointmentId: item.id,
      customAmount: undefined
    })
    await loadAppointments()
    await loadOrders()
  } catch (e) {
    console.error('接受预约失败', e)
  }
}

const handleRejectAppointment = async (item) => {
  try {
    await rejectAppointment({
      appointmentId: item.id,
      reason: '时间冲突，无法接待'
    })
    await loadAppointments()
  } catch (e) {
    console.error('拒绝预约失败', e)
  }
}

const goToChatFromOrder = (order) => {
  activeView.value = 'chat'
}

const handleLogout = () => {
  userStore.logout()
  router.replace({ name: 'Auth' })
}

onMounted(() => {
  switchView('dashboard')
})
</script>



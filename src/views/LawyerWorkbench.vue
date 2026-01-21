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
        <span class="font-bold text-lg text-slate-900">法律咨询平台 · 律师端</span>
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
              :class="{ 'bg-brand-50 text-brand-600 border-r-4 border-brand-600': activeView === 'schedule' }"
              @click="switchView('schedule')"
            >
              <i class="fa-solid fa-clock w-6"></i>
              <span class="font-medium">预约时间</span>
            </button>
          </li>
          <li>
            <button
              class="w-full text-left sidebar-link flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-colors justify-between"
              :class="{ 'bg-brand-50 text-brand-600 border-r-4 border-brand-600': activeView === 'appointments' }"
              @click="switchView('appointments')"
            >
              <div class="flex items-center">
                <i class="fa-solid fa-calendar-check w-6"></i>
                <span class="font-medium">预约管理</span>
              </div>
              <span
                v-if="metrics.pendingAppointments > 0"
                class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"
              >
                {{ metrics.pendingAppointments }}
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
            <button
              class="w-full text-left sidebar-link flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-colors"
              :class="{ 'bg-brand-50 text-brand-600 border-r-4 border-brand-600': activeView === 'certification' }"
              @click="switchView('certification')"
            >
              <i class="fa-solid fa-id-card w-6"></i>
              <span class="font-medium">资质认证</span>
              <i class="fa-solid fa-circle-check text-green-500 ml-auto text-sm"></i>
            </button>
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
          class="h-[calc(90vh)] w-full flex rounded-xl shadow-sm border border-gray-200 overflow-hidden bg-white"
        >
          <!-- 已移除静态占位联系人列，改用可重用聊天面板（在小屏幕下自动布局） -->

          <div class="flex-1 flex flex-col bg-white">
            <div class="h-16 border-b border-gray-100 flex justify-between items-center px-6">
              <div class="flex items-center">
                <button class="md:hidden mr-3 text-gray-500" @click="switchView('dashboard')">
                  <i class="fa-solid fa-arrow-left"></i>
                </button>
                <h3 class="font-bold text-gray-800">当前咨询会话</h3>
                <span class="ml-3 text-xs bg-green-100 text-green-600 px-2 py-1 rounded">已支付</span>
              </div>
              <div class="flex space-x-4 text-gray-400">
                <button title="结束服务" class="hover:text-red-500"><i class="fa-solid fa-power-off"></i></button>
                <button title="发送文件" class="hover:text-brand-600"><i class="fa-solid fa-folder-open"></i></button>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto p-6 bg-gray-50/30 space-y-4">
              <!-- 嵌入真正的聊天面板 -->
              <LawyerChatPanel />
            </div>
          </div>

          <!-- 案件笔记已移除：律师端聊天室不再显示案件笔记 -->
        </section>

        <!-- Schedule View -->
        <section v-show="activeView === 'schedule'" class="max-w-6xl mx-auto fade-in space-y-4">
          <h1 class="text-2xl font-bold text-slate-800">预约时间设置</h1>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label class="block text-sm text-gray-600 mb-1">可预约日期</label>
                <input type="date" v-model="scheduleForm.date" class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">开始时间</label>
                <input type="time" v-model="scheduleForm.startTime" class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">结束时间</label>
                <input type="time" v-model="scheduleForm.endTime" class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div class="flex gap-2">
                <button
                  class="flex-1 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  :disabled="scheduleSaving"
                  @click="handleSaveSchedule"
                >
                  {{ scheduleSaving ? '保存中...' : scheduleForm.id ? '保存修改' : '新增时间段' }}
                </button>
                <button
                  class="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                  @click="resetScheduleForm"
                >
                  重置
                </button>
              </div>
            </div>
            <p class="text-xs text-gray-400 mt-3">提示：请确保时间不重叠且结束时间晚于开始时间。</p>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 class="font-bold text-slate-800">我的可预约时间段</h3>
              <button class="text-sm text-brand-600 hover:text-brand-700" @click="loadSchedules">刷新</button>
            </div>

            <div v-if="scheduleLoading" class="text-center py-10 text-gray-400 text-sm">
              <i class="fa-solid fa-spinner fa-spin mr-2"></i>加载中...
            </div>
            <div v-else-if="scheduleList.length === 0" class="text-center py-10 text-gray-500 text-sm">
              暂无可预约时间段
            </div>
            <div v-else class="overflow-x-auto">
              <table class="min-w-full text-sm text-left whitespace-nowrap">
                <thead class="bg-gray-50 text-gray-600">
                  <tr>
                    <th class="px-6 py-3 font-medium">日期</th>
                    <th class="px-6 py-3 font-medium">时间段</th>
                    <th class="px-6 py-3 font-medium">状态</th>
                    <th class="px-6 py-3 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="slot in scheduleList" :key="slot.id">
                    <td class="px-6 py-3 text-gray-900">{{ slot.date || '--' }}</td>
                    <td class="px-6 py-3 text-gray-700">{{ formatSlotTime(slot) }}</td>
                    <td class="px-6 py-3">
                      <span :class="scheduleStatusClass(slot.status)" class="px-2 py-1 rounded text-xs font-medium inline-block">
                        {{ scheduleStatusText(slot.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-3 text-right space-x-2">
                      <button
                        class="text-brand-600 bg-brand-50 px-3 py-1 rounded hover:bg-brand-100 transition"
                        @click="handleEditSchedule(slot)"
                      >
                        编辑
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Appointments Management View -->
        <section v-show="activeView === 'appointments'" class="max-w-6xl mx-auto fade-in space-y-4">
          <h1 class="text-2xl font-bold text-slate-800">预约管理</h1>

          <!-- Statistics -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-500 text-sm">待处理预约</p>
                  <p class="text-3xl font-bold text-slate-800">{{ appointmentsStats.pending }}</p>
                </div>
                <i class="fa-solid fa-hourglass-end text-4xl text-yellow-500 opacity-20"></i>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-500 text-sm">已确认预约</p>
                  <p class="text-3xl font-bold text-slate-800">{{ appointmentsStats.confirmed }}</p>
                </div>
                <i class="fa-solid fa-check-circle text-4xl text-green-500 opacity-20"></i>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-500 text-sm">已完成咨询</p>
                  <p class="text-3xl font-bold text-slate-800">{{ appointmentsStats.completed }}</p>
                </div>
                <i class="fa-solid fa-star text-4xl text-blue-500 opacity-20"></i>
              </div>
            </div>
          </div>

          <!-- Appointments List with Tabs -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="flex border-b border-gray-100 overflow-x-auto bg-gray-50">
              <button
                v-for="statusOption in appointmentStatuses"
                :key="statusOption.value"
                class="px-6 py-4 text-sm font-medium whitespace-nowrap"
                :class="appointmentsFilter.currentStatus === statusOption.value ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-brand-600'"
                @click="changeAppointmentStatus(statusOption.value)"
              >
                {{ statusOption.label }}
                <span v-if="getAppointmentCountByStatus(statusOption.value) > 0" class="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                  {{ getAppointmentCountByStatus(statusOption.value) }}
                </span>
              </button>
            </div>

            <div v-if="appointmentsLoading" class="text-center py-10 text-gray-400 text-sm">
              <i class="fa-solid fa-spinner fa-spin mr-2"></i>加载中...
            </div>
            <div v-else-if="filteredAppointments.length === 0" class="text-center py-10 text-gray-500 text-sm">
              暂无预约记录
            </div>
            <div v-else class="divide-y divide-gray-100">
              <div
                v-for="appointment in filteredAppointments"
                :key="appointment.id"
                class="p-6 hover:bg-gray-50 transition"
              >
                <div class="flex items-start justify-between gap-4">
                  <!-- Left: User Info and Appointment Details -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-4 mb-3">
                      <div
                        class="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0"
                      >
                        {{ appointment.userName?.[0] || '用' }}
                      </div>
                      <div>
                        <h3 class="font-bold text-slate-800">{{ appointment.userName }}</h3>
                        <p class="text-xs text-gray-500">用户ID: {{ appointment.userId }}</p>
                      </div>
                    </div>

                    <!-- Appointment Details -->
                    <div class="bg-gray-50 rounded-lg p-4 mb-3 text-sm">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p class="text-gray-500 text-xs mb-1">预约日期</p>
                          <p class="font-medium text-gray-800">{{ appointment.scheduleDate || '--' }}</p>
                        </div>
                        <div>
                          <p class="text-gray-500 text-xs mb-1">预约时段</p>
                          <p class="font-medium text-gray-800">
                            {{ appointment.startTime || '--' }} - {{ appointment.endTime || '--' }}
                          </p>
                        </div>
                        <div>
                          <p class="text-gray-500 text-xs mb-1">预约状态</p>
                          <span :class="getAppointmentStatusClass(appointment.status)" class="px-2 py-1 rounded text-xs font-medium inline-block">
                            {{ getAppointmentStatusText(appointment.status) }}
                          </span>
                        </div>
                        <div>
                          <p class="text-gray-500 text-xs mb-1">预约时间</p>
                          <p class="text-gray-600 text-xs">{{ formatDateTime(appointment.createTime) }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Right: Action Buttons -->
                  <div class="flex flex-col gap-2 flex-shrink-0">
                    <button
                      v-if="appointment.status === 1"
                      class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
                      @click="openAcceptDialog(appointment)"
                    >
                      <i class="fa-solid fa-check mr-1"></i> 接受
                    </button>
                    <button
                      v-if="appointment.status === 1"
                      class="px-4 py-2 bg-red-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-200 transition"
                      @click="openRejectDialog(appointment)"
                    >
                      <i class="fa-solid fa-times mr-1"></i> 拒绝
                    </button>
                    <button
                      v-if="appointment.status === 2"
                      class="px-4 py-2 bg-blue-100 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-200 transition"
                      @click="viewOrder(appointment)"
                    >
                      <i class="fa-solid fa-receipt mr-1"></i> 查看订单
                    </button>
                  </div>
                </div>
              </div>
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
                已支付
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

        <!-- Certification View -->
        <section v-show="activeView === 'certification'" class="max-w-5xl mx-auto fade-in pb-10">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h1 class="text-2xl font-bold text-slate-800">资质认证</h1>
              <p class="text-gray-500 text-sm mt-1">完善执业信息，解锁平台接单权限</p>
            </div>
            <button class="text-sm text-brand-600 hover:bg-brand-50 px-3 py-2 rounded transition">
              <i class="fa-regular fa-file-lines mr-1"></i> 查看认证规范
            </button>
          </div>

          <!-- Status Banner -->
          <div
            v-if="certificationStatus.showWarning"
            class="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-8 flex items-start"
          >
            <i class="fa-solid fa-circle-exclamation text-yellow-600 mt-1 mr-3 text-lg"></i>
            <div>
              <h3 class="font-bold text-yellow-800">审核中：请等待平台审核</h3>
              <p class="text-sm text-yellow-700 mt-1">您已提交资质认证，我们将在 3 个工作日内完成审核。</p>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <!-- Progress Steps -->
            <div class="border-b border-gray-100 bg-gray-50/50 px-4 py-6">
              <div class="flex items-center justify-center max-w-3xl mx-auto">
                <!-- Step 1 -->
                <div class="flex flex-col items-center relative z-10">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md transition-transform hover:scale-105"
                    :class="
                      certificationStatus.step >= 1
                        ? 'bg-brand-600 text-white shadow-blue-200'
                        : 'bg-gray-200 text-gray-600'
                    "
                  >
                    <i v-if="certificationStatus.step > 1" class="fa-solid fa-check"></i>
                    <span v-else>1</span>
                  </div>
                  <span
                    class="text-xs font-bold mt-2"
                    :class="
                      certificationStatus.step >= 1 ? 'text-brand-700' : 'text-gray-500'
                    "
                  >
                    实名认证
                  </span>
                </div>

                <!-- Connector 1 -->
                <div
                  class="flex-1 h-1 mx-2 -mt-6 rounded"
                  :class="
                    certificationStatus.step > 1 ? 'bg-brand-200' : 'bg-gray-200'
                  "
                ></div>

                <!-- Step 2 -->
                <div class="flex flex-col items-center relative z-10">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md"
                    :class="
                      certificationStatus.step === 2
                        ? 'bg-brand-600 text-white shadow-blue-200 ring-4 ring-blue-50'
                        : certificationStatus.step > 2
                          ? 'bg-brand-600 text-white shadow-blue-200'
                          : 'bg-gray-200 text-gray-600'
                    "
                  >
                    <i v-if="certificationStatus.step > 2" class="fa-solid fa-check"></i>
                    <span v-else>2</span>
                  </div>
                  <span
                    class="text-xs font-bold mt-2"
                    :class="
                      certificationStatus.step >= 2 ? 'text-brand-700' : 'text-gray-500'
                    "
                  >
                    执业信息
                  </span>
                </div>

                <!-- Connector 2 -->
                <div
                  class="flex-1 h-1 mx-2 -mt-6 rounded"
                  :class="
                    certificationStatus.step > 2 ? 'bg-brand-200' : 'bg-gray-200'
                  "
                ></div>

                <!-- Step 3 -->
                <div class="flex flex-col items-center relative z-10">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                    :class="
                      certificationStatus.step >= 3
                        ? 'bg-brand-600 text-white shadow-md shadow-blue-200'
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    "
                  >
                    <i v-if="certificationStatus.step > 3" class="fa-solid fa-check"></i>
                    <span v-else>3</span>
                  </div>
                  <span
                    class="text-xs font-bold mt-2"
                    :class="
                      certificationStatus.step >= 3
                        ? 'text-brand-700'
                        : 'text-gray-500'
                    "
                  >
                    等待审核
                  </span>
                </div>
              </div>
            </div>

            <!-- Form Content -->
            <form class="p-6 md:p-10 space-y-10">
              <!-- Section 1: Basic Info -->
              <section>
                <div class="flex items-center mb-6">
                  <div class="w-1 h-6 bg-brand-500 rounded-full mr-3"></div>
                  <h3 class="text-lg font-bold text-gray-800">
                    基本信息
                    <span class="text-xs font-normal text-gray-400 ml-2">(已通过实名认证)</span>
                  </h3>
                </div>
                <div class="flex flex-col md:flex-row gap-8">
                  <!-- Avatar -->
                  <div class="flex-shrink-0 flex flex-col items-center">
                    <div class="relative group cursor-pointer w-32 h-32">
                      <img
                        :src="lawyerAvatar"
                        class="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-sm group-hover:border-brand-200 transition-colors"
                      />
                      <div
                        class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all flex items-center justify-center"
                      >
                        <i class="fa-solid fa-camera text-white opacity-0 group-hover:opacity-100 text-xl"></i>
                      </div>
                    </div>
                    <p class="text-xs text-gray-500 mt-3">点击更换头像</p>
                  </div>

                  <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-bold text-gray-700 mb-2">真实姓名</label>
                      <div class="relative">
                        <input
                          type="text"
                          :value="lawyerName"
                          class="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
                          readonly
                        />
                        <i class="fa-solid fa-lock absolute right-3 top-3 text-gray-400 text-xs"></i>
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-gray-700 mb-2">联系手机</label>
                      <div class="relative">
                        <input
                          type="text"
                          :value="lawyerPhone"
                          class="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
                          readonly
                        />
                        <i class="fa-solid fa-lock absolute right-3 top-3 text-gray-400 text-xs"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <hr class="border-gray-100" />

              <!-- Section 2: Professional Info -->
              <section>
                <div class="flex items-center mb-6">
                  <div class="w-1 h-6 bg-brand-500 rounded-full mr-3"></div>
                  <h3 class="text-lg font-bold text-gray-800">执业资料</h3>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div class="md:col-span-2">
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                      所属律师事务所 <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                      <i class="fa-solid fa-building-columns absolute left-3 top-3 text-gray-400"></i>
                      <input
                        type="text"
                        v-model="certificationForm.lawFirm"
                        placeholder="请输入律所全称"
                        class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow hover:border-brand-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                      律师执业证号 <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      v-model="certificationForm.licenseNo"
                      placeholder="17位数字执业证号"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow font-mono"
                    />
                    <p class="text-xs text-gray-400 mt-1">请填写《律师执业证》上的流水号</p>
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                      执业证类型 <span class="text-red-500">*</span>
                    </label>
                    <select
                      v-model="certificationForm.licenseType"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    >
                      <option value="">请选择执业证类型</option>
                      <option value="lawyer">律师</option>
                      <option value="intern">实习律师</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                      发证日期 <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      v-model="certificationForm.issueDate"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                      到期日期 <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      v-model="certificationForm.expireDate"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                      常驻地区 <span class="text-red-500">*</span>
                    </label>
                    <div class="flex space-x-3">
                      <select
                        v-model="certificationForm.province"
                        class="w-1/2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      >
                        <option value="">选择省份</option>
                        <option value="北京市">北京市</option>
                        <option value="上海市">上海市</option>
                        <option value="广东省">广东省</option>
                        <option value="浙江省">浙江省</option>
                      </select>
                      <select
                        v-model="certificationForm.city"
                        class="w-1/2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      >
                        <option value="">选择城市</option>
                        <option value="朝阳区">朝阳区</option>
                        <option value="海淀区">海淀区</option>
                        <option value="浦东新区">浦东新区</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Specialties -->
                <div class="mb-6">
                  <label class="block text-sm font-bold text-gray-700 mb-3">
                    擅长领域（请选择 1-3 项）<span class="text-red-500">*</span>
                  </label>
                  <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    <label
                      v-for="specialty in specialtyOptions"
                      :key="specialty"
                      class="cursor-pointer relative"
                    >
                      <input
                        type="checkbox"
                        :value="specialty"
                        v-model="certificationForm.specialtyJson"
                        class="peer sr-only"
                      />
                      <div
                        class="p-2 rounded-lg border border-gray-200 bg-white text-center text-sm font-medium text-gray-600 peer-checked:bg-blue-50 peer-checked:border-brand-500 peer-checked:text-brand-600 transition-all hover:bg-gray-50"
                      >
                        {{ specialty }}
                      </div>
                      <div
                        class="absolute top-0 right-0 -mt-1 -mr-1 w-4 h-4 bg-brand-500 rounded-full text-white text-[10px] flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity"
                      >
                        <i class="fa-solid fa-check"></i>
                      </div>
                    </label>
                  </div>
                </div>
              </section>

              <hr class="border-gray-100" />

              <!-- Section 3: Document Uploads -->
              <section>
                <div class="flex items-center mb-6">
                  <div class="w-1 h-6 bg-brand-500 rounded-full mr-3"></div>
                  <h3 class="text-lg font-bold text-gray-800">证件照片上传</h3>
                </div>

                <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-sm text-blue-800">
                  <i class="fa-solid fa-circle-info mr-2"></i>
                  请上传清晰、无遮挡的证件照片。支持 JPG/PNG 格式，单张不超过 5MB。
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <!-- License Upload -->
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                      律师执业证（信息页）<span class="text-red-500">*</span>
                    </label>
                    <div
                      class="group relative w-full h-52 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-blue-50/50 transition-all"
                    >
                      <input
                        type="file"
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        @change="handleLicenseUpload"
                      />
                      <div class="flex flex-col items-center text-gray-400 group-hover:text-brand-500 transition-colors">
                        <i class="fa-solid fa-cloud-arrow-up text-4xl mb-3"></i>
                        <p class="font-medium">点击或拖拽上传</p>
                      </div>
                      <div class="absolute top-2 right-2">
                        <i class="fa-regular fa-circle-question text-gray-400 hover:text-brand-500" title="查看示例"></i>
                      </div>
                    </div>
                    <p
                      v-if="uploadedFiles.license"
                      class="text-xs text-green-600 mt-2 flex items-center"
                    >
                      <i class="fa-solid fa-check-circle mr-1"></i> 已上传：{{ uploadedFiles.license }}
                    </p>
                  </div>
                </div>
              </section>

              <!-- Footer -->
              <div class="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="text-xs text-gray-400 text-center md:text-left">
                  提交即代表您同意
                  <a href="#" class="text-brand-600 hover:underline">《法律咨询平台律师入驻协议》</a><br />
                  您的信息将严格保密，仅用于平台资质审核。
                </p>
                <div class="flex space-x-4 w-full md:w-auto">
                  <button
                    type="button"
                    class="flex-1 md:flex-none px-8 py-3 border border-gray-300 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition"
                  >
                    保存草稿
                  </button>
                  <button
                    type="button"
                    @click="submitCertification"
                    class="flex-1 md:flex-none px-8 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-200 transform active:scale-95"
                  >
                    提交审核
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  </div>

  <!-- Accept Appointment Dialog -->
  <div
    v-if="appointmentDialogs.acceptVisible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center">
        <i class="fa-solid fa-check-circle text-green-600 text-2xl mr-3"></i>
        <h3 class="text-lg font-bold text-gray-800">确认接受预约</h3>
      </div>
      <div class="px-6 py-4 space-y-4">
        <p class="text-gray-600 text-sm">
          您即将确认 <strong>{{ appointmentDialogs.selectedAppointment?.userName }}</strong> 的预约请求。
        </p>
        <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <div>
            <span class="text-gray-500">预约日期：</span>
            <span class="font-medium">{{ appointmentDialogs.selectedAppointment?.scheduleDate }}</span>
          </div>
          <div>
            <span class="text-gray-500">预约时段：</span>
            <span class="font-medium">
              {{ appointmentDialogs.selectedAppointment?.startTime }} - {{ appointmentDialogs.selectedAppointment?.endTime }}
            </span>
          </div>
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-2">
            自定义咨询费（可选）
            <span class="text-xs text-gray-400">不填则使用系统费率</span>
          </label>
          <div class="flex items-center">
            <span class="text-gray-500 text-lg mr-2">¥</span>
            <input
              v-model="appointmentDialogs.customAmount"
              type="number"
              placeholder="请输入费用金额"
              class="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      <div class="px-6 py-4 border-t border-gray-100 flex gap-3">
        <button
          class="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition font-medium"
          @click="closeAcceptDialog"
        >
          取消
        </button>
        <button
          class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          @click="submitAcceptAppointment"
          :disabled="appointmentDialogs.submitting"
        >
          {{ appointmentDialogs.submitting ? '处理中...' : '确认接受' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Reject Appointment Dialog -->
  <div
    v-if="appointmentDialogs.rejectVisible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center">
        <i class="fa-solid fa-times-circle text-red-600 text-2xl mr-3"></i>
        <h3 class="text-lg font-bold text-gray-800">拒绝预约</h3>
      </div>
      <div class="px-6 py-4 space-y-4">
        <p class="text-gray-600 text-sm">
          您即将拒绝 <strong>{{ appointmentDialogs.selectedAppointment?.userName }}</strong> 的预约请求。
        </p>
        <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <div>
            <span class="text-gray-500">预约日期：</span>
            <span class="font-medium">{{ appointmentDialogs.selectedAppointment?.scheduleDate }}</span>
          </div>
          <div>
            <span class="text-gray-500">预约时段：</span>
            <span class="font-medium">
              {{ appointmentDialogs.selectedAppointment?.startTime }} - {{ appointmentDialogs.selectedAppointment?.endTime }}
            </span>
          </div>
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-2">拒绝原因（可选）</label>
          <textarea
            v-model="appointmentDialogs.rejectReason"
            placeholder="请简要说明拒绝原因（用户将看到此信息）"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
            rows="3"
          ></textarea>
          <p class="text-xs text-gray-400 mt-1">例如：时间冲突、专业领域不符等</p>
        </div>
      </div>
      <div class="px-6 py-4 border-t border-gray-100 flex gap-3">
        <button
          class="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition font-medium"
          @click="closeRejectDialog"
        >
          取消
        </button>
        <button
          class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          @click="submitRejectAppointment"
          :disabled="appointmentDialogs.submitting"
        >
          {{ appointmentDialogs.submitting ? '处理中...' : '确认拒绝' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import LawyerChatPanel from '@/components/LawyerChatPanel.vue'
import { getLawyerOrders } from '@/api/order'
import { getLawyerAppointmentList, acceptAppointment, rejectAppointment } from '@/api/appointment'
import { uploadLawyerLicense, submitLawyerLicense } from '@/api/lawyer'
import { addSchedule, getScheduleList, updateSchedule } from '@/api/schedule'

const router = useRouter()
const userStore = useUserStore()

const activeView = ref('dashboard')
const sidebarOpen = ref(false)

const lawyerName = computed(() => userStore.userInfo?.nickname || userStore.userInfo?.userName || '张伟律师')
const lawyerPhone = computed(() => userStore.userInfo?.phone || '')
const lawyerAvatar = computed(
  () => userStore.userInfo?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
)

const specialtyOptions = [
  '专利侵权',
  '交通事故',
  '公司法务',
  '刑事辩护',
  '劳动纠纷',
  '合同纠纷',
  '婚姻家事',
  '工伤赔偿',
  '房产纠纷',
  '民事纠纷',
  '知识产权',
  '继承纠纷'
]

const certificationForm = reactive({
  lawFirm: '',
  licenseNo: '',
  licenseType: 'lawyer',
  province: '',
  city: '',
  specialtyJson: [],
  issueDate: '',
  expireDate: '',
  licenseFile: null,
  ossUrl: null,
  ossObject: null
})

const uploadedFiles = reactive({
  license: ''
})

const certificationStatus = reactive({
  step: 2,
  showWarning: false
})

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
const scheduleForm = reactive({
  id: null,
  date: '',
  startTime: '',
  endTime: ''
})
const scheduleList = ref([])
const scheduleLoading = ref(false)
const scheduleSaving = ref(false)

// Appointments state
const appointmentStatuses = [
  { value: 1, label: '待确认' },
  { value: 2, label: '已确认' },
  { value: 3, label: '已完成' },
  { value: 4, label: '已取消' },
  { value: 5, label: '已拒绝' }
]

const appointmentsFilter = reactive({
  currentStatus: 1
})

const appointmentsList = ref([])
const appointmentsLoading = ref(false)

const appointmentsStats = reactive({
  pending: 0,
  confirmed: 0,
  completed: 0
})

const appointmentDialogs = reactive({
  acceptVisible: false,
  rejectVisible: false,
  selectedAppointment: null,
  customAmount: '',
  rejectReason: '',
  submitting: false
})

const filteredAppointments = computed(() => {
  return appointmentsList.value.filter(
    (item) => item.status === appointmentsFilter.currentStatus
  )
})

const currentTitle = computed(() => {
  if (activeView.value === 'orders') return '案件订单'
  if (activeView.value === 'chat') return '咨询会话'
  if (activeView.value === 'schedule') return '预约时间'
  if (activeView.value === 'appointments') return '预约管理'
  return '工作台'
})

const switchView = (view) => {
  if (view === 'chat') {
    // 在工作台内展示聊天面板，而不是跳转到独立的聊天页面，这样左侧侧边栏不会消失
    activeView.value = 'chat'
    return
  }
  activeView.value = view
  if (view === 'orders') {
    loadOrders()
  }
  if (view === 'dashboard') {
    loadAppointments()
  }
  if (view === 'schedule') {
    loadSchedules()
  }
  if (view === 'appointments') {
    loadAllAppointments()
  }
  if (window.innerWidth < 768) {
    sidebarOpen.value = false
  }
}

const statusText = (status) => {
  const map = {
    0: '未支付',
    1: '已支付',
    2: '已取消'
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

const timeObjToString = (timeObj) => {
  if (!timeObj) return '--'
  // 支持字符串格式 "HH:mm:ss" 或 "HH:mm"
  if (typeof timeObj === 'string') {
    return timeObj.substring(0, 5) // "HH:mm:ss" → "HH:mm"
  }
  // 支持对象格式 { hour, minute, second, nano }
  if (typeof timeObj.hour === 'undefined') return '--'
  const pad = (n) => String(n ?? 0).padStart(2, '0')
  return `${pad(timeObj.hour)}:${pad(timeObj.minute)}`
}

const toTimeDTO = (value) => {
  if (!value) return null
  const [h, m] = value.split(':')
  const hour = Number(h)
  const minute = Number(m)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null
  return { hour, minute, second: 0, nano: 0 }
}

const formatSlotTime = (slot) => {
  return `${timeObjToString(slot.startTime)} - ${timeObjToString(slot.endTime)}`
}

const scheduleStatusText = (status) => {
  const map = {
    1: '可预约',
    2: '已预约',
    3: '已关闭'
  }
  return map[status] || '可预约'
}

const scheduleStatusClass = (status) => {
  const map = {
    0: 'bg-green-50 text-green-700',
    1: 'bg-amber-50 text-amber-700',
    2: 'bg-gray-100 text-gray-600'
  }
  return map[status] || 'bg-green-50 text-green-700'
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

const loadSchedules = async () => {
  scheduleLoading.value = true
  try {
    const lawyerId = userStore.userInfo?.id
    if (!lawyerId) {
      scheduleList.value = []
      return
    }
    const res = await getScheduleList({ lawyerId })
    if (res.success && Array.isArray(res.data)) {
      scheduleList.value = res.data
    } else {
      scheduleList.value = []
    }
  } catch (e) {
    console.error('加载可预约时间段失败', e)
  } finally {
    scheduleLoading.value = false
  }
}

const resetScheduleForm = () => {
  scheduleForm.id = null
  scheduleForm.date = ''
  scheduleForm.startTime = ''
  scheduleForm.endTime = ''
}

const handleEditSchedule = (slot) => {
  scheduleForm.id = slot.id
  scheduleForm.date = slot.date
  scheduleForm.startTime = timeObjToString(slot.startTime)
  scheduleForm.endTime = timeObjToString(slot.endTime)
  activeView.value = 'schedule'
}

const handleSaveSchedule = async () => {
  if (!scheduleForm.date || !scheduleForm.startTime || !scheduleForm.endTime) {
    alert('请填写完整的日期和时间段')
    return
  }

  const start = toTimeDTO(scheduleForm.startTime)
  const end = toTimeDTO(scheduleForm.endTime)
  if (!start || !end) {
    alert('时间格式不正确，请使用 HH:mm')
    return
  }

  if (start.hour > end.hour || (start.hour === end.hour && start.minute >= end.minute)) {
    alert('结束时间必须晚于开始时间')
    return
  }

  const lawyerId = userStore.userInfo?.id
  if (!lawyerId) {
    alert('未获取到律师信息，请重新登录')
    return
  }

  // 后端期望 startTime/endTime 为 "HH:mm" 格式的字符串，而非对象
  const payload = {
    lawyerId,
    date: scheduleForm.date,
    startTime: scheduleForm.startTime,
    endTime: scheduleForm.endTime
  }

  scheduleSaving.value = true
  try {
    if (scheduleForm.id) {
      payload.id = scheduleForm.id
      await updateSchedule(payload)
    } else {
      await addSchedule(payload)
    }
    await loadSchedules()
    resetScheduleForm()
  } catch (e) {
    console.error('保存预约时间段失败', e)
    alert('保存失败：' + (e.response?.data?.message || e.message || '请稍后重试'))
  } finally {
    scheduleSaving.value = false
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

// New appointment management functions
const loadAllAppointments = async () => {
  appointmentsLoading.value = true
  try {
    const lawyerId = userStore.userInfo?.id
    if (!lawyerId) {
      appointmentsList.value = []
      appointmentsStats.pending = 0
      appointmentsStats.confirmed = 0
      appointmentsStats.completed = 0
      return
    }

    // Load all appointments (all statuses)
    const res = await getLawyerAppointmentList({ lawyerId })
    if (res.success && Array.isArray(res.data)) {
      appointmentsList.value = res.data
      // Calculate stats
      const pendingCount = res.data.filter((a) => a.status === 1).length
      const confirmedCount = res.data.filter((a) => a.status === 2).length
      const completedCount = res.data.filter((a) => a.status === 3).length

      appointmentsStats.pending = pendingCount
      appointmentsStats.confirmed = confirmedCount
      appointmentsStats.completed = completedCount

      // 同步侧边栏红点与待办数，确保待确认清空后红点消失
      metrics.pendingAppointments = pendingCount
      metrics.pendingTasks = pendingCount
    } else {
      appointmentsList.value = []
      appointmentsStats.pending = 0
      appointmentsStats.confirmed = 0
      appointmentsStats.completed = 0
      metrics.pendingAppointments = 0
      metrics.pendingTasks = 0
    }
  } catch (e) {
    console.error('加载预约记录失败', e)
    appointmentsList.value = []
  } finally {
    appointmentsLoading.value = false
  }
}

const changeAppointmentStatus = (status) => {
  appointmentsFilter.currentStatus = status
}

const getAppointmentCountByStatus = (status) => {
  return appointmentsList.value.filter((a) => a.status === status).length
}

const getAppointmentStatusText = (status) => {
  const map = {
    1: '待确认',
    2: '已确认',
    3: '已完成',
    4: '已取消',
    5: '已拒绝'
  }
  return map[status] || '未知'
}

const getAppointmentStatusClass = (status) => {
  const map = {
    1: 'bg-yellow-50 text-yellow-700',
    2: 'bg-green-50 text-green-700',
    3: 'bg-blue-50 text-blue-700',
    4: 'bg-gray-100 text-gray-600',
    5: 'bg-red-50 text-red-600'
  }
  return map[status] || 'bg-gray-50 text-gray-600'
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '--'
  try {
    return new Date(dateTime).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateTime
  }
}

const openAcceptDialog = (appointment) => {
  appointmentDialogs.selectedAppointment = appointment
  appointmentDialogs.customAmount = ''
  appointmentDialogs.acceptVisible = true
}

const closeAcceptDialog = () => {
  appointmentDialogs.acceptVisible = false
  appointmentDialogs.selectedAppointment = null
  appointmentDialogs.customAmount = ''
}

const submitAcceptAppointment = async () => {
  const appointment = appointmentDialogs.selectedAppointment
  if (!appointment) return

  appointmentDialogs.submitting = true
  try {
    await acceptAppointment({
      appointmentId: appointment.id,
      customAmount: appointmentDialogs.customAmount || undefined
    })
    // Refresh both appointments and orders
    await loadAllAppointments()
    await loadOrders()
    closeAcceptDialog()
    alert('预约已接受，订单已生成')
  } catch (e) {
    console.error('接受预约失败', e)
    alert('接受预约失败: ' + (e.response?.data?.message || e.message || '请稍后重试'))
  } finally {
    appointmentDialogs.submitting = false
  }
}

const openRejectDialog = (appointment) => {
  appointmentDialogs.selectedAppointment = appointment
  appointmentDialogs.rejectReason = ''
  appointmentDialogs.rejectVisible = true
}

const closeRejectDialog = () => {
  appointmentDialogs.rejectVisible = false
  appointmentDialogs.selectedAppointment = null
  appointmentDialogs.rejectReason = ''
}

const submitRejectAppointment = async () => {
  const appointment = appointmentDialogs.selectedAppointment
  if (!appointment) return

  appointmentDialogs.submitting = true
  try {
    await rejectAppointment({
      appointmentId: appointment.id,
      reason: appointmentDialogs.rejectReason || '无法接待此预约'
    })
    await loadAllAppointments()
    closeRejectDialog()
    alert('预约已拒绝')
  } catch (e) {
    console.error('拒绝预约失败', e)
    alert('拒绝预约失败: ' + (e.response?.data?.message || e.message || '请稍后重试'))
  } finally {
    appointmentDialogs.submitting = false
  }
}

const viewOrder = (appointment) => {
  // Navigate to orders view
  switchView('orders')
}

const goToChatFromOrder = (order) => {
  activeView.value = 'chat'
}

const handleLogout = () => {
  userStore.logout()
  router.replace({ name: 'Auth' })
}

const handleLicenseUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const res = await uploadLawyerLicense(file)
    if (res.success) {
      uploadedFiles.license = file.name
      // 保存上传返回的 OSS 信息
      certificationForm.licenseFile = res.data?.fileUrl || res.data
      certificationForm.ossUrl = res.data?.ossUrl
      certificationForm.ossObject = res.data?.ossObject
      alert('执业证上传成功')
    } else {
      alert('上传失败，请重试')
    }
  } catch (error) {
    console.error('执业证上传失败:', error)
    alert('上传失败，请检查网络连接')
  }
}

const submitCertification = async () => {
  // 验证必填字段
  if (
    !certificationForm.lawFirm ||
    !certificationForm.licenseNo ||
    !certificationForm.licenseType ||
    !certificationForm.province ||
    !certificationForm.city ||
    !certificationForm.issueDate ||
    !certificationForm.expireDate ||
    certificationForm.specialtyJson.length === 0||
    !uploadedFiles.license
  ) {
    alert('请填写所有必填项并上传执业证')
    return
  }

  try {
    const submitData = {
      lawFirm: certificationForm.lawFirm,
      licenseNo: certificationForm.licenseNo,
      licenseType: certificationForm.licenseType,
      province: certificationForm.province,
      city: certificationForm.city,
      specialtyJson: JSON.stringify(certificationForm.specialtyJson),
      // 执业证信息
      issueDate: certificationForm.issueDate,
      expireDate: certificationForm.expireDate,
      licenseFile: certificationForm.licenseFile,
      ossUrl: certificationForm.ossUrl,
      ossObject: certificationForm.ossObject
    }

    const res = await submitLawyerLicense(submitData)
    if (res.success) {
      alert('认证信息已提交，请等待审核')
      certificationStatus.step = 3
      certificationStatus.showWarning = true
    } else {
      alert(res.message || '提交失败，请重试')
    }
  } catch (error) {
    console.error('提交认证信息失败:', error)
    alert('提交失败，请检查网络连接')
  }
}

onMounted(() => {
  switchView('dashboard')
})
</script>



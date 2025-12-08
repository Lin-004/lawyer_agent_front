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
              class="text-gray-600 hover:text-brand-700 px-1 py-4 transition-colors"
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
              class="text-brand-700 border-b-2 border-brand-700 px-1 py-4 transition-colors"
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
      <div class="max-w-5xl mx-auto px-4 py-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- User Info Card -->
          <div class="md:col-span-1">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center relative overflow-hidden">
              <div class="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-brand-500 to-brand-700"></div>
              <div class="relative mt-8 mb-4">
                <img 
                  :src="userAvatar" 
                  class="w-24 h-24 rounded-full border-4 border-white shadow-md mx-auto bg-white"
                >
              </div>
              <h2 class="text-xl font-bold text-gray-900">{{ userName }}</h2>
              <p class="text-gray-500 text-sm mb-6">{{ userRole }}</p>
              
              <div class="grid grid-cols-2 gap-4 mb-6 border-t border-b border-gray-100 py-4">
                <div>
                  <div class="text-xl font-bold text-gray-900">{{ stats.totalConsultations }}</div>
                  <div class="text-xs text-gray-500">全部咨询</div>
                </div>
                <div>
                  <div class="text-xl font-bold text-gray-900">{{ stats.activeConsultations }}</div>
                  <div class="text-xs text-gray-500">进行中</div>
                </div>
                <div>
                  <div class="text-xl font-bold text-gray-900">{{ stats.pendingAppointments }}</div>
                  <div class="text-xs text-gray-500">待确认预约</div>
                </div>
                <div>
                  <div class="text-xl font-bold text-gray-900">{{ stats.finishedAppointments }}</div>
                  <div class="text-xs text-gray-500">已完成预约</div>
                </div>
              </div>

              <div class="space-y-2 text-left">
                <button 
                  @click="switchTab('consultations')"
                  :class="[
                    'flex items-center px-4 py-2 rounded-lg font-medium transition',
                    activeTab === 'consultations' 
                      ? 'bg-brand-50 text-brand-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                  ]"
                >
                  <i class="fa-regular fa-comment-dots w-6"></i> 我的咨询
                </button>
                <button 
                  @click="switchTab('appointments')"
                  :class="[
                    'flex items-center px-4 py-2 rounded-lg transition',
                    activeTab === 'appointments' 
                      ? 'bg-brand-50 text-brand-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                  ]"
                >
                  <i class="fa-regular fa-calendar-check w-6"></i> 预约记录
                </button>
                <button 
                  @click="switchTab('orders')"
                  :class="[
                    'flex items-center px-4 py-2 rounded-lg transition',
                    activeTab === 'orders' 
                      ? 'bg-brand-50 text-brand-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                  ]"
                >
                  <i class="fa-regular fa-heart w-6"></i> 订单管理
                </button>
                <button 
                  @click="switchTab('settings')"
                  :class="[
                    'flex items-center px-4 py-2 rounded-lg transition w-full text-left',
                    activeTab === 'settings' 
                      ? 'bg-brand-50 text-brand-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                  ]"
                >
                  <i class="fa-solid fa-gear w-6"></i> 账号设置
                </button>
                <button
                  class="flex items-center justify-center px-4 py-2 w-full mt-4 text-sm font-medium text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition"
                  @click="handleLogout"
                >
                  <i class="fa-solid fa-arrow-right-from-bracket w-4 mr-2"></i> 退出登录
                </button>
              </div>
            </div>
          </div>

          <!-- Dashboard Content -->
          <div class="md:col-span-2 space-y-6">
            <!-- Active Consultation -->
            <div v-if="activeConsultation" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 class="font-bold text-lg text-gray-800 mb-4 flex items-center">
                <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                进行中的咨询
              </h3>
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 flex justify-between items-center">
                <div class="flex items-center">
                  <img 
                    :src="activeConsultation?.lawyerAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang'" 
                    class="w-12 h-12 rounded-full mr-4"
                  >
                  <div>
                    <div class="font-bold text-gray-900">
                      {{ activeConsultation?.lawyerName }} 
                      <span class="text-xs font-normal text-gray-500">| {{ activeConsultation?.category || '图文咨询' }}</span>
                    </div>
                    <div class="text-sm text-brand-600 mt-1">
                      <i class="fa-solid fa-reply mr-1"></i> 律师接受了咨询
                    </div>
                  </div>
                </div>
                <button 
                  @click="goToChat(activeConsultation)"
                  class="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700"
                >
                  进入咨询
                </button>
              </div>
            </div>

            <!-- Upcoming Appointment -->
            <div v-if="nextAppointment" class="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
              <h3 class="font-bold text-lg text-gray-800 mb-4 flex items-center">
                <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                即将开始的预约
              </h3>
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div class="flex items-center">
                  <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4">
                    <i class="fa-solid fa-calendar-day"></i>
                  </div>
                  <div>
                    <div class="font-bold text-gray-900">{{ nextAppointment?.lawyerName || '律师' }}</div>
                    <div class="text-sm text-gray-500 mt-1">
                      {{ nextAppointment?.scheduleDate }} {{ nextAppointment?.startTime }} - {{ nextAppointment?.endTime }}
                    </div>
                    <div class="text-xs text-gray-400 mt-1">预约状态：{{ getAppointmentStatusText(nextAppointment?.status) }}</div>
                  </div>
                </div>
                <button
                  class="px-4 py-2 bg-blue-50 text-blue-600 text-sm rounded-lg hover:bg-blue-100"
                  @click="switchTab('appointments')"
                >
                  查看预约记录
                </button>
              </div>
            </div>

            <!-- Consultations -->
            <div v-if="activeTab === 'consultations'" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-lg text-gray-800">我的咨询</h3>
                <span class="text-sm text-gray-500">共 {{ orders.length }} 条记录</span>
              </div>
              <div v-if="loadingOrders" class="text-center py-8">
                <i class="fa-solid fa-spinner fa-spin text-2xl text-gray-400"></i>
              </div>
              <div v-else-if="orders.length === 0" class="text-center py-8 text-gray-500">
                暂无咨询记录，去首页找律师聊聊吧～
              </div>
              <div v-else class="space-y-6">
                <div v-if="consultationGroups.inProgress.length">
                  <h4 class="text-sm font-semibold text-gray-600 mb-3">进行中</h4>
                  <div class="space-y-3">
                    <div
                      v-for="order in consultationGroups.inProgress"
                      :key="`inProgress-${order.orderId}`"
                      class="p-4 border border-green-100 rounded-lg hover:bg-green-50/40 transition"
                    >
                      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <div class="font-medium text-gray-900">{{ order.lawyerName || '律师' }}</div>
                          <div class="text-xs text-gray-500 mt-1">
                            创建时间：{{ order.createTime }}
                          </div>
                          <div class="text-xs text-gray-500 mt-1" v-if="order.description">
                            {{ order.description }}
                          </div>
                        </div>
                        <div class="flex items-center gap-2">
                          <span class="px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
                            {{ getStatusText(order.status) }}
                          </span>
                          <button class="text-sm text-brand-600 hover:underline" @click="goToChat(order)">进入会话</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="consultationGroups.pending.length">
                  <h4 class="text-sm font-semibold text-gray-600 mb-3">待支付</h4>
                  <div class="space-y-3">
                    <div
                      v-for="order in consultationGroups.pending"
                      :key="`pending-${order.orderId}`"
                      class="p-4 border border-yellow-100 rounded-lg"
                    >
                      <div class="flex justify-between">
                        <div>
                          <div class="font-medium text-gray-900">{{ order.lawyerName || '律师' }}</div>
                          <div class="text-xs text-gray-500 mt-1">创建时间：{{ order.createTime }}</div>
                        </div>
                        <span class="px-2 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-700">
                          待支付
                        </span>
                      </div>
                      <div class="text-xs text-gray-500 mt-2">
                        金额：¥{{ formatAmount(order.amount) }}
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="consultationGroups.finished.length">
                  <h4 class="text-sm font-semibold text-gray-600 mb-3">已完成</h4>
                  <div class="space-y-3">
                    <div
                      v-for="order in consultationGroups.finished"
                      :key="`finished-${order.orderId}`"
                      class="p-4 border border-gray-100 rounded-lg bg-gray-50"
                    >
                      <div class="flex justify-between items-center">
                        <div>
                          <div class="font-medium text-gray-900">{{ order.lawyerName || '律师' }}</div>
                          <div class="text-xs text-gray-500 mt-1">完成时间：{{ order.createTime }}</div>
                        </div>
                        <span class="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                          已完成
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Orders List -->
            <div v-if="activeTab === 'orders'" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-lg text-gray-800">订单管理</h3>
                <button class="text-sm text-gray-500 hover:text-brand-600" @click="loadOrders">刷新</button>
              </div>
              <div class="flex flex-wrap gap-2 mb-4">
                <button
                  v-for="option in orderFilterOptions"
                  :key="option.label"
                  @click="changeOrderFilter(option.value)"
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium border transition',
                    option.value === currentOrderFilter
                      ? 'bg-brand-50 text-brand-600 border-brand-100'
                      : 'text-gray-500 border-gray-200 hover:text-brand-600'
                  ]"
                >
                  {{ option.label }}
                </button>
              </div>
              <div v-if="loadingOrders" class="text-center py-8">
                <i class="fa-solid fa-spinner fa-spin text-2xl text-gray-400"></i>
              </div>
              <div v-else-if="orders.length === 0" class="text-center py-8 text-gray-500">
                暂无订单记录
              </div>
              <div v-else class="space-y-4">
                <div 
                  v-for="order in orders" 
                  :key="order.orderId"
                  class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 last:border-0"
                >
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">
                      {{ order.description || order.serviceName || '图文咨询' }}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      订单号 #{{ order.orderId }} · {{ order.createTime }}
                    </div>
                    <div class="text-xs text-gray-500 mt-1" v-if="order.lawyerName">
                      服务律师：{{ order.lawyerName }}
                    </div>
                  </div>
                  <div class="flex flex-col items-end gap-2">
                    <div class="text-lg font-bold text-gray-900">¥{{ formatAmount(order.amount) }}</div>
                    <div class="flex items-center gap-2">
                      <div
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        :class="orderStatusClass(order.status)"
                      >
                        {{ getStatusText(order.status) }}
                      </div>
                      <button
                        v-if="Number(order.status) === 0"
                        @click="openPaymentDialog(order)"
                        class="px-3 py-1 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
                      >
                        立即支付
                      </button>
                      <button
                        v-if="Number(order.status) === 1 && !order.hasEvaluation"
                        @click="openEvaluationDialog(order)"
                        class="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        评价
                      </button>
                      <button
                        v-if="Number(order.status) === 1 && order.hasEvaluation"
                        @click="viewEvaluation(order)"
                        class="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
                      >
                        查看评价
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Settings -->
            <div v-if="activeTab === 'settings'" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex justify-between items-center mb-6">
                <h3 class="font-bold text-lg text-gray-800">账号设置</h3>
              </div>
              
              <div v-if="loadingUserInfo" class="text-center py-8">
                <i class="fa-solid fa-spinner fa-spin text-2xl text-gray-400"></i>
              </div>
              
              <div v-else class="space-y-6">
                <!-- User Info Display/Edit -->
                <div class="border-b border-gray-100 pb-6">
                  <h4 class="text-sm font-semibold text-gray-600 mb-4">基本信息</h4>
                  <div class="space-y-4">
                    <div class="flex items-center">
                      <label class="w-24 text-sm text-gray-600">用户名</label>
                      <div class="flex-1 text-sm text-gray-900">{{ currentUserInfo.userName || '--' }}</div>
                    </div>
                    <div class="flex items-center">
                      <label class="w-24 text-sm text-gray-600">手机号</label>
                      <div class="flex-1 text-sm text-gray-900">{{ currentUserInfo.phone || '--' }}</div>
                    </div>
                    <div class="flex items-center">
                      <label class="w-24 text-sm text-gray-600">角色</label>
                      <div class="flex-1 text-sm text-gray-900">{{ getRoleText(currentUserInfo.role) }}</div>
                    </div>
                    <div class="flex items-center">
                      <label class="w-24 text-sm text-gray-600">状态</label>
                      <div class="flex-1">
                        <span :class="[
                          'px-2 py-1 rounded text-xs font-medium',
                          currentUserInfo.status === 1 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        ]">
                          {{ currentUserInfo.status === 1 ? '正常' : '禁用' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Editable Nickname -->
                <div class="border-b border-gray-100 pb-6">
                  <h4 class="text-sm font-semibold text-gray-600 mb-4">可编辑信息</h4>
                  <div class="space-y-4">
                    <div class="flex items-center">
                      <label class="w-24 text-sm text-gray-600">昵称</label>
                      <div class="flex-1 flex items-center gap-3">
                        <input 
                          v-if="isEditingNickname"
                          v-model="editNickname"
                          type="text"
                          placeholder="请输入昵称"
                          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                        <div v-else class="flex-1 text-sm text-gray-900">{{ currentUserInfo.nickname || '--' }}</div>
                        <button 
                          v-if="!isEditingNickname"
                          @click="startEditNickname"
                          class="px-3 py-1 text-sm text-brand-600 hover:bg-brand-50 rounded-lg transition"
                        >
                          编辑
                        </button>
                        <template v-else>
                          <button 
                            @click="saveNickname"
                            :disabled="savingNickname"
                            class="px-3 py-1 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition disabled:opacity-50"
                          >
                            {{ savingNickname ? '保存中...' : '保存' }}
                          </button>
                          <button 
                            @click="cancelEditNickname"
                            :disabled="savingNickname"
                            class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                          >
                            取消
                          </button>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Tips -->
                <div class="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div class="flex items-start">
                    <i class="fa-solid fa-circle-info text-blue-600 mt-0.5 mr-2"></i>
                    <div class="text-sm text-blue-700">
                      <p class="font-medium mb-1">温馨提示</p>
                      <p class="text-xs">目前仅支持修改昵称，如需修改其他信息，请联系客服。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Appointments List -->
            <div v-if="activeTab === 'appointments'" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-lg text-gray-800">预约记录</h3>
                <button class="text-sm text-gray-500 hover:text-brand-600" @click="loadAppointments">刷新</button>
              </div>
              <div v-if="loadingAppointments" class="text-center py-8">
                <i class="fa-solid fa-spinner fa-spin text-2xl text-gray-400"></i>
              </div>
              <div v-else-if="appointments.length === 0" class="text-center py-8 text-gray-500">
                暂无预约记录
              </div>
              <div v-else class="space-y-4">
                <div 
                  v-for="appointment in appointments" 
                  :key="appointment.id"
                  class="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <div class="font-bold text-gray-900">{{ appointment.lawyerName }}</div>
                      <div class="text-sm text-gray-600 mt-1">
                        {{ appointment.scheduleDate }} {{ appointment.startTime }} - {{ appointment.endTime }}
                      </div>
                    </div>
                    <span :class="getStatusBadgeClass(appointment.status)">
                      {{ getAppointmentStatusText(appointment.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Confirmation Dialog -->
    <div
      v-if="paymentDialog.visible"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closePaymentDialog"
    >
      <div class="bg-white rounded-xl shadow-lg max-w-sm w-full mx-4">
        <div class="p-6 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-900">确认支付</h3>
        </div>
        <div class="p-6 space-y-4">
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <span class="text-gray-600">订单号</span>
              <span class="font-medium text-gray-900">#{{ paymentDialog.selectedOrder?.orderId }}</span>
            </div>
            <div class="flex justify-between items-center mb-3">
              <span class="text-gray-600">服务</span>
              <span class="font-medium text-gray-900">{{ paymentDialog.selectedOrder?.description || '图文咨询' }}</span>
            </div>
            <div class="flex justify-between items-center pt-3 border-t border-gray-200">
              <span class="text-gray-600 font-medium">支付金额</span>
              <span class="text-2xl font-bold text-brand-600">¥{{ formatAmount(paymentDialog.selectedOrder?.amount) }}</span>
            </div>
          </div>
          <p class="text-sm text-gray-500">确认支付后，将进入支付页面，请完成支付操作。</p>
        </div>
        <div class="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            @click="closePaymentDialog"
            :disabled="paymentDialog.confirming"
            class="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 font-medium"
          >
            取消
          </button>
          <button
            @click="confirmPayment"
            :disabled="paymentDialog.confirming"
            class="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition disabled:opacity-50 font-medium"
          >
            {{ paymentDialog.confirming ? '支付中...' : '确认支付' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Evaluation Dialog -->
    <div
      v-if="evaluationDialog.visible"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeEvaluationDialog"
    >
      <div class="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
        <div class="p-6 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-900">评价订单</h3>
        </div>
        <div class="p-6 space-y-4">
          <!-- Order Info -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="text-sm text-gray-600 mb-1">订单号</div>
            <div class="font-medium text-gray-900">#{{ evaluationDialog.selectedOrder?.orderId }}</div>
          </div>

          <!-- Star Rating -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">评分</label>
            <div class="flex gap-2">
              <button
                v-for="i in 5"
                :key="i"
                @click="evaluationDialog.score = i"
                class="transition-transform hover:scale-110"
              >
                <i
                  :class="[
                    'fa-star text-2xl',
                    i <= evaluationDialog.score ? 'fa-solid text-yellow-400' : 'fa-regular text-gray-300'
                  ]"
                ></i>
              </button>
            </div>
            <div v-if="evaluationDialog.score > 0" class="text-sm text-gray-500 mt-1">
              {{ getScoreLabel(evaluationDialog.score) }}
            </div>
          </div>

          <!-- Comment -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">评价内容（可选）</label>
            <textarea
              v-model="evaluationDialog.comment"
              placeholder="请输入您的评价意见..."
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            ></textarea>
            <div class="text-xs text-gray-500 mt-1">{{ evaluationDialog.comment.length }}/500</div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            @click="closeEvaluationDialog"
            :disabled="evaluationDialog.submitting"
            class="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 font-medium"
          >
            取消
          </button>
          <button
            @click="submitEvaluation"
            :disabled="evaluationDialog.score === 0 || evaluationDialog.submitting"
            class="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition disabled:opacity-50 font-medium"
          >
            {{ evaluationDialog.submitting ? '提交中...' : '提交评价' }}
          </button>
        </div>
      </div>
    </div>

    <!-- View Evaluation Dialog -->
    <div
      v-if="viewEvaluationDialog.visible"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeViewEvaluationDialog"
    >
      <div class="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
        <div class="p-6 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-900">订单评价</h3>
        </div>
        <div v-if="viewEvaluationDialog.loading" class="p-6 text-center">
          <i class="fa-solid fa-spinner fa-spin text-2xl text-gray-400"></i>
          <p class="text-gray-500 mt-2">加载中...</p>
        </div>
        <div v-else-if="viewEvaluationDialog.evaluation" class="p-6 space-y-4">
          <!-- Order ID -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="text-sm text-gray-600 mb-1">订单号</div>
            <div class="font-medium text-gray-900">#{{ viewEvaluationDialog.selectedOrder?.orderId }}</div>
          </div>

          <!-- Star Rating Display -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">评分</label>
            <div class="flex gap-1">
              <i
                v-for="i in 5"
                :key="i"
                :class="[
                  'fa-star text-2xl',
                  i <= viewEvaluationDialog.evaluation.score 
                    ? 'fa-solid text-yellow-400' 
                    : 'fa-regular text-gray-300'
                ]"
              ></i>
            </div>
            <div class="text-sm text-gray-600 mt-2 font-medium">
              {{ getScoreLabel(viewEvaluationDialog.evaluation.score) }}
            </div>
          </div>

          <!-- Comment Display -->
          <div v-if="viewEvaluationDialog.evaluation.comment">
            <label class="block text-sm font-medium text-gray-700 mb-2">评价内容</label>
            <div class="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap break-words">
              {{ viewEvaluationDialog.evaluation.comment }}
            </div>
          </div>

          <!-- Evaluation Time and User -->
          <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">评价人</span>
              <span class="font-medium text-gray-900">{{ viewEvaluationDialog.evaluation.userNickname || '用户' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">评价时间</span>
              <span class="font-medium text-gray-900">{{ formatDateTime(viewEvaluationDialog.evaluation.createTime) }}</span>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-100">
          <button
            @click="closeViewEvaluationDialog"
            class="w-full px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition font-medium"
          >
            关闭
          </button>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import { useUserStore } from '@/stores/user'
import { getUserOrders, payOrder, createEvaluation, getOrderEvaluation } from '@/api/order'
import { getAppointmentList } from '@/api/appointment'
import { getUserInfo, updateProfile } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('orders')
const orders = ref([])
const orderFilterOptions = [
  { label: '全部订单', value: undefined },
  { label: '待支付', value: 0 },
  { label: '已支付', value: 1 },
  { label: '已取消', value: 2 }
]
const currentOrderFilter = ref(orderFilterOptions[0].value)
const orderPagination = reactive({
  page: 1,
  size: 10,
  total: 0
})
const appointments = ref([])
const loadingOrders = ref(false)
const loadingAppointments = ref(false)
const dataInitialized = ref(false)
const loadingUserInfo = ref(false)
const currentUserInfo = ref({})
const isEditingNickname = ref(false)
const editNickname = ref('')
const savingNickname = ref(false)
const paymentDialog = reactive({
  visible: false,
  selectedOrder: null,
  confirming: false
})

const evaluationDialog = reactive({
  visible: false,
  selectedOrder: null,
  score: 0,
  comment: '',
  submitting: false
})

const viewEvaluationDialog = reactive({
  visible: false,
  selectedOrder: null,
  evaluation: null,
  loading: false
})

const userName = computed(() => userStore.userInfo?.nickname || '王小明')
const userAvatar = computed(() => 
  userStore.userInfo?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User123'
)
const userRole = computed(() => {
  const role = userStore.userInfo?.role
  return role === 'user' ? '普通会员' : role === 'lawyer' ? '律师' : '管理员'
})
const isLoggedIn = computed(() => !!userStore.token)

const stats = computed(() => ({
  totalConsultations: orderPagination.total || orders.value.length,
  activeConsultations: orders.value.filter(o => Number(o.status) === 1).length,
  pendingAppointments: appointments.value.filter(item => Number(item.status) === 1).length,
  finishedAppointments: appointments.value.filter(item => Number(item.status) === 3).length
}))

const activeConsultation = computed(() => orders.value.find(order => Number(order.status) === 1) || null)

const nextAppointment = computed(() => {
  const now = Date.now()
  const sortable = appointments.value
    .filter(item => [1, 2].includes(Number(item.status)))
    .map(item => ({
      ...item,
      _timestamp: toTimestamp(item.scheduleDate, item.startTime)
    }))
    .filter(item => item._timestamp > now)
    .sort((a, b) => a._timestamp - b._timestamp)

  return sortable[0] || null
})

const consultationGroups = computed(() => ({
  inProgress: orders.value.filter(order => Number(order.status) === 1),
  pending: orders.value.filter(order => Number(order.status) === 0),
  finished: orders.value.filter(order => Number(order.status) === 3)
}))

const switchTab = (tab) => {
  activeTab.value = tab
  if ((tab === 'orders' || tab === 'consultations') && !orders.value.length) {
    loadOrders()
  }
  if (tab === 'appointments' && !appointments.value.length) {
    loadAppointments()
  }
  if (tab === 'settings' && !currentUserInfo.value.id) {
    loadUserInfo()
  }
}

const loadOrders = async () => {
  if (!userStore.userId) return

  loadingOrders.value = true
  try {
    const params = {
      page: orderPagination.page,
      size: orderPagination.size
    }
    if (currentOrderFilter.value !== undefined) {
      params.status = currentOrderFilter.value
    }
    const res = await getUserOrders(params)
    const payload = res?.data || res
    const records = Array.isArray(payload?.records) ? payload.records : payload?.records ?? payload
    orders.value = Array.isArray(records) ? records : []
    orderPagination.total = Number(payload?.total) || orders.value.length
    dataInitialized.value = true
    
    // 为每个已支付订单检查是否有评价
    for (const order of orders.value) {
      if (Number(order.status) === 1) {
        const orderId = order.orderId || order.id
        if (orderId) {
          try {
            const evalRes = await getOrderEvaluation(orderId)
            const evalData = evalRes?.data || evalRes
            order.hasEvaluation = evalData?.evaluated === true
          } catch (err) {
            // 如果查询失败，保持现有状态
            console.warn(`查询订单 ${orderId} 的评价状态失败:`, err)
            order.hasEvaluation = order.hasEvaluation || false
          }
        }
      }
    }
  } catch (error) {
    console.error('加载订单失败:', error)
  } finally {
    loadingOrders.value = false
  }
}

const loadAppointments = async () => {
  if (!userStore.userId) return

  loadingAppointments.value = true
  try {
    const res = await getAppointmentList({
      userId: userStore.userId
    })
    if (res.success && res.data) {
      appointments.value = res.data || []
    }
  } catch (error) {
    console.error('加载预约记录失败:', error)
  } finally {
    loadingAppointments.value = false
  }
}

const changeOrderFilter = (status) => {
  if (currentOrderFilter.value === status && dataInitialized.value) return
  currentOrderFilter.value = status
  loadOrders()
}

const getStatusText = (status) => {
  const statusMap = {
    0: '未支付',
    1: '已支付',
    2: '已取消'
  }
  return statusMap[status] || '未知'
}

const getAppointmentStatusText = (status) => {
  const statusMap = {
    1: '待确认',
    2: '已确认',
    3: '已完成',
    4: '已取消',
    5: '已拒绝'
  }
  return statusMap[status] || '未知'
}

const getStatusBadgeClass = (status) => {
  const classMap = {
    1: 'bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium',
    2: 'bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium',
    3: 'bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium',
    4: 'bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium',
    5: 'bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium'
  }
  return classMap[status] || 'bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium'
}

const orderStatusClass = (status) => {
  const map = {
    0: 'bg-yellow-50 text-yellow-700',
    1: 'bg-green-50 text-green-700',
    2: 'bg-gray-100 text-gray-600',
    3: 'bg-blue-50 text-blue-700'
  }
  return map[status] || 'bg-gray-100 text-gray-600'
}

const formatAmount = (amount) => {
  const val = Number(amount)
  return Number.isFinite(val) ? val.toFixed(2) : '--'
}

const goToChat = (consultation) => {
  router.push({ name: 'Home', query: { chatId: consultation?.chatId } })
}

const toTimestamp = (dateStr, timeStr) => {
  if (!dateStr) return Number.MAX_SAFE_INTEGER
  const safeTime = (timeStr || '00:00:00').replace(' ', '')
  return new Date(`${dateStr}T${safeTime}`).getTime()
}

const refreshProfileData = () => {
  loadOrders()
  loadAppointments()
}

const loadUserInfo = async () => {
  if (!userStore.userId) return

  loadingUserInfo.value = true
  try {
    const res = await getUserInfo(userStore.userId)
    const userData = res?.data || res
    currentUserInfo.value = userData || {}
  } catch (error) {
    console.error('加载用户信息失败:', error)
  } finally {
    loadingUserInfo.value = false
  }
}

const startEditNickname = () => {
  editNickname.value = currentUserInfo.value.nickname || ''
  isEditingNickname.value = true
}

const cancelEditNickname = () => {
  isEditingNickname.value = false
  editNickname.value = ''
}

const saveNickname = async () => {
  if (savingNickname.value) return

  savingNickname.value = true
  try {
    const res = await updateProfile({ nickname: editNickname.value })
    if (res?.success || res?.code === '00000') {
      currentUserInfo.value.nickname = editNickname.value
      // 更新 store 中的用户信息
      if (userStore.userInfo) {
        userStore.userInfo.nickname = editNickname.value
      }
      isEditingNickname.value = false
      alert('昵称修改成功')
    } else {
      alert(res?.message || '修改失败')
    }
  } catch (error) {
    console.error('修改昵称失败:', error)
    alert('修改失败，请稍后重试')
  } finally {
    savingNickname.value = false
  }
}

const getRoleText = (role) => {
  const roleMap = {
    user: '普通用户',
    lawyer: '律师',
    admin: '管理员'
  }
  return roleMap[role] || '--'
}

const handleLogout = () => {
  userStore.logout()
  router.replace({ name: 'Auth' })
}

const openPaymentDialog = (order) => {
  paymentDialog.selectedOrder = order
  paymentDialog.visible = true
  paymentDialog.confirming = false
}

const closePaymentDialog = () => {
  paymentDialog.visible = false
  paymentDialog.selectedOrder = null
  paymentDialog.confirming = false
}

const confirmPayment = async () => {
  if (paymentDialog.confirming) return
  if (!paymentDialog.selectedOrder) return

  const orderId = paymentDialog.selectedOrder.orderId || paymentDialog.selectedOrder.id
  if (!orderId) {
    alert('未找到订单编号，无法支付')
    return
  }

  paymentDialog.confirming = true
  try {
    const res = await payOrder(orderId)
    if (res?.success || res?.code === '00000') {
      alert('支付成功！订单已更新，请稍候...')
      closePaymentDialog()
      await loadOrders()
    } else {
      alert(res?.message || '支付失败，请稍后重试')
    }
  } catch (error) {
    console.error('支付失败:', error)
    alert('支付失败，请稍后重试')
  } finally {
    paymentDialog.confirming = false
  }
}

const openEvaluationDialog = (order) => {
  evaluationDialog.selectedOrder = order
  evaluationDialog.score = 0
  evaluationDialog.comment = ''
  evaluationDialog.submitting = false
  evaluationDialog.visible = true
}

const closeEvaluationDialog = () => {
  evaluationDialog.visible = false
  evaluationDialog.selectedOrder = null
  evaluationDialog.score = 0
  evaluationDialog.comment = ''
  evaluationDialog.submitting = false
}

const getScoreLabel = (score) => {
  const labels = {
    1: '不满意',
    2: '一般',
    3: '满意',
    4: '很满意',
    5: '非常满意'
  }
  return labels[score] || ''
}

const submitEvaluation = async () => {
  if (evaluationDialog.submitting) return
  if (!evaluationDialog.selectedOrder) return
  if (evaluationDialog.score === 0) {
    alert('请选择评分')
    return
  }

  const orderId = evaluationDialog.selectedOrder.orderId || evaluationDialog.selectedOrder.id
  if (!orderId) {
    alert('未找到订单编号，无法评价')
    return
  }

  evaluationDialog.submitting = true
  try {
    const res = await createEvaluation({
      orderId: orderId,
      score: evaluationDialog.score,
      comment: evaluationDialog.comment.trim()
    })

    if (res?.success || res?.code === '00000') {
      alert('评价提交成功，感谢您的评价！')
      closeEvaluationDialog()
      
      // 方案A：直接调用评价接口验证
      try {
        const evalRes = await getOrderEvaluation(orderId)
        const evalData = evalRes?.data || evalRes
        
        if (evalData && evalData.evaluated) {
          // 找到对应的订单，标记为已评价
          const order = orders.value.find(o => (o.orderId || o.id) === orderId)
          if (order) {
            order.hasEvaluation = true
          }
        }
      } catch (evalError) {
        console.error('验证评价状态失败:', evalError)
        // 即使验证失败，也重新加载一次订单列表作为后备方案
        await loadOrders()
      }
    } else {
      alert(res?.message || '评价提交失败，请稍后重试')
    }
  } catch (error) {
    console.error('评价提交失败:', error)
    alert('评价提交失败，请稍后重试')
  } finally {
    evaluationDialog.submitting = false
  }
}

const viewEvaluation = async (order) => {
  const orderId = order.orderId || order.id
  if (!orderId) {
    alert('未找到订单编号')
    return
  }

  viewEvaluationDialog.selectedOrder = order
  viewEvaluationDialog.evaluation = null
  viewEvaluationDialog.loading = true
  viewEvaluationDialog.visible = true

  try {
    const res = await getOrderEvaluation(orderId)
    const data = res?.data || res
    
    if (data && data.evaluated) {
      viewEvaluationDialog.evaluation = data
    } else {
      alert('暂无评价信息')
      closeViewEvaluationDialog()
    }
  } catch (error) {
    console.error('加载评价失败:', error)
    alert('加载评价失败，请稍后重试')
    closeViewEvaluationDialog()
  } finally {
    viewEvaluationDialog.loading = false
  }
}

const closeViewEvaluationDialog = () => {
  viewEvaluationDialog.visible = false
  viewEvaluationDialog.selectedOrder = null
  viewEvaluationDialog.evaluation = null
  viewEvaluationDialog.loading = false
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '--'
  try {
    const date = new Date(dateTime)
    return date.toLocaleString('zh-CN', {
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

watch(
  () => userStore.userId,
  (id) => {
    if (id) {
      refreshProfileData()
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (userStore.userId) {
    refreshProfileData()
  }
})
</script>


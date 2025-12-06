<template>
  <div class="bg-gray-100 min-h-screen flex">
    <!-- 确认对话框 -->
    <teleport to="body" v-if="confirmDialog.show">
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6 animate-in">
          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ confirmDialog.title }}</h3>
          <p class="text-gray-600 text-sm mb-6">{{ confirmDialog.message }}</p>
          <div class="flex gap-3 justify-end">
            <button
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              @click="confirmDialog.show = false"
              :disabled="confirmDialog.loading"
            >
              {{ confirmDialog.cancelText }}
            </button>
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
              @click="confirmDialog.action && confirmDialog.action()"
              :disabled="confirmDialog.loading"
            >
              {{ confirmDialog.loading ? '处理中...' : confirmDialog.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 知识库上传模态框 -->
    <teleport to="body" v-if="uploadModal.show">
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900">上传知识库文档</h3>
            <button
              class="text-gray-400 hover:text-gray-600"
              @click="uploadModal.show = false"
              :disabled="uploadModal.uploading"
            >
              <i class="fa-solid fa-times text-xl"></i>
            </button>
          </div>

          <!-- Upload Area -->
          <div
            class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
            @click="$refs.fileInput?.click()"
            @drop.prevent="handleFileDrop"
            @dragover.prevent="uploadModal.dragActive = true"
            @dragleave.prevent="uploadModal.dragActive = false"
            :class="uploadModal.dragActive ? 'border-blue-500 bg-blue-50' : ''"
          >
            <i class="fa-solid fa-cloud-arrow-up text-3xl text-gray-400 mb-2"></i>
            <p class="text-gray-600 font-medium">拖拽文件到此或点击选择</p>
            <p class="text-xs text-gray-500 mt-1">支持 PDF、Word、TXT 等文档格式</p>
            <input
              ref="fileInput"
              type="file"
              multiple
              class="hidden"
              @change="handleFileSelect"
              accept=".pdf,.doc,.docx,.txt,.md"
            />
          </div>

          <!-- File List -->
          <div v-if="uploadModal.files.length > 0" class="mt-4 space-y-2">
            <p class="text-xs font-medium text-gray-600">待上传文件：</p>
            <div
              v-for="(file, index) in uploadModal.files"
              :key="index"
              class="flex items-center justify-between bg-gray-50 p-2 rounded text-xs"
            >
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <i class="fa-solid fa-file text-gray-400 flex-shrink-0"></i>
                <span class="text-gray-700 truncate">{{ file.name }}</span>
                <span class="text-gray-500 flex-shrink-0">({{ (file.size / 1024).toFixed(0) }}KB)</span>
              </div>
              <button
                class="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                @click="uploadModal.files.splice(index, 1)"
                :disabled="uploadModal.uploading"
              >
                <i class="fa-solid fa-trash-alt text-sm"></i>
              </button>
            </div>
          </div>

          <!-- Progress -->
          <div v-if="uploadModal.uploading" class="mt-4">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-medium text-gray-600">上传中...</p>
              <p class="text-xs text-gray-500">{{ uploadModal.progress }}%</p>
            </div>
            <div class="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                class="bg-blue-600 h-full transition-all"
                :style="{ width: uploadModal.progress + '%' }"
              ></div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="mt-6 flex gap-3 justify-end">
            <button
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              @click="uploadModal.show = false"
              :disabled="uploadModal.uploading"
            >
              关闭
            </button>
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
              @click="handleUpload"
              :disabled="uploadModal.files.length === 0 || uploadModal.uploading"
            >
              {{ uploadModal.uploading ? '上传中...' : '开始上传' }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 律师详情模态框 -->
    <teleport to="body" v-if="licenseDetailModal.show">
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900">律师资质认证详情</h3>
            <button
              class="text-gray-400 hover:text-gray-600"
              @click="licenseDetailModal.show = false"
            >
              <i class="fa-solid fa-times text-xl"></i>
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-6" v-if="licenseDetailModal.data">
            <!-- 基本信息 -->
            <section>
              <h4 class="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">基本信息</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p class="text-xs text-gray-500 mb-1">律师姓名</p>
                  <p class="text-sm font-medium text-gray-900">{{ licenseDetailModal.data.lawyerName || '未提供' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">联系电话</p>
                  <p class="text-sm font-medium text-gray-900">{{ licenseDetailModal.data.phone || '未提供' }}</p>
                </div>
              </div>
            </section>

            <hr class="border-gray-100" />

            <!-- 执业信息 -->
            <section>
              <h4 class="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">执业信息</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p class="text-xs text-gray-500 mb-1">所属律师事务所</p>
                  <p class="text-sm font-medium text-gray-900">{{ licenseDetailModal.data.lawFirm || '未提供' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">律师执业证号</p>
                  <p class="text-sm font-mono text-gray-900">{{ licenseDetailModal.data.licenseNo || '未提供' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">执业证类型</p>
                  <p class="text-sm font-medium text-gray-900">{{ licenseDetailModal.data.licenseType || '未提供' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">发证日期</p>
                  <p class="text-sm font-medium text-gray-900">{{ licenseDetailModal.data.issueDate || '未提供' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">到期日期</p>
                  <p class="text-sm font-medium text-gray-900">{{ licenseDetailModal.data.expireDate || '未提供' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">常驻地区</p>
                  <p class="text-sm font-medium text-gray-900">
                    {{ licenseDetailModal.data.province }}{{ licenseDetailModal.data.city }}
                  </p>
                </div>
              </div>
            </section>

            <hr class="border-gray-100" />

            <!-- 擅长领域 -->
            <section>
              <h4 class="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">擅长领域</h4>
              <div class="flex flex-wrap gap-2">
                <span v-if="(licenseDetailModal.data.specialties || []).length === 0" class="text-xs text-gray-400">未提供</span>
                <span
                  v-for="specialty in licenseDetailModal.data.specialties"
                  :key="specialty"
                  class="bg-blue-50 text-blue-600 px-3 py-1 rounded text-xs font-medium"
                >
                  {{ specialty }}
                </span>
              </div>
            </section>

            <hr class="border-gray-100" />

            <!-- 证件照片 -->
            <section v-if="licenseDetailModal.data.ossUrl">
              <h4 class="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">证件照片</h4>
              <div class="flex items-start gap-4">
                <a :href="licenseDetailModal.data.ossUrl" target="_blank" rel="noreferrer" class="text-sm text-blue-600 underline">打开/下载图片</a>
                <img :src="licenseDetailModal.data.ossUrl" alt="执业证照片" class="w-40 h-auto rounded border" />
              </div>
            </section>

            <hr class="border-gray-100" />

            <!-- 提交时间和状态 -->
            <section>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p class="text-xs text-gray-500 mb-1">申请时间</p>
                  <p class="text-sm font-medium text-gray-900">{{ formatDate(licenseDetailModal.data.applicationTime) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">审核状态</p>
                  <span :class="['px-2 py-1 rounded text-xs font-medium', statusBadge(licenseDetailModal.data.status)]">
                    {{ licenseDetailModal.data.status || '未知' }}
                  </span>
                </div>
              </div>
            </section>
          </div>

          <!-- Footer -->
          <div class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
            <button
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              @click="licenseDetailModal.show = false"
            >
              关闭
            </button>
            <button
              v-if="licenseDetailModal.data?.status === '待审核'"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
              @click="handleApprove(licenseDetailModal.data)"
            >
              通过审核
            </button>
            <button
              v-if="licenseDetailModal.data?.status === '待审核'"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
              @click="handleReject(licenseDetailModal.data)"
            >
              驳回审核
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Sidebar -->
    <aside
      class="w-64 bg-slate-900 text-slate-200 flex-shrink-0 flex flex-col transition-transform duration-300 absolute md:relative min-h-screen"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    >
      <div class="h-16 flex items-center px-6 bg-slate-950 shadow-md">
        <i class="fa-solid fa-gavel text-blue-500 text-xl mr-3"></i>
        <span class="font-bold text-lg tracking-wide">法信 Admin</span>
      </div>

      <nav class="flex-1 py-6 overflow-y-auto space-y-1">
        <p class="px-6 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">数据中心</p>
        <button
          v-for="item in navItems"
          :key="item.id"
          class="sidebar-link w-full flex items-center px-6 py-3 text-left hover:bg-slate-800 hover:text-white transition-colors"
          :class="[
            activeView === item.id ? 'bg-slate-800 text-white border-l-4 border-blue-400' : 'border-l-4 border-transparent'
          ]"
          @click="switchView(item.id)"
        >
          <i :class="[item.icon, 'w-6']"></i>
          <span class="font-medium ml-2">{{ item.label }}</span>
          <span
            v-if="item.id === 'lawyers' && stats.pendingLicenses"
            class="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full"
          >
            {{ stats.pendingLicenses }}
          </span>
        </button>
      </nav>

      <div class="p-4 bg-slate-950">
        <button class="w-full" @click="showLogoutMenu = !showLogoutMenu">
          <div class="flex items-center hover:bg-slate-800 p-2 rounded transition">
            <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <div class="ml-3 text-left flex-1">
              <p class="text-sm font-bold text-white">Super Admin</p>
              <span class="text-xs text-slate-500">平台管理后台</span>
            </div>
            <i class="fa-solid fa-chevron-down text-slate-400 text-xs" :class="showLogoutMenu ? 'rotate-180' : ''"></i>
          </div>
        </button>
        <div v-if="showLogoutMenu" class="mt-2 pt-2 border-t border-slate-700 space-y-1">
          <button
            class="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded transition flex items-center"
            @click="handleLogout"
          >
            <i class="fa-solid fa-sign-out-alt mr-2"></i> 退出登录
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shadow-sm">
        <div class="flex items-center space-x-4">
          <button class="md:hidden text-gray-600 focus:outline-none" @click="toggleSidebar">
            <i class="fa-solid fa-bars text-xl"></i>
          </button>
          <h1 class="text-xl font-bold text-slate-800">{{ currentTitle }}</h1>
        </div>
        <div class="flex items-center space-x-4">
          <div class="relative hidden md:block">
            <input
              v-model.trim="globalSearch"
              type="text"
              placeholder="全局搜索..."
              class="pl-9 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 w-48"
              @keyup.enter="handleGlobalSearch"
            />
            <i class="fa-solid fa-search absolute left-3 top-2.5 text-gray-400 text-sm"></i>
          </div>
          <button class="relative text-gray-500 hover:text-blue-600">
            <i class="fa-regular fa-bell text-xl"></i>
            <span class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
        <!-- Dashboard -->
        <section v-show="activeView === 'dashboard'" class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div
              v-for="card in dashboardCards"
              :key="card.label"
              class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between"
            >
              <div class="flex justify-between items-start">
                <div>
                  <p class="text-sm font-medium text-gray-500">{{ card.label }}</p>
                  <h3 class="text-2xl font-bold text-slate-800 mt-1">{{ card.value }}</h3>
                </div>
                <span :class="['text-xs px-2 py-1 rounded-full', card.tagClass]">{{ card.tag }}</span>
              </div>
              <div class="mt-4 w-full bg-gray-100 h-1.5 rounded-full">
                <div class="h-1.5 rounded-full" :class="card.barClass" :style="{ width: card.progress }"></div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-slate-800">律师审核动态</h3>
                <button class="text-sm text-blue-600 hover:underline" @click="switchView('lawyers')">查看全部</button>
              </div>
              <div v-if="dashboardLoading" class="text-center py-10 text-gray-400 text-sm">
                <i class="fa-solid fa-spinner fa-spin mr-2"></i>加载中...
              </div>
              <div v-else-if="dashboardData.pendingLicenses.length === 0" class="text-center py-10 text-gray-400 text-sm">
                暂无待审核的律师执业证
              </div>
              <div v-else class="divide-y divide-gray-100">
                <div
                  v-for="license in dashboardData.pendingLicenses"
                  :key="license.id"
                  class="py-4 flex items-center justify-between"
                >
                  <div>
                    <p class="font-semibold text-gray-900">{{ license.lawyerName || '律师' }}</p>
                    <p class="text-xs text-gray-500 mt-1">执业证号：{{ license.licenseNo || '未提供' }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-xs text-gray-400">申请时间</p>
                    <p class="text-sm text-gray-700">{{ formatDate(license.applicationTime) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 class="text-lg font-bold text-slate-800 mb-4">知识库概览</h3>
              <p class="text-3xl font-bold text-slate-900">{{ stats.knowledgeArticles }}</p>
              <p class="text-sm text-gray-500 mt-1">篇文章已发布</p>
              <ul class="mt-6 space-y-3 text-sm text-gray-600">
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> 支持管理员快速审核更新
                </li>
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span> 结合向量检索提供答案
                </li>
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-amber-500 rounded-full mr-2"></span> 支持批量上传与切分
                </li>
              </ul>
              <button
                class="mt-6 w-full py-2 text-sm font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                @click="switchView('content')"
              >
                管理知识库
              </button>
            </div>
          </div>
        </section>

        <!-- Users -->
        <section v-show="activeView === 'users'" class="space-y-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 class="text-lg font-bold text-slate-800">用户列表</h3>
                <p class="text-xs text-gray-500">支持按角色、关键字筛选</p>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="role in userRoleFilters"
                  :key="role.value ?? 'all'"
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium border transition',
                    userTable.filters.role === role.value
                      ? 'bg-blue-50 text-blue-600 border-blue-200'
                      : 'text-gray-500 border-gray-200 hover:text-blue-600'
                  ]"
                  @click="setUserRole(role.value)"
                >
                  {{ role.label }}
                </button>
              </div>
            </div>

            <div class="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div class="relative flex-1">
                <input
                  v-model="userTable.filters.keyword"
                  type="text"
                  placeholder="搜索昵称 / 手机号 / 账号..."
                  class="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                  @keyup.enter="searchUsers"
                />
                <i class="fa-solid fa-search absolute left-3 top-2.5 text-gray-400"></i>
              </div>
              <button
                class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                @click="searchUsers"
              >
                搜索
              </button>
            </div>

            <div v-if="userTable.loading" class="text-center py-10 text-gray-400 text-sm">
              <i class="fa-solid fa-spinner fa-spin mr-2"></i>加载中...
            </div>
            <div v-else-if="userTable.rows.length === 0" class="text-center py-10 text-gray-500 text-sm">
              暂无数据
            </div>
            <div v-else class="overflow-x-auto mt-6">
              <table class="min-w-full text-left text-sm">
                <thead class="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th class="px-4 py-3">I  D</th>
                    <th class="px-4 py-3">昵称</th>
                    <th class="px-4 py-3">账号</th>
                    <th class="px-4 py-3">角色</th>
                    <th class="px-4 py-3">状态</th>
                    <th class="px-4 py-3">更新时间</th>
                    <th class="px-4 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="user in userTable.rows" :key="user.userName" class="hover:bg-gray-50 transition">
                    <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ user.id }}</td>
                    <td class="px-4 py-3">
                      <div class="font-semibold text-gray-900">{{ user.nickname || '未设置' }}</div>
                      <div class="text-xs text-gray-400">{{ user.phone || '--' }}</div>
                    </td>
                    <td class="px-4 py-3 font-mono text-sm text-gray-600">{{ user.userName || '--' }}</td>
                    <td class="px-4 py-3 capitalize text-gray-700">{{ roleText(user.role) }}</td>
                    <td class="px-4 py-3">
                      <span :class="['px-2 py-1 rounded text-xs font-medium', user.status === 1 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600']">
                        {{ user.status === 1 ? '正常' : '禁用' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-gray-500">{{ formatDate(user.updateTime) }}</td>
                    <td class="px-4 py-3 text-right space-x-2">
                      <button
                        v-if="user.status === 1"
                        class="text-red-600 bg-red-50 px-3 py-1 rounded hover:bg-red-100 transition text-xs font-medium"
                        @click="handleDisableUser(user)"
                      >
                        禁用
                      </button>
                      <button
                        v-else
                        class="text-green-600 bg-green-50 px-3 py-1 rounded hover:bg-green-100 transition text-xs font-medium"
                        @click="handleEnableUser(user)"
                      >
                        启用
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="mt-4 flex items-center justify-between text-xs text-gray-500">
              <span>共 {{ userTable.total }} 条记录</span>
              <div class="space-x-2">
                <button class="px-3 py-1 border rounded" :disabled="userTable.filters.pageNum === 1" @click="changeUserPage(-1)">
                  上一页
                </button>
                <button
                  class="px-3 py-1 border rounded"
                  :disabled="userTable.filters.pageNum * userTable.filters.pageSize >= userTable.total"
                  @click="changeUserPage(1)"
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Lawyer Review -->
        <section v-show="activeView === 'lawyers'" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 class="text-lg font-bold text-slate-800">律师执业证审核</h3>
              <p class="text-xs text-gray-500">支持切换审核状态进行批量处理</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="status in licenseStatusFilters"
                :key="status.value"
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium border transition',
                  lawyerReview.query.status === status.value
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'text-gray-500 border-gray-200 hover:text-blue-600'
                ]"
                @click="setLicenseStatus(status.value)"
              >
                {{ status.label }}
              </button>
            </div>
          </div>

          <div v-if="lawyerReview.loading" class="text-center py-10 text-gray-400 text-sm">
            <i class="fa-solid fa-spinner fa-spin mr-2"></i>加载中...
          </div>
          <div v-else-if="lawyerReview.rows.length === 0" class="text-center py-10 text-gray-500 text-sm">
            暂无记录
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full text-left text-sm">
              <thead class="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th class="px-4 py-3">律师信息</th>
                  <th class="px-4 py-3">执业证号</th>
                  <th class="px-4 py-3">申请时间</th>
                  <th class="px-4 py-3">状态</th>
                  <th class="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="license in lawyerReview.rows" :key="license.id" class="hover:bg-gray-50 transition">
                  <td class="px-4 py-3">
                    <div class="font-semibold text-gray-900">{{ license.lawyerName || '律师' }}</div>
                    <div class="text-xs text-gray-500 mt-1">{{ license.id ? `ID: ${license.id}` : '未关联用户' }}</div>
                  </td>
                  <td class="px-4 py-3 font-mono text-sm text-gray-600">{{ license.licenseNo || '--' }}</td>
                  <td class="px-4 py-3 text-gray-500">{{ formatDate(license.applicationTime) }}</td>
                  <td class="px-4 py-3">
                    <span :class="['px-2 py-1 rounded text-xs font-medium', statusBadge(license.status)]">
                      {{ license.status || '未知' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right space-x-2">
                    <button
                      class="text-blue-600 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition text-xs font-medium"
                      @click="handleViewLicenseDetail(license)"
                    >
                      查看详情
                    </button>
                    <button
                      v-if="license.status === '待审核'"
                      class="text-green-600 bg-green-50 px-3 py-1 rounded hover:bg-green-100 transition text-xs font-medium"
                      @click="handleApprove(license)"
                    >
                      通过
                    </button>
                    <button
                      v-if="license.status === '待审核'"
                      class="text-red-600 bg-red-50 px-3 py-1 rounded hover:bg-red-100 transition text-xs font-medium"
                      @click="handleReject(license)"
                    >
                      驳回
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span>共 {{ lawyerReview.total }} 条记录</span>
            <div class="space-x-2">
              <button class="px-3 py-1 border rounded" :disabled="lawyerReview.query.page === 1" @click="changeLicensePage(-1)">
                上一页
              </button>
              <button
                class="px-3 py-1 border rounded"
                :disabled="lawyerReview.query.page * lawyerReview.query.pageSize >= lawyerReview.total"
                @click="changeLicensePage(1)"
              >
                下一页
              </button>
            </div>
          </div>
        </section>

        <!-- Knowledge Content -->
        <section v-show="activeView === 'content'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 class="font-bold text-slate-800">知识库文档</h3>
              <span class="text-xs text-gray-400">共 {{ knowledgeState.items.length }} 篇</span>
            </div>
            <div v-if="knowledgeState.loading" class="text-center py-10 text-gray-400 text-sm">
              <i class="fa-solid fa-spinner fa-spin mr-2"></i>加载中...
            </div>
            <div v-else-if="knowledgeState.items.length === 0" class="text-center py-10 text-gray-500 text-sm">
              暂无文档
            </div>
            <div v-else class="divide-y divide-gray-100">
              <div
                v-for="article in knowledgeState.items"
                :key="article.id || article.fileName"
                class="p-6 hover:bg-gray-50 transition"
              >
                <div class="flex justify-between gap-4 mb-3">
                  <div class="flex-1">
                    <p class="font-bold text-gray-900">{{ article.title || article.fileName }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ article.summary || '暂无摘要' }}</p>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <span
                      :class="[
                        'text-xs font-medium px-2 py-1 rounded inline-block',
                        article.status === 'active'
                          ? 'bg-green-50 text-green-700'
                          : article.status === 'disabled'
                            ? 'bg-gray-50 text-gray-600'
                            : 'bg-yellow-50 text-yellow-700'
                      ]"
                    >
                      {{ getKnowledgeStatusLabel(article.status) }}
                    </span>
                  </div>
                </div>
                <div class="text-xs text-gray-400 mb-3">
                  <p>{{ article.source || '知识库' }} · {{ formatDate(article.uploadTime || article.createTime) }}</p>
                </div>
                <div class="flex gap-2">
                  <button
                    v-if="article.status !== 'active'"
                    class="text-green-600 bg-green-50 px-3 py-1 rounded hover:bg-green-100 transition text-xs font-medium"
                    @click="handlePublishKnowledge(article)"
                  >
                    发布
                  </button>
                  <button
                    v-if="article.status === 'active'"
                    class="text-amber-600 bg-amber-50 px-3 py-1 rounded hover:bg-amber-100 transition text-xs font-medium"
                    @click="handleDisableKnowledge(article)"
                  >
                    禁用
                  </button>
                  <button
                    class="text-red-600 bg-red-50 px-3 py-1 rounded hover:bg-red-100 transition text-xs font-medium"
                    @click="handleDeleteKnowledge(article)"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-bold text-slate-800 mb-4">快速发布</h3>
            <p class="text-sm text-gray-500 mb-4">前端示例模块，接入富文本前可提示管理员在后端上传文件。</p>
            <ul class="space-y-3 text-sm text-gray-600">
              <li class="flex items-center">
                <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> 支持文档上传 `/knowledge/upload`
              </li>
              <li class="flex items-center">
                <span class="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span> 上传后可在知识库列表查看
              </li>
              <li class="flex items-center">
                <span class="w-2 h-2 bg-amber-500 rounded-full mr-2"></span> 建议同步执行文本切分接口
              </li>
            </ul>
            <button class="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg text-sm shadow hover:bg-blue-700" @click="openUploadModal">
              前往上传
            </button>
          </div>
        </section>

        <!-- Settings -->
        <section v-show="activeView === 'settings'" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">
          <div>
            <h3 class="text-lg font-bold text-slate-800 mb-4">系统设置</h3>
            <div class="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div>
                <p class="font-semibold text-gray-800">系统维护模式</p>
                <p class="text-xs text-gray-500">开启后用户端将显示维护公告，暂停服务。</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" v-model="settings.maintenance" />
                <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-400"></div>
                <div
                  class="absolute left-1 top-1 bg-white h-4 w-4 rounded-full transition peer-checked:translate-x-5"
                ></div>
              </label>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold text-gray-800">允许新律师注册</p>
                <p class="text-xs text-gray-500">关闭后将隐藏律师端的注册入口。</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" v-model="settings.allowLawyerRegister" />
                <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-400"></div>
                <div
                  class="absolute left-1 top-1 bg-white h-4 w-4 rounded-full transition peer-checked:translate-x-5"
                ></div>
              </label>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  getAdminUserList,
  getLawyerLicenseList,
  approveLawyerLicense,
  rejectLawyerLicense,
  adminLogout,
  disableUser,
  enableUser
} from '@/api/admin'
import { getKnowledgeList, uploadKnowledgeFile, deleteKnowledgeFile, publishKnowledge, disableKnowledge } from '@/api/knowledge'

const router = useRouter()
const sidebarOpen = ref(false)
const showLogoutMenu = ref(false)
const activeView = ref('dashboard')
const globalSearch = ref('')
const userStore = useUserStore()

const navItems = [
  { id: 'dashboard', label: '仪表盘', icon: 'fa-solid fa-chart-pie' },
  { id: 'users', label: '用户列表', icon: 'fa-solid fa-users' },
  { id: 'lawyers', label: '律师审核', icon: 'fa-solid fa-user-tie' },
  { id: 'content', label: '知识库管理', icon: 'fa-solid fa-book' },
  { id: 'settings', label: '系统设置', icon: 'fa-solid fa-gear' }
]

const stats = reactive({
  totalUsers: 0,
  totalLawyers: 0,
  pendingLicenses: 0,
  knowledgeArticles: 0
})

const dashboardData = reactive({
  pendingLicenses: []
})

const dashboardLoading = ref(false)

const confirmDialog = reactive({
  show: false,
  title: '',
  message: '',
  confirmText: '确认',
  cancelText: '取消',
  action: null,
  loading: false
})

const licenseDetailModal = reactive({
  show: false,
  data: null
})

const uploadModal = reactive({
  show: false,
  files: [],
  uploading: false,
  progress: 0,
  dragActive: false
})

const userTable = reactive({
  rows: [],
  total: 0,
  loading: false,
  filters: {
    pageNum: 1,
    pageSize: 10,
    role: undefined,
    keyword: ''
  }
})

const lawyerReview = reactive({
  rows: [],
  total: 0,
  loading: false,
  query: {
    page: 1,
    pageSize: 5,
    // default use backend status value
    status: 'pending'
  }
})

const knowledgeState = reactive({
  items: [],
  loading: false
})

const settings = reactive({
  maintenance: false,
  allowLawyerRegister: true
})

const userRoleFilters = [
  { label: '全部', value: undefined },
  { label: '普通用户', value: 'user' },
  { label: '律师', value: 'lawyer' }
]

const licenseStatusFilters = [
  { label: '待审核', value: 'pending' },
  { label: '审核通过', value: 'approved' },
  { label: '审核拒绝', value: 'rejected' }
]

// 状态映射：后端使用英文状态，前端用中文显示/筛选
const statusBackendMap = {
  '待审核': 'pending',
  '审核通过': 'approved',
  '审核拒绝': 'rejected'
}
const statusDisplayMap = {
  pending: '待审核',
  approved: '审核通过',
  rejected: '审核拒绝'
}

const currentTitle = computed(() => {
  const target = navItems.find((item) => item.id === activeView.value)
  return target ? target.label : '管理后台'
})

const dashboardCards = computed(() => [
  {
    label: '总用户数',
    value: stats.totalUsers,
    tag: '+新增',
    tagClass: 'bg-green-100 text-green-600',
    barClass: 'bg-blue-500',
    progress: '70%'
  },
  {
    label: '认证律师',
    value: stats.totalLawyers,
    tag: '活跃',
    tagClass: 'bg-blue-100 text-blue-600',
    barClass: 'bg-indigo-500',
    progress: '45%'
  },
  {
    label: '待审核律师',
    value: stats.pendingLicenses,
    tag: '审核中',
    tagClass: 'bg-amber-100 text-amber-600',
    barClass: 'bg-amber-500',
    progress: '60%'
  },
  {
    label: '知识库文章',
    value: stats.knowledgeArticles,
    tag: '已发布',
    tagClass: 'bg-emerald-100 text-emerald-600',
    barClass: 'bg-emerald-500',
    progress: '80%'
  }
])

const normalizePageResponse = (res) => {
  const data = res?.data ?? res
  if (Array.isArray(data)) {
    return {
      total: data.length,
      records: data
    }
  }
  return {
    total: Number(data?.total) || 0,
    records: Array.isArray(data?.records) ? data.records : []
  }
}

const loadDashboard = async () => {
  dashboardLoading.value = true
  try {
    const [usersRes, lawyersRes, pendingLicensesRes, knowledgeRes] = await Promise.all([
      getAdminUserList({ pageNum: 1, pageSize: 1 }),
      getAdminUserList({ pageNum: 1, pageSize: 1, role: 'lawyer' }),
      // map front-end status filter to backend status value
      getLawyerLicenseList({ page: 1, pageSize: 3, status: statusBackendMap['待审核'] }),
      getKnowledgeList()
    ])

    const usersInfo = normalizePageResponse(usersRes)
    const lawyersInfo = normalizePageResponse(lawyersRes)
    const licenseInfo = normalizePageResponse(pendingLicensesRes)
    const knowledgeInfo = normalizePageResponse(knowledgeRes)

    stats.totalUsers = usersInfo.total
    stats.totalLawyers = lawyersInfo.total
    stats.pendingLicenses = licenseInfo.total
    stats.knowledgeArticles = knowledgeInfo.total
    // normalize dashboard pending licenses similarly to list mapping
    dashboardData.pendingLicenses = (licenseInfo.records || []).map((r) => {
      let specialties = []
      try {
        if (r.specialty) {
          specialties = Array.isArray(r.specialty) ? r.specialty : JSON.parse(r.specialty)
        } else if (r.specialties) {
          specialties = Array.isArray(r.specialties) ? r.specialties : JSON.parse(r.specialties)
        }
      } catch (e) {
        specialties = []
      }
      const statusRaw = r.auditStatus
      const status = statusDisplayMap[statusRaw] || statusRaw
      return {
        ...r,
        specialties,
        statusRaw,
        status
      }
    })
  } catch (error) {
    console.error('加载仪表盘数据失败', error)
  } finally {
    dashboardLoading.value = false
  }
}

const loadUserTable = async () => {
  userTable.loading = true
  try {
    const res = await getAdminUserList({
      pageNum: userTable.filters.pageNum,
      pageSize: userTable.filters.pageSize,
      role: userTable.filters.role,
      keyword: userTable.filters.keyword || undefined
    })
    const info = normalizePageResponse(res)
    userTable.rows = info.records
    userTable.total = info.total
  } catch (error) {
    console.error('加载用户列表失败', error)
  } finally {
    userTable.loading = false
  }
}

const loadLawyerLicenses = async () => {
  lawyerReview.loading = true
  try {
    // translate front-end status filter (中文) to backend auditStatus (英文)，若已为英文则直接使用
    const statusParam = statusBackendMap[lawyerReview.query.status] || lawyerReview.query.status
    const res = await getLawyerLicenseList({
      page: lawyerReview.query.page,
      pageSize: lawyerReview.query.pageSize,
      auditStatus: statusParam
    })
    const info = normalizePageResponse(res)
    // normalize records: parse specialty json, map status display
    lawyerReview.rows = (info.records || []).map((r) => {
      let specialties = []
      try {
        if (r.specialty) {
          specialties = Array.isArray(r.specialty) ? r.specialty : JSON.parse(r.specialty)
        } else if (r.specialties) {
          specialties = Array.isArray(r.specialties) ? r.specialties : JSON.parse(r.specialties)
        }
      } catch (e) {
        specialties = []
      }
      const statusRaw = r.auditStatus
      const status = statusDisplayMap[statusRaw] || statusRaw
      return {
        ...r,
        licenseId: r.licenseId, // ensure licenseId is present
        specialties,
        statusRaw,
        status
      }
    })
    lawyerReview.total = info.total
  } catch (error) {
    console.error('加载律师执业证列表失败', error)
  } finally {
    lawyerReview.loading = false
  }
}

const loadKnowledge = async () => {
  knowledgeState.loading = true
  try {
    const res = await getKnowledgeList()
    const info = normalizePageResponse(res)
    knowledgeState.items = info.records
    stats.knowledgeArticles = info.total
  } catch (error) {
    console.error('加载知识库失败', error)
  } finally {
    knowledgeState.loading = false
  }
}

const switchView = (view) => {
  activeView.value = view
  if (window.innerWidth < 768) {
    sidebarOpen.value = false
  }
  if (view === 'dashboard') {
    loadDashboard()
  } else if (view === 'users') {
    if (!userTable.rows.length) {
      loadUserTable()
    }
  } else if (view === 'lawyers') {
    loadLawyerLicenses()
  } else if (view === 'content') {
    if (!knowledgeState.items.length) {
      loadKnowledge()
    }
  }
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const setUserRole = (role) => {
  userTable.filters.role = role
  userTable.filters.pageNum = 1
  loadUserTable()
}

const searchUsers = () => {
  userTable.filters.pageNum = 1
  loadUserTable()
}

const changeUserPage = (delta) => {
  userTable.filters.pageNum = Math.max(1, userTable.filters.pageNum + delta)
  loadUserTable()
}

const setLicenseStatus = (status) => {
  lawyerReview.query.status = status
  lawyerReview.query.page = 1
  loadLawyerLicenses()
}

const changeLicensePage = (delta) => {
  lawyerReview.query.page = Math.max(1, lawyerReview.query.page + delta)
  loadLawyerLicenses()
}

const statusBadge = (status) => {
  switch (status) {
    case '待审核':
      return 'bg-yellow-50 text-yellow-700'
    case '审核通过':
      return 'bg-green-50 text-green-700'
    case '审核拒绝':
      return 'bg-red-50 text-red-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const handleApprove = async (license) => {
  try {
    // Use license.licenseId for approve endpoint
    await approveLawyerLicense(license.licenseId)
    licenseDetailModal.show = false
    loadLawyerLicenses()
    loadDashboard()
  } catch (error) {
    console.error('审核通过失败', error)
  }
}

const handleReject = async (license) => {
  const remark = window.prompt('请输入驳回理由', '资料不完整')
  if (remark === null) return
  try {
    // Use license.licenseId for reject endpoint
    await rejectLawyerLicense(license.licenseId, remark || '资料不符合要求')
    licenseDetailModal.show = false
    loadLawyerLicenses()
    loadDashboard()
  } catch (error) {
    console.error('驳回审核失败', error)
  }
}

const handleViewLicenseDetail = (license) => {
  licenseDetailModal.data = license
  licenseDetailModal.show = true
}

const roleText = (role) => {
  if (role === 'lawyer') return '律师'
  if (role === 'user') return '普通用户'
  if (role === 'admin') return '管理员'
  return '未知'
}

const formatDate = (value) => {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(
    2,
    '0'
  )}`
}

const handleGlobalSearch = () => {
  if (activeView.value !== 'users') {
    switchView('users')
  }
  userTable.filters.keyword = globalSearch.value
  searchUsers()
}

const handleDisableUser = async (user) => {
  confirmDialog.title = '禁用用户'
  confirmDialog.message = `确定要禁用用户 ${user.nickname || user.userName} 吗？禁用后该用户将无法登录。`
  confirmDialog.confirmText = '禁用'
  confirmDialog.action = async () => {
    try {
      confirmDialog.loading = true
      await disableUser(user.id)
      confirmDialog.show = false
      loadUserTable()
    } catch (error) {
      console.error('禁用用户失败', error)
    } finally {
      confirmDialog.loading = false
    }
  }
  confirmDialog.show = true
}

const handleEnableUser = async (user) => {
  confirmDialog.title = '启用用户'
  confirmDialog.message = `确定要启用用户 ${user.nickname || user.userName} 吗？启用后该用户可以正常登录。`
  confirmDialog.confirmText = '启用'
  confirmDialog.action = async () => {
    try {
      confirmDialog.loading = true
      await enableUser(user.id)
      confirmDialog.show = false
      loadUserTable()
    } catch (error) {
      console.error('启用用户失败', error)
    } finally {
      confirmDialog.loading = false
    }
  }
  confirmDialog.show = true
}

onMounted(() => {
  loadDashboard()
})

const handleLogout = async () => {
  try {
    await adminLogout()
  } catch (error) {
    console.warn('后端退出登录失败，执行本地清除', error)
  } finally {
    userStore.logout()
    showLogoutMenu.value = false
    router.push({ name: 'Auth' })
  }
}

const openUploadModal = () => {
  uploadModal.show = true
  uploadModal.files = []
  uploadModal.progress = 0
  uploadModal.dragActive = false
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files || [])
  uploadModal.files.push(...files)
}

const handleFileDrop = (event) => {
  uploadModal.dragActive = false
  const files = Array.from(event.dataTransfer?.files || [])
  uploadModal.files.push(...files)
}

const handleUpload = async () => {
  if (uploadModal.files.length === 0) return

  uploadModal.uploading = true
  uploadModal.progress = 0

  try {
    // 使用 FormData 上传文件
    const formData = new FormData()
    uploadModal.files.forEach((file) => {
      formData.append('files', file)
    })

    // 显示上传进度
    const progressInterval = setInterval(() => {
      if (uploadModal.progress < 90) {
        uploadModal.progress += Math.random() * 30
      }
    }, 500)

    const response = await uploadKnowledgeFile(formData)

    clearInterval(progressInterval)
    uploadModal.progress = 100

    // 上传成功
    setTimeout(() => {
      uploadModal.show = false
      uploadModal.files = []
      uploadModal.progress = 0
      loadKnowledge() // 刷新知识库列表
      // 可选：显示成功提示
      console.log('文档上传成功', response)
    }, 500)
  } catch (error) {
    console.error('文档上传失败', error)
    uploadModal.uploading = false
    uploadModal.progress = 0
    // 可选：显示错误提示
  }
}

const handleDeleteKnowledge = async (article) => {
  confirmDialog.title = '删除文档'
  confirmDialog.message = `确定要删除文档 "${article.title || article.fileName}" 吗？删除后无法恢复。`
  confirmDialog.confirmText = '删除'
  confirmDialog.cancelText = '取消'
  confirmDialog.action = async () => {
    try {
      confirmDialog.loading = true
      await deleteKnowledgeFile(article.id)
      confirmDialog.show = false
      loadKnowledge() // 刷新知识库列表
      console.log('文档删除成功')
    } catch (error) {
      console.error('文档删除失败', error)
    } finally {
      confirmDialog.loading = false
    }
  }
  confirmDialog.show = true
}

const getKnowledgeStatusLabel = (status) => {
  switch (status) {
    case 'active':
      return '已发布'
    case 'disabled':
      return '已禁用'
    case 'draft':
      return '草稿'
    default:
      return status || '待发布'
  }
}

const handlePublishKnowledge = async (article) => {
  confirmDialog.title = '发布文档'
  confirmDialog.message = `确定要发布文档 "${article.title || article.fileName}" 吗？发布后用户将能看到此文档。`
  confirmDialog.confirmText = '发布'
  confirmDialog.cancelText = '取消'
  confirmDialog.action = async () => {
    try {
      confirmDialog.loading = true
      await publishKnowledge(article.id)
      confirmDialog.show = false
      loadKnowledge() // 刷新知识库列表
      console.log('文档发布成功')
    } catch (error) {
      console.error('文档发布失败', error)
    } finally {
      confirmDialog.loading = false
    }
  }
  confirmDialog.show = true
}

const handleDisableKnowledge = async (article) => {
  confirmDialog.title = '禁用文档'
  confirmDialog.message = `确定要禁用文档 "${article.title || article.fileName}" 吗？禁用后用户将无法访问此文档。`
  confirmDialog.confirmText = '禁用'
  confirmDialog.cancelText = '取消'
  confirmDialog.action = async () => {
    try {
      confirmDialog.loading = true
      await disableKnowledge(article.id)
      confirmDialog.show = false
      loadKnowledge() // 刷新知识库列表
      console.log('文档禁用成功')
    } catch (error) {
      console.error('文档禁用失败', error)
    } finally {
      confirmDialog.loading = false
    }
  }
  confirmDialog.show = true
}

</script>

<style scoped>
.sidebar-link {
  border-left-width: 4px;
}
</style>


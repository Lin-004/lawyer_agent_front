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
              class="text-brand-700 border-b-2 border-brand-700 px-1 py-4 transition-colors"
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
      <div class="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
          <div class="md:flex md:items-center md:justify-between gap-8">
            <div>
              <p class="text-sm font-semibold text-brand-600 uppercase tracking-wide">LawChat Knowledge</p>
              <h1 class="text-3xl font-bold text-slate-900 mt-2">法律文库</h1>
              <p class="text-gray-500 mt-2">
                收录 {{ totalDocuments }} 条法律案例、法规原文与解读，支持全文搜索和多维筛选。
              </p>
            </div>
            <div class="grid grid-cols-2 gap-4 md:w-1/3">
              <div class="bg-brand-50 rounded-xl p-4 border border-brand-100">
                <p class="text-xs text-brand-600 uppercase tracking-wide">有效文档</p>
                <p class="text-2xl font-bold text-brand-700 mt-1">{{ activeDocuments }}</p>
              </div>
              
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="md:col-span-2">
              <div class="relative">
                <i class="fa-solid fa-magnifying-glass text-gray-400 absolute left-4 top-3.5"></i>
                <input
                  v-model.trim="searchQuery"
                  type="text"
                  placeholder="搜索文档标题、关键段落或来源..."
                  class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white shadow-inner"
                />
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <select
                v-model="typeFilter"
                class="flex-1 border border-gray-200 rounded-xl px-3 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option v-for="type in fileTypeOptions" :key="type" :value="type">
                  {{ typeLabel(type) }}
                </option>
              </select>
              <select
                v-model="statusFilter"
                class="flex-1 border border-gray-200 rounded-xl px-3 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">全部状态</option>
                <option value="active">已发布</option>
                <option value="deleted">已停用</option>
              </select>
            </div>
          </div>
        </section>

        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[420px]">
          <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 class="text-xl font-bold text-slate-900">文档列表</h2>
              <p class="text-sm text-gray-500 mt-1">共 {{ filteredDocuments.length }} 条符合条件的文档</p>
            </div>
            <div class="flex items-center text-sm text-gray-400 gap-2">
              <i class="fa-solid fa-circle-info"></i>
              数据来源：网上公开法律文库及法规数据库，内容仅供参考使用。
            </div>
          </header>

          <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="index in 4"
              :key="index"
              class="p-5 border border-gray-100 rounded-xl animate-pulse bg-gray-50"
            >
              <div class="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div class="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div class="space-y-2">
                <div class="h-3 bg-gray-200 rounded"></div>
                <div class="h-3 bg-gray-200 rounded w-11/12"></div>
                <div class="h-3 bg-gray-200 rounded w-10/12"></div>
              </div>
            </div>
          </div>

          <div v-else-if="error" class="text-center py-12 text-red-500">
            <p class="font-semibold mb-2">文库加载失败</p>
            <p class="text-sm">{{ error }}</p>
          </div>

          <div v-else-if="filteredDocuments.length === 0" class="text-center py-16 text-gray-400">
            <i class="fa-solid fa-folder-open text-4xl mb-4"></i>
            <p>暂无符合条件的文档，尝试修改筛选条件。</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <article
              v-for="doc in filteredDocuments"
              :key="doc.id"
              class="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition bg-white flex flex-col"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div :class="['w-12 h-12 rounded-xl flex items-center justify-center text-lg', fileIconClass(doc.fileType)]">
                    <i :class="fileIcon(doc.fileType)"></i>
                  </div>
                  <div>
                    <p class="text-xs uppercase tracking-wide text-gray-400">
                      {{ doc.source || '未分类' }}
                    </p>
                    <h3 class="text-lg font-semibold text-slate-900 leading-snug">
                      {{ doc.fileName || '未命名文档' }}
                    </h3>
                  </div>
                </div>
                <span
                  :class="[
                    'px-3 py-1 text-xs rounded-full font-medium',
                    doc.status === 'active'
                      ? 'bg-green-50 text-green-700 border border-green-100'
                      : 'bg-gray-50 text-gray-500 border border-gray-100'
                  ]"
                >
                  {{ doc.status === 'active' ? '已发布' : '已停用' }}
                </span>
              </div>
              <p class="text-sm text-gray-600 flex-1 leading-relaxed">
                {{ doc.preview }}
              </p>
              <div class="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span><i class="fa-regular fa-clock mr-1"></i>{{ doc.uploadTimeLabel }}</span>
                <span><i class="fa-regular fa-file mr-1"></i>{{ doc.fileType?.toUpperCase?.() || 'TXT' }}</span>
                <span><i class="fa-solid fa-database mr-1"></i>{{ doc.sizeLabel }}</span>
                <span v-if="doc.remark"><i class="fa-regular fa-bookmark mr-1"></i>{{ doc.remark }}</span>
              </div>
              <div class="mt-4 flex items-center gap-3 text-sm">
                <button
                  class="flex-1 border border-gray-200 rounded-lg py-2 text-gray-600 hover:border-brand-400 hover:text-brand-600 transition"
                  @click="openDetail(doc)"
                >
                  查看详情
                </button>
                <button
                  class="flex-1 bg-brand-600 text-white rounded-lg py-2 hover:bg-brand-700 transition"
                  @click="downloadDocument(doc)"
                >
                  下载
                </button>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>

    <transition name="fade">
      <div
        v-if="detailVisible"
        class="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm flex items-start justify-center p-4 md:p-10"
        @click.self="closeDetail"
      >
        <div class="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-wide text-gray-400">{{ selectedDoc?.source || '未分类' }}</p>
              <h3 class="text-2xl font-bold text-slate-900 mt-1">{{ selectedDoc?.fileName || '文档详情' }}</h3>
              <p class="text-sm text-gray-500 mt-1">
                ID：{{ selectedDoc?.id }} · 上传于 {{ selectedDoc?.uploadTimeLabel }}
              </p>
            </div>
            <button class="text-gray-400 hover:text-gray-600" @click="closeDetail">
              <i class="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
          <div class="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div class="p-4 bg-gray-50 rounded-xl">
                <p class="text-xs text-gray-500">文件类型</p>
                <p class="text-base font-semibold text-slate-900 mt-1">{{ selectedDoc?.fileType?.toUpperCase?.() }}</p>
              </div>
              <div class="p-4 bg-gray-50 rounded-xl">
                <p class="text-xs text-gray-500">文件大小</p>
                <p class="text-base font-semibold text-slate-900 mt-1">{{ selectedDoc?.sizeLabel }}</p>
              </div>
              <div class="p-4 bg-gray-50 rounded-xl">
                <p class="text-xs text-gray-500">状态</p>
                <p class="text-base font-semibold text-slate-900 mt-1">
                  {{ selectedDoc?.status === 'active' ? '已发布' : '已停用' }}
                </p>
              </div>
              <div class="p-4 bg-gray-50 rounded-xl">
                <p class="text-xs text-gray-500">文件路径</p>
                <div class="flex items-center gap-2 mt-1">
                  <p class="text-xs text-gray-700 truncate">{{ selectedDoc?.filePath || '暂无路径' }}</p>
                  <button
                    v-if="selectedDoc?.filePath"
                    class="text-brand-600 text-xs"
                    @click="copyFilePath(selectedDoc?.filePath)"
                  >
                    复制
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-semibold text-gray-700 mb-2">文档摘要</h4>
              <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {{ selectedDoc?.preview || '暂无摘要' }}
              </p>
            </div>

            <div v-if="selectedDoc?.content">
              <h4 class="text-sm font-semibold text-gray-700 mb-2">文档片段</h4>
              <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm text-gray-700 max-h-64 overflow-y-auto">
                {{ selectedDoc.content }}
              </div>
            </div>
          </div>
          <div class="p-6 border-t border-gray-100 flex flex-col md:flex-row gap-3">
            <button
              class="flex-1 border border-gray-200 rounded-xl py-3 text-gray-700 hover:border-brand-400 hover:text-brand-600 transition"
              @click="closeDetail"
            >
              关闭
            </button>
            <button
              class="flex-1 bg-brand-600 text-white rounded-xl py-3 hover:bg-brand-700 transition"
              @click="downloadDocument(selectedDoc)"
            >
              下载文档
            </button>
          </div>
        </div>
      </div>
    </transition>

    <Footer />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import { getKnowledgeList } from '@/api/knowledge'

const userStore = useUserStore()

const documents = ref([])
const loading = ref(true)
const error = ref('')

const searchQuery = ref('')
const sourceFilter = ref('all')
const typeFilter = ref('all')
const statusFilter = ref('active')

const userName = computed(() => userStore.userInfo?.nickname || '游客')
const userAvatar = computed(() => 
  userStore.userInfo?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User123'
)
const isLoggedIn = computed(() => userStore.isLoggedIn)

const sourceOptions = computed(() => {
  const items = new Set(documents.value.map((doc) => doc.source).filter(Boolean))
  return ['all', ...items]
})

const fileTypeOptions = computed(() => {
  const items = new Set(documents.value.map((doc) => doc.fileType?.toLowerCase()).filter(Boolean))
  return ['all', ...items]
})

const totalDocuments = computed(() => documents.value.length)
const activeDocuments = computed(() => documents.value.filter((doc) => doc.status === 'active').length)

const filteredDocuments = computed(() =>
  documents.value.filter((doc) => {
    const matchesSearch =
      !searchQuery.value ||
      doc.fileName?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      doc.content?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      doc.source?.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesSource = sourceFilter.value === 'all' || doc.source === sourceFilter.value
    const matchesType = typeFilter.value === 'all' || doc.fileType?.toLowerCase() === typeFilter.value
    const matchesStatus = statusFilter.value === 'all' || doc.status === statusFilter.value

    return matchesSearch && matchesSource && matchesType && matchesStatus
  })
)


const typeLabel = (value) => (value === 'all' ? '全部类型' : value?.toUpperCase?.() || '未知')

const fileIcon = (type = '') => {
  const lower = type.toLowerCase()
  if (lower.includes('pdf')) return 'fa-regular fa-file-pdf'
  if (lower.includes('doc')) return 'fa-regular fa-file-word'
  if (lower.includes('txt')) return 'fa-regular fa-file-lines'
  if (lower.includes('md')) return 'fa-regular fa-file-code'
  return 'fa-regular fa-file'
}

const fileIconClass = (type = '') => {
  const lower = type.toLowerCase()
  if (lower.includes('pdf')) return 'bg-red-50 text-red-500'
  if (lower.includes('doc')) return 'bg-blue-50 text-blue-500'
  if (lower.includes('txt') || lower.includes('md')) return 'bg-emerald-50 text-emerald-500'
  return 'bg-gray-100 text-gray-500'
}

const formatSize = (size = 0) => {
  if (!size || Number(size) <= 0) return '未知大小'
  const kb = Number(size) / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

const normalizeDocuments = (list = []) =>
  list.map((doc) => ({
    ...doc,
    uploadTimeLabel: doc.uploadTime ? new Date(doc.uploadTime).toLocaleDateString() : '未知时间',
    sizeLabel: formatSize(doc.fileSize),
    preview: doc.summary || doc.content?.slice(0, 160) || '暂无摘要',
    status: doc.status || 'active',
    fileType: doc.fileType?.toLowerCase() || 'txt'
  }))

const loadDocuments = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await getKnowledgeList()
    const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
    documents.value = normalizeDocuments(list)
  } catch (err) {
    console.error('加载知识库文档失败:', err)
    error.value = err.message || '服务暂不可用'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDocuments()
})

const detailVisible = ref(false)
const selectedDoc = ref(null)

const openDetail = (doc) => {
  selectedDoc.value = doc
  detailVisible.value = true
}

const closeDetail = () => {
  detailVisible.value = false
  selectedDoc.value = null
}

const downloadDocument = (doc) => {
  if (!doc) return
  if (doc.filePath) {
    window.open(doc.filePath, '_blank', 'noopener,noreferrer')
  } else if (doc.fileName) {
    const blob = new Blob([doc.content || ''], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = doc.fileName
    link.click()
    URL.revokeObjectURL(link.href)
  }
}

const copyFilePath = async (path) => {
  try {
    await navigator.clipboard.writeText(path)
  } catch (err) {
    console.error('复制失败', err)
  }
}
</script>
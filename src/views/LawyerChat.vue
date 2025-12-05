<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <Navbar />
    <div class="flex-1 pt-16 flex">
      <LawyerChatPanel @ended="onPanelEnded" />
    </div>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import LawyerChatPanel from '@/components/LawyerChatPanel.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const onPanelEnded = () => {
  // 当面板发出结束事件时，回到律师工作台
  router.push('/lawyer')
}
</script>

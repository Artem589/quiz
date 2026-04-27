<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from './composables/useTheme'

useTheme()
const router = useRouter()
const route = useRoute()

const showFab = computed(() => route.path !== '/theme')
</script>

<template>
  <router-view />
  <button
    v-if="showFab"
    class="theme-fab"
    @click="router.push('/theme')"
    title="Сменить тему"
  >
    <span class="theme-fab-icon">&#9681;</span>
  </button>
</template>

<style>
.theme-fab {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  z-index: 9999;
  padding: 0;
}

.theme-fab:hover {
  background: var(--primary);
  box-shadow: 0 4px 16px var(--primary-glow-strong);
  transform: scale(1.08);
}

.theme-fab:hover .theme-fab-icon {
  color: white;
}

.theme-fab-icon {
  font-size: 1.15rem;
  color: #2c3e50;
  line-height: 1;
  transition: color 0.25s ease;
}
</style>

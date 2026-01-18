<script setup lang="ts">
import QuizApp from './components/QuizApp.vue'

</script>

<template>
  <quiz-app />
</template>

<style>
.app-nav {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

.app-nav button {
  padding: 12px 24px;
  margin: 0 10px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.app-nav button.active {
  background: #00BCD4;
  color: white;
}

.app-nav button:hover {
  transform: translateY(-2px);
}
</style>

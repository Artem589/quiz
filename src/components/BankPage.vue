<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const sections = [
  {
    id: 'quizzes',
    icon: '🗂️',
    title: 'Банк квизов',
    description: 'Создавайте и переключайте наборы вопросов по темам',
    path: '/bank/quizzes',
  },
  {
    id: 'cards',
    icon: '🃏',
    title: 'Банк карточек',
    description: 'Управляйте наборами карточек и библиотекой текстов',
    path: '/bank/cards',
  },
  {
    id: 'tasks',
    icon: '📚',
    title: 'Банк задач',
    description: 'Библиотека задач для добавления в любой квиз',
    path: '/bank/tasks',
  },
]
</script>

<template>
  <div class="bank-page">
    <div class="bank-container">
      <div class="bank-header">
        <button class="back-btn" @click="router.push('/')">&#8592; Главная</button>
        <div class="header-text">
          <h1>Банк</h1>
          <p class="header-sub">Управление контентом</p>
        </div>
      </div>

      <div class="bank-content">
        <div class="sections-grid">
          <button
            v-for="s in sections"
            :key="s.id"
            class="section-card"
            @click="router.push(s.path)"
          >
            <span class="section-icon">{{ s.icon }}</span>
            <div class="section-info">
              <span class="section-title">{{ s.title }}</span>
              <span class="section-desc">{{ s.description }}</span>
            </div>
            <span class="section-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bank-page {
  width: 100vw;
  height: 100vh;
  background: var(--bg-gradient);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bank-container {
  width: 100%;
  max-width: 680px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.bank-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 28px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

.back-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.6);
  color: #2c3e50;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.back-btn:hover {
  background: var(--primary);
  color: white;
  transform: translateY(-2px);
}

.header-text { display: flex; flex-direction: column; gap: 2px; }

.bank-header h1 {
  font-size: 2rem;
  margin: 0;
  font-weight: 700;
  color: #2c3e50;
}

.header-sub {
  margin: 0;
  font-size: 0.82rem;
  color: #78909c;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.bank-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 28px;
}

.sections-grid {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px 26px;
  background: rgba(255, 255, 255, 0.42);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-radius: 16px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.07);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  width: 100%;
}

.section-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.11);
  background: rgba(255, 255, 255, 0.58);
}

.section-card:hover .section-arrow {
  transform: translateX(4px);
  color: var(--primary);
}

.section-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
}

.section-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
}

.section-desc {
  font-size: 0.82rem;
  color: #78909c;
}

.section-arrow {
  font-size: 1.1rem;
  color: #b0bec5;
  flex-shrink: 0;
  transition: transform 0.2s ease, color 0.2s ease;
}
</style>

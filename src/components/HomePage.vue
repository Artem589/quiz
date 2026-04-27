<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const sections = [
  {
    id: 'quiz',
    title: 'Квиз',
    description: 'Тест с изображениями и таймером',
    icon: '📝',
    path: '/quiz',
    accent: 'var(--primary)',
  },
  {
    id: 'flashcards',
    title: 'Карточки',
    description: 'Двусторонние карточки для запоминания',
    icon: '🃏',
    path: '/flip-card',
    accent: 'var(--primary)',
  },
  {
    id: 'edit-quiz',
    title: 'Редактор квиза',
    description: 'Добавлять и изменять вопросы',
    icon: '✏️',
    path: '/edit',
    accent: 'var(--primary)',
  },
  {
    id: 'edit-cards',
    title: 'Редактор карточек',
    description: 'Создавать и удалять карточки',
    icon: '📋',
    path: '/flip-card/edit',
    accent: 'var(--primary)',
  },
  {
    id: 'bank',
    title: 'Банк',
    description: 'Банк квизов, карточек и задач по темам',
    icon: '🗂️',
    path: '/bank',
    accent: 'var(--primary)',
  },
]
</script>

<template>
  <div class="home-page">
    <div class="home-container">

      <header class="home-header">
        <div class="home-logo">
          <span class="logo-icon">◈</span>
          <span class="logo-text">Quiz App</span>
        </div>
      </header>

      <main class="home-main">
        <div class="home-hero">
          <h1 class="hero-title">Добро пожаловать</h1>
          <p class="hero-sub">Выберите раздел для работы</p>
        </div>

        <nav class="nav-grid">
          <button
            v-for="section in sections"
            :key="section.id"
            class="nav-card"
            @click="router.push(section.path)"
          >
            <span class="nav-icon">{{ section.icon }}</span>
            <div class="nav-info">
              <span class="nav-title">{{ section.title }}</span>
              <span class="nav-desc">{{ section.description }}</span>
            </div>
            <span class="nav-arrow">→</span>
          </button>
        </nav>
      </main>

    </div>
  </div>
</template>

<style scoped>
.home-page {
  width: 100vw;
  height: 100vh;
  background: var(--bg-gradient);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.home-container {
  width: 100%;
  max-width: 680px;
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  box-sizing: border-box;
}

/* Шапка */
.home-header {
  display: flex;
  justify-content: center;
}

.home-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 40px;
  padding: 10px 22px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
}

.logo-icon {
  font-size: 1.3rem;
  color: var(--primary);
  line-height: 1;
}

.logo-text {
  font-size: 1rem;
  font-weight: 700;
  color: #2c3e50;
  letter-spacing: 0.04em;
}

/* Hero */
.home-main {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.home-hero {
  text-align: center;
}

.hero-title {
  font-size: 2.4rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  line-height: 1.15;
}

.hero-sub {
  margin: 0;
  font-size: 1rem;
  color: #78909c;
  font-weight: 500;
}

/* Навигация */
.nav-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nav-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 24px;
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

.nav-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.11);
  background: rgba(255, 255, 255, 0.58);
}

.nav-card:hover .nav-arrow {
  transform: translateX(4px);
  color: var(--primary);
}

.nav-icon {
  font-size: 1.8rem;
  line-height: 1;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.nav-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.nav-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #2c3e50;
  display: block;
}

.nav-desc {
  font-size: 0.82rem;
  color: #78909c;
  font-weight: 400;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-arrow {
  font-size: 1.1rem;
  color: #b0bec5;
  flex-shrink: 0;
  transition: transform 0.2s ease, color 0.2s ease;
}

@media (max-width: 480px) {
  .home-container {
    padding: 28px 16px;
    gap: 28px;
  }

  .hero-title {
    font-size: 1.9rem;
  }

  .nav-card {
    padding: 16px 18px;
    gap: 14px;
  }

  .nav-icon {
    font-size: 1.5rem;
    width: 38px;
    height: 38px;
  }
}
</style>

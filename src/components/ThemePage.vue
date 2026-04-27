<script setup lang="ts">
import { useTheme } from '../composables/useTheme'
import { useRouter } from 'vue-router'

const { themes, classicThemes, activeThemeId, setTheme } = useTheme()
const router = useRouter()
</script>

<template>
  <div class="theme-page">
    <div class="theme-container">
      <div class="theme-header">
        <button class="back-btn" @click="router.back()">&#8592; Назад</button>
        <div class="header-text">
          <h1>Темы оформления</h1>
          <p class="header-sub">Цветовые палитры Pantone</p>
        </div>
      </div>

      <div class="theme-content">

        <!-- Блок 1: Color of the Year -->
        <section class="theme-section">
          <div class="section-label">
            <span class="section-title">Color of the Year</span>
            <span class="section-desc">Pantone · Цвета года</span>
          </div>
          <div class="themes-grid">
            <button
              v-for="theme in themes"
              :key="theme.id"
              class="theme-card"
              :class="{ active: activeThemeId === theme.id }"
              @click="setTheme(theme.id)"
              :style="{ background: `linear-gradient(135deg, ${theme.swatchFrom} 0%, ${theme.swatchTo} 100%)` }"
            >
              <div class="card-top">
                <span class="swatch" :style="{ background: theme.vars['--primary'] }"></span>
                <span v-if="activeThemeId === theme.id" class="check">&#10003;</span>
              </div>
              <div class="card-info">
                <span class="theme-name">{{ theme.name }}</span>
                <span class="theme-meta">
                  <span class="pantone-code">{{ theme.pantone }}</span>
                  <span v-if="theme.year && theme.year !== 'default'" class="pantone-year">{{ theme.year }}</span>
                </span>
              </div>
            </button>
          </div>
        </section>

        <!-- Блок 2: Classic Pantone -->
        <section class="theme-section">
          <div class="section-label">
            <span class="section-title">Classic Pantone</span>
            <span class="section-desc">Базовые и именные цвета</span>
          </div>
          <div class="themes-grid">
            <button
              v-for="theme in classicThemes"
              :key="theme.id"
              class="theme-card"
              :class="{ active: activeThemeId === theme.id }"
              @click="setTheme(theme.id)"
              :style="{ background: `linear-gradient(135deg, ${theme.swatchFrom} 0%, ${theme.swatchTo} 100%)` }"
            >
              <div class="card-top">
                <span class="swatch" :style="{ background: theme.vars['--primary'] }"></span>
                <span v-if="activeThemeId === theme.id" class="check">&#10003;</span>
              </div>
              <div class="card-info">
                <span class="theme-name">{{ theme.name }}</span>
                <span class="theme-meta">
                  <span class="pantone-code">{{ theme.pantone }}</span>
                </span>
              </div>
            </button>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-page {
  width: 100vw;
  min-height: 100vh;
  background: var(--bg-gradient);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #2c3e50;
}

.theme-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.theme-header {
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

.header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.theme-header h1 {
  font-size: 2rem;
  margin: 0;
  font-weight: 700;
  color: #2c3e50;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.header-sub {
  margin: 0;
  font-size: 0.85rem;
  color: #78909c;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.theme-content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Секция */
.theme-section {
  padding: 32px 28px;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.theme-section + .theme-section {
  padding-top: 0;
}

.section-label {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  letter-spacing: 0.01em;
}

.section-desc {
  font-size: 0.8rem;
  color: #90a4ae;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Сетка карточек */
.themes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.theme-card {
  border-radius: 18px;
  padding: 22px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
  min-height: 150px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.07);
  border: 2px solid rgba(255, 255, 255, 0.5);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  text-align: left;
  font-family: inherit;
  position: relative;
  overflow: hidden;
}

.theme-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.14);
  opacity: 0;
  transition: opacity 0.22s ease;
}

.theme-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.13);
}

.theme-card:hover::before {
  opacity: 1;
}

.theme-card.active {
  border-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1), 0 14px 36px rgba(0, 0, 0, 0.13);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.swatch {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: block;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.22);
  border: 2px solid rgba(255, 255, 255, 0.65);
  flex-shrink: 0;
}

.check {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: #2c3e50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  line-height: 1;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.theme-name {
  font-size: 1rem;
  font-weight: 700;
  color: #2c3e50;
  display: block;
}

.theme-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pantone-code {
  font-size: 0.72rem;
  font-weight: 600;
  color: #546e7a;
  letter-spacing: 0.04em;
  font-family: 'Monaco', 'Consolas', monospace;
}

.pantone-year {
  font-size: 0.68rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.88);
  background: rgba(0, 0, 0, 0.18);
  padding: 2px 7px;
  border-radius: 20px;
  letter-spacing: 0.04em;
}

@media (max-width: 768px) {
  .theme-header h1 { font-size: 1.7rem; }
  .themes-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
}

@media (max-width: 640px) {
  .theme-header { padding: 14px 56px 14px 16px; gap: 12px; }
  .theme-header h1 { font-size: 1.4rem; }
  .header-sub { font-size: 0.75rem; }
  .back-btn { padding: 8px 14px; font-size: 0.85rem; }
  .theme-section { padding: 20px 14px; }
  .section-label { margin-bottom: 14px; padding-bottom: 10px; }
  .section-title { font-size: 1rem; }
  .themes-grid { grid-template-columns: 1fr 1fr; gap: 11px; }
  .theme-card { min-height: 118px; padding: 15px; gap: 14px; border-radius: 16px; }
  .swatch { width: 28px; height: 28px; }
  .check { width: 22px; height: 22px; font-size: 0.8rem; }
  .theme-name { font-size: 0.85rem; }
  .pantone-code { font-size: 0.66rem; }
  .pantone-year { font-size: 0.62rem; padding: 2px 6px; }
}

@media (max-width: 380px) {
  .themes-grid { gap: 8px; }
  .theme-card { min-height: 100px; padding: 12px; }
  .theme-name { font-size: 0.78rem; }
}
</style>

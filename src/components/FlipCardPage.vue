<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

interface FlipCard {
  id: number
  front: string
  back: string
}

const router = useRouter()
const cards = ref<FlipCard[]>([])
const currentIndex = ref(0)
const isFlipped = ref(false)

const currentCard = computed(() => cards.value[currentIndex.value] ?? null)

const loadCards = () => {
  const saved = localStorage.getItem('flip-cards')
  if (saved) {
    try {
      cards.value = JSON.parse(saved)
    } catch {
      cards.value = []
    }
  }
}

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    isFlipped.value = false
  }
}

const next = () => {
  if (currentIndex.value < cards.value.length - 1) {
    currentIndex.value++
    isFlipped.value = false
  }
}

onMounted(loadCards)

watch(() => currentIndex.value, () => {
  isFlipped.value = false
})
</script>

<template>
  <div class="flip-page">
    <div class="flip-container">

      <!-- Шапка -->
      <div class="flip-header">
        <h1>Карточки</h1>
        <button class="edit-btn" @click="router.push('/flip-card/edit')">Редактировать</button>
      </div>

      <!-- Основной контент -->
      <div class="flip-content">
        <template v-if="cards.length > 0 && currentCard">

          <!-- Карточка вверху, как в квизе -->
          <div class="main-content">
            <div class="card-wrapper" @click="isFlipped = !isFlipped">
              <div class="card-inner" :class="{ flipped: isFlipped }">
                <div class="card-face card-front">
                  <p class="card-text">{{ currentCard.front }}</p>
                </div>
                <div class="card-face card-back">
                  <p class="card-text">{{ currentCard.back }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Кнопки навигации -->
          <div class="nav-buttons">
            <button class="nav-btn" @click="prev" :disabled="currentIndex === 0">
              &#8592; Предыдущее
            </button>
            <button class="nav-btn" @click="next" :disabled="currentIndex === cards.length - 1">
              Следующее &#8594;
            </button>
          </div>

        </template>

        <!-- Пустое состояние -->
        <div v-else class="empty-state">
          <p class="empty-text">Карточек пока нет</p>
          <button class="nav-btn" @click="router.push('/flip-card/edit')">Добавить карточки</button>
        </div>
      </div>

      <!-- Счётчик внизу -->
      <div v-if="cards.length > 0" class="flip-info">
        <span class="card-counter">{{ currentIndex + 1 }} / {{ cards.length }}</span>
      </div>

    </div>
  </div>
</template>

<style scoped>
.flip-page {
  width: 100vw;
  height: 100vh;
  background: var(--bg-gradient);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #2c3e50;
  overflow: hidden;
}

.flip-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Шапка */
.flip-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 20px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

.flip-header h1 {
  font-size: 2.5rem;
  margin: 0;
  font-weight: 700;
  color: #2c3e50;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.edit-btn {
  position: absolute;
  right: 70px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.6);
  color: #2c3e50;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background: var(--primary);
  color: white;
  transform: translateY(-2px);
}

/* Контент */
.flip-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px;
}

/* Карточка — позиционирование как в квизе */
.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-top: 40px;
}

/* 3D-карточка увеличена ~2× */
.card-wrapper {
  width: 100%;
  max-width: 680px;
  height: 380px;
  perspective: 1200px;
  cursor: pointer;
}

.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s ease;
}

.card-inner.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(15px);
}

.card-front {
  background: rgba(255, 255, 255, 0.4);
}

.card-back {
  background: var(--primary-bg-mid);
  transform: rotateY(180deg);
}

.card-text {
  font-size: 1.8rem;
  font-weight: 500;
  color: #2c3e50;
  margin: 0;
  text-align: center;
  line-height: 1.4;
}

/* Кнопки навигации */
.nav-buttons {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 20px 0 0;
}

.nav-btn {
  padding: 13px 28px;
  background: var(--primary);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px var(--primary-glow);
}

.nav-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--primary-glow-strong);
}

.nav-btn:disabled {
  background: #B0BEC5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Счётчик внизу */
.flip-info {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.5);
}

.card-counter {
  font-size: 1rem;
  font-weight: 600;
  color: #546e7a;
}

/* Пустое состояние */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.empty-text {
  font-size: 1.2rem;
  color: #546e7a;
  margin: 0;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 30px 40px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .card-wrapper {
    height: 280px;
  }

  .card-text {
    font-size: 1.4rem;
  }

  .flip-header h1 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .card-wrapper {
    height: 220px;
  }

  .card-text {
    font-size: 1.15rem;
  }

  .nav-buttons {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }

  .flip-header h1 {
    font-size: 1.6rem;
  }
}
</style>

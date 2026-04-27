<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface FlipCard {
  id: number
  front: string
  back: string
}

const router = useRouter()
const cards = ref<FlipCard[]>([])
const frontInput = ref('')
const backInput = ref('')

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

const saveCards = () => {
  localStorage.setItem('flip-cards', JSON.stringify(cards.value))
}

const addCard = () => {
  if (!frontInput.value.trim() || !backInput.value.trim()) return
  cards.value.push({
    id: Date.now(),
    front: frontInput.value.trim(),
    back: backInput.value.trim()
  })
  frontInput.value = ''
  backInput.value = ''
  saveCards()
}

const deleteCard = (id: number) => {
  cards.value = cards.value.filter(c => c.id !== id)
  saveCards()
}

onMounted(loadCards)
</script>

<template>
  <div class="edit-page">
    <div class="edit-container">
      <div class="edit-header">
        <button class="back-btn" @click="router.push('/flip-card')">&#8592; Назад</button>
        <h1>Редактирование карточек</h1>
      </div>

      <div class="edit-content">
        <!-- Форма добавления -->
        <div class="add-form">
          <h2>Новая карточка</h2>
          <div class="form-fields">
            <input
              v-model="frontInput"
              type="text"
              placeholder="Текст на лицевой стороне..."
              class="form-input"
              @keyup.enter="addCard"
            />
            <input
              v-model="backInput"
              type="text"
              placeholder="Текст на обратной стороне..."
              class="form-input"
              @keyup.enter="addCard"
            />
            <button
              class="add-btn"
              @click="addCard"
              :disabled="!frontInput.trim() || !backInput.trim()"
            >
              Добавить
            </button>
          </div>
        </div>

        <!-- Список карточек -->
        <div class="cards-list">
          <h2>Карточки ({{ cards.length }})</h2>

          <div v-if="cards.length === 0" class="empty-list">
            Карточек пока нет. Добавьте первую!
          </div>

          <div v-for="(card, index) in cards" :key="card.id" class="card-item">
            <span class="card-number">{{ index + 1 }}</span>
            <div class="card-texts">
              <span class="card-front-text">{{ card.front }}</span>
              <span class="card-separator">→</span>
              <span class="card-back-text">{{ card.back }}</span>
            </div>
            <button class="delete-btn" @click="deleteCard(card.id)">✕</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.edit-page {
  width: 100vw;
  min-height: 100vh;
  background: var(--bg-gradient);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #2c3e50;
}

.edit-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.edit-header {
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

.edit-header h1 {
  font-size: 2rem;
  margin: 0;
  font-weight: 700;
  color: #2c3e50;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-btn {
  position: absolute;
  left: 20px;
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

.back-btn:hover {
  background: var(--primary);
  color: white;
  transform: translateY(-2px);
}

.edit-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  padding: 30px 20px;
  max-width: 640px;
  margin: 0 auto;
  width: 100%;
}

/* Форма добавления */
.add-form {
  width: 100%;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.add-form h2,
.cards-list h2 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 18px 0;
  color: #2c3e50;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-input {
  padding: 13px 18px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  outline: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.form-input:focus {
  box-shadow: 0 0 0 3px var(--primary-glow);
  border-color: var(--primary);
  transform: translateY(-1px);
}

.add-btn {
  padding: 13px;
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

.add-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--primary-glow-strong);
}

.add-btn:disabled {
  background: #B0BEC5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Список карточек */
.cards-list {
  width: 100%;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.empty-list {
  text-align: center;
  color: #546e7a;
  padding: 20px 0;
  font-size: 0.95rem;
}

.card-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  margin-bottom: 10px;
}

.card-item:last-child {
  margin-bottom: 0;
}

.card-number {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--primary);
  min-width: 20px;
  text-align: center;
}

.card-texts {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  overflow: hidden;
}

.card-front-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: #2c3e50;
}

.card-separator {
  color: #90a4ae;
  font-size: 0.9rem;
}

.card-back-text {
  font-size: 0.95rem;
  color: #546e7a;
}

.delete-btn {
  padding: 6px 10px;
  background: rgba(255, 82, 82, 0.15);
  color: #FF5252;
  border: 1px solid rgba(255, 82, 82, 0.3);
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.delete-btn:hover {
  background: #FF5252;
  color: white;
  transform: translateY(-1px);
}

@media (max-width: 480px) {
  .edit-header h1 {
    font-size: 1.4rem;
  }

  .add-form,
  .cards-list {
    padding: 20px;
  }
}
</style>

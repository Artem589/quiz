<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface QuizSet {
  id: string
  name: string
  createdAt: number
}

const router = useRouter()
const sets = ref<QuizSet[]>([])
const activeId = ref<string | null>(null)
const newName = ref('')

const loadSets = () => {
  try { sets.value = JSON.parse(localStorage.getItem('quiz-bank-sets') ?? '[]') }
  catch { sets.value = [] }
}

const saveSets = () => {
  localStorage.setItem('quiz-bank-sets', JSON.stringify(sets.value))
}

const syncActiveBack = () => {
  if (!activeId.value) return
  const current = localStorage.getItem('quiz-questions')
  if (current) localStorage.setItem(`quiz-questions-${activeId.value}`, current)
}

const getCount = (id: string): number => {
  try { return JSON.parse(localStorage.getItem(`quiz-questions-${id}`) ?? '[]').length }
  catch { return 0 }
}

const create = () => {
  if (!newName.value.trim()) return
  const id = Date.now().toString()
  sets.value.push({ id, name: newName.value.trim(), createdAt: Date.now() })
  saveSets()
  localStorage.setItem(`quiz-questions-${id}`, '[]')
  newName.value = ''
}

const activate = (id: string) => {
  syncActiveBack()
  const questions = localStorage.getItem(`quiz-questions-${id}`) ?? '[]'
  localStorage.setItem('quiz-questions', questions)
  localStorage.setItem('active-quiz-set', id)
  activeId.value = id
}

const deactivate = () => {
  syncActiveBack()
  localStorage.removeItem('active-quiz-set')
  activeId.value = null
}

const editSet = (id: string) => {
  activate(id)
  router.push('/edit')
}

const remove = (id: string, name: string) => {
  if (!confirm(`Удалить «${name}»?`)) return
  sets.value = sets.value.filter(s => s.id !== id)
  saveSets()
  localStorage.removeItem(`quiz-questions-${id}`)
  if (activeId.value === id) deactivate()
}

onMounted(() => {
  activeId.value = localStorage.getItem('active-quiz-set')
  syncActiveBack()
  loadSets()
})
</script>

<template>
  <div class="page">
    <div class="container">

      <div class="page-header">
        <button class="back-btn" @click="router.push('/bank')">&#8592; Банк</button>
        <div class="header-text">
          <h1>Банк квизов</h1>
          <p class="header-sub">Темы и наборы вопросов</p>
        </div>
      </div>

      <div class="page-content">

        <!-- Форма создания -->
        <div class="create-form card">
          <h2>Новый набор</h2>
          <div class="form-row">
            <input
              v-model="newName"
              type="text"
              placeholder="Название набора..."
              class="form-input"
              @keyup.enter="create"
            />
            <button class="btn-primary" @click="create" :disabled="!newName.trim()">
              Создать
            </button>
          </div>
        </div>

        <!-- Список наборов -->
        <div class="sets-list">
          <div v-if="sets.length === 0" class="empty">
            Нет наборов. Создайте первый!
          </div>

          <div
            v-for="set in sets"
            :key="set.id"
            class="set-card card"
            :class="{ 'is-active': activeId === set.id }"
          >
            <div class="set-main">
              <div class="set-info">
                <div class="set-name-row">
                  <span class="set-name">{{ set.name }}</span>
                  <span v-if="activeId === set.id" class="active-badge">Активен</span>
                </div>
                <span class="set-meta">{{ getCount(set.id) }} вопросов</span>
              </div>
            </div>

            <div class="set-actions">
              <button
                v-if="activeId !== set.id"
                class="btn-activate"
                @click="activate(set.id)"
              >
                Активировать
              </button>
              <button
                v-else
                class="btn-deactivate"
                @click="deactivate"
              >
                Снять
              </button>
              <button class="btn-edit" @click="editSet(set.id)">
                Редактировать
              </button>
              <button class="btn-delete" @click="remove(set.id, set.name)">
                ✕
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  width: 100vw;
  min-height: 100vh;
  background: var(--bg-gradient);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #2c3e50;
}

.container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-header {
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

.back-btn:hover { background: var(--primary); color: white; transform: translateY(-2px); }

.header-text { display: flex; flex-direction: column; gap: 2px; }

.page-header h1 {
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

.page-content {
  flex: 1;
  padding: 28px;
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.create-form h2 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 14px 0;
  color: #2c3e50;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  outline: none;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-glow);
}

.btn-primary {
  padding: 12px 22px;
  background: var(--primary);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 4px 14px var(--primary-glow);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.btn-primary:disabled { background: #b0bec5; cursor: not-allowed; box-shadow: none; }

.sets-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty {
  text-align: center;
  color: #78909c;
  padding: 32px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.6);
}

.set-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.set-card.is-active {
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.55);
  box-shadow: 0 0 0 2px var(--primary-glow), 0 8px 25px rgba(0, 0, 0, 0.08);
}

.set-main {
  flex: 1;
  min-width: 0;
}

.set-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.set-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active-badge {
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
  background: var(--primary);
  padding: 2px 8px;
  border-radius: 20px;
  white-space: nowrap;
  flex-shrink: 0;
}

.set-meta {
  font-size: 0.82rem;
  color: #90a4ae;
}

.set-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.btn-activate, .btn-deactivate, .btn-edit, .btn-delete {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid transparent;
}

.btn-activate {
  background: var(--primary);
  color: white;
  border-color: rgba(255,255,255,0.3);
}
.btn-activate:hover { background: var(--primary-dark); transform: translateY(-1px); }

.btn-deactivate {
  background: rgba(255,255,255,0.6);
  color: #546e7a;
  border-color: rgba(255,255,255,0.8);
}
.btn-deactivate:hover { background: rgba(255,255,255,0.8); }

.btn-edit {
  background: rgba(255,255,255,0.6);
  color: #2c3e50;
  border-color: rgba(255,255,255,0.8);
}
.btn-edit:hover { background: rgba(255,255,255,0.8); transform: translateY(-1px); }

.btn-delete {
  background: rgba(255,82,82,0.12);
  color: #ff5252;
  border-color: rgba(255,82,82,0.25);
  padding: 8px 11px;
}
.btn-delete:hover { background: #ff5252; color: white; }

@media (max-width: 600px) {
  .page-content { padding: 16px; }
  .set-card { flex-direction: column; align-items: flex-start; }
  .set-actions { width: 100%; }
}
</style>

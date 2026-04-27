<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface Task {
  id: number
  description: string
  answer: string
  timeLimit: number
}

const router = useRouter()
const tasks = ref<Task[]>([])
const description = ref('')
const answer = ref('')
const timeLimit = ref(120)
const addedId = ref<number | null>(null)

const load = () => {
  try { tasks.value = JSON.parse(localStorage.getItem('task-bank') ?? '[]') }
  catch { tasks.value = [] }
}

const save = () => { localStorage.setItem('task-bank', JSON.stringify(tasks.value)) }

const addTask = () => {
  if (!description.value.trim() || !answer.value.trim()) return
  tasks.value.push({
    id: Date.now(),
    description: description.value.trim(),
    answer: answer.value.trim(),
    timeLimit: timeLimit.value,
  })
  save()
  description.value = ''
  answer.value = ''
  timeLimit.value = 120
}

const removeTask = (id: number) => {
  tasks.value = tasks.value.filter(t => t.id !== id)
  save()
}

const addToQuiz = (task: Task) => {
  const raw = localStorage.getItem('quiz-questions') ?? '[]'
  const questions = JSON.parse(raw)
  const newQ = {
    id: Date.now(),
    image: '',
    description: task.description,
    answer: task.answer,
    timeLimit: task.timeLimit,
  }
  questions.push(newQ)
  localStorage.setItem('quiz-questions', JSON.stringify(questions))
  const activeId = localStorage.getItem('active-quiz-set')
  if (activeId) localStorage.setItem(`quiz-questions-${activeId}`, JSON.stringify(questions))
  addedId.value = task.id
  setTimeout(() => { addedId.value = null }, 1800)
}

const formatTime = (s: number) => s >= 60 ? `${Math.floor(s / 60)} мин` : `${s} сек`

onMounted(load)
</script>

<template>
  <div class="page">
    <div class="container">

      <div class="page-header">
        <button class="back-btn" @click="router.push('/bank')">&#8592; Банк</button>
        <div class="header-text">
          <h1>Банк задач</h1>
          <p class="header-sub">Библиотека вопросов для квизов</p>
        </div>
      </div>

      <div class="page-content">

        <!-- Форма добавления -->
        <div class="card create-form">
          <h2>Новая задача</h2>
          <div class="form-fields">
            <textarea
              v-model="description"
              placeholder="Описание задачи / вопрос..."
              class="form-input form-textarea"
              rows="3"
            />
            <div class="form-row">
              <input
                v-model="answer"
                type="text"
                placeholder="Правильный ответ..."
                class="form-input"
              />
              <div class="time-field">
                <label class="time-label">Время</label>
                <select v-model="timeLimit" class="form-select">
                  <option :value="30">30 сек</option>
                  <option :value="60">1 мин</option>
                  <option :value="90">1.5 мин</option>
                  <option :value="120">2 мин</option>
                  <option :value="180">3 мин</option>
                  <option :value="300">5 мин</option>
                  <option :value="600">10 мин</option>
                </select>
              </div>
            </div>
            <button
              class="btn-primary"
              @click="addTask"
              :disabled="!description.trim() || !answer.trim()"
            >
              Добавить в банк
            </button>
          </div>
        </div>

        <!-- Список задач -->
        <div class="tasks-list">
          <div v-if="tasks.length === 0" class="empty">
            Банк задач пуст. Добавьте первую задачу!
          </div>

          <div v-for="task in tasks" :key="task.id" class="task-card card">
            <div class="task-body">
              <p class="task-desc">{{ task.description }}</p>
              <div class="task-meta">
                <span class="meta-item">
                  <span class="meta-label">Ответ:</span>
                  <span class="meta-val">{{ task.answer }}</span>
                </span>
                <span class="meta-item">
                  <span class="meta-label">Время:</span>
                  <span class="meta-val">{{ formatTime(task.timeLimit) }}</span>
                </span>
              </div>
            </div>
            <div class="task-actions">
              <button
                class="btn-add"
                :class="{ 'btn-added': addedId === task.id }"
                @click="addToQuiz(task)"
              >
                {{ addedId === task.id ? '✓ Добавлено' : '+ В квиз' }}
              </button>
              <button class="btn-delete" @click="removeTask(task.id)">✕</button>
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

.container { width: 100%; min-height: 100vh; display: flex; flex-direction: column; }

.page-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 28px;
  background: rgba(255,255,255,0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,0.5);
}

.back-btn {
  padding: 10px 20px;
  background: rgba(255,255,255,0.6);
  color: #2c3e50;
  border: 1px solid rgba(255,255,255,0.8);
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
.page-header h1 { font-size: 2rem; margin: 0; font-weight: 700; color: #2c3e50; }
.header-sub { margin: 0; font-size: 0.82rem; color: #78909c; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; }

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
  background: rgba(255,255,255,0.4);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 22px 24px;
  border: 1px solid rgba(255,255,255,0.6);
  box-shadow: 0 6px 20px rgba(0,0,0,0.07);
}

.create-form h2 { font-size: 1rem; font-weight: 700; margin: 0 0 16px 0; color: #2c3e50; }

.form-fields { display: flex; flex-direction: column; gap: 12px; }
.form-row { display: flex; gap: 12px; }

.form-input {
  flex: 1;
  padding: 11px 15px;
  border: 1px solid rgba(255,255,255,0.8);
  border-radius: 8px;
  font-size: 0.95rem;
  background: rgba(255,255,255,0.9);
  color: #2c3e50;
  outline: none;
  transition: all 0.3s ease;
  font-family: inherit;
}
.form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }
.form-textarea { resize: vertical; min-height: 80px; }

.time-field { display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }
.time-label { font-size: 0.75rem; font-weight: 600; color: #78909c; }

.form-select {
  padding: 11px 12px;
  border: 1px solid rgba(255,255,255,0.8);
  border-radius: 8px;
  font-size: 0.9rem;
  background: rgba(255,255,255,0.9);
  color: #2c3e50;
  outline: none;
  cursor: pointer;
  font-family: inherit;
}

.btn-primary {
  padding: 12px;
  background: var(--primary);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px var(--primary-glow);
}
.btn-primary:hover:not(:disabled) { background: var(--primary-dark); transform: translateY(-1px); }
.btn-primary:disabled { background: #b0bec5; cursor: not-allowed; box-shadow: none; }

.tasks-list { display: flex; flex-direction: column; gap: 10px; }

.empty {
  text-align: center;
  color: #78909c;
  padding: 32px;
  background: rgba(255,255,255,0.25);
  border-radius: 12px;
  border: 1px dashed rgba(255,255,255,0.6);
  font-size: 0.9rem;
}

.task-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 20px;
}

.task-body { flex: 1; min-width: 0; }

.task-desc {
  font-size: 0.95rem;
  font-weight: 500;
  color: #2c3e50;
  margin: 0 0 10px 0;
  line-height: 1.45;
}

.task-meta { display: flex; gap: 20px; flex-wrap: wrap; }

.meta-item { display: flex; align-items: center; gap: 5px; font-size: 0.82rem; }
.meta-label { color: #90a4ae; }
.meta-val { font-weight: 600; color: #546e7a; font-family: 'Monaco', 'Consolas', monospace; }

.task-actions { display: flex; gap: 8px; flex-shrink: 0; flex-direction: column; }

.btn-add, .btn-delete {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid transparent;
  white-space: nowrap;
}

.btn-add { background: var(--primary-bg-light); color: var(--primary); border-color: var(--primary-glow); }
.btn-add:hover { background: var(--primary); color: white; }
.btn-add.btn-added { background: rgba(0,150,136,0.15); color: #009688; border-color: rgba(0,150,136,0.3); }
.btn-delete { background: rgba(255,82,82,0.1); color: #ff5252; border-color: rgba(255,82,82,0.2); text-align: center; }
.btn-delete:hover { background: #ff5252; color: white; }

@media (max-width: 600px) {
  .page-content { padding: 16px; }
  .task-card { flex-direction: column; }
  .task-actions { flex-direction: row; width: 100%; }
}
</style>

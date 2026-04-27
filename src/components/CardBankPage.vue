<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface CardSet {
  id: string
  name: string
  createdAt: number
}

interface TextItem {
  id: number
  front: string
  back: string
}

const router = useRouter()
const sets = ref<CardSet[]>([])
const activeId = ref<string | null>(null)
const newSetName = ref('')
const newFront = ref('')
const newBack = ref('')
const textItems = ref<TextItem[]>([])
const addedId = ref<number | null>(null)

/* ── Sets ── */
const loadSets = () => {
  try { sets.value = JSON.parse(localStorage.getItem('card-bank-sets') ?? '[]') }
  catch { sets.value = [] }
}
const saveSets = () => { localStorage.setItem('card-bank-sets', JSON.stringify(sets.value)) }

const syncActiveBack = () => {
  if (!activeId.value) return
  const current = localStorage.getItem('flip-cards')
  if (current) localStorage.setItem(`flip-cards-${activeId.value}`, current)
}

const getCount = (id: string): number => {
  try { return JSON.parse(localStorage.getItem(`flip-cards-${id}`) ?? '[]').length }
  catch { return 0 }
}

const createSet = () => {
  if (!newSetName.value.trim()) return
  const id = Date.now().toString()
  sets.value.push({ id, name: newSetName.value.trim(), createdAt: Date.now() })
  saveSets()
  localStorage.setItem(`flip-cards-${id}`, '[]')
  newSetName.value = ''
}

const activateSet = (id: string) => {
  syncActiveBack()
  const cards = localStorage.getItem(`flip-cards-${id}`) ?? '[]'
  localStorage.setItem('flip-cards', cards)
  localStorage.setItem('active-card-set', id)
  activeId.value = id
}

const deactivateSet = () => {
  syncActiveBack()
  localStorage.removeItem('active-card-set')
  activeId.value = null
}

const editSet = (id: string) => {
  activateSet(id)
  router.push('/flip-card/edit')
}

const removeSet = (id: string, name: string) => {
  if (!confirm(`Удалить «${name}»?`)) return
  sets.value = sets.value.filter(s => s.id !== id)
  saveSets()
  localStorage.removeItem(`flip-cards-${id}`)
  if (activeId.value === id) deactivateSet()
}

/* ── Text bank ── */
const loadTexts = () => {
  try { textItems.value = JSON.parse(localStorage.getItem('card-text-bank') ?? '[]') }
  catch { textItems.value = [] }
}
const saveTexts = () => { localStorage.setItem('card-text-bank', JSON.stringify(textItems.value)) }

const addText = () => {
  if (!newFront.value.trim() || !newBack.value.trim()) return
  textItems.value.push({ id: Date.now(), front: newFront.value.trim(), back: newBack.value.trim() })
  saveTexts()
  newFront.value = ''
  newBack.value = ''
}

const removeText = (id: number) => {
  textItems.value = textItems.value.filter(t => t.id !== id)
  saveTexts()
}

const addToActiveSet = (item: TextItem) => {
  const raw = localStorage.getItem('flip-cards') ?? '[]'
  const cards = JSON.parse(raw)
  cards.push({ id: Date.now(), front: item.front, back: item.back })
  localStorage.setItem('flip-cards', JSON.stringify(cards))
  if (activeId.value) {
    localStorage.setItem(`flip-cards-${activeId.value}`, JSON.stringify(cards))
  }
  addedId.value = item.id
  setTimeout(() => { addedId.value = null }, 1800)
}

onMounted(() => {
  activeId.value = localStorage.getItem('active-card-set')
  syncActiveBack()
  loadSets()
  loadTexts()
})
</script>

<template>
  <div class="page">
    <div class="container">

      <div class="page-header">
        <button class="back-btn" @click="router.push('/bank')">&#8592; Банк</button>
        <div class="header-text">
          <h1>Банк карточек</h1>
          <p class="header-sub">Наборы и библиотека текстов</p>
        </div>
      </div>

      <div class="page-content">

        <!-- Наборы карточек -->
        <section class="section">
          <h2 class="section-title">Наборы карточек</h2>

          <div class="card create-form">
            <div class="form-row">
              <input v-model="newSetName" type="text" placeholder="Название набора..." class="form-input" @keyup.enter="createSet" />
              <button class="btn-primary" @click="createSet" :disabled="!newSetName.trim()">Создать</button>
            </div>
          </div>

          <div class="sets-list">
            <div v-if="sets.length === 0" class="empty">Наборов пока нет</div>

            <div
              v-for="set in sets"
              :key="set.id"
              class="set-card card"
              :class="{ 'is-active': activeId === set.id }"
            >
              <div class="set-main">
                <div class="set-name-row">
                  <span class="set-name">{{ set.name }}</span>
                  <span v-if="activeId === set.id" class="active-badge">Активен</span>
                </div>
                <span class="set-meta">{{ getCount(set.id) }} карточек</span>
              </div>
              <div class="set-actions">
                <button v-if="activeId !== set.id" class="btn-activate" @click="activateSet(set.id)">Активировать</button>
                <button v-else class="btn-deactivate" @click="deactivateSet">Снять</button>
                <button class="btn-edit" @click="editSet(set.id)">Редактировать</button>
                <button class="btn-delete" @click="removeSet(set.id, set.name)">✕</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Банк текстов -->
        <section class="section">
          <h2 class="section-title">Библиотека текстов</h2>

          <div class="card create-form">
            <div class="form-col">
              <input v-model="newFront" type="text" placeholder="Лицевая сторона..." class="form-input" />
              <input v-model="newBack" type="text" placeholder="Обратная сторона..." class="form-input" @keyup.enter="addText" />
              <button class="btn-primary" @click="addText" :disabled="!newFront.trim() || !newBack.trim()">
                Добавить в библиотеку
              </button>
            </div>
          </div>

          <div class="texts-list">
            <div v-if="textItems.length === 0" class="empty">Библиотека пуста</div>

            <div v-for="item in textItems" :key="item.id" class="text-item card">
              <div class="text-content">
                <span class="text-front">{{ item.front }}</span>
                <span class="text-sep">→</span>
                <span class="text-back">{{ item.back }}</span>
              </div>
              <div class="text-actions">
                <button
                  class="btn-add"
                  @click="addToActiveSet(item)"
                  :class="{ 'btn-added': addedId === item.id }"
                >
                  {{ addedId === item.id ? '✓ Добавлено' : '+ В активный набор' }}
                </button>
                <button class="btn-delete" @click="removeText(item.id)">✕</button>
              </div>
            </div>
          </div>
        </section>

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
  gap: 32px;
}

.section { display: flex; flex-direction: column; gap: 14px; }

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0,0,0,0.07);
}

.card {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 20px 22px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.07);
}

.form-row { display: flex; gap: 12px; }
.form-col { display: flex; flex-direction: column; gap: 10px; }

.form-input {
  flex: 1;
  padding: 11px 15px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  outline: none;
  transition: all 0.3s ease;
}
.form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }

.btn-primary {
  padding: 11px 20px;
  background: var(--primary);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 4px 14px var(--primary-glow);
}
.btn-primary:hover:not(:disabled) { background: var(--primary-dark); transform: translateY(-1px); }
.btn-primary:disabled { background: #b0bec5; cursor: not-allowed; box-shadow: none; }

.sets-list, .texts-list { display: flex; flex-direction: column; gap: 10px; }

.empty {
  text-align: center;
  color: #78909c;
  padding: 28px;
  background: rgba(255,255,255,0.25);
  border-radius: 12px;
  border: 1px dashed rgba(255,255,255,0.6);
  font-size: 0.9rem;
}

.set-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
}

.set-card.is-active {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-glow), 0 6px 20px rgba(0,0,0,0.07);
}

.set-main { flex: 1; min-width: 0; }
.set-name-row { display: flex; align-items: center; gap: 10px; margin-bottom: 3px; }
.set-name { font-size: 1rem; font-weight: 700; color: #2c3e50; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.active-badge { font-size: 0.68rem; font-weight: 700; color: white; background: var(--primary); padding: 2px 8px; border-radius: 20px; flex-shrink: 0; }
.set-meta { font-size: 0.8rem; color: #90a4ae; }

.set-actions { display: flex; gap: 8px; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }

.btn-activate, .btn-deactivate, .btn-edit, .btn-delete, .btn-add {
  padding: 7px 13px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid transparent;
}

.btn-activate { background: var(--primary); color: white; border-color: rgba(255,255,255,0.3); }
.btn-activate:hover { background: var(--primary-dark); }
.btn-deactivate { background: rgba(255,255,255,0.6); color: #546e7a; border-color: rgba(255,255,255,0.8); }
.btn-deactivate:hover { background: rgba(255,255,255,0.85); }
.btn-edit { background: rgba(255,255,255,0.6); color: #2c3e50; border-color: rgba(255,255,255,0.8); }
.btn-edit:hover { background: rgba(255,255,255,0.85); }
.btn-delete { background: rgba(255,82,82,0.1); color: #ff5252; border-color: rgba(255,82,82,0.2); padding: 7px 10px; }
.btn-delete:hover { background: #ff5252; color: white; }

.text-item { display: flex; align-items: center; gap: 14px; padding: 14px 18px; }
.text-content { flex: 1; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; min-width: 0; overflow: hidden; }
.text-front { font-size: 0.9rem; font-weight: 600; color: #2c3e50; }
.text-sep { color: #90a4ae; font-size: 0.85rem; flex-shrink: 0; }
.text-back { font-size: 0.9rem; color: #546e7a; }

.text-actions { display: flex; gap: 8px; flex-shrink: 0; }

.btn-add { background: var(--primary-bg-light); color: var(--primary); border-color: var(--primary-glow); }
.btn-add:hover { background: var(--primary); color: white; }
.btn-add.btn-added { background: rgba(0,150,136,0.15); color: #009688; border-color: rgba(0,150,136,0.3); }

@media (max-width: 600px) {
  .page-content { padding: 16px; }
  .set-card { flex-direction: column; align-items: flex-start; }
  .set-actions { width: 100%; }
  .text-item { flex-direction: column; align-items: flex-start; }
  .text-actions { width: 100%; }
}
</style>

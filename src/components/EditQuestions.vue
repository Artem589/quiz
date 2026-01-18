<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Question } from '../types.ts'


const router = useRouter()

// Состояния
const questions = ref<Question[]>([])
const expandedQuestions = ref<number[]>([])
const savedQuestions = ref<number[]>([])
const imageLoading = ref<number | null>(null)
const imageErrors = ref<Record<number, boolean>>({})
const draggingQuestionId = ref<number | null>(null)
const showImportDialog = ref(false)
const importData = ref('')
const importFileInput = ref<HTMLInputElement>()

// Пресеты времени
const timePresets = [30, 60, 90, 120, 180]

// Статистика
const totalTime = computed(() => {
  return questions.value.reduce((sum, q) => sum + q.timeLimit, 0)
})

const averageTime = computed(() => {
  if (questions.value.length === 0) return 0
  return Math.round(totalTime.value / questions.value.length)
})

// Загрузка вопросов при монтировании
onMounted(() => {
  loadQuestions()
})

// Загрузка вопросов из localStorage
const loadQuestions = () => {
  const saved = localStorage.getItem('quiz-questions')
  if (saved) {
    try {
      questions.value = JSON.parse(saved)
      // Разворачиваем первый вопрос для удобства
      if (questions.value.length > 0) {
        expandedQuestions.value = [questions.value[0].id]
      }
    } catch (e) {
      console.error('Ошибка загрузки вопросов:', e)
      loadDefaultQuestions()
    }
  } else {
    loadDefaultQuestions()
  }
}

// Загрузка вопросов по умолчанию
const loadDefaultQuestions = () => {
  questions.value = [
    {
      id: 1,
      image: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Teorema_chevy.svg',
      description: 'Сколько планет в Солнечной системе?',
      answer: '8',
      timeLimit: 120
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=400&fit=crop',
      description: 'Какая самая длинная река в мире?',
      answer: 'Нил',
      timeLimit: 120
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1519996529934-eee4e47ae1c5?w=800&h=400&fit=crop',
      description: 'Столица Японии?',
      answer: 'Токио',
      timeLimit: 120
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800&h=400&fit=crop',
      description: 'Сколько элементов в периодической таблице?',
      answer: '118',
      timeLimit: 120
    }
  ]
}

// Добавление нового вопроса
const addNewQuestion = () => {
  const newId = questions.value.length > 0
      ? Math.max(...questions.value.map(q => q.id)) + 1
      : 1

  const newQuestion: Question = {
    id: newId,
    image: '',
    description: '',
    answer: '',
    timeLimit: 60
  }

  questions.value.push(newQuestion)
  expandedQuestions.value.push(newId)
}

// Удаление вопроса
const removeQuestion = (index: number) => {
  if (confirm('Удалить этот вопрос?')) {
    const questionId = questions.value[index].id
    questions.value.splice(index, 1)
    // Удаляем из списка развернутых
    const expandedIndex = expandedQuestions.value.indexOf(questionId)
    if (expandedIndex > -1) {
      expandedQuestions.value.splice(expandedIndex, 1)
    }
  }
}

// Дублирование вопроса
const duplicateQuestion = (index: number) => {
  const original = questions.value[index]
  const newId = Math.max(...questions.value.map(q => q.id)) + 1

  const duplicate: Question = {
    ...JSON.parse(JSON.stringify(original)),
    id: newId,
    description: original.description + ' (копия)'
  }

  questions.value.splice(index + 1, 0, duplicate)
  expandedQuestions.value.push(newId)
}

// Переключение развернутого состояния
const toggleExpand = (questionId: number) => {
  const index = expandedQuestions.value.indexOf(questionId)
  if (index > -1) {
    expandedQuestions.value.splice(index, 1)
  } else {
    expandedQuestions.value.push(questionId)
  }
}

// Валидация изображения
const validateImage = async (question: Question) => {
  if (!question.image) {
    delete imageErrors.value[question.id]
    return
  }

  imageLoading.value = question.id
  delete imageErrors.value[question.id]

  try {
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = question.image
    })
  } catch (e) {
    imageErrors.value[question.id] = true
  } finally {
    imageLoading.value = null
  }
}

// Ошибка загрузки изображения
const handleImageError = (question: Question) => {
  imageErrors.value[question.id] = true
}

// Загрузка файла
const openImageUpload = (index: number) => {
  const questionId = questions.value[index].id
  const input = document.querySelector(`input[ref="fileInput-${questionId}"]`) as HTMLInputElement
  input?.click()
}

const handleFileUpload = (event: Event, question: Question) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
      if (e.target?.result) {
        question.image = e.target.result as string
        validateImage(question)
      }
    }

    reader.readAsDataURL(file)
    input.value = '' // Сброс input
  }
}

// Обновление значения времени
const updateTimeValue = (question: Question) => {
  // Ограничиваем значение
  if (question.timeLimit < 10) question.timeLimit = 10
  if (question.timeLimit > 300) question.timeLimit = 300
}

// Сохранение изменений отдельного вопроса
const saveQuestionChanges = (index: number) => {
  const question = questions.value[index]
  savedQuestions.value.push(question.id)
  setTimeout(() => {
    const idx = savedQuestions.value.indexOf(question.id)
    if (idx > -1) {
      savedQuestions.value.splice(idx, 1)
    }
  }, 2000)
}

// Сохранение всех вопросов
const saveAllQuestions = () => {
  try {
    localStorage.setItem('quiz-questions', JSON.stringify(questions.value))
    alert(`✅ Сохранено ${questions.value.length} вопросов!`)
  } catch (e) {
    alert('❌ Ошибка сохранения: ' + e)
  }
}

// Drag & Drop
const handleDragStart = (event: DragEvent, questionId: number) => {
  draggingQuestionId.value = questionId
  event.dataTransfer?.setData('text/plain', questionId.toString())
}

const handleDragOver = (event: DragEvent, index: number) => {
  event.preventDefault()
  // Можно добавить визуальную обратную связь
}

const handleDrop = (event: DragEvent, targetIndex: number) => {
  event.preventDefault()
  const sourceId = parseInt(event.dataTransfer?.getData('text/plain') || '0')
  const sourceIndex = questions.value.findIndex(q => q.id === sourceId)

  if (sourceIndex !== -1 && sourceIndex !== targetIndex) {
    const [movedQuestion] = questions.value.splice(sourceIndex, 1)
    questions.value.splice(targetIndex, 0, movedQuestion)
  }

  draggingQuestionId.value = null
}

// Экспорт вопросов
const exportQuestions = () => {
  const dataStr = JSON.stringify(questions.value, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

  const exportFileDefaultName = 'quiz-questions.json'

  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}

// Импорт вопросов
const importQuestions = () => {
  showImportDialog.value = true
}

const processImport = () => {
  try {
    const imported = JSON.parse(importData.value)
    if (Array.isArray(imported) && imported.length > 0) {
      // Проверяем структуру
      const firstItem = imported[0]
      if (firstItem.id && firstItem.timeLimit && firstItem.answer !== undefined) {
        questions.value = imported.map((q, index) => ({
          ...q,
          id: q.id || Date.now() + index
        }))
        showImportDialog.value = false
        importData.value = ''
        alert(`✅ Импортировано ${imported.length} вопросов`)
      } else {
        throw new Error('Неправильная структура данных')
      }
    } else {
      throw new Error('Нет данных для импорта')
    }
  } catch (e) {
    alert('❌ Ошибка импорта: ' + e)
  }
}

const handleImportFile = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        importData.value = e.target.result as string
        processImport()
      }
    }
    reader.readAsText(input.files[0])
    input.value = ''
  }
}
</script>

<template>
  <div class="edit-quiz-app">
    <div class="edit-quiz-container">
      <div class="edit-quiz-header">
        <h1>Редактирование вопросов</h1>
        <div class="header-actions">
          <router-link to="/" class="back-btn">
            ← Назад к квизу
          </router-link>
        </div>
      </div>

      <div class="edit-quiz-content">
        <!-- Список вопросов -->
        <div class="questions-list">
          <div
              v-for="(question, index) in questions"
              :key="question.id"
              class="question-edit-card"
              :class="{ 'is-dragging': question.id === draggingQuestionId }"
              draggable="true"
              @dragstart="handleDragStart($event, question.id)"
              @dragover.prevent="handleDragOver($event, index)"
              @drop="handleDrop($event, index)"
          >
            <!-- Заголовок вопроса -->
            <div class="question-header">
              <div class="question-number">
                <span class="number">#{{ index + 1 }}</span>
                <span class="id">ID: {{ question.id }}</span>
              </div>
              <div class="question-actions">
                <button
                    @click="toggleExpand(question.id)"
                    class="expand-btn"
                    :class="{ 'expanded': expandedQuestions.includes(question.id) }"
                >
                  {{ expandedQuestions.includes(question.id) ? '▲' : '▼' }}
                </button>
                <button
                    @click="duplicateQuestion(index)"
                    class="action-btn duplicate"
                    title="Дублировать"
                >
                  📋
                </button>
                <button
                    @click="removeQuestion(index)"
                    class="action-btn delete"
                    title="Удалить"
                >
                  🗑️
                </button>
              </div>
            </div>

            <!-- Свернутое представление -->
            <div v-if="!expandedQuestions.includes(question.id)" class="question-preview">
              <div class="preview-image">
                <img
                    v-if="question.image"
                    :src="question.image"
                    alt="Preview"
                    class="preview-img"
                />
                <div v-else class="no-image">📷 Нет изображения</div>
              </div>
              <div class="preview-info">
                <div class="preview-description">
                  {{ question.description || 'Без описания' }}
                </div>
                <div class="preview-meta">
                  <span class="meta-item">
                    <span class="meta-label">Ответ:</span>
                    <span class="meta-value">{{ question.answer || 'Не задан' }}</span>
                  </span>
                  <span class="meta-item">
                    <span class="meta-label">Время:</span>
                    <span class="meta-value">{{ question.timeLimit }} сек</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Развернутая форма редактирования -->
            <div v-if="expandedQuestions.includes(question.id)" class="question-edit-form">
              <!-- Поле для изображения -->
              <div class="form-section">
                <label class="form-label">
                  <span class="label-text">Изображение</span>
                  <span class="label-hint">(URL или загрузка)</span>
                </label>
                <div class="image-input-group">
                  <input
                      v-model="question.image"
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      class="form-input image-url"
                      @change="validateImage(question)"
                  />
                  <button
                      @click="openImageUpload(index)"
                      class="upload-btn"
                  >
                    📁 Загрузить
                  </button>
                </div>

                <!-- Предпросмотр изображения -->
                <div v-if="question.image" class="image-preview">
                  <div class="preview-container">
                    <img
                        :src="question.image"
                        alt="Предпросмотр"
                        class="preview-image"
                        @error="handleImageError(question)"
                    />
                    <button
                        @click="question.image = ''"
                        class="remove-image-btn"
                        title="Удалить изображение"
                    >
                      ✕
                    </button>
                  </div>
                  <div v-if="imageLoading === question.id" class="image-loading">
                    Загрузка...
                  </div>
                  <div v-else-if="imageErrors[question.id]" class="image-error">
                    Ошибка загрузки изображения
                  </div>
                </div>

                <!-- Скрытый input для загрузки файлов -->
                <input
                    type="file"
                    :ref="`fileInput-${question.id}`"
                    class="file-input"
                    accept="image/*"
                    @change="handleFileUpload($event, question)"
                />
              </div>

              <!-- Поле для описания -->
              <div class="form-section">
                <label class="form-label">
                  <span class="label-text">Описание вопроса</span>
                  <span class="label-hint">(отображается под изображением)</span>
                </label>
                <textarea
                    v-model="question.description"
                    rows="3"
                    placeholder="Введите описание вопроса..."
                    class="form-textarea"
                ></textarea>
              </div>

              <!-- Поле для ответа -->
              <div class="form-section">
                <label class="form-label">
                  <span class="label-text">Правильный ответ</span>
                  <span class="label-hint">(точный ответ для проверки)</span>
                </label>
                <input
                    v-model="question.answer"
                    type="text"
                    placeholder="Введите правильный ответ..."
                    class="form-input"
                />
              </div>

              <!-- Поле для времени -->
              <div class="form-section">
                <label class="form-label">
                  <span class="label-text">Лимит времени (секунды)</span>
                  <span class="label-hint">(от 10 до 300 секунд)</span>
                </label>
                <div class="time-input-group">
                  <input
                      v-model.number="question.timeLimit"
                      type="range"
                      min="10"
                      max="300"
                      step="5"
                      class="time-slider"
                      @input="updateTimeValue(question)"
                  />
                  <div class="time-display">
                    <span class="time-value">{{ question.timeLimit }}</span>
                    <span class="time-unit">сек</span>
                  </div>
                </div>
                <div class="time-presets">
                  <button
                      v-for="preset in timePresets"
                      :key="preset"
                      @click="question.timeLimit = preset"
                      class="time-preset-btn"
                      :class="{ 'active': question.timeLimit === preset }"
                  >
                    {{ preset }} сек
                  </button>
                </div>
              </div>

              <!-- Сохранение изменений для конкретного вопроса -->
              <div class="form-actions">
                <button
                    @click="saveQuestionChanges(index)"
                    class="save-question-btn"
                    :class="{ 'saved': savedQuestions.includes(question.id) }"
                >
                  {{ savedQuestions.includes(question.id) ? '✓ Сохранено' : '💾 Сохранить вопрос' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопка добавления нового вопроса -->
        <div class="add-question-section">
          <button @click="addNewQuestion" class="add-question-btn">
            <span class="plus-icon">+</span>
            Добавить новый вопрос
          </button>
        </div>

        <!-- Общие действия -->
        <div class="global-actions">
          <div class="stats">
            <div class="stat-item">
              <span class="stat-label">Всего вопросов:</span>
              <span class="stat-value">{{ questions.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Общее время:</span>
              <span class="stat-value">{{ totalTime }} сек</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Среднее время:</span>
              <span class="stat-value">{{ averageTime }} сек</span>
            </div>
          </div>

          <div class="action-buttons">
            <button @click="saveAllQuestions" class="save-all-btn">
              💾 Сохранить все изменения
            </button>
            <button @click="loadDefaultQuestions" class="load-default-btn">
              🔄 Загрузить примеры
            </button>
            <button @click="exportQuestions" class="export-btn">
              📤 Экспорт
            </button>
            <button @click="importQuestions" class="import-btn">
              📥 Импорт
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог импорта -->
    <div v-if="showImportDialog" class="modal-overlay" @click="showImportDialog = false">
      <div class="modal-content" @click.stop>
        <h3>Импорт вопросов</h3>
        <textarea
            v-model="importData"
            placeholder="Вставьте JSON с вопросами..."
            rows="10"
            class="import-textarea"
        ></textarea>
        <div class="modal-actions">
          <button @click="showImportDialog = false" class="modal-btn cancel">
            Отмена
          </button>
          <button @click="processImport" class="modal-btn confirm">
            Импортировать
          </button>
        </div>
      </div>
    </div>

    <!-- Скрытый input для импорта файлов -->
    <input
        type="file"
        ref="importFileInput"
        class="hidden-input"
        accept=".json"
        @change="handleImportFile"
    />
  </div>
</template>

<style scoped>
.edit-quiz-app {
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #a8edea 0%, #eee 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #2c3e50;
  overflow-x: hidden;
}

.edit-quiz-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.edit-quiz-header {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  padding: 20px 30px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.edit-quiz-header h1 {
  font-size: 2.5rem;
  margin: 0;
  font-weight: 700;
  color: #2c3e50;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.back-btn {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: #2c3e50;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* Список вопросов */
.questions-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.question-edit-card {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(15px);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.question-edit-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

.question-edit-card.is-dragging {
  opacity: 0.5;
  background: rgba(255, 255, 255, 0.2);
}

/* Заголовок вопроса */
.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
}

.question-number {
  display: flex;
  align-items: center;
  gap: 15px;
}

.number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #00BCD4;
  background: rgba(0, 188, 212, 0.1);
  padding: 5px 12px;
  border-radius: 8px;
}

.id {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-family: 'Monaco', 'Consolas', monospace;
}

.question-actions {
  display: flex;
  gap: 10px;
}

.expand-btn,
.action-btn {
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 6px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
}

.expand-btn:hover,
.action-btn:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: translateY(-1px);
}

.expand-btn.expanded {
  background: rgba(0, 188, 212, 0.2);
  border-color: #00BCD4;
}

.action-btn.duplicate:hover {
  background: rgba(52, 152, 219, 0.2);
  border-color: #3498db;
}

.action-btn.delete:hover {
  background: rgba(231, 76, 60, 0.2);
  border-color: #e74c3c;
}

/* Предпросмотр вопроса */
.question-preview {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 20px;
  align-items: center;
}

.preview-image {
  width: 120px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  color: #7f8c8d;
  font-size: 0.9rem;
  text-align: center;
  padding: 10px;
}

.preview-info {
  flex: 1;
}

.preview-description {
  font-size: 1.1rem;
  margin-bottom: 10px;
  color: #2c3e50;
  font-weight: 500;
}

.preview-meta {
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.meta-label {
  color: #7f8c8d;
}

.meta-value {
  font-weight: 600;
  color: #2c3e50;
  font-family: 'Monaco', 'Consolas', monospace;
}

/* Форма редактирования */
.question-edit-form {
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.4);
}

.form-section {
  margin-bottom: 25px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.label-text {
  margin-right: 8px;
}

.label-hint {
  font-size: 0.85rem;
  color: #7f8c8d;
  font-weight: normal;
}

.image-input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.form-input {
  flex: 1;
  padding: 12px 15px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  transition: all 0.3s ease;
  outline: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.form-input:focus {
  box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.3);
  transform: translateY(-1px);
  border-color: #00BCD4;
}

.form-input.image-url {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9rem;
}

.upload-btn {
  background: #00BCD4;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.upload-btn:hover {
  background: #0097A7;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 188, 212, 0.4);
}

.image-preview {
  margin-top: 15px;
}

.preview-container {
  position: relative;
  max-width: 300px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.preview-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(231, 76, 60, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-image-btn:hover {
  background: #c0392b;
  transform: scale(1.1);
}

.image-loading,
.image-error {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
}

.image-loading {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.image-error {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.form-textarea {
  width: 100%;
  padding: 12px 15px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  transition: all 0.3s ease;
  outline: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.form-textarea:focus {
  box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.3);
  transform: translateY(-1px);
  border-color: #00BCD4;
}

/* Ввод времени */
.time-input-group {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
}

.time-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 3px;
  outline: none;
}

.time-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #00BCD4;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 188, 212, 0.5);
  transition: all 0.3s ease;
}

.time-slider::-webkit-slider-thumb:hover {
  background: #0097A7;
  transform: scale(1.1);
}

.time-display {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.4);
  padding: 8px 15px;
  border-radius: 8px;
  min-width: 80px;
  justify-content: center;
}

.time-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #00BCD4;
  font-family: 'Monaco', 'Consolas', monospace;
}

.time-unit {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.time-presets {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.time-preset-btn {
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.time-preset-btn:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: translateY(-1px);
}

.time-preset-btn.active {
  background: rgba(0, 188, 212, 0.2);
  border-color: #00BCD4;
  color: #0097A7;
  font-weight: 600;
}

/* Кнопки действий */
.form-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed rgba(255, 255, 255, 0.4);
}

.save-question-btn {
  background: rgba(46, 204, 113, 0.2);
  border: 1px solid rgba(46, 204, 113, 0.4);
  color: #27ae60;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-question-btn:hover {
  background: rgba(46, 204, 113, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.2);
}

.save-question-btn.saved {
  background: rgba(46, 204, 113, 0.4);
  border-color: #2ecc71;
}

/* Добавление нового вопроса */
.add-question-section {
  margin: 30px 0;
  text-align: center;
}

.add-question-btn {
  background: rgba(155, 89, 182, 0.2);
  border: 2px dashed rgba(155, 89, 182, 0.4);
  color: #8e44ad;
  padding: 15px 30px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.add-question-btn:hover {
  background: rgba(155, 89, 182, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(155, 89, 182, 0.2);
}

.plus-icon {
  font-size: 1.5rem;
  font-weight: bold;
}

/* Общие действия */
.global-actions {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 25px;
  margin-top: 30px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.6);
  padding: 15px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.95rem;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2c3e50;
  font-family: 'Monaco', 'Consolas', monospace;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.save-all-btn,
.load-default-btn,
.export-btn,
.import-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
}

.save-all-btn {
  background: rgba(46, 204, 113, 0.9);
  color: white;
}

.save-all-btn:hover {
  background: #27ae60;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4);
}

.load-default-btn {
  background: rgba(52, 152, 219, 0.9);
  color: white;
}

.load-default-btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

.export-btn {
  background: rgba(241, 196, 15, 0.9);
  color: white;
}

.export-btn:hover {
  background: #f39c12;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(241, 196, 15, 0.4);
}

.import-btn {
  background: rgba(155, 89, 182, 0.9);
  color: white;
}

.import-btn:hover {
  background: #8e44ad;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(155, 89, 182, 0.4);
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(135deg, #a8edea 0%, #eee 100%);
  border-radius: 20px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.import-textarea {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9rem;
  resize: vertical;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.modal-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-btn.cancel {
  background: rgba(149, 165, 166, 0.9);
  color: white;
}

.modal-btn.cancel:hover {
  background: #7f8c8d;
}

.modal-btn.confirm {
  background: rgba(46, 204, 113, 0.9);
  color: white;
}

.modal-btn.confirm:hover {
  background: #27ae60;
}

/* Скрытые элементы */
.file-input,
.hidden-input {
  display: none;
}

/* Адаптивность */
@media (max-width: 768px) {
  .edit-quiz-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
    padding: 15px;
  }

  .edit-quiz-header h1 {
    font-size: 2rem;
  }

  .question-preview {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .preview-image {
    width: 100%;
    height: 100px;
  }

  .image-input-group {
    flex-direction: column;
  }

  .time-input-group {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .time-display {
    justify-content: center;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 20px;
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .edit-quiz-container {
    padding: 10px;
  }

  .question-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .question-actions {
    align-self: flex-end;
  }

  .form-input,
  .form-textarea {
    font-size: 16px; /* Убираем увеличение на iOS */
  }
}
</style>
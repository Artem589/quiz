<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import type {Question} from '../types.ts'
import {Icon} from '@iconify/vue'

// const router = useRouter()

// Состояния
const questions = ref<Question[]>([])
const expandedQuestions = ref<number[]>([])
const savedQuestions = ref<number[]>([])
const imageLoading = ref<number | null>(null)
const imageErrors = ref<Record<number, boolean>>({})
const draggingQuestionId = ref<number | null>(null)
const loading = ref(false)

// Загрузка изображений
const showImageDropZone = ref(false)
const dropZoneFileInput = ref<HTMLInputElement>()
const dragOverPreview = ref<number | null>(null)
const currentImageQuestion = ref<Question | null>(null)

// Unsplash
const showUnsplashDialog = ref(false)
const unsplashQuery = ref('')
const unsplashResults = ref<any[]>([])
const unsplashLoading = ref(false)
const unsplashError = ref<string | null>(null)
const unsplashAccessKey = 'YOUR_UNSPLASH_ACCESS_KEY' // Замените на свой ключ

// Статистика
const totalTime = computed(() => {
  return questions.value.reduce((sum, q) => sum + q.timeLimit, 0)
})

const questionsWithImages = computed(() => {
  return questions.value.filter(q => q.image && q.image.trim() !== '').length
})

// Загрузка вопросов
onMounted(() => {
  loadQuestions()
})

const loadQuestions = () => {
  loading.value = true
  const saved = localStorage.getItem('quiz-questions')

  if (saved) {
    try {
      const parsedQuestions = JSON.parse(saved)

      // Проверяем, что это массив
      if (Array.isArray(parsedQuestions)) {
        questions.value = parsedQuestions

          expandedQuestions.value = []
        // Проверяем, что массив не пустой и у первого элемента есть id
        // if (questions.value.length > 0 && questions.value[0]?.id) {
        // }
      } else {
        throw new Error('Данные не являются массивом вопросов')
      }
    } catch (e) {
      console.error('Ошибка загрузки вопросов:', e)
      loadDefaultQuestions()
    }
  } else {
    loadDefaultQuestions()
  }

  loading.value = false
}

const loadDefaultQuestions = () => {
  questions.value = [
    // ... ваши вопросы по умолчанию
  ]
}

// Управление вопросами
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

const removeQuestion = (index: number) => {
  if (index < 0 || index >= questions.value.length) {
    console.error('Некорректный индекс для удаления')
    return
  }

  if (confirm('Удалить этот вопрос?')) {
    const question = questions.value[index]
    if (question) {
      const questionId = question.id
      questions.value.splice(index, 1)

      const expandedIndex = expandedQuestions.value.indexOf(questionId)
      if (expandedIndex > -1) {
        expandedQuestions.value.splice(expandedIndex, 1)
      }
    }
  }
}

const duplicateQuestion = (index: number) => {
  if (index < 0 || index >= questions.value.length) {
    console.error('Некорректный индекс для дублирования')
    return
  }

  const original = questions.value[index]
  if (!original) return

  // Находим максимальный ID безопасно
  const maxId = questions.value.reduce((max, q) =>
      q && q.id > max ? q.id : max, 0
  )
  const newId = maxId + 1

  const duplicate: Question = {
    ...JSON.parse(JSON.stringify(original)),
    id: newId,
    description: original.description + ' (копия)'
  }

  questions.value.splice(index + 1, 0, duplicate)
  expandedQuestions.value.push(newId)
}

const toggleExpand = (questionId: number) => {
  const index = expandedQuestions.value.indexOf(questionId)
  if (index > -1) {
    expandedQuestions.value.splice(index, 1)
  } else {
    expandedQuestions.value.push(questionId)
  }
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

// Загрузка изображений - Основные функции
const openImageDropZoneForQuestion = (question: Question) => {
  currentImageQuestion.value = question
  showImageDropZone.value = true
}

const closeImageDropZone = () => {
  showImageDropZone.value = false
  currentImageQuestion.value = null
}

const triggerFileInput = () => {
  dropZoneFileInput.value?.click()
}

const handleDropZoneFile = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0] && currentImageQuestion.value) {
    processImageFile(input.files[0], currentImageQuestion.value)
    input.value = ''
  }
  closeImageDropZone()
}

const handleDropOnZone = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer?.files && event.dataTransfer.files[0] && currentImageQuestion.value) {
    processImageFile(event.dataTransfer.files[0], currentImageQuestion.value)
  }
  closeImageDropZone()
}

// Drag & Drop на превью
const handleDragOverPreview = (event: DragEvent, question: Question) => {
  event.preventDefault()
  dragOverPreview.value = question.id
}

const handleDropOnPreview = (event: DragEvent, question: Question) => {
  event.preventDefault()
  dragOverPreview.value = null

  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    processImageFile(event.dataTransfer.files[0], question)
  }
}

// Обработка файла изображения
const processImageFile = (file: File, question: Question) => {
  // Проверка размера файла (макс 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Файл слишком большой! Максимальный размер: 5MB')
    return
  }

  // Проверка типа файла
  if (!file.type.startsWith('image/')) {
    alert('Пожалуйста, выберите файл изображения')
    return
  }

  const reader = new FileReader()

  reader.onloadstart = () => {
    imageLoading.value = question.id
  }

  reader.onload = (e) => {
    if (e.target?.result) {
      question.image = e.target.result as string
      imageLoading.value = null
      delete imageErrors.value[question.id]
    }
  }

  reader.onerror = () => {
    imageLoading.value = null
    imageErrors.value[question.id] = true
    alert('Ошибка при чтении файла')
  }

  reader.readAsDataURL(file)
}

// Загрузка через input
const handleFileUpload = (event: Event, question: Question) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    processImageFile(input.files[0], question)
    input.value = ''
  }
}

const closeUnsplashDialog = () => {
  showUnsplashDialog.value = false
  unsplashQuery.value = ''
  unsplashResults.value = []
  unsplashError.value = null
  currentImageQuestion.value = null
}

const searchUnsplashImages = async () => {
  if (!unsplashQuery.value.trim()) {
    unsplashError.value = 'Введите поисковый запрос'
    return
  }

  unsplashLoading.value = true
  unsplashError.value = null

  try {
    // Замените на ваш Unsplash Access Key
    const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(unsplashQuery.value)}&per_page=12&client_id=${unsplashAccessKey}`
    )

    if (!response.ok) throw new Error('Ошибка поиска')

    const data = await response.json()
    unsplashResults.value = data.results
  } catch (error) {
    unsplashError.value = 'Ошибка при загрузке изображений'
    console.error(error)
  } finally {
    unsplashLoading.value = false
  }
}

const selectUnsplashImage = (image: any) => {
  if (currentImageQuestion.value) {
    currentImageQuestion.value.image = image.urls.regular
    validateImage(currentImageQuestion.value)
  }
  closeUnsplashDialog()
}

// Валидация
const validateImage = async (question: Question) => {
  if (!question.image) {
    delete imageErrors.value[question.id]
    return
  }

  // Если это data URL, пропускаем валидацию
  if (question.image.startsWith('data:')) {
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

      // Таймаут для больших изображений
      setTimeout(() => reject(new Error('Таймаут загрузки')), 10000)
    })
  } catch (e) {
    imageErrors.value[question.id] = true
  } finally {
    imageLoading.value = null
  }
}

const handleImageError = (question: Question | undefined) => {
  if (question?.id) {
    imageErrors.value[question.id] = true
  }
}


// Дополнительные функции
const downloadAllImages = () => {
  questions.value.forEach((question, index) => {
    if (question.image && question.image.startsWith('data:')) {
      const link = document.createElement('a')
      link.href = question.image
      link.download = `question-${index + 1}.png`
      link.click()
    }
  })
}

const clearAllQuestions = () => {
  if (confirm('Удалить ВСЕ вопросы? Это действие нельзя отменить!')) {
    questions.value = [] // Полностью очищаем массив вопросов
    expandedQuestions.value = [] // Очищаем список развернутых вопросов
    savedQuestions.value = [] // Очищаем список сохраненных
    imageErrors.value = {} // Очищаем ошибки изображений

    // Также очищаем localStorage если нужно
    localStorage.removeItem('quiz-questions')

    alert('Все вопросы удалены!')
  }
}

// Drag & Drop для вопросов
const handleDragStart = (event: DragEvent, questionId: number) => {
  draggingQuestionId.value = questionId
  event.dataTransfer?.setData('text/plain', questionId.toString())
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  // Можно добавить визуальную обратную связь
  // Например, подсветку элемента над которым перетаскивают
  const questionCard = event.currentTarget as HTMLElement
  if (questionCard) {
    questionCard.classList.add('drag-over')
  }
}

const handleDrop = (event: DragEvent, targetIndex: number) => {
  event.preventDefault()

  // Убираем класс drag-over
  const questionCard = event.currentTarget as HTMLElement
  if (questionCard) {
    questionCard.classList.remove('drag-over')
  }

  const sourceIdStr = event.dataTransfer?.getData('text/plain')
  if (!sourceIdStr) return

  const sourceId = parseInt(sourceIdStr)
  if (isNaN(sourceId)) return

  const sourceIndex = questions.value.findIndex(q => q.id === sourceId)

  if (sourceIndex !== -1 && sourceIndex !== targetIndex) {
    const [movedQuestion] = questions.value.splice(sourceIndex, 1)

    // Проверяем, что movedQuestion существует
    if (movedQuestion) {
      // Корректируем targetIndex если нужно
      const adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
      questions.value.splice(adjustedTargetIndex, 0, movedQuestion)
    }
  }

  draggingQuestionId.value = null
}

// Сохранение
const saveQuestionChanges = (index: number) => {
  if (index < 0 || index >= questions.value.length) {
    console.error('Некорректный индекс для сохранения')
    return
  }

  const question = questions.value[index]
  if (!question) return

  savedQuestions.value.push(question.id)

  setTimeout(() => {
    const idx = savedQuestions.value.indexOf(question.id)
    if (idx > -1) {
      savedQuestions.value.splice(idx, 1)
    }
  }, 2000)
}

// Время
const timePresets = [30, 60, 90, 120, 180, 240, 300, 360, 420, 480, 540, 600]

const updateTimeValue = (question: Question) => {
  if (question.timeLimit < 10) question.timeLimit = 10
  if (question.timeLimit > 600) question.timeLimit = 600
}
</script>

<template>
  <div class="edit-quiz-app">
    <div class="edit-quiz-container">
      <div class="edit-quiz-header">
        <h1>Редактирование вопросов</h1>
        <div class="header-actions">
          <router-link to="/" class="back-btn">
            <Icon icon="mdi:arrow-left"/>
            Назад к квизу
          </router-link>
        </div>
      </div>

      <div class="edit-quiz-content">
        <!-- Drag & Drop зона для загрузки изображений -->
        <div
            v-if="showImageDropZone"
            class="drop-zone-overlay"
            @click="closeImageDropZone"
            @dragover.prevent
            @drop.prevent="handleDropOnZone"
        >
          <div
              class="drop-zone"
              @dragover.prevent
              @drop.prevent="handleDropOnZone"
              @click.stop
          >
            <div class="drop-content">
              <div class="drop-icon">
                <Icon icon="mdi:image-plus"/>
              </div>
              <h3>Загрузите изображение</h3>
              <p>Перетащите файл сюда или</p>
              <button @click="triggerFileInput" class="browse-btn">
                Выберите файл
              </button>
              <input
                  type="file"
                  ref="dropZoneFileInput"
                  class="file-input"
                  accept="image/*"
                  @change="handleDropZoneFile"
              />
              <p class="file-info">Поддерживаются: JPG, PNG, GIF, WebP (до 5MB)</p>
              <button @click="closeImageDropZone" class="cancel-btn">
                Отмена
              </button>
            </div>
          </div>
        </div>

        <!-- Список вопросов -->
        <div class="questions-list">
          <div
              v-for="(question, index) in questions"
              :key="question.id"
              class="question-edit-card"
              :class="{
              'is-dragging': question.id === draggingQuestionId,
              'is-expanded': expandedQuestions.includes(question.id)
              }"
              :draggable="!expandedQuestions.includes(question.id)"
              @dragstart="handleDragStart($event, question.id)"
              @dragover.prevent="expandedQuestions.includes(question.id) ? null : handleDragOver($event)"
              @drop="expandedQuestions.includes(question.id) ? null : handleDrop($event, index)"
          >
            <!-- Заголовок вопроса -->
            <div class="question-header" @click="toggleExpand(question.id)">
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
                  <Icon :icon="expandedQuestions.includes(question.id) ? 'mdi:chevron-up' : 'mdi:chevron-down'"/>
                </button>
                <button
                    @click="duplicateQuestion(index)"
                    class="action-btn duplicate"
                    title="Дублировать"
                >
                  <Icon icon="mdi:content-copy"/>
                </button>
                <button
                    @click="removeQuestion(index)"
                    class="action-btn delete"
                    title="Удалить"
                >
                  <Icon icon="mdi:delete"/>
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
                    @error="handleImageError(question)"
                />
                <div v-else class="no-image">
                  <span class="no-image-icon">📷</span>
                  Нет изображения
                </div>
              </div>
              <div class="preview-info">
                <!--                <div class="preview-description">-->
                <!--                  {{ question.description || 'Без описания' }}-->
                <!--                </div>-->
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
                  <span class="label-text">Изображение вопроса</span>
                  <span class="label-hint">(обязательно для визуальных вопросов)</span>
                </label>

                <!-- Превью и кнопки загрузки -->
                <div class="image-upload-section">
                  <!-- Превью изображения -->
                  <div
                      class="image-preview-container"
                      @dragover.prevent="handleDragOverPreview($event, question)"
                      @drop.prevent="handleDropOnPreview($event, question)"
                      @click="openImageDropZoneForQuestion(question)"
                  >
                    <div v-if="question.image" class="preview-with-controls">
                      <img
                          :src="question.image"
                          alt="Предпросмотр"
                          class="preview-image-large"
                          @error="handleImageError(question)"
                      />
                      <div class="preview-overlay">
                        <button
                            @click.stop="openImageDropZoneForQuestion(question)"
                            class="replace-btn"
                            title="Заменить изображение"
                        >
                          🔄
                        </button>
                        <button
                            @click.stop="question.image = ''"
                            class="remove-preview-btn"
                            title="Удалить изображение"
                        >
                          дел
                          <Icon icon="mdi:close-circle"/>
                        </button>
                      </div>
                    </div>

                    <div v-else class="upload-placeholder">
                      <div class="placeholder-icon">📷</div>
                      <div class="placeholder-text">
                        <p>Нажмите, чтобы загрузить изображение</p>
                        <p class="placeholder-subtext">или перетащите файл сюда</p>
                      </div>
                    </div>

                    <!-- Индикатор drag & drop -->
                    <div
                        v-if="dragOverPreview === question.id"
                        class="drag-overlay"
                    >
                      <div class="drag-content">
                        <div class="drag-icon">
                          <Icon icon="mdi:image-plus"/>
                        </div>
                        <p>Отпустите для загрузки</p>
                      </div>
                    </div>
                  </div>

                  <!-- Способы загрузки -->
                  <div class="upload-methods">
                    <div class="upload-method">
                      <button
                          @click="openImageDropZoneForQuestion(question)"
                          class="upload-method-btn"
                      >
                        <span class="method-icon">
                          <Icon icon="mdi:image-plus"/>
                        </span>
                        <span class="method-text">Загрузить файл</span>
                      </button>
                    </div>
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
                  <span class="label-hint">(от 10 до 600 секунд)</span>
                </label>
                <div class="time-input-group">
                  <input
                      v-model.number="question.timeLimit"
                      type="range"
                      min="10"
                      max="600"
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

              <!-- Сохранение изменений -->
              <div class="form-actions">
                <button
                    @click="saveQuestionChanges(index)"
                    class="save-question-btn"
                    :class="{ 'saved': savedQuestions.includes(question.id) }"
                >
                  <span class="save-btn" v-if="savedQuestions.includes(question.id)">
                    <Icon icon="mdi:check"/>
                    Сохранено
                  </span>
                  <span class="save-btn" v-else>
                  <Icon icon="mdi:content-save"/>
                    Сохранить вопрос
                  </span>
                </button>

                <button
                    @click="toggleExpand(question.id)"
                    class="expand-btn"
                    :class="{ 'expanded': expandedQuestions.includes(question.id) }"
                >
                  <Icon :icon="expandedQuestions.includes(question.id) ? 'mdi:chevron-up' : 'mdi:chevron-down'"/>
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
              <span class="stat-label">С изображениями:</span>
              <span class="stat-value">{{ questionsWithImages }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Общее время:</span>
              <span class="stat-value">{{ totalTime }} сек</span>
            </div>
          </div>

          <div class="action-buttons">
            <button @click="saveAllQuestions" class="save-all-btn">
              <Icon icon="mdi:content-save"/>
              Сохранить все изменения
            </button>
            <button @click="downloadAllImages" class="download-images-btn">
              📥 Скачать все изображения
            </button>
            <button @click="clearAllQuestions" class="clear-questions-btn">
              <Icon icon="mdi:delete"/>
              Удалить все вопросы
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог поиска Unsplash -->
    <div v-if="showUnsplashDialog" class="modal-overlay" @click="closeUnsplashDialog">
      <div class="modal-content unsplash-modal" @click.stop>
        <h3>Поиск изображений в Unsplash</h3>
        <div class="unsplash-search">
          <input
              v-model="unsplashQuery"
              type="text"
              placeholder="Поиск изображений..."
              class="unsplash-search-input"
              @keyup.enter="searchUnsplashImages"
          />
          <button @click="searchUnsplashImages" class="unsplash-search-btn">
            🔍
          </button>
        </div>

        <div v-if="unsplashLoading" class="unsplash-loading">
          <div class="spinner"></div>
          <p>Поиск изображений...</p>
        </div>

        <div v-else-if="unsplashError" class="unsplash-error">
          <p>❌ {{ unsplashError }}</p>
        </div>

        <div v-else class="unsplash-results">
          <div class="unsplash-grid">
            <div
                v-for="image in unsplashResults"
                :key="image.id"
                class="unsplash-image-item"
                @click="selectUnsplashImage(image)"
            >
              <img
                  :src="image.urls.small"
                  :alt="image.description || 'Изображение'"
                  class="unsplash-image"
              />
              <div class="unsplash-author">
                📷 {{ image.user.name }}
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="closeUnsplashDialog" class="modal-btn cancel">
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
icon {
  font-size: 40px;
}

/* Основные стили приложения */
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

/* Шапка редактора */
.edit-quiz-header {
  background: rgba(255, 255, 255, 0.3);
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
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.question-edit-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.15);
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
  all: unset;
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
  grid-template-columns: 300px 1fr;
  gap: 20px;
  align-items: center;
}

.preview-image {
  width: 300px;
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

.no-image-icon {
  display: block;
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.preview-info {
  flex: 1;
  justify-self: end;
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
  font-size: 1.3rem;
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

/* Общие стили для input и textarea */
.form-input {
  box-sizing: border-box; /* Это решает проблему! */
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
  width: 100%;
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
  color: #000;
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

/* Кнопки действий в форме */
.form-actions {
  display: flex;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed rgba(255, 255, 255, 0.4);
  gap: 20px;
}

.save-question-btn {
  background: rgba(46, 204, 113, 0.2);
  border: 1px solid rgba(46, 204, 113, 0.4);
  color: #27ae60;
  padding: 10px 20px;
  border-radius: 8px;
  display: flex;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
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

.save-all-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  background: rgba(46, 204, 113, 0.9);
  color: white;
}

.save-all-btn:hover {
  background: #27ae60;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4);
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
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

/* Скрытые элементы */
.file-input {
  display: none;
}

/* Индикаторы загрузки */
.image-loading {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.image-error {
  margin-top: 8px;
  color: #e74c3c;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(52, 152, 219, 0.2);
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Drag-over эффект */
.question-edit-card.drag-over {
  border: 2px dashed #00BCD4;
  background: rgba(0, 188, 212, 0.1);
}

/* Анимации */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

  .stats {
    grid-template-columns: 1fr;
  }

  .action-buttons {
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

/* ==== Стили, которые уже были у вас (оставляем) ==== */

/* Drop Zone Overlay */
.drop-zone-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);

  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.drop-zone {
  background: linear-gradient(135deg, #a8edea 0%, #eee 100%);
  border-radius: 20px;
  padding: 40px;
  width: 90%;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 3px dashed #00BCD4;
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.drop-icon {
  font-size: 4rem;
  color: #00BCD4;
}

.drop-content h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.8rem;
}

.drop-content p {
  margin: 0;
  color: #7f8c8d;
}

.browse-btn {
  background: #00BCD4;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.browse-btn:hover {
  background: #0097A7;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 188, 212, 0.4);
}

.file-info {
  font-size: 0.9rem;
  color: #95a5a6;
  margin-top: 10px;
}

.cancel-btn {
  background: transparent;
  color: #7f8c8d;
  border: 1px solid #7f8c8d;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: rgba(127, 140, 141, 0.1);
}

/* Обновленная секция загрузки изображений */
.image-upload-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.image-preview-container {
  position: relative;
  width: 100%;
  height: 250px;
  border: 2px dashed #bdc3c7;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.5);
}

.image-preview-container:hover {
  border-color: #00BCD4;
  background: rgba(255, 255, 255, 0.7);
}

.preview-with-controls {
  position: relative;
  width: 100%;
  height: 100%;
}

.preview-image-large {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.preview-with-controls:hover .preview-overlay {
  opacity: 1;
}

.replace-btn,
.remove-preview-btn {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.replace-btn:hover {
  background: rgba(0, 188, 212, 0.9);
  transform: scale(1.1);
}

.remove-preview-btn:hover {
  background: rgba(231, 76, 60, 0.9);
  transform: scale(1.1);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #7f8c8d;
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 10px;
  opacity: 0.5;
}

.placeholder-text {
  text-align: center;
}

.placeholder-subtext {
  font-size: 0.9rem;
  color: #95a5a6;
  margin-top: 5px;
}

.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 188, 212, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.drag-content {
  text-align: center;
}

.drag-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

/* Способы загрузки */
.upload-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.upload-method-btn {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.upload-method-btn:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.method-icon {
  font-size: 2.5rem;
  color: #000;
}

.method-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
}

/* URL ввод */
.url-input-group {
  margin-top: 10px;
}

.url-label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.url-input-wrapper {
  position: relative;
}

.image-url {
  padding-right: 40px;
}

.clear-url-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #95a5a6;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 5px;
}

.clear-url-btn:hover {
  color: #e74c3c;
}

.image-success {
  margin-top: 8px;
  color: #27ae60;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Unsplash Modal */
.unsplash-modal {
  width: 90%;
  max-width: 900px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.unsplash-search {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.unsplash-search-input {
  flex: 1;
  padding: 12px 15px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
}

.unsplash-search-btn {
  background: #00BCD4;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0 20px;
  cursor: pointer;
  font-size: 1.2rem;
}

.unsplash-results {
  flex: 1;
  overflow-y: auto;
}

.unsplash-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  padding: 10px;
}

.unsplash-image-item {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
}

.unsplash-image-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.unsplash-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.unsplash-author {
  padding: 8px;
  font-size: 0.8rem;
  color: #7f8c8d;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
}

.unsplash-loading,
.unsplash-error {
  text-align: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 188, 212, 0.2);
  border-top-color: #00BCD4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

/* Кнопки действий */
.download-images-btn,
.clear-questions-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.download-images-btn {
  background: rgba(52, 152, 219, 0.9);
  color: white;
}

.download-images-btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

.clear-questions-btn {
  background: rgba(231, 76, 60, 0.9);
  color: white;
}

.clear-images-btn:hover {
  background: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
}
</style>
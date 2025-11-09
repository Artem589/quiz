<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

interface Question {
  id: number
  image: string
  description: string
  answer: string
  timeLimit: number
}

// Аутентификация
const isAuthenticated = ref(false)
const password = ref('')
const loginError = ref(false)
const ADMIN_PASSWORD = 'admin123' // Простой пароль, можно поменять

// Форма вопроса
const form = reactive({
  image: '',
  description: '',
  answer: '',
  timeLimit: 30
})

// Состояние
const questions = ref<Question[]>([])
const editingQuestion = ref<Question | null>(null)
const fileInput = ref<HTMLInputElement>()
const importInput = ref<HTMLInputElement>()
const isDragging = ref(false)

// Computed
const isFormValid = computed(() => {
  return form.image && form.description.trim() && form.answer.trim() && form.timeLimit > 0
})

// Методы аутентификации
const login = () => {
  if (password.value === ADMIN_PASSWORD) {
    isAuthenticated.value = true
    loginError.value = false
    password.value = ''
    loadQuestions()
  } else {
    loginError.value = true
  }
}

const logout = () => {
  isAuthenticated.value = false
  questions.value = []
}

// Работа с изображениями
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    readImageFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false

  const files = event.dataTransfer?.files
  if (files && files[0] && files[0].type.startsWith('image/')) {
    readImageFile(files[0])
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const readImageFile = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    form.image = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  form.image = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// CRUD вопросы
const saveQuestion = () => {
  if (!isFormValid.value) return

  const questionData: Question = {
    id: editingQuestion.value ? editingQuestion.value.id : Date.now(),
    image: form.image,
    description: form.description.trim(),
    answer: form.answer.trim(),
    timeLimit: Number(form.timeLimit)
  }

  if (editingQuestion.value) {
    // Редактирование
    const index = questions.value.findIndex(q => q.id === editingQuestion.value!.id)
    if (index !== -1) {
      questions.value[index] = questionData
    }
  } else {
    // Добавление
    questions.value.push(questionData)
  }

  resetForm()
  saveQuestions()
}

const editQuestion = (question: Question) => {
  editingQuestion.value = question
  form.image = question.image
  form.description = question.description
  form.answer = question.answer
  form.timeLimit = question.timeLimit
}

const deleteQuestion = (index: number) => {
  if (confirm('Удалить этот вопрос?')) {
    questions.value.splice(index, 1)
    saveQuestions()
  }
}

const moveQuestion = (fromIndex: number, toIndex: number) => {
  if (toIndex >= 0 && toIndex < questions.value.length) {
    const question = questions.value.splice(fromIndex, 1)[0]
    questions.value.splice(toIndex, 0, question)
    saveQuestions()
  }
}

const cancelEdit = () => {
  resetForm()
}

const resetForm = () => {
  form.image = ''
  form.description = ''
  form.answer = ''
  form.timeLimit = 30
  editingQuestion.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Сохранение/загрузка
const saveQuestions = () => {
  localStorage.setItem('quiz-questions', JSON.stringify(questions.value))
}

const loadQuestions = () => {
  const saved = localStorage.getItem('quiz-questions')
  if (saved) {
    questions.value = JSON.parse(saved)
  }
}

// Импорт/экспорт
const exportQuestions = () => {
  const data = JSON.stringify(questions.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'quiz-questions.json'
  a.click()
  URL.revokeObjectURL(url)
}

const importQuestions = () => {
  importInput.value?.click()
}

const handleImport = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        if (Array.isArray(imported)) {
          questions.value = imported
          saveQuestions()
          alert('Вопросы успешно импортированы!')
        }
      } catch (error) {
        alert('Ошибка при импорте файла')
      }
    }
    reader.readAsText(file)
  }
}

onMounted(() => {
  // Автологин для удобства разработки (можно убрать)
  // isAuthenticated.value = true
  // loadQuestions()
})
</script>

<template>
<div class="admin-app">
<!-- Защита паролем -->
<div v-if="!isAuthenticated" class="login-screen">
  <div class="login-form">
    <h2>Админка Квиза</h2>
    <input
        v-model="password"
        type="password"
        placeholder="Введите пароль"
        class="password-input"
        @keyup.enter="login"
    />
    <button class="login-btn" @click="login">Войти</button>
    <div v-if="loginError" class="error-message">Неверный пароль</div>
  </div>
</div>

<!-- Админка -->
<div v-else class="admin-container">
  <div class="admin-header">
    <h1>Управление вопросами квиза</h1>
    <button class="logout-btn" @click="logout">Выйти</button>
  </div>

  <div class="admin-content">
    <!-- Форма добавления вопроса -->
    <div class="question-form">
      <h2>{{ editingQuestion ? 'Редактировать вопрос' : 'Добавить новый вопрос' }}</h2>

      <div class="form-group">
        <label>Изображение вопроса:</label>
        <div class="image-upload">
          <div
              class="upload-area"
              :class="{ 'has-image': form.image }"
              @click="triggerFileInput"
              @drop="handleDrop"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
          >
            <div v-if="!form.image" class="upload-placeholder">
              <span class="upload-icon">📁</span>
              <p>Перетащите изображение сюда или кликните для выбора</p>
            </div>
            <div v-else class="image-preview">
              <img :src="form.image" alt="Preview" />
              <button class="remove-image" @click.stop="removeImage">×</button>
            </div>
            <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleFileSelect"
                class="file-input"
            />
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Текст вопроса:</label>
        <textarea
            v-model="form.description"
            placeholder="Введите текст вопроса..."
            rows="3"
            class="question-textarea"
        ></textarea>
      </div>

      <div class="form-group">
        <label>Правильный ответ:</label>
        <input
            v-model="form.answer"
            type="text"
            placeholder="Введите правильный ответ..."
            class="answer-input"
        />
      </div>

      <div class="form-group">
        <label>Время на ответ (секунды):</label>
        <input
            v-model="form.timeLimit"
            type="number"
            min="5"
            max="120"
            class="time-input"
        />
      </div>

      <div class="form-actions">
        <button class="cancel-btn" @click="cancelEdit" v-if="editingQuestion">
          Отмена
        </button>
        <button
            class="save-btn"
            @click="saveQuestion"
            :disabled="!isFormValid"
        >
          {{ editingQuestion ? 'Обновить' : 'Добавить' }} вопрос
        </button>
      </div>
    </div>

    <!-- Список вопросов -->
    <div class="questions-list">
      <h2>Существующие вопросы ({{ questions.length }})</h2>

      <div v-if="questions.length === 0" class="empty-state">
        Вопросов пока нет. Добавьте первый вопрос!
      </div>

      <div v-else class="questions-grid">
        <div
            v-for="(question, index) in questions"
            :key="question.id"
            class="question-item"
        >
          <div class="question-preview">
            <div class="question-image">
              <img :src="question.image" :alt="question.description" />
            </div>
            <div class="question-info">
              <h3>{{ question.description }}</h3>
              <div class="question-meta">
                <span class="answer">Ответ: {{ question.answer }}</span>
                <span class="time">Время: {{ question.timeLimit }}с</span>
              </div>
            </div>
          </div>
          <div class="question-actions">
            <button class="edit-btn" @click="editQuestion(question)">
              ✏️
            </button>
            <button class="delete-btn" @click="deleteQuestion(index)">
              🗑️
            </button>
            <button
                class="move-btn"
                @click="moveQuestion(index, index - 1)"
                :disabled="index === 0"
            >
              ↑
            </button>
            <button
                class="move-btn"
                @click="moveQuestion(index, index + 1)"
                :disabled="index === questions.length - 1"
            >
              ↓
            </button>
          </div>
        </div>
      </div>

      <!-- Экспорт вопросов -->
      <div class="export-section">
        <button class="export-btn" @click="exportQuestions">
          📋 Экспортировать вопросы
        </button>
        <button class="import-btn" @click="importQuestions">
          📥 Импортировать вопросы
        </button>
        <input
            ref="importInput"
            type="file"
            accept=".json"
            @change="handleImport"
            class="import-input"
        />
      </div>
    </div>
  </div>
</div>
</div>
</template>



<style scoped>
.admin-app {
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #a8edea 0%, #eee 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Экран логина */
.login-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.login-form {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(15px);
  padding: 40px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.login-form h2 {
  margin-bottom: 30px;
  color: #2c3e50;
}

.password-input {
  width: 100%;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.login-btn {
  width: 100%;
  padding: 15px;
  background: #00BCD4;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: #0097A7;
  transform: translateY(-1px);
}

.error-message {
  color: #FF9E9E;
  margin-top: 10px;
  font-weight: 600;
}

/* Админка */
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.admin-header h1 {
  color: #2c3e50;
  margin: 0;
}

.logout-btn {
  background: #FF9E9E;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #E57373;
  transform: translateY(-1px);
}

.admin-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

/* Форма вопроса */
.question-form {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(15px);
  padding: 30px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  height: fit-content;
}

.question-form h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

/* Загрузка изображения */
.image-upload {
  margin-bottom: 20px;
}

.upload-area {
  border: 2px dashed #00BCD4;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.6);
}

.upload-area:hover {
  border-color: #0097A7;
  background: rgba(255, 255, 255, 0.8);
}

.upload-area.has-image {
  border-style: solid;
  padding: 10px;
}

.upload-placeholder .upload-icon {
  font-size: 3rem;
  margin-bottom: 10px;
  display: block;
}

.upload-placeholder p {
  margin: 0;
  color: #666;
}

.image-preview {
  position: relative;
  display: inline-block;
}

.image-preview img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
}

.remove-image {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #FF9E9E;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
}

.file-input {
  display: none;
}

/* Поля формы */
.question-textarea,
.answer-input,
.time-input {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  box-sizing: border-box;
  font-family: inherit;
}

.question-textarea:focus,
.answer-input:focus,
.time-input:focus {
  outline: none;
  border-color: #00BCD4;
  box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.2);
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.save-btn,
.cancel-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.save-btn {
  background: #009688;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #00796B;
  transform: translateY(-1px);
}

.save-btn:disabled {
  background: #B0BEC5;
  cursor: not-allowed;
  transform: none;
}

.cancel-btn {
  background: #FF9E9E;
  color: white;
}

.cancel-btn:hover {
  background: #E57373;
  transform: translateY(-1px);
}

/* Список вопросов */
.questions-list {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(15px);
  padding: 30px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.questions-list h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}

.questions-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 600px;
  overflow-y: auto;
}

.question-item {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.question-preview {
  display: flex;
  gap: 15px;
  flex: 1;
  align-items: center;
}

.question-image img {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.question-info h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 1rem;
}

.question-meta {
  display: flex;
  gap: 15px;
  font-size: 0.9rem;
  color: #666;
}

.question-actions {
  display: flex;
  gap: 5px;
}

.edit-btn,
.delete-btn,
.move-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 1.1rem;
}

.edit-btn:hover {
  background: rgba(0, 188, 212, 0.2);
}

.delete-btn:hover {
  background: rgba(255, 158, 158, 0.2);
}

.move-btn:hover:not(:disabled) {
  background: rgba(156, 39, 176, 0.2);
}

.move-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Импорт/экспорт */
.export-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.6);
  display: flex;
  gap: 10px;
}

.export-btn,
.import-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  background: #00BCD4;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  flex: 1;
}

.export-btn:hover,
.import-btn:hover {
  background: #0097A7;
  transform: translateY(-1px);
}

.import-input {
  display: none;
}

/* Адаптивность */
@media (max-width: 968px) {
  .admin-content {
    grid-template-columns: 1fr;
  }

  .question-preview {
    flex-direction: column;
    align-items: flex-start;
  }

  .question-actions {
    align-self: flex-end;
  }
}

@media (max-width: 768px) {
  .admin-container {
    padding: 15px;
  }

  .admin-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .question-form,
  .questions-list {
    padding: 20px;
  }

  .export-section {
    flex-direction: column;
  }
}
</style>
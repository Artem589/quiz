<script setup lang="ts">
import {ref, computed, onMounted, onUnmounted} from 'vue'
import type {Question, QuizState} from '../types.ts'

// // Вместо статического массива questions
// const questions = ref<Question[]>([])
//
// // Добавьте функцию загрузки вопросов
// const loadQuestions = () => {
//   const saved = localStorage.getItem('quiz-questions')
//   if (saved) {
//     questions.value = JSON.parse(saved)
//   } else {
//     // Запасные вопросы если в localStorage пусто
//     questions.value = [
//       {
//         id: 1,
//         image: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Teorema_chevy.svg',
//         description: 'Сколько планет в Солнечной системе?',
//         answer: '8',
//         timeLimit: 120
//       },
//       {
//         id: 2,
//         image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=400&fit=crop',
//         description: 'Какая самая длинная река в мире?',
//         answer: 'Нил',
//         timeLimit: 120
//       },
//       {
//         id: 3,
//         image: 'https://images.unsplash.com/photo-1519996529934-eee4e47ae1c5?w=800&h=400&fit=crop',
//         description: 'Столица Японии?',
//         answer: 'Токио',
//         timeLimit: 120
//       },
//       {
//         id: 4,
//         image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800&h=400&fit=crop',
//         description: 'Сколько элементов в периодической таблице?',
//         answer: '118',
//         timeLimit: 120
//       },
//       {
//         id: 5,
//         image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
//         description: 'Самое высокое здание в мире?',
//         answer: 'Бурдж-Халифа',
//         timeLimit: 120
//       }
//     ]
//   }
// }

const questions = ref<Question[]>([
  {
    id: 1,
    image: '/assets/1.jpg',
    description: '',
    answer: '98',
    timeLimit: 120
  },
  {
    id: 2,
    image: '/assets/2.jpg',
    description: '',
    answer: '24',
    timeLimit: 120
  },
  {
    id: 3,
    image: '/assets/3.jpg',
    description: '',
    answer: '174',
    timeLimit: 120
  },
  {
    id: 4,
    image: '/assets/4.jpg',
    description: '',
    answer: '9',
    timeLimit: 120
  },
  {
    id: 5,
    image: '/assets/5.jpg',
    description: '',
    answer: '-6',
    timeLimit: 120
  },
  {
    id: 6,
    image: '/assets/6.jpg',
    description: '',
    answer: '-8',
    timeLimit: 120
  },
  {
    id: 7,
    image: '/assets/7.jpg',
    description: '',
    answer: '-4',
    timeLimit: 120
  },
  {
    id: 8,
    image: '/assets/8.jpg',
    description: '',
    answer: '4',
    timeLimit: 120
  },
  {
    id: 9,
    image: '/assets/9.jpg',
    description: '',
    answer: '36',
    timeLimit: 120
  },
  {
    id: 10,
    image: '/assets/10.jpg',
    description: '',
    answer: '2',
    timeLimit: 120
  },
  {
    id: 11,
    image: '/assets/11.jpg',
    description: '',
    answer: '-2',
    timeLimit: 120
  },
  {
    id: 12,
    image: '/assets/12.jpg',
    description: '',
    answer: '5',
    timeLimit: 120
  },
  {
    id: 13,
    image: '/assets/13.jpg',
    description: '',
    answer: '28',
    timeLimit: 120
  },
  {
    id: 14,
    image: '/assets/14.jpg',
    description: '',
    answer: '-1',
    timeLimit: 120
  },
  {
    id: 15,
    image: '/assets/15.jpg',
    description: '',
    answer: '61',
    timeLimit: 120
  },
  {
    id: 16,
    image: '/assets/16.jpg',
    description: '',
    answer: '98',
    timeLimit: 120
  },
  {
    id: 17,
    image: '/assets/17.jpg',
    description: '',
    answer: '62',
    timeLimit: 120
  },
  {
    id: 18,
    image: '/assets/18.jpg',
    description: '',
    answer: '77',
    timeLimit: 120
  },
  {
    id: 19,
    image: '/assets/19.jpg',
    description: '',
    answer: '82',
    timeLimit: 120
  },
])

// Состояние квиза
const quizState = ref<QuizState>({
  currentQuestion: 0,
  score: 0,
  userAnswer: '',
  isCorrect: null,
  timeLeft: 0,
  timer: null,
  isFinished: false
})

// Computed свойства с проверками
const currentQuestionData = computed((): Question | null => {
  const question = questions.value[quizState.value.currentQuestion]
  return question || null
})
const timerProgress = computed(() => {
  if (!currentQuestionData.value) return 0
  return (quizState.value.timeLeft / currentQuestionData.value.timeLimit) * 100
})

// Инициализация таймера для текущего вопроса
const startTimer = () => {
  if (!currentQuestionData.value) return

  quizState.value.timeLeft = currentQuestionData.value.timeLimit
  quizState.value.isCorrect = null
  quizState.value.userAnswer = ''

  if (quizState.value.timer) {
    clearInterval(quizState.value.timer)
  }

  quizState.value.timer = setInterval(() => {
    quizState.value.timeLeft--

    if (quizState.value.timeLeft <= 0) {
      clearInterval(quizState.value.timer!)
      handleTimeUp()
    }
  }, 1000)
}

// Форматирование времени
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Проверка ответа
const checkAnswer = () => {
  if (!currentQuestionData.value) return
  if (!quizState.value.userAnswer.trim() || quizState.value.isCorrect !== null) return

  const isAnswerCorrect = quizState.value.userAnswer.trim().toLowerCase() ===
      currentQuestionData.value.answer.toLowerCase()

  quizState.value.isCorrect = isAnswerCorrect

  if (isAnswerCorrect) {
    quizState.value.score++
  }

  clearInterval(quizState.value.timer!)

  // Переход к следующему вопросу через 2 секунды
  setTimeout(nextQuestion, 2000)
}

// Время вышло
const handleTimeUp = () => {
  quizState.value.isCorrect = false
  setTimeout(nextQuestion, 2000)
}

// Следующий вопрос
const nextQuestion = () => {
  if (quizState.value.currentQuestion < questions.value.length - 1) {
    quizState.value.currentQuestion++
    startTimer()
  } else {
    quizState.value.isFinished = true
  }
}

// Перезапуск квиза
const restartQuiz = () => {
  quizState.value.currentQuestion = 0
  quizState.value.score = 0
  quizState.value.userAnswer = ''
  quizState.value.isCorrect = null
  quizState.value.timeLeft = 0
  quizState.value.timer = null
  quizState.value.isFinished = false

  startTimer()
}

// Хуки жизненного цикла
onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  if (quizState.value.timer) {
    clearInterval(quizState.value.timer)
  }
})

// onMounted(() => {
//   loadQuestions()
//   startTimer()
// })
</script>

<template>
  <div class="quiz-app">
    <div class="quiz-container">
      <div class="quiz-header">
        <h1>Квиз</h1>

      </div>

      <div v-if="!quizState.isFinished && currentQuestionData" class="quiz-content">
        <!-- Основной контент с таймером и карточкой -->
        <div class="main-content">
          <!-- Карточка вопроса -->
          <div class="question-card">


            <!-- Изображение вопроса -->
            <div class="question-image">
              <img :src="currentQuestionData.image" :alt="currentQuestionData.description"/>
            </div>

            <!--            &lt;!&ndash; Описание задания &ndash;&gt;-->
            <!--            <div class="question-description">-->
            <!--              <p>{{ currentQuestionData.description }}</p>-->
            <!--            </div>-->

            <!-- Поле ввода ответа -->
            <div class="answer-input-container">
              <input
                  v-model="quizState.userAnswer"
                  type="text"
                  placeholder="Введите ваш ответ..."
                  class="answer-input"
                  :class="{
                  'correct': quizState.isCorrect === true,
                  'incorrect': quizState.isCorrect === false
                }"
                  @keyup.enter="checkAnswer"
                  :disabled="quizState.isCorrect !== null"
              />
              <button
                  class="submit-btn"
                  @click="checkAnswer"
                  :disabled="!quizState.userAnswer.trim() || quizState.isCorrect !== null"
              >
                Проверить
              </button>
            </div>

            <!-- Сообщение о результате -->
            <div v-if="quizState.isCorrect !== null" class="result-message"
                 :class="quizState.isCorrect ? 'correct' : 'incorrect'">
              <transition name="bounce">
                <div v-if="quizState.isCorrect" class="message-content">
                  <span class="icon">✅</span>
                  Правильно! +1 балл
                </div>
                <div v-else class="message-content">
                  <span class="icon">❌</span>
                  Неправильно. Правильный ответ: "{{ currentQuestionData.answer }}"
                </div>
              </transition>
            </div>

            <!-- Таймер внутри карточки -->
            <div class="timer-section">

              <div class="timer-progress">
                <div
                    class="timer-progress-bar"
                    :style="{ width: timerProgress + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <div
              class="timer"
              :class="{
                  'timer-warning': quizState.timeLeft < 10,
                  'timer-danger': quizState.timeLeft < 5
                }"
          >
            {{ formatTime(quizState.timeLeft) }}
          </div>
        </div>
      </div>

      <!-- Экран завершения -->
      <div v-else class="completion-screen">
        <div class="completion-content">
          <h2>Квиз завершен!</h2>
          <div class="final-score">
            Ваш итоговый счет: <span class="score-number">{{ quizState.score }}</span> из {{ questions.length }}
          </div>
          <div class="score-percentage">
            {{ Math.round((quizState.score / questions.length) * 100) }}%
          </div>
          <button class="restart-btn" @click="restartQuiz">
            Начать заново
          </button>
        </div>
      </div>

      <div class="quiz-info">
        <span class="score">Счет: {{ quizState.score }}</span>
        <span class="question-counter">Вопрос: {{ quizState.currentQuestion + 1 }}/{{ questions.length }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-app {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #a8edea 0%, #eee 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #2c3e50;
  overflow: hidden;
}

.quiz-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.quiz-header {
  flex-shrink: 0;
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

.quiz-header h1 {
  font-size: 2.5rem;
  margin: 0 10px;
  font-weight: 700;
  color: #2c3e50;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.quiz-info {
  display: flex;
  justify-content: space-between;
  max-width: 500px;
  margin: 0 5px 5px auto;
  background: rgba(255, 255, 255, 0.5); /* Увеличил прозрачность */
  padding: 15px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8); /* Более яркая граница */
  width: 100%;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15); /* Добавил тень */
  position: relative;
  z-index: 1;
}

.score, .question-counter {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

/* Основной контент */
.quiz-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px;
}

.main-content {
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: start;
  margin-top: 40px;
}

/* Карточка вопроса */
.question-card {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* Секция таймера внутри карточки */
.timer-section {
  text-align: center;
  padding: 0;
}

.timer {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 10px;
  font-family: 'Monaco', 'Consolas', monospace;
  transition: all 0.3s ease;
  color: #00BCD4;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: absolute;
  right: 50px;
  top: 0;
}

.timer-warning {
  color: #FF9800;
  animation: pulse 1s infinite;
}

.timer-danger {
  color: #FF5252;
  animation: pulse 0.5s infinite;
}

.timer-progress {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 3px;
  overflow: hidden;
}

.timer-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #009688, #4DB6AC);
  transition: width 1s linear;
}

/* Изображение вопроса */
.question-image {
  text-align: center;
}

.question-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

/* Описание вопроса */
.question-description {
  background: rgba(255, 255, 255, 0.5);
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.question-description p {
  font-size: 1.3rem;
  margin: 0;
  font-weight: 500;
  line-height: 1.4;
  color: #2c3e50;
}

/* Поле ввода */
.answer-input-container {
  display: flex;
  gap: 15px;
}

.answer-input {
  flex: 1;
  padding: 15px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  transition: all 0.3s ease;
  outline: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.answer-input:focus {
  box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.3);
  transform: translateY(-1px);
  border-color: #00BCD4;
}

.answer-input.correct {
  background: #009688;
  color: white;
  box-shadow: 0 0 0 3px rgba(0, 150, 136, 0.3);
  border-color: #009688;
}

.answer-input.incorrect {
  background: #FF5252;
  color: white;
  box-shadow: 0 0 0 3px rgba(255, 82, 82, 0.3);
  border-color: #FF5252;
}

.submit-btn {
  padding: 15px 25px;
  background: #00BCD4;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 188, 212, 0.3);
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.submit-btn:hover:not(:disabled) {
  background: #0097A7;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 188, 212, 0.4);
}

.submit-btn:disabled {
  background: #B0BEC5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Сообщение о результате */
.result-message {
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;
  backdrop-filter: blur(10px);
}

.result-message.correct {
  background: rgba(0, 150, 136, 0.2);
  border: 2px solid #009688;
  color: #00796B;
}

.result-message.incorrect {
  background: rgba(255, 82, 82, 0.2);
  border: 2px solid #FF5252;
  color: #D32F2F;
}

.message-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.icon {
  font-size: 1.2rem;
}

/* Экран завершения */
.completion-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.completion-content {
  text-align: center;
  background: rgba(255, 255, 255, 0.4);
  padding: 40px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  max-width: 500px;
  width: 100%;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.completion-content h2 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  font-weight: 700;
  color: #2c3e50;
}

.final-score {
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: #2c3e50;
}

.score-number {
  font-size: 2rem;
  font-weight: 700;
  color: #009688;
}

.score-percentage {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 30px;
  color: #00BCD4;
  text-shadow: 0 2px 4px rgba(0, 188, 212, 0.3);
}

.restart-btn {
  padding: 15px 40px;
  background: #FF5252;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 82, 82, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.restart-btn:hover {
  background: #D32F2F;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 82, 82, 0.4);
}

/* Анимации */
.bounce-enter-active {
  animation: bounce-in 0.5s;
}

.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .quiz-content {
    padding: 15px;
  }

  .question-card {
    padding: 20px;
    gap: 20px;
  }

  .quiz-header h1 {
    font-size: 2rem;
  }

  .timer {
    font-size: 2.5rem;
  }

  .question-image img {
    height: 150px;
  }

  .question-description {
    padding: 15px;
  }

  .question-description p {
    font-size: 1.1rem;
  }

  .answer-input-container {
    flex-direction: column;
    gap: 10px;
  }

  .completion-content {
    padding: 30px 20px;
    margin: 10px;
  }

  .completion-content h2 {
    font-size: 2rem;
  }

  .score-percentage {
    font-size: 2.5rem;
  }
}

@media (max-height: 800px) {
  .quiz-header {
    padding: 15px;
  }

  .quiz-header h1 {
    font-size: 2rem;
  }

  .question-card {
    padding: 20px;
    gap: 15px;
  }

  .main-content {
    align-items: start;
  }

  .timer {
    font-size: 2.5rem;
  }

  .question-image img {
    min-height: 100%;
  }

  .question-description {
    padding: 10px;
  }

  .question-description p {
    font-size: 1.1rem;
  }
}
</style>
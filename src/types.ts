export interface Question {
    id: number
    image: string
    description: string
    answer: string
    timeLimit: number
}

export interface QuizState {
    currentQuestion: number
    score: number
    userAnswer: string
    isCorrect: boolean | null
    timeLeft: number
    timer: number | null
    isFinished: boolean
}
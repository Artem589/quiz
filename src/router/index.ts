import { createRouter, createWebHistory } from 'vue-router'
import QuizApp from '../components/QuizApp.vue'
import QuizTestPage from '../components/QuizTestPage.vue'
import EditQuestions from '../components/EditQuestions.vue'
import Edit from '../components/Edit.vue'

const routes = [
    {
        path: '/',
        name: 'Quiz',
        component: QuizTestPage
    },
    {
        path: '/edit',
        name: 'Edit',
        component: Edit
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
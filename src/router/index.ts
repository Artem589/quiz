import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import QuizTestPage from '../components/QuizTestPage.vue'
import Edit from '../components/Edit.vue'
import FlipCardPage from '../components/FlipCardPage.vue'
import FlipCardEditPage from '../components/FlipCardEditPage.vue'
import ThemePage from '../components/ThemePage.vue'
import BankPage from '../components/BankPage.vue'
import QuizBankPage from '../components/QuizBankPage.vue'
import CardBankPage from '../components/CardBankPage.vue'
import TaskBankPage from '../components/TaskBankPage.vue'

const routes = [
    { path: '/',                name: 'Home',         component: HomePage },
    { path: '/quiz',            name: 'Quiz',         component: QuizTestPage },
    { path: '/edit',            name: 'Edit',         component: Edit },
    { path: '/flip-card',       name: 'FlipCard',     component: FlipCardPage },
    { path: '/flip-card/edit',  name: 'FlipCardEdit', component: FlipCardEditPage },
    { path: '/theme',           name: 'Theme',        component: ThemePage },
    { path: '/bank',            name: 'Bank',         component: BankPage },
    { path: '/bank/quizzes',    name: 'QuizBank',     component: QuizBankPage },
    { path: '/bank/cards',      name: 'CardBank',     component: CardBankPage },
    { path: '/bank/tasks',      name: 'TaskBank',     component: TaskBankPage },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router

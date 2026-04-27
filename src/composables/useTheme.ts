import { ref, watch } from 'vue'

export interface Theme {
  id: string
  name: string
  pantone: string
  year?: string
  swatchFrom: string
  swatchTo: string
  vars: Record<string, string>
}

export const themes: Theme[] = [
  {
    id: 'aqua',
    name: 'Aqua',
    pantone: '14-4811',
    year: 'default',
    swatchFrom: '#a8edea',
    swatchTo: '#eeeeee',
    vars: {
      '--bg-gradient': 'linear-gradient(135deg, #a8edea 0%, #eeeeee 100%)',
      '--primary': '#00BCD4',
      '--primary-dark': '#0097A7',
      '--primary-glow': 'rgba(0, 188, 212, 0.32)',
      '--primary-glow-strong': 'rgba(0, 188, 212, 0.48)',
      '--primary-bg-light': 'rgba(0, 188, 212, 0.1)',
      '--primary-bg-mid': 'rgba(0, 188, 212, 0.22)',
      '--timer-bar': 'linear-gradient(90deg, #009688, #4DB6AC)',
    },
  },
  {
    id: 'magenta',
    name: 'Viva Magenta',
    pantone: '18-1750',
    year: '2023',
    swatchFrom: '#f5c6d0',
    swatchTo: '#fff0f3',
    vars: {
      '--bg-gradient': 'linear-gradient(135deg, #f5c6d0 0%, #fff0f3 100%)',
      '--primary': '#BB2649',
      '--primary-dark': '#9b1e3d',
      '--primary-glow': 'rgba(187, 38, 73, 0.32)',
      '--primary-glow-strong': 'rgba(187, 38, 73, 0.48)',
      '--primary-bg-light': 'rgba(187, 38, 73, 0.1)',
      '--primary-bg-mid': 'rgba(187, 38, 73, 0.22)',
      '--timer-bar': 'linear-gradient(90deg, #9b1e3d, #BB2649)',
    },
  },
  {
    id: 'peach',
    name: 'Peach Fuzz',
    pantone: '13-1023',
    year: '2024',
    swatchFrom: '#ffd6b8',
    swatchTo: '#fff5ee',
    vars: {
      '--bg-gradient': 'linear-gradient(135deg, #ffd6b8 0%, #fff5ee 100%)',
      '--primary': '#E8734A',
      '--primary-dark': '#cf6240',
      '--primary-glow': 'rgba(232, 115, 74, 0.32)',
      '--primary-glow-strong': 'rgba(232, 115, 74, 0.48)',
      '--primary-bg-light': 'rgba(232, 115, 74, 0.1)',
      '--primary-bg-mid': 'rgba(232, 115, 74, 0.22)',
      '--timer-bar': 'linear-gradient(90deg, #cf6240, #E8734A)',
    },
  },
  {
    id: 'blue',
    name: 'Classic Blue',
    pantone: '19-4052',
    year: '2020',
    swatchFrom: '#c8d8f0',
    swatchTo: '#e8f0fe',
    vars: {
      '--bg-gradient': 'linear-gradient(135deg, #c8d8f0 0%, #e8f0fe 100%)',
      '--primary': '#0F4C81',
      '--primary-dark': '#0a3a64',
      '--primary-glow': 'rgba(15, 76, 129, 0.32)',
      '--primary-glow-strong': 'rgba(15, 76, 129, 0.48)',
      '--primary-bg-light': 'rgba(15, 76, 129, 0.1)',
      '--primary-bg-mid': 'rgba(15, 76, 129, 0.22)',
      '--timer-bar': 'linear-gradient(90deg, #0a3a64, #0F4C81)',
    },
  },
  {
    id: 'violet',
    name: 'Ultra Violet',
    pantone: '18-3838',
    year: '2018',
    swatchFrom: '#d8d0e8',
    swatchTo: '#f0ecf8',
    vars: {
      '--bg-gradient': 'linear-gradient(135deg, #d8d0e8 0%, #f0ecf8 100%)',
      '--primary': '#5F4B8B',
      '--primary-dark': '#4a3a6e',
      '--primary-glow': 'rgba(95, 75, 139, 0.32)',
      '--primary-glow-strong': 'rgba(95, 75, 139, 0.48)',
      '--primary-bg-light': 'rgba(95, 75, 139, 0.1)',
      '--primary-bg-mid': 'rgba(95, 75, 139, 0.22)',
      '--timer-bar': 'linear-gradient(90deg, #4a3a6e, #5F4B8B)',
    },
  },
  {
    id: 'greenery',
    name: 'Greenery',
    pantone: '15-0343',
    year: '2017',
    swatchFrom: '#d4e8c2',
    swatchTo: '#f0f7e8',
    vars: {
      '--bg-gradient': 'linear-gradient(135deg, #d4e8c2 0%, #f0f7e8 100%)',
      '--primary': '#88B04B',
      '--primary-dark': '#6e9038',
      '--primary-glow': 'rgba(136, 176, 75, 0.32)',
      '--primary-glow-strong': 'rgba(136, 176, 75, 0.48)',
      '--primary-bg-light': 'rgba(136, 176, 75, 0.1)',
      '--primary-bg-mid': 'rgba(136, 176, 75, 0.22)',
      '--timer-bar': 'linear-gradient(90deg, #6e9038, #88B04B)',
    },
  },
  {
    id: 'coral',
    name: 'Living Coral',
    pantone: '16-1546',
    year: '2019',
    swatchFrom: '#ffd4c8',
    swatchTo: '#fff0ea',
    vars: {
      '--bg-gradient': 'linear-gradient(135deg, #ffd4c8 0%, #fff0ea 100%)',
      '--primary': '#FF6F61',
      '--primary-dark': '#e55a4d',
      '--primary-glow': 'rgba(255, 111, 97, 0.32)',
      '--primary-glow-strong': 'rgba(255, 111, 97, 0.48)',
      '--primary-bg-light': 'rgba(255, 111, 97, 0.1)',
      '--primary-bg-mid': 'rgba(255, 111, 97, 0.22)',
      '--timer-bar': 'linear-gradient(90deg, #e55a4d, #FF6F61)',
    },
  },
]

export const classicThemes: Theme[] = [
  {
    id: 'pw-white',
    name: 'White',
    pantone: 'Pantone White',
    swatchFrom: '#e8e8e8',
    swatchTo: '#ffffff',
    vars: {
      '--bg-gradient': 'linear-gradient(135deg, #e8e8e8 0%, #ffffff 100%)',
      '--primary': '#424242',
      '--primary-dark': '#1a1a1a',
      '--primary-glow': 'rgba(66, 66, 66, 0.28)',
      '--primary-glow-strong': 'rgba(66, 66, 66, 0.42)',
      '--primary-bg-light': 'rgba(66, 66, 66, 0.07)',
      '--primary-bg-mid': 'rgba(66, 66, 66, 0.14)',
      '--timer-bar': 'linear-gradient(90deg, #757575, #9e9e9e)',
    },
  },
  {
    id: 'pw-coolgray',
    name: 'Cool Gray',
    pantone: 'Pantone Cool Gray',
    swatchFrom: '#cfd0d1',
    swatchTo: '#eeeeee',
    vars: {
      '--bg-gradient': 'linear-gradient(135deg, #cfd0d1 0%, #eeeeee 100%)',
      '--primary': '#75777A',
      '--primary-dark': '#54565A',
      '--primary-glow': 'rgba(117, 119, 122, 0.32)',
      '--primary-glow-strong': 'rgba(117, 119, 122, 0.48)',
      '--primary-bg-light': 'rgba(117, 119, 122, 0.1)',
      '--primary-bg-mid': 'rgba(117, 119, 122, 0.2)',
      '--timer-bar': 'linear-gradient(90deg, #54565A, #75777A)',
    },
  },
  {
    id: 'pw-blue',
    name: 'Blue',
    pantone: 'Pantone Blue C',
    swatchFrom: '#b8cbe8',
    swatchTo: '#deeefa',
    vars: {
      '--bg-gradient': 'linear-gradient(135deg, #b8cbe8 0%, #deeefa 100%)',
      '--primary': '#003DA5',
      '--primary-dark': '#002d7c',
      '--primary-glow': 'rgba(0, 61, 165, 0.32)',
      '--primary-glow-strong': 'rgba(0, 61, 165, 0.48)',
      '--primary-bg-light': 'rgba(0, 61, 165, 0.1)',
      '--primary-bg-mid': 'rgba(0, 61, 165, 0.2)',
      '--timer-bar': 'linear-gradient(90deg, #002d7c, #003DA5)',
    },
  },
  {
    id: 'pw-lightblue',
    name: 'Light Blue',
    pantone: 'Pantone Light Blue',
    swatchFrom: '#cce7f5',
    swatchTo: '#e8f6fd',
    vars: {
      '--bg-gradient': 'linear-gradient(135deg, #cce7f5 0%, #e8f6fd 100%)',
      '--primary': '#4BA3D3',
      '--primary-dark': '#3585AF',
      '--primary-glow': 'rgba(75, 163, 211, 0.32)',
      '--primary-glow-strong': 'rgba(75, 163, 211, 0.48)',
      '--primary-bg-light': 'rgba(75, 163, 211, 0.1)',
      '--primary-bg-mid': 'rgba(75, 163, 211, 0.2)',
      '--timer-bar': 'linear-gradient(90deg, #3585AF, #4BA3D3)',
    },
  },
  {
    id: 'pw-green',
    name: 'Green',
    pantone: 'Pantone Green C',
    swatchFrom: '#b3e8cb',
    swatchTo: '#e0f7ed',
    vars: {
      '--bg-gradient': 'linear-gradient(135deg, #b3e8cb 0%, #e0f7ed 100%)',
      '--primary': '#00A651',
      '--primary-dark': '#007d3d',
      '--primary-glow': 'rgba(0, 166, 81, 0.32)',
      '--primary-glow-strong': 'rgba(0, 166, 81, 0.48)',
      '--primary-bg-light': 'rgba(0, 166, 81, 0.1)',
      '--primary-bg-mid': 'rgba(0, 166, 81, 0.2)',
      '--timer-bar': 'linear-gradient(90deg, #007d3d, #00A651)',
    },
  },
  {
    id: 'pw-yellow',
    name: 'Yellow',
    pantone: 'Pantone Yellow C',
    swatchFrom: '#fff5b0',
    swatchTo: '#fffde8',
    vars: {
      '--bg-gradient': 'linear-gradient(135deg, #fff5b0 0%, #fffde8 100%)',
      '--primary': '#B89200',
      '--primary-dark': '#8a6e00',
      '--primary-glow': 'rgba(184, 146, 0, 0.32)',
      '--primary-glow-strong': 'rgba(184, 146, 0, 0.48)',
      '--primary-bg-light': 'rgba(184, 146, 0, 0.1)',
      '--primary-bg-mid': 'rgba(184, 146, 0, 0.2)',
      '--timer-bar': 'linear-gradient(90deg, #8a6e00, #B89200)',
    },
  },
  {
    id: 'pw-orange',
    name: 'Orange',
    pantone: 'Pantone Orange 021 C',
    swatchFrom: '#ffcdb0',
    swatchTo: '#fff0e8',
    vars: {
      '--bg-gradient': 'linear-gradient(135deg, #ffcdb0 0%, #fff0e8 100%)',
      '--primary': '#FE5000',
      '--primary-dark': '#cc4000',
      '--primary-glow': 'rgba(254, 80, 0, 0.32)',
      '--primary-glow-strong': 'rgba(254, 80, 0, 0.48)',
      '--primary-bg-light': 'rgba(254, 80, 0, 0.1)',
      '--primary-bg-mid': 'rgba(254, 80, 0, 0.2)',
      '--timer-bar': 'linear-gradient(90deg, #cc4000, #FE5000)',
    },
  },
  {
    id: 'p286c',
    name: '286 C',
    pantone: 'Pantone 286 C',
    swatchFrom: '#b8c8e2',
    swatchTo: '#dde8f5',
    vars: {
      '--bg-gradient': 'linear-gradient(135deg, #b8c8e2 0%, #dde8f5 100%)',
      '--primary': '#003087',
      '--primary-dark': '#00205c',
      '--primary-glow': 'rgba(0, 48, 135, 0.32)',
      '--primary-glow-strong': 'rgba(0, 48, 135, 0.48)',
      '--primary-bg-light': 'rgba(0, 48, 135, 0.1)',
      '--primary-bg-mid': 'rgba(0, 48, 135, 0.2)',
      '--timer-bar': 'linear-gradient(90deg, #00205c, #003087)',
    },
  },
  {
    id: 'p656c',
    name: '656 C',
    pantone: 'Pantone 656 C',
    swatchFrom: '#d8e8f8',
    swatchTo: '#eef5fd',
    vars: {
      '--bg-gradient': 'linear-gradient(135deg, #d8e8f8 0%, #eef5fd 100%)',
      '--primary': '#6B9ED4',
      '--primary-dark': '#5080B5',
      '--primary-glow': 'rgba(107, 158, 212, 0.32)',
      '--primary-glow-strong': 'rgba(107, 158, 212, 0.48)',
      '--primary-bg-light': 'rgba(107, 158, 212, 0.1)',
      '--primary-bg-mid': 'rgba(107, 158, 212, 0.2)',
      '--timer-bar': 'linear-gradient(90deg, #5080B5, #6B9ED4)',
    },
  },
  {
    id: 'p5483c',
    name: '5483 C',
    pantone: 'Pantone 5483 C',
    swatchFrom: '#b8d0d3',
    swatchTo: '#ddeaeb',
    vars: {
      '--bg-gradient': 'linear-gradient(135deg, #b8d0d3 0%, #ddeaeb 100%)',
      '--primary': '#4E7C80',
      '--primary-dark': '#3a5f62',
      '--primary-glow': 'rgba(78, 124, 128, 0.32)',
      '--primary-glow-strong': 'rgba(78, 124, 128, 0.48)',
      '--primary-bg-light': 'rgba(78, 124, 128, 0.1)',
      '--primary-bg-mid': 'rgba(78, 124, 128, 0.2)',
      '--timer-bar': 'linear-gradient(90deg, #3a5f62, #4E7C80)',
    },
  },
  {
    id: 'p7739c',
    name: '7739 C',
    pantone: 'Pantone 7739 C',
    swatchFrom: '#bcdea8',
    swatchTo: '#e2f5d8',
    vars: {
      '--bg-gradient': 'linear-gradient(135deg, #bcdea8 0%, #e2f5d8 100%)',
      '--primary': '#43B02A',
      '--primary-dark': '#338a1f',
      '--primary-glow': 'rgba(67, 176, 42, 0.32)',
      '--primary-glow-strong': 'rgba(67, 176, 42, 0.48)',
      '--primary-bg-light': 'rgba(67, 176, 42, 0.1)',
      '--primary-bg-mid': 'rgba(67, 176, 42, 0.2)',
      '--timer-bar': 'linear-gradient(90deg, #338a1f, #43B02A)',
    },
  },
  {
    id: 'p7406c',
    name: '7406 C',
    pantone: 'Pantone 7406 C',
    swatchFrom: '#ffdfa0',
    swatchTo: '#fff5e0',
    vars: {
      '--bg-gradient': 'linear-gradient(135deg, #ffdfa0 0%, #fff5e0 100%)',
      '--primary': '#C88A00',
      '--primary-dark': '#9e6e00',
      '--primary-glow': 'rgba(200, 138, 0, 0.32)',
      '--primary-glow-strong': 'rgba(200, 138, 0, 0.48)',
      '--primary-bg-light': 'rgba(200, 138, 0, 0.1)',
      '--primary-bg-mid': 'rgba(200, 138, 0, 0.2)',
      '--timer-bar': 'linear-gradient(90deg, #9e6e00, #C88A00)',
    },
  },
  {
    id: 'pcg3c',
    name: 'Cool Gray 3 C',
    pantone: 'Pantone Cool Gray 3 C',
    swatchFrom: '#d5d6d7',
    swatchTo: '#eeeeed',
    vars: {
      '--bg-gradient': 'linear-gradient(135deg, #d5d6d7 0%, #eeeeed 100%)',
      '--primary': '#75777A',
      '--primary-dark': '#54565A',
      '--primary-glow': 'rgba(117, 119, 122, 0.32)',
      '--primary-glow-strong': 'rgba(117, 119, 122, 0.48)',
      '--primary-bg-light': 'rgba(117, 119, 122, 0.1)',
      '--primary-bg-mid': 'rgba(117, 119, 122, 0.2)',
      '--timer-bar': 'linear-gradient(90deg, #54565A, #75777A)',
    },
  },
  {
    id: 'p432c',
    name: '432 C',
    pantone: 'Pantone 432 C',
    swatchFrom: '#bfc2c4',
    swatchTo: '#dddfe0',
    vars: {
      '--bg-gradient': 'linear-gradient(135deg, #bfc2c4 0%, #dddfe0 100%)',
      '--primary': '#54585A',
      '--primary-dark': '#3a3d3f',
      '--primary-glow': 'rgba(84, 88, 90, 0.32)',
      '--primary-glow-strong': 'rgba(84, 88, 90, 0.48)',
      '--primary-bg-light': 'rgba(84, 88, 90, 0.1)',
      '--primary-bg-mid': 'rgba(84, 88, 90, 0.2)',
      '--timer-bar': 'linear-gradient(90deg, #3a3d3f, #54585A)',
    },
  },
]

const STORAGE_KEY = 'app-theme'

const allThemes = [...themes, ...classicThemes]

const activeThemeId = ref<string>(localStorage.getItem(STORAGE_KEY) ?? 'aqua')

const applyTheme = (id: string) => {
  const theme = allThemes.find(t => t.id === id) ?? allThemes[0]!
  const root = document.documentElement
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value)
  }
}

watch(activeThemeId, id => {
  applyTheme(id)
  localStorage.setItem(STORAGE_KEY, id)
}, { immediate: true })

export const useTheme = () => ({
  themes,
  classicThemes,
  activeThemeId,
  setTheme: (id: string) => { activeThemeId.value = id },
})

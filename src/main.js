import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes, scrollBehavior } from './router.js'
import { reveal } from './directives/reveal.js'
import './styles/main.css'

export const createApp = ViteSSG(App, { routes, scrollBehavior }, ({ app }) => {
  app.directive('reveal', reveal)
})

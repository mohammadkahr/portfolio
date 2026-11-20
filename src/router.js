import profile from '~profile'
import { getLocaleConfig } from './lib/content.js'

const { locales, fallback } = getLocaleConfig(profile)

const HomePage = () => import('./pages/HomePage.vue')
const ArticlesPage = () => import('./pages/ArticlesPage.vue')
const ArticlePage = () => import('./pages/ArticlePage.vue')
const NotFoundPage = () => import('./pages/NotFoundPage.vue')

export const localePrefix = (locale) => (locale === fallback ? '' : `/${locale}`)

export const routes = [
  ...locales.flatMap((locale) => {
    const p = localePrefix(locale)
    return [
      { path: p || '/', name: `home-${locale}`, component: HomePage, meta: { locale, page: 'home' } },
      { path: `${p}/articles`, name: `articles-${locale}`, component: ArticlesPage, meta: { locale, page: 'articles' } },
      { path: `${p}/articles/:slug`, name: `article-${locale}`, component: ArticlePage, meta: { locale, page: 'article' } }
    ]
  }),
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage, meta: { page: '404' } }
]

export function scrollBehavior(to, from, saved) {
  if (saved) return saved
  if (to.hash) return { el: to.hash, top: 88, behavior: from.path === to.path ? 'smooth' : 'auto' }
  if (to.path === from.path) return false
  return { top: 0 }
}

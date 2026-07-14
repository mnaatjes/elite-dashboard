import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Sources from '../views/Sources.vue'
import Catalog from '../views/Catalog.vue'
import Lineage from '../views/Lineage.vue'
import Settings from '../views/Settings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/sources',
      name: 'sources',
      component: Sources,
    },
    {
      path: '/catalog',
      name: 'catalog',
      component: Catalog,
    },
    {
      path: '/lineage',
      name: 'lineage',
      component: Lineage,
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
    },
    {
      path: '/pipelines/:id',
      name: 'pipeline-manage',
      component: Lineage,
    }
  ],
})

export default router

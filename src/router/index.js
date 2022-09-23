import { createRouter, createWebHistory } from 'vue-router'
import MapView from '../views/MapView'
import PersonManage from '../views/PersonManage'
import FenchManage from '../views/FenchManage'
import CheckAttendance from '../views/CheckAttendance'

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: "/map/"
  },
  {
    path: '/map/',
    name: 'map_index',
    component: MapView
  },
  {
    path: '/person/',
    name: 'person_index',
    component: PersonManage
  },
  {
    path: '/fench/',
    name: 'fench_index',
    component: FenchManage
  },
  {
    path: '/checkin/',
    name: 'checkin_index',
    component: CheckAttendance
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

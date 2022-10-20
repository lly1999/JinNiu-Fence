import { createRouter, createWebHistory } from 'vue-router'
import MapView from '../views/MapView'
import PersonManage from '../views/PersonManage'
import FenchManage from '../views/FenchManage'
import CheckAttendance from '../views/CheckAttendance'
import UserLoginView from '../views/UserLoginView'
import store from '@/store'

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: "/map/",
    meta: {
      requestAuth: true,
    }
  },
  {
    path: '/login/',
    name: 'user_login_index',
    component: UserLoginView
  },
  {
    path: '/map/',
    name: 'map_index',
    component: MapView,
    meta: {
      requestAuth: true,
    }
  },
  {
    path: '/person/',
    name: 'person_index',
    component: PersonManage,
    meta: {
      requestAuth: true,
    }
  },
  {
    path: '/fench/',
    name: 'fench_index',
    component: FenchManage,
    meta: {
      requestAuth: true,
    }
  },
  {
    path: '/checkin/',
    name: 'checkin_index',
    component: CheckAttendance,
    meta: {
      requestAuth: true,
    }
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (!store.state.user.is_login && to.meta.requestAuth) {
    next({ name: "user_login_index" });
  } else {
    next();
  }
})

export default router

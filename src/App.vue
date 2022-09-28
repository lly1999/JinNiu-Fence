<template>
  <NavBar />
  <router-view />
</template>


<script>
import NavBar from './components/NavBar.vue'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap"

export default {
  components: {
    NavBar,
  }
}

</script>

<style>
#app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}

/* nav {
  position: absolute;
  z-index: 5;
  width: 100vw;
  padding: 0;
  margin: 0;
} */

/* nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
} */
</style>

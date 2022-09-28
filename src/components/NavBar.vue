<template>

    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">

        <div class="container">
            <img src="../assets/img/logo.jpg" alt="" class="navbar-icon">
            <router-link class="navbar-brand" :to="{ name: 'home' }">成都市金牛区电子围栏系统
            </router-link>
            <div class="collapse navbar-collapse" id="navbarText">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <router-link :class="route_name == 'map_index' ? 'nav-link active' : 'nav-link'"
                            :to="{ name: 'map_index' }">地图界面</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link :class="route_name == 'person_index' ? 'nav-link active' : 'nav-link'"
                            :to="{ name: 'person_index' }">人员管理</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link :class="route_name == 'fench_index' ? 'nav-link active' : 'nav-link'"
                            :to="{ name: 'fench_index' }">围栏管理</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link :class="route_name == 'checkin_index' ? 'nav-link active' : 'nav-link'"
                            :to="{ name: 'checkin_index' }">签到考勤</router-link>
                    </li>
                </ul>
                <ul class="navbar-nav">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                            data-bs-toggle="dropdown" aria-expanded="false">
                            用户名
                        </a>
                        <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                            <li>
                                <!-- <router-link class="dropdown-item" :to="{ name: 'user_bot_index' }">我的Bot</router-link> -->
                                <a class="dropdown-item" href="#">Features</a>
                            </li>

                            <li>
                                <hr class="dropdown-divider">
                            </li>
                            <li><a class="dropdown-item" href="#">退出</a></li>
                        </ul>
                    </li>

                </ul>

                <!-- <ul class="navbar-nav">
                    <li class="nav-item">
                        退出
                    </li>
                    <li class="nav-item">

                    </li>
                </ul> -->
            </div>
        </div>
    </nav>
</template>

<script>
import { useRoute } from 'vue-router'
import { computed } from 'vue';

export default {
    setup() {
        const route = useRoute();
        let route_name = computed(() => route.name)

        return {
            route_name,
        }
    }
}

</script>

<style scoped>
img.navbar-icon {
    width: 4vh;
    border-radius: 50%;
}

nav {
    position: absolute;
    z-index: 5;
    width: 100vw;
    margin: 0;
}
</style>
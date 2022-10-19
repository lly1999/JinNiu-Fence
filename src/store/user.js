import axios from "axios";

export default {
    state: {
        id: "",
        username: "",
        token: "",
        tokenHeader: "",
        is_login: false,
    },
    mutations: {
        updateIsLogin(state, is_login) {
            state.is_login = is_login;
        },
        updateUser(state, user) {
            state.id = user.id;
            state.username = user.username;
            state.is_login = user.is_login;
        },
        updateToken(state, token) {
            state.token = token;
        },
        updateTokenHeader(state, tokenHeader) {
            state.tokenHeader = tokenHeader;
        },
        logout(state) {
            state.id = "";
            state.username = "";
            state.token = "";
            state.is_login = false
        },
    },
    actions: {
        login(context, data) {
            axios({
                url: '/api/auth/login',
                method: 'post',
                data: {
                    name: data.username,
                    password: data.password,
                },
            }).then(function (resp) {

                if (resp.status == 200) {
                    localStorage.setItem("jwt_tokenHeader", resp.data.data.tokenHead);
                    localStorage.setItem("jwt_token", resp.data.data.token);
                    context.commit('updateToken', resp.data.data.token);
                    context.commit('updateTokenHeader', resp.data.data.tokenHead);
                    data.success(resp);
                } else {
                    data.error(resp);
                }
            })
        },
        logout(context) {
            localStorage.removeItem("jwt_token");
            localStorage.removeItem("jwt_tokenHeader");
            context.commit("logout");
        },

    }

}
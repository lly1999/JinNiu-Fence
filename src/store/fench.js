export default ({
    state: {
        id: "",
        fench_list: []
    },
    getters: {
    },
    mutations: {
        updateFenchList(state, fench) {
            state.fench_list.push(fench);
        }
    },
    actions: {
    },
    modules: {
    }
})
export default ({
    state: {
        polygonId: 0,
        fence_list: {},
    },
    getters: {
    },
    mutations: {
        updateFenceList(state, fence) {
            state.fence_list[fence.polygonId] = {
                id: fence.polygonId,
                markerList: fence.markerList,
                name: fence.name,
                operator: fence.operator,
                editTime: fence.editTime
            };
        },
        removeFence(state, fenceId) {
            // state.fence_list.splice(fenceId, 1);
            delete state.fence_list[fenceId];
        },
        updatePolygonId(state, polygonId) {
            state.polygonId = polygonId;
        }
    },
    actions: {
    },
    modules: {
    }
})
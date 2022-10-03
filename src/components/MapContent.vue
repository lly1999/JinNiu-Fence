<template>


    <div class="content-l">
        <div class="content-l-top">
            <div class="container">
                <div class="card text-white bg-primary mb-3 " style="max-width: 18rem;">
                    <div class="card-header">执法人员实时情况</div>
                    <div class="card-body">
                        <div>在编：1人</div>
                        <div>抽调：1人</div>
                        <p></p>
                        <div>补休：1人</div>
                        <div>在岗在位：1人</div>
                        <div>未按时打卡人员：1人</div>
                    </div>
                </div>

                <div class="card text-dark bg-info mb-3 " style="max-width: 18rem;">
                    <div class="card-header">协管人员实时情况(含服务外包人员)</div>
                    <div class="card-body">
                        <div>在编：1人</div>
                        <div>抽调：1人</div>
                        <p></p>
                        <div>补休：1人</div>
                        <div>在岗在位：1人</div>
                        <div>未按时打卡人员：1人</div>
                    </div>

                </div>

                <div class="card text-white bg-success mb-3 " style="max-width: 18rem;">
                    <div class="card-header">市容严管街人员情况</div>
                    <div class="card-body">
                        <div>严管街 数量：1条</div>
                        <div>人员达标 数量：1条</div>
                        <div>人员不达标 数量：1条</div>
                        <p></p>
                        <div>人员不达标路段报警提醒</div>
                        <ScrollBoard :config="config" style="width:14vw;height: 13vh;" />

                    </div>

                </div>
            </div>
        </div>
    </div>
    <div class="content-mid">

        <div class="card text-white bg-primary mb-3 person-box ">
            <div class="card-body">
                <h5 class="card-title">队员编制总数</h5>
                <DigitalFlop :config="memberNumber" />
            </div>
        </div>

        <div class="card text-white bg-primary mb-3 person-box ">
            <div class="card-body">
                <h5 class="card-title">抽调</h5>
                <DigitalFlop :config="deployed" />
            </div>
        </div>

        <div class="card text-white bg-primary mb-3 person-box">
            <div class="card-body">
                <h5 class="card-title">补休</h5>
                <DigitalFlop :config="digitConfig" />
            </div>
        </div>

        <div class="card text-white bg-primary mb-3 person-box">
            <div class="card-body">
                <h5 class="card-title">请假</h5>
                <DigitalFlop :config="excused" />
            </div>
        </div>

        <div class="card text-white bg-primary mb-3 person-box">
            <div class="card-body">
                <h5 class="card-title">在岗在位</h5>
                <DigitalFlop :config="situ" />
            </div>
        </div>

        <div class="card text-white bg-primary mb-3 person-box">
            <div class="card-body">
                <h5 class="card-title">定位异常</h5>
                <DigitalFlop :config="positionException" />
            </div>
        </div>
    </div>
    <div class="content-r">
        <div class="container">
            <div class="card text-white bg-primary mb-3 " style="max-width: 18rem; margin-left: auto;">
                <div class="card-header">执法人员实时情况</div>
                <div class="card-body">
                    <div>在编：1人</div>
                    <div>抽调：1人</div>
                    <p></p>
                    <div>补休：1人</div>
                    <div>在岗在位：1人</div>
                    <div>未按时打卡人员：1人</div>
                </div>
            </div>

            <div class="card text-white bg-secondary mb-3 " style="max-width: 18rem;margin-left: auto;">
                <div class="card-header">公园办人员情况</div>
                <div class="card-body">
                    <div>在编：1人</div>
                    <div>补休：1人</div>
                    <div>请假：1人</div>
                    <div>越线人员：1人</div>
                </div>
            </div>

            <div class="card text-white bg-success mb-3 ">
                <div class="card-header">市容严管街人员情况</div>
                <div class="card-body">

                    <ScrollBoard :config="problemCount" style="width:20vw;height: 29vh;" />

                </div>

            </div>
        </div>

    </div>

</template>


<script setup>
import { reactive } from 'vue';
import { ScrollBoard, DigitalFlop } from '@kjgl77/datav-vue3'


let config = reactive({
    header: ['街道', '应到', '实到'],
    headerHeight: 25,
    data: [
        ['抚琴', '1', '1'],
        ['西华', '1', '1'],
        ['街道1', '1', '1'],
        ['街道2', '1', '1'],
        ['街道3', '1', '1'],
        ['街道4', '1', '1'],
        ['街道5', '1', '1'],
        ['街道6', '1', '1'],
        ['街道7', '1', '1'],
        ['街道8', '1', '1'],
    ],
    align: ['center'],
    rowNum: 3,
    columnWidth: [140, 60, 60],
    headerBGC: '#006400',
    oddRowBGC: '#3CB371',
    evenRowBGC: '#8FBC8F',
});

let problemCount = reactive({
    header: ['街道', '打卡问题', '严管街道到位问题', '定位异常', '信息接收'],
    data: [
        ['抚琴', '1', '1', '问题', '问题'],
        ['西华', '1', '1', '问题', '问题'],
        ['街道1', '1', '1', '问题', '问题'],
        ['街道2', '1', '1', '问题', '问题'],
        ['街道3', '1', '1', '问题', '问题'],
        ['街道4', '1', '1', '问题', '问题'],
        ['街道5', '1', '1', '问题', '问题'],
        ['街道6', '1', '1', '问题', '问题'],
        ['街道7', '1', '1', '问题', '问题'],
        ['街道8', '1', '1', '问题', '问题'],
    ],
    align: ['center'],
})

let digitConfig = reactive({
    number: [100],
    content: '{nt}人',
    style: {
        fontSize: 40,
    }
});

let memberNumber = reactive({
    number: [100],
    content: '{nt}人',
    style: {
        fontSize: 40,
        fill: '#5CA1D8',
    }
});

let deployed = reactive({
    number: [100],
    content: '{nt}人',
    style: {
        fontSize: 40,
        fill: '#708090',
    }
});

let excused = reactive({
    number: [100],
    content: '{nt}人',
    style: {
        fontSize: 40,
        fill: '#E1B95A',
    }
});

let situ = reactive({
    number: [100],
    content: '{nt}人',
    style: {
        fontSize: 40,
        fill: '#97C151',
    }
});

let positionException = reactive({
    number: [100],
    content: '{nt}人',
    style: {
        fontSize: 40,
        fill: '#E95547',
    }
})


</script>

<style scoped>
/* .content {
    position: absolute;
    top: 7vh;

    display: flex;
    z-index: 20;
} */

.content-l {
    left: 0;
    width: 25vw;
    background-color: rgba(0, 11, 61, 0.5);
    padding: 3vh;
    display: flex;
    flex-direction: column;
    height: 93vh;
    position: absolute;
    top: 7vh;
    z-index: 20;
    user-select: none;
}

.content-l-top {
    height: 150px;

}

.content-mid {
    left: 25vw;
    width: 50vw;
    height: 40vh;
    padding: 3vh;
    background-color: rgba(0, 11, 61, 0.5);
    position: absolute;
    top: 7vh;
    z-index: 20;
    display: flex;
    flex-flow: wrap;
    user-select: none;
}

.content-r {
    right: 0;
    width: 25vw;
    background-color: rgba(0, 11, 61, 0.5);
    padding-left: 3vh;
    padding-top: 3vh;
    padding-bottom: 3vh;
    padding-right: 1vh;
    display: flex;
    flex-direction: column;
    height: 93vh;
    position: absolute;
    top: 7vh;
    z-index: 20;
    user-select: none;
}

.person-box {
    margin-right: 10px;
    width: 10vw;
    height: 15vh;
    --bs-bg-opacity: .2;
}

.person-title {
    color: white;
    font-size: 24px;
    font-weight: 600;
    margin-right: 30px;
    text-align: center;
}

.person-number {
    font-size: 30px;
    text-align: center;
}
</style>
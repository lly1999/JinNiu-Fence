<template>

    <div class="container">
        <div class="row center-block">
            <div class="col-12">
                <div class="card">

                    <div class="card-header" style="display: flex;">
                        <div class="col-3" style="margin-right:30px;">
                            <el-input v-model="queryName" placeholder="请输入人员姓名" clearable size="large">
                                <template #append>
                                    <el-button @click="searchPatrol()">
                                        <el-icon>
                                            <Search />
                                        </el-icon>
                                    </el-button>

                                </template>
                            </el-input>
                        </div>

                        <button v-if="ifShowQueryResult" type="button" class="btn btn-outline-secondary float-end"
                            @click="backToFirstPage()" style="margin-right:30px;">返回</button>

                        <button type="button" class="btn btn-outline-primary float-end"
                            @click="addPerson()">添加人员</button>
                    </div>
                    <div class="card-body">
                        <el-table :data="ifShowQueryResult ? queryResultList: patrols"
                            style="width: 100%; font-size: 18px;" size="large" max-height="700"
                            :empty-text="ifShowQueryResult? '未找到该人员': 'Loading...'">
                            <!-- <el-table-column prop="id" label="id" width="150" /> -->
                            <el-table-column prop="name" label="姓名" width="140" header-align="center" align="center" />
                            <el-table-column prop="title" label="职务" width="220" header-align="center" align="center" />

                            <el-table-column prop="department" label="部门" width="240" header-align="center"
                                align="center" />
                            <el-table-column prop="telephone" label="电话" width="160" header-align="center"
                                align="center" />
                            <el-table-column prop="identity" label="人员类型" width="120" header-align="center"
                                align="center" />
                            <el-table-column prop="regionName" label="所处围栏" width="120" header-align="center"
                                align="center" />
                            <el-table-column prop="task" label="任务" width="100" header-align="center" align="center" />

                            <el-table-column prop="wechat" label="微信" width="150" header-align="center"
                                align="center" />


                            <el-table-column fixed="right" label="操作" width="250" header-align="center" align="center">
                                <template #default="scope">
                                    <el-button class="allocateFench" link size="small" type="primary" plain text
                                        style="font-size:14px;" @click="editInfo(scope.$index)">
                                        编辑信息
                                    </el-button>
                                    <!-- <el-button
                                        
          size="mini"
          type="primary"
          @click.prevent="editFence(scope.$index)" plain text style="font-size:20px">设置状态</el-button>
      -->
                                    <el-button link size="small" type="primary" plain text style="font-size:20px">
                                        <el-icon style="vertical-align: middle">
                                            <PhoneFilled />
                                        </el-icon>
                                    </el-button>
                                    <el-button size="small" type="primary" plain text style="font-size:12px">
                                        <el-image class="logo-icon" :src="require('@/assets/img/wx_icon.png')"
                                            :size="35"></el-image>
                                    </el-button>
                                    <el-button class="allocationFench" link size="small" type="danger" plain text
                                        style="font-size:14px" @click="removePerson(scope.$index)">删除
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                        <!-- <nav v-if="!ifShowQueryResult" aria-label="...">
                            <ul class="pagination" style="float: right; margin-top: 20px;">
                                <li class="page-item" @click="click_page(-2)">
                                    <a class="page-link" href="#">前一页</a>
                                </li>
                                <li :class="'page-item ' + page.is_active" v-for="page in pages" :key="page.number"
                                    @click="click_page(page.number)">
                                    <a class="page-link" href="#">{{ page.number }}</a>
                                </li>

                                <li class="page-item" @click="click_page(-1)">
                                    <a class="page-link" href="#">后一页</a>
                                </li>
                            </ul>
                        </nav> -->
                        <!-- :page-count="page_count" @size-change="size_change"
                            @current-change="pull_page" -->
                        <!-- :current-page="current_page" -->

                        <div class="float-end" style="margin-top: 10px">
                            <el-pagination background layout="total, prev, pager, next, jumper" :total="total_records"
                                :current-page="current_page" @current-change="pull_page" />
                        </div>


                    </div>


                </div>
            </div>
        </div>

    </div>

    <el-dialog v-model="addPersonDialogVisible" title="添加人员" @close="exitAdd(addPersonFormRef)">
        <template #default>
            <el-form :rules="rules" ref="addPersonFormRef" :model="form" label-width="120px" style="max-width: 500px">
                <!-- <el-form-item label="id" width="100px" prop="id">
                    <el-input v-model="form.id" />
                </el-form-item> -->
                <el-form-item label="人员姓名" width="100px" :rules="rules.name" prop="name">
                    <el-input v-model="form.name" />
                </el-form-item>
                <el-form-item label="选择分配围栏" prop="fenceName">
                    <el-select v-model="form.fenceName" placeholder="选择围栏">
                        <el-option v-for="polygon in polygons" :key="polygon.id" :label="polygon.name"
                            :value="polygon.id" />
                    </el-select>
                </el-form-item>

                <el-form-item label="人员职务" width="100px" :rules="rules.title" prop="title">
                    <el-input v-model="form.title" />
                </el-form-item>
                <el-form-item label="部门" :rules="rules.department" prop="department">
                    <el-input v-model="form.department" />
                </el-form-item>
                <el-form-item label="人员类型" prop="office">
                    <!-- <el-input v-model="form.office" /> -->
                    <el-radio-group v-model="form.office" class="ml-4">
                        <el-radio label="执法人员">执法人员</el-radio>
                        <el-radio label="协管人员">协管人员</el-radio>
                    </el-radio-group>
                </el-form-item>


                <el-form-item label="手机号" :rules="rules.tel" prop="phone">
                    <el-input v-model="form.phone" />
                </el-form-item>
                <el-form-item label="微信号" prop="wechat">
                    <el-input v-model="form.wechat" />
                </el-form-item>
                <el-form-item label="任务负责" prop="task">
                    <el-input v-model="form.task" />
                </el-form-item>


                <!-- <el-form-item label="状态">
      <el-radio-group v-model="form.work">
        <el-radio label="执勤中" />
        <el-radio label="休息中" />
      </el-radio-group>
    </el-form-item> -->
            </el-form>
        </template>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="confirmAddPerson(addPersonFormRef)">添加
                </el-button>
                <el-button @click="exitAdd(addPersonFormRef)">取消</el-button>
            </span>
        </template>
    </el-dialog>

    <el-dialog v-model="dialogFormVisible" title="分配围栏">
        <template #default>
            <template v-for="tableItem in tableDataFence" :key="tableItem.id">
                <el-table :data="tableItem.data" class="table" :fit="false" max-height="300px">
                    <el-table-column type="selection" width="55" />
                    <el-table-column v-for="i in tableItem.headerNames.length-2" :label="tableItem.headerNames[i - 1]"
                        :key="i" :prop="tableItem.dataNames[i - 1]" width="200" />

                </el-table>
            </template>
        </template>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取消</el-button>
                <el-button type="primary" @click="dialogFormVisible = false">将人员分配到选中围栏</el-button>
            </span>
        </template>
    </el-dialog>

    <el-dialog v-model="editInfoDialogVisible" title="编辑信息" @close="exitEdit(ruleFormRef)">
        <template #default>
            <el-form :rules="rules" ref="ruleFormRef" :model="form" label-width="120px" style="max-width: 500px">
                <el-form-item label="人员姓名" width="100px" :rules="rules.name" prop="name">
                    <el-input v-model="form.name" />
                </el-form-item>
                <el-form-item label="选择分配围栏" prop="fenceName">
                    <el-select v-model="form.fenceName" placeholder="选择围栏">
                        <el-option v-for="polygon in polygons" :key="polygon.id" :label="polygon.name"
                            :value="polygon.id" />
                    </el-select>
                </el-form-item>

                <el-form-item label="人员职务" width="100px" :rules="rules.title" prop="title">
                    <el-input v-model="form.title" />
                </el-form-item>
                <el-form-item label="人员类型" prop="office">
                    <!-- <el-select v-model="form.office" placeholder="选择职务">
                        <el-option label="执法人员" value="执法人员" />
                        <el-option label="协管人员" value="协管人员" />
                    </el-select> -->
                    <el-radio-group v-model="form.office" class="ml-4">
                        <el-radio label="执法人员">执法人员</el-radio>
                        <el-radio label="协管人员">协管人员</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="部门" :rules="rules.department" prop="department">
                    <el-input v-model="form.department" />
                </el-form-item>
                <el-form-item label="手机号" :rules="rules.tel" prop="phone">
                    <el-input v-model="form.phone" />
                </el-form-item>
                <el-form-item label="微信号" prop="wechat">
                    <el-input v-model="form.wechat" />
                </el-form-item>
                <el-form-item label="任务负责" prop="task">
                    <el-input v-model="form.task" />
                </el-form-item>

                <!-- <el-form-item label="状态">
      <el-radio-group v-model="form.work">
        <el-radio label="执勤中" />
        <el-radio label="休息中" />
      </el-radio-group>
    </el-form-item> -->

            </el-form>
        </template>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="confirmEdit(ruleFormRef)">确认修改</el-button>
                <el-button @click="exitEdit(ruleFormRef)">取消</el-button>
            </span>
        </template>
    </el-dialog>



</template>

<script>
import { reactive } from 'vue';
import { ref } from 'vue';
import { PhoneFilled, Search } from "@element-plus/icons-vue";
// import _ from 'lodash';
import axios from 'axios';
import { useStore } from 'vuex';

export default {
    setup() {
        const store = useStore();
        const dialogFormVisible = ref(false);
        const editInfoDialogVisible = ref(false);
        const addPersonDialogVisible = ref(false);
        const ruleFormRef = ref();
        const addPersonFormRef = ref();
        const queryName = ref("");
        const ifShowQueryResult = ref(false);

        const rules = reactive({
            name: [
                { required: true, message: '请输入姓名', trigger: 'blur' },
                { min: 1, max: 10, message: '姓名长度不合法', trigger: 'blur' },
            ],
            title: [
                {
                    required: true,
                    message: '请输入职务',
                    trigger: 'blur',
                },
            ],
            department: [
                {
                    required: true,
                    message: '请输入部门',
                    trigger: 'blur',
                },
            ],
            identity: [
                {
                    required: true,
                    message: '请输入人员类别',
                    trigger: 'blur',
                },
            ],

            street: [
                {
                    required: true,
                    message: '请输入人员所属的街道',
                    trigger: 'blur',
                },
            ],
            tel: [
                {
                    required: true,
                    message: '请输入人员的电话',
                    trigger: 'blur',
                }, { min: 11, max: 11, message: '请输入11位手机号', trigger: 'blur' }
            ],
            vx: [
                {
                    required: true,
                    message: '请输入人员的微信号',
                    trigger: 'blur',
                },
            ],

        })
        const location_default = [[104.08492764442998, 30.68480125658667], [104.08365351, 30.68295086], [104.08072097, 30.67860853], [104.07885946, 30.67566969], [104.08209799, 30.67371765], [104.08337302, 30.67305968], [104.08548955, 30.67295001], [104.08640756, 30.67242363], [104.08737657, 30.67130496], [104.08969711, 30.67003284], [104.0931397, 30.67437556], [104.09503929080208, 30.676760482514343], [104.09404708576766, 30.67709813178603], [104.09319526012625, 30.67755346424976], [104.0889016588199, 30.67973288126206], [104.08985310259258, 30.68114865339007], [104.0938978905621, 30.68731587980966], [104.09245489514863, 30.68739105990879], [104.0919520352031, 30.68761668238092], [104.0918208562049, 30.688086727916605], [104.0918864482493, 30.688387556150783], [104.09254236028306, 30.689384044611078], [104.09228000018922, 30.689929289719906], [104.09147104977237, 30.690530936791273], [104.09136174494047, 30.690662456906992], [104.09212697248623, 30.69177172328108], [104.0929359243766, 30.692016136609283], [104.09350438084842, 30.692316942063513], [104.09385420724126, 30.694121809071444], [104.09182090408228, 30.695193436775803], [104.09136177019272, 30.695381440708015], [104.09109940851961, 30.69573864741584], [104.09179904282321, 30.695851449326277], [104.09271731864521, 30.69718626435893], [104.08160700326367, 30.69738300807923], [104.08141413765587, 30.69424306967441], [104.0814098548041, 30.69276580457567], [104.08130353615583, 30.69150605378136], [104.08120577754372, 30.690324399215953], [104.0808427664515, 30.689480117960123], [104.08065301312334, 30.68907571576189], [104.08072726502077, 30.688522317039517], [104.08089227124948, 30.688359135434162], [104.08147804205797, 30.687741882389425], [104.08221231450686, 30.687117533057464], [104.0832518478065, 30.686195177378128], [104.08371386027875, 30.68581204757918], [104.0851906559503, 30.685166395415408], [104.08492764442998, 30.68480125658667]]
        const form = reactive({
            id: '',
            name: '',
            title: '',
            fenceName: '',
            office: ref(''),
            department: '',
            task: '',
            phone: '',
            wechat: '',
            street: '',
            location: (location_default[Math.floor(Math.random() * 48)]).toString()
        })

        let polygons = reactive({});
        const initPatrolList = () => {
            Object.keys(polygons).map(key => {
                delete polygons[key]
            });
            axios({
                url: "/api/region",
                method: "get",
                headers: {
                    Authorization: store.state.user.tokenHeader + store.state.user.token,
                },
            }).then(function (resp) {

                for (const item of resp.data.data) {
                    if (item.pointList.length >= 3) {
                        polygons[item.id] = {
                            id: item.id,
                            name: item.name,
                        }
                    }
                }
                //getPatrolList();
            })
        }
        initPatrolList();

        let patrolInfo = reactive({});
        let patrolList = reactive([]);
        // const getPatrolList = () => {

        //     Object.keys(patrolInfo).map(key => {
        //         delete patrolInfo[key]
        //     });
        //     patrolList.splice(0, patrolList.length);

        //     axios({
        //         url: '/api/patrol',
        //         method: 'get'
        //     }).then(function (resp) {

        //         if (resp.status == 200) {
        //             for (let item of resp.data.data) {
        //                 let relatedRegion;
        //                 let regionName;

        //                 if (item.relatedRegion == null) {
        //                     relatedRegion = "暂未分配";
        //                     regionName = "暂未分配";
        //                 } else {
        //                     relatedRegion = item.relatedRegion;
        //                     regionName = polygons[relatedRegion]["name"];
        //                 }

        //                 let task;
        //                 if (item.task == null) {
        //                     task = "暂无";
        //                 } else {
        //                     task = item.task;
        //                 }

        //                 let patrol = {
        //                     id: item.id,
        //                     name: item.name,
        //                     department: item.department,
        //                     relatedRegion: relatedRegion,
        //                     regionName: regionName,
        //                     telephone: item.telephone,
        //                     wechat: item.wechat,
        //                     identity: item.identity,
        //                     task: task,
        //                 }
        //                 patrolInfo[item.id] = patrol;
        //                 patrolList.push(patrol);
        //             }
        //         }
        //     })
        // }

        const addPerson = () => {
            addPersonDialogVisible.value = true;
        }

        const confirmAddPerson = (addPersonFormRef) => {
            addPersonFormRef.validate((valid) => {
                if (valid) {
                    addPersonDialogVisible.value = false;

                    axios({
                        url: "/api/patrol",
                        method: 'post',
                        headers: {
                            Authorization: store.state.user.tokenHeader + store.state.user.token,
                        },
                        data: {
                            name: form.name,
                            title: form.title,
                            relatedRegion: form.fenceName,
                            identity: form.office,
                            department: form.department,
                            telephone: form.phone,
                            wechat: form.wechat,
                            task: form.task,
                        }

                    }).then(function () {
                        initPatrolList();
                        pull_page(current_page);
                    })

                }
            })
        }

        const exitAdd = (addPersonFormRef) => {
            addPersonDialogVisible.value = false;
            addPersonFormRef.resetFields();
        }

        let editIndex;
        const editInfo = (index) => {
            let editId
            if (ifShowQueryResult.value == true) {
                editId = queryResultList[index].id;
                editIndex = index;
            } else {
                editId = patrols.value[index].id;
                editIndex = index;
            }
            form.id = patrolInfo[editId].id;
            form.name = patrolInfo[editId].name;
            form.phone = patrolInfo[editId].telephone;
            form.wechat = patrolInfo[editId].wechat;
            form.office = patrolInfo[editId].identity;
            form.title = patrolInfo[editId].title;
            if (patrolInfo[editId].regionName == "暂未分配") {
                form.fenceName = "";
            } else {
                form.fenceName = patrolInfo[editId].relatedRegion;
            }

            if (patrolInfo[editId].task == "暂无") {
                form.task = "";
            } else {
                form.task = patrolInfo[editId].task;
            }
            form.department = patrolInfo[editId].department;
            editInfoDialogVisible.value = true;
        }

        const exitEdit = (formE1) => {

            editInfoDialogVisible.value = false;

            formE1.resetFields();
            form.id = '';
            form.name = '';
            form.title = '';
            form.phone = '';
            form.wechat = '';
            form.office = '';
            form.fenceName = '';
            form.department = '';
            form.task = '';
        }

        const confirmEdit = (formEl) => {
            formEl.validate((valid) => {
                if (valid) {
                    editInfoDialogVisible.value = false;
                    let index = editIndex;


                    axios({
                        url: "/api/patrol",
                        method: 'post',
                        headers: {
                            Authorization: store.state.user.tokenHeader + store.state.user.token,
                        },
                        data: {
                            id: patrols.value[index].id,
                            title: form.title,
                            name: form.name,
                            relatedRegion: form.fenceName,
                            identity: form.office,
                            department: form.department,
                            telephone: form.phone,
                            wechat: form.wechat,
                            task: form.task,
                        }
                    }).then(function () {
                        initPatrolList();
                        pull_page(current_page.value);
                    })

                }
            })
        }

        const removePerson = (index) => {
            let removeId;
            if (ifShowQueryResult.value == true) {
                removeId = queryResultList[index].id;
            } else {
                removeId = patrols.value[index].id;
            }

            axios({
                url: '/api/patrol/' + removeId,
                method: 'delete',
                headers: {
                    Authorization: store.state.user.tokenHeader + store.state.user.token,
                },
                params: {
                    id: removeId,
                }
            }).then(function () {
                initPatrolList();
                pull_page(current_page.value);

            })

        }

        let queryResultList = reactive([])
        const searchPatrol = () => {
            Object.keys(patrolInfo).map(key => {
                delete patrolInfo[key]
            });
            queryResultList.splice(0, queryResultList.length);

            queryName.value = queryName.value.trim();
            if (queryName.value != "") {
                axios({
                    url: '/api/patrol/name/' + queryName.value,
                    method: 'get',
                    headers: {
                        Authorization: store.state.user.tokenHeader + store.state.user.token,
                    },
                    params: {
                        name: queryName.value
                    }
                }).then(function (resp) {
                    if (resp.status == 200) {
                        for (let item of resp.data.data) {

                            let relatedRegion;
                            let regionName;

                            if (item.relatedRegion == null) {
                                relatedRegion = "暂未分配";
                                regionName = "暂未分配";
                            } else {
                                relatedRegion = item.relatedRegion;
                                regionName = polygons[relatedRegion]["name"];
                            }

                            let task;
                            if (item.task == null || item.task == '') {
                                task = "暂无";
                            } else {
                                task = item.task;
                            }

                            let patrol = {
                                id: item.id,
                                name: item.name,
                                title: item.title,
                                department: item.department,
                                relatedRegion: relatedRegion,
                                regionName: regionName,
                                telephone: item.telephone,
                                wechat: item.wechat,
                                identity: item.identity,
                                task: task,
                            }

                            queryResultList.push(patrol);
                            patrolInfo[item.id] = patrol;
                        }
                    }
                    ifShowQueryResult.value = true;
                    queryName.value = "";
                })
            }

        }

        const backToFirstPage = () => {
            ifShowQueryResult.value = false;
            // initPatrolList();
            pull_page(current_page.value);
        }

        let total_records = ref(0);
        let current_page = ref(1);
        let pages = ref([]);
        let patrols = ref([]);
        let pageNum = 10;
        let page_count = 0;
        const pull_page = page => {

            Object.keys(patrolInfo).map(key => {
                delete patrolInfo[key]
            });
            current_page.value = page;
            axios({
                url: '/api/patrol/page',
                method: 'get',
                headers: {
                    Authorization: store.state.user.tokenHeader + store.state.user.token,
                },
                params: {
                    pageNum: page,
                    pageSize: pageNum,
                }
            }).then(function (resp) {

                patrols.value.splice(0, patrols.value.length);
                total_records.value = parseInt(resp.data.data.total);
                page_count = parseInt(resp.data.data.pages);


                for (let item of resp.data.data.records) {
                    let relatedRegion;
                    let regionName;

                    if (item.relatedRegion == null) {
                        relatedRegion = "暂未分配";
                        regionName = "暂未分配";
                    } else {
                        relatedRegion = item.relatedRegion;
                        regionName = polygons[relatedRegion]["name"];
                    }

                    let task;
                    if (item.task == null || item.task == '') {
                        task = "暂无";
                    } else {
                        task = item.task;
                    }

                    let patrol = {
                        id: item.id,
                        name: item.name,
                        title: item.title,
                        department: item.department,
                        relatedRegion: relatedRegion,
                        regionName: regionName,
                        telephone: item.telephone,
                        wechat: item.wechat,
                        identity: item.identity,
                        task: task,
                    }
                    patrolInfo[item.id] = patrol;
                    patrols.value.push(patrol);
                }
                // patrols.value = resp.data.data.records;
                //update_pages();
                ifShowQueryResult.value = false;
            })
        }

        // const update_pages = () => {
        //     let max_pages = parseInt(Math.ceil(total_records / pageNum));
        //     let new_pages = [];
        //     for (let i = current_page - 2; i <= current_page + 2; i++) {
        //         if (i >= 1 && i <= max_pages) {
        //             new_pages.push({
        //                 number: i,
        //                 is_active: i === current_page ? "active" : "",
        //             });
        //         }
        //     }
        //     pages.value = new_pages;
        // }

        // const click_page = page => {
        //     if (page === -2) page = current_page - 1;
        //     else if (page === -1) page = current_page + 1;
        //     let max_pages = parseInt(Math.ceil(total_records / pageNum));

        //     if (page >= 1 && page <= max_pages) {
        //         pull_page(page);
        //     }
        // }

        const size_change = page => {
            console.log(page);
        }
        pull_page(current_page.value);

        return {
            editInfo,
            confirmEdit,
            exitEdit,
            confirmAddPerson,
            exitAdd,
            addPerson,
            removePerson,
            searchPatrol,
            backToFirstPage,
            //click_page,
            pull_page,
            size_change,
            rules,
            form,
            dialogFormVisible,
            editInfoDialogVisible,
            ruleFormRef,
            addPersonFormRef,
            addPersonDialogVisible,
            polygons,
            patrolList,
            queryName,
            ifShowQueryResult,
            queryResultList,
            pages,
            patrols,
            total_records,
            current_page,
            page_count
        }
    },
    components: {
        PhoneFilled,
        Search,
    }
}
</script>

<style scoped>
.card {
    margin-top: 8vh;
}

.allocateFench:hover {
    color: #A0D8FF;
}

.allocateFench,
.allocateFench:focus:not(.allocateFench:hover) {
    color: #409EFF;
}
</style>
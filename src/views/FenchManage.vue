<template>
    <div>
        <button type="button" class="btn btn-outline-secondary" @click="createMarker()">创建围栏/取消创建</button>
        <button v-if="!exitEditAble" type="button" class="btn btn-outline-secondary" data-bs-toggle="modal"
            data-bs-target="#edit-fench">编辑围栏/取消编辑</button>
        <button v-else type="button" class="btn btn-outline-secondary" @click="exitEdit()">编辑围栏/取消编辑</button>
        <!-- <button v-else type="button" class="btn btn-outline-secondary">退出编辑</button> -->

        <button v-if="confirmOperation" type="button" class="btn btn-outline-secondary" data-bs-toggle="modal"
            data-bs-target="#add-fench">确认创建/编辑</button>
        <button v-else type="button" class="btn btn-outline-secondary">确认创建/编辑</button>


        <div class="modal fade" id="edit-fench" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">修改围栏</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <table class="table table-striped table-hover" id="fenceList">
                            <thead>
                                <tr>
                                    <th>围栏id</th>
                                    <th>围栏名</th>
                                    <th>操作者</th>
                                    <th>编辑时间</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(value, key) in polygonInfo" :key="key">
                                    <td>{{value.id}}</td>
                                    <td>{{value.name}}</td>
                                    <td>{{value.operator}}</td>
                                    <td>{{value.editTime}}</td>
                                    <td>
                                        <el-button class="editFench" link size="small" type="primary" plain text
                                            style="font-size:14px; " @click="inEditFence(value.id)">
                                            编辑围栏
                                        </el-button>
                                        <el-button link size="small" type="danger" plain text style="font-size:14px"
                                            @click="deleteFence(value.id)">删除
                                        </el-button>
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" @click="inEditFence()">确定</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    </div>

                </div>
            </div>
        </div>


        <div class="modal fade" id="add-fench" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">新建围栏</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <el-form label-width="120px" style="max-width: 500px">
                            <el-form-item label="围栏名称" width="100px">
                                <el-input v-model="fenceInfo.name" />
                            </el-form-item>
                            <!-- <el-form-item label="围栏编号" width="100px">
                                <el-input v-model="fenceInfo.id" />
                            </el-form-item> -->
                            <el-form-item label="创建者">
                                <el-input v-model="fenceInfo.operator" />
                            </el-form-item>
                            <el-form-item label="创建/编辑时间">
                                <el-input v-model="fenceInfo.editTime" />
                            </el-form-item>


                        </el-form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" @click="addFence()">确定</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    </div>

                </div>
            </div>
        </div>

        <div class="map" id="olMap"></div>
        <div id="popup" class="ol-popup">
            <a href="#" id="popup-closer" class="ol-popup-closer"></a>
            <div id="popup-content"></div>
        </div>
    </div>
</template>
  
<script >
import "ol/ol.css";
import { Tile as TileLayer, Vector as LayerVec } from "ol/layer";
import { Vector as SourceVec } from 'ol/source';
import XYZ from "ol/source/XYZ";
import Map from "ol/Map.js";
import View from "ol/View.js";
import { onMounted } from "vue";
import { Style, Icon, Fill, Circle, Stroke } from "ol/style"
import { Modal } from 'bootstrap/dist/js/bootstrap';
import { ref, reactive } from "vue";
import { Collection, Feature, Overlay } from "ol";
import { Point } from "ol/geom";
import { DoubleClickZoom, Translate } from "ol/interaction";
import { unByKey } from "ol/Observable";
import { Polygon } from "ol/geom";
import { useStore } from "vuex";
import _ from 'lodash';

export default {

    setup() {
        let store = useStore();
        let map = null;
        const time = getTime(new Date());
        const fenceInfo = ref({
            name: '',
            id: ' ',
            operator: "",
            editTime: time,
            pointList: '',

        });

        let editFenceName = ref("");
        const createMarkerSignal = ref(false);
        let overlayClick;
        let content;
        let popup;
        let polygonId;

        function getTime(date) {
            let y = date.getFullYear() //年
            let m = date.getMonth() + 1  //月，月是从0开始的所以+1
            let d = date.getDate() //日
            m = m < 10 ? "0" + m : m //小于10补0
            d = d < 10 ? "0" + d : d //小于10补0
            return y + "-" + m + "-" + d; //返回时间形式yyyy-mm-dd
        }

        const initMap = () => {
            let terMap = new Map({
                target: "olMap",
                view: new View({
                    center: [104.04396204, 30.71499549],
                    zoom: 15,
                    projection: "EPSG:4326",
                }),
            });
            map = terMap;
            //   添加地图
            let Tersource = new XYZ({
                url: "http://t4.tianditu.com/DataServer?T=vec_w&tk=b9031f80391e6b65bd1dd80dcde1b097&x={x}&y={y}&l={z}",
            });
            let terLayer = new TileLayer({
                source: Tersource,
            });
            map.addLayer(terLayer);
            // 添加注记
            let CTAsource = new XYZ({
                url: "http://t4.tianditu.com/DataServer?T=cva_w&tk=b9031f80391e6b65bd1dd80dcde1b097&x={x}&y={y}&l={z}",
            });
            let CTAlayer = new TileLayer({
                source: CTAsource,
            });
            map.addLayer(CTAlayer);

            let container = document.getElementById('popup');
            content = document.getElementById('popup-content');
            let closer = document.getElementById('popup-closer');

            popup = new Overlay({
                element: container,
                autoPan: true,
                positioning: 'bottom-center',
                stopEvent: false,

            });
            map.addOverlay(popup);

            closer.onclick = function () {
                popup.setPosition(undefined);
                closer.blur();
                return false;
            };

            map.on('pointermove', function (e) {
                let pixel = map.getEventPixel(e.originalEvent);
                let hit = map.hasFeatureAtPixel(pixel);
                map.getTargetElement().style.cursor = hit ? 'pointer' : '';
            });

            // 去除双击地图缩放
            const dblClickInteraction = map
                .getInteractions()
                .getArray()
                .find(interaction => {
                    return interaction instanceof DoubleClickZoom
                });
            map.removeInteraction(dblClickInteraction);

            createIconLayer();
            createPolygonLayer();

            const polygonList = _.cloneDeep(store.state.fence.fence_list);

            for (const fenceId in polygonList) {
                let polygonFeature = createPolygonFeature(_.cloneDeep(polygonList[fenceId].markerList));
                polygonFeature.set('name', fenceId);

                polygonInfo[fenceId] = {
                    id: polygonList[fenceId].id,
                    name: polygonList[fenceId].name,
                    operator: polygonList[fenceId].operator,
                    editTime: polygonList[fenceId].editTime,
                    markList: _.cloneDeep(polygonList[fenceId].markerList),
                    feature: polygonFeature,
                };

                polygonSource.addFeature(polygonFeature);
            }

            createOverlayClick();
            polygonId = store.state.fence.polygonId;
        }

        let markerInfo = reactive({});     // 存放每次创建或编辑中的点信息
        let polygonInfo = reactive({});   // 存放围栏点集以及feature
        let confirmOperation = ref(false);
        let exitEditAble = ref(false);
        let dblClickEvent;
        let clickEvent;
        let vectorLayer;
        let iconSource;
        let markId;

        const createIconLayer = () => {
            iconSource = new SourceVec();
            let iconStyle = new Style({
                image: new Icon({
                    anchorOrigin: 'bottom-left',
                    anchorYUnits: "pixels",
                    opacity: 0.75,
                    src: '/images/location2.png'
                })
            });
            vectorLayer = new LayerVec({
                source: iconSource,
                style: iconStyle
            });
            map.addLayer(vectorLayer);
        }

        let polygonSource;
        let fenceStyle;
        let fenceLayer;

        const createPolygonLayer = () => {
            polygonSource = new SourceVec();
            fenceStyle = new Style({
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new Stroke({
                    color: '#ffcc33',
                    width: 5
                }),
                image: new Circle({
                    radius: 7,
                    fill: new Fill({
                        color: '#ffcc33'
                    })
                })
            });
            fenceLayer = new LayerVec({
                source: polygonSource,
                style: fenceStyle
            });
            map.addLayer(fenceLayer)
        }

        const createOverlayClick = () => {
            overlayClick = map.on('singleclick', function (e) {
                let coordinate = e.coordinate;
                let feature = map.forEachFeatureAtPixel(e.pixel, function (feature) {
                    return feature;
                });

                if (feature) {
                    content.innerHTML = '';

                    let featureId = feature.get('name');

                    let name = document.createElement('p');
                    name.innerText = '围栏名: ' + polygonInfo[featureId].name;
                    content.appendChild(name);

                    let operator = document.createElement('p');
                    operator.innerText = '操作人: ' + polygonInfo[featureId].operator;
                    content.appendChild(operator);

                    let editTime = document.createElement('p');
                    editTime.innerText = '编辑时间: ' + polygonInfo[featureId].editTime;
                    content.appendChild(editTime);

                    popup.setPosition(coordinate);
                }
            });
        }

        const createDblClick = () => {
            dblClickEvent = map.on('dblclick', function (e) {
                let feature = map.forEachFeatureAtPixel(e.pixel, function (feature) {
                    return feature;
                });

                if (feature) {
                    delete markerInfo[feature.get('name')];
                    iconSource.removeFeature(feature);
                } else {
                    clickHandler(e);
                }

            });
        }

        const createMarker = () => {
            if (createMarkerSignal.value === false) {
                markId = 0;
                unByKey(overlayClick);
                createDblClick();
                fenceInfo.value.name = "";
                fenceInfo.value.operator = "";
                fenceInfo.value.editTime = time;

                confirmOperation.value = true;
                createMarkerSignal.value = true;
            } else {
                for (let point in markerInfo) {
                    iconSource.removeFeature(markerInfo[point].feature);
                }
                if (beforePreview != null) {
                    polygonSource.removeFeature(beforePreview);
                    beforePreview = null;
                }
                unByKey(dblClickEvent);
                unByKey(clickEvent);

                confirmOperation.value = false;
                createMarkerSignal.value = false;
            }
        }

        const clickHandler = (e) => {

            let point = e.coordinate;
            let iconFeature = new Feature({
                geometry: new Point(point, "XY")
            });

            iconFeature.set('name', markId);
            markId++;

            iconSource.addFeature(iconFeature);

            let iconTranslate = new Translate({
                features: new Collection([iconFeature])
            });
            map.addInteraction(iconTranslate);

            iconTranslate.on('translateend', () => {
                let clickPoint = iconFeature.getGeometry().flatCoordinates;
                markerInfo[iconFeature.get('name')].point = clickPoint;
                preview();
            })

            markerInfo[iconFeature.get('name')] = {
                point: point,
                feature: iconFeature
            };
            preview();

        }

        const createPolygonFeature = (markerList) => {

            let oltarget;
            sortMarker(markerList);
            markerList.push(markerList[0])

            const tmp = new Polygon([markerList]);
            oltarget = new Feature(tmp);
            oltarget.setStyle(
                new Style({
                    fill: new Fill({ color: "#4e98f444" }),
                    stroke: new Stroke({
                        lineDash: [10, 10, 10, 10],
                        color: "#4e98f444",
                        width: 3
                    })
                })
            );
            return oltarget;
        }


        let isEdit = false;

        const addFence = () => {
            Modal.getInstance("#add-fench").hide();
            if (markerInfo.length < 3) {
                console.log("点数不足");
                for (let point in markerInfo) {
                    iconSource.removeFeature(markerInfo[point].feature);
                }
            } else {
                let markerList = [];
                for (let point in markerInfo) {
                    markerList.push(markerInfo[point].point);
                    iconSource.removeFeature(markerInfo[point].feature);
                }
                markerInfo = reactive({});
                let oltarget;
                if (isExitEdit) {
                    oltarget = polygonInfo[beforeFeatureId].feature;
                } else {

                    oltarget = createPolygonFeature(markerList);
                    let tmpPolygonId = polygonId;
                    if (isEdit) {
                        polygonId = beforeFeatureId;
                    }
                    oltarget.set('name', polygonId);

                    polygonInfo[polygonId] = {
                        id: polygonId,
                        name: fenceInfo.value.name,
                        operator: fenceInfo.value.operator,
                        editTime: fenceInfo.value.editTime,
                        markList: markerList,
                        feature: oltarget,

                    };

                    if (isEdit) {
                        polygonId = tmpPolygonId - 1;
                    }

                    let newPolygon = {
                        id: polygonId,
                        name: fenceInfo.value.name,
                        operator: fenceInfo.value.operator,
                        editTime: fenceInfo.value.editTime,
                        polygonId: polygonId,
                        markerList: markerList,

                    }
                    store.commit("updateFenceList", newPolygon);
                    polygonId++;
                    store.commit("updatePolygonId", polygonId);

                }
                polygonSource.addFeature(oltarget);

                if (beforePreview != null) {
                    polygonSource.removeFeature(beforePreview);
                    beforePreview = null;
                }
                unByKey(dblClickEvent);
                unByKey(clickEvent);
                createMarkerSignal.value = false;
                isExitEdit = false;
                isEdit = false;
                exitEditAble.value = false;
                confirmOperation.value = false;
                createOverlayClick();

            }





        }

        let beforeFeatureId = "";
        let isExitEdit = false;
        const inEditFence = (editFence) => {
            Modal.getInstance("#edit-fench").hide();
            if (createMarkerSignal.value == false && isEdit == false) {
                unByKey(overlayClick);

                isEdit = true;
                exitEditAble.value = true;
                confirmOperation.value = true;

                let feature = polygonInfo[editFence].feature;
                fenceInfo.value.name = polygonInfo[editFence].name;
                fenceInfo.value.operator = polygonInfo[editFence].operator;
                fenceInfo.value.editTime = getTime(new Date());

                beforeFeatureId = editFence;
                polygonSource.removeFeature(feature);

                createDblClick();
                markId = 0;
                markerInfo = {};
                let marklist = polygonInfo[editFence].markList
                for (let idx in marklist) {
                    if (idx == marklist.length - 1) {
                        break;
                    }
                    let point = marklist[idx];
                    let iconFeature = new Feature({
                        geometry: new Point(point, "XY"),
                    });
                    iconSource.addFeature(iconFeature);
                    let iconTranslate = new Translate({
                        features: new Collection([iconFeature])
                    });
                    iconFeature.set('name', markId);
                    markId++;
                    map.addInteraction(iconTranslate);

                    iconTranslate.on('translateend', () => {
                        let clickPoint = iconFeature.getGeometry().flatCoordinates;
                        markerInfo[iconFeature.get('name')].point = clickPoint;
                        preview();
                    })

                    markerInfo[iconFeature.get('name')] = {
                        point: point,
                        feature: iconFeature
                    };
                    preview();
                }
            }
            editFenceName.value = "";

        };

        const exitEdit = () => {
            isExitEdit = true;
            addFence();
        }


        const sortMarker = (markerList) => {
            let geometryPoints = [];
            let maxXPointIdx = 0;
            for (let i = 0; i < markerList.length; i++) {
                let gp = {
                    X: markerList[i][0],
                    Y: markerList[i][1],
                    slope: null,
                };

                geometryPoints.push(gp);
                if (geometryPoints[maxXPointIdx].X < gp.X) {
                    maxXPointIdx = i;
                } else if (geometryPoints[maxXPointIdx].X == gp.X && geometryPoints[maxXPointIdx].Y > gp.Y) {
                    maxXPointIdx = i;
                }
            }

            for (let i = 0; i < markerList.length; i++) {
                if (i == maxXPointIdx) {
                    geometryPoints[i].slope = 1e9;
                } else {
                    geometryPoints[i].slope = (geometryPoints[i].Y - geometryPoints[maxXPointIdx].Y) / (geometryPoints[i].X - geometryPoints[maxXPointIdx].X);
                }
            }

            geometryPoints.sort(function (a, b) {
                if (a.slope < b.slope) {
                    return 1;
                } else {
                    return -1;
                }
            })

            for (let i in geometryPoints) {
                markerList[i] = [geometryPoints[i].X, geometryPoints[i].Y];
            }

        }

        const deleteFence = (deleteFence) => {
            Modal.getInstance("#edit-fench").hide();
            const fenceFeature = polygonInfo[deleteFence].feature;
            store.commit("removeFence", deleteFence);
            delete polygonInfo[deleteFence]
            polygonSource.removeFeature(fenceFeature);
        }


        onMounted(() => {
            initMap();
        });

        let beforePreview = null;
        const preview = () => {
            let len = Object.keys(markerInfo).length;
            if (len >= 3) {
                if (beforePreview != null) {
                    polygonSource.removeFeature(beforePreview);
                }
                let markerList = [];

                for (let point in markerInfo) {
                    markerList.push(markerInfo[point].point);
                }

                let nowFeature = createPolygonFeature(markerList);
                nowFeature.setStyle(
                    new Style({
                        stroke: new Stroke({
                            lineDash: [10, 10, 10, 10],
                            color: "#4e98f444",
                            width: 3
                        })
                    })
                );
                beforePreview = nowFeature;
                polygonSource.addFeature(nowFeature);
            }
        }


        return {
            createMarker,
            addFence,
            inEditFence,
            exitEdit,
            deleteFence,
            editFenceName,
            fenceInfo,
            polygonInfo,
            confirmOperation,
            exitEditAble,
        }


    },



};
</script>
  
<style scoped>
.map {
    width: 100%;
    height: 780px;
}

.ol-popup {
    position: absolute;
    background-color: white;
    -webkit-filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
    filter: drop-shadow(0 1px 4px #FFC125);
    padding: 15px;
    border-radius: 10px;
    border: 1px solid #cccccc;
    bottom: 12px;
    left: -50px;
    min-width: 200px;
}

.ol-popup:after,
.ol-popup:before {
    top: 100%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
}

.ol-popup:after {
    border-top-color: white;
    border-width: 10px;
    left: 48px;
    margin-left: -10px;
}

.ol-popup:before {
    border-top-color: #cccccc;
    border-width: 11px;
    left: 48px;
    margin-left: -11px;
}

.ol-popup-closer {
    text-decoration: none;
    position: absolute;
    top: 2px;
    right: 8px;
}

.ol-popup-closer:after {
    content: "×";
}
</style>


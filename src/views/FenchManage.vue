<template>
    <div>
        <!-- <button type="button" class="btn btn-outline-secondary" data-bs-toggle="modal"
            data-bs-target="#add-fench">绘制围栏</button>

        <div class="modal fade" id="add-fench" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">添加围栏</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="add-fench-name" class="form-label">围栏名称</label>
                            <input v-model="feature_name.name" type="text" class="form-control" id="add-fench-name"
                                placeholder="请输入围栏名称">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" @click="draw()">创建</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    </div>

                </div>
            </div>
        </div> -->

        <!-- <button type="button" class="btn btn-outline-secondary" data-bs-toggle="modal"
            data-bs-target="#remove-fench">删除围栏</button>

        <div class="modal fade" id="remove-fench" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">删除围栏</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="add-fench-name" class="form-label">围栏名称</label>
                            <input v-model="deleteFenchName.name" type="text" class="form-control" id="add-fench-name"
                                placeholder="请输入围栏名称">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" @click="deleteFench()">删除</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    </div>

                </div>
            </div>
        </div> -->

        <button type="button" class="btn btn-outline-secondary" @click="createMarker()">创建围栏/取消创建</button>
        <button type="button" class="btn btn-outline-secondary" data-bs-toggle="modal"
            data-bs-target="#edit-fench">编辑围栏</button>
        <button type="button" class="btn btn-outline-secondary" @click="exitEdit()">退出编辑</button>
        <button type="button" class="btn btn-outline-secondary" @click="addFence()">确认创建/编辑</button>
        <button type="button" class="btn btn-outline-secondary" @click="previewFence()">预览当前点生成围栏</button>
        <button type="button" class="btn btn-outline-secondary" data-bs-toggle="modal"
            data-bs-target="#delete-fench">删除围栏</button>

        <div class="modal fade" id="edit-fench" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">修改围栏</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="add-fench-name" class="form-label">围栏名称</label>
                            <input v-model="editFenceName" type="text" class="form-control" id="add-fench-name"
                                placeholder="请输入围栏名称">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" @click="inEditFence()">确定</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    </div>

                </div>
            </div>
        </div>

        <div class="modal fade" id="delete-fench" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">删除围栏</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="add-fench-name" class="form-label">围栏名称</label>
                            <input v-model="deleteFenceName" type="text" class="form-control" id="add-fench-name"
                                placeholder="请输入围栏名称">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" @click="deleteFence()">确定</button>
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
import { ref } from "vue";
import { Collection, Feature, Overlay } from "ol";
import { Point } from "ol/geom";
import { DoubleClickZoom, Translate } from "ol/interaction";
import { unByKey } from "ol/Observable";
import { Polygon } from "ol/geom";

export default {

    setup() {
        let map = null;

        let editFenceName = ref("");
        const createMarkerSignal = ref(false);
        let overlayClick;
        let content;
        let popup;

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
            createOverlayClick();

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

        }

        let markerInfo = new Array;     // 存放每次创建或编辑中的点信息
        let polygonInfo = new Array;   // 存放围栏点集以及feature
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

                    let info = document.createElement('h2');
                    info.innerText = 'Test';
                    content.appendChild(info);

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
                createMarkerSignal.value = true;
            } else {
                for (let point in markerInfo) {
                    iconSource.removeFeature(markerInfo[point].feature);
                }
                unByKey(dblClickEvent);
                unByKey(clickEvent);
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
            })

            markerInfo[iconFeature.get('name')] = {
                point: point,
                feature: iconFeature
            };

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

        let polygonId = 0;
        let isEdit = false;

        const addFence = () => {
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
                markerInfo = new Array;
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
                        markList: markerList,
                        feature: oltarget,
                    };

                    if (isEdit) {
                        polygonId = tmpPolygonId - 1;
                    }
                    polygonId++;
                }

                polygonSource.addFeature(oltarget);

                unByKey(dblClickEvent);
                unByKey(clickEvent);
                createMarkerSignal.value = false;
                isExitEdit = false;
                isEdit = false;
                createOverlayClick();
            }


        }

        let beforeFeatureId = "";
        let isExitEdit = false;
        const inEditFence = () => {
            Modal.getInstance("#edit-fench").hide();
            if (createMarkerSignal.value == false && isEdit == false) {
                unByKey(overlayClick);

                isEdit = true;
                let editFence = editFenceName.value;
                console.log(editFence);

                let feature = polygonInfo[editFence].feature;
                beforeFeatureId = feature.get('name');
                polygonSource.removeFeature(feature);

                createDblClick();
                markId = 0;
                markerInfo = new Array;
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
                    })

                    markerInfo[iconFeature.get('name')] = {
                        point: point,
                        feature: iconFeature
                    };
                }
            }
            editFenceName.value = "";

        };

        const exitEdit = () => {
            isExitEdit = true;
            addFence();
        }

        const previewFence = () => {
            let markerList = [];
            for (let point in markerInfo) {
                markerList.push(markerInfo[point].point);
            }
            let previewPolygonFeature = createPolygonFeature(markerList);
            polygonSource.addFeature(previewPolygonFeature);
            let intervalId = setInterval(function () {

                previewPolygonFeature.setStyle(
                    new Style({
                        fill: new Fill({ color: 'rgba(238,232,170, 0.7)' })
                    })
                );
                setTimeout(() => {
                    previewPolygonFeature.setStyle(
                        new Style({
                            fill: new Fill({ color: 'rgba(152,251,152, 0.7)' })
                        })
                    )
                }, 400);

                setTimeout(() => {
                    polygonSource.removeFeature(previewPolygonFeature);
                    clearInterval(intervalId);
                }, 3000);
            }, 800)
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

        let deleteFenceName = ref("");
        const deleteFence = () => {
            Modal.getInstance("#delete-fench").hide();
            const fenceFeature = polygonInfo[deleteFenceName.value].feature;
            delete polygonInfo[deleteFenceName.value];
            polygonSource.removeFeature(fenceFeature);
        }


        onMounted(() => {
            initMap();
        });


        return {
            createMarker,
            addFence,
            inEditFence,
            exitEdit,
            previewFence,
            deleteFence,
            editFenceName,
            deleteFenceName,
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


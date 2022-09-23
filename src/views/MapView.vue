<!-- <template>
    <div class="map-container">
        <MapIndex />
    </div>

</template>

<script setup>
import MapIndex from '../components/MapIndex.vue';


</script>

<style scoped>

</style> -->

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

        <button type="button" class="btn btn-outline-secondary" @click="createMarker()">绘制围栏</button>
        <button type="button" class="btn btn-outline-secondary" data-bs-toggle="modal"
            data-bs-target="#edit-fench">编辑围栏</button>
        <button type="button" class="btn btn-outline-secondary" @click="addFence()">确认创建</button>

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
        <div class="map" id="olMap"></div>
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
// import drawFence from '../scripts/drawFence'
import { Modal } from 'bootstrap/dist/js/bootstrap';
import { ref } from "vue";
import { Collection, Feature } from "ol";
import { Point } from "ol/geom";
import { DoubleClickZoom, Translate } from "ol/interaction";
import { unByKey } from "ol/Observable";
import { Polygon } from "ol/geom";

export default {

    setup() {
        let map = null;
        // let fence;
        // let feature_name = {
        //     name: ""
        // };

        // let deleteFenchName = {
        //     name: ""
        // }

        let editFenceName = ref("");
        let markList = [];

        const createMarkerSignal = ref(false);

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

        // const draw = () => {
        //     Modal.getInstance("#add-fench").hide();

        //     fence.drawingFence('Polygon', feature_name.name);
        //     feature_name.name = "";
        // }

        // const deleteFench = () => {
        //     Modal.getInstance("#remove-fench").hide();
        //     fence.removeFench(deleteFenchName.name);
        //     deleteFenchName.name = "";
        // }
        let markerInfo = new Array;
        let polygonInfo = new Array;
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

        const createMarker = () => {
            if (createMarkerSignal.value === false) {
                markId = 0;
                // iconSource = new SourceVec();
                // let iconStyle = new Style({
                //     image: new Icon({
                //         anchorOrigin: 'bottom-left',
                //         anchorYUnits: "pixels",
                //         opacity: 0.75,
                //         src: '/images/location2.png'
                //     })
                // });
                // vectorLayer = new LayerVec({
                //     source: iconSource,
                //     style: iconStyle
                // });
                // map.addLayer(vectorLayer);

                dblClickEvent = map.on('dblclick', function (e) {
                    clickHandler(e);
                });
                createMarkerSignal.value = true;
            } else {
                unByKey(dblClickEvent);
                unByKey(clickEvent);
                createMarkerSignal.value = false;
            }
        }

        const clickHandler = (e) => {

            let point = e.coordinate;
            markList.push(point);

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
                console.log(clickPoint);
            })

            markerInfo[iconFeature.get('name')] = {
                point: point,
                feature: iconFeature
            };

            // let iconStyle = new Style({
            //     image: new Icon({
            //         anchorOrigin: 'bottom-left',
            //         anchorYUnits: "pixels",
            //         opacity: 0.75,
            //         src: '/images/location.png'
            //     })
            // });
            // let vectorLayer = new LayerVec({
            //     source: iconSource,
            //     style: iconStyle
            // });

            // clickEvent = map.on('click', function (e) {
            //     let pixel = map.getEventPixel(e.originalEvent);

            //     map.forEachFeatureAtPixel(pixel, function (feature) {
            //         vectorLayer.getSource().removeFeature(feature);
            //     })
            // })

            // map.addLayer(vectorLayer);
        }

        let polygonId = 0;
        const addFence = () => {
            let markerList = [];
            for (let point in markerInfo) {
                markerList.push(markerInfo[point].point);
                iconSource.removeFeature(markerInfo[point].feature);
            }
            markerInfo = new Array;
            markerList.push(markerList[0])

            // let source = new SourceVec();
            // let fenceStyle = new Style({
            //     fill: new Fill({
            //         color: 'rgba(255, 255, 255, 0.2)'
            //     }),
            //     stroke: new Stroke({
            //         color: '#ffcc33',
            //         width: 5
            //     }),
            //     image: new Circle({
            //         radius: 7,
            //         fill: new Fill({
            //             color: '#ffcc33'
            //         })
            //     })
            // });
            // let fenceLayer = new LayerVec({
            //     source: source,
            //     style: fenceStyle
            // });
            // map.addLayer(fenceLayer)
            const tmp = new Polygon([markerList]);
            const oltarget = new Feature(tmp);
            oltarget.setStyle(
                new Style({
                    fill: new Fill({ color: "#4e98f444" }),
                })
            );
            oltarget.set('name', polygonId);
            console.log(polygonId);


            polygonInfo[polygonId] = {
                markList: markerList,
                feature: oltarget,
                source: polygonSource
            };

            polygonId++;
            polygonSource.addFeature(oltarget);
            createMarkerSignal.value = false;
        }

        const inEditFence = () => {
            Modal.getInstance("#edit-fench").hide();
            let editFence = editFenceName.value;
            console.log(editFence);

            let feature = polygonInfo[editFence].feature;
            // polygonInfo[editFence].source.removeFeature(feature);
            polygonSource.removeFeature(feature);
            // let iconStyle = new Style({
            //     image: new Icon({
            //         anchorOrigin: 'bottom-left',
            //         anchorYUnits: "pixels",
            //         opacity: 0.75,
            //         src: '/images/location2.png'
            //     })
            // });

            // iconSource = new SourceVec();
            // let iconStyle = new Style({
            //     image: new Icon({
            //         anchorOrigin: 'bottom-left',
            //         anchorYUnits: "pixels",
            //         opacity: 0.75,
            //         src: '/images/location2.png'
            //     })
            // });
            // vectorLayer = new LayerVec({
            //     source: iconSource,
            //     style: iconStyle
            // });
            // map.addLayer(vectorLayer);

            for (let point of polygonInfo[editFence].markList) {
                console.log(point);
                let iconFeature = new Feature({
                    geometry: new Point(point, "XY"),
                });
                iconSource.addFeature(iconFeature);
                let iconTranslate = new Translate({
                    features: new Collection([iconFeature])
                });
                map.addInteraction(iconTranslate);
            }




        };


        onMounted(() => {
            initMap();
            // fence = new drawFence(map);
            // fence.drawPolygon();
        });


        return {
            // draw,
            // feature_name,
            // deleteFenchName,
            // deleteFench,
            createMarker,
            addFence,
            editFenceName,
            inEditFence
        }


    },



};
</script>
  
<style scoped>
.map {
    width: 100%;
    height: 780px;
}
</style>


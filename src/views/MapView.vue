<template>
    <MapContent />

    <div class="map" id="olMap"></div>
    <div id="popup" class="ol-popup">
        <a href="#" id="popup-closer" class="ol-popup-closer"></a>
        <div id="popup-content"></div>
    </div>

    <el-dialog v-model="ifShowWorkStatistics" width="40%">
        <div>
            <div class="dialog-title">个人信息</div>
            <el-table :data="patrolWorkStatistics">
                <el-table-column property="name" label="姓名" header-align="center" align="center" />
                <el-table-column property="department" label="部门" header-align="center" align="center" />
                <el-table-column property="identity" label="人员类别" header-align="center" align="center" />
                <el-table-column property="telephone" label="联系电话" header-align="center" align="center" />
                <el-table-column property="isInOwnRing" label="是否在本人辖区" header-align="center" align="center" />
            </el-table>
        </div>


        <div style="margin-top: 5vh;">
            <div class="dialog-title">在岗统计</div>
            <el-config-provider :locale="locale">
                <el-date-picker v-model="value1" type="date" placeholder="选择日期" :disabled-date="disabledDate"
                    @change="dateChange" />
            </el-config-provider>
            <el-table :data="workStat">
                <el-table-column property="name" label="姓名" width="120" header-align="center" align="center" />
                <el-table-column property="status" label="状态" width="120" header-align="center" align="center" />
                <el-table-column property="onWorkTime" label="上班时间" header-align="center" align="center" />
                <el-table-column property="offWorkTime" label="下班时间" header-align="center" align="center" />
            </el-table>
        </div>

        <div style="margin-top: 5vh;">
            <div class="dialog-title">指令发布</div>

            <div style="margin-left: 7vw;">
                <el-space wrap size="large" style="margin-bottom: 1vh;">
                    <el-button type="primary" plain>规范周边单车</el-button>
                    <el-button type="primary" plain>取缔流动摊贩</el-button>
                    <el-button type="primary" plain>整治越门经营</el-button>
                </el-space>

                <el-space wrap size="large">
                    <el-button type="primary" plain>整治乱堆乱放</el-button>
                    <el-button type="primary" plain>整治乱牵乱挂</el-button>
                    <el-button type="primary" plain>整治乱扔乱排乱倒</el-button>
                </el-space>
            </div>

        </div>

    </el-dialog>

</template>
  
<script >
import "ol/ol.css";
import { Tile as TileLayer, Vector as LayerVec } from "ol/layer";
import { Vector as SourceVec, Raster } from 'ol/source';
import XYZ from "ol/source/XYZ";
import Map from "ol/Map.js";
import View from "ol/View.js";
import { reactive, onMounted, ref } from "vue";
import { Style, Fill, Circle, Stroke, Icon } from "ol/style"
import { Overlay, Feature } from "ol";
import { DoubleClickZoom } from "ol/interaction";
import { Polygon } from "ol/geom";
import ImageLayer from "ol/layer/Image";
import MapContent from "@/components/MapContent.vue";
import axios from "axios";
import { stringToList, getStandardTime } from '../scripts/utils'
import { banshichu } from '../scripts/constant'
import { Point } from "ol/geom";
import AMapLoader from "@amap/amap-jsapi-loader"
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

import { useStore } from 'vuex';

export default {
    setup() {
        const store = useStore();
        const locale = zhCn;
        const value1 = ref('');
        let Amap;
        AMapLoader.load({
            key: "61ad75101d54a5371d872c69fdce0d3f"
        }).then((AMap) => {
            Amap = AMap;
            getPatrolsLocation();
        })

        let map = null;
        let content;
        let popup;
        let closer;
        let ifShowWorkStatistics = ref(false);

        const initMap = () => {
            let terMap = new Map({
                target: "olMap",
                view: new View({
                    // center: [104.04396204, 30.71499549],
                    center: [104.05632020955566, 30.753519881818795],
                    zoom: 12.5,
                    projection: "EPSG:4326",
                }),
            });
            map = terMap;
            //   添加地图
            let Tersource = new XYZ({
                url: "http://t4.tianditu.com/DataServer?T=vec_w&tk=b523e4ded27f524672a488e758227070&x={x}&y={y}&l={z}",
                crossOrigin: "anonymous",
            });
            let terLayer = new TileLayer({
                source: Tersource,
                zIndex: 1,

            });
            // map.addLayer(terLayer);
            //添加注记
            let CTAsource = new XYZ({
                url: "http://t4.tianditu.com/DataServer?T=cva_w&tk=b523e4ded27f524672a488e758227070&x={x}&y={y}&l={z}",
                crossOrigin: "anonymous",
            });
            let CTAlayer = new TileLayer({
                source: CTAsource,
                zIndex: 2,

            });
            // map.addLayer(CTAlayer);
            let reverseTerLayer = getReverseLayer(terLayer);
            map.addLayer(reverseTerLayer);
            let reverseCTALayer = getReverseLayer(CTAlayer);
            map.addLayer(reverseCTALayer);

            let container = document.getElementById("popup");
            content = document.getElementById("popup-content");
            closer = document.getElementById("popup-closer");
            popup = new Overlay({
                element: container,
                autoPan: true,
                positioning: "bottom-center",
                stopEvent: true,
            });
            map.addOverlay(popup);
            closer.onclick = function () {
                popup.setPosition(undefined);
                closer.blur();
                return false;
            };
            createOverlayClick();

            map.on("pointermove", function (e) {
                let pixel = map.getEventPixel(e.originalEvent);
                let hit = map.hasFeatureAtPixel(pixel);
                map.getTargetElement().style.cursor = hit ? "pointer" : "";
            });
            // 去除双击地图缩放
            const dblClickInteraction = map
                .getInteractions()
                .getArray()
                .find(interaction => {
                    return interaction instanceof DoubleClickZoom;
                });
            map.removeInteraction(dblClickInteraction);

            createPolygonLayer();
            createIconLayer();

            // for (const path of jinNiuFencePath) {
            //     const tmp = new Polygon(path);
            //     let oltarget = new Feature(tmp);
            //     oltarget.set('name', 'jinNiu');
            //     oltarget.setStyle(
            //         new Style({
            //             fill: new Fill({ color: 'rgba(135, 206, 255, 0.5)' }),
            //             stroke: new Stroke({
            //                 lineDash: [10, 10, 10, 10],
            //                 // color: "#4e98f444",
            //                 // color: '#2b8cbe',
            //                 color: "red",
            //                 width: 1,
            //             })
            //         })
            //     );
            //     polygonSource.addFeature(oltarget);
            // }

            for (const item of banshichu) {
                const tmp = new Polygon(item.path);
                let oltarget = new Feature(tmp);
                oltarget.set('name', 'banshichu');
                oltarget.set('banshichuName', item.name);
                oltarget.setStyle(
                    new Style({
                        fill: new Fill({ color: item.color }),
                        stroke: new Stroke({
                            color: item.strokeColor,
                            lineDash: [10, 10, 10, 10],
                            width: 1
                        })
                    })
                );
                polygonSource.addFeature(oltarget);
            }

        };


        let polygonInfo = reactive({});
        const refresh_polygonInfo = () => {
            Object.keys(polygonInfo).map(key => {
                polygonSource.removeFeature(polygonInfo[key].feature);
                delete polygonInfo[key]
            });
            axios({
                url: "/api/region",
                method: "get",
                headers: {
                    Authorization: store.state.user.tokenHeader + store.state.user.token,
                }
            }).then(function (resp) {
                num = 0;
                for (const item of resp.data.data) {
                    let pointList = stringToList(item.pointList);
                    if (pointList.length < 3) continue;

                    // pointList = sortPoint(pointList);
                    let polygonFeature = createPolygonFeature(pointList);
                    polygonFeature.set('name', item.id);
                    polygonSource.addFeature(polygonFeature);

                    polygonInfo[item.id] = {
                        id: item.id,
                        name: item.name,
                        operator: item.creator,
                        editTime: getStandardTime(item.createTime),
                        markList: pointList,
                        feature: polygonFeature
                    }
                }
                getPatrolsLocation();
            })
        }
        refresh_polygonInfo();
        setInterval(refresh_polygonInfo, 60000);

        let patrolLocation = reactive({});
        let iconFeatureList = reactive([]);
        const getPatrolsLocation = () => {
            axios({
                url: '/api/patrol-whole-info',
                method: 'get',
                headers: {
                    Authorization: store.state.user.tokenHeader + store.state.user.token,
                },
            }).then(function (resp) {
                if (resp.status == 200) {
                    for (const feature of iconFeatureList) {
                        iconSource.removeFeature(feature);
                    }
                    iconFeatureList.splice(0, iconFeatureList.length);

                    for (const item of resp.data.data) {

                        if (item.location != null && item.patrol_id != null && item.relatedRegion != null) {
                            patrolLocation[item.patrol_id] = {
                                patrolId: item.patrol_id,
                                location: stringToSingleLocation(item.location),
                            }

                            let point = stringToSingleLocation(item.location);
                            let iconFeature = new Feature({
                                geometry: new Point(point, "XY"),

                            });

                            iconFeature.set('name', 'icon');
                            iconFeature.set('polygonId', item.relatedRegion);
                            iconFeature.set('patrolId', item.patrol_id);
                            iconFeature.set('patrolName', item.name);
                            iconFeature.set('department', item.department);
                            iconFeature.set('telephone', item.telephone);
                            iconFeature.set('identity', item.identity);

                            let relateRegion = polygonInfo[item.relatedRegion].markList;
                            if (item.identity == "执法人员") {
                                let isInRing = Amap.GeometryUtil.isPointInRing(point, relateRegion);
                                if (isInRing) {
                                    iconFeature.set('bgId', 0);

                                } else {
                                    iconFeature.set('bgId', 1);
                                }
                                iconFeature.set('isInOwnRing', isInRing);

                            } else if (item.identity == "协管人员") {
                                let isInRing = Amap.GeometryUtil.isPointInRing(point, relateRegion);
                                if (isInRing) {
                                    iconFeature.set('bgId', 2);
                                } else {
                                    iconFeature.set('bgId', 3);
                                }
                                iconFeature.set('isInOwnRing', isInRing);
                            }
                            iconSource.addFeature(iconFeature);
                            iconFeatureList.push(iconFeature);

                        }
                    }
                }
            })
        }

        //getPatrolsLocation();


        // const getPatrolLocation = () => {
        //     axios({
        //         url: '/api/patrol-location',
        //         method: 'get',
        //     }).then(function (resp) {

        //         if (resp.status == 200) {
        //             for (const feature of iconFeatureList) {
        //                 iconSource.removeFeature(feature);
        //             }
        //             iconFeatureList.splice(0, iconFeatureList.length);

        //             for (const item of resp.data.data) {

        //                 if (item.location != null && item.patrolId != null) {
        //                     patrolLocation[item.id] = {
        //                         id: item.id,
        //                         patrolId: item.patrolId,
        //                         location: stringToSingleLocation(item.location),
        //                     }

        //                     let point = stringToSingleLocation(item.location);
        //                     let iconFeature = new Feature({
        //                         geometry: new Point(point, "XY"),

        //                     });

        //                     let identity;
        //                     let relateRegion;
        //                     let name;
        //                     let department;

        //                     let telephone;
        //                     getPatrolInfo(item.patrolId).then(res => {
        //                         //console.log(res);
        //                         name = res.name;
        //                         identity = res.identity;
        //                         department = res.department;
        //                         telephone = res.telephone;
        //                         relateRegion = polygonInfo[res.relatedRegion].markList;
        //                         iconFeature.set('name', 'icon');
        //                         iconFeature.set('polygonId', res.relatedRegion);
        //                         iconFeature.set('patrolId', item.patrolId);
        //                         iconFeature.set('patrolName', name);
        //                         iconFeature.set('department', department);
        //                         iconFeature.set('telephone', telephone);
        //                         iconFeature.set('identity', identity);

        //                         if (identity == "执法人员") {
        //                             let isInRing = Amap.GeometryUtil.isPointInRing(point, relateRegion);
        //                             if (isInRing) {
        //                                 iconFeature.set('bgId', 0);

        //                             } else {
        //                                 iconFeature.set('bgId', 1);
        //                             }
        //                             iconFeature.set('isInOwnRing', isInRing);

        //                         } else if (identity == "协管人员") {
        //                             let isInRing = Amap.GeometryUtil.isPointInRing(point, relateRegion);
        //                             if (isInRing) {
        //                                 iconFeature.set('bgId', 2);
        //                             } else {
        //                                 iconFeature.set('bgId', 3);
        //                             }
        //                             iconFeature.set('isInOwnRing', isInRing);
        //                         }
        //                         iconSource.addFeature(iconFeature);
        //                         iconFeatureList.push(iconFeature);
        //                     });


        //                 }
        //             }
        //         }
        //     })
        // }

        // const getPatrolInfo = id => {
        //     return axios({
        //         url: '/api/patrol/' + id,
        //         method: 'get',
        //         params: {
        //             id: id
        //         }
        //     }).then(function (resp) {
        //         return resp.data.data;

        //     })


        // }

        const stringToSingleLocation = path => {
            let pathLng = path.replace("[", "").replace("]", "").split(",")[0] * 1;
            let pathLat = path.replace("[", "").replace("]", "").split(",")[1] * 1;
            return [pathLng, pathLat];
        }

        // const postPatrolLocation = () => {
        //     axios({
        //         url: '/api/patrol-location',
        //         method: 'post',
        //         data: {
        //             location: "[104.01098852802954, 30.657377297524777]",
        //             patrolId: 99,
        //         }
        //     }).then(function (resp) {
        //         console.log(resp);
        //         // getPatrolLocation();
        //     })
        // }


        // postPatrolLocation();


        function getReverseLayer(layer) {
            const raster = new Raster({
                sources: [
                    //传入图层，这里是天地图矢量图或者天地图矢量注记
                    layer,
                ],
                //这里设置为image类型，与官方示例不同，优化速度
                operationType: "image",
                operation: function (pixels) {
                    //执行颜色转换方法，注意，这里的方法需要使用lib引入进来才可以使用
                    // reverseFunction(pixels[0].data);
                    for (var i = 0; i < pixels[0].data.length; i += 4) {
                        var r = pixels[0].data[i];
                        var g = pixels[0].data[i + 1];
                        var b = pixels[0].data[i + 2];
                        //运用图像学公式，设置灰度值
                        var grey = r * 0.3 + g * 0.59 + b * 0.11;
                        //将rgb的值替换为灰度值
                        pixels[0].data[i] = grey;
                        pixels[0].data[i + 1] = grey;
                        pixels[0].data[i + 2] = grey;
                        //基于灰色，设置为蓝色，这几个数值是我自己试出来的，可以根据需求调整
                        pixels[0].data[i] = 55 - pixels[0].data[i];
                        pixels[0].data[i + 1] = 255 - pixels[0].data[i + 1];
                        pixels[0].data[i + 2] = 305 - pixels[0].data[i + 2];
                    }
                    return pixels[0];
                },
                //线程数量
                threads: 10,
                //允许operation使用外部方法
                // lib: {
                //     reverseFunction: reverseFunc,
                // },

            });
            let reverseLayer = new ImageLayer({
                name: "天地图矢量图层",
                source: raster
            });
            return reverseLayer;
        }


        let polygonSource;
        let fenceStyle;
        let fenceLayer;

        const createPolygonLayer = () => {
            polygonSource = new SourceVec();
            fenceStyle = new Style({
                fill: new Fill({
                    color: "rgba(255, 255, 255, 0.2)"
                }),
                stroke: new Stroke({
                    color: "#ffcc33",
                    width: 5
                }),
                image: new Circle({
                    radius: 7,
                    fill: new Fill({
                        color: "#ffcc33"
                    })
                })
            });
            fenceLayer = new LayerVec({
                source: polygonSource,
                style: fenceStyle,
                zIndex: 5,
            });
            map.addLayer(fenceLayer);
        };


        let iconSource;
        let iconLayer;
        const createIconLayer = () => {
            let bg = ['/images/staff.png', '/images/staff2.png', '/images/staff3.png', '/images/staff4.png']
            iconSource = new SourceVec();
            iconLayer = new LayerVec({
                source: iconSource,
                style: function (feature) {
                    let id = feature.get('bgId');

                    let style = new Style({
                        image: new Icon({
                            anchorOrigin: 'bottom-left',
                            anchorYUnits: "pixels",
                            opacity: 0.75,
                            src: bg[id],
                        })


                    })
                    return [style]
                },
                zIndex: 10,
            });
            map.addLayer(iconLayer);
        }

        const createOverlayClick = () => {
            map.on("singleclick", function (e) {
                let coordinate = e.coordinate;
                let feature = map.forEachFeatureAtPixel(e.pixel, function (feature) {
                    return feature;
                });
                if (feature) {

                    let featureId = feature.get('name');
                    if (featureId != "jinNiu" && featureId != 'icon' && featureId != 'banshichu') {

                        content.innerHTML = "";

                        let name = document.createElement("p");
                        name.innerText = "围栏名: " + polygonInfo[featureId].name;
                        content.appendChild(name);
                        let operator = document.createElement("p");
                        operator.innerText = "操作人: " + polygonInfo[featureId].operator;
                        content.appendChild(operator);
                        let editTime = document.createElement("p");
                        editTime.innerText = "编辑时间: " + polygonInfo[featureId].editTime;
                        content.appendChild(editTime);
                        popup.setPosition(coordinate);
                    } else if (featureId == 'icon') {
                        checkWorkStatistics(feature);
                    } else if (featureId == 'banshichu') {
                        content.innerHTML = "";
                        let name = document.createElement("p");
                        name.innerText = "办事处名: " + feature.get('banshichuName');
                        content.appendChild(name);
                        popup.setPosition(coordinate);
                    }
                }
            });
        };

        const disabledDate = (time) => {
            return time.getTime() > Date.now()
        }

        let patrolWorkStatistics = reactive([]);
        let workStat = reactive([]);
        let selectPatrolId = ref('');
        const checkWorkStatistics = (feature) => {
            ifShowWorkStatistics.value = true;
            const date = new Date();
            const currentDay = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            value1.value = currentDay;

            selectPatrolId.value = feature.get('patrolId');

            patrolWorkStatistics.splice(0, patrolWorkStatistics.length);
            workStat.splice(0, workStat.length);

            patrolWorkStatistics.push({
                name: feature.get('patrolName'),
                department: feature.get('department'),
                identity: feature.get('identity'),
                telephone: feature.get('telephone'),
                isInOwnRing: feature.get('isInOwnRing') == true ? '是' : '否'
            })

            workStat.push({
                name: feature.get('patrolName'),
                status: "在岗",
                onWorkTime: "2022-10-14 8:13:5",
                offWorkTime: "2022-10-14 17:40:00",
            })
            //ifShowWorkStatistics.value = true;
        }

        const dateChange = () => {
            const date2 = new Date(value1.value);
            const currentDate = date2.toLocaleDateString().replaceAll('/', '-');
            console.log(currentDate);
            console.log(selectPatrolId.value);
        }

        let num = 0;
        const createPolygonFeature = (markerList) => {
            const color = ['rgba(0, 255, 0, 0.5)', 'rgba(0, 0, 255, 0.5)', 'rgba(255, 0, 0, 0.5)', 'rgba(255, 255, 0, 0.5)', 'rgba(255,0,255, 0.5)'];
            let oltarget;

            if (markerList.length < 3) {
                return null;
            }

            // markerList = sortPoint(markerList);
            markerList.push(markerList[0])

            const tmp = new Polygon([markerList]);
            oltarget = new Feature(tmp);
            oltarget.setStyle(
                new Style({
                    fill: new Fill({ color: color[num % 5] }),
                    stroke: new Stroke({
                        lineDash: [10, 10, 10, 10],
                        // color: "#4e98f444",
                        color: '#2b8cbe',
                        width: 1,
                    })
                })
            );
            num++;
            return oltarget;
        }

        onMounted(() => {
            initMap();
        });

        return {
            checkWorkStatistics,
            disabledDate,
            dateChange,
            ifShowWorkStatistics,
            patrolWorkStatistics,
            workStat,
            locale,
            value1,
        };
    },
    components: { MapContent }
};
</script>
  
<style scoped>
.dialog-title {
    font-size: 18px;
    font-weight: 1000;
    color: "#303133";
    margin-bottom: 1vh;
    margin-left: 16vw;
}

.map {
    width: 100vw;
    height: 100vh;
}

/* .content {
    display: flex;
    width: 100vw;
    height: 93vh;
    position: relative;
    top: 7vh;
}

.content-l {
    width: 30vw;
    z-index: 10;
    justify-content: space-between;
    display: flex;
    flex-direction: column;
}

.content-mid {
    width: 46vw;
}

.content-r {
    width: 26vw;
    display: flex;
    flex-direction: column;
} */

/* #BGMap {
    width: 100vw;
    height: 100vh;
} */





/* #BGMap {
    z-index: 15;
    background: linear-gradient(90deg, #000 0, #013 35%, #013 65%, #000);
}

#BGMap:before,
#BGMap:after {
    content: '';
    position: fixed;
    height: 100%;
    z-index: 15;
    width: 30%;
    top: 0;
}

#BGMap:before {
    left: 0;
    background: linear-gradient(90deg, rgba(0, 0, 0, .8) 0, rgba(0, 0, 0, .4) 70%, transparent);
}

#BGMap:after {
    right: 0;
    background: linear-gradient(270deg, rgba(0, 0, 0, .8) 0, rgba(0, 0, 0, .4) 70%, transparent);
}

*/
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


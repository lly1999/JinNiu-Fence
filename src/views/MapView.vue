<template>
    <MapContent />

    <div class="map" id="olMap"></div>
    <div id="popup" class="ol-popup">
        <a href="#" id="popup-closer" class="ol-popup-closer"></a>
        <div id="popup-content"></div>
    </div>

</template>
  
<script >
import "ol/ol.css";
import { Tile as TileLayer, Vector as LayerVec } from "ol/layer";
import { Raster, Vector as SourceVec } from 'ol/source';
import XYZ from "ol/source/XYZ";
import Map from "ol/Map.js";
import View from "ol/View.js";
import { onMounted, ref } from "vue";
import { Style, Fill, Circle, Stroke } from "ol/style"
import { Overlay, Feature } from "ol";
import { useStore } from "vuex";
import { DoubleClickZoom } from "ol/interaction";
import { Polygon } from "ol/geom";
import _ from 'lodash'
import ImageLayer from "ol/layer/Image";
import MapContent from "@/components/MapContent.vue";


export default {
    setup() {
        let store = useStore();
        let map = null;
        let polygonList = _.cloneDeep(store.state.fence.fence_list);
        let content;
        let popup;
        let polygonInfo = ref({});
        const initMap = () => {
            let terMap = new Map({
                target: "olMap",
                view: new View({
                    center: [104.04396204, 30.71499549],
                    zoom: 13,
                    projection: "EPSG:4326",
                }),
            });
            map = terMap;
            //   添加地图
            let Tersource = new XYZ({
                url: "http://t4.tianditu.com/DataServer?T=vec_w&tk=b9031f80391e6b65bd1dd80dcde1b097&x={x}&y={y}&l={z}",
                crossOrigin: "anonymous",
            });
            let terLayer = new TileLayer({
                source: Tersource,
                zIndex: 1,

            });
            // map.addLayer(terLayer);
            //添加注记
            let CTAsource = new XYZ({
                url: "http://t4.tianditu.com/DataServer?T=cva_w&tk=b9031f80391e6b65bd1dd80dcde1b097&x={x}&y={y}&l={z}",
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
            let closer = document.getElementById("popup-closer");
            popup = new Overlay({
                element: container,
                autoPan: true,
                positioning: "bottom-center",
                stopEvent: false,
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
            for (const fenceId in polygonList) {
                // let polygonFeature = createPolygonFeature(_.cloneDeep(polygonList[fenceId]));
                let polygonFeature = createPolygonFeature(polygonList[fenceId].markerList);
                polygonFeature.set("name", fenceId);
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
        };
        let getReverseLayer = (layer) => {
            const raster = new Raster({
                sources: [
                    //传入图层，这里是天地图矢量图或者天地图矢量注记
                    layer,
                ],
                //这里设置为image类型，与官方示例不同，优化速度
                operationType: "image",
                operation: function (pixels) {
                    //执行颜色转换方法，注意，这里的方法需要使用lib引入进来才可以使用
                    reverseFunc(pixels[0].data);
                    return pixels[0];
                },
                //线程数量
                threads: 10,
                //允许operation使用外部方法
                lib: {
                    reverseFunc: reverseFunc,
                }
            });
            let reverseLayer = new ImageLayer({
                name: "天地图矢量图层",
                source: raster
            });
            return reverseLayer;
        };
        let reverseFunc = function (pixelsTemp) {
            //蓝色
            for (var i = 0; i < pixelsTemp.length; i += 4) {
                var r = pixelsTemp[i];
                var g = pixelsTemp[i + 1];
                var b = pixelsTemp[i + 2];
                //运用图像学公式，设置灰度值
                var grey = r * 0.3 + g * 0.59 + b * 0.11;
                //将rgb的值替换为灰度值
                pixelsTemp[i] = grey;
                pixelsTemp[i + 1] = grey;
                pixelsTemp[i + 2] = grey;
                //基于灰色，设置为蓝色，这几个数值是我自己试出来的，可以根据需求调整
                pixelsTemp[i] = 55 - pixelsTemp[i];
                pixelsTemp[i + 1] = 255 - pixelsTemp[i + 1];
                pixelsTemp[i + 2] = 305 - pixelsTemp[i + 2];
            }
        };
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
                zIndex: 15,
            });
            map.addLayer(fenceLayer);
        };
        const createOverlayClick = () => {
            map.on("singleclick", function (e) {
                let coordinate = e.coordinate;
                let feature = map.forEachFeatureAtPixel(e.pixel, function (feature) {
                    return feature;
                });
                if (feature) {
                    content.innerHTML = "";
                    let featureId = feature.get("name");
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
                }
            });
        };
        const createPolygonFeature = (markerList) => {
            let oltarget;
            sortMarker(markerList);
            markerList.push(markerList[0]);
            const tmp = new Polygon([markerList]);
            oltarget = new Feature(tmp);
            oltarget.setStyle(new Style({
                fill: new Fill({ color: "#4e98f444" }),
                stroke: new Stroke({
                    lineDash: [10, 10, 10, 10],
                    color: "#4e98f444",
                    width: 3
                })
            }));
            return oltarget;
        };
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
                }
                else if (geometryPoints[maxXPointIdx].X == gp.X && geometryPoints[maxXPointIdx].Y > gp.Y) {
                    maxXPointIdx = i;
                }
            }
            for (let i = 0; i < markerList.length; i++) {
                if (i == maxXPointIdx) {
                    geometryPoints[i].slope = 1000000000;
                }
                else {
                    geometryPoints[i].slope = (geometryPoints[i].Y - geometryPoints[maxXPointIdx].Y) / (geometryPoints[i].X - geometryPoints[maxXPointIdx].X);
                }
            }
            geometryPoints.sort(function (a, b) {
                if (a.slope < b.slope) {
                    return 1;
                }
                else {
                    return -1;
                }
            });
            for (let i in geometryPoints) {
                markerList[i] = [geometryPoints[i].X, geometryPoints[i].Y];
            }
        };
        onMounted(() => {
            initMap();
        });
        return {};
    },
    components: { MapContent }
};
</script>
  
<style scoped>
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


<template>
    <div>
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
import { onMounted, ref } from "vue";
import { Style, Fill, Circle, Stroke } from "ol/style"
import { Overlay, Feature } from "ol";
import { useStore } from "vuex";
import { DoubleClickZoom } from "ol/interaction";
import { Polygon } from "ol/geom";
import _ from 'lodash'

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

            createPolygonLayer();

            for (const fenceId in polygonList) {
                // let polygonFeature = createPolygonFeature(_.cloneDeep(polygonList[fenceId]));
                let polygonFeature = createPolygonFeature(polygonList[fenceId].markerList);

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
            map.on('singleclick', function (e) {
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


        onMounted(() => {
            initMap();
        });


        return {
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


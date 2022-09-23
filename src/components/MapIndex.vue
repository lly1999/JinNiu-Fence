<template>
    <div id="map" class="map">

    </div>

</template>
  
<script>
import "ol/ol.css";
import Map from "ol/Map";
// import { Tile } from "ol/layer";
import TileLayer from "ol/layer/Tile";
import View from "ol/View";
import { onMounted } from "vue";
// import { defaults } from "ol/control/defaults";
// import { MousePosition } from "ol/control"
import XYZ from 'ol/source/XYZ'

export default {
    setup() {

        const initMap = () => {

            let source = new XYZ({
                url: 'http://t' + Math.round(Math.random() * 7) + '.tianditu.com/DataServer?T=vec_w&tk=b9031f80391e6b65bd1dd80dcde1b097&x={x}&y={y}&l={z}',
            })

            let sourceMark = new XYZ({
                url: 'http://t' + Math.round(Math.random() * 7) + '.tianditu.com/DataServer?T=cva_w&tk=b9031f80391e6b65bd1dd80dcde1b097&x={x}&y={y}&l={z}',

            })

            new Map({
                layers: [
                    new TileLayer({
                        title: '天地图',
                        source: source
                    }),
                    new TileLayer({
                        title: '标注图层',
                        source: sourceMark
                    })
                ],
                target: "map",
                view: new View({
                    center: [104.04396204, 30.71499549],
                    zoom: 15,
                    projection: 'EPSG:4326',
                    constrainResolution: true,
                    smoothResolutionConstraint: false
                }),

            });

            console.log("init finished");
        }
        onMounted(() => {
            initMap();
        })
    }
}

</script>
  
<style scoped>
.map {
    width: 100vw;
    height: 90vh;

}
</style>
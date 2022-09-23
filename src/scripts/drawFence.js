import { Style, Fill, Circle, Stroke } from "ol/style"
import { Vector } from 'ol/source'
import VectorLayer from 'ol/layer/Vector';
import { Draw, Select } from "ol/interaction";
import { pointerMove } from "ol/events/condition";
import { Polygon } from "ol/geom";
import { Feature } from "ol";

export default class drawFence {
    constructor(props) {
        //这里初始化class的时候需要传map对象进来
        this.map = props;
        this.source;
        this.fenceLayer;
        this.draw;
        this.feature_id = 0;
        this.featureList = new Array();
        //样式
        this.fenceStyle = new Style({
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
        })
        this.init()
    }
    init() {
        //临时图层的数据源
        this.source = new Vector();
        //新建临时图层，并设置临时图层渲染各种要素的样式
        this.fenceLayer = new VectorLayer({
            source: this.source,
            style: this.fenceStyle
        });
        this.map.addLayer(this.fenceLayer)
    }
    drawingEnd(evt, featureName) {
        let geo = evt.feature.getGeometry()
        evt.feature.set('name', featureName);

        let type = geo.getType(); //获取类型
        console.log(geo)
        let select = new Select({
            layers: [this.fenceLayer],
            condition: pointerMove
        });

        select.on('select', function (e) {
            let feature = e.selected[0];
            console.log(feature);
        });
        this.map.addInteraction(select);
        //根据不同的类型执行不同的操作
        const handle = {
            'Circle': () => {
                //获取中心点和半径
                let center = geo.getCenter()
                let radius = geo.getRadius()
                console.log(center, radius)
            },
            'Polygon': () => {
                //获取坐标点
                let points = geo.getCoordinates()

                console.log(points)
            },
            'LineString': () => {
                let points = geo.getCoordinates()
                console.log(points)
            }
        }
        if (handle[type]) handle[type]()
        this.closeDraw()
    }
    closeDraw() {
        this.map.removeInteraction(this.draw);
    }
    //画图
    drawingFence(type, featureName) {
        this.draw = new Draw({
            source: this.source, //设置要素源，绘制结束后将绘制的要素添加到临时图层
            type: type, //绘制的类型
        });
        this.map.addInteraction(this.draw);
        const that = this;
        //绘图结束事件回调
        this.draw.on('drawend', function (evt) {
            that.drawingEnd(evt, featureName)
        });
    }

    drawPolygon() {
        const path = [[104.04607919741898, 30.713293183091448],
        [104.04559282439072, 30.705568421128557],
        [104.05380395938187, 30.707342254483958],
        [104.04607919741898, 30.713293183091448]];
        const tmp = new Polygon([path]);
        const oltarget = new Feature(tmp);
        oltarget.set('name', "以前的围栏");
        this.source.addFeature(oltarget);

        // let select = new Select({
        //     layers: [this.fenceLayer],
        //     condition: doubleClick
        // });
        // const that = this;
        // select.on('select', function (e) {
        //     let feature = e.selected[0];
        //     console.log(feature);
        //     that.map.removeInteraction(select);
        //     that.fenceLayer.getSource().removeFeature(feature);
        // });
        // this.map.addInteraction(select);

    }


    removeFench(name) {
        const features = this.source.getFeatures();
        features.forEach(feature => {
            if (feature.get('name') == name) {
                this.source.removeFeature(feature);
            }
        });
    }
}

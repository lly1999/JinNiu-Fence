const stringToList = function (oldPointList) {

    oldPointList = oldPointList.replace(/],/g, '],a');

    let pointList = [];
    if (oldPointList != 0) {
        let path = oldPointList.substr(1)
        path = path.slice(0, path.length - 1) //上面两步将 "[[101,32],a [12,132]]" 转换为"[101,32],a [12,132]"，去掉外层[]

        for (let i = 0; i < path.split(",a").length; i++) //for循环,首先将数据按",a"分割为[['[101,32]'],'[12,132]'],的数组，此步内部仍然为字符串，使用for循环按个访问外部数组的每个元素
        {
            let pathLng = path.split(",a")[i].replace("[", "").replace("]", "").split(", ")[0] * 1//此步 将'[101,32]'的101转换为number类型
            let pathLat = path.split(",a")[i].replace("[", "").replace("]", "").split(", ")[1] * 1 //此步将'[101,32]'的32转换为number类型
            let point = [pathLng, pathLat] //再将number类型存在数组中
            pointList.push(point)//新开一个pointList存储这些数组，转换为[[101,32]]的二维数组
        }

    }
    return pointList;
}

export {
    stringToList
}
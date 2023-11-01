// 初始化地图
var map = L.map('map').setView([39.9042, 116.4074], 13);

// 设置地图图层
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// 存储所有单车的marker
var markers = {};

// 定义一个函数，用于生成单车的运动轨迹
function generateBikeLocations(bikeId, startLatitude, startLongitude, steps, radius) {
  var locations = [];
  for (var i = 0; i < steps; i++) {
    var angle = 2 * Math.PI * i / steps;
    // 添加随机偏移
    var offset = (Math.random() - 0.5) * 0.01;
    var latitude = startLatitude + radius * Math.cos(angle) + offset;
    var longitude = startLongitude + radius * Math.sin(angle) + offset;
    locations.push({ bike_id: bikeId, latitude: latitude, longitude: longitude });
  }
  return locations;
}


// 存储所有单车的轨迹
var polylines = {};

// 定义一个函数，用于更新单车的位置
function updateBikeLocation(bikeLocations) {
    var location = bikeLocations.shift(); // 取出第一个位置信息
    if (!location) return; // 如果没有位置信息了，就停止

    // 如果这辆单车的marker已经存在，就更新它的位置
    if (markers[location.bike_id]) {
      markers[location.bike_id].setLatLng([location.latitude, location.longitude]);
    } 
    // 否则，创建一个新的marker，并添加点击事件
    else {
      markers[location.bike_id] = L.marker([location.latitude, location.longitude]).addTo(map);
      markers[location.bike_id].on('click', function() {
        // 显示单车ID
        document.getElementById('bikeId').innerText = '单车ID: ' + location.bike_id;
        // 显示模态框
        $('#myModal').modal('show');
        // 首先隐藏所有的轨迹
        for (var bikeId in polylines) {
          polylines[bikeId].setStyle({ opacity: 0 });
        }
        // 然后显示点击的单车的轨迹
        polylines[location.bike_id].setStyle({ opacity: 1 });
      });      
    }

    // 如果这辆单车的轨迹已经存在，就更新它
    if (polylines[location.bike_id]) {
      var latlngs = polylines[location.bike_id].getLatLngs();
      latlngs.push([location.latitude, location.longitude]);
      polylines[location.bike_id].setLatLngs(latlngs);
    } 
    // 否则，创建一个新的轨迹，并设置opacity为0
    else {
      polylines[location.bike_id] = L.polyline([[location.latitude, location.longitude]], { color: 'red', opacity: 0 }).addTo(map);
    }
}


// 定义一个数组来存储所有的单车位置
var bikeLocations = [];

// 生成100个单车的运动轨迹
for (var i = 0; i < 2; i++) {
  var bikeId = 'bike' + (i + 1);
  // 生成随机的经纬度
  var startLatitude = 39.9042 + Math.random() * 0.01;
  var startLongitude = 116.4074 + Math.random() * 0.01;
  var bikeLocation = generateBikeLocations(bikeId, startLatitude, startLongitude, 100, 0.01);
  bikeLocations.push(bikeLocation);
}

// 每隔1秒从服务器获取数据并更新单车的位置
setInterval(function() {
  fetch('http://127.0.0.1:8000/')
      .then(response => response.text())
      .then(data => {
          // 分割数据
          var data = data.split(',');
          // 提取bike_id, bike_lng, bike_lat
          var bike_id = data[0];
          var bike_lng = data[3];
          var bike_lat = data[4];
          // 更新单车的位置
          updateBikeLocation([{ bike_id: bike_id, latitude: bike_lat, longitude: bike_lng }]);
      })
      .catch(console.error);
}, 1000);
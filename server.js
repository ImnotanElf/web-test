// 引入http模块
var http = require('http');

// 初始化offset
var offset = 0;

// 创建服务器
var server = http.createServer(function (req, res) {
    // 设置响应头
    res.writeHead(200, {'Content-Type': 'text/plain'});
    
    // 根据请求的URL来处理请求
    if (req.url === '/') {
        // 接收请求数据
        req.on('data', function(chunk) {
            // 分割数据
            var data = chunk.toString().split(',');
            // 提取bike_id, bike_lng, bike_lat
            var bike_id = data[0];
            var bike_lng = data[3];
            var bike_lat = data[4];
            console.log('Received data: bike_id=' + bike_id + ', bike_lng=' + bike_lng + ', bike_lat=' + bike_lat);
            // 增加offset
            offset++;
        });
        
        // 请求结束
        req.on('end', function() {
            // 在响应中返回offset
            res.end('Server received data. This is data number ' + offset);
        });
    } else if (req.url === '/data') {
        // 返回单车的数据
        res.end(JSON.stringify({ bike_id: 'bike1', latitude: 39.9042, longitude: 116.4074 }));
    }
});

// 服务器开始监听8000端口
server.listen(8000);

console.log('Server running at http://127.0.0.1:8000/');

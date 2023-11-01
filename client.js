const http = require('http');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

// 创建readline.Interface实例
const rl = readline.createInterface({
    input: fs.createReadStream(path.join(__dirname, '../../data/position-data/sorted_file.csv')),
});

// 创建一个异步函数来发送数据
async function sendData(line) {
    return new Promise((resolve, reject) => {
        // 创建HTTP请求选项
        const options = {
            hostname: '127.0.0.1',
            port: 8000,
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
        };

        // 创建HTTP请求
        const req = http.request(options, (res) => {
            res.on('data', (chunk) => {
                console.log('Response: ' + chunk);
            });
            res.on('end', resolve);
        });

        // 添加错误处理
        req.on('error', reject);

        // 发送数据
        req.write(line);
        req.end();
    });
}

// 创建一个自执行的异步函数来逐行读取文件并发送数据
(async function() {
    for await (const line of rl) {
        try {
            await sendData(line);
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
            console.error('Error: ' + err.message);
        }
    }
})();

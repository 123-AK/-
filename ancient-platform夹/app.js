const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 关键：把 public 目录设为静态文件根目录
app.use(express.static(path.join(__dirname, 'public')));

// ==================== JSON 文件路径 ====================
const usersPath = path.join(__dirname, 'data', 'users.json');
const archPath = path.join(__dirname, 'data', 'architectures.json');

// 读取文件
function read(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// 写入文件
function write(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ==================== 古建列表 ====================
app.get('/api/architecture', (req, res) => {
  const data = read(archPath);
  res.json({ code: 200, data });
});

// ==================== 古建详情 ====================
app.get('/api/architecture/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const data = read(archPath).find(x => x.Id === id);
  res.json({ code: 200, data });
});

// ==================== 地图接口 ====================
// ==================== 地图接口 ====================
app.get('/api/map', (req, res) => {
  const data = read(archPath).map(x => ({
    Id: x.Id,
    Name: x.Name,
    Type: x.Type,
    Era: x.Era,      // ✅ 就是加这一行！
    Intro: x.Intro,
    Location: x.Location,
    Longitude: x.Longitude,
    Latitude: x.Latitude,
    ImageUrl: x.ImageUrl
  }));
  res.json({ code: 200, data });
});
// ==================== 注册 ====================
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ code:400, msg:'用户名密码不能为空' });

  const users = read(usersPath);
  if (users.some(u => u.Username === username)) return res.json({ code:400, msg:'用户名已存在' });

  users.push({ Id: users.length+1, Username: username, Password: password });
  write(usersPath, users);
  res.json({ code:200, msg:'注册成功！' });
});

// ==================== 登录 ====================
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = read(usersPath);
  const user = users.find(u => u.Username === username && u.Password === password);

  if (!user) return res.json({ code:400, msg:'账号或密码错误' });
  res.json({ code:200, msg:'登录成功！', user });
});

// ==================== 忘记密码 ====================
app.post('/api/reset-pwd', (req, res) => {
  const { username, newPassword } = req.body;
  const users = read(usersPath);
  const user = users.find(u => u.Username === username);
  if (!user) return res.json({ code:400, msg:'用户不存在' });

  user.Password = newPassword;
  write(usersPath, users);
  res.json({ code:200, msg:'密码重置成功！' });
});

// ==================== 启动服务 ====================
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('✅ 服务启动成功');
});

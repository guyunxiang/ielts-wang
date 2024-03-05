const { exec } = require("child_process");
const path = require("path");

// 启动frontend
const frontend = exec("npm start", {
  cwd: path.resolve(__dirname, "../frontend"),
});

// 启动backend
const backend = exec("npm start", {
  cwd: path.resolve(__dirname, "../backend"),
});

// 监听frontend的输出
frontend.stdout.on("data", (data) => {
  console.log(`[frontend]: ${data}`);
});

// 监听backend的输出
backend.stdout.on("data", (data) => {
  console.log(`[backend]: ${data}`);
});

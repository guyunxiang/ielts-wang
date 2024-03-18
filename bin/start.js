const { exec } = require("child_process");
const path = require("path");

// start frontend
const frontend = exec("npm start", {
  cwd: path.resolve(__dirname, "../frontend"),
});

// start backend
const backend = exec("npm start", {
  cwd: path.resolve(__dirname, "../backend"),
});

// listening frontend output
frontend.stdout.on("data", (data) => {
  console.log(`[frontend]: ${data}`);
});

// listening backend output
backend.stdout.on("data", (data) => {
  console.log(`[backend]: ${data}`);
});

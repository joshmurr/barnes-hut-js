const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const width = (canvas.width = 800);
const height = (canvas.height = 800);

const mouse = [-1, -1];

let DEBUG = 0;

const attractCenter = new Force([width / 2, height / 2], 200, 100);
attractCenter.runner = function (x, y, alpha = 0.1) {
  const dx = x - this.pos[0];
  const dy = y - this.pos[1];
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance < this.radius) return [0, 0];
  const force = ((this.radius - distance) * this.strength * alpha) / distance;
  return [dx * force, dy * force];
};

const repelCenter = new Force([width / 2, height / 2], 100, 200);
repelCenter.runner = function (x, y, alpha = 1) {
  const dx = x - this.pos[0];
  const dy = y - this.pos[1];
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > this.radius) return [0, 0];
  const force = ((this.radius - distance) * this.strength * alpha) / distance;
  return [dx * force, dy * force];
};

const repelMouse = new Force([-1, -1], 100, 200);
repelMouse.runner = function (x, y, alpha = 1) {
  const dx = x - this.pos[0];
  const dy = y - this.pos[1];
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > this.radius) return [0, 0];
  const force = ((this.radius - distance) * this.strength * alpha) / distance;
  return [dx * force, dy * force];
};
repelMouse.stepper = function (mouse) {
  this.pos[0] = mouse[0];
  this.pos[1] = mouse[1];
};

const verletSystem = new VerletSystem({
  num: 200,
  worldMax: [width, height],
  timeStep: 0.01,
  numIter: 6,
  mass: () => Math.random() * 150 + 150,
  forces: [attractCenter, repelCenter, repelMouse],
});

const simulation = new BarnesHut(verletSystem, 0.5); // width, height, theta
simulation.buildTree();

const step = () => {
  ctx.fillStyle = "#252120";
  ctx.fillRect(0, 0, width, height);
  simulation.reset();
  simulation.buildTree();
  for (let i = 0; i < verletSystem.numParticles; i++) {
    simulation.calculateForces(i);
  }
  repelMouse.step(mouse);
  if (DEBUG > 0) {
    simulation.root.draw(ctx);
    attractCenter.draw(ctx);
    repelCenter.draw(ctx);
    repelMouse.draw(ctx);
  }
  verletSystem.step();
  verletSystem.draw(ctx);
  requestAnimationFrame(step);
};

document.getElementById("debug").addEventListener("click", () => {
  DEBUG = !DEBUG;
  if (DEBUG) {
    document.getElementById("debug").innerText = "Debug: ON";
  } else {
    document.getElementById("debug").innerText = "Debug: OFF";
  }
});

canvas.addEventListener("mousemove", (e) => {
  mouse[0] = e.clientX;
  mouse[1] = e.clientY;
});
canvas.addEventListener("mouseleave", () => {
  mouse[0] = -1;
  mouse[1] = -1;
});
step();

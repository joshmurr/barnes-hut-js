const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const width = (canvas.width = 800);
const height = (canvas.height = 800);

const mouse = [-1, -1];

let DEBUG = 0;

const attractCenter = new Force([width / 2, height / 2], 200, -100, 0.4);
const repelCenter = new Force([width / 2, height / 2], 100, 200, 2);
const repelMouse = new Force([-1, -1], 100, 200, 0.8);
repelMouse.updater = function (mouse) {
  this.pos[0] = mouse[0];
  this.pos[1] = mouse[1];
};

const verletSystem = new VerletSystem({
  num: 500,
  worldMax: [width, height],
  timeStep: 0.01,
  numIter: 4,
  massFn: () => Math.random() * 300 + 5,
  radiusFn: (m) => Math.floor(Math.sqrt(m)),
  colorFn: (i) => `hsl(${(Math.sin(i * 0.01) + 1) * 90 + 220}, 100%, 50%)`,
  forces: [attractCenter, repelCenter, repelMouse],
});

const simulation = new BarnesHut(verletSystem, 0.5);
simulation.buildTree();

const step = () => {
  ctx.fillStyle = "#252120";
  ctx.fillRect(0, 0, width, height);
  simulation.reset();
  simulation.buildTree();
  for (let i = 0; i < verletSystem.numParticles; i++) {
    simulation.calculateForces(i);
  }
  repelMouse.update(mouse);
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

const debugBtn = document.getElementById("debug");
debugBtn.addEventListener("click", () => {
  DEBUG = !DEBUG;
  if (DEBUG) {
    debugBtn.innerText = "DEBUG";
    debugBtn.classList.add("on");
    debugBtn.classList.remove("off");
  } else {
    debugBtn.innerText = "debug";
    debugBtn.classList.remove("on");
    debugBtn.classList.add("off");
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

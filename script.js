const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const width = (canvas.width = 800);
const height = (canvas.height = 800);

const mouse = [-1, -1];

let DEBUG = 0;

const attractCenter = new Force([width / 2, height / 2], 1400, -10, 0.4);
attractCenter.name = "Attract Centre";
const repelCenter = new Force([width / 2, height / 2], 130, 200, 2);
repelCenter.name = "Repel Centre";
const repelMouse = new Force([-1, -1], 100, 200, 0.8);
repelMouse.name = "Repel Mouse";
repelMouse.updater = function (mouse) {
  this.pos[0] = mouse[0];
  this.pos[1] = mouse[1];
};

const gravity = new Force([0, height], height, 0.03, 0.1);
gravity.name = "Gravity";
gravity.type = "linear";
gravity.axis = "y";

const verletSystem = new VerletSystem({
  num: 200,
  worldMax: [width, height],
  timeStep: 0.01,
  numIter: 4,
  bound: false,
  massFn: () => 500,
  radiusFn: (m) => Math.floor(Math.sqrt(Math.abs(m))),
  colorFn: (i) => `hsl(${(Math.sin(i * 0.01) + 1) * 90 + 220}, 100%, 50%)`,
  // colorFn: () => "#00f",
  forces: [attractCenter, repelCenter, repelMouse, gravity],
});

const simulation = new BarnesHut(verletSystem, 0.5);
simulation.buildTree();

const fisheye = new Fisheye({
  focus: [width / 2, height / 2],
  radius: 200,
  distortion: 2,
  updatePos: true,
});

verletSystem.fisheyeFn = fisheye.fisheye.bind(fisheye);

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

console.log(simulation);

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

verletSystem.forces.forEach((f) => {
  const btn = document.createElement("button");
  btn.innerText = f.name;
  btn.addEventListener("click", function () {
    this.classList.toggle("on");
    this.classList.toggle("off");
    f.toggle();
  });
  btn.classList.add(f.on ? "on" : "off");
  document.querySelector(".buttons").appendChild(btn);
});

canvas.addEventListener("mousemove", (e) => {
  mouse[0] = e.clientX;
  mouse[1] = e.clientY;

  repelMouse.update(mouse);

  fisheye.focus = [e.clientX, e.clientY];
});
canvas.addEventListener("mouseleave", () => {
  mouse[0] = -1;
  mouse[1] = -1;
});
step();

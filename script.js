const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const width = (canvas.width = 800);
const height = (canvas.height = 800);

const mouse = [-1, -1];

const verletSystem = new VerletSystem({
  num: 200,
  worldMax: [width, height],
  timeStep: 0.01,
  numIter: 6,
  mass: () => Math.random() * 150 + 150,
  forces: [
    (x, y) => {
      const dx = x - width / 2;
      const dy = y - height / 2;

      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 300) {
        const force = Math.abs(200 - distance) * -0.06;
        return [dx * force, dy * force];
      }
    },
    (x, y) => {
      const dx = x - width / 2;
      const dy = y - height / 2;

      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) {
        const force = 100 - distance * -1;
        return [dx * force, dy * force];
      }
    },
    (x, y) => {
      if (mouse[0] === -1) return;
      const dx = x - mouse[0];
      const dy = y - mouse[1];

      const distancesq = dx * dx + dy * dy;

      const rad = 100;
      if (distancesq < rad * rad) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = (rad - distance) * 3;
        return [dx * force, dy * force];
      }
    },
  ],
});

const simulation = new BarnesHut(verletSystem, 0.5); // width, height, theta
simulation.buildTree();

const step = () => {
  ctx.clearRect(0, 0, width, height);
  simulation.reset();
  simulation.buildTree();
  // simulation.root.draw(ctx);
  for (let i = 0; i < verletSystem.numParticles; i++) {
    simulation.calculateForces(i);
  }
  verletSystem.step();
  verletSystem.draw(ctx);
  requestAnimationFrame(step);
};

canvas.addEventListener("click", step);
canvas.addEventListener("mousemove", (e) => {
  mouse[0] = e.clientX;
  mouse[1] = e.clientY;
});
canvas.addEventListener("mouseleave", () => {
  mouse[0] = -1;
  mouse[1] = -1;
});
step();

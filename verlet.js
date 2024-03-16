class VerletSystem {
  constructor({
    num = 1,
    forces = [],
    timeStep = 0.25,
    numIter = 4,
    worldMax = [256, 256],
    massFn = () => 100,
    radiusFn = (m) => Math.floor(Math.sqrt(m) / 10),
    colorFn = () => "#C6C944",
  }) {
    this.numParticles = num;
    this.forces = forces;
    this.timeStep = timeStep;
    this.numIter = numIter;
    this.worldMax = worldMax;
    this.massFn = massFn;
    this.radiusFn = radiusFn;
    this.colorFn = colorFn;
    this.accumTime = 0;

    this.pos = undefined;
    this.prevPos = undefined;
    this.acc = undefined;
    this.mass = undefined;
    this.radius = undefined;

    this.init();
  }

  init() {
    this.acc = new Float32Array(this.numParticles * 2).fill(0);
    this.mass = new Float32Array(
      Array.from({ length: this.numParticles }, this.massFn),
    );
    this.radius = new Uint8ClampedArray(this.mass.map(this.radiusFn));

    const positions = Array.from(
      { length: this.numParticles * 2 },
      (_, i) =>
        this.radius[i] + Math.random() * this.worldMax[0] - this.radius[i] * 2,
    );

    this.pos = new Float32Array(positions);
    this.prevPos = new Float32Array(positions);

    this.colors = Array.from({ length: this.numParticles }, (_, i) =>
      this.colorFn(i),
    );
  }

  verlet() {
    for (let i = 0; i < this.numParticles; i++) {
      const idx = i * 2;
      const x = this.pos[idx];
      const y = this.pos[idx + 1];
      const prevx = this.prevPos[idx];
      const prevy = this.prevPos[idx + 1];
      const ax = this.acc[idx];
      const ay = this.acc[idx + 1];

      this.pos[idx] = 2 * x - prevx + ax * this.timeStep * this.timeStep;
      this.pos[idx + 1] = 2 * y - prevy + ay * this.timeStep * this.timeStep;

      this.prevPos[idx] = x;
      this.prevPos[idx + 1] = y;
      this.acc[idx] = 0;
      this.acc[idx + 1] = 0;
    }
    this.accumTime += this.timeStep;
  }

  accumulateForces() {
    for (let i = 0; i < this.numParticles; i++) {
      for (let force of this.forces) {
        const idx = i * 2;
        const [x, y] = this.pos.slice(idx, idx + 2);
        const f = force.run(x, y);
        this.acc[idx] += f[0];
        this.acc[idx + 1] += f[1];
      }
    }
  }

  satisfyConstraints() {
    for (let i = 0; i < this.numIter; i++) {
      for (let j = 0; j < this.numParticles; j++) {
        const idxa = j * 2;
        const xa = this.pos[idxa];
        const ya = this.pos[idxa + 1];

        const radius = this.radius[j];

        const vx = (this.prevPos[idxa] - xa) * 0.5;
        const vy = (this.prevPos[idxa + 1] - ya) * 0.5;
        if (xa < radius) this.pos[idxa] = radius - vx;
        if (xa > this.worldMax[0] - radius)
          this.pos[idxa] = this.worldMax[0] - radius - vx;
        if (ya < radius) this.pos[idxa + 1] = radius - vy;
        if (ya > this.worldMax[1] - radius)
          this.pos[idxa + 1] = this.worldMax[1] - radius - vy;

        for (let k = 0; k < this.numParticles; k++) {
          if (j === k) continue;
          const idxb = k * 2;
          const xb = this.pos[idxb];
          const yb = this.pos[idxb + 1];
          const dx = xb - xa;
          const dy = yb - ya;
          const distsq = dx * dx + dy * dy;

          const radius2 = this.radius[k];

          if (distsq < Math.pow(radius + radius2, 2)) {
            const deltalength = Math.sqrt(distsq);
            const diff = (deltalength - (radius + radius2)) / deltalength;

            const ddx = dx * 0.5 * diff;
            const ddy = dy * 0.5 * diff;

            this.pos[idxa] += ddx;
            this.pos[idxa + 1] += ddy;
            this.pos[idxb] -= ddx;
            this.pos[idxb + 1] -= ddy;
          }
        }
      }
    }
  }

  get time() {
    return this.accumTime;
  }

  step() {
    this.accumulateForces();
    this.verlet();
    this.satisfyConstraints();
  }

  draw(ctx) {
    for (let i = 0; i < this.numParticles; i++) {
      const idx = i * 2;
      const x = this.pos[idx];
      const y = this.pos[idx + 1];

      ctx.fillStyle = this.colors[i];
      ctx.beginPath();
      ctx.arc(x, y, this.radius[i], 0, Math.PI * 2);
      ctx.fill();
    }
  }

  print() {
    console.log(this.pos);
  }
}

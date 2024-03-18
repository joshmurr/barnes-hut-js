class VerletSystem {
  constructor({
    num = 1,
    forces = [],
    timeStep = 0.25,
    numIter = 4,
    worldMax = [256, 256],
    bound = true,
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
    this.bound = bound;

    this.pos = undefined;
    this.prevPos = undefined;
    this.acc = undefined;
    this.mass = undefined;
    this.radius = undefined;
    this.types = undefined;
    this.drag = 0.05;

    this.fisheye = (x, y) => ({ x, y, z: 1 });

    this.init();
  }

  init() {
    this.types = new Uint8Array(this.numParticles).fill(0);

    // this.types[0] = 1;
    this.acc = new Float32Array(this.numParticles * 2).fill(0);
    this.mass = new Float32Array(
      Array.from({ length: this.numParticles }, (_, i) =>
        // this.types[i] > 0 ? -10000 : this.massFn(i),
        this.massFn(i),
      ),
    );
    this.radius = new Uint8ClampedArray(this.mass.map(this.radiusFn));

    const positions = Array.from(
      { length: this.numParticles * 2 },
      (_, i) =>
        this.radius[Math.floor(i / 2)] +
        Math.random() * this.worldMax[0] -
        this.radius[Math.floor(i / 2)] * 2,
    );

    this.pos = new Float32Array(positions);
    this.prevPos = new Float32Array(positions);

    this.colors = Array.from({ length: this.numParticles }, (_, i) =>
      this.types[i] > 0 ? "#FF0000" : this.colorFn(i),
    );
  }

  verlet() {
    for (let i = 0; i < this.numParticles; i++) {
      if (this.types[i] > 0) continue; // fixed particles

      const idx = i * 2;
      const x = this.pos[idx];
      const y = this.pos[idx + 1];
      const prevx = this.prevPos[idx];
      const prevy = this.prevPos[idx + 1];
      const ax = this.acc[idx];
      const ay = this.acc[idx + 1];

      const vx = (x - prevx) * (1 - this.drag);
      const vy = (y - prevy) * (1 - this.drag);

      this.pos[idx] =
        x + vx + ax * this.timeStep * this.timeStep * (1 - this.drag);
      this.pos[idx + 1] =
        y + vy + ay * this.timeStep * this.timeStep * (1 - this.drag);

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
        const x = this.pos[idx];
        const y = this.pos[idx + 1];
        const [fx, fy] = force.run(x, y);
        this.acc[idx] += fx;
        this.acc[idx + 1] += fy;
      }
    }
  }

  satisfyConstraints() {
    for (let i = 0; i < this.numIter; i++) {
      for (let j = 0; j < this.numParticles; j++) {
        const idxa = j * 2;

        const xaa = this.pos[idxa];
        const yaa = this.pos[idxa + 1];

        const { x: xa, y: ya, z = 1 } = this.fisheye(xaa, yaa);

        const radius = this.radius[j] * z;

        if (this.bound) {
          const vx = (this.prevPos[idxa] - xa) * 0.5;
          const vy = (this.prevPos[idxa + 1] - ya) * 0.5;
          if (xa < radius) this.pos[idxa] = radius - vx;
          if (xa > this.worldMax[0] - radius)
            this.pos[idxa] = this.worldMax[0] - radius - vx;
          if (ya < radius) this.pos[idxa + 1] = radius - vy;
          if (ya > this.worldMax[1] - radius)
            this.pos[idxa + 1] = this.worldMax[1] - radius - vy;
        }

        for (let k = 0; k < this.numParticles; k++) {
          if (j === k) continue;
          const idxb = k * 2;

          const xbb = this.pos[idxb];
          const ybb = this.pos[idxb + 1];

          if (Number.isNaN(xbb) || Number.isNaN(ybb)) debugger;

          const { x: xb, y: yb, z: z2 = 1 } = this.fisheye(xbb, ybb);
          const dx = xb - xa;
          const dy = yb - ya;
          const distsq = dx * dx + dy * dy;

          const radius2 = this.radius[k] * z2;

          if (distsq < Math.pow(radius + radius2, 2)) {
            const deltalength = Math.sqrt(distsq);
            const diff = (deltalength - (radius + radius2)) / deltalength;

            const ddx = dx * 0.5 * diff;
            const ddy = dy * 0.5 * diff;

            if (Number.isNaN(ddx) || Number.isNaN(ddy)) debugger;

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

  set fisheyeFn(fo) {
    this.fisheye = fo;
  }

  step() {
    this.accumulateForces();
    this.verlet();
    this.satisfyConstraints();
  }

  draw(ctx) {
    for (let i = 0; i < this.numParticles; i++) {
      const idx = i * 2;

      // const x_ = this.pos[idx];
      // const y_ = this.pos[idx + 1];

      const { x, y, z } = this.fisheye(this.pos[idx], this.pos[idx + 1]);

      ctx.fillStyle = this.colors[i];
      ctx.beginPath();
      ctx.arc(x, y, this.radius[i] * z, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  print() {
    console.log(this.pos);
  }
}

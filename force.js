class Force {
  constructor(pos, radius, strength) {
    this.originalPos = pos;
    this.pos = pos;
    this.radius = radius;
    this.strength = strength;
  }

  step(v) {
    this.step(v || 0);
  }

  draw(ctx) {
    ctx.strokeStyle = "#f0f";
    ctx.beginPath();
    ctx.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  set runner(runFn) {
    this.run = runFn;
  }

  set stepper(stepFn) {
    this.step = stepFn;
  }
}

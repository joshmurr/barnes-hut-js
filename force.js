class Force {
  constructor(pos, radius, strength, alpha = 0.1) {
    this.originalPos = pos;
    this.pos = pos;
    this.radius = radius;
    this.strength = strength;
    this.alpha = alpha;
    this.update = () => undefined;
  }

  run(x, y) {
    const dx = x - this.pos[0];
    const dy = y - this.pos[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > this.radius) return [0, 0];
    const force =
      ((this.radius - distance) * this.strength * this.alpha) / distance;
    return [dx * force, dy * force];
  }

  set updater(updateFn) {
    this.update = updateFn;
  }

  draw(ctx) {
    ctx.strokeStyle = "#f0f";
    ctx.beginPath();
    ctx.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

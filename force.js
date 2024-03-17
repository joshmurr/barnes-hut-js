class Force {
  constructor(pos, radius, strength, alpha = 0.1) {
    this.originalPos = pos;
    this.pos = pos;
    this.radius = radius;
    this.strength = strength;
    this.alpha = alpha;
    this.on = false;
    this._type = "radial";
    this._axis = "x";
    this.update = () => undefined;
  }

  run(x, y) {
    if (this._type === "radial") return this.radialRun(x, y);
    if (this._type === "linear")
      return this.linearRun(this._axis === "x" ? x : y);
  }

  radialRun(x, y) {
    if (!this.on) return [0, 0];
    const dx = x - this.pos[0];
    const dy = y - this.pos[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > this.radius) return [0, 0];
    const force =
      ((this.radius - distance) * this.strength * this.alpha) / distance;
    return [dx * force, dy * force];
  }

  linearRun(v) {
    if (!this.on) return [0, 0];
    const idx = this._axis === "x" ? 0 : 1;
    const d = Math.abs(v - this.pos[idx]);
    if (d > this.radius) return [0, 0];
    // debugger;
    const force = (this.radius - d) * this.strength;
    return this._axis === "x" ? [d * force, 0] : [0, d * force];
  }

  set type(type) {
    this._type = type;
  }

  set axis(axis) {
    this._axis = axis;
  }

  set updater(updateFn) {
    this.update = updateFn;
  }

  set name(name) {
    this._name = name;
  }

  get name() {
    return this._name;
  }

  toggle() {
    this.on = !this.on;
  }

  draw(ctx) {
    ctx.strokeStyle = this.on ? "#f0f" : "#0ff";
    ctx.beginPath();
    ctx.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

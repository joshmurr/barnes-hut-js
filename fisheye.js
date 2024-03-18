class Fisheye {
  constructor({
    radius = 100,
    distortion = 2,
    focus = [0, 0],
    updatePos = true,
    updateRad = true,
  }) {
    this.radius = radius;
    this.distortion = distortion;
    this.focus = focus;
    this.updatePos = updatePos;
    this.updateRad = updateRad;

    this.k0 = Math.exp(distortion);
    this.k0 = (this.k0 / (this.k0 - 1)) * radius;
    this.k1 = distortion / radius;
  }

  fisheye(x, y) {
    const dx = x - this.focus[0];
    const dy = y - this.focus[1];
    const dd = Math.sqrt(dx * dx + dy * dy);
    if (!dd || dd >= this.radius) {
      return {
        x: x,
        y: y,
        z: this.updateRad ? (dd >= this.radius ? 1 : 10) : 1,
      };
    }
    const k = ((this.k0 * (1 - Math.exp(-dd * this.k1))) / dd) * 0.75 + 0.25;
    return {
      x: this.updatePos ? this.focus[0] + dx * k : x,
      y: this.updatePos ? this.focus[1] + dy * k : y,
      z: this.updateRad ? Math.min(k, 10) : 1,
    };
  }
}

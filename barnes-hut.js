class BarnesHut {
  constructor(verletSystem, theta) {
    this.verletSystem = verletSystem;
    const [width, height] = verletSystem.worldMax;
    this.theta = theta;
    this.calcs = 0;
    this.root = new QuadNode(
      width / 2,
      height / 2,
      Math.max(width, height),
      verletSystem,
    );
  }

  buildTree() {
    for (let i = 0; i < this.verletSystem.numParticles; i++) {
      this.root.insert(i);
    }
  }

  reset() {
    this.calcs = 0;
    this.root = new QuadNode(
      width / 2,
      height / 2,
      Math.max(width, height),
      this.verletSystem,
    );
  }

  /* Takes a body and iterates through the tree to calculate the force acting on the body */
  calculateForces(bodyIdx) {
    const idx = bodyIdx * 2;

    const calculateForceRecursively = (node) => {
      if (node.body[0] === "PARENT") {
        for (let child of node.children) {
          if (child) calculateForceRecursively(child);
        }
      }
      if (!node.body || node.body === bodyIdx) {
        return;
      }

      const x = this.verletSystem.pos[idx];
      const y = this.verletSystem.pos[idx + 1];
      const mass = this.verletSystem.mass[bodyIdx];

      const dx = node.com[0] - x;
      const dy = node.com[1] - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (node.size / distance < this.theta) {
        this.calcs++;
        const force = (node.mass * mass) / (distance * distance);
        this.verletSystem.acc[idx] += force * (dx / distance);
        this.verletSystem.acc[idx + 1] += force * (dy / distance);
      }
    };

    calculateForceRecursively(this.root);
  }
}

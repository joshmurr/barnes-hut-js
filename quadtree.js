class QuadNode {
  constructor(x, y, size, verletSystem) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.mass = 0;
    this.com = [0, 0];
    this.body = []; // Leaf node body
    // this.leaf = true
    this.children = [null, null, null, null]; // Array of QuadNode
    this.maxDepth = 8;
    this.depth = 0;
    this.verletSystem = verletSystem;
  }

  insert(newBodyIdx, depth = 0) {
    let bodiesToInsert = [newBodyIdx];
    if (this.body.length > 0) {
      if (this.depth === this.maxDepth) {
        this.body = [newBodyIdx];
        return;
      }

      /* Is Parent or Leaf */
      if (this.body[0] !== "PARENT") {
        bodiesToInsert.push(this.body[0]);
      }

      this.body = ["PARENT"];
    } else {
      this.body.push(newBodyIdx);

      const arrIdx = newBodyIdx * 2;
      this.mass = verletSystem.mass[newBodyIdx];
      this.com = verletSystem.pos.slice(arrIdx, arrIdx + 2);

      this.depth = depth;

      return;
    }
    for (let bodyIdx of bodiesToInsert) {
      const quad = this.getQuadrant(bodyIdx);
      const arrIdx = bodyIdx * 2;
      if (!this.children[quad]) {
        this.children[quad] = this.createChild(quad);
      }
      this.mass += this.verletSystem.mass[bodyIdx];
      const [x, y] = this.verletSystem.pos.slice(arrIdx, arrIdx + 2);
      this.com[0] =
        (this.com[0] * this.mass + x * this.verletSystem.mass[bodyIdx]) /
        (this.mass + this.verletSystem.mass[bodyIdx]);
      this.com[1] =
        (this.com[1] * this.mass + y * this.verletSystem.mass[bodyIdx]) /
        (this.mass + this.verletSystem.mass[bodyIdx]);

      this.children[quad].insert(bodyIdx, this.depth + 1);
    }
  }

  getQuadrant(bodyIdx) {
    const arrIdx = bodyIdx * 2;
    const [x, y] = this.verletSystem.pos.slice(arrIdx, arrIdx + 2);
    if (x <= this.x && y <= this.y) {
      return 0;
    } else if (x > this.x && y <= this.y) {
      return 1;
    } else if (x <= this.x && y > this.y) {
      return 2;
    } else {
      return 3;
    }
  }

  isEdge(child) {
    const r =
      child.x - child.size / 2 <= 0 ||
      child.x + child.size / 2 >= this.verletSystem.worldMax[0] ||
      child.y - child.size / 2 <= 0 ||
      child.y + child.size / 2 >= this.verletSystem.worldMax[1];

    return r;
  }

  createChild(quad) {
    const halfSize = this.size / 2;
    switch (quad) {
      case 0:
        return new QuadNode(
          this.x - halfSize / 2,
          this.y - halfSize / 2,
          halfSize,
          this.verletSystem,
        );
      case 1:
        return new QuadNode(
          this.x + halfSize / 2,
          this.y - halfSize / 2,
          halfSize,
          this.verletSystem,
        );
      case 2:
        return new QuadNode(
          this.x - halfSize / 2,
          this.y + halfSize / 2,
          halfSize,
          this.verletSystem,
        );
      case 3:
        return new QuadNode(
          this.x + halfSize / 2,
          this.y + halfSize / 2,
          halfSize,
          this.verletSystem,
        );
    }
  }

  draw(ctx, label = false) {
    const x = this.x - this.size / 2;
    const y = this.y - this.size / 2;
    ctx.strokeStyle = "lightgrey";
    ctx.strokeRect(x, y, this.size, this.size);

    if (this.depth === 0) {
      /* Draw center of mass */
      ctx.strokeStyle = "#0f0";
      ctx.beginPath();
      ctx.moveTo(this.com[0] - 20, this.com[1] - 20);
      ctx.lineTo(this.com[0] + 20, this.com[1] + 20);
      ctx.moveTo(this.com[0] - 20, this.com[1] + 20);
      ctx.lineTo(this.com[0] + 20, this.com[1] - 20);
      ctx.stroke();
    }

    if (label) {
      ctx.fillStyle = "black";
      ctx.fillText(this.depth, x + 5 * this.depth + 2, y + 12);
    }

    for (let child of this.children) {
      if (child) child.draw(ctx, label);
    }
  }
}

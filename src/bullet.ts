import { Vec2 } from "./types"

export class Bullet {
    public x = 0
    public y = 0
    public radius = 3
    public origin: Vec2 = { x: 0, y: 0 }
    public velocity: Vec2 = { x: 2, y: 2 }

    constructor(public angle: number, origin: Vec2) {
        this.x = this.origin.x = origin.x
        this.y = this.origin.y = origin.y
    }

    public update() {
        this.x += Math.cos(this.angle) * this.velocity.x
        this.y += Math.sin(this.angle) * this.velocity.y
    }

    public render(ctx: CanvasRenderingContext2D) {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.fillStyle = "green"
        ctx.beginPath()
        ctx.arc(0, 0, this.radius, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
    }
}

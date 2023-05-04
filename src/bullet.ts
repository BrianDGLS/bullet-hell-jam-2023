import { Vec2 } from "./types"

export class Bullet {
    public x = 0
    public y = 0
    public active = true
    public radius = 5
    public origin: Vec2 = { x: 0, y: 0 }
    public velocity: Vec2 = { x: 2, y: 2 }

    constructor(public angle: number, origin: Vec2, radius = 5) {
        this.x = this.origin.x = origin.x
        this.y = this.origin.y = origin.y
        this.radius = radius
    }

    public update() {
        this.x += Math.cos(this.angle) * this.velocity.x
        this.y += Math.sin(this.angle) * this.velocity.y
    }

    public render(ctx: CanvasRenderingContext2D) {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.fillStyle = "orange"
        ctx.strokeStyle = "red"
        ctx.beginPath()
        ctx.arc(0, 0, this.radius, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        ctx.restore()
    }
}

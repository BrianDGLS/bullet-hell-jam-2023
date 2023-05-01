import { Vec2 } from "./types"

export class Bullet {
    public origin: Vec2 = { x: 0, y: 0 }
    public position: Vec2 = { x: 0, y: 0 }
    public velocity: Vec2 = { x: 2, y: 2 }
    public width = 6
    public height = 6

    constructor(public angle: number, origin: Vec2) {
        this.position.x = this.origin.x = origin.x
        this.position.y = this.origin.y = origin.y
    }

    public update() {
        this.position.x += Math.cos(this.angle) * this.velocity.x
        this.position.y += Math.sin(this.angle) * this.velocity.y
    }

    public render(ctx: CanvasRenderingContext2D) {
        ctx.save()
        ctx.translate(this.position.x, this.position.y)
        ctx.fillStyle = "pink"
        ctx.fillRect(0, 0, this.width, this.height)
        ctx.restore()
    }
}

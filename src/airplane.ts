import { Duration } from "./duration"
import { Context, Vec2 } from "./types"

export type Airplane = Vec2 & {
    vx: number
    vy: number
    color: string
    radius: number
    active: boolean
    speed: number
    scaleX: number
    fireRate: Duration
}

export function createAirplane({ x, y }: Vec2): Airplane {
    return {
        x,
        y,
        vx: 0,
        vy: 0,
        speed: 1,
        color: "#fff",
        radius: 40,
        active: false,
        scaleX: 1,
        fireRate: new Duration(500)
    }
}

export function updateAirplane(plane: Airplane) {
    plane.x += plane.vx
}

export function renderAirplane(ctx: Context, plane: Airplane) {
    ctx.save()
    ctx.translate(plane.x, plane.y)
    ctx.lineWidth = 8
    ctx.strokeStyle = plane.color
    ctx.fillStyle = "#000"
    ctx.scale(plane.scaleX, 1)
    ctx.beginPath()
    ctx.save()
    ctx.rotate(-0.15)
    ctx.ellipse(
        -plane.radius * 0.9,
        -plane.radius / 4,
        plane.radius / 8,
        plane.radius / 6,
        0,
        2 * Math.PI,
        0,
    )
    ctx.stroke()
    ctx.restore()
    ctx.beginPath()
    ctx.ellipse(0, 0, plane.radius, plane.radius / 4, 0, 2 * Math.PI, 0)
    ctx.stroke()
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(
        plane.radius / 10,
        0,
        plane.radius / 4,
        plane.radius / 16,
        0,
        2 * Math.PI,
        0,
    )
    ctx.stroke()
    ctx.beginPath()
    ctx.lineWidth = 4
    ctx.ellipse(
        plane.radius * 0.8,
        -plane.radius / 10,
        plane.radius / 16,
        plane.radius / 30,
        0,
        2 * Math.PI,
        0,
    )
    ctx.stroke()
    ctx.restore()
}

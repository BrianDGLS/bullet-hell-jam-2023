import { CANVAS_HEIGHT, FRICTION, CANVAS_WIDTH, GROUND_HEIGHT, FLOOR } from "./constants"
import { isKeyDown, KEYS } from "./keyboard"
import { Vec2, Context } from "./types"
import { getRandomInt } from "./utils"

export type Player = Vec2 & {
    vx: number
    vy: number
    color: string
    speed: number
    alive: boolean
    radius: number
    beaming: boolean
    rotation: number
    beamSpeed: number
}

export function createPlayer({ x, y }: Vec2): Player {
    return {
        x,
        y,
        vx: 0,
        vy: 0,
        speed: 4,
        radius: 10,
        rotation: 0,
        alive: true,
        beamSpeed: 2,
        color: "#fff",
        beaming: false,
    }
}

export function renderTractorBeam(ctx: Context, p: Player) {
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.strokeStyle = "blue"
    ctx.fillStyle = "rgba(0, 0, 255, .4)"

    ctx.lineWidth = 2.5

    const originSpread = p.radius
    const destSpread = p.radius * 4
    const floor = FLOOR - p.y - ctx.lineWidth

    ctx.beginPath()
    ctx.moveTo(-originSpread, 0)
    ctx.lineTo(-destSpread, floor)
    ctx.lineTo(destSpread, floor)
    ctx.lineTo(originSpread, 0)
    ctx.lineTo(-originSpread, 0)
    ctx.closePath()
    ctx.stroke()
    ctx.fill()

    ctx.restore()
}

export function renderPlayer(ctx: Context, p: Player) {
    if (p.beaming) {
        renderTractorBeam(ctx, p)
    }

    ctx.save()
    ctx.translate(p.x, p.y)

    ctx.strokeStyle = p.color
    ctx.fillStyle = "black"

    ctx.rotate(p.rotation)

    ctx.lineWidth = 2.5

    ctx.beginPath()
    ctx.ellipse(0, 0, p.radius * 2, p.radius, 0, 0, Math.PI)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.ellipse(0, 0, p.radius, p.radius, 0, Math.PI, 0)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.restore()
}

export function updatePlayer(p: Player) {
    if (!p.beaming) {
        if (isKeyDown(KEYS.UP) || isKeyDown(KEYS.W)) p.vy = -p.speed
        if (isKeyDown(KEYS.DOWN) || isKeyDown(KEYS.S)) p.vy = p.speed
        if (isKeyDown(KEYS.LEFT) || isKeyDown(KEYS.A)) p.vx = -p.speed
        if (isKeyDown(KEYS.RIGHT) || isKeyDown(KEYS.D)) p.vx = p.speed
    }

    p.x += p.vx
    p.y += p.vy
    p.vx *= FRICTION
    p.vy *= FRICTION

    if (p.x - p.radius <= 0) p.x = p.radius
    if (p.y - p.radius <= 0) p.y = p.radius
    if (p.y + p.radius >= FLOOR) p.y = FLOOR - p.radius
    if (p.x + p.radius >= CANVAS_WIDTH) p.x = CANVAS_WIDTH - p.radius
}

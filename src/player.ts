import { FRICTION, CANVAS_WIDTH, FLOOR } from "./constants"
import { isKeyDown, KEYS } from "./keyboard"
import { Vec2, Context } from "./types"
import { clamp } from "./utils"

export type Player = Vec2 & {
    vx: number
    vy: number
    color: string
    speed: number
    lifes: number
    alive: boolean
    radius: number
    beaming: boolean
    rotation: number
    beamSpeed: number
    invincible: boolean
}

export function createPlayer({ x, y }: Vec2): Player {
    return {
        x,
        y,
        vx: 0,
        vy: 0,
        lifes: 3,
        speed: 4,
        radius: 10,
        rotation: 0,
        alive: true,
        beamSpeed: 2,
        color: "#fff",
        beaming: false,
        invincible: false,
    }
}

export function renderPlayerLifes(ctx: Context, p: Player) {
    ctx.save()
    ctx.fillStyle = "rgba(0, 0, 0, .3)"
    ctx.fillRect(0, 0, 105, 35)
    ctx.font = "22px monospace"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.filter = "grayscale(1)"
    ctx.fillStyle = "#fff"
    ctx.fillText(`👽 ${p.lifes.toString().padStart(4, " ")}`, 55, 20)
    ctx.restore()
}

export function renderTractorBeam(ctx: Context, p: Player) {
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.strokeStyle = "yellow"
    ctx.fillStyle = "rgba(255, 255, 0, .4)"

    ctx.lineWidth = 3

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

    ctx.lineWidth = 3

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

    p.beaming = isKeyDown(KEYS.SPACE)

    p.x += p.vx
    p.y += p.vy
    p.vx = clamp(p.vx * FRICTION, 0, p.speed)
    p.vy = clamp(p.vy * FRICTION, 0, p.speed)

    if (p.x - p.radius <= 0) p.x = p.radius
    if (p.y - p.radius <= 0) p.y = p.radius
    if (p.y + p.radius >= FLOOR) p.y = FLOOR - p.radius
    if (p.x + p.radius >= CANVAS_WIDTH) p.x = CANVAS_WIDTH - p.radius
}

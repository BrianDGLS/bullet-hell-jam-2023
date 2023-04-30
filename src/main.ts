import { KEYS, isKeyDown } from "./keyboard"
import { layers } from "./layers"

const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 480

const $stage = document.getElementById("stage") as HTMLDivElement

$stage.style.width = `${CANVAS_WIDTH}px`
$stage.style.height = `${CANVAS_HEIGHT}px`

for (const $canvas of $stage.querySelectorAll("canvas")) {
    $canvas.width = CANVAS_WIDTH
    $canvas.height = CANVAS_HEIGHT
}
const FRICTION = 0.96

type Context = CanvasRenderingContext2D
type Vec2 = { x: number; y: number }
type Player = Vec2 & {
    vx: number
    vy: number
    color: string
    speed: number
    radius: number
    rotation: number
}

function createPlayer({ x, y }: Vec2): Player {
    return {
        x,
        y,
        vx: 0,
        vy: 0,
        speed: 4,
        radius: 10,
        rotation: 0,
        color: "#fff",
    }
}

function renderBg(ctx: Context) {
    ctx.save()
    ctx.fillStyle = "rgb(0, 0, 0)"
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ctx.restore()
}

function fadeOutFrame(ctx: Context, opacity = 1) {
    ctx.save()
    ctx.fillStyle = `rgba(0, 0, 0,${opacity})`
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ctx.restore()
}

function renderBullet(ctx: Context, bullet: Vec2, size = 4, color = "#fff") {
    ctx.save()
    ctx.fillStyle = color
    ctx.fillRect(bullet.x, bullet.y, size, size)
    ctx.restore()
}

function renderPlayer(ctx: Context, p: Player) {
    ctx.save()
    ctx.translate(p.x, p.y)

    ctx.strokeStyle = p.color
    ctx.fillStyle = 'black'

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

function updatePlayer(p: Player) {
    if (isKeyDown(KEYS.UP) || isKeyDown(KEYS.W)) p.vy = -p.speed
    if (isKeyDown(KEYS.DOWN) || isKeyDown(KEYS.S)) p.vy = p.speed
    if (isKeyDown(KEYS.LEFT) || isKeyDown(KEYS.A)) p.vx = -p.speed
    if (isKeyDown(KEYS.RIGHT) || isKeyDown(KEYS.D)) p.vx = p.speed

    p.x += p.vx
    p.y += p.vy
    p.vx *= FRICTION
    p.vy *= FRICTION

    if (p.x - p.radius <= 0) p.x = p.radius
    if (p.y - p.radius <= 0) p.y = p.radius
    if (p.x + p.radius >= CANVAS_WIDTH) p.x = CANVAS_WIDTH - p.radius
    if (p.y + p.radius >= CANVAS_HEIGHT) p.y = CANVAS_HEIGHT - p.radius
}

const state = {
    player: createPlayer({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 }),
    beaming: false
}

$stage.addEventListener('mousedown', () => {
    state.beaming = true
})

$stage.addEventListener('mouseup', () => {
    state.beaming = false
})

window.onload = function main() {
    requestAnimationFrame(main)

    const { bg, game, ui } = layers

    bg.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ui.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    updatePlayer(state.player)

    fadeOutFrame(game, 0.6)
    renderBg(bg)

    // renderBullet(game, { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 })

    if(state.beaming) {
        const ctx = game
        const player = state.player
        game.save()
        game.translate(player.x, player.y)
        ctx.strokeStyle = 'blue'
        ctx.fillStyle = 'rgba(0, 0, 255, .4)'

        ctx.lineWidth = 2.5
    
        ctx.beginPath()
        ctx.moveTo(-player.radius, 0)
        ctx.lineTo(-player.radius * 4, CANVAS_HEIGHT - player.y - ctx.lineWidth)
        ctx.lineTo(player.radius * 4, CANVAS_HEIGHT - player.y - ctx.lineWidth)
        ctx.lineTo(player.radius, 0)
        ctx.lineTo(-player.radius, 0)
        ctx.closePath()
        ctx.stroke()
        ctx.fill()


        game.restore()
    }

    renderPlayer(game, state.player)

}

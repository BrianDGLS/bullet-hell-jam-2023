import { layers } from "./layers"
import { Context, Vec2 } from "./types"
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_HEIGHT } from "./constants"
import { createPlayer, updatePlayer, renderPlayer } from "./player"
import { generateCRTVignette } from "./crt"

const $stage = document.getElementById("stage") as HTMLDivElement

$stage.style.width = `${CANVAS_WIDTH}px`
$stage.style.height = `${CANVAS_HEIGHT}px`

for (const $canvas of $stage.querySelectorAll("canvas")) {
    $canvas.width = CANVAS_WIDTH
    $canvas.height = CANVAS_HEIGHT
}

function renderBg(ctx: Context) {
    ctx.save()
    ctx.fillStyle = "rgb(0, 0, 0)"
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ctx.restore()
}

function renderGround(ctx: Context) {
    ctx.save()

    ctx.strokeStyle = "white"
    ctx.lineWidth = 4

    ctx.beginPath()
    ctx.moveTo(0, CANVAS_HEIGHT - GROUND_HEIGHT)
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT)
    ctx.closePath()

    ctx.stroke()

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

const state = {
    player: createPlayer({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 }),
}

$stage.addEventListener("mousedown", () => {
    state.player.beaming = true
})

$stage.addEventListener("mouseup", () => {
    state.player.beaming = false
})

const vignette = generateCRTVignette(
    layers.offscreen,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
)

window.onload = function main() {
    requestAnimationFrame(main)

    const { bg, game, ui } = layers

    bg.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    fadeOutFrame(game, 0.6)
    ui.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    ui.putImageData(vignette, 0, 0)

    // updates
    updatePlayer(state.player)

    // render
    renderBg(bg)
    renderGround(game)
    renderPlayer(game, state.player)
}

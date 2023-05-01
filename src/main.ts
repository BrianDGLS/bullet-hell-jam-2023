import { layers } from "./layers"
import { Context, Vec2 } from "./types"
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_HEIGHT, FLOOR } from "./constants"
import { createPlayer, updatePlayer, renderPlayer, Player } from "./player"
import { generateCRTVignette } from "./crt"
import { Cow, createCow, renderCow, updateCow } from "./cow"
import { choose, moveTowards } from "./utils"
import { Farmer, createFarmer, renderFarmer, updateFarmer } from "./farmer"
import { Bullet } from "./bullet"
import { createExplosion, updateExplosion } from "./explosion"

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

type GameState = {
    player: Player
    cows: Cow[]
    farmers: Farmer[]
    bullets: Bullet[]
    explosions: any[]
}

const state: GameState = {
    player: createPlayer({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 }),
    cows: [createCow({ x: choose(CANVAS_WIDTH, 0), y: FLOOR })],
    farmers: [createFarmer({ x: choose(CANVAS_WIDTH, 0), y: FLOOR })],
    bullets: [],
    explosions: [],
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

function makeFarmerShoot(farmer: Farmer, player: Player, state) {
    if (farmer.fireRate.hasPassed()) {
        const toAngle = Math.atan2(player.y - farmer.y, player.x - farmer.x)
        state.bullets.push(new Bullet(toAngle, farmer))
    }
}

window.onload = function main() {
    requestAnimationFrame(main)

    const { bg, game, ui } = layers

    bg.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    fadeOutFrame(game, 0.6)
    ui.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    ui.putImageData(vignette, 0, 0)

    for (const cow of state.cows) {
        updateCow(cow)

        if (state.player.beaming) {
            if (
                cow.x + cow.width < state.player.x + state.player.radius * 4 &&
                cow.x - cow.width > state.player.x - state.player.radius * 4
            ) {
                cow.isBeingAbducted = true
            }
        } else {
            cow.isBeingAbducted = false
        }

        if (cow.isBeingAbducted) {
            const playerCenter = {
                x: state.player.x - cow.width / 2,
                y: state.player.y,
            }
            const newPosition = moveTowards(
                cow,
                playerCenter,
                state.player.beamSpeed,
            )
            cow.x = newPosition.x
            cow.y = newPosition.y
        }

        if (
            (cow.x === state.player.x - cow.width / 2 &&
                cow.y < state.player.y + state.player.radius * 2) ||
            cow.x + cow.width < 0 ||
            cow.x > CANVAS_WIDTH
        ) {
            Object.assign(
                cow,
                createCow({ x: choose(CANVAS_WIDTH, 0), y: FLOOR }),
            )
        }

        renderCow(game, cow)
    }

    for (const farmer of state.farmers) {
        updateFarmer(farmer)
        if (state.player.alive && farmer.x > 0 && farmer.x < CANVAS_WIDTH) {
            makeFarmerShoot(farmer, state.player, state)
        }
        renderFarmer(game, farmer)

        if (farmer.x + farmer.width < 0 || farmer.x > CANVAS_WIDTH) {
            Object.assign(
                farmer,
                createFarmer({ x: choose(CANVAS_WIDTH, 0), y: FLOOR }),
            )
        }
    }

    for (const [index, bullet] of state.bullets.entries()) {
        bullet.update()

        if (
            state.player.alive &&
            bullet.position.x < state.player.x + state.player.radius * 2 &&
            bullet.position.x > state.player.x - state.player.radius * 2 &&
            bullet.position.y < state.player.y + state.player.radius * 2 &&
            bullet.position.y > state.player.y - state.player.radius * 2
        ) {
            state.explosions.push(createExplosion(state.player))
            state.bullets.splice(index, 1)
            state.player.alive = false
        } else {
            bullet.render(game)
        }
    }

    if (state.player.alive) {
        updatePlayer(state.player)
        renderPlayer(game, state.player)
    }

    for (const [index, explosion] of state.explosions.entries()) {
        if (explosion.ended) {
            state.explosions.splice(index, 1)
        } else {
            updateExplosion(game, explosion)
        }
    }

    // render
    renderBg(bg)
    renderGround(game)
}

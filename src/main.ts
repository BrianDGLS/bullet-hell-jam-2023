import { layers } from "./layers"
import { Context, Vec2 } from "./types"
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_HEIGHT, FLOOR } from "./constants"
import { createPlayer, updatePlayer, renderPlayer, Player } from "./player"
import { generateCRTVignette } from "./crt"
import { Cow, createCow, renderCow, updateCow } from "./cow"
import {
    choose,
    circlesIntersect,
    getRandomInt,
    moveTowards,
    sample,
} from "./utils"
import { Farmer, createFarmer, renderFarmer, updateFarmer } from "./farmer"
import { Bullet } from "./bullet"
import { createExplosion, updateExplosion } from "./explosion"
import { Stars } from "./stars"

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

    ctx.fillStyle = "black"
    ctx.fillRect(
        0,
        CANVAS_HEIGHT - GROUND_HEIGHT,
        CANVAS_WIDTH,
        CANVAS_HEIGHT - GROUND_HEIGHT,
    )

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
    stars: Stars
}

const state: GameState = {
    player: createPlayer({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 }),
    cows: [createCow({ x: choose(CANVAS_WIDTH, 0), y: FLOOR })],
    farmers: [
        createFarmer({ x: CANVAS_WIDTH, y: FLOOR }),
        createFarmer({ x: 0, y: FLOOR }),
    ],
    bullets: [],
    explosions: [],
    stars: new Stars(100),
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

const hills: Vec2[] = []

const verticalSteps = [-32, -96, -64, -128, -160, -196]
const horizontalSteps = [32, 64, 96]
const startX = -sample(horizontalSteps)
let progress = startX
hills.push({ x: startX, y: sample(verticalSteps) })
while (progress < CANVAS_WIDTH) {
    progress += sample(horizontalSteps)
    hills.push({ x: progress, y: sample(verticalSteps) })
}

window.onload = function main() {
    requestAnimationFrame(main)

    const { bg, game, ui } = layers

    bg.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    fadeOutFrame(game, 0.6)
    ui.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    ui.putImageData(vignette, 0, 0)

    state.stars.makeCamFollow(state.player)
    state.stars.render(game)

    const ctx = game
    ctx.save()
    ctx.translate(0, FLOOR)
    ctx.beginPath()
    ctx.moveTo(hills[0].x, 0)
    for (const hill of hills) {
        ctx.lineTo(hill.x, hill.y)
    }
    ctx.lineTo(hills[hills.length - 1].x, 0)
    ctx.closePath()
    ctx.strokeStyle = "#fff"
    ctx.fillStyle = "#000"
    ctx.lineWidth = 4
    ctx.stroke()
    ctx.fill()
    ctx.restore()

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
                x:
                    cow.vx < 0
                        ? state.player.x - cow.width / 2
                        : state.player.x + cow.width / 2,
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
            circlesIntersect(state.player, {
                x: cow.x,
                y: cow.y,
                radius: cow.height / 2,
            }) ||
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
                createFarmer({
                    x: farmer.vx < 0 ? CANVAS_WIDTH : -farmer.width,
                    y: FLOOR,
                }),
            )
        }
    }

    for (const [index, bullet] of state.bullets.entries()) {
        bullet.update()

        if (state.player.alive && circlesIntersect(bullet, state.player)) {
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

    renderBg(bg)
    renderGround(game)
}

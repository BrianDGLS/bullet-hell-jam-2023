import { layers } from "./layers"
import { Context, Vec2 } from "./types"
import {
    FLOOR,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    GROUND_HEIGHT,
    PLANE_SPAWN_TIME,
} from "./constants"
import {
    createPlayer,
    updatePlayer,
    renderPlayer,
    Player,
    renderPlayerLifes,
} from "./player"
import { generateCRTVignette } from "./crt"
import { Cow, createCow, renderCow, updateCow } from "./cow"
import { choose, circlesIntersect, moveTowards } from "./utils"
import { Farmer, createFarmer, renderFarmer, updateFarmer } from "./farmer"
import { Bullet } from "./bullet"
import { createExplosion, updateExplosion } from "./explosion"
import { Stars } from "./stars"
import { createHills, renderHills } from "./hills"
import {
    Airplane,
    createAirplane,
    renderAirplane,
    updateAirplane,
} from "./airplane"
import { Duration } from "./duration"


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

type GameState = {
    player: Player
    cow: Cow
    farmers: Farmer[]
    bullets: Bullet[]
    explosions: any[]
    score: number
    plane: Airplane
    planeSpawnRate: Duration
    shake: boolean
    previousPlaneSpawn: number
    playing: boolean
}

const stars = new Stars(100)
const hills = createHills()

function getNewGameState(): GameState {
    return {
        playing: true,
        player: createPlayer({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 4 }),
        shake: false,
        cow: createCow({ x: choose(CANVAS_WIDTH, 0), y: FLOOR }),
        farmers: [
            createFarmer({ x: CANVAS_WIDTH, y: FLOOR }),
            createFarmer({ x: 0, y: FLOOR }),
        ],
        bullets: [],
        explosions: [],
        plane: createAirplane({ x: -50, y: 50 }),
        planeSpawnRate: new Duration(PLANE_SPAWN_TIME),
        previousPlaneSpawn: 0,
        score: 0,
    }
}

let state: GameState = { playing: false } as any

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

function makePlaneShoot(plane: Airplane, state) {
    if (plane.fireRate.hasPassed()) {
        const toAngle = Math.atan2(FLOOR - plane.y, plane.x)
        state.bullets.push(new Bullet(toAngle, plane, 10))
    }
}

function renderScore(ctx: Context, score: number) {
    ctx.save()
    ctx.fillStyle = "rgba(0, 0, 0, .3)"
    ctx.fillRect(CANVAS_WIDTH - 105, 0, 105, 35)
    ctx.font = "22px monospace"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.filter = "grayscale(1)"
    ctx.fillStyle = "#fff"
    ctx.fillText(
        `🐮 ${score.toString().padStart(4, " ")}`,
        CANVAS_WIDTH - 55,
        20,
    )
    ctx.restore()
}

const moo = new Audio("./moo.mp4")

const cowBell = new Audio("./cow-bell.wav")
cowBell.volume = 0.3
const bombHitGround = new Audio("./bomb-hit-ground.wav")
bombHitGround.volume = 0.3
const playerHit = new Audio("./player-hit.wav")
playerHit.volume = 0.3
const music = new Audio("./music.mp3")
music.volume = 0.2
music.loop = true
music.play()

function preShake(ctx: Context) {
    ctx.save()
    var dx = Math.random() * 10
    var dy = Math.random() * 10
    ctx.translate(dx, dy)
}

function postShake(ctx: Context) {
    ctx.restore()
}

let mouseX = 0
let mouseY = 0

$stage.addEventListener("mousemove", (e) => {
    mouseX = e.clientX
    mouseY = e.clientY
})

const $startMenu = document.getElementById("start-menu") as HTMLDivElement
const $gameOver = document.getElementById("game-over") as HTMLDivElement

function startGame() {
    $startMenu.style.display = "none"
    $gameOver.style.display = "none"
    state = getNewGameState()
    music.play()
}

const $score = document.getElementById("score") as HTMLSpanElement

function gameOver(score: number) {
    $gameOver.style.display = "flex"
    $score.innerHTML = score.toString()
}

const $playButton = document.getElementById("play-btn") as HTMLButtonElement
const $playAgainButton = document.getElementById(
    "play-again",
) as HTMLButtonElement

$playButton.addEventListener("click", startGame)
$playAgainButton.addEventListener("click", startGame)

window.onload = function main() {
    requestAnimationFrame(main)

    const { bg, game, ui, effects } = layers

    bg.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    fadeOutFrame(game, 0.6)
    effects.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ui.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    ui.putImageData(vignette, 0, 0)

    if (state.shake) {
        preShake(game)
    }

    if (state.player) {
        stars.makeCamFollow(state.player)
    } else {
        stars.makeCamFollow({ x: mouseX, y: mouseY })
    }
    stars.render(game)

    renderHills(game, hills)
    renderBg(bg)
    renderGround(game)

    if (state.playing) {
        renderPlayerLifes(ui, state.player)
        renderScore(ui, state.score)

        //cow
        const cow = state.cow
        if (cow.active) {
            updateCow(cow)
        }

        if (state.player.alive && state.player.beaming) {
            if (
                cow.x + cow.width / 2 <
                    state.player.x + state.player.radius * 4 &&
                cow.x - cow.width / 2 > state.player.x - state.player.radius * 4
            ) {
                if (!cow.isBeingAbducted) {
                    moo.play()
                }
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
            }) &&
            state.player.beaming &&
            cow.active
        ) {
            cowBell.play()
            state.score += 1
        }

        if (
            (cow.active &&
                circlesIntersect(state.player, {
                    x: cow.x,
                    y: cow.y,
                    radius: cow.height / 2,
                }) &&
                state.player.beaming) ||
            cow.x + cow.width < 0 ||
            cow.x > CANVAS_WIDTH
        ) {
            cow.active = false
            setTimeout(() => {
                Object.assign(
                    cow,
                    createCow({
                        x: cow.scale.x < 0 ? CANVAS_WIDTH : -cow.width,
                        y: FLOOR,
                    }),
                )
            }, 2000)
        }

        if (cow.active) {
            renderCow(game, cow)
        }
        //cow

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

        for (const bullet of state.bullets) {
            bullet.update()
            bullet.render(effects)

            if (state.player.alive && !state.player.invincible && circlesIntersect(bullet, state.player)) {
                playerHit.play()
                state.explosions.push(createExplosion(state.player))
                bullet.active = false

                state.shake = true
                setTimeout(() => {
                    state.shake = false
                }, 300)
                state.player.lifes -= 1

                state.player.invincible = true
                setTimeout(() => {
                    state.player.invincible = false
                }, 500)

                if (state.player.lifes === 0) {
                    state.player.alive = false

                    setTimeout(() => {
                        state.playing = false
                        gameOver(state.score)
                    }, 1500)
                }
            }

            if (
                bullet.x + bullet.radius < 0 ||
                bullet.x - bullet.radius > CANVAS_WIDTH ||
                bullet.y - bullet.radius < 0 ||
                bullet.y + bullet.radius > CANVAS_HEIGHT
            ) {
                bullet.active = false
            }

            if (bullet.y + bullet.radius > FLOOR) {
                bombHitGround.play()
                state.explosions.push(createExplosion(bullet))
                bullet.active = false
            }
        }

        if (!state.plane.active && state.planeSpawnRate.hasPassed()) {
            state.plane.active = true

            const spawnRight = state.previousPlaneSpawn <= 0
            state.plane.x = spawnRight
                ? CANVAS_WIDTH + state.plane.radius
                : -state.plane.radius
            state.plane.vx = spawnRight
                ? -state.player.speed
                : state.player.speed
            state.plane.scaleX = spawnRight ? -1 : 1

            state.previousPlaneSpawn = state.plane.x
        }

        if (state.plane.active) {
            updateAirplane(state.plane)
            if (state.player.alive) {
                makePlaneShoot(state.plane, state)
            }
            renderAirplane(game, state.plane)

            if (
                state.plane.x - state.plane.radius > CANVAS_WIDTH ||
                state.plane.x + state.plane.radius < 0
            ) {
                state.plane.active = false
                state.planeSpawnRate = new Duration(PLANE_SPAWN_TIME)
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
                updateExplosion(effects, explosion)
            }
        }
        state.bullets = state.bullets.filter((b) => b.active)
    }

    if (state.shake) {
        postShake(game)
    }
}

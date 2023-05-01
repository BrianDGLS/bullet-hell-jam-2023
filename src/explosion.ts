import { Context, Vec2 } from "./types"

export const createExplosion = ({ x, y }: Vec2) => ({
    x,
    y,
    vx: 0,
    vy: 0,
    alpha: 1,
    count: 8,
    radius: 1,
    embers: [],
    color: "red",
    ended: false,
    emberRadius: 3,
})

export type Ember = {
    x: number
    y: number
    alpha: number
    vx: number
    vy: number
    radius: number
}

export const generateEmbers = (e) => {
    const res: Ember[] = []
    const embers = e.count
    const radius = e.radius

    for (let i = 0; i < embers; ++i) {
        const ember = {
            x: e.x,
            y: e.y,
            alpha: 1,
            vx: radius * Math.cos((Math.PI * 2 * i) / embers),
            vy: radius * Math.sin((Math.PI * 2 * i) / embers),
            radius: e.emberRadius,
        }

        res.push(ember)
    }
    return res
}
export const updateExplosion = (ctx: Context, e) => {
    if (!e.embers.length) {
        e.embers = generateEmbers(e)
    }

    e.embers.map((m) => {
        m.x += m.vx
        m.y += m.vy

        ctx.save()
        ctx.translate(m.x, m.y)
        ctx.strokeStyle = `hsla(0,80%,80%,${e.alpha})`
        ctx.beginPath()
        ctx.arc(0, 0, m.radius, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
    })

    if (e.alpha) {
        e.alpha -= 0.03
        if (e.alpha < 0) {
            e.ended = true
        }
    }
}
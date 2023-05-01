import { Vec2 } from "./types"

export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min) // The maximum is exclusive and the minimum is inclusive
}

export const choose = (a: any, b: any) => Math.random() > .5 ? a : b

export const sample = <T>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)]

export const isEven = (n: number) => n % 2 === 0

export const hsla = (h: number, s = 100, l = 100, a = 1) =>
    `hsla(${h}, ${s}%, ${l}%, ${a})`

export function moveTowards(origin: Vec2, target: Vec2, speed: number): Vec2 {
    const toVectorX = target.x - origin.x
    const toVectorY = target.y - origin.y

    const sqDist = toVectorX * toVectorX + toVectorY * toVectorY

    if (sqDist == 0 || (speed >= 0 && sqDist <= speed * speed)) {
        return target
    }

    const dist = Math.sqrt(sqDist)

    return {
        x: origin.x + (toVectorX / dist) * speed,
        y: origin.y + (toVectorY / dist) * speed,
    }
}

import { Circle, Vec2 } from "./types"

export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min) // The maximum is exclusive and the minimum is inclusive
}

export function clamp(n: number, min: number, max: number): number {
    return Math.min(Math.max(n, min), max)
}

export const choose = (a: any, b: any) => (Math.random() > 0.5 ? a : b)

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

export function circlesIntersect(a: Circle, b: Circle): boolean {
    // get distance between the circle's centers
    // use the Pythagorean Theorem to compute the distance
    const distX = a.x - b.x
    const distY = a.y - b.y
    const distance = Math.sqrt(distX * distX + distY * distY)

    // if the distance is less than the sum of the circle's
    // radii, the circles are touching!
    return distance <= a.radius + b.radius
}

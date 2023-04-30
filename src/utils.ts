export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min) // The maximum is exclusive and the minimum is inclusive
}

export const sample = <T>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)]

export const isEven = (n: number) => n % 2 === 0

export const hsla = (h: number, s = 100, l = 100, a = 1) =>
    `hsla(${h}, ${s}%, ${l}%, ${a})`

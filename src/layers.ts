const canvas = (id: string) => window[id] as HTMLCanvasElement
const context = (canvas: HTMLCanvasElement) =>
    canvas.getContext("2d") as CanvasRenderingContext2D

export const layers: { [key: string]: CanvasRenderingContext2D } = {
    ui: context(canvas("ui")),
    bg: context(canvas("bg")),
    game: context(canvas("game")),
    effects: context(canvas("effects")),
    offscreen: context(canvas("offscreen")),
}

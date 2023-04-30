const PRESSED_KEYS = {}

export const isKeyDown = (key) => PRESSED_KEYS[key]
const onKeyUp = ({ which }) => delete PRESSED_KEYS[which]
const onKeyDown = ({ which }) => (PRESSED_KEYS[which] = true)

window.addEventListener("keyup", onKeyUp)
window.addEventListener("keydown", onKeyDown)

export const KEYS = {
    A: 65,
    W: 87,
    S: 83,
    D: 68,
    UP: 38,
    LEFT: 37,
    DOWN: 40,
    RIGHT: 39,
}

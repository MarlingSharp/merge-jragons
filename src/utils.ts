import * as p5 from "p5";

export function isWithinRadius(a: p5.Vector, b: p5.Vector, range: number) {
    return p5.Vector.sub(a, b).mag() < range;
}
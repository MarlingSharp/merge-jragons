import * as p5 from 'p5';
import { isWithinRadius } from './utils';

const BASIC_RADIUS = 30;

export interface ShapeConfig {
    baseRotationSpeed: number;
    nearMouseRadius: number;
    nearMouseRotationSpeed: number;
}

class Shape {
    s: p5;
    position: p5.Vector;
    colour: string;
    level: number;
    sides: number;
    radius: number;
    phase: number;
    rotationSpeed: number;
    grabbed: boolean;
    config: ShapeConfig;

    constructor(s: p5, config: ShapeConfig, position: p5.Vector, colour: string, level: number, sides: number) {
        this.s = s;
        this.position = position;
        this.colour = colour;
        this.level = level;
        this.sides = sides;
        this.radius = this.level * BASIC_RADIUS;
        this.rotationSpeed = config.baseRotationSpeed;
        this.phase = 0;
        this.config = config;
        this.grabbed = false;
    }

    mousePressed(mousePos: p5.Vector) {
        if (isWithinRadius(mousePos, this.position, this.radius)) {
            this.grabbed = true;
        }
    }

    mouseReleased(allShapes: Shape[]) {
        if (this.grabbed) {

        }
        this.grabbed = false;
    }

    update(mousePos: p5.Vector) {
        if (!!mousePos) {
            if (isWithinRadius(mousePos, this.position, this.config.nearMouseRadius)) {
                this.rotationSpeed = this.s.map(0.9, 0, 1, this.rotationSpeed, this.config.nearMouseRotationSpeed);
            }
        }

        this.phase += this.rotationSpeed;

        if (this.grabbed) {
            this.position = mousePos;
        }

        // Rotation speed shoul approach base
        this.rotationSpeed = this.s.map(0.97, 0, 1, this.config.baseRotationSpeed, this.rotationSpeed)
    }

    draw() {
        this.s.push();
        this.s.translate(this.position.x, this.position.y);
        this.s.rotate(this.phase);

        this.s.fill(this.colour);
        this.s.beginShape();
        for (let i = 0; i < this.sides; i++) {
            const angle = this.s.TWO_PI * i / this.sides;
            const x = this.radius * this.s.sin(angle);
            const y = this.radius * this.s.cos(angle);
            this.s.vertex(x, y);
        }
        this.s.endShape(this.s.CLOSE);

        this.s.pop();
    }
}

export default Shape;
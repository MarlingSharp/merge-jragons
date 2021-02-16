import * as p5 from 'p5';
import { isWithinRadius } from './utils';

const BASIC_RADIUS = 30;

export interface ShapeConfig {
    s: p5,
    position: p5.Vector;
    colour: string;
    level: number;
    sides: number;
    baseRotationSpeed: number;
    nearMouseRadius: number;
    nearMouseRotationSpeed: number;
}

class Shape {
    s: p5;
    position: p5.Vector;
    velocity: p5.Vector;
    acceleration: p5.Vector;
    colour: string;
    level: number;
    sides: number;
    radius: number;
    phase: number;
    rotationSpeed: number;
    baseRotationSpeed: number;
    nearMouseRadius: number;
    nearMouseRotationSpeed: number;
    grabbed: boolean;
    merged: boolean;
    potentialMerges: Shape[];

    constructor({ s, position, colour, level, sides, baseRotationSpeed, nearMouseRadius, nearMouseRotationSpeed }: ShapeConfig) {
        this.s = s;
        this.position = position;
        this.velocity = s.createVector(0, 0);
        this.acceleration = s.createVector(0, 0);
        this.colour = colour;
        this.level = level;
        this.sides = sides;
        this.radius = BASIC_RADIUS;
        this.rotationSpeed = baseRotationSpeed;
        this.nearMouseRadius = nearMouseRadius;
        this.nearMouseRotationSpeed = nearMouseRotationSpeed;
        this.phase = 0;
        this.grabbed = false;
        this.merged = false;
    }

    canMergeWith(other: Shape): boolean {
        return this.sides === other.sides // Same number of sides
            && this.level === other.level // At the same level
            && !this.merged // Only those that haven't been merged
            && !other.merged
            && isWithinRadius(this.position, other.position, 3 * this.radius)// are within radius
    }

    flee(other: p5.Vector) {
        let diff = p5.Vector.sub(this.position, other);
        if (diff.mag() === 0) {
            let rand = this.s.createVector(this.s.random(-0.1, 0.1), this.s.random(-0.1, 0.1));
            this.acceleration.add(rand);
        } else if (diff.mag() < this.radius) {
            diff.normalize();
            diff.mult(0.1);
            this.acceleration.add(diff);
        }
    }

    mousePressed(mousePos: p5.Vector) {
        if (isWithinRadius(mousePos, this.position, this.radius)) {
            this.grabbed = true;
        }
    }

    mouseReleased() {
        this.grabbed = false;
    }

    update(mousePos: p5.Vector, others: Shape[]) {
        if (!!mousePos) {
            if (isWithinRadius(mousePos, this.position, this.nearMouseRadius)) {
                this.rotationSpeed = this.s.map(0.9, 0, 1, this.rotationSpeed, this.nearMouseRotationSpeed);
            }
        }

        this.potentialMerges = others.filter(s2 => this.canMergeWith(s2)).filter((_, i) => i < 2);
        this.phase += this.rotationSpeed;
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        this.velocity.mult(0.9);
        this.acceleration.mult(0);

        if (this.grabbed) {
            this.position = mousePos;
        }

        // Rotation speed shoul approach base
        this.rotationSpeed = this.s.map(0.97, 0, 1, this.baseRotationSpeed, this.rotationSpeed)
    }

    draw() {
        this.s.push();
        this.s.translate(this.position.x, this.position.y);
        this.s.rotate(this.phase);


        this.s.fill(this.colour);
        for (let v = 0; v < this.level; v++) {
            this.s.beginShape();
            for (let i = 0; i < this.sides; i++) {
                const angle = this.s.TWO_PI * i / this.sides;
                const x = this.radius / (v + 1) * this.s.sin(angle);
                const y = this.radius / (v + 1) * this.s.cos(angle);
                this.s.vertex(x, y);
            }
            this.s.endShape(this.s.CLOSE);
        }

        this.s.pop();

        // Draw potential merge lines
        this.s.strokeWeight(3);
        this.s.stroke('gold');
        this.potentialMerges.forEach(other => {
            this.s.line(this.position.x, this.position.y, other.position.x, other.position.y);
        });
    }
}

export default Shape;
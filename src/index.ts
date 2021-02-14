import * as p5 from 'p5';
import Shape, { ShapeConfig } from './Shape';

import './style.css'

const COLOURS = ['red', 'green', 'blue', 'orange', 'yellow', 'indigo', 'violet']

function getRandomColour() {
    return COLOURS[Math.floor(COLOURS.length * Math.random())];
}

var w = window.innerWidth;
var h = window.innerHeight;

let sketch = function (p: p5) {
    const ROWS = 7;
    const COLS = 7;
    let mousePos: p5.Vector;

    let shapeConfig: ShapeConfig;

    let shapes: Shape[] = [];

    p.setup = function () {
        p.createCanvas(w, h);

        shapeConfig = {
            baseRotationSpeed: p.TWO_PI * 0.001,
            nearMouseRotationSpeed: p.TWO_PI * 0.008,
            nearMouseRadius: 50
        }

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const position = p.createVector((0.5 + r) * p.width / ROWS,
                    (0.5 + c) * p.height / COLS);
                const sides = p.floor(p.random(3, 6));
                const shape = new Shape(p, shapeConfig, position, getRandomColour(), 1, sides);
                shapes.push(shape);
            }
        }
    };

    p.draw = function () {
        p.background(0);

        // Shapes should avoid each other
        shapes.forEach(s1 => {
            shapes.filter(s2 => s2 !== s1).forEach(s2 => s1.flee(s2.position));
        })

        shapes.forEach(s => s.update(mousePos));
        shapes.forEach(s => s.draw());
    };

    p.mousePressed = function () {
        mousePos = p.createVector(p.mouseX, p.mouseY);
        shapes.forEach(s => s.mousePressed(mousePos))
    }

    // called at the beginning of a touch event
    // here I'm using it to track beginning and end of touches
    p.touchStarted = function () {
        mousePos = p.createVector(p.mouseX, p.mouseY);
        shapes.forEach(s => s.mousePressed(mousePos))
        return false;
    }

    // called whenever a touch is moving (like mouseMoved())
    p.touchMoved = function () {
        handleMouseAndTouch();
        return false;
    }

    // use same functionality if no touch and only mouse
    p.mouseMoved = function () {
        handleMouseAndTouch();
    }

    // this gets called from mouseMoved and touchMoved
    // so that this happens either way (I made up this function--
    // it's not from p5)
    function handleMouseAndTouch() {
        mousePos = p.createVector(p.mouseX, p.mouseY);
    }

    // called whenever a touch event ends. 
    // I test touches.length to make sure *all*
    // touches are done before changing values
    p.touchEnded = function () {
        if (p.touches.length == 0) {
            let newShapes: Shape[] = [];

            shapes.filter(s1 => s1.grabbed).forEach(s1 => {
                let others = shapes
                    .filter(s2 => s2 !== s1)
                    .filter(s2 => s1.canMergeWith(s2))
                    .filter((_, i) => i < 2); // Only first two

                if (others.length === 2) {
                    others.forEach(other => {
                        other.merged = true;
                    });
                    let newShape: Shape = new Shape(p, shapeConfig, s1.position, getRandomColour(), s1.level + 1, s1.sides);
                    newShapes.push(newShape);
                    s1.merged = true;
                }
            });
            newShapes.forEach(s => shapes.push(s));
            shapes = shapes.filter(s => !s.merged);

            shapes.forEach(s => s.mouseReleased());
        }

    }
};

let myp5 = new p5(sketch);
const canvas = document.getElementById('lienzo');
const ctx = canvas.getContext('2d');

let ventana = { xMin: 100, yMin: 100, xMax: 400, yMax: 300 };

const lineas = [
    { x0: 150, y0: 150, x1: 350, y1: 250 },
    { x0: 50,  y0: 150, x1: 200, y1: 150 },
    { x0: 200, y0: 50,  x1: 250, y1: 350 },
    { x0: 10,  y0: 10,  x1: 80,  y1: 80 },
    { x0: 50,  y0: 50,  x1: 450, y1: 350 }
];

let escenaActual = 0;
// Funciones de dibujo 
function dibujarViewport(v) {
    ctx.strokeStyle = 'blue';
    ctx.strokeRect(v.xMin, v.yMin, v.xMax - v.xMin, v.yMax - v.yMin);
}

function dibujarLinea(x0, y0, x1, y1, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
}
const DENTRO = 0, IZQUIERDA = 1, DERECHA = 2, ABAJO = 4, ARRIBA = 8;

function obtenerCodigo(x, y, v) {
    let codigo = DENTRO;
    if (x < v.xMin) codigo |= IZQUIERDA;
    else if (x > v.xMax) codigo |= DERECHA;
    if (y < v.yMin) codigo |= ABAJO;
    else if (y > v.yMax) codigo |= ARRIBA;
    return codigo;
}
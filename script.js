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
function cohenSutherland(x0, y0, x1, y1, v) {
    let c0 = obtenerCodigo(x0, y0, v);
    let c1 = obtenerCodigo(x1, y1, v);
    let aceptada = false;

    while (true) {
        if (!(c0 | c1)) {
            aceptada = true; break;
        } else if (c0 & c1) {
            break;
        } else {
            let x, y;
            let cFuera = c0 ? c0 : c1;
            if (cFuera & ARRIBA) {
                x = x0 + (x1 - x0) * (v.yMax - y0) / (y1 - y0);
                y = v.yMax;
            } else if (cFuera & ABAJO) {
                x = x0 + (x1 - x0) * (v.yMin - y0) / (y1 - y0);
                y = v.yMin;
            } else if (cFuera & DERECHA) {
                y = y0 + (y1 - y0) * (v.xMax - x0) / (x1 - x0);
                x = v.xMax;
            } else if (cFuera & IZQUIERDA) {
                y = y0 + (y1 - y0) * (v.xMin - x0) / (x1 - x0);
                x = v.xMin;
            }
            if (cFuera === c0) { x0 = x; y0 = y; c0 = obtenerCodigo(x0, y0, v); }
            else { x1 = x; y1 = y; c1 = obtenerCodigo(x1, y1, v); }
        }
    }
    return aceptada ? { x0, y0, x1, y1 } : null;
}
function renderizar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dibujarViewport(ventana);
    document.getElementById('txtEscena').innerText = `Escena: ${escenaActual + 1} de 5`;

    lineas.forEach(l => {
        if (escenaActual === 0) dibujarLinea(l.x0, l.y0, l.x1, l.y1, 'gray');
        else {
            let recortada = cohenSutherland(l.x0, l.y0, l.x1, l.y1, ventana);
            if (recortada) dibujarLinea(recortada.x0, recortada.y0, recortada.x1, recortada.y1, 'red');
        }
    });
}
document.getElementById('btnSiguiente').onclick = () => { escenaActual = (escenaActual + 1) % 5; renderizar(); };
document.getElementById('btnAnterior').onclick = () => { escenaActual = (escenaActual - 1 + 5) % 5; renderizar(); };
document.getElementById('btnActualizar').onclick = () => {
    ventana.xMin = parseInt(document.getElementById('x1').value);
    ventana.yMin = parseInt(document.getElementById('y1').value);
    ventana.xMax = parseInt(document.getElementById('x2').value);
    ventana.yMax = parseInt(document.getElementById('y2').value);
    renderizar();
};

renderizar(); // Iniciar la aplicación
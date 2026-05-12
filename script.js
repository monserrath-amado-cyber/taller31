//Rerefencias al DOM
const canvas = document.getElementById('lienzo');
const ctx = canvas.getContext('2d');
const txtEscena = document.getElementById('txtEscena');
const p1Coord = document.getElementById('p1-coord');
const p2Coord = document.getElementById('p2-coord');
const pc1Coord = document.getElementById('pc1-coord');
const pc2Coord = document.getElementById('pc2-coord');
const inputX1 = document.getElementById('x1');
const inputY1 = document.getElementById('y1');
const inputX2 = document.getElementById('x2');
const inputY2 = document.getElementById('y2');

const TOTAL_ESCENAS = 5;

// COLORES
const COLOR_LINEA = "gray";
const COLOR_RECORTE = "red";
const COLOR_VENTANA = "blue";


let ventana = { xMin: 100, yMin: 100, xMax: 400, yMax: 300 };

const lineas = [
    { x0: 150, y0: 150, x1: 350, y1: 250 },
    { x0: 50, y0: 150, x1: 200, y1: 150 },
    { x0: 200, y0: 50, x1: 250, y1: 350 },
    { x0: 10, y0: 10, x1: 80, y1: 80 },
    { x0: 50, y0: 50, x1: 450, y1: 350 }
];

let escenaActual = 0;
// Funciones de dibujo 
function dibujarViewport(v) {
    ctx.strokeStyle = COLOR_VENTANA;
    ctx.strokeRect(v.xMin, v.yMin, v.xMax - v.xMin, v.yMax - v.yMin);
}

function dibujarLinea(x0, y0, x1, y1, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
}

//
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

    // Actualizar texto de escena
    txtEscena.innerText = `Escena: ${escenaActual + 1} de ${TOTAL_ESCENAS}`;

    if (escenaActual === 0) {
        // Escena 1: Mostrar todas las líneas originales
        lineas.forEach(l => dibujarLinea(l.x0, l.y0, l.x1, l.y1, COLOR_LINEA));
        limpiarInfo();
    } else {
        // Escenas 2-TOTAL_ESCENAS: Mostrar una línea específica y sus datos
        let l = lineas[escenaActual - 1]; // Seleccionamos la línea según la escena

        // Dibujamos la original en gris para referencia
        dibujarLinea(l.x0, l.y0, l.x1, l.y1, COLOR_LINEA);

        let recortada = cohenSutherland(l.x0, l.y0, l.x1, l.y1, ventana);

        // Mostrar coordenadas originales
        p1Coord.innerText = `(${l.x0}, ${l.y0})`;
        p2Coord.innerText = `(${l.x1}, ${l.y1})`;

        if (recortada) {
            dibujarLinea(recortada.x0, recortada.y0, recortada.x1, recortada.y1, COLOR_RECORTE);
            // Mostrar coordenadas de recorte
            pc1Coord.innerText = `(${Math.round(recortada.x0)}, ${Math.round(recortada.y0)})`;
            pc2Coord.innerText = `(${Math.round(recortada.x1)}, ${Math.round(recortada.y1)})`;
        } else {
            pc1Coord.innerText = "Fuera de rango";
            pc2Coord.innerText = "Fuera de rango";
        }
    }
}

function limpiarInfo() {
    p1Coord.innerText = "--";
    p2Coord.innerText = "--";
    pc1Coord.innerText = "--";
    pc2Coord.innerText = "--";
}

//No se necesitan cachear los botones porque sólo se hace referencia a ellos 1 sola vez al asignar el evento
document.getElementById('btnSiguiente').onclick = () => { escenaActual = (escenaActual + 1) % TOTAL_ESCENAS; renderizar(); };
document.getElementById('btnAnterior').onclick = () => { escenaActual = (escenaActual - 1 + TOTAL_ESCENAS) % TOTAL_ESCENAS; renderizar(); };

document.getElementById('btnActualizar').onclick = () => {
    ventana.xMin = parseInt(inputX1.value);
    ventana.yMin = parseInt(inputY1.value);
    ventana.xMax = parseInt(inputX2.value);
    ventana.yMax = parseInt(inputY2.value);
    renderizar();
};

renderizar(); // Iniciar la aplicación
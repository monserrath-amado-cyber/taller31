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
function dibujarViewport(ventanaRecorte) {
    ctx.strokeStyle = COLOR_VENTANA;
    ctx.strokeRect(ventanaRecorte.xMin, ventanaRecorte.yMin, ventanaRecorte.xMax - ventanaRecorte.xMin, ventanaRecorte.yMax - ventanaRecorte.yMin);
}

function dibujarLinea(x0, y0, x1, y1, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
}

//
class CohenSutherlandClipper {
    static DENTRO = 0;
    static IZQUIERDA = 1;
    static DERECHA = 2;
    static ABAJO = 4;
    static ARRIBA = 8;

    constructor(ventana) {
        this.ventana = ventana;
    }

    obtenerCodigo(x, y) {
        let codigo = CohenSutherlandClipper.DENTRO;
        if (x < this.ventana.xMin) codigo |= CohenSutherlandClipper.IZQUIERDA;
        else if (x > this.ventana.xMax) codigo |= CohenSutherlandClipper.DERECHA;
        if (y < this.ventana.yMin) codigo |= CohenSutherlandClipper.ABAJO;
        else if (y > this.ventana.yMax) codigo |= CohenSutherlandClipper.ARRIBA;
        return codigo;
    }

    recortar(x0, y0, x1, y1) {
        let codigoInicio = this.obtenerCodigo(x0, y0);
        let codigoFin = this.obtenerCodigo(x1, y1);
        let aceptada = false;

        while (true) {
            if (!(codigoInicio | codigoFin)) {
                aceptada = true;
                break;
            } else if (codigoInicio & codigoFin) {
                break;
            } else {
                let x, y;
                let cFuera = codigoInicio ? codigoInicio : codigoFin;
                if (cFuera & CohenSutherlandClipper.ARRIBA) {
                    x = x0 + (x1 - x0) * (this.ventana.yMax - y0) / (y1 - y0);
                    y = this.ventana.yMax;
                } else if (cFuera & CohenSutherlandClipper.ABAJO) {
                    x = x0 + (x1 - x0) * (this.ventana.yMin - y0) / (y1 - y0);
                    y = this.ventana.yMin;
                } else if (cFuera & CohenSutherlandClipper.DERECHA) {
                    y = y0 + (y1 - y0) * (this.ventana.xMax - x0) / (x1 - x0);
                    x = this.ventana.xMax;
                } else if (cFuera & CohenSutherlandClipper.IZQUIERDA) {
                    y = y0 + (y1 - y0) * (this.ventana.xMin - x0) / (x1 - x0);
                    x = this.ventana.xMin;
                }

                if (cFuera === codigoInicio) {
                    x0 = x;
                    y0 = y;
                    codigoInicio = this.obtenerCodigo(x0, y0);
                } else {
                    x1 = x;
                    y1 = y;
                    codigoFin = this.obtenerCodigo(x1, y1);
                }
            }
        }
        return aceptada ? { x0, y0, x1, y1 } : null;
    }
}

// Logica del recorte
function obtenerDatosEscena() {
    if (escenaActual === 0) return { lineasOriginales: lineas };

    const lineaOriginal = lineas[escenaActual - 1];
    const clipper = new CohenSutherlandClipper(ventana);
    const lineaRecortada = clipper.recortar(lineaOriginal.x0, lineaOriginal.y0, lineaOriginal.x1, lineaOriginal.y1);

    return { lineaOriginal, lineaRecortada };
}

// Dibujar
function actualizarCanvas(datos) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dibujarViewport(ventana);

    if (escenaActual === 0) {
        datos.lineasOriginales.forEach(linea =>
            dibujarLinea(linea.x0, linea.y0, linea.x1, linea.y1, COLOR_LINEA)
        );
    } else {
        const { lineaOriginal, lineaRecortada } = datos;
        dibujarLinea(lineaOriginal.x0, lineaOriginal.y0, lineaOriginal.x1, lineaOriginal.y1, COLOR_LINEA);

        if (lineaRecortada) {
            dibujarLinea(lineaRecortada.x0, lineaRecortada.y0, lineaRecortada.x1, lineaRecortada.y1, COLOR_RECORTE);
        }
    }
}

// Actualizar la UI (HTML)
function actualizarUI(datos) {
    txtEscena.innerText = `Escena: ${escenaActual + 1} de ${TOTAL_ESCENAS}`;

    if (escenaActual === 0) {
        limpiarInfo();
    } else {
        const { lineaOriginal, lineaRecortada } = datos;
        p1Coord.innerText = `(${lineaOriginal.x0}, ${lineaOriginal.y0})`;
        p2Coord.innerText = `(${lineaOriginal.x1}, ${lineaOriginal.y1})`;

        if (lineaRecortada) {
            pc1Coord.innerText = `(${Math.round(lineaRecortada.x0)}, ${Math.round(lineaRecortada.y0)})`;
            pc2Coord.innerText = `(${Math.round(lineaRecortada.x1)}, ${Math.round(lineaRecortada.y1)})`;
        } else {
            pc1Coord.innerText = "Fuera de rango";
            pc2Coord.innerText = "Fuera de rango";
        }
    }
}

function renderizar() {
    const datos = obtenerDatosEscena();
    actualizarCanvas(datos);
    actualizarUI(datos);
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

    if (ventana.xMin >= ventana.xMax) {
        alert("x1 debe ser menor que x2");
        return;
    }

    if (ventana.yMin >= ventana.yMax) {
        alert("y1 debe ser menor que y2");
        return;
    }

    renderizar();
};

renderizar(); // Iniciar la aplicación
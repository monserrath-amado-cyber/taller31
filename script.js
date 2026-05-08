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

let modoDetalle = false;
let columnaSeleccionada = -1;
let filaSeleccionada = -1;

// Variables para la animación
let enAnimacion = false;
let animacionReversa = false;
let progresoAnimacion = 0;
let animVelocidad = 0.05; 
let figuraStart = { x: 0, y: 0, size: 0 }; 
let figuraTarget = { x: 0, y: 0, size: 0 }; 

// Variables de centrado de la grilla
let gridAncho = 620; 
let gridAlto = 620;
let gridX, gridY; 

// --- VARIABLE DE ZOOM PARA EL TRIÁNGULO ESPECÍFICO ---
let trianguloZoomFactor = 1.0;
let initialPinchDist = null;

// --- VARIABLES PARA SIMÓN DICE ---
let simonActivo = false;
let simonEstado = 'INACTIVO';
let simonSecuencia = [];
let simonPaso = 0;
let simonTiempo = 0;
let simonIndiceMostrar = 0;
let simonFaseIluminacion = 'APAGADO';
let simonIluminado = -1;
let simonCirculosAbsolutos = []; 

// --- VARIABLES PARA JUEGO DE TRANSFERENCIA ---
let transferenciaActivo = false;
let transferenciaCirculos = [];
let transferenciaCirculosAbsolutos = [];

// --- VARIABLES PARA JUEGO DESVANECER (Segunda columna, tercer fila) ---
let desvanecerActivo = false;
let desvanecerCirculos = [];
let desvanecerCirculosAbsolutos = [];

// --- VARIABLES PARA JUEGO ARRASTRE CUADRADOS (Primera columna, primera fila) ---
let dragActivo = false;
let cSquares = [];
let squareDragging = null;
let offsetXDrag = 0;
let offsetYDrag = 0;

// --- VARIABLES PARA JUEGO ARRASTRE CUADRADOS 3 (Tercer columna, primera fila) ---
let dragActivo3 = false;
let cSquares3 = [];
let squareDragging3 = null;
let offsetXDrag3 = 0;
let offsetYDrag3 = 0;

// --- VARIABLES PARA JUEGO ARRASTRE CUADRADOS 2 (Segunda columna, segunda fila) ---
let dragActivo2 = false;
let cSquares2 = [];
let squareDragging2 = null;
let offsetXDrag2 = 0;
let offsetYDrag2 = 0;

// Gradientes solicitados (Color 1 al Color 2)
let grads = [
  { c1: '#FE8616', c2: '#FFBB7B' }, // Naranja (0)
  { c1: '#FF218B', c2: '#F293C1' }, // Rosa (1)
  { c1: '#BDF522', c2: '#E9FFAC' }  // Verde/Amarillo (2)
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  
  gridX = (width - gridAncho) / 2;
  gridY = (height - gridAlto) / 2;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  gridX = (width - gridAncho) / 2;
  gridY = (height - gridAlto) / 2;
}

function draw() {
  background('#ffffff'); 

  if (!modoDetalle && !enAnimacion && !animacionReversa) {
    dibujarGrilla();
  } else {
    dibujarAnimacionODetalle();
  }
}

function dibujarGrilla() {
  let anchoCelda = gridAncho / 3;
  let altoCelda = gridAlto / 3;

  noStroke(); 

  for (let col = 0; col < 3; col++) {
    for (let fila = 0; fila < 3; fila++) {
      let centroX = gridX + col * anchoCelda + anchoCelda / 2;
      let centroY = gridY + fila * altoCelda + altoCelda / 2;
      
      let tamano = min(anchoCelda, altoCelda) * 0.75; 

      dibujarFigura(col, fila, centroX, centroY, tamano);
    }
  }
}

function dibujarFigura(col, fila, x, y, tamano) {
  fill(255);
  fill(0);

  // Matriz de disposición
  // 0: Cuadrado, 1: Círculo, 2: Triángulo
  let layout = [
    [0, 2, 0], 
    [1, 0, 1], 
    [2, 1, 2]  
  ];
  
  let tipo = layout[fila][col];

  if (tipo === 0) {
    if (modoDetalle && !enAnimacion && !animacionReversa && col === 0 && fila === 0) {
      dibujarJuegoCuadradosDrag(x, y, tamano);
    } else if (modoDetalle && !enAnimacion && !animacionReversa && col === 2 && fila === 0) {
      dibujarJuegoCuadradosDrag3(x, y, tamano);
    } else if (modoDetalle && !enAnimacion && !animacionReversa && col === 1 && fila === 1) {
      dibujarJuegoCuadradosDrag2(x, y, tamano);
    } else {
      dibujarCuadradosInternos(x, y, tamano);
    }
  } else if (tipo === 1) {
    if (modoDetalle && !enAnimacion && !animacionReversa && col === 0 && fila === 1) {
      dibujarCirculoCompleto(col, fila, x, y, tamano, true);
    } else if (modoDetalle && !enAnimacion && !animacionReversa && col === 2 && fila === 1) {
      dibujarJuegoTransferencia(x, y, tamano); 
    } else if (modoDetalle && !enAnimacion && !animacionReversa && col === 1 && fila === 2) {
      dibujarJuegoDesvanecer(col, fila, x, y, tamano); 
    } else {
      dibujarCirculoCompleto(col, fila, x, y, tamano, false);
    }
  } else if (tipo === 2) {
    // Aplicar factor de zoom solo si está en modo detalle y es el triángulo de la segunda columna, primer fila (col === 1, fila === 0)
    let factorActual = 1.0;
    if (modoDetalle && !enAnimacion && !animacionReversa && col === 1 && fila === 0) {
      factorActual = trianguloZoomFactor;
    }

    let r = (tamano / 1.6) * factorActual;
    let offsetY = (tamano * 0.15) * factorActual; 
    let baseY = y + offsetY; 
    
    // Triángulo grande negro
    fill(0);
    triangle(
      x, baseY - r,                    
      x + r * 0.866, baseY + r * 0.5,  
      x - r * 0.866, baseY + r * 0.5   
    );

    // Vértices del triángulo contenedor grande
    let vArribaX = x;
    let vArribaY = baseY - r;
    let vIzqX = x - r * 0.866;
    let vIzqY = baseY + r * 0.5;
    let vDerX = x + r * 0.866;
    let vDerY = baseY + r * 0.5;

    // Tamaño reducido para asegurar que no sobresalgan
    let ladoPequeno = r * 0.35; 
    let hPequeno = ladoPequeno * 0.866; 

    // 1. Triángulo superior (Verde/Amarillo: índice 2)
    let centroArribaX = vArribaX;
    let centroArribaY = vArribaY + hPequeno * 2;
    dibujarTrianguloEquilatero(centroArribaX, centroArribaY, ladoPequeno, 2);

    // 2. Triángulo inferior izquierdo (Rosa: índice 1) - Desplazado hacia arriba y derecha
    let centroIzqX = vIzqX + ladoPequeno * 1.5;
    let centroIzqY = vIzqY - hPequeno * 1;
    dibujarTrianguloEquilatero(centroIzqX, centroIzqY, ladoPequeno, 1);

    // 3. Triángulo inferior derecho (Naranja: índice 0) - Desplazado hacia arriba e izquierda
    let centroDerX = vDerX - ladoPequeno * 1.5;
    let centroDerY = vDerY - hPequeno * 1;
    dibujarTrianguloEquilatero(centroDerX, centroDerY, ladoPequeno, 0);
  }
}

// Función auxiliar para dibujar un triángulo estrictamente equilátero con gradiente
function dibujarTrianguloEquilatero(cx, cy, lado, gradIndex) {
  let ctx = drawingContext;
  let h = lado * 0.866; 

  let x1 = cx;
  let y1 = cy - (h * 2/3); 
  let x2 = cx - (lado / 2);
  let y2 = cy + (h * 1/3); 
  let x3 = cx + (lado / 2);
  let y3 = cy + (h * 1/3); 

  let grad = ctx.createLinearGradient(cx, y1, cx, y3);
  let col1 = color(grads[gradIndex].c1);
  let col2 = color(grads[gradIndex].c2);

  grad.addColorStop(0, col1.toString());
  grad.addColorStop(1, col2.toString());

  ctx.beginPath();
  ctx.fillStyle = grad;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
  
  drawingContext.fillStyle = '#000000';
}

function dibujarCuadradosInternos(x, y, tamano) {
  rectMode(CENTER);
  fill(0);
  rect(x, y, tamano, tamano);

  let sSize = tamano * 0.25 * 0.8; 
  let offset = tamano * 0.18;      

  let configs = [
    { dx: -offset, dy: -offset, gradIndex: 2 }, 
    { dx: offset, dy: -offset, gradIndex: 0 },  
    { dx: -offset, dy: offset, gradIndex: 1 },  
    { dx: offset, dy: offset, gradIndex: 2 }   
  ];

  let ctx = drawingContext;

  for (let c of configs) {
    let cx = x + c.dx;
    let cy = y + c.dy;
    let halfS = sSize / 2;

    let grad = ctx.createLinearGradient(cx, cy - halfS, cx, cy + halfS);
    let col1 = color(grads[c.gradIndex].c1);
    let col2 = color(grads[c.gradIndex].c2);

    grad.addColorStop(0, col1.toString());
    grad.addColorStop(1, col2.toString());

    ctx.beginPath();
    ctx.fillStyle = grad;
    ctx.fillRect(cx - halfS, cy - halfS, sSize, sSize);
  }
  
  drawingContext.fillStyle = '#000000';
}

// --- JUEGO DE ARRASTRE DE CUADRADOS (1,1) ---
function iniciarCuadradosDrag(centerX, centerY, tamano) {
  cSquares = [];
  let sSize = tamano * 0.22; 
  let offsetDist = tamano * 0.22;
  
  let configs = [
    { dx: -offsetDist, dy: -offsetDist, gradIndex: 2 }, 
    { dx: offsetDist, dy: -offsetDist, gradIndex: 0 },  
    { dx: -offsetDist, dy: offsetDist, gradIndex: 1 },  
    { dx: offsetDist, dy: offsetDist, gradIndex: 2 }   
  ];

  for (let i = 0; i < 4; i++) {
    cSquares.push({
      id: i,
      x: centerX + configs[i].dx,
      y: centerY + configs[i].dy,
      sSize: sSize,
      gradIndex: configs[i].gradIndex,
      grupo: [i]
    });
  }
}

function dibujarJuegoCuadradosDrag(x, y, tamano) {
  rectMode(CENTER);
  fill(0);
  rect(x, y, tamano, tamano);

  let ctx = drawingContext;
  let processedGroups = new Set();

  for (let sq of cSquares) {
    let leaderId = Math.min(...sq.grupo);
    if (processedGroups.has(leaderId)) continue;
    processedGroups.add(leaderId);

    let groupSquares = cSquares.filter(s => sq.grupo.includes(s.id));
    let gx = sq.x;
    let gy = sq.y;

    for (let idx = 0; idx < groupSquares.length; idx++) {
      let member = groupSquares[idx];
      let currentSize = member.sSize * pow(0.78, idx);
      let halfS = currentSize / 2;

      let grad = ctx.createLinearGradient(gx, gy - halfS, gx, gy + halfS);
      let col1 = color(grads[member.gradIndex].c1);
      let col2 = color(grads[member.gradIndex].c2);

      grad.addColorStop(0, col1.toString());
      grad.addColorStop(1, col2.toString());

      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.fillRect(gx - halfS, gy - halfS, currentSize, currentSize);
    }
  }

  drawingContext.fillStyle = '#000000';
}

// --- JUEGO DE ARRASTRE DE CUADRADOS 3 (Tercer columna, primer fila) ---
function iniciarCuadradosDrag3(centerX, centerY, tamano) {
  cSquares3 = [];
  let sSize = tamano * 0.22; 
  let offsetDist = tamano * 0.22;
  
  let configs = [
    { dx: -offsetDist, dy: -offsetDist, gradIndex: 2 }, 
    { dx: offsetDist, dy: -offsetDist, gradIndex: 0 },  
    { dx: -offsetDist, dy: offsetDist, gradIndex: 1 },  
    { dx: offsetDist, dy: offsetDist, gradIndex: 2 }   
  ];

  for (let i = 0; i < 4; i++) {
    cSquares3.push({
      id: i,
      x: centerX + configs[i].dx,
      y: centerY + configs[i].dy,
      sSize: sSize,
      gradIndex: configs[i].gradIndex,
      grupo: [i]
    });
  }
}

function dibujarJuegoCuadradosDrag3(x, y, tamano) {
  rectMode(CENTER);
  fill(0);
  rect(x, y, tamano, tamano);

  let ctx = drawingContext;
  let processedGroups = new Set();

  for (let sq of cSquares3) {
    let leaderId = Math.min(...sq.grupo);
    if (processedGroups.has(leaderId)) continue;
    processedGroups.add(leaderId);

    let groupSquares = cSquares3.filter(s => sq.grupo.includes(s.id));
    let gx = sq.x;
    let gy = sq.y;

    for (let idx = 0; idx < groupSquares.length; idx++) {
      let member = groupSquares[idx];
      let currentSize = member.sSize;
      let halfS = currentSize / 2;

      let offsetX = 0;
      let offsetY = 0;
      if (groupSquares.length === 2) {
        if (idx === 1) offsetX = currentSize; 
      } else if (groupSquares.length === 3) {
        if (idx === 1) offsetX = currentSize;
        if (idx === 2) { offsetY = currentSize; } 
      } else if (groupSquares.length === 4) {
        if (idx === 1) offsetX = currentSize;
        if (idx === 2) offsetY = currentSize;
        if (idx === 3) { offsetX = currentSize; offsetY = currentSize; } 
      }

      let grad = ctx.createLinearGradient(gx + offsetX, (gy + offsetY) - halfS, gx + offsetX, (gy + offsetY) + halfS);
      let col1 = color(grads[member.gradIndex].c1);
      let col2 = color(grads[member.gradIndex].c2);

      grad.addColorStop(0, col1.toString());
      grad.addColorStop(1, col2.toString());

      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.fillRect((gx + offsetX) - halfS, (gy + offsetY) - halfS, currentSize, currentSize);
    }
  }

  drawingContext.fillStyle = '#000000';
}

// --- JUEGO DE ARRASTRE DE CUADRADOS 2 ---
function iniciarCuadradosDrag2(centerX, centerY, tamano) {
  cSquares2 = [];
  let sSize = tamano * 0.22;
  let offsetDist = tamano * 0.2;
  
  let configs = [
    { dx: -offsetDist, dy: -offsetDist, gradIndex: 2 }, 
    { dx: offsetDist, dy: -offsetDist, gradIndex: 0 },  
    { dx: -offsetDist, dy: offsetDist, gradIndex: 1 },  
    { dx: offsetDist, dy: offsetDist, gradIndex: 2 }   
  ];

  for (let i = 0; i < 4; i++) {
    cSquares2.push({
      id: i,
      x: centerX + configs[i].dx,
      y: centerY + configs[i].dy,
      sSize: sSize,
      gradIndex: configs[i].gradIndex
    });
  }
}

function dibujarJuegoCuadradosDrag2(x, y, tamano) {
  rectMode(CENTER);
  fill(0);
  rect(x, y, tamano, tamano);

  let ctx = drawingContext;

  for (let sq of cSquares2) {
    let halfS = sq.sSize / 2;
    let grad = ctx.createLinearGradient(sq.x, sq.y - halfS, sq.x, sq.y + halfS);
    let col1 = color(grads[sq.gradIndex].c1);
    let col2 = color(grads[sq.gradIndex].c2);

    grad.addColorStop(0, col1.toString());
    grad.addColorStop(1, col2.toString());

    ctx.beginPath();
    ctx.fillStyle = grad;
    ctx.fillRect(sq.x - halfS, sq.y - halfS, sq.sSize, sq.sSize);
  }

  for (let i = 0; i < cSquares2.length; i++) {
    for (let j = i + 1; j < cSquares2.length; j++) {
      let sq1 = cSquares2[i];
      let sq2 = cSquares2[j];

      let half1 = sq1.sSize / 2;
      let half2 = sq2.sSize / 2;
      let left1 = sq1.x - half1, right1 = sq1.x + half1, top1 = sq1.y - half1, bottom1 = sq1.y + half1;
      let left2 = sq2.x - half2, right2 = sq2.x + half2, top2 = sq2.y - half2, bottom2 = sq2.y + half2;

      let intersectLeft = max(left1, left2);
      let intersectRight = min(right1, right2);
      let intersectTop = max(top1, top2);
      let intersectBottom = min(bottom1, bottom2);

      if (intersectLeft < intersectRight && intersectTop < intersectBottom) {
        let grad = ctx.createLinearGradient(intersectLeft, intersectTop, intersectRight, intersectBottom);
        let col1 = color(grads[sq1.gradIndex].c1);
        let col2 = color(grads[sq2.gradIndex].c2);

        grad.addColorStop(0, col1.toString());
        grad.addColorStop(1, col2.toString());

        ctx.beginPath();
        ctx.fillStyle = grad;
        ctx.fillRect(intersectLeft, intersectTop, intersectRight - intersectLeft, intersectBottom - intersectTop);
      }
    }
  }

  drawingContext.fillStyle = '#000000';
}

function seSolapanMasDe10Porciento(sq1, sq2) {
  let half1 = sq1.sSize / 2;
  let half2 = sq2.sSize / 2;
  let xOverlap = max(0, min(sq1.x + half1, sq2.x + half2) - max(sq1.x - half1, sq2.x - half2));
  let yOverlap = max(0, min(sq1.y + half1, sq2.y + half2) - max(sq1.y - half1, sq2.y - half2));
  let intersectionArea = xOverlap * yOverlap;
  let totalArea = sq1.sSize * sq1.sSize;
  return (intersectionArea / totalArea) > 0.10;
}

function dibujarAnimacionODetalle() {
  if (enAnimacion) {
    let currentX = lerp(figuraStart.x, figuraTarget.x, progresoAnimacion);
    let currentY = lerp(figuraStart.y, figuraTarget.y, progresoAnimacion);
    let currentSize = lerp(figuraStart.size, figuraTarget.size, progresoAnimacion);

    dibujarFigura(columnaSeleccionada, filaSeleccionada, currentX, currentY, currentSize);

    progresoAnimacion += animVelocidad;

    if (progresoAnimacion >= 1) {
      progresoAnimacion = 1;
      enAnimacion = false;
      modoDetalle = true;
      
      if (columnaSeleccionada === 0 && filaSeleccionada === 1) {
        simonActivo = true;
        iniciarSimonJuego(millis());
      } else if (columnaSeleccionada === 2 && filaSeleccionada === 1) {
        transferenciaActivo = true;
        iniciarTransferencia(columnaSeleccionada, filaSeleccionada);
      } else if (columnaSeleccionada === 1 && filaSeleccionada === 2) {
        desvanecerActivo = true;
        iniciarDesvanecer();
      } else if (columnaSeleccionada === 0 && filaSeleccionada === 0) {
        dragActivo = true;
        iniciarCuadradosDrag(figuraTarget.x, figuraTarget.y, figuraTarget.size);
      } else if (columnaSeleccionada === 2 && filaSeleccionada === 0) {
        dragActivo3 = true;
        iniciarCuadradosDrag3(figuraTarget.x, figuraTarget.y, figuraTarget.size);
      } else if (columnaSeleccionada === 1 && filaSeleccionada === 1) {
        dragActivo2 = true;
        iniciarCuadradosDrag2(figuraTarget.x, figuraTarget.y, figuraTarget.size);
      }
    }
  } else if (animacionReversa) {
    let currentX = lerp(figuraStart.x, figuraTarget.x, progresoAnimacion);
    let currentY = lerp(figuraStart.y, figuraTarget.y, progresoAnimacion);
    let currentSize = lerp(figuraStart.size, figuraTarget.size, progresoAnimacion);

    dibujarFigura(columnaSeleccionada, filaSeleccionada, currentX, currentY, currentSize);

    progresoAnimacion -= animVelocidad; 

    if (progresoAnimacion <= 0) {
      animacionReversa = false;
      columnaSeleccionada = -1;
      filaSeleccionada = -1;
    }
  } else if (modoDetalle) {
    dibujarFigura(columnaSeleccionada, filaSeleccionada, figuraTarget.x, figuraTarget.y, figuraTarget.size);
    dibujarBotonX();
  }
}

function dibujarJuegoTransferencia(x, y, tamano) {
  fill(255); 
  fill(0);   
  circle(x, y, tamano);
  
  let radioBase = tamano * 0.25; 
  let tamanoCirculito = tamano * 0.28; 
  let angulos = [-90, -18, 54, 126, 198];

  for (let i = 0; i < 5; i++) {
    let cx = x + cos(radians(angulos[i])) * radioBase;
    let cy = y + sin(radians(angulos[i])) * radioBase;
    
    transferenciaCirculosAbsolutos[i] = { x: cx, y: cy, r: tamanoCirculito / 2 };
    
    let ctx = drawingContext;
    let r = tamanoCirculito / 2;
    let grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    
    let circData = transferenciaCirculos[i];
    let color1 = color(grads[circData.currentColorIndex].c1);
    let color2 = color(grads[circData.currentColorIndex].c2);
    
    color1.setAlpha(circData.alpha); 
    color2.setAlpha(circData.alpha); 
    
    grad.addColorStop(0, color1.toString());
    grad.addColorStop(1, color2.toString());
    
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
  
  drawingContext.fillStyle = '#000000';
}

function iniciarTransferencia(col, fila) {
  transferenciaCirculos = [];
  for(let i = 0; i < 5; i++) {
    let colorIndex = (col * 7 + fila * 13 + i * 5) % 3;
    transferenciaCirculos.push({
      currentColorIndex: colorIndex,
      alpha: 255,          
      transferidosA: []    
    });
  }
}

function dibujarJuegoDesvanecer(col, fila, x, y, tamano) {
  fill(255); 
  fill(0);   
  circle(x, y, tamano);
  
  let radioBase = tamano * 0.25; 
  let tamanoCirculito = tamano * 0.28; 
  let angulos = [-90, -18, 54, 126, 198];

  for (let i = 0; i < 5; i++) {
    let cx = x + cos(radians(angulos[i])) * radioBase;
    let cy = y + sin(radians(angulos[i])) * radioBase;
    
    desvanecerCirculosAbsolutos[i] = { x: cx, y: cy, r: tamanoCirculito / 2 };
    
    let ctx = drawingContext;
    let r = tamanoCirculito / 2;
    let grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    
    let colorIndex = (col * 7 + fila * 13 + i * 5) % 3;
    let color1 = color(grads[colorIndex].c1);
    let color2 = color(grads[colorIndex].c2);
    
    let circData = desvanecerCirculos[i];
    color1.setAlpha(circData.alpha); 
    color2.setAlpha(circData.alpha); 
    
    grad.addColorStop(0, color1.toString());
    grad.addColorStop(1, color2.toString());
    
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
  
  drawingContext.fillStyle = '#000000';
}

function iniciarDesvanecer() {
  desvanecerCirculos = [];
  for(let i = 0; i < 5; i++) {
    desvanecerCirculos.push({
      alpha: 255 
    });
  }
}

function dibujarCirculoCompleto(col, fila, x, y, tamano, isSimon) {
  fill(255); 
  fill(0);   
  circle(x, y, tamano);
  
  if (isSimon) actualizarLogicaSimon();

  let radioBase = tamano * 0.25; 
  let tamanoCirculito = tamano * 0.28; 
  let angulos = [-90, -18, 54, 126, 198];

  for (let i = 0; i < 5; i++) {
    let cx = x + cos(radians(angulos[i])) * radioBase;
    let cy = y + sin(radians(angulos[i])) * radioBase;
    
    if (isSimon) {
      simonCirculosAbsolutos[i] = { x: cx, y: cy, r: tamanoCirculito / 2 };
    }
    
    let opacidad = 255; 
    
    if (isSimon) {
      opacidad = 60; 
      if ((simonEstado === 'MOSTRANDO' || simonEstado === 'ILUMINAR_CLICK') && simonIluminado === i) {
        opacidad = 255;
      } else if (simonEstado === 'ERROR') {
        opacidad = (millis() % 400 < 200) ? 255 : 60; 
      }
    }

    let colorIndex = (col * 7 + fila * 13 + i * 5) % 3;

    let ctx = drawingContext;
    let r = tamanoCirculito / 2;
    let grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    
    let color1 = color(grads[colorIndex].c1);
    let color2 = color(grads[colorIndex].c2);
    color1.setAlpha(opacidad); 
    color2.setAlpha(opacidad); 
    
    grad.addColorStop(0, color1.toString());
    grad.addColorStop(1, color2.toString());
    
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
  
  drawingContext.fillStyle = '#000000';
}

function actualizarLogicaSimon() {
  let tiempoActual = millis();

  if (simonEstado === 'ESPERA_INICIAL') {
    if (tiempoActual - simonTiempo > 3000) { 
      simonSecuencia.push(floor(random(5))); 
      simonSecuencia.push(floor(random(5))); 
      iniciarFaseMuestra(tiempoActual);
    }
  } else if (simonEstado === 'MOSTRANDO') {
    if (simonFaseIluminacion === 'ENCENDIDO') {
      simonIluminado = simonSecuencia[simonIndiceMostrar];
      if (tiempoActual - simonTiempo > 500) { 
        simonFaseIluminacion = 'APAGADO';
        simonTiempo = tiempoActual;
      }
    } else { 
      simonIluminado = -1;
      if (tiempoActual - simonTiempo > 250) { 
        simonIndiceMostrar++;
        if (simonIndiceMostrar >= simonSecuencia.length) {
          simonEstado = 'ESPERANDO_CLICK';
          simonPaso = 0;
        } else {
          simonFaseIluminacion = 'ENCENDIDO';
          simonTiempo = tiempoActual;
        }
      }
    }
  } else if (simonEstado === 'ILUMINAR_CLICK') {
    if (tiempoActual - simonTiempo > 300) {
      simonIluminado = -1;
      if (simonPaso >= simonSecuencia.length) {
        simonEstado = 'PAUSA_NIVEL';
        simonTiempo = tiempoActual;
      } else {
        simonEstado = 'ESPERANDO_CLICK';
      }
    }
  } else if (simonEstado === 'PAUSA_NIVEL') {
    if (tiempoActual - simonTiempo > 1000) { 
      simonSecuencia.push(floor(random(5))); 
      iniciarFaseMuestra(tiempoActual);
    }
  } else if (simonEstado === 'ERROR') {
    if (tiempoActual - simonTiempo > 2000) {
      iniciarSimonJuego(tiempoActual); 
    }
  }
}

function iniciarFaseMuestra(t) {
  simonEstado = 'MOSTRANDO';
  simonIndiceMostrar = 0;
  simonFaseIluminacion = 'ENCENDIDO';
  simonTiempo = t;
}

function iniciarSimonJuego(t) {
  simonEstado = 'ESPERA_INICIAL';
  simonSecuencia = [];
  simonPaso = 0;
  simonTiempo = t;
  simonIluminado = -1;
}

function dibujarBotonX() {
  fill(0);
  rectMode(CORNER);
  rect(15, 15, 40, 40, 5); 
  fill(255); 
  textSize(24);
  textAlign(CENTER, CENTER);
  text("X", 35, 35); 
}

// --- LÓGICA GENERAL DE ACCIÓN (Unificada para Mouse y Táctil) ---
function procesarAccionInicio(px, py) {
  if (!modoDetalle && !enAnimacion && !animacionReversa) {
    if (px >= gridX && px <= gridX + gridAncho && py >= gridY && py <= gridY + gridAlto) {
      let anchoCelda = gridAncho / 3;
      let altoCelda = gridAlto / 3;
      let col = floor((px - gridX) / anchoCelda);
      let fila = floor((py - gridY) / altoCelda);

      if (col >= 0 && col < 3 && fila >= 0 && fila < 3) {
        columnaSeleccionada = col;
        filaSeleccionada = fila; 
        enAnimacion = true;
        progresoAnimacion = 0;

        // Resetear zoom al abrir
        if (col === 1 && fila === 0) {
          trianguloZoomFactor = 1.0;
        }

        let centroX = gridX + col * anchoCelda + anchoCelda / 2;
        let centroY = gridY + fila * altoCelda + altoCelda / 2;
        let tamano = min(anchoCelda, altoCelda) * 0.75; 

        figuraStart = { x: centroX, y: centroY, size: tamano };

        let targetSize = min(width, height) * 0.88; 
        figuraTarget = { x: width / 2, y: height / 2, size: targetSize };
      }
    }
  } else if (modoDetalle && !enAnimacion && !animacionReversa) {
    if (px > 15 && px < 55 && py > 15 && py < 55) {
      modoDetalle = false; 
      simonActivo = false;
      simonEstado = 'INACTIVO';
      transferenciaActivo = false;
      desvanecerActivo = false;
      dragActivo = false;
      dragActivo3 = false;
      dragActivo2 = false;
      squareDragging = null;
      squareDragging3 = null;
      squareDragging2 = null;
      animacionReversa = true;
      progresoAnimacion = 1; 
      return;
    }

    if (dragActivo) {
      for (let i = cSquares.length - 1; i >= 0; i--) {
        let sq = cSquares[i];
        let halfS = sq.sSize / 2;
        if (px >= sq.x - halfS && px <= sq.x + halfS && py >= sq.y - halfS && py <= sq.y + halfS) {
          squareDragging = sq;
          offsetXDrag = px - sq.x;
          offsetYDrag = py - sq.y;
          break;
        }
      }
    } else if (dragActivo3) {
      for (let i = cSquares3.length - 1; i >= 0; i--) {
        let sq = cSquares3[i];
        let halfS = sq.sSize / 2;
        if (px >= sq.x - halfS && px <= sq.x + halfS && py >= sq.y - halfS && py <= sq.y + halfS) {
          squareDragging3 = sq;
          offsetXDrag3 = px - sq.x;
          offsetYDrag3 = py - sq.y;
          break;
        }
      }
    } else if (dragActivo2) {
      for (let i = cSquares2.length - 1; i >= 0; i--) {
        let sq = cSquares2[i];
        let halfS = sq.sSize / 2;
        if (px >= sq.x - halfS && px <= sq.x + halfS && py >= sq.y - halfS && py <= sq.y + halfS) {
          squareDragging2 = sq;
          offsetXDrag2 = px - sq.x;
          offsetYDrag2 = py - sq.y;
          break;
        }
      }
    } else if (simonActivo && simonEstado === 'ESPERANDO_CLICK') {
      for (let i = 0; i < 5; i++) {
        let c = simonCirculosAbsolutos[i];
        if (c && dist(px, py, c.x, c.y) < c.r) {
          if (i === simonSecuencia[simonPaso]) {
            simonIluminado = i;
            simonEstado = 'ILUMINAR_CLICK';
            simonTiempo = millis();
            simonPaso++;
          } else {
            simonEstado = 'ERROR';
            simonTiempo = millis();
          }
          break; 
        }
      }
    } else if (transferenciaActivo) {
      for (let i = 0; i < 5; i++) {
        let c = transferenciaCirculosAbsolutos[i];
        if (c && dist(px, py, c.x, c.y) < c.r) {
          let cObj = transferenciaCirculos[i];
          
          let opciones = [];
          for (let j = 0; j < 5; j++) {
            if (i !== j && !cObj.transferidosA.includes(j)) {
              opciones.push(j);
            }
          }
          
          if (opciones.length > 0) {
            let target = random(opciones); 
            transferenciaCirculos[target].currentColorIndex = cObj.currentColorIndex;
            cObj.transferidosA.push(target); 
            cObj.alpha = max(0, cObj.alpha - 25.5); 
          }
          break; 
        }
      }
    } else if (desvanecerActivo) {
      for (let i = 0; i < 5; i++) {
        let c = desvanecerCirculosAbsolutos[i];
        if (c && dist(px, py, c.x, c.y) < c.r) {
          let cObj = desvanecerCirculos[i];
          cObj.alpha = max(0, cObj.alpha - 25.5); 
          break; 
        }
      }
    }
  }
}

function procesarAccionMovimiento(px, py) {
  if (dragActivo && squareDragging) {
    let targetX = px - offsetXDrag;
    let targetY = py - offsetYDrag;

    let containerX = figuraTarget.x;
    let containerY = figuraTarget.y;
    let containerSize = figuraTarget.size;
    let halfContainer = containerSize / 2;

    let maxHalfS = 0;
    for (let sqId of squareDragging.grupo) {
      let s = cSquares.find(item => item.id === sqId);
      if (s) {
        let hs = s.sSize / 2;
        if (hs > maxHalfS) maxHalfS = hs;
      }
    }

    let minX = containerX - halfContainer + maxHalfS;
    let maxX = containerX + halfContainer - maxHalfS;
    let minY = containerY - halfContainer + maxHalfS;
    let maxY = containerY + halfContainer - maxHalfS;

    targetX = constrain(targetX, minX, maxX);
    targetY = constrain(targetY, minY, maxY);

    let deltaX = targetX - squareDragging.x;
    let deltaY = targetY - squareDragging.y;

    for (let sq of cSquares) {
      if (squareDragging.grupo.includes(sq.id)) {
        sq.x += deltaX;
        sq.y += deltaY;
      }
    }

    let draggedGroupLeader = Math.min(...squareDragging.grupo);
    
    for (let other of cSquares) {
      let otherGroupLeader = Math.min(...other.grupo);
      if (draggedGroupLeader !== otherGroupLeader) {
        if (seSolapanMasDe10Porciento(squareDragging, other)) {
          let combinedGrupo = Array.from(new Set([...squareDragging.grupo, ...other.grupo]));
          let snapX = squareDragging.x;
          let snapY = squareDragging.y;

          for (let sq of cSquares) {
            if (combinedGrupo.includes(sq.id)) {
              sq.grupo = combinedGrupo;
              sq.x = snapX;
              sq.y = snapY;
            }
          }
          break;
        }
      }
    }
  } else if (dragActivo3 && squareDragging3) {
    let targetX = px - offsetXDrag3;
    let targetY = py - offsetYDrag3;

    let containerX = figuraTarget.x;
    let containerY = figuraTarget.y;
    let containerSize = figuraTarget.size;
    let halfContainer = containerSize / 2;

    let groupSquares = cSquares3.filter(s => squareDragging3.grupo.includes(s.id));
    let numSquares = groupSquares.length;
    let sSize = squareDragging3.sSize;
    let halfS = sSize / 2;

    let minOffsetX = 0, maxOffsetX = 0;
    let minOffsetY = 0, maxOffsetY = 0;

    if (numSquares === 2) {
      maxOffsetX = sSize;
    } else if (numSquares === 3) {
      maxOffsetX = sSize;
      maxOffsetY = sSize;
    } else if (numSquares === 4) {
      maxOffsetX = sSize;
      maxOffsetY = sSize;
    }

    let minX = containerX - halfContainer + halfS - minOffsetX;
    let maxX = containerX + halfContainer - halfS - maxOffsetX;
    let minY = containerY - halfContainer + halfS - minOffsetY;
    let maxY = containerY + halfContainer - halfS - maxOffsetY;

    targetX = constrain(targetX, minX, maxX);
    targetY = constrain(targetY, minY, maxY);

    let deltaX = targetX - squareDragging3.x;
    let deltaY = targetY - squareDragging3.y;

    for (let sq of cSquares3) {
      if (squareDragging3.grupo.includes(sq.id)) {
        sq.x += deltaX;
        sq.y += deltaY;
      }
    }

    let draggedGroupLeader = Math.min(...squareDragging3.grupo);
    
    for (let other of cSquares3) {
      let otherGroupLeader = Math.min(...other.grupo);
      if (draggedGroupLeader !== otherGroupLeader) {
        if (seSolapanMasDe10Porciento(squareDragging3, other)) {
          let combinedGrupo = Array.from(new Set([...squareDragging3.grupo, ...other.grupo]));
          let snapX = squareDragging3.x;
          let snapY = squareDragging3.y;

          for (let sq of cSquares3) {
            if (combinedGrupo.includes(sq.id)) {
              sq.grupo = combinedGrupo;
              sq.x = snapX;
              sq.y = snapY;
            }
          }
          break;
        }
      }
    }
  } else if (dragActivo2 && squareDragging2) {
    let targetX = px - offsetXDrag2;
    let targetY = py - offsetYDrag2;

    let containerX = figuraTarget.x;
    let containerY = figuraTarget.y;
    let containerSize = figuraTarget.size;
    let halfContainer = containerSize / 2;

    let halfS = squareDragging2.sSize / 2;
    let minX = containerX - halfContainer + halfS;
    let maxX = containerX + halfContainer - halfS;
    let minY = containerY - halfContainer + halfS;
    let maxY = containerY + halfContainer - halfS;

    squareDragging2.x = constrain(targetX, minX, maxX);
    squareDragging2.y = constrain(targetY, minY, maxY);
  }
}

function procesarAccionFin() {
  if (dragActivo && squareDragging) {
    squareDragging = null;
  }
  if (dragActivo3 && squareDragging3) {
    squareDragging3 = null;
  }
  if (dragActivo2 && squareDragging2) {
    squareDragging2 = null;
  }
}

// --- EVENTOS DE MOUSE ---
function mousePressed() {
  procesarAccionInicio(mouseX, mouseY);
}

function mouseDragged() {
  procesarAccionMovimiento(mouseX, mouseY);
}

function mouseReleased() {
  procesarAccionFin();
}

// --- EVENTOS TÁCTILES PARA DISPOSITIVOS MÓVILES (Celulares y Tablets) ---
function touchStarted() {
  if (touches.length === 1) {
    // Un solo dedo actúa como tap / inicio de arrastre
    procesarAccionInicio(touches[0].x, touches[0].y);
  } else if (touches.length === 2) {
    // Gestos multitáctiles para zoom del triángulo
    initialPinchDist = dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
  }
  return false; // Prevenir comportamientos por defecto del navegador en móviles
}

function touchMoved() {
  if (modoDetalle && !enAnimacion && !animacionReversa && columnaSeleccionada === 1 && filaSeleccionada === 0) {
    if (touches.length === 2 && initialPinchDist !== null) {
      let currentPinchDist = dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
      let diff = currentPinchDist - initialPinchDist;
      
      if (abs(diff) > 2) {
        if (diff > 0) {
          trianguloZoomFactor = max(0.2, trianguloZoomFactor - 0.02);
        } else {
          trianguloZoomFactor = min(3.0, trianguloZoomFactor + 0.02);
        }
        initialPinchDist = currentPinchDist;
      }
      return false;
    }
  }
  
  if (touches.length === 1) {
    procesarAccionMovimiento(touches[0].x, touches[0].y);
  }
  return false;
}

function touchEnded() {
  if (touches.length < 2) {
    initialPinchDist = null;
  }
  procesarAccionFin();
  return false;
}

// --- ZOOM RUEDA DE MOUSE ---
function mouseWheel(event) {
  if (modoDetalle && !enAnimacion && !animacionReversa && columnaSeleccionada === 1 && filaSeleccionada === 0) {
    if (event.delta > 0) {
      trianguloZoomFactor = max(0.2, trianguloZoomFactor - 0.05);
    } else {
      trianguloZoomFactor = min(3.0, trianguloZoomFactor + 0.05);
    }
    return false; 
  }
}
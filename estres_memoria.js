const os = require('os');

// =============================================================================
// CONFIGURACIÓN DE SEGURIDAD (AJUSTADA PARA VM DE 4 GB)
// =============================================================================
const RAM_TOTAL_MB = Math.floor(os.totalmem() / 1024 / 1024); // RAM total en MB
const LIMITE_MB = RAM_TOTAL_MB - 400; // Dejar ~400 MB libres para el sistema
const CHUNK_SIZE = 50000;            // 50,000 strings nuevos por iteración
const INTERVALO_MS = 100;            // 100 ms entre cada lote

// String de ~1 KB que será la unidad de consumo de memoria
const STRING_BASE = 'A'.repeat(1024);

// Variables de estado
let arrayGigante = [];
let iteracion = 0;
let limpiezasRealizadas = 0;
let memoriaMaximaAlcanzada = 0;

// -----------------------------------------------------------------------------
// Utilidad: convertir bytes a MB con 2 decimales
// -----------------------------------------------------------------------------
function toMB(bytes) {
    return (bytes / (1024 * 1024)).toFixed(2);
}

// -----------------------------------------------------------------------------
// Obtener el uso actual de swap usando el comando 'free' (más preciso que solo RAM)
// -----------------------------------------------------------------------------
function obtenerUsoSwap() {
    const { execSync } = require('child_process');
    try {
        const output = execSync('free -m', { encoding: 'utf8' });
        const lines = output.split('\n');
        const swapLine = lines.find(line => line.startsWith('Swap:'));
        if (!swapLine) return 'N/A';
        const parts = swapLine.split(/\s+/);
        const usado = parts[2]; // columna 'used'
        const total = parts[1]; // columna 'total'
        return `${usado} / ${total} MB`;
    } catch (error) {
        return 'No disponible';
    }
}

// -----------------------------------------------------------------------------
// Mostrar panel de control en tiempo real
// -----------------------------------------------------------------------------
function mostrarPanel() {
    console.clear();
    
    const totalRAM = toMB(os.totalmem());
    const libreRAM = toMB(os.freemem());
    const usadaRAM = toMB(os.totalmem() - os.freemem());
    const usoPorcentaje = ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(1);
    
    const heapUsado = toMB(process.memoryUsage().heapUsed);
    const heapTotal = toMB(process.memoryUsage().heapTotal);
    
    const swapInfo = obtenerUsoSwap();

    console.log('╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║   SISTEMAS OPERATIVOS - LABORATORIO DE PAGINACIÓN Y MEMORIA VIRTUAL   ║');
    console.log('╚══════════════════════════════════════════════════════════════════════╝');
    console.log(`  PID del proceso Node.js : ${process.pid}`);
    console.log(`  Iteración actual        : ${iteracion}`);
    console.log(`  Límite de seguridad     : ${LIMITE_MB} MB (RAM del sistema)`);
    console.log(`  Veces que se ha liberado: ${limpiezasRealizadas}`);
    console.log(`  Máxima RAM usada en esta tanda: ${memoriaMaximaAlcanzada} MB`);
    console.log('');
    console.log('  ═════════════════════════════ RAM DEL SISTEMA ═══════════════════════════');
    console.log(`  Total                    : ${totalRAM} MB`);
    console.log(`  En uso (global)          : ${usadaRAM} MB`);
    console.log(`  Libre                    : ${libreRAM} MB`);
    console.log(`  Porcentaje usado         : ${usoPorcentaje} %`);
    
    // Barra de progreso de RAM
    const barLen = 30;
    const filled = Math.round((usoPorcentaje / 100) * barLen);
    const empty = barLen - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    console.log(`  [${bar}] ${usoPorcentaje}%`);
    
    console.log('');
    console.log('  ═══════════════════════════════ SWAP ═══════════════════════════════════');
    console.log(`  Uso de swap (comando free) : ${swapInfo}`);
    console.log('  → Abre OTRA terminal y ejecuta: htop');
    console.log('  → Observa cómo la barra "Swp" sube cuando la RAM se acerca al 100%');
    
    console.log('');
    console.log('  ══════════════════════════ PROCESO ACTUAL ══════════════════════════════');
    console.log(`  Heap usado               : ${heapUsado} MB`);
    console.log(`  Heap total               : ${heapTotal} MB`);
    console.log(`  Strings en el array      : ${arrayGigante.length.toLocaleString()}`);
    console.log('');
    console.log('  Presiona Ctrl+C para detener la prueba de forma segura.');
    console.log('══════════════════════════════════════════════════════════════════════════');
}

// -----------------------------------------------------------------------------
// Ciclo principal: añade strings o libera memoria si se alcanza el límite
// -----------------------------------------------------------------------------
function cicloEstres() {
    iteracion++;
    
    const memUsadaMB = (os.totalmem() - os.freemem()) / (1024 * 1024);
    if (memUsadaMB > memoriaMaximaAlcanzada) {
        memoriaMaximaAlcanzada = Math.floor(memUsadaMB);
    }
    
    // Verificar límite de seguridad
    if (memUsadaMB >= LIMITE_MB) {
        // Liberar memoria antes de que el sistema se vuelva inestable
        arrayGigante = [];
        limpiezasRealizadas++;
        memoriaMaximaAlcanzada = 0;
        
        // Sugerir al recolector de basura que limpie (si está expuesto)
        if (global.gc) global.gc();
        
        console.log('\n  ⚠️  LÍMITE DE SEGURIDAD ALCANZADO. Memoria liberada.');
    } else {
        // Añadir un gran bloque de strings (cada string ~1 KB)
        for (let i = 0; i < CHUNK_SIZE; i++) {
            arrayGigante.push(STRING_BASE + iteracion + '_' + i);
        }
    }
    
    mostrarPanel();
}

// -----------------------------------------------------------------------------
// Manejador de Ctrl+C: libera memoria y termina limpiamente
// -----------------------------------------------------------------------------
process.on('SIGINT', () => {
    console.log('\n\n🛑 Detención manual. Liberando toda la memoria...');
    arrayGigante = [];
    console.log('✅ Memoria liberada. Proceso finalizado.\n');
    process.exit(0);
});

// -----------------------------------------------------------------------------
// Inicio del programa
// -----------------------------------------------------------------------------
console.clear();
console.log('╔══════════════════════════════════════════════════════════════════════╗');
console.log('║               INICIANDO PRUEBA DE ESTRÉS DE MEMORIA                   ║');
console.log('╚══════════════════════════════════════════════════════════════════════╝');
console.log(`  RAM total del sistema   : ${toMB(os.totalmem())} MB`);
console.log(`  Límite de seguridad     : ${LIMITE_MB} MB (${LIMITE_MB - Math.floor(os.totalmem()/1024/1024)} MB menos que el total)`);
console.log(`  Cada iteración añade    : ${CHUNK_SIZE.toLocaleString()} strings de 1 KB (~${CHUNK_SIZE/1000} MB)`);
console.log(`  Tiempo entre iteraciones: ${INTERVALO_MS} ms`);
console.log('\n  Abre OTRA terminal y ejecuta:   htop');
console.log('  Presiona Ctrl+C para detener.\n');
console.log('══════════════════════════════════════════════════════════════════════════');
console.log('  Esperando 3 segundos antes de comenzar...\n');

setTimeout(() => {
    setInterval(cicloEstres, INTERVALO_MS);
}, 3000);
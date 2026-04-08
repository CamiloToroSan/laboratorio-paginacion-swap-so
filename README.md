# Estres de Memoria y Paginacion (Swap) – Laboratorio de Sistemas Operativos

Este script demuestra el concepto de **memoria virtual**, **paginacion** y **uso de swap** en sistemas Linux/Unix. Al llenar la RAM con millones de strings, se fuerza al kernel a utilizar el espacio de intercambio (swap), mostrando en tiempo real como el sistema operativo gestiona la escasez de memoria fisica.

## Objetivo del proyecto

- Comprender la diferencia entre **RAM fisica** y **memoria virtual (swap)**.
- Observar el mecanismo de **paginacion** (page-out / page-in).
- Visualizar el **thrashing** cuando la memoria se agota.
- Implementar un **limite de seguridad** para evitar que el sistema se bloquee.

## Conceptos clave explicados

| Concepto | Significado |
| :--- | :--- |
| **RAM fisica** | Memoria rapida y volatil donde se ejecutan los programas. |
| **Swap (memoria virtual)** | Espacio en el disco duro que el kernel usa como extension de la RAM. |
| **Paginacion (paging)** | Mecanismo por el cual el kernel mueve paginas de 4 KB entre RAM y swap. |
| **Thrashing** | Estado en el que el sistema pasa mas tiempo moviendo paginas que ejecutando procesos. |
| **PID (Process ID)** | Identificador unico que el kernel asigna a cada proceso. |
| **Heap / Garbage Collector** | Zona de memoria dinamica de Node.js y su recolector de basura. |
| **Kernel** | Nucleo del SO que gestiona memoria, procesos y E/S. |
| **Llamada al sistema** | Mecanismo para que un programa solicite servicios al kernel. |

## Requisitos

- Sistema operativo: Linux (Ubuntu/Debian recomendado) con swap activado.
- Node.js v12 o superior.
- Monitor de sistema: `htop` (opcional, para observar).

## Instalacion de dependencias (Ubuntu)

Ejecute los siguientes comandos en la terminal:

`sudo apt update`  
`sudo apt install nodejs -y`

Para verificar que Node.js se instalo correctamente:

`node -v`

## Para ejecutar el script

Una vez clonado el repositorio y ubicado en el directorio del proyecto, ejecute:

`node estres_memoria.js`

## Archivos del repositorio

- `estres_memoria.js` - Script principal en Node.js.
- `README.md` - Documentacion.
- `docs/` - (Opcional) Capturas e informes.

## Descripcion del script (`estres_memoria.js`)

El script esta disenado para:

1. Calcular la RAM total del sistema y establecer un limite de seguridad (400 MB menos que el total).
2. Crear un string base de 1 KB (`'A'.repeat(1024)`) que actua como unidad de consumo.
3. Ejecutar un bucle periodico (cada 100 ms) que añade 50.000 strings al array `arrayGigante` (~50 MB por iteracion).
4. Monitorear el uso de RAM mediante el modulo nativo `os`. Si el consumo supera el limite de seguridad, el script vacia el array y permite al Garbage Collector liberar la memoria.
5. Mostrar un panel informativo que incluye:
   - PID del proceso.
   - RAM total, usada y libre del sistema.
   - Uso actual de swap (consultado mediante el comando `free -m`).
   - Cantidad de strings almacenados.
6. Manejar la señal SIGINT (`Ctrl+C`) para liberar la memoria antes de finalizar.

### Fragmentos relevantes del codigo

```javascript
// Limite de seguridad: 400 MB menos que la RAM total
const RAM_TOTAL_MB = Math.floor(os.totalmem() / 1024 / 1024);
const LIMITE_MB = RAM_TOTAL_MB - 400;

// Comando para obtener el uso exacto de swap
function obtenerUsoSwap() {
    const { execSync } = require('child_process');
    const output = execSync('free -m', { encoding: 'utf8' });
    // ... extrae y retorna el valor de swap usado
}

// Bucle de estres
setInterval(() => {
    if ((os.totalmem() - os.freemem()) / 1024 / 1024 >= LIMITE_MB) {
        arrayGigante = [];   // Liberar memoria
    } else {
        for (let i = 0; i < 50000; i++) {
            arrayGigante.push(STRING_BASE + iteracion + '_' + i);
        }
    }
}, 100);

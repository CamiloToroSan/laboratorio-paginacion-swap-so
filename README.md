# Laboratorio de Sistemas Operativos: Estrés de Memoria y Paginación (Swap)

Repositorio correspondiente al punto 3 del taller "Manipulación y Monitoreo de Recursos del SO desde el Código".

**Objetivo:** Demostrar el mecanismo de memoria virtual y paginación forzando al sistema operativo a utilizar el espacio de swap mediante un script que consume RAM progresivamente.

## Contenido

- `estres_memoria.js` : Script principal en Node.js.
- `README.md` : Este documento.

## Requisitos

- Sistema operativo Linux (probado en Ubuntu 22.04/24.04).
- Node.js 12.x o superior.
- `htop` (opcional, para monitoreo visual).

## Instalacion y ejecucion

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/usuario/so-memory-paging-lab.git
   cd so-memory-paging-lab

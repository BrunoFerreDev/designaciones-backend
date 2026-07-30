# ArbDesig Vanilla App (Multi-page modular)

Proyecto reescrito a HTML, CSS y Javascript puro (Vanilla JS), organizado en múltiples páginas y componentes separados. Sin Vite, sin Node en runtime.

## Estructura
- Contenedores HTML (páginas):
  - `index.html` (Resumen/Dashboard)
  - `canchas.html` (Gestión de canchas)
  - `arbitros.html` (Gestión de árbitros y disponibilidad)
  - `suspensiones.html` (Medidas disciplinarias)
  - `designaciones.html` (Designación de árbitros y viáticos)
  - `buscar.html` (Buscador avanzado)
  - `estadisticas.html` (Estadísticas globales)
  - `historico.html` (Carga masiva histórica)
- Estilos:
  - `style.css`: Estilos compilados con Tailwind CSS v4.
- Scripts en `js/`:
  - `api.js`: Servicios y llamadas fetch.
  - `store.js`: Estado global de la app, auxiliares y guardado a LocalStorage.
  - `sidebar.js`: Componente sidebar dinámico renderizado en todas las páginas.
  - `modals.js`: Componente modal e interacciones de formularios.
  - `main.js`: Inicializador de datos unificado.
  - `{pantalla}.js`: Lógica y renderizado específico de cada pantalla.

## Cómo ejecutar

### Opción 1: Directo del explorador (file://)
Doble clic en `index.html` (o cualquier archivo `.html`) para correr.
*Nota: Funciona de manera 100% autónoma y offline gracias al LocalStorage si la API externa no responde.*

### Opción 2: Servidor estático
```bash
python3 -m http.server 3000
```
Y abre `http://localhost:3000`.

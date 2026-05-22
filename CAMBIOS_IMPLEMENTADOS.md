# Cambios Implementados

## 1. Listado de Árbitros Designados por Designación

### Descripción
Se ha implementado la funcionalidad para que cada designación obtenida incluya la lista completa de árbitros designados directamente en la respuesta, sin necesidad de hacer una llamada adicional a un endpoint separado.

### Cambios Realizados

#### GetDesignacionDTO.java
**Archivo:** `/src/main/java/com/designaciones/webdesignaciones/dto/GetDesignacionDTO.java`

- Agregado el campo `arbitrosDesignados` de tipo `List<GetDesignadosDTO>`
- Agregado un nuevo constructor sobrecargado que recibe parámetros:
  - `Designacion designacion`
  - `List<Designados> designados`

#### DesignacionServiceImpl.java
**Archivo:** `/src/main/java/com/designaciones/webdesignaciones/service/impl/DesignacionServiceImpl.java`

Cambios en los métodos para incluir árbitros designados en la respuesta:
- `crearDesignacion()` - Retorna designación con árbitros vacío
- `asignarArbitrosAutomaticamente()` - Retorna designación con todos los árbitros asignados
- `obtenerPorEstado()` - Para cada designación obtiene sus árbitros
- `asignarArbitroADesignacion()` - Retorna designación con árbitros actualizados

---

## 2. Validación de Restricción INICIAL/EN_FORMACION para FECHA_NORMAL

### Descripción
Se ha implementado una validación que asegura que en una designación de FECHA_NORMAL:
- **No puede haber más de 1 árbitro** de categoría INICIAL
- **O máximo 1 árbitro** de categoría EN_FORMACION
- **Pero no ambos simultáneamente**

### Cambios Realizados

#### Nuevo método: `validarCategoryRecristriccionInicialFormacion()`
**Archivo:** `/src/main/java/com/designaciones/webdesignaciones/service/impl/DesignacionServiceImpl.java`

Valida directamente sobre objetos Designados (usado en asignación manual):
- Verifica que sea designación FECHA_NORMAL
- Cuenta árbitros INICIAL y EN_FORMACION ya asignados
- Lanza excepciones específicas si se intenta violar la regla

#### Nuevo método: `validarCategoryRecristriccionInicialFormacionArbitros()`
**Archivo:** `/src/main/java/com/designaciones/webdesignaciones/service/impl/DesignacionServiceImpl.java`

Valida sobre objetos Arbitro (usado en asignación automática):
- Misma lógica que el anterior pero recibe lista de Arbitros
- Se usa en el proceso de asignación automática para filtrar candidatos

### Puntos de Validación

**1. En `asignarArbitroADesignacion()`** (línea ~130)
- Valida antes de asignar un árbitro manualmente
- Lanza error si se intenta asignar un INICIAL teniendo EN_FORMACION o viceversa
- Lanza error si intenta asignar más de 1 árbitro de la misma categoría

**2. En `asignarArbitrosAutomaticamente()`** (líneas ~232, ~247, ~271)
- Valida al seleccionar árbitro INTERMEDIO forzado
- Valida al rellenar los faltantes con candidatos
- Valida al asignar árbitro previo

### Mensajes de Error

Los siguientes errores se lanzan cuando se intenta violar la regla:

```
"No se puede asignar un árbitro de categoría INICIAL a una designación 
que ya tiene un árbitro EN_FORMACION."

"No se puede asignar más de 1 árbitro de categoría INICIAL a una 
designación en FECHA_NORMAL."

"No se puede asignar un árbitro de categoría EN_FORMACION a una 
designación que ya tiene un árbitro INICIAL."

"No se puede asignar más de 1 árbitro de categoría EN_FORMACION a una 
designación en FECHA_NORMAL."
```

### Casos de Uso Válidos en FECHA_NORMAL

✅ **Válido:**
- 1 árbitro INICIAL + N árbitros de otras categorías (INTERMEDIO, AVANZADO, ELITE, etc.)
- 1 árbitro EN_FORMACION + N árbitros de otras categorías
- Solo árbitros de INTERMEDIO, AVANZADO, ELITE (sin INICIAL ni EN_FORMACION)

❌ **No válido:**
- 1 árbitro INICIAL + 1 árbitro EN_FORMACION
- 2 árbitros INICIAL
- 2 árbitros EN_FORMACION
- 1 árbitro INICIAL + 1 árbitro EN_FORMACION

### Nota importante
✅ Esta restricción **SOLO se aplica a FECHA_NORMAL**
- Otras etapas (SEMIFINAL, FINAL, CLASIFICACION, etc.) no están afectadas
- Pueden tener combinaciones arbitrarias de categorías

---

## Endpoints Afectados por los Cambios

### POST /designaciones/{idDesignacion}/asignar-arbitro
- Ahora valida restricción INICIAL/EN_FORMACION antes de asignar
- Devuelve error 500 si intenta violar la regla

### POST /designaciones/{idDesignacion}/asignar-automatico
- Ahora respeta automáticamente la restricción INICIAL/EN_FORMACION
- Filtra candidatos para cumplir con la regla

---

## Notas Técnicas

- Las validaciones usan streams de Java para contar categorías
- Se implementaron dos métodos sobrecargados para validar con diferentes tipos de datos
- La restricción se aplica en tiempo de asignación (tanto manual como automática)
- Los errores son lanzados como RuntimeException con mensajes descriptivos`

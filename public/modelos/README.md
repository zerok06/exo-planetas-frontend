# Modelos 3D para Kepler AI Lab

Esta carpeta contiene los modelos 3D utilizados en la visualización del sistema Kepler.

## Archivos de Modelo

### satelite.glb
- **Descripción**: Modelo 3D del satélite Kepler central
- **Formato**: GLB (GL Transmission Format)
- **Ubicación**: `/modelos/satelite.glb`
- **Uso**: Reemplaza la esfera roja central en la visualización 3D

## Cómo Añadir tu Modelo

1. **Coloca tu archivo GLB** en esta carpeta
2. **Renómbralo** a `satelite.glb`
3. **Reinicia** el servidor de desarrollo
4. **El modelo se cargará automáticamente** en la visualización

## Fallback

Si no se encuentra el archivo `satelite.glb`, el sistema usará automáticamente una geometría por defecto que simula un satélite con:
- Cuerpo principal metálico
- Paneles solares
- Antena de comunicación
- Efectos de iluminación

## Especificaciones Técnicas

- **Escala**: El modelo se escala automáticamente a 2x
- **Animación**: Rotación suave y efectos de pulso
- **Interactividad**: Hover effects y tooltips
- **Rendimiento**: Optimizado para WebGL

## Formatos Soportados

- ✅ GLB (recomendado)
- ✅ GLTF
- ❌ OBJ (no soportado)
- ❌ FBX (no soportado)

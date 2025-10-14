# Directorio de imágenes subidas

Este directorio contiene las imágenes subidas por los usuarios del editor.

## Estructura:
- Imágenes del editor de artículos
- Nomenclatura: image-{timestamp}.{extension}

## Configuración en el servidor:
- Máximo 5MB por imagen
- Formatos permitidos: jpg, png, gif, webp
- Las imágenes se guardan en `/public/uploads/images/`
- URLs públicas: `/uploads/images/{filename}`
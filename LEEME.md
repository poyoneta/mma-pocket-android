# Pocket MMA para Android (APK)

Esta carpeta es la app de Android. Adentro, en `app/src/main/assets/www/`, va el juego tal cual
(la misma carpeta `la-jaula`). La app lo abre a pantalla completa, siempre acostado, y **anda sin internet**
porque todos los archivos vienen dentro del APK.

## Opción A: que GitHub arme el APK solo (sin instalar nada)

1. Creá un repo nuevo en GitHub, por ejemplo `pocket-mma-android`, y subí esta carpeta entera.
2. Entrá al repo → pestaña **Actions**. Se ejecuta "Armar APK" solo (tarda unos 5 minutos).
3. Cuando termine (tilde verde), entrá a esa ejecución y abajo, en **Artifacts**, bajá `Pocket MMA APK`.
4. Adentro está `Pocket MMA.apk`. Pasalo al celular, abrilo y aceptá "instalar apps de origen desconocido".

Cada vez que subas cambios, GitHub arma un APK nuevo.

## Opción B: con Android Studio en tu compu

1. Instalá [Android Studio](https://developer.android.com/studio) (la primera vez baja el SDK solo).
2. **File → Open** y elegí esta carpeta. Esperá que termine "Gradle sync".
3. **Build → Build App Bundle(s) / APK(s) → Build APK(s)**.
4. El APK queda en `app/build/outputs/apk/debug/app-debug.apk`.
   O conectá el celular por USB (con "Depuración USB" activada) y tocá ▶ Run.

## Cuando cambies el juego

Copiá la carpeta `la-jaula` adentro de `app/src/main/assets/www/` (reemplazando todo).
En Windows podés usar `actualizar-juego.bat` (editá la ruta adentro si tu carpeta no está en el Escritorio).
Antes de armar un APK nuevo para que se actualice encima del viejo, subí `versionCode` en `app/build.gradle` (1 → 2…).

## Qué hace la app

- Pantalla completa sin barras, siempre en horizontal.
- Botón **atrás** del celular: en una pelea pone pausa; en un menú vuelve al principal; en el principal sale.
- Si salís de la app en medio de una pelea, queda en pausa.
- La carrera y los peleadores creados se guardan en el celular. Si desinstalás la app, se borran.

## Para publicarla en Play Store (más adelante)

- Hace falta una cuenta de desarrollador de Google Play (pago único) y armar un **AAB firmado**
  (Build → Generate Signed App Bundle). Guardá bien el archivo de firma: sin él no podés actualizar la app.
- El juego base tiene que seguir siendo genérico (sin peleadores, logos ni marcas reales).

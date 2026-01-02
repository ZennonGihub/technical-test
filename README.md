# Technical Test

Esta es un api desarrollada con NodeJs, Express, PostgreSQL y Prisma orm.

Tambien se utilizo neon para desplegar la base de datos, y vercel para desplegar la api. Url de la api: https://technical-test-git-deploy-zennons-projects-6417a15e.vercel.app/

## Correr el proyecto

1. **Clonar el repositorio**

```bash
   git clone https://github.com/ZennonGihub/technical-test.git
   cd technical-test
```

1. **Instalar las dependencias**

```bash
    npm install
```

3. **Configurar las variables de entorno en relacion al .env-example**

4. **Ejecutar las migraciones de la base de datos**

```bash
npx prisma migrate dev
```

5. **Poblar la base de datos:**

```bash
npx prisma db seed
```

## Scripts para ejecutar el proyecto

`npm start`: Inicia la aplicación en modo producción.

`npm run dev`: Inicia la aplicación en modo desarrollo con Nodemon.

`npm test`: Ejecuta la suite de pruebas completa con Vitest.

`npm run test:coverage`: Genera un reporte detallado de cobertura de código.

## Tests

Se han implementado tests de integracion y unitarios.

Para ejecutar los tests:

```bash
npm test
```

Para generar el reporte de la cobertura

```bash
npm run test:coverage
```

## Decisiones tecnicas

**Api monolitica:** Se utilizo una arquitectura modular, para que el codigo sea mas mantenible, y poder aislar los errores, ya que si un modulo presenta un error, solamente arreglamos ese modulo

**Validacion con Joi:** Se utilizo joi para validar los datos antes de que lleguen a la base de datos, y poder manejar y evitar inconsistencias

**Errores con Boom:** Se utilizo la libreria boom para poder manejar los errores, y poder devolver respuestas http adecuadas, sin que se rompa la aplicacion

**Testing con Vitest:** Se utilizo vitest por su compatibilidad con ESM. Y se utilizo mocks de prisma para poder facilitar la ejecucion de los test, sin tener que depender de configurar la base de datos

## Coleccion insomnia

Se incluyo una coleccion de insomnia el cual se llama "InsomniaCollection" para podre probar todas las rutas

**Uso:**

-Abra insomnia
-Seleccione el boton de "import"
-Seleccione file, y cargue el archivo mencionado anteriormente
-Esto importara todos los endpoints necesarios para poder probar la api
-Ahora debe de seleccionar el entorno, como la api esta desplegada, esta el entorno local, y el deploy para probar.

Ahora solo queda seguir los pasos anteriores para configurar y levantar el proyecto.

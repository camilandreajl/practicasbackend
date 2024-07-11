# Proyecto de AWS CDK con TypeScript

Este proyecto utiliza AWS CDK para desplegar infraestructura en AWS utilizando TypeScript.

## Configuración Inicial

1. Modificar el archivo `config.ts` para incluir los siguientes detalles:
   - Nombre del cliente
   - Nombre del proyecto
   - Región de AWS
   - Cuenta de AWS (si es necesario)
   - Buckets de S3

## Despliegue del Backend

### Paso 1: Síntesis del CDK (solo una vez)

```bash
cdk synth
```

### Paso 2: Despliegue

Dependiendo del entorno al que quieras desplegar, utiliza uno de los siguientes comandos:

Para desplegar en desarrollo:

```bash
bun deploy:dev
```

Para desplegar en producción:

```bash
bun deploy:prod
```

Para desplegar en todos los entornos:

```bash
bun deploy:all
```

### Paso 3: Instalación de dependencias en la raiz del proyecto

Instalar AWS CDK

```bash
bun install aws-cdk-lib
```

Instalar TypeScript y ts-node

```bash
bun install -d typescript ts-node @types/node
```

Instalar Rimraf

```bash
bun install -d rimraf
```

### Paso 4: Instalación de dependencias en la carpeta api/

Navegar a la carpeta api

```bash
cd .\api\
```

Instalar aws s3

```bash
bun install @aws-sdk/client-s3
```

Instalar aws secrets manager

```bash
bun install @aws-sdk/client-secrets-manager
```

Instalar aws s3 request presigner

```bash
bun install @aws-sdk/s3-request-presigner
```

Instalar as integrations

```bash
bun install @as-integrations/aws-lambda
```

Instalar prisma

```bash
bun install prisma @prisma/client
```

Instalar body parser

```bash
bun install body-parser
```

Instalar nanoid

```bash
bun install nanoid
```

Instalar nodemailer

```bash
bun install nodemailer @types/nodemailer
```

Instalar graphql

```bash
bun install graphql @apollo/server graphql-tag dataloader
```

Instalar cors

```bash
bun install cors @types/cors
```

Instalar typescript y node

```bash
bun install ts-node @types/node typescript
```

Instalar dotenv

```bash
bun install dotenv
```

Instalar esbuild

```bash
bun install esbuild
```

#### Notas Adicionales

Asegúrate de tener configuradas tus credenciales de AWS correctamente antes de intentar desplegar. Consulta la documentación oficial de AWS CDK para más detalles sobre cómo utilizar CDK.

# Backend boilerplate

## Deployable to AppSync

## Instructions:

1. aws configure con las credenciales de la cuenta de aws donde se quiera desplegar el backend
2. modificar en config.ts.ts el nombre de la app, nombre del cliente, el id de la cuenta y la región
3. ejecuta el comando `yarn install` para descargar las librerias del cdk y demas dependencias 
4. agregar schema de prisma en /api/prisma
5. configurar el string de conexión a la BD en el archivo api/src/db.ts
6. clonar repositorio de cosmo https://github.com/prevalentWare/prisma-cosmo.git
7. ejecutar el comando `yarn install` de cosmo
8. copiar esquema prisma en cosmo y ejecutar con el comando `yarn aws_cosmo`
9. reemplaza el schema gql, src/models y auth/sessionconfig de la aplicacion backend con los archivos generados   por cosmo.


## Commands

- main repo packages
  `yarn add @aws-cdk/aws-appsync-alpha aws-cdk-lib aws-sdk constructs source-map-support`
  `yarn add -D @types/node aws-cdk copyfiles rimraf ts-node typescript`
- api repo packages
  `yarn add @prisma/client aws-sdk`
  `yarn add -D @apollo/server @prevalentware/prisma-cosmo @types/node esbuild fs graphql prisma ts-node typescript`
- back deployment
  `cdk bootstrap` (sólo hay que ejecutarlo en el despliegue inicial)
  `yarn deploy`
- local testing
  `cd api`
  `yarn start`
- testing del contenedor de Docker
  `docker container rm -f back && docker build -t back . && docker run -p 9000:8080 --name back -e TEST=true back`

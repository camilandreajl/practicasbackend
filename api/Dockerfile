FROM public.ecr.aws/lambda/nodejs:18 as builder
WORKDIR /usr/app
COPY package.json ./
RUN npm install
COPY ./prisma ./prisma/
COPY ./.env ./
COPY ./graphql ./graphql
RUN npx prisma generate
COPY ./src ./
RUN npm run build

FROM public.ecr.aws/lambda/nodejs:18
WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=builder /usr/app/package.json ./
COPY --from=builder /usr/app/dist/* ./
COPY --from=builder /usr/app/prisma/* ./prisma/
COPY --from=builder /usr/app/graphql/* ./graphql/
RUN npm install
RUN npx prisma generate

CMD ["index.handler"]
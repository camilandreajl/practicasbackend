FROM public.ecr.aws/lambda/nodejs:18 as builder
WORKDIR /usr/app
RUN npm i -g bun
COPY package.json ./
RUN bun install
COPY tsconfig.json ./
COPY eslint.config.mjs ./
COPY ./prisma ./prisma/
RUN npx prisma generate
COPY ./src ./
# Modify tsconfig.json to adjust the path
RUN sed -i 's@"src/\*"@"\*"@' tsconfig.json
RUN npm run build

FROM public.ecr.aws/lambda/nodejs:18
WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=builder /usr/app/package.json ./
COPY --from=builder /usr/app/dist/* ./
COPY --from=builder /usr/app/prisma/* ./prisma/
RUN npm install
RUN npx prisma generate

CMD ["index.handler"]
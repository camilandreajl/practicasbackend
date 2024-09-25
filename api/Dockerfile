FROM public.ecr.aws/lambda/nodejs:20 AS builder
WORKDIR /usr/app
RUN npm i -g bun
RUN npm install -g bunx

COPY package.json ./
RUN bun install
COPY tsconfig.json ./
COPY eslint.config.mjs ./
COPY ./prisma ./prisma/
COPY .prettierrc ./
RUN bunx prisma generate

COPY ./src ./
# Modify tsconfig.json to adjust the path
RUN sed -i 's@"src/\*"@"\*"@' tsconfig.json
RUN bun run cosmo
RUN bun run build

FROM public.ecr.aws/lambda/nodejs:20
WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=builder /usr/app/package.json ./
COPY --from=builder /usr/app/dist/* ./
COPY --from=builder /usr/app/prisma ./prisma
RUN npm install

CMD ["index.handler"]

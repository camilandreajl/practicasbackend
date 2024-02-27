// import type { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
// import {customEvent} from '../types'
// import { handlers, middleware } from '@as-integrations/aws-lambda';
// // import { Role, Session, User } from '@prisma/client';
// import { getDB,  } from '../db';
// import { resolve } from 'path';

// const sessionMiddleware: middleware.MiddlewareFn<
//   handlers.RequestHandler<APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2>
// > = async (event) => {
//   const sessionToken = event.headers['next-auth.session-token'] ?? null;
//   const method = event['httpMethod'];
//   const db = await getDB();
//   const session: any = await db.session.findUnique({
//     where: { sessionToken: sessionToken ?? '' },
//     select: {
//       expires: true,
//       sessionToken: true,
//       user:
//       {
//         select: {
//           id: true,
//           role: { select: { name: true } }
//         },
//       }
//     },
//   });
//   // event.headers = {...event.headers,   session:session}
//   }
//   const session: middleware.MiddlewareFn<
//   handlers.RequestHandler<APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2>
// > = async (event) => {
//   const sessionToken = event.headers['next-auth.session-token'] ?? null;
//   const method = event['httpMethod'];
//   const db = await getDB();
//   const session: any = await db.session.findUnique({
//     where: { sessionToken: sessionToken ?? '' },
//     select: {
//       expires: true,
//       sessionToken: true,
//       user:
//       {
//         select: {
//           id: true,
//           role: { select: { name: true } }
//         },
//       }
//     },
//   });
//   return session
//   // event.headers = {...event.headers,   session:session}
//   }

//   // if (!session && method === 'POST') {
//   //   result.body = JSON.stringify({ error: 'Invalid session token' });
//   //   return;
//   // }
//   // if (session && session?.expires < new Date() && method === 'POST') {
//   //   result.body = JSON.stringify({ error: 'Session expired' });
//   //   return;
//   // }

//   // const session: any = await db.session.findUnique({
//   //   where: { sessionToken: sessionToken ?? '' },
//   //   select: {
//   //     expires: true,
//   //     sessionToken: true,
//   //     user:
//   //     {
//   //       select: {
//   //         id: true,
//   //         role: { select: { name: true } }
//   //       },
//   //     }
//   //   },
//   // });

//     // TODO - check if session is expired
//     // if (session?.expires < new Date()) {
//     //   result.body = JSON.stringify({ error: 'Session expired' });
//     //   return;
//     // }

// export { sessionMiddleware, session  };
import type { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { handlers, middleware } from '@as-integrations/aws-lambda';

const sessionMiddleware: middleware.MiddlewareFn<
  handlers.RequestHandler<APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2>
> = async (event) => {
  // const sessionToken = event.headers['next-auth.session-token'] ?? null;
  const method = event['httpMethod'];

  // TODO - check if session is expired

  // if (session?.expires < new Date()) {

  //   result.body = JSON.stringify({ error: 'Session expired' });

  //   return;

  // }
};

export { sessionMiddleware };

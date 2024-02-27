import fetch from 'node-fetch';

interface RequestOptions {
  headers?: Record<string, string>;
}

const makePost = async (url: string, body: any, options: RequestOptions = {}): Promise<any> => {
  const headers: Record<string, string> = options.headers || {};
  const response = await fetch(url, { body, headers, method: 'POST' });

  if (response.statusText === 'No Content') {
    return response;
  }
  return response.json();
};

const makeJSONPost = async (url: string, data: any, options: RequestOptions = {}): Promise<any> => {
  const body = JSON.stringify(data);
  const headers: Record<string, string> = options.headers || {};
  headers['Content-Type'] = 'application/json';

  return makePost(url, body, { headers });
};

export const getAuth0Token = (): Promise<any> => {
  const url = `https://${process.env.AUTH0_DOMAIN}/oauth/token`;
  const headers: Record<string, string> = {};
  headers['Content-Type'] = 'application/json';

  const body = {
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
    grant_type: 'client_credentials',
  };
  return makeJSONPost(url, body, headers);
};

export const createUserAuth0 = (data: any, token: string, tokenType: string): Promise<any> => {
  const url = `https://${process.env.AUTH0_DOMAIN}/api/v2/users`;
  const headers: Record<string, string> = { Authorization: `${tokenType} ${token}` };
  const body = data;
  return makeJSONPost(url, body, { headers });
};

export const resetPasswordAuth0 = (data: any, token: string, tokenType: string): Promise<any> => {
  const url = `https://${process.env.AUTH0_DOMAIN}/api/v2/tickets/password-change`;
  const headers: Record<string, string> = { Authorization: `${tokenType} ${token}` };
  const body = data;
  return makeJSONPost(url, body, { headers });
};

export const postEmail = (data: any, token: string, tokenType: string) => {
  const url = `https://${process.env.AUTH0_DOMAIN}/api/v2/jobs/verification-email`;
  const headers: Record<string, string> = { Authorization: `${tokenType} ${token}` };
  headers['Content-Type'] = 'application/json';
  console.log(headers);
  return makeJSONPost(url, data, { headers });
};

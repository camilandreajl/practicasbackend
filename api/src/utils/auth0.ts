interface RequestOptions {
  headers?: Record<string, string>;
}

interface NextAuthCredentials {
  NEXT_PUBLIC_API_URL: string;
  AUTH0_CLIENT_ID: string;
  AUTH0_CLIENT_SECRET: string;
  AUTH0_DOMAIN: string;
  EMAIL_SERVER: string;
  EMAIL_FROM: string;
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;
  EMAIL_PORT: string;
  EMAIL_HOST: string;
}

const makePost = async (
  url: string,
  body: any,
  options: RequestOptions = {}
): Promise<any> => {
  const headers: Record<string, string> = options.headers || {};
  const response = await fetch(url, { body, headers, method: 'POST' });

  if (response.statusText === 'No Content') {
    return response;
  }
  return response.json();
};

const makeJSONPost = async (
  url: string,
  data: any,
  options: RequestOptions = {}
): Promise<any> => {
  const body = JSON.stringify(data);
  const headers: Record<string, string> = options.headers || {};
  headers['Content-Type'] = 'application/json';

  return makePost(url, body, { headers });
};

export const getAuth0Token = async (
  data: NextAuthCredentials
): Promise<any> => {
  try {
    const url = `https://${data?.AUTH0_DOMAIN || process.env.AUTH0_DOMAIN}/oauth/token`;
    const headers: Record<string, string> = {};
    headers['Content-Type'] = 'application/json';

    const body = {
      client_id: data?.AUTH0_CLIENT_ID || process.env.AUTH0_CLIENT_ID,
      client_secret:
        data?.AUTH0_CLIENT_SECRET || process.env.AUTH0_CLIENT_SECRET,
      audience: `https://${data?.AUTH0_DOMAIN || process.env.AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    };

    const response = await makeJSONPost(url, body, headers);
    return response;
  } catch (error) {
    return Error(error as string);
  }
};

export const createUserAuth0 = (
  data: any,
  token: string,
  tokenType: string,
  AUTH0_DOMAIN: string
): Promise<any> => {
  try {
    const url = `https://${AUTH0_DOMAIN || process.env.AUTH0_DOMAIN}/api/v2/users`;
    const headers: Record<string, string> = {
      Authorization: `${tokenType} ${token}`,
    };
    const body = data;
    return makeJSONPost(url, body, { headers });
  } catch (error) {
    return Promise.reject(new Error(error as string));
  }
};

export const resetPasswordAuth0 = (
  data: any,
  token: string,
  tokenType: string
): Promise<any> => {
  const url = `https://${process.env.AUTH0_DOMAIN}/api/v2/tickets/password-change`;
  const headers: Record<string, string> = {
    Authorization: `${tokenType} ${token}`,
  };
  const body = data;
  return makeJSONPost(url, body, { headers });
};

export const postEmail = (data: any, token: string, tokenType: string) => {
  const url = `https://${process.env.AUTH0_DOMAIN}/api/v2/jobs/verification-email`;
  const headers: Record<string, string> = {
    Authorization: `${tokenType} ${token}`,
  };
  headers['Content-Type'] = 'application/json';
  return makeJSONPost(url, data, { headers });
};

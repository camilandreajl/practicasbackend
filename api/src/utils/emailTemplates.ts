export const welcomeEmail = (data: any) => {
  const { name, password } = data;
  return {
    subject: 'Welcome to the app',
    template: `
    <h1> Welcome </h1>
    `,
  };
};

export const changePassword = (data: any) => {
  const { url } = data;
  return {
    subject: 'Change Password',
    template: `
    <h1> Change password </h1>
    `,
  };
};

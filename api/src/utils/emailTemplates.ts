export const welcomeEmail = ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  return {
    subject: 'Welcome to the app',
    template: `
    <h1> Welcome </h1>
    ${email}
    ${name ? `<p> Name: ${name} </p>` : ''}
    ${password ? `<p> Password: ${password} </p>` : ''}
    `,
  };
};

export const changePassword = ({ url }: { url: string }) => {
  return {
    subject: 'Change Password',
    template: `
    <h1> Change password </h1>
    <p> Click the link below to change your password </p>
    <a href="${url}"> Change password </a>
    `,
  };
};

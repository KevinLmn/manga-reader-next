export async function requireAuthentication(context: any) {
  const { req } = context;
  const { authToken } = req.session || {};

  if (!authToken) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

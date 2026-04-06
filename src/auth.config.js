// Edge-compatible config — no Node.js-only imports (no mongoose, no crypto)
const authConfig = {
  providers: [],
  pages: { signIn: '/login' },
  trustHost: true,
  session: { strategy: 'jwt' },
  callbacks: {
    async session({ session, token }) {
      session.user.id              = token.userId;
      session.user.isAdmin         = token.isAdmin;
      session.user.profileComplete = token.profileComplete;
      session.user.firstName       = token.firstName;
      session.user.lastName        = token.lastName;
      return session;
    },
  },
};
export default authConfig;

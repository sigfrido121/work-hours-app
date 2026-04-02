// Edge-compatible config — no Node.js-only imports (no mongoose, no crypto)
const authConfig = {
  providers: [],
  pages: { signIn: '/login' },
};
export default authConfig;

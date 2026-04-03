import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import authConfig from '@/auth.config';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, trigger, session }) {
      // Cuando el cliente llama a session.update(), actualizar el token
      if (trigger === 'update' && session) {
        if (session.profileComplete !== undefined) token.profileComplete = session.profileComplete;
        if (session.firstName)  token.firstName  = session.firstName;
        if (session.lastName)   token.lastName   = session.lastName;
        if (session.isAdmin !== undefined) token.isAdmin = session.isAdmin;
      }
      // Login inicial con Google
      if (account && profile) {
        await dbConnect();
        const userCount   = await User.countDocuments();
        const isFirstUser = userCount === 0;
        const dbUser = await User.findOneAndUpdate(
          { googleId: account.providerAccountId },
          {
            $setOnInsert: {
              googleId: account.providerAccountId,
              email:    token.email,
              avatar:   profile.picture ?? '',
              isAdmin:  isFirstUser,
              profileComplete: false,
            },
          },
          { upsert: true, new: true }
        );
        token.userId          = dbUser._id.toString();
        token.isAdmin         = dbUser.isAdmin;
        token.profileComplete = dbUser.profileComplete;
        token.firstName       = dbUser.firstName;
        token.lastName        = dbUser.lastName;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id              = token.userId;
      session.user.isAdmin         = token.isAdmin;
      session.user.profileComplete = token.profileComplete;
      session.user.firstName       = token.firstName;
      session.user.lastName        = token.lastName;
      return session;
    },
  },
});

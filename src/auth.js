import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        await dbConnect();
        const dbUser = await User.findOneAndUpdate(
          { googleId: account.providerAccountId },
          {
            $setOnInsert: {
              googleId: account.providerAccountId,
              email:    token.email,
              avatar:   profile.picture ?? '',
              isAdmin:  false,
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

  pages: {
    signIn: '/login',
  },
});

// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { supabaseAdmin } from '../../../lib/supabase-admin';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: { strategy: 'jwt' },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return false;

      // Check if profile already exists (NextAuth doesn't use Supabase auth.users)
      const { data: existing } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();

      if (!existing) {
        // New user — let Supabase generate a UUID (no FK to auth.users)
        const { error } = await supabaseAdmin
          .from('profiles')
          .insert({ name: user.name, email: user.email, avatar_url: user.image });
        if (error) console.error('Supabase insert error:', error.message);
      } else {
        // Returning user — refresh name/avatar in case they updated Google profile
        await supabaseAdmin
          .from('profiles')
          .update({ name: user.name, avatar_url: user.image })
          .eq('email', user.email);
      }
      return true;
    },

    // Attach Supabase profile id to JWT
    async jwt({ token, user, account }) {
      if (account?.provider === 'google' && user?.email) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id, name, avatar_url')
          .eq('email', user.email)
          .single();

        if (profile) {
          token.supabaseId  = profile.id;
          token.name        = profile.name;
          token.picture     = profile.avatar_url;
        }
      }
      return token;
    },

    // Expose supabaseId to the client session
    async session({ session, token }) {
      session.user.supabaseId = token.supabaseId;
      return session;
    },
  },

  pages: {
    signIn: '/',          // redirect here if not logged in
    error:  '/?error=1',
  },
};

export default NextAuth(authOptions);

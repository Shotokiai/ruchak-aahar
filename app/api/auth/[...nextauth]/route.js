import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { supabaseAdmin } from '../../../../lib/supabase-admin';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return false;
      const { data: existing } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();
      if (!existing) {
        await supabaseAdmin.from('profiles').insert({ name: user.name, email: user.email, avatar_url: user.image });
      } else {
        await supabaseAdmin.from('profiles').update({ name: user.name, avatar_url: user.image }).eq('email', user.email);
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === 'google' && user?.email) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id, name, avatar_url')
          .eq('email', user.email)
          .single();
        if (profile) {
          token.supabaseId = profile.id;
          token.name = profile.name;
          token.picture = profile.avatar_url;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.supabaseId = token.supabaseId;
      return session;
    },
  },
  pages: { signIn: '/', error: '/?error=1' },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

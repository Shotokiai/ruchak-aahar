// pages/_app.js
import { SessionProvider } from 'next-auth/react';
import '../styles/globals.css';
import CulinaryApp from '../components/CulinaryApp';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <CulinaryApp />
    </SessionProvider>
  );
}

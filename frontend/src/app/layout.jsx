import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import CustomProgressBar from './components/CustomProgressBar';
import QueryProvider from './providers/QueryProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'PHINMA - COC CEA Statistics',
  description: 'Dashboard for PHINMA - COC CEA Statistics',
  icons: {
    icon: '/cea_logo_not_transparent.jpg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <head>
        <link rel='icon' href='/cea_logo_not_transparent.jpg' sizes='any' />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <CustomProgressBar />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'MoSPI × iGOT Karmayogi — Competency Intelligence',
  description: 'Role-based competency gap analysis, personalised iGOT learning paths, and source-grounded AI quizzes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="container">{children}</main>
        <footer className="footer">
          Demo environment · data stored locally · course recommendations open on igotkarmayogi.gov.in
        </footer>
      </body>
    </html>
  );
}

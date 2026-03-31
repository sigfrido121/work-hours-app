import './globals.css';
import AuthProvider from '@/components/AuthProvider';

export const metadata = {
  title: 'WorkHours - Gestión Profesional de Tiempo',
  description: 'Controla tus horas de trabajo de manera eficiente',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

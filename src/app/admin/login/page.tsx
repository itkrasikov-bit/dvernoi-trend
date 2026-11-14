import type { Metadata } from 'next';
import { LoginForm } from '@/components/LoginForm';

export const metadata: Metadata = {
  title: 'Вход в панель управления',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-14">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 text-center">
          <p className="eyebrow justify-center">Дверной тренд</p>
          <h1 className="mt-3 text-3xl text-forest">Панель управления</h1>
          <p className="mt-2 text-sm text-muted">Введите пароль администратора</p>
        </div>

        <LoginForm />

        <p className="mt-4 text-center text-xs text-muted">
          Пароль задаётся переменной окружения <code>ADMIN_PASSWORD</code>
        </p>
      </div>
    </div>
  );
}

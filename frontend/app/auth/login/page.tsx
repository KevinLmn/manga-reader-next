import { LoginForm } from '@/app/(features)/auth/components/login-form';
import { GalleryVerticalEnd } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex h-92 rounded-md items-center justify-center bg-gray-100 dark:bg-gray-800 px-4 py-2">
        <div className="w-full max-w-md space-y-6">
          <Link href="/" className="flex items-center gap-2 justify-center font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-900 text-gray-50 dark:bg-gray-50 dark:text-gray-900">
              <GalleryVerticalEnd className="size-4" />
            </div>
            KL Inc.
          </Link>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

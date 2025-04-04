import { Button } from '@/app/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { cn } from '@/lib/utils';

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your Apple or Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-6 mx-auto max-w-2xl grid-cols-1">
              <div className="flex flex-col gap-4 w-full">
                <Button variant="outline" className="flex items-between justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Apple
                </Button>
                <Button variant="outline" className="flex items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      d="M21.805 10.023h-9.764v3.954h5.622c-.24 1.26-1.01 2.324-2.14 3.032l-.004.025 3.1 2.403.215.021c1.973-1.82 3.115-4.5 3.115-7.435 0-.647-.057-1.274-.144-1.904z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12.041 22c2.805 0 5.16-.928 6.88-2.51l-3.284-2.547c-.889.598-2.036.956-3.598.956-2.761 0-5.102-1.86-5.933-4.357l-.027.002-3.221 2.492-.042.024C3.736 19.746 7.604 22 12.041 22z"
                      fill="#34A853"
                    />
                    <path
                      d="M6.108 13.541a5.978 5.978 0 0 1-.33-1.933c0-.672.12-1.324.315-1.933L2.822 7.14l-.03.016A9.946 9.946 0 0 0 1.04 11.608c0 1.606.396 3.122 1.092 4.468l3.976-3.062z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12.041 5.951c1.522 0 2.548.654 3.134 1.202l2.292-2.232C16.256 3.515 14.254 2.6 12.041 2.6 7.604 2.6 3.736 4.854 2.03 8.284l4.058 3.124c.83-2.497 3.172-4.357 5.933-4.357z"
                      fill="#EA4335"
                    />
                  </svg>
                  Login with Google
                </Button>
              </div>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-gray-200 dark:after:border-gray-800">
                <span className="relative z-10 bg-white px-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="m@example.com" required />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
                      Forgot your password?
                    </a>
                  </div>
                  <Input id="password" type="password" required />
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account? {''}
                <a href="#" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-gray-500 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-gray-900  dark:text-gray-400 dark:[&_a]:hover:text-gray-50">
        By clicking continue, you agree to our <a href="#">Terms of Service </a>
        {''}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}

import Link from 'next/link';
import { OctreeLogo } from '@/components/icons/octree-logo';
import { LogoutButton } from '@/components/auth/logout-button';
import { DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['700'],
});

type NavbarProps = {
  userName: string | null;
};

export default function Navbar({ userName }: NavbarProps) {
  return (
    <nav className="border-b border-blue-100 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <OctreeLogo className="h-8 w-8 text-blue-600" />
              <span
                className={`text-xl font-bold tracking-tight text-blue-900 ${dmSans.className}`}
              >
                Octree
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <span className="font-medium text-neutral-900">{userName}</span>
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}

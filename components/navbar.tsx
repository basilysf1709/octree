import Link from 'next/link';
import { OctreeLogo } from '@/components/icons/octree-logo';
import { UserProfileDropdown } from '@/components/user/user-profile-dropdown';
import { DM_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
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
              <OctreeLogo className="h-8 w-8" />
              <span
                className={cn(
                  'text-xl font-medium tracking-tight text-neutral-900',
                  dmSans.className
                )}
              >
                Octree
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <UserProfileDropdown userName={userName} />
          </div>
        </div>
      </div>
    </nav>
  );
}

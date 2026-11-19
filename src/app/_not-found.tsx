import Link from 'next/link';

export default function NotFound() {
  return <h1 className="text-center py-20">404 - Page Not Found. <Link href="/">Go Home</Link></h1>;
}
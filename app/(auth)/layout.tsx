import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <div className='absolute left-4 top-8'>
                <Link
                    href='/'
                    className='flex gap-1 items-center hover:-translate-x-1 transition-transform text-muted rounded-full p-3 bg-secondary-foreground'>
                    <ArrowLeft className='size-4' />
                </Link>
            </div>
            <div className='flex h-screen w-screen items-center justify-center'>
                {children}
            </div>
        </>
    );
};

export default AuthLayout;

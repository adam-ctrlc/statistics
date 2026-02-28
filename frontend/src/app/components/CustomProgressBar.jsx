'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

export default function CustomProgressBar() {
  const pathname = usePathname();

  useEffect(() => {
    const handleClick = (event) => {
      const target = event.target.closest('a');
      if (target && target.getAttribute('href')) {
        const href = target.getAttribute('href');
        if (href.startsWith('/') && href !== pathname) {
          NProgress.start();
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [pathname]);

  useEffect(() => {
    NProgress.done();
  }, [pathname]);

  return null;
}

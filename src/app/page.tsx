import { Suspense } from 'react';
import HomePage from './home-page';
import { AppHeader } from '@/components/shared/header';
import { AppFooter } from '@/components/shared/footer';
import { Skeleton } from '@/components/ui/skeleton';

function HomePageSkeleton() {
    return (
         <div className="flex min-h-screen flex-col">
          <AppHeader />
          <main className="flex-grow">
            <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-grid-white/[0.05]">
              <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center space-y-4 text-center">
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-[600px] mx-auto" />
                    <Skeleton className="h-6 mt-2 w-[700px] mx-auto" />
                  </div>
                  <div className="space-x-4 pt-6">
                    <Skeleton className="h-10 w-40 mx-auto" />
                  </div>
                </div>
              </div>
            </section>
            <section id="features" className="w-full py-12 md:py-24 lg:py-32">
                <div className="container px-4 md:px-6">
                    <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
                        <Skeleton className="h-40 rounded-xl" />
                        <Skeleton className="h-40 rounded-xl" />
                        <Skeleton className="h-40 rounded-xl" />
                    </div>
                </div>
            </section>
             <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
                <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-96 mx-auto" />
                        <Skeleton className="h-6 w-[600px] mx-auto" />
                    </div>
                     <div className="mx-auto w-full max-w-sm space-y-2 mt-4">
                       <Skeleton className="h-10 w-full" />
                    </div>
                </div>
             </section>
          </main>
          <AppFooter />
        </div>
    )
}

export default function Page() {
    return (
        <Suspense fallback={<HomePageSkeleton />}>
            <HomePage />
        </Suspense>
    );
}

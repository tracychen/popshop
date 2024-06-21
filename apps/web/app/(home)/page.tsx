export const metadata = {
  title: "Home | popshop*",
};

export default async function Page() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[url('/images/landing-2.webp')] bg-cover bg-center">
      {/* Welcome to the home page, current user: {currentUser?.evmAddress} */}
      <h1 className="font-sniglet text-4xl text-primary-foreground sm:text-6xl md:text-9xl">
        popshop*
      </h1>
      {/* px-4 py-2 sm:px-10 sm:py-8 */}
    </div>
  );
}

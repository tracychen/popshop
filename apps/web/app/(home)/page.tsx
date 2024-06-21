export const metadata = {
  title: "Home | popshop*",
};

export default async function Page() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[url('/images/landing-2.webp')] bg-cover bg-center">
      <h1 className="font-sniglet text-4xl text-primary-foreground sm:text-6xl md:text-9xl">
        popshop*
      </h1>
      <p className="hidden pl-8 text-muted md:flex md:text-sm">
        incentivized social commerce
      </p>
    </div>
  );
}

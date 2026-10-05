import { notFound } from "next/navigation";
import ClientApp from "@/components/ClientApp";
import DemoBar from "@/components/DemoBar";
import { hasLocale } from "@/lib/i18n";

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <>
      <DemoBar lang={lang} />
      <ClientApp lang={lang} />
    </>
  );
}

import { redirect } from "next/navigation"

export default async function ShortFestivalRedirect({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  redirect(`/festivals/${slug}`)
}

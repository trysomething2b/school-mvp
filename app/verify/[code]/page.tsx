import { safeReturnTo } from "@/lib/auth/return-to"
import { VerifyClient } from "./verify-client"

export default async function VerifyPage({
  params,
  searchParams,
}: PageProps<"/verify/[code]">) {
  const { code } = await params
  const query = await searchParams
  const returnToRaw = typeof query.returnTo === "string" ? query.returnTo : null

  return (
    <VerifyClient
      code={decodeURIComponent(code)}
      returnTo={safeReturnTo(returnToRaw)}
    />
  )
}

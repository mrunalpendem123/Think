import { redirect } from 'next/navigation'
import ChatWindow from '@/components/ChatWindow'

export const maxDuration = 60

export default async function SearchPage(props: {
  searchParams: Promise<{ q: string }>
}) {
  const { q } = await props.searchParams
  if (!q) {
    redirect('/')
  }
  return <ChatWindow />
}

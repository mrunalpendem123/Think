import ChatWindow from '@/components/ChatWindow'

export const maxDuration = 60

export async function generateMetadata(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  
  // With IndexedDB, metadata is loaded client-side
  // Return basic metadata here
  return {
    title: 'Private Search AI - Search Results'
  }
}

export default async function SearchPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  return <ChatWindow chatId={id} />
}

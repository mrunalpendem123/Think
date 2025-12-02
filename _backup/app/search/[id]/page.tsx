import { getModels } from '@/lib/config/models'

import { Chat } from '@/components/chat'

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
  const models = await getModels()
  
  // Chat component will load messages from IndexedDB client-side
  return <Chat key={id} id={id} savedMessages={[]} models={models} />
}

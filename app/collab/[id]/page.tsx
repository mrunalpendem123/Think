import ChatWindow from '@/components/ChatWindow'

export const maxDuration = 60

export async function generateMetadata(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  
  return {
    title: 'Collaborative Chat - Private Search AI'
  }
}

export default async function CollabChatPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  
  return <ChatWindow />
}


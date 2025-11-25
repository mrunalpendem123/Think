import ChatWindow from '@/components/ChatWindow'

export async function generateMetadata(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  
  return {
    title: 'Shared Chat - Private Search AI'
  }
}

export default async function SharePage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  return <ChatWindow />
}

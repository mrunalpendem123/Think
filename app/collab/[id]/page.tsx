import { getModels } from '@/lib/config/models'

import { CollaborativeChat } from '../../../components/collab/collaborative-chat'

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
  const models = await getModels()
  
  return <CollaborativeChat chatId={id} models={models} />
}


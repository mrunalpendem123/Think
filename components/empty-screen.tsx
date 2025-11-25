import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { CreateCollabButton } from './collab/create-collab-button'
import { JoinCollabDialog } from './collab/join-collab-dialog'

const exampleMessages = [
  {
    heading: 'Latest AI developments in 2025',
    message: 'What are the latest AI developments in 2025?'
  },
  {
    heading: 'How does blockchain ensure privacy?',
    message: 'How does blockchain technology ensure user privacy?'
  },
  {
    heading: 'Best privacy-focused browsers',
    message: 'What are the best privacy-focused web browsers available today?'
  },
  {
    heading: 'Web3 wallet security tips',
    message: 'What are the best security practices for Web3 wallets?'
  }
]
export function EmptyScreen({
  submitMessage,
  className
}: {
  submitMessage: (message: string) => void
  className?: string
}) {
  return (
    <div className={`mx-auto w-full transition-all ${className}`}>
      <div className="bg-background p-2">
        {/* Collaborative Chat Options */}
        <div className="mb-6 p-4 bg-primary/5 border border-primary/10 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Collaborative Mode</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Work together with others in real-time. All participants see AI responses instantly.
          </p>
          <div className="flex flex-wrap gap-2">
            <CreateCollabButton />
            <JoinCollabDialog />
          </div>
        </div>

        <Separator className="my-4" />

        {/* Example Messages */}
        <div className="mt-2 flex flex-col items-start space-y-2 mb-4">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              name={message.message}
              onClick={async () => {
                submitMessage(message.message)
              }}
            >
              <ArrowRight size={16} className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

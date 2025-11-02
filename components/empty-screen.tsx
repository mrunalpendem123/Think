import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

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

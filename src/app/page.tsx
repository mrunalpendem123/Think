import ChatWindow from '@/components/ChatWindow';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat - Think Fast',
  description: 'Chat with the internet, chat with Think Fast.',
};

const Home = () => {
  return <ChatWindow />;
};

export default Home;

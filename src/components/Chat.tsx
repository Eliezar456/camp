import React, { useState } from 'react';
import Layout from './Layout';
import { Send, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useMessageStore } from '../store/messageStore';

export default function Chat() {
  const [message, setMessage] = useState('');
  const { isAdmin, currentLeader } = useAuthStore();
  const { messages, addMessage, deleteMessage } = useMessageStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    addMessage({
      sender: isAdmin ? "Administrador" : currentLeader || "Líder",
      content: message.trim(),
      timestamp: new Date().toISOString()
    });

    setMessage('');
  };

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow h-[calc(100vh-12rem)]">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex flex-col">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline space-x-2">
                      <span className="font-semibold text-blue-600">{msg.sender}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-gray-700">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                disabled={!message.trim()}
              >
                <Send className="w-5 h-5" />
                Enviar
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import ChatSidebar, { ConversationItem } from '@/components/ai/ChatSidebar';
import ChatMessageItem, { ChatMessage } from '@/components/ai/ChatMessageItem';
import ChatComposer from '@/components/ai/ChatComposer';
import {
  sendChatMessage,
  checkChatBackendHealth,
  ConnectionStatus,
  ChatResponseData,
  LocationInput
} from '@/lib/api/chat';
import {
  Bot,
  PanelLeft,
  RefreshCw,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Compass,
  AlertTriangle,
  Menu,
  Activity,
  Layers
} from 'lucide-react';
import { useOrcaStore } from '@/stores/useOrcaStore';

const SUGGESTED_PROMPTS = [
  "What's the current ocean condition near Kochi?",
  "Show me the latest available SST information.",
  "Explain the PFZ conditions near this region.",
  "What marine conditions should I watch today?"
];

export default function OrcaAiPage() {
  const { selectedLatitude, selectedLongitude } = useOrcaStore();

  // Sidebar state
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarCollapsedDesktop, setIsSidebarCollapsedDesktop] = useState(false);

  // Backend Health
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('CONNECTING');
  const [connectionLatency, setConnectionLatency] = useState<number | undefined>(undefined);

  // Conversations State
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Messages per conversation state
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial Health Check & Periodic Ping
  useEffect(() => {
    let mounted = true;

    const doHealthCheck = async () => {
      const health = await checkChatBackendHealth();
      if (mounted) {
        setConnectionStatus(health.status);
        setConnectionLatency(health.latencyMs);
      }
    };

    doHealthCheck();
    const interval = setInterval(doHealthCheck, 30000); // 30s heartbeat check

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messagesMap, activeConversationId, isLoading]);

  // Current active conversation's messages
  const activeMessages = activeConversationId ? messagesMap[activeConversationId] || [] : [];

  // Start new conversation
  const handleNewConversation = () => {
    const newId = `conv_${Date.now()}`;
    const newConv: ConversationItem = {
      id: newId,
      title: 'New Conversation',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now()
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    setMessagesMap((prev) => ({ ...prev, [newId]: [] }));
  };

  // Delete conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setMessagesMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    if (activeConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Send message handler
  const handleSendMessage = async (text: string, locationContext?: LocationInput | null) => {
    if (!text.trim() || isLoading) return;

    let convId = activeConversationId;

    // Create a new conversation if none exists
    if (!convId) {
      convId = `conv_${Date.now()}`;
      const newConv: ConversationItem = {
        id: convId,
        title: text.length > 28 ? `${text.slice(0, 28)}...` : text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now()
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(convId);
    } else {
      // Update title of active conversation if it's "New Conversation"
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId && c.title === 'New Conversation'
            ? { ...c, title: text.length > 28 ? `${text.slice(0, 28)}...` : text }
            : c
        )
      );
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      timestamp,
      text
    };

    const loadingAssistantMessage: ChatMessage = {
      id: `msg_a_${Date.now()}`,
      sender: 'assistant',
      timestamp,
      isLoading: true
    };

    // Add user message & loading placeholder
    setMessagesMap((prev) => ({
      ...prev,
      [convId!]: [...(prev[convId!] || []), userMessage, loadingAssistantMessage]
    }));

    setIsLoading(true);

    try {
      // Build location fallback if locationContext not specified
      const loc: LocationInput | undefined = locationContext
        ? locationContext
        : selectedLatitude !== null && selectedLongitude !== null
        ? {
            name: `${selectedLatitude.toFixed(2)}°N, ${selectedLongitude.toFixed(2)}°E`,
            latitude: selectedLatitude,
            longitude: selectedLongitude
          }
        : undefined;

      const responseData: ChatResponseData = await sendChatMessage({
        message: text,
        conversation_id: convId,
        location: loc
      });

      const finalAssistantMessage: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: responseData,
        text: responseData.answer?.summary || 'Response received from ORCA Backend.'
      };

      setMessagesMap((prev) => ({
        ...prev,
        [convId!]: (prev[convId!] || []).map((msg) =>
          msg.id === loadingAssistantMessage.id ? finalAssistantMessage : msg
        )
      }));
    } catch (err: any) {
      console.error('ORCA Chat API Error:', err);

      const errorAssistantMessage: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: err?.message || 'Unable to reach ORCA Marine Intelligence service.'
      };

      setMessagesMap((prev) => ({
        ...prev,
        [convId!]: (prev[convId!] || []).map((msg) =>
          msg.id === loadingAssistantMessage.id ? errorAssistantMessage : msg
        )
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeHeader = () => {
    switch (connectionStatus) {
      case 'CONNECTED':
        return (
          <div className="flex items-center space-x-1.5 bg-emerald-950/70 border border-emerald-800 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold">CONNECTED</span>
            {connectionLatency && <span className="text-[9px] text-emerald-300/80">({connectionLatency}ms)</span>}
          </div>
        );
      case 'CONNECTING':
        return (
          <div className="flex items-center space-x-1.5 bg-blue-950/70 border border-blue-800 text-blue-400 px-2 py-0.5 rounded text-[10px] font-mono">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="font-bold">CONNECTING</span>
          </div>
        );
      case 'DEGRADED':
        return (
          <div className="flex items-center space-x-1.5 bg-amber-950/70 border border-amber-800 text-amber-400 px-2 py-0.5 rounded text-[10px] font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-bold">DEGRADED</span>
          </div>
        );
      case 'ERROR':
      default:
        return (
          <div className="flex items-center space-x-1.5 bg-rose-950/70 border border-rose-800 text-rose-400 px-2 py-0.5 rounded text-[10px] font-mono">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span className="font-bold">OFFLINE</span>
          </div>
        );
    }
  };

  const defaultLocationContext: LocationInput | null =
    selectedLatitude !== null && selectedLongitude !== null
      ? {
          name: `${selectedLatitude.toFixed(2)}°N, ${selectedLongitude.toFixed(2)}°E`,
          latitude: selectedLatitude,
          longitude: selectedLongitude
        }
      : null;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07162c] text-white font-sans overflow-hidden select-none">
      {/* Top Global Header */}
      <Navigation />

      {/* Main AI Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Conversations Sidebar */}
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          connectionStatus={connectionStatus}
          connectionLatencyMs={connectionLatency}
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
          isCollapsedDesktop={isSidebarCollapsedDesktop}
          onToggleCollapseDesktop={() => setIsSidebarCollapsedDesktop(!isSidebarCollapsedDesktop)}
        />

        {/* Right Primary Chat Area */}
        <div className="flex-1 flex flex-col h-full bg-[#07162c] relative overflow-hidden">
          {/* Workspace Header */}
          <div className="h-14 border-b border-[#1b3459] px-4 flex items-center justify-between bg-[#0a1b33] z-20 shrink-0">
            <div className="flex items-center space-x-3">
              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setIsSidebarOpenMobile(true)}
                className="lg:hidden p-1.5 text-muted-orca hover:text-white hover:bg-[#12315b] rounded transition-colors"
                title="Open Conversations"
              >
                <Menu className="w-4 h-4" />
              </button>

              {/* Desktop Expand Sidebar Trigger */}
              {isSidebarCollapsedDesktop && (
                <button
                  onClick={() => setIsSidebarCollapsedDesktop(false)}
                  className="hidden lg:flex items-center space-x-1 p-1.5 text-muted-orca hover:text-white hover:bg-[#12315b] rounded transition-colors font-mono text-xs"
                  title="Expand Sidebar"
                >
                  <PanelLeft className="w-4 h-4" />
                  <span className="text-[10px] font-bold">SIDEBAR</span>
                </button>
              )}

              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-md bg-orca-blue flex items-center justify-center text-white shadow-sm border border-[#2b7bf5]/40">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    ORCA AI
                  </h1>
                  <span className="text-[9.5px] text-muted-orca font-mono block">
                    Marine Intelligence Assistant
                  </span>
                </div>
              </div>
            </div>

            {/* Right Status Badge */}
            <div className="flex items-center space-x-3">
              {getStatusBadgeHeader()}
            </div>
          </div>

          {/* Messages & Scroll Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth bg-[#061426]"
          >
            {/* Welcome State when conversation has no messages */}
            {activeMessages.length === 0 && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-4 py-8 space-y-6 font-sans">
                <div className="w-16 h-16 rounded-2xl bg-orca-blue/10 border-2 border-orca-blue/40 flex items-center justify-center text-orca-blue shadow-xl">
                  <Bot className="w-8 h-8" />
                </div>

                <div className="space-y-2 max-w-lg">
                  <span className="text-[11px] font-mono text-orca-blue font-bold uppercase tracking-widest block">
                    PROJECT ORCA • REST AGENT INTELLIGENCE
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white font-mono">
                    ORCA AI Assistant
                  </h2>
                  <p className="text-xs sm:text-sm text-[#a4c2f4] leading-relaxed">
                    Ask questions about ocean conditions, satellite observations, Potential Fishing Zone (PFZ) advisories, weather alerts, and safety protocols connected to ORCA&apos;s REST intelligence backend.
                  </p>
                </div>

                {/* Suggested Prompts Cards */}
                <div className="w-full text-left space-y-2 pt-4 border-t border-[#1b3459]/50">
                  <span className="text-[10px] font-mono text-muted-orca uppercase tracking-wider block">
                    SUGGESTED ANALYTICAL PROMPTS
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SUGGESTED_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt, defaultLocationContext)}
                        className="p-3 bg-[#0a1c35] hover:bg-[#112d53] text-[#a4c2f4] hover:text-white border border-[#173863] hover:border-orca-blue rounded-lg text-left text-xs font-mono transition-all flex items-start justify-between group cursor-pointer shadow-sm"
                      >
                        <span className="leading-snug pr-2">&gt; &quot;{prompt}&quot;</span>
                        <ArrowRight className="w-3.5 h-3.5 text-orca-blue shrink-0 opacity-60 group-hover:opacity-100 transition-opacity mt-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Message Feed */}
            {activeMessages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} />
            ))}
          </div>

          {/* Bottom Chat Composer */}
          <ChatComposer
            onSendMessage={(t, loc) => handleSendMessage(t, loc)}
            isLoading={isLoading}
            initialLocation={defaultLocationContext}
          />
        </div>
      </div>
    </div>
  );
}

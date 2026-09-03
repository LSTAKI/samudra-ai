'use client';

import React from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  X,
  Radio,
  Clock,
  Sparkles,
  Bot,
  Activity,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { ConnectionStatus } from '@/lib/api/chat';

export interface ConversationItem {
  id: string;
  title: string;
  timestamp: string;
  lastMessage?: string;
  createdAt: number;
}

interface ChatSidebarProps {
  conversations: ConversationItem[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  connectionStatus: ConnectionStatus;
  connectionLatencyMs?: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsedDesktop: boolean;
  onToggleCollapseDesktop: () => void;
}

export default function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  connectionStatus,
  connectionLatencyMs,
  isOpenMobile,
  onCloseMobile,
  isCollapsedDesktop,
  onToggleCollapseDesktop
}: ChatSidebarProps) {
  // Group conversations by time category
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const todayList = conversations.filter((c) => now - c.createdAt < oneDayMs);
  const yesterdayList = conversations.filter(
    (c) => now - c.createdAt >= oneDayMs && now - c.createdAt < 2 * oneDayMs
  );
  const earlierList = conversations.filter((c) => now - c.createdAt >= 2 * oneDayMs);

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'CONNECTED':
        return (
          <div className="flex items-center space-x-1.5 bg-emerald-950/80 border border-emerald-800 text-emerald-400 px-2 py-0.5 rounded text-[9px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold">CONNECTED</span>
            {connectionLatencyMs && <span>({connectionLatencyMs}ms)</span>}
          </div>
        );
      case 'CONNECTING':
        return (
          <div className="flex items-center space-x-1.5 bg-blue-950/80 border border-blue-800 text-blue-400 px-2 py-0.5 rounded text-[9px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="font-bold">CONNECTING</span>
          </div>
        );
      case 'DEGRADED':
        return (
          <div className="flex items-center space-x-1.5 bg-amber-950/80 border border-amber-800 text-amber-400 px-2 py-0.5 rounded text-[9px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-bold">DEGRADED</span>
          </div>
        );
      case 'ERROR':
      default:
        return (
          <div className="flex items-center space-x-1.5 bg-rose-950/80 border border-rose-800 text-rose-400 px-2 py-0.5 rounded text-[9px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            <span className="font-bold">OFFLINE</span>
          </div>
        );
    }
  };

  const renderSection = (title: string, list: ConversationItem[]) => {
    if (list.length === 0) return null;
    return (
      <div className="space-y-1">
        <span className="text-[9px] font-mono text-muted-orca uppercase tracking-wider block px-2 pt-2">
          {title} ({list.length})
        </span>
        <div className="space-y-0.5">
          {list.map((item) => {
            const isActive = item.id === activeConversationId;
            return (
              <div
                key={item.id}
                className={`group relative flex items-center justify-between px-2.5 py-2 rounded-md font-mono text-xs cursor-pointer transition-all ${
                  isActive
                    ? 'bg-orca-blue text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-[#0f2a4f] hover:text-white'
                }`}
                onClick={() => {
                  onSelectConversation(item.id);
                  onCloseMobile();
                }}
              >
                <div className="flex items-center space-x-2 truncate pr-6">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-orca-blue'}`} />
                  <span className="truncate">{item.title}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(item.id);
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-1 hover:text-rose-300 transition-opacity cursor-pointer ${
                    isActive ? 'text-white' : 'text-muted-orca'
                  }`}
                  title="Delete conversation"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-ocean-navy text-white select-none border-r border-[#1b3459] font-sans">
      {/* Sidebar Header */}
      <div className="h-14 px-4 border-b border-[#1b3459] flex items-center justify-between bg-[#0a1b33]">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-orca-blue flex items-center justify-center text-white shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              ORCA CONVERSATIONS
            </span>
            <span className="text-[9px] text-muted-orca font-mono mt-0.5">
              Marine REST Session State
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-muted-orca hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          {/* Desktop collapse button */}
          <button
            onClick={onToggleCollapseDesktop}
            className="hidden lg:block p-1 text-muted-orca hover:text-white cursor-pointer"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* New Conversation Button */}
      <div className="p-3 border-b border-[#1b3459]/60">
        <button
          type="button"
          onClick={() => {
            onNewConversation();
            onCloseMobile();
          }}
          className="w-full bg-orca-blue hover:bg-[#085ae6] text-white py-2 px-3 rounded-md font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 shadow-md cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>New Conversation</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-orca text-xs font-mono space-y-1">
            <Sparkles className="w-5 h-5 mx-auto text-[#1c4b82] mb-1" />
            <p>No active conversations in current session.</p>
            <p className="text-[10px] text-slate-500">Click &quot;New Conversation&quot; to start.</p>
          </div>
        ) : (
          <>
            {renderSection('Today', todayList)}
            {renderSection('Yesterday', yesterdayList)}
            {renderSection('Earlier', earlierList)}
          </>
        )}
      </div>

      {/* Sidebar Footer — Live Backend Status */}
      <div className="p-3 border-t border-[#1b3459] bg-[#07162c] space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-muted-orca uppercase">BACKEND SERVICE:</span>
          {getStatusBadge()}
        </div>
        <div className="text-[9px] font-mono text-slate-400 truncate">
          Target: <span className="text-slate-200">https://ocra-y11h.onrender.com</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {!isCollapsedDesktop && (
        <aside className="hidden lg:block w-72 h-full shrink-0">
          {sidebarContent}
        </aside>
      )}

      {/* Mobile Slide-out Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-80 max-w-[85vw] h-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

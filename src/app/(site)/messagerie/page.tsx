'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Send, Search, Hash, MessageSquare, Users, LogIn, X, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'

/* ─────────────── Types ─────────────── */
interface PlayerUser { id: string; username: string; avatar: string | null; ecoName: string | null }
interface Channel { id: string; name: string; icon: string | null; color: string; description: string | null; _count?: { messages: number } }
interface Conversation {
  partner: { id: string; name: string; avatar: string | null; ecoName: string | null }
  lastMessage: { content: string; createdAt: string; fromMe: boolean }
  unread: number
}
interface Msg {
  id: string; content: string; createdAt: string
  sender?: { id: string; name: string; avatar: string | null }
  author?: { id: string; name: string; avatar: string | null; ecoName: string | null;
             job: { name: string; icon: string | null } | null
             playerRank: { name: string; color: string; badge: string | null } | null }
}
interface SearchPlayer { id: string; name: string; avatar: string | null; ecoName: string | null; discordTag: string | null }

type View = { type: 'channel'; id: string } | { type: 'dm'; userId: string; name: string; avatar: string | null }

/* ─────────────── Composant principal ─────────────── */
export default function MessageriePage() {
  const [me,            setMe]            = useState<PlayerUser | null>(null)
  const [authLoading,   setAuthLoading]   = useState(true)
  const [channels,      setChannels]      = useState<Channel[]>([])
  const [convos,        setConvos]        = useState<Conversation[]>([])
  const [messages,      setMessages]      = useState<Msg[]>([])
  const [view,          setView]          = useState<View | null>(null)
  const [input,         setInput]         = useState('')
  const [sending,       setSending]       = useState(false)
  const [searchQuery,   setSearchQuery]   = useState('')
  const [searchResults, setSearchResults] = useState<SearchPlayer[]>([])
  const [searching,     setSearching]     = useState(false)
  const [mobileView,    setMobileView]    = useState<'sidebar' | 'chat'>('sidebar')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef        = useRef<ReturnType<typeof setInterval> | null>(null)

  /* Auth */
  useEffect(() => {
    fetch('/api/player/auth/me').then(r => r.json()).then(d => { setMe(d); setAuthLoading(false) })
      .catch(() => setAuthLoading(false))
  }, [])

  /* Canaux + conversations */
  useEffect(() => {
    if (!me) return
    fetch('/api/channels').then(r => r.json()).then(setChannels)
    fetch('/api/messages').then(r => r.json()).then(setConvos)
  }, [me])

  /* Chargement + polling des messages */
  const loadMessages = useCallback(async () => {
    if (!view) return
    const url = view.type === 'channel'
      ? `/api/channels/${view.id}/messages`
      : `/api/messages/${view.userId}`
    const res = await fetch(url)
    if (res.ok) setMessages(await res.json())
  }, [view])

  useEffect(() => {
    setMessages([])
    loadMessages()
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(loadMessages, 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [loadMessages])

  /* Scroll bas */
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  /* Recherche joueurs */
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      const res = await fetch(`/api/players?search=${encodeURIComponent(searchQuery)}`)
      if (res.ok) setSearchResults(await res.json())
      setSearching(false)
    }, 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  /* Envoi */
  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !view || sending) return
    setSending(true)
    try {
      const url  = view.type === 'channel' ? `/api/channels/${view.id}/messages` : '/api/messages'
      const body = view.type === 'channel'
        ? { content: input.trim() }
        : { receiverId: view.userId, content: input.trim() }
      const res = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      if (!res.ok) { toast.error('Erreur envoi.'); return }
      setInput('')
      await loadMessages()
      if (view.type === 'dm') {
        fetch('/api/messages').then(r => r.json()).then(setConvos)
      }
    } finally { setSending(false) }
  }

  function openDM(player: SearchPlayer) {
    setView({ type: 'dm', userId: player.id, name: player.name, avatar: player.avatar })
    setSearchQuery('')
    setSearchResults([])
    setMobileView('chat')
  }

  function selectChannel(ch: Channel) {
    setView({ type: 'channel', id: ch.id })
    setMobileView('chat')
  }

  function selectConvo(c: Conversation) {
    setView({ type: 'dm', userId: c.partner.id, name: c.partner.name, avatar: c.partner.avatar })
    setMobileView('chat')
  }

  /* Auth guard */
  if (authLoading) return (
    <div className="min-h-screen bg-[#F2E8D5] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#1A3D2B] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!me) return (
    <div className="min-h-screen bg-[#F2E8D5] flex flex-col items-center justify-center gap-6 px-4">
      <MessageSquare size={48} className="text-[#9AB09A]" />
      <div className="text-center">
        <h1 className="font-display font-bold text-2xl text-[#1A3D2B] mb-2">Messagerie</h1>
        <p className="text-[#4A6854] text-sm mb-6">Connecte-toi pour accéder à la messagerie.</p>
        <Link href="/connexion" className="btn-primary inline-flex"><LogIn size={16} /> Se connecter</Link>
      </div>
    </div>
  )

  const viewTitle = view?.type === 'channel'
    ? channels.find(c => c.id === view.id)
    : null

  return (
    <div className="h-screen flex flex-col bg-[#F2E8D5] pt-16 md:pt-20">
      <div className="flex flex-1 overflow-hidden max-w-7xl w-full mx-auto">

        {/* ── Sidebar ── */}
        <aside className={`${mobileView === 'chat' ? 'hidden' : 'flex'} md:flex flex-col w-full md:w-72 bg-white border-r border-[var(--color-border)] flex-shrink-0`}>

          {/* Recherche joueur */}
          <div className="p-3 border-b border-[var(--color-border)]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D5F4A]" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                     placeholder="Trouver un joueur…"
                     className="input pl-8 text-sm py-2" />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults([]) }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#3D5F4A] hover:text-[#1A3D2B]">
                  <X size={14} />
                </button>
              )}
            </div>
            {(searchResults.length > 0 || searching) && (
              <div className="mt-1 bg-white border border-[var(--color-border)] rounded-lg shadow-lg overflow-hidden">
                {searching ? (
                  <div className="p-3 text-center text-xs text-[#4A6854]">Recherche…</div>
                ) : (
                  searchResults.map(p => (
                    <button key={p.id} onClick={() => openDM(p)}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#F2E8D5] transition-colors text-left">
                      <Avatar name={p.name} avatar={p.avatar} size={28} />
                      <div>
                        <p className="text-xs font-semibold text-[#1A3D2B]">{p.name}</p>
                        {p.ecoName && <p className="text-[10px] text-[#4A6854]">🎮 {p.ecoName}</p>}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Canaux */}
            {channels.length > 0 && (
              <div>
                <p className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#3D5F4A]">
                  Canaux
                </p>
                {channels.map(ch => (
                  <button key={ch.id} onClick={() => selectChannel(ch)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                            view?.type === 'channel' && view.id === ch.id
                              ? 'bg-[rgba(26,61,43,0.08)] text-[#1A3D2B]'
                              : 'text-[#4A6854] hover:bg-[rgba(26,61,43,0.04)] hover:text-[#1A3D2B]'
                          }`}>
                    <span className="text-base flex-shrink-0">{ch.icon ?? '#'}</span>
                    <span className="text-sm font-medium truncate">{ch.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Messages privés */}
            <div>
              <p className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#3D5F4A] flex items-center gap-1.5">
                <Users size={10} /> Messages privés
              </p>
              {convos.length === 0 ? (
                <p className="px-3 py-2 text-xs text-[#9AB09A] italic">Aucune conversation</p>
              ) : (
                convos.map(c => (
                  <button key={c.partner.id} onClick={() => selectConvo(c)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                            view?.type === 'dm' && view.userId === c.partner.id
                              ? 'bg-[rgba(26,61,43,0.08)]'
                              : 'hover:bg-[rgba(26,61,43,0.04)]'
                          }`}>
                    <Avatar name={c.partner.name} avatar={c.partner.avatar} size={30} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A3D2B] truncate">{c.partner.name}</p>
                      <p className="text-xs text-[#4A6854] truncate">
                        {c.lastMessage.fromMe ? 'Vous : ' : ''}{c.lastMessage.content}
                      </p>
                    </div>
                    {c.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#D4A820] text-[#1A3D2B] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {c.unread}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* ── Zone de chat ── */}
        <main className={`${mobileView === 'sidebar' ? 'hidden' : 'flex'} md:flex flex-1 flex-col overflow-hidden`}>
          {!view ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[rgba(82,183,136,0.1)] flex items-center justify-center">
                <MessageSquare size={28} className="text-[#52B788]" />
              </div>
              <div>
                <p className="font-display font-bold text-[#1A3D2B] text-lg">Messagerie Voilectia</p>
                <p className="text-[#4A6854] text-sm mt-1">
                  Sélectionne un canal ou cherche un joueur pour démarrer une conversation.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header chat */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] bg-white flex-shrink-0">
                <button onClick={() => setMobileView('sidebar')} className="md:hidden text-[#3D5F4A] hover:text-[#1A3D2B]">
                  <ChevronLeft size={20} />
                </button>
                {view.type === 'channel' && viewTitle ? (
                  <>
                    <span className="text-xl">{viewTitle.icon ?? <Hash size={16} />}</span>
                    <div>
                      <p className="font-semibold text-[#1A3D2B] text-sm">{viewTitle.name}</p>
                      {viewTitle.description && <p className="text-xs text-[#4A6854]">{viewTitle.description}</p>}
                    </div>
                  </>
                ) : view.type === 'dm' ? (
                  <>
                    <Avatar name={view.name} avatar={view.avatar} size={32} />
                    <p className="font-semibold text-[#1A3D2B] text-sm">{view.name}</p>
                  </>
                ) : null}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#F9F5EE]">
                {messages.length === 0 && (
                  <div className="text-center text-[#9AB09A] text-sm py-8 italic">
                    Aucun message. Soyez le premier à écrire !
                  </div>
                )}
                {messages.map(msg => {
                  const author    = msg.author ?? msg.sender
                  const isMe      = author?.id === me.id
                  const name      = author?.name ?? '?'
                  const avatarUrl = author?.avatar ?? null
                  return (
                    <div key={msg.id} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <Avatar name={name} avatar={avatarUrl} size={32} />
                      <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        {!isMe && (
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-[#1A3D2B]">{name}</span>
                            {msg.author?.job && (
                              <span className="text-[9px] font-medium text-[#4A6854]">
                                {msg.author.job.icon} {msg.author.job.name}
                              </span>
                            )}
                            {msg.author?.playerRank && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                    style={{ background: `${msg.author.playerRank.color}20`, color: msg.author.playerRank.color }}>
                                {msg.author.playerRank.badge} {msg.author.playerRank.name}
                              </span>
                            )}
                          </div>
                        )}
                        <div className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                          isMe
                            ? 'bg-[#1A3D2B] text-[#F2E8D5] rounded-tr-sm'
                            : 'bg-white text-[#1A3D2B] border border-[var(--color-border)] rounded-tl-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-[#9AB09A] mt-0.5 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={send} className="flex items-center gap-2 p-3 border-t border-[var(--color-border)] bg-white flex-shrink-0">
                <input value={input} onChange={e => setInput(e.target.value)}
                       placeholder={view.type === 'channel' ? 'Message dans le canal…' : `Message à ${view.name}…`}
                       className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[#1A3D2B] bg-[#F9F5EE] placeholder:text-[#9AB09A] focus:outline-none focus:ring-1 focus:ring-[#52B788] focus:border-[#52B788]"
                       maxLength={2000} />
                <button type="submit" disabled={sending || !input.trim()}
                        className="w-10 h-10 rounded-xl bg-[#1A3D2B] text-[#F2E8D5] flex items-center justify-center hover:bg-[#2D6A4F] transition-colors disabled:opacity-40 flex-shrink-0">
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

/* ─────────────── Avatar helper ─────────────── */
function Avatar({ name, avatar, size }: { name: string; avatar: string | null; size: number }) {
  if (avatar) return (
    <Image src={avatar} alt={name} width={size} height={size}
           className="rounded-full flex-shrink-0" style={{ width: size, height: size }} />
  )
  return (
    <div className="rounded-full bg-[#2D6A4F] flex items-center justify-center flex-shrink-0 text-white font-bold"
         style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

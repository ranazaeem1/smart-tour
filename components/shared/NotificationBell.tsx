'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationBellProps {
  role: 'user' | 'company' | 'admin';
  userId?: string;
  companyId?: string;
}

export function NotificationBell({ role, userId, companyId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function load() {
      if (role === 'user' && userId) {
        const { data } = await supabase
          .from('bookings')
          .select('id, status, updated_at, tours(title)')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(10);
        setNotifications(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data ?? []).map((b: any) => ({
            id: b.id,
            message: `Your booking for "${b.tours?.title ?? 'a tour'}" is ${b.status}`,
            time: b.updated_at,
            read: false,
          }))
        );
      } else if (role === 'company' && companyId) {
        const { data } = await supabase
          .from('bookings')
          .select('id, user_id, status, created_at, profiles:user_id(full_name), tours(title)')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(10);
        setNotifications(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data ?? []).map((b: any) => ({
            id: b.id,
            message: `${b.profiles?.full_name ?? 'A traveler'} booked "${b.tours?.title ?? 'your tour'}"`,
            time: b.created_at,
            read: false,
          }))
        );
      } else if (role === 'admin') {
        const { data } = await supabase
          .from('companies')
          .select('id, name, status, created_at')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(10);
        setNotifications(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data ?? []).map((c: any) => ({
            id: c.id,
            message: `New company "${c.name}" is awaiting approval`,
            time: c.created_at,
            read: false,
          }))
        );
      }
    }
    load();
  }, [role, userId, companyId]);

  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="btn btn-secondary btn-icon"
        style={{ position: 'relative', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
        title="Notifications"
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: 16, height: 16,
            background: '#EF4444', borderRadius: '50%',
            fontSize: 9, color: 'white', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />

          {/* Dropdown Panel */}
          <div style={{
            position: 'absolute', right: 0, top: 44,
            width: 320, background: '#161B27',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            zIndex: 50, overflow: 'hidden',
          }}>
            <div style={{
              padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#fff', margin: 0 }}>Notifications</p>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  style={{ fontSize: 12, color: '#60A5FA', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                  No notifications yet
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} style={{
                    padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: !n.read ? 'rgba(59,130,246,0.05)' : 'transparent',
                    cursor: 'default',
                  }}>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: '0 0 4px' }}>{n.message}</p>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, margin: 0 }}>
                      {new Date(n.time).toLocaleDateString('en-PK', {
                        day: 'numeric', month: 'short',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

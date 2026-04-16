'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface ApiAgent {
  id: string;
  name: string;
  status: 'active' | 'idle';
  task: string;
}

interface AgentStatusResponse {
  last_updated: string;
  agents: ApiAgent[];
}

interface AgentConfig {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'offline';
  task?: string;
  stats: { uptime: string; tasks: string; latency: string };
  color: string;
}

const FALLBACK_AGENTS: AgentConfig[] = [
  { id: 'xl', name: 'XL', role: 'AI Orchestrator', status: 'active', stats: { uptime: '99.8%', tasks: '34', latency: '120ms' }, color: '#DC2626' },
  { id: 'signal', name: 'Signal Monitor', role: 'Event Watcher', status: 'active', stats: { uptime: '99.9%', tasks: '156', latency: '12ms' }, color: '#3B82F6' },
  { id: 'notion', name: 'Notion Sync', role: 'Docs & Tasks', status: 'active', stats: { uptime: '98.5%', tasks: '22', latency: '340ms' }, color: '#8B5CF6' },
  { id: 'gdrive', name: 'Google Drive', role: 'File Storage', status: 'idle', stats: { uptime: '99.1%', tasks: '5', latency: '520ms' }, color: '#22C55E' },
  { id: 'openrouter', name: 'OpenRouter', role: 'LLM Gateway', status: 'active', stats: { uptime: '97.2%', tasks: '847', latency: '45ms' }, color: '#F59E0B' },
  { id: 'cron', name: 'Cron Engine', role: 'Scheduler', status: 'idle', stats: { uptime: '100%', tasks: '18', latency: '8ms' }, color: '#06B6D4' },
];

const DESK_POSITIONS = [
  { x: 140, y: 210 },
  { x: 420, y: 210 },
  { x: 100, y: 310 },
  { x: 380, y: 310 },
  { x: 140, y: 410 },
  { x: 420, y: 410 },
];

const C = {
  floorDark: '#4A3728', floorLight: '#5C4433', floorLine: '#3A2A1E',
  wallBack: '#3D3545', wallTrim: '#4A4255', wallPanel: '#453D4D',
  deskTop: '#2A5B5E', deskFront: '#1E4547', deskSide: '#1A3D3F', deskDrawer: '#245052',
  chairSeat: '#6B4A2E', chairBack: '#7A5535', chairBase: '#2A5B5E',
  monitorFrame: '#1E3A3C', monitorScreen: '#0A2A2C',
  serverBody: '#2A2A35', serverFront: '#353540', serverLight: '#22C55E',
  viewBg: '#0A0F1A', viewRing: '#6888B8',
  ventGrate: '#555560',
};

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

type HitArea = { x: number; y: number; w: number; h: number; agent: AgentConfig };

function buildRenderer(canvas: HTMLCanvasElement, agentsRef: { current: AgentConfig[] }) {
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width;
  const H = canvas.height;
  let frame = 0;
  let rafId = 0;
  const hitAreas: HitArea[] = [];

  function drawRect(x: number, y: number, w: number, h: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function drawIsoRect(x: number, y: number, w: number, h: number, topColor: string, frontColor: string, sideColor: string, depth: number) {
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w + depth * 0.5, y - depth * 0.3);
    ctx.lineTo(x + depth * 0.5, y - depth * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = frontColor;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = sideColor;
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w + depth * 0.5, y - depth * 0.3);
    ctx.lineTo(x + w + depth * 0.5, y + h - depth * 0.3);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
  }

  function drawRoom() {
    const floorY = 180;
    drawRect(0, floorY, W, H - floorY, C.floorDark);
    ctx.strokeStyle = C.floorLine;
    ctx.lineWidth = 1;
    for (let gx = 0; gx < W; gx += 40) {
      ctx.beginPath(); ctx.moveTo(gx, floorY); ctx.lineTo(gx, H); ctx.stroke();
    }
    for (let gy = floorY; gy < H; gy += 40) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    }
    for (let gx = 0; gx < W / 40; gx++) {
      for (let gy = 0; gy < (H - floorY) / 40; gy++) {
        if ((gx + gy) % 2 === 0) {
          ctx.fillStyle = 'rgba(92,68,51,0.15)';
          ctx.fillRect(gx * 40, floorY + gy * 40, 40, 40);
        }
      }
    }
    drawRect(0, 0, W, floorY, C.wallBack);
    for (let px = 60; px < W - 60; px += 120) {
      drawRect(px, 20, 2, floorY - 25, C.wallTrim);
    }
    drawRect(0, floorY - 5, W, 5, C.wallTrim);
    drawRect(0, 16, W, 2, C.wallTrim);
    const grad = ctx.createLinearGradient(0, 0, 80, 0);
    grad.addColorStop(0, 'rgba(30,25,35,0.6)'); grad.addColorStop(1, 'rgba(30,25,35,0)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 80, H);
    const grad2 = ctx.createLinearGradient(W, 0, W - 80, 0);
    grad2.addColorStop(0, 'rgba(30,25,35,0.6)'); grad2.addColorStop(1, 'rgba(30,25,35,0)');
    ctx.fillStyle = grad2; ctx.fillRect(W - 80, 0, 80, H);
  }

  function drawViewscreen(t: number) {
    const vx = 280, vy = 30, vw = 300, vh = 130;
    drawRect(vx - 4, vy - 4, vw + 8, vh + 8, C.wallTrim);
    drawRect(vx - 2, vy - 2, vw + 4, vh + 4, '#1A1520');
    drawRect(vx, vy, vw, vh, C.viewBg);
    ctx.fillStyle = '#FFFFFF';
    const starSeed = [0.1, 0.3, 0.5, 0.7, 0.15, 0.85, 0.42, 0.68, 0.22, 0.91, 0.35, 0.78, 0.55, 0.12, 0.65, 0.48, 0.82, 0.28, 0.95, 0.05];
    for (let i = 0; i < starSeed.length; i += 2) {
      const twinkle = Math.sin(t * 0.02 + i * 3) * 0.4 + 0.6;
      ctx.globalAlpha = twinkle;
      ctx.fillRect(vx + starSeed[i] * vw, vy + starSeed[i + 1] * vh, 2, 2);
    }
    ctx.globalAlpha = 1;
    const px = vx + vw * 0.65, py = vy + vh * 0.5, pr = 28;
    const planetGrad = ctx.createRadialGradient(px - 5, py - 5, 2, px, py, pr);
    planetGrad.addColorStop(0, '#5B7AB8'); planetGrad.addColorStop(0.6, '#3B5998'); planetGrad.addColorStop(1, '#2A4070');
    ctx.fillStyle = planetGrad; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.viewRing; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(px, py, pr * 1.8, pr * 0.35, -0.2, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(104,136,184,0.4)';
    ctx.beginPath(); ctx.ellipse(px, py, pr * 2.1, pr * 0.42, -0.2, 0, Math.PI * 2); ctx.stroke();
    const scanY = vy + ((t * 0.5) % vh);
    ctx.fillStyle = 'rgba(74,234,239,0.03)'; ctx.fillRect(vx, scanY, vw, 2);
    ctx.strokeStyle = 'rgba(74,234,239,0.15)'; ctx.lineWidth = 1; ctx.strokeRect(vx, vy, vw, vh);
  }

  function drawCeilingLights(t: number) {
    [180, 440, 700].forEach(lx => {
      drawRect(lx - 15, 0, 30, 6, '#444450');
      drawRect(lx - 10, 6, 20, 3, '#555560');
      const glow = ctx.createRadialGradient(lx, 8, 2, lx, 60, 100);
      const flicker = Math.sin(t * 0.03 + lx) * 0.05 + 0.12;
      glow.addColorStop(0, `rgba(255,170,68,${flicker + 0.05})`);
      glow.addColorStop(1, 'rgba(255,170,68,0)');
      ctx.fillStyle = glow; ctx.fillRect(lx - 100, 0, 200, 160);
    });
  }

  function drawWallDetails() {
    [{ x: 80, y: 60 }, { x: 700, y: 80 }].forEach(v => {
      drawRect(v.x, v.y, 40, 30, C.wallPanel);
      drawRect(v.x + 2, v.y + 2, 36, 26, '#2A2535');
      for (let i = 0; i < 4; i++) drawRect(v.x + 6, v.y + 6 + i * 6, 28, 2, C.ventGrate);
    });
    [{ x: 160, y: 50 }, { x: 630, y: 55 }].forEach(p => {
      drawRect(p.x, p.y, 50, 35, '#2A2535');
      drawRect(p.x + 2, p.y + 2, 46, 31, '#1A1825');
      for (let i = 0; i < 3; i++) drawRect(p.x + 6, p.y + 8 + i * 8, 20 + (i % 2) * 10, 3, 'rgba(74,234,239,0.3)');
      drawRect(p.x + 40, p.y + 6, 4, 4, C.serverLight);
    });
  }

  function drawServerRack(t: number) {
    const sx = 730, sy = 100, sw = 55, sh = 76;
    drawRect(sx, sy, sw, sh, C.serverBody);
    drawRect(sx + 2, sy + 2, sw - 4, sh - 4, C.serverFront);
    for (let i = 0; i < 5; i++) {
      const uy = sy + 6 + i * 14;
      drawRect(sx + 6, uy, sw - 12, 10, '#25252F');
      drawRect(sx + 6, uy, sw - 12, 1, '#404050');
      const blink = Math.sin(t * 0.05 + i * 1.5) > 0;
      drawRect(sx + sw - 16, uy + 3, 3, 3, blink ? C.serverLight : '#1A3A1A');
      drawRect(sx + sw - 22, uy + 3, 3, 3, i === 2 ? '#DC2626' : '#1A1A3A');
    }
    ctx.fillStyle = '#DC2626'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
    ctx.fillText('SRV-01', sx + sw / 2, sy + sh + 12); ctx.textAlign = 'left';
  }

  function drawDesk(x: number, y: number, agent: AgentConfig, t: number, agentIndex: number) {
    const isActive = agent.status === 'active';
    const dw = 110, dh = 20, dd = 12;
    drawRect(x + 4, y + dh, 6, 28, C.deskSide);
    drawRect(x + dw - 10, y + dh, 6, 28, C.deskSide);
    drawRect(x + dw - 40, y + dh, 36, 20, C.deskDrawer);
    drawRect(x + dw - 38, y + dh + 2, 32, 7, C.deskSide);
    drawRect(x + dw - 38, y + dh + 11, 32, 7, C.deskSide);
    drawRect(x + dw - 26, y + dh + 4, 8, 2, C.wallTrim);
    drawRect(x + dw - 26, y + dh + 13, 8, 2, C.wallTrim);
    drawIsoRect(x, y, dw, dh, C.deskTop, C.deskFront, C.deskSide, dd);
    const mx = x + 30, my = y - 52, mw = 50, mh = 36;
    drawRect(mx + 20, y - 16, 10, 16, C.monitorFrame);
    drawRect(mx + 14, y - 6, 22, 4, C.monitorFrame);
    drawRect(mx - 2, my - 2, mw + 4, mh + 4, C.monitorFrame);
    drawRect(mx, my, mw, mh, C.monitorScreen);
    if (isActive) {
      const glow = ctx.createRadialGradient(mx + mw / 2, my + mh / 2, 2, mx + mw / 2, my + mh / 2, mw);
      glow.addColorStop(0, `rgba(${hexToRgb(agent.color)},0.15)`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow; ctx.fillRect(mx - 20, my - 20, mw + 40, mh + 40);
      const lines = Math.floor((t * 0.04 + agentIndex * 7) % 6) + 2;
      for (let i = 0; i < Math.min(lines, 5); i++) {
        const lw = 12 + ((i * 7 + agentIndex * 13) % 25);
        drawRect(mx + 4, my + 5 + i * 6, lw, 3, `rgba(${hexToRgb(agent.color)},0.5)`);
      }
      if (Math.sin(t * 0.1) > 0) {
        const cl = Math.min(lines - 1, 4);
        const cx = 12 + ((cl * 7 + agentIndex * 13) % 25) + 2;
        drawRect(mx + 4 + cx, my + 5 + cl * 6, 2, 4, agent.color);
      }
    } else {
      drawRect(mx + 10, my + 10, 30, 3, 'rgba(100,100,120,0.2)');
      drawRect(mx + 14, my + 17, 22, 3, 'rgba(100,100,120,0.15)');
    }
    drawRect(x + 15, y + 2, 30, 8, '#1A3335');
    for (let kr = 0; kr < 2; kr++) {
      for (let kc = 0; kc < 8; kc++) {
        drawRect(x + 17 + kc * 3.5, y + 3 + kr * 3.5, 2.5, 2.5, '#224548');
      }
    }
    drawRect(x + 52, y + 4, 6, 8, '#1A3335');
    drawRect(x + 53, y + 5, 4, 3, '#224548');
  }

  function drawChair(x: number, y: number) {
    drawRect(x + 12, y + 38, 20, 3, C.chairBase);
    drawRect(x + 8, y + 41, 4, 4, '#1E3A3C');
    drawRect(x + 32, y + 41, 4, 4, '#1E3A3C');
    drawRect(x + 20, y + 26, 4, 14, '#3A3A45');
    drawRect(x + 6, y + 18, 32, 10, C.chairSeat);
    drawRect(x + 6, y + 18, 32, 2, C.chairBack);
    drawRect(x + 10, y, 24, 20, C.chairBack);
    drawRect(x + 12, y + 2, 20, 16, C.chairSeat);
    drawRect(x + 14, y - 4, 16, 6, C.chairBack);
  }

  function drawAgent(x: number, y: number, agent: AgentConfig, t: number, agentIndex: number) {
    if (agent.status === 'offline') return;
    const isActive = agent.status === 'active';
    const color = agent.color;
    const breathOffset = Math.sin(t * 0.04 + agentIndex * 2) * 1.5;
    const armAnim = isActive ? Math.sin(t * 0.12 + agentIndex) * 2 : 0;
    if (isActive) {
      const glow = ctx.createRadialGradient(x + 20, y + 30, 2, x + 20, y + 30, 30);
      glow.addColorStop(0, `rgba(${hexToRgb(color)},0.2)`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow; ctx.fillRect(x - 10, y, 60, 60);
    }
    const statusColor = agent.status === 'active' ? '#22C55E' : agent.status === 'idle' ? '#EAB308' : '#EF4444';
    const pulseScale = Math.sin(t * 0.06 + agentIndex) * 0.3 + 0.7;
    ctx.fillStyle = statusColor; ctx.globalAlpha = pulseScale;
    ctx.beginPath(); ctx.arc(x + 20, y - 12 + breathOffset, 4, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = pulseScale * 0.4;
    ctx.beginPath(); ctx.arc(x + 20, y - 12 + breathOffset, 7, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    const hy = y + breathOffset;
    ctx.fillStyle = color; ctx.fillRect(x + 12, hy, 16, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(x + 13, hy + 1, 6, 4);
    ctx.fillStyle = '#000'; ctx.fillRect(x + 15, hy + 5, 3, 3); ctx.fillRect(x + 22, hy + 5, 3, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(x + 15, hy + 5, 1, 1); ctx.fillRect(x + 22, hy + 5, 1, 1);
    const by = hy + 14;
    ctx.fillStyle = color; ctx.globalAlpha = 0.85; ctx.fillRect(x + 10, by, 20, 16);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(x + 10, by + 10, 20, 6);
    ctx.fillStyle = color; ctx.globalAlpha = 0.75;
    ctx.fillRect(x + 4, by + 2 + armAnim, 6, 12);
    ctx.fillRect(x + 30, by + 2 - armAnim, 6, 12);
    ctx.globalAlpha = 1;
    ctx.font = '9px monospace'; ctx.textAlign = 'center';
    const lw2 = ctx.measureText(agent.name).width;
    drawRect(x + 20 - lw2 / 2 - 4, y + 52, lw2 + 8, 14, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = color; ctx.fillText(agent.name, x + 20, y + 62);
    ctx.textAlign = 'left';
    hitAreas.push({ x, y: y - 15, w: 44, h: 80, agent });
  }

  function render() {
    frame++;
    hitAreas.length = 0;
    ctx.clearRect(0, 0, W, H);
    drawRoom();
    drawCeilingLights(frame);
    drawViewscreen(frame);
    drawWallDetails();
    drawServerRack(frame);
    const agents = agentsRef.current;
    const sorted = DESK_POSITIONS.map((pos, i) => ({ ...pos, agent: agents[i] ?? FALLBACK_AGENTS[i], idx: i }))
      .sort((a, b) => a.y - b.y);
    sorted.forEach(desk => {
      drawChair(desk.x + 48, desk.y - 20);
      drawAgent(desk.x + 48, desk.y - 44, desk.agent, frame, desk.idx);
      drawDesk(desk.x, desk.y, desk.agent, frame, desk.idx);
    });
    const vig = ctx.createRadialGradient(W / 2, H / 2, 150, W / 2, H / 2, W * 0.65);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
    rafId = requestAnimationFrame(render);
  }

  rafId = requestAnimationFrame(render);

  function getHitAgent(canvasX: number, canvasY: number): AgentConfig | null {
    for (const area of hitAreas) {
      if (canvasX >= area.x && canvasX <= area.x + area.w && canvasY >= area.y && canvasY <= area.y + area.h) {
        return area.agent;
      }
    }
    return null;
  }

  return {
    stop: () => cancelAnimationFrame(rafId),
    getHitAgent,
  };
}

export default function PixelOfficeV2() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const agentsRef = useRef<AgentConfig[]>(FALLBACK_AGENTS);
  const [agents, setAgents] = useState<AgentConfig[]>(FALLBACK_AGENTS);
  const [hoveredAgent, setHoveredAgent] = useState<AgentConfig | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const rendererRef = useRef<ReturnType<typeof buildRenderer> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/agent-status');
      if (!res.ok) return;
      const data: AgentStatusResponse = await res.json();
      const merged = FALLBACK_AGENTS.map(fallback => {
        const live = data.agents.find(a => a.id === fallback.id || a.name === fallback.name);
        if (!live) return fallback;
        return { ...fallback, status: live.status, task: live.task };
      });
      agentsRef.current = merged;
      setAgents(merged);
      setLastUpdated(data.last_updated);
    } catch {
      // keep fallback data
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30_000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = buildRenderer(canvas, agentsRef);
    rendererRef.current = renderer;
    return () => renderer.stop();
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !rendererRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const found = rendererRef.current.getHitAgent(mx, my);
    setHoveredAgent(found);
    if (found) {
      const containerRect = container.getBoundingClientRect();
      setTooltipPos({
        x: Math.min(e.clientX - containerRect.left + 16, containerRect.width - 200),
        y: e.clientY - containerRect.top - 10,
      });
    }
  }

  const active = agents.filter(a => a.status === 'active').length;
  const idle = agents.filter(a => a.status === 'idle').length;

  return (
    <div style={{ fontFamily: 'inherit' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="5" width="14" height="12" rx="1.5" stroke="#DC2626" strokeWidth="1.5"/>
              <rect x="5" y="8" width="3" height="2" rx="0.5" fill="#DC2626"/>
              <rect x="10" y="8" width="3" height="2" rx="0.5" fill="#DC2626"/>
              <rect x="5" y="12" width="3" height="2" rx="0.5" fill="#DC2626"/>
              <rect x="10" y="12" width="3" height="2" rx="0.5" fill="#DC2626"/>
              <rect x="7" y="1" width="4" height="4" rx="1" fill="#DC2626" opacity="0.5"/>
            </svg>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-white/40">Pixel Office</p>
            <p className="text-base font-bold text-white leading-tight">Agent Workstations</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-[10px] text-white/30 font-mono hidden sm:block">
              updated {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-emerald-400 tracking-widest">LIVE</span>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-5 flex-wrap px-4 py-2.5 mb-3 rounded-lg border border-white/8 bg-white/[0.02]">
        {[
          { label: 'Total', val: agents.length, color: 'text-white' },
          { label: 'Active', val: active, color: 'text-emerald-400' },
          { label: 'Idle', val: idle, color: 'text-amber-400' },
          { label: 'Error', val: agents.filter(a => a.status === 'offline').length, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5 text-[11px] text-white/50">
            <span className={`text-sm font-bold ${s.color}`}>{s.val}</span>
            {s.label}
          </div>
        ))}
        <div className="ml-auto w-28 h-1.5 rounded-full bg-white/10 overflow-hidden flex">
          <div style={{ width: `${(active / agents.length) * 100}%` }} className="h-full bg-emerald-500 transition-all duration-500" />
          <div style={{ width: `${(idle / agents.length) * 100}%` }} className="h-full bg-amber-400 transition-all duration-500" />
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative rounded-xl border border-white/8 overflow-hidden mb-3"
        style={{ background: '#09090B' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredAgent(null)}
      >
        <canvas
          ref={canvasRef}
          width={868}
          height={520}
          className="block w-full h-auto"
          style={{ imageRendering: 'pixelated', cursor: hoveredAgent ? 'pointer' : 'default' }}
        />

        {/* Tooltip */}
        {hoveredAgent && (
          <div
            className="absolute pointer-events-none z-10 min-w-[160px] rounded-lg border border-white/10 p-3 shadow-2xl"
            style={{
              left: tooltipPos.x, top: tooltipPos.y,
              background: 'rgba(24,24,27,0.95)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <p className="text-sm font-bold text-white mb-0.5">{hoveredAgent.name}</p>
            <p className="text-[10px] text-white/40 mb-2">{hoveredAgent.role}</p>
            {hoveredAgent.task && (
              <p className="text-[10px] text-white/50 italic mb-2 line-clamp-2">{hoveredAgent.task}</p>
            )}
            <div className="flex gap-3">
              <div className="text-center">
                <p className="text-sm font-bold text-emerald-400">{hoveredAgent.stats.uptime}</p>
                <p className="text-[9px] text-white/30 uppercase tracking-wide">Uptime</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-blue-400">{hoveredAgent.stats.tasks}</p>
                <p className="text-[9px] text-white/30 uppercase tracking-wide">Tasks</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white/60">{hoveredAgent.stats.latency}</p>
                <p className="text-[9px] text-white/30 uppercase tracking-wide">Latency</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity feed */}
      <div className="rounded-lg border border-white/8 bg-white/[0.02] px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.1em] text-white/30 font-semibold mb-2.5">Recent Activity</p>
        <div className="flex flex-col gap-0 max-h-40 overflow-y-auto">
          {agents.filter(a => a.task).map((a, i, arr) => (
            <div key={a.id} className={`flex items-start gap-2.5 py-2 ${i < arr.length - 1 ? 'border-b border-white/6' : ''}`}>
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: a.status === 'active' ? '#22C55E' : '#EAB308' }}
              />
              <div>
                <p className="text-xs text-white/60 leading-snug">
                  <span className="text-white font-semibold">{a.name}</span> {a.task}
                </p>
              </div>
            </div>
          ))}
          {agents.every(a => !a.task) && (
            <p className="text-xs text-white/30 py-1">No recent activity from API.</p>
          )}
        </div>
      </div>
    </div>
  );
}

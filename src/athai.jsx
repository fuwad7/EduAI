import { useState, useEffect, useRef, useMemo } from "react";
import { 
  BookOpen, Users, BarChart3, FileText, GraduationCap, LogOut, Brain, Zap, Target, TrendingUp, 
  ClipboardList, Loader, X, Edit3, Trash2, ChevronRight, Award, Calendar, Database, PenTool, 
  BookMarked, Map, Bell, CheckSquare, MessageCircle, Home, Archive, Plus, Save, Search, 
  ChevronDown, CheckCircle, AlertCircle, Star, Upload, Eye, RefreshCw, Filter, Settings, 
  LayoutDashboard, Mail, Download, Clock, Clipboard, Check
} from "lucide-react";
import { supabase } from "./supabaseClient";

// DIU Inspired Premium Academic Theme
const C = {
  bg: '#0B1121',         // Deep Navy Background
  surface: '#111827',    // Dark Slate Surface
  card: '#1A2332',       // Lighter Slate Card
  border: '#2D3748',     // Subtle Borders
  accent: '#008055',     // DIU Green (Primary)
  accentLight: '#10B981',// Lighter Green
  gold: '#D4AF37',       // Academic Gold (Secondary Accent)
  blue: '#3B82F6',
  green: '#10B981',
  red: '#EF4444',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
  text: '#F8FAFC',       // Primary Text
  muted: '#64748B',      // Muted Text
  sub: '#94A3B8'         // Subtitles
};

const FONT_SERIF = "'Merriweather', serif";
const FONT_SANS = "'Inter', system-ui, sans-serif";

const AI_KEYS = {
  groq: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GROQ_API_KEY) || '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',
  gemini: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) || 'AIzaSyCmdq6ePVFsBSphH6ZDWL2pKen2UTG4Iu4',
  openrouter: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_OPENROUTER_API_KEY) || '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',
};

const AI_MODELS = {
  groq: 'llama-3.3-70b-versatile',
  gemini: 'gemini-2.5-flash',
  openrouter: 'openai/gpt-4o-mini',
};

function normalizeText(value) { return String(value ?? '').trim(); }

function extractGroqText(data) { return data?.choices?.[0]?.message?.content ?? data?.output_text ?? ''; }

function extractGeminiText(data) {
  const candidate = data?.candidates?.[0]?.content?.parts || [];
  return candidate.map(part => part?.text || '').join('').trim();
}

async function callGroq(prompt, sys) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${AI_KEYS.groq}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: AI_MODELS.groq,
      messages: [...(sys ? [{ role: 'system', content: sys }] : []), { role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || `Groq request failed (${response.status})`);
  const text = extractGroqText(data).trim();
  if (!text) throw new Error('Groq returned an empty response');
  return text;
}

async function callOpenRouter(prompt, sys) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AI_KEYS.openrouter}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
      'X-Title': 'EduAI',
    },
    body: JSON.stringify({
      model: AI_MODELS.openrouter,
      messages: [...(sys ? [{ role: 'system', content: sys }] : []), { role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || `OpenRouter request failed (${response.status})`);
  const text = extractGroqText(data).trim();
  if (!text) throw new Error('OpenRouter returned an empty response');
  return text;
}

async function callGemini(prompt, sys) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.gemini}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': AI_KEYS.gemini },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      ...(sys ? { systemInstruction: { parts: [{ text: sys }] } } : {}),
      generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || `Gemini request failed (${response.status})`);
  const text = extractGeminiText(data);
  if (!text) throw new Error('Gemini returned an empty response');
  return text;
}

async function ai(prompt, sys='You are EduAI, an expert educational assistant for Daffodil International University professors. Be detailed, practical, and professional in your responses.', provider='groq') {
  const cleanPrompt = normalizeText(prompt);
  const cleanSys = normalizeText(sys);
  if (!cleanPrompt) return 'Please enter a prompt first.';
  const order = [provider, 'groq', 'gemini', 'openrouter'].filter((v, i, a) => v && a.indexOf(v) === i);
  const errors = [];
  for (const chosen of order) {
    try {
      if (!AI_KEYS[chosen]) throw new Error(`Missing API key for ${chosen}`);
      if (chosen === 'groq') return await callGroq(cleanPrompt, cleanSys);
      if (chosen === 'gemini') return await callGemini(cleanPrompt, cleanSys);
      if (chosen === 'openrouter') return await callOpenRouter(cleanPrompt, cleanSys);
    } catch (err) {
      errors.push(`${chosen}: ${err?.message || 'request failed'}`);
    }
  }
  return `AI request failed. ${errors.join(' | ') || 'Please check the API configuration.'}`;
}

async function gset(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }
async function gget(key, fb) { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fb; } catch { return fb; } }

function prettySize(bytes) { if (bytes === null || bytes === undefined) return 'N/A'; const kb = bytes / 1024; return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(kb))} KB`; }

function fileKind(file) {
  const name = (file?.name || '').toLowerCase();
  const mime = (file?.type || '').toLowerCase();
  if (mime.includes('pdf') || name.endsWith('.pdf')) return 'pdf';
  if (mime.includes('presentation') || mime.includes('powerpoint') || name.endsWith('.pptx') || name.endsWith('.ppt')) return 'pptx';
  if (mime.includes('spreadsheet') || name.endsWith('.xlsx') || name.endsWith('.xls')) return 'sheet';
  if (mime.includes('wordprocessingml') || name.endsWith('.docx') || name.endsWith('.doc')) return 'doc';
  if (mime.includes('text') || name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.csv')) return 'text';
  return 'other';
}

async function fileToDataUrl(file) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

async function fileToText(file) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

const STORAGE_BUCKET = 'eduai-files';
const HAS_SUPABASE = typeof supabase !== 'undefined' && !!supabase?.auth && !!supabase?.storage;

function getDisplayName(user) {
  return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')?.[0] || 'Faculty';
}

function safeFileName(name) {
  return String(name || 'file').replace(/[^a-zA-Z0-9._-]+/g, '_');
}

async function copyToClipboard(text) {
  const value = String(text ?? '');
  if (!value.trim()) return;
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = value;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }
}

async function uploadManagedFile(file, folder = "uploads") {
  if (!file) throw new Error("No file selected");
  if (!HAS_SUPABASE) throw new Error("Supabase client not available");
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData?.user) throw new Error("Please sign in first");
  const path = `${folder}/${Date.now()}-${safeFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { fileUrl: data.publicUrl, storagePath: path, storageProvider: "supabase" };
}

const DEMO_GRADES = [{id:1,student:'Ahmed Hassan',sid:'CSE2101',quiz1:85,quiz2:80,mid:72,assign:78,final:0,grade:'B+'},{id:2,student:'Fatima Rahman',sid:'CSE2102',quiz1:92,quiz2:95,mid:90,assign:88,final:0,grade:'A'},{id:3,student:'Karim Uddin',sid:'CSE2103',quiz1:70,quiz2:65,mid:58,assign:72,final:0,grade:'C+'},{id:4,student:'Nadia Islam',sid:'CSE2104',quiz1:88,quiz2:90,mid:85,assign:82,final:0,grade:'A-'},{id:5,student:'Rafiq Hossain',sid:'CSE2105',quiz1:60,quiz2:55,mid:48,assign:65,final:0,grade:'C'}];
const DEMO_COURSES = [{id:1,code:'CSE401',name:'Artificial Intelligence',credits:3,clos:['CLO1: Apply ML algorithms','CLO2: Design neural networks','CLO3: Evaluate AI ethics'],plos:['PLO1','PLO2','PLO5'],mapping:{CLO1:'PLO1,PLO2',CLO2:'PLO2',CLO3:'PLO5'},students:35,semester:'Fall 2025'},{id:2,code:'CSE301',name:'Data Structures',credits:3,clos:['CLO1: Implement core data structures','CLO2: Analyze algorithm complexity','CLO3: Solve real-world problems'],plos:['PLO1','PLO3'],mapping:{CLO1:'PLO1',CLO2:'PLO1,PLO3',CLO3:'PLO3'},students:42,semester:'Fall 2025'}];
const DEMO_PROJECTS = [{id:1,title:'Smart Traffic Management System',student:'Ahmed Hassan',supervisor:'Dr. Sarah Ahmed',status:'In Progress',progress:65,proposal:'Submitted',defense:'Pending',milestones:[{name:'Proposal',done:true,date:'2025-02-01'},{name:'Literature Review',done:true,date:'2025-03-01'},{name:'System Design',done:true,date:'2025-04-01'},{name:'Implementation',done:false,date:'2025-06-01'},{name:'Testing',done:false,date:'2025-07-01'},{name:'Defense',done:false,date:'2025-08-15'}]},{id:2,title:'AI-Based Medical Diagnosis',student:'Fatima Rahman',supervisor:'Dr. Sarah Ahmed',status:'On Track',progress:40,proposal:'Approved',defense:'Scheduled',milestones:[{name:'Proposal',done:true,date:'2025-02-15'},{name:'Literature Review',done:true,date:'2025-03-15'},{name:'System Design',done:false,date:'2025-04-20'},{name:'Implementation',done:false,date:'2025-06-20'},{name:'Testing',done:false,date:'2025-07-20'},{name:'Defense',done:false,date:'2025-08-20'}]}];
const DEMO_MATS = [{id:1,title:'Introduction to Neural Networks',course:'CSE401',type:'Lecture Slides',date:'2025-01-15',size:'2.4 MB'},{id:2,title:'Algorithm Analysis - Week 3',course:'CSE301',type:'Lecture Notes',date:'2025-01-20',size:'1.1 MB'},{id:3,title:'AI Ethics Reading List',course:'CSE401',type:'Reading List',date:'2025-01-25',size:'0.5 MB'},{id:4,title:'Lab Manual - Sorting Algorithms',course:'CSE301',type:'Lab Manual',date:'2025-02-01',size:'3.2 MB'}];
const DEMO_DEADLINES = [{id:1, task:'Midterm Exam Grading', course:'CSE401', date:'2025-10-15', priority:'High'},{id:2, task:'Capstone Proposal Deadline', course:'CSE499', date:'2025-10-20', priority:'Medium'},{id:3, task:'Submit Final Grades', course:'All Courses', date:'2025-12-10', priority:'High'}];

function Btn({children, onClick, variant='primary', disabled, size='md', icon:Icon, full, style={}}) {
  const base = {border:'none', cursor:disabled?'not-allowed':'pointer', borderRadius:8, fontFamily:FONT_SANS, fontWeight:600, display:'inline-flex', alignItems:'center', gap:8, opacity:disabled?0.5:1, transition:'all 0.2s', whiteSpace:'nowrap', letterSpacing: '0.02em'};
  const sz = {sm:{padding:'8px 14px',fontSize:12}, md:{padding:'10px 18px',fontSize:13}, lg:{padding:'12px 24px',fontSize:14}};
  const vars = {primary:{background:C.accent, color:'#fff'}, secondary:{background:C.surface, border: `1px solid ${C.border}`, color:C.text}, success:{background:C.green,color:'#fff'}, danger:{background:C.red,color:'#fff'}, ghost:{background:'transparent',color:C.sub,border: `1px solid ${C.border}`}, blue:{background:C.blue,color:'#fff'}, purple:{background:C.purple,color:'#fff'}};
  return <button className="btn-hover" onClick={onClick} disabled={disabled} style={{...base, ...sz[size], ...vars[variant], width:full?'100%':'auto', ...style}} >{Icon && <Icon size={size==='sm'?14:16}/>} {children}</button>;
}

function Card({children, style, onClick}) {
  return <div className={onClick ? 'card-hover' : ''} onClick={onClick} style={{background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:24, cursor:onClick?'pointer':'default', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', ...style}}>{children}</div>;
}

function StatCard({icon:Icon, label, value, color=C.accent, sub}) {
  return (
    <Card style={{display:'flex', flexDirection:'column', gap:12, position:'relative', overflow:'hidden'}}>
      <div style={{position:'absolute', top:-10, right:-10, opacity:0.05, transform:'rotate(15deg)'}}><Icon size={64} color={color}/></div>
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <div style={{background:`${color}20`, borderRadius:10, padding:10, display:'flex', border:`1px solid ${color}40`}}><Icon size={20} color={color}/></div>
        <span style={{fontSize:13, color:C.sub, fontWeight:500, letterSpacing:'0.03em'}}>{label}</span>
      </div>
      <div style={{fontSize:32, fontWeight:700, color:C.text, fontFamily:FONT_SERIF}}>{value}</div>
      {sub && <div style={{fontSize:12, color:C.muted, fontWeight:500}}>{sub}</div>}
    </Card>
  );
}

function AIBox({title, placeholder, buildPrompt, resultLabel='AI Response'}) {
  const [inp, setInp] = useState('');
  const [res, setRes] = useState('');
  const [load, setLoad] = useState(false);
  const [copied, setCopied] = useState(false);
  async function run() {
    setLoad(true); setCopied(false); setRes('');
    const r = await ai(buildPrompt(inp));
    setRes(r); setLoad(false);
  }
  async function copyResult() {
    if (!res) return;
    const ok = await copyToClipboard(res);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1200); }
  }
  return (
    <div style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:24}}>
      <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:16, borderBottom:`1px solid ${C.border}`, paddingBottom:12}}>
        <div style={{background:`${C.accent}20`, padding:8, borderRadius:8}}><Brain size={18} color={C.accent}/></div>
        <span style={{fontWeight:600, color:C.text, fontSize:15, fontFamily:FONT_SERIF}}>{title}</span>
        <span style={{marginLeft:'auto', fontSize:10, color:C.muted, background:`${C.card}`, padding:'4px 10px', borderRadius:20, border:`1px solid ${C.border}`, fontWeight:600, letterSpacing:'0.05em'}}>AI POWERED</span>
      </div>
      <textarea value={inp} onChange={e => setInp(e.target.value)} placeholder={placeholder} style={{width:'100%', background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:14, color:C.text, fontSize:14, minHeight:100, resize:'vertical', outline:'none', fontFamily:FONT_SANS, lineHeight:1.6}}/>
      <Btn onClick={run} disabled={load || !inp.trim()} icon={load ? Loader : Brain} style={{marginTop:12}}>{load ? 'Generating...' : 'Generate with AI'}</Btn>
      {res && (
        <div style={{marginTop:16, background:C.card, borderRadius:8, padding:20, color:C.sub, fontSize:14, lineHeight:1.7, whiteSpace:'pre-wrap', maxHeight:400, overflowY:'auto', border:`1px solid ${C.border}`, borderLeft:`4px solid ${C.accent}`}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, marginBottom:12}}>
            <div style={{fontSize:12, color:C.accent, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>{resultLabel}</div>
            <Btn onClick={copyResult} variant="ghost" size="sm" disabled={!res}>{copied ? 'Copied!' : 'Copy text'}</Btn>
          </div>
          <div>{res}</div>
        </div>
      )}
    </div>
  );
}

function TabBar({tabs, active, setActive}) {
  return (
    <div style={{display:'flex', gap:0, borderBottom:`2px solid ${C.border}`, marginBottom:28}}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setActive(t.id)}
          style={{padding:'12px 24px', background:'none', border:'none', borderBottom:active===t.id ? `3px solid ${C.accent}` : '3px solid transparent', color:active===t.id ? C.text : C.muted, fontWeight:active===t.id ? 600 : 500, cursor:'pointer', fontSize:14, fontFamily:FONT_SANS, display:'flex', alignItems:'center', gap:8, transition:'all 0.2s', marginBottom:-2, letterSpacing:'0.02em'}}
        >
          {t.icon && <t.icon size={16}/>}
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Tag({label, color=C.accent}) {
  return <span style={{fontSize:11, padding:'4px 10px', borderRadius:20, background:`${color}20`, color, fontWeight:600, border:`1px solid ${color}40`, letterSpacing:'0.02em'}}>{label}</span>;
}

function Avatar({user, size=40, style={}}) {
  const initials = (user?.name || user?.email || 'T').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0,2).toUpperCase();
  if (user?.avatar) {
    return <img src={user.avatar} alt={user?.name || 'Profile'} style={{width:size, height:size, borderRadius:'50%', objectFit:'cover', flexShrink:0, ...style}}/>;
  }
  return (
    <div style={{width:size, height:size, borderRadius:'50%', background:`linear-gradient(135deg, ${C.accent}, ${C.gold})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:Math.max(10, Math.round(size*0.35)), fontWeight:700, color:'#fff', flexShrink:0, ...style}}>
      {initials}
    </div>
  );
}

function SectionHead({title, sub, action}) {
  return (
    <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28}}>
      <div>
        <h2 style={{fontSize:24, fontWeight:700, color:C.text, fontFamily:FONT_SERIF, letterSpacing:'-0.02em'}}>{title}</h2>
        {sub && <p style={{fontSize:14, color:C.sub, marginTop:6, lineHeight:1.5}}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function Modal({open, onClose, title, children, width=600}) {
  if(!open) return null;
  return (
    <div className="fade-in" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
      <div style={{background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:32, width, maxWidth:'95vw', maxHeight:'85vh', overflowY:'auto', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.5)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, borderBottom:`1px solid ${C.border}`, paddingBottom:16}}>
          <h3 style={{fontSize:18, fontWeight:700, color:C.text, fontFamily:FONT_SERIF}}>{title}</h3>
          <button onClick={onClose} style={{background:C.surface, border:'none', color:C.muted, cursor:'pointer', width:32, height:32, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center'}}><X size={18}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({label, value, onChange, placeholder, type='text', rows}) {
  const style = {width:'100%', background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'12px 14px', color:C.text, fontSize:14, outline:'none', fontFamily:FONT_SANS, boxSizing:'border-box', transition:'all 0.2s'};
  return (
    <div style={{marginBottom:18}}>
      {label && <label style={{display:'block', fontSize:12, color:C.sub, marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>{label}</label>}
      {rows ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{...style, resize:'vertical'}}/> : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={style}/>}
    </div>
  );
}

// ===================== LOGIN PAGE =====================
function LoginPage({onAuthSuccess}) {
  const [mode, setMode] = useState('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [load, setLoad] = useState(false);
  
  async function handleSubmit() {
    setErr(''); setMsg('');
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = fullName.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normalizedEmail || !pass.trim()) { setErr('Please fill all required fields.'); return; }
    if (!emailPattern.test(normalizedEmail)) { setErr('Please enter a valid email address.'); return; }

    if (!HAS_SUPABASE) {
      if (normalizedEmail === 'teacher@eduai.com' && pass === 'demo123') {
        onAuthSuccess({ id: 'demo', email: normalizedEmail, user_metadata: { full_name: normalizedName || 'Dr. Sarah Ahmed' } });
        return;
      }
      setErr('Supabase is not connected yet. Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.');
      return;
    }

    setLoad(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail, password: pass,
          options: { data: { full_name: normalizedName || normalizedEmail.split('@')[0], role: 'teacher' }, emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
        });
        if (error) throw error;
        if (data?.session?.user) { onAuthSuccess(data.session.user); } 
        else { setMsg('Account created. Check your email to confirm the account, then sign in.'); setMode('login'); }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password: pass });
        if (error) throw error;
        if (data?.user) { onAuthSuccess(data.user); } 
        else if (data?.session?.user) { onAuthSuccess(data.session.user); }
      }
    } catch (e) {
      const message = String(e?.message || e || 'Authentication failed.');
      if (/invalid email/i.test(message)) setErr('That email address is not valid. Remove any spaces and try again.');
      else if (/email rate limit exceeded/i.test(message)) setErr('Supabase rate-limited signup emails. Disable email confirmations for testing.');
      else if (/already registered|user already exists|duplicate/i.test(message)) setErr('This email already has an account. Switch to Sign In.');
      else setErr(message);
    } finally { setLoad(false); }
  }

  return (
    <div style={{minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:FONT_SANS}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <div style={{position:'absolute', inset:0, background:`radial-gradient(circle at 20% 20%, ${C.accent}15 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${C.blue}10 0%, transparent 50%), ${C.bg}`}}/>
      <div style={{width:440, position:'relative', zIndex:1}}>
        <div style={{textAlign:'center', marginBottom:48}}>
          <div style={{display:'inline-flex', alignItems:'center', gap:14, marginBottom:20}}>
            <div style={{background:C.accent, borderRadius:12, padding:12, display:'flex', boxShadow: '0 4px 14px rgba(0,128,85,0.3)'}}><GraduationCap size={28} color="#fff"/></div>
            <div style={{textAlign:'left'}}>
              <span style={{fontFamily:FONT_SERIF, fontSize:28, fontWeight:700, color:C.text, display:'block', lineHeight:1}}>EduAI</span>
            </div>
          </div>
          <p style={{color:C.muted, fontSize:14, maxWidth:320, margin:'0 auto', lineHeight:1.6}}>Advanced AI-Powered Teaching and Assessment Portal for Faculty Members</p>
        </div>
        <Card style={{padding:36}}>
          <div style={{display:'flex', gap:8, marginBottom:24, background:C.surface, padding:4, borderRadius:10}}>
            <Btn onClick={() => setMode('login')} variant={mode==='login' ? 'primary' : 'ghost'} size="sm" full>Sign In</Btn>
            <Btn onClick={() => setMode('signup')} variant={mode==='signup' ? 'primary' : 'ghost'} size="sm" full>Create Account</Btn>
          </div>
          <h2 style={{fontSize:22, fontWeight:700, color:C.text, marginBottom:6, fontFamily:FONT_SERIF}}>{mode === 'login' ? 'Faculty Portal Login' : 'Create Faculty Account'}</h2>
          <p style={{color:C.sub, fontSize:13, marginBottom:24}}>{mode === 'login' ? 'Sign in to access your DIU dashboard' : 'Register with your institutional email'}</p>
          {mode === 'signup' && <Input label="Full Name" value={fullName} onChange={setFullName} placeholder="Dr. Sarah Ahmed"/>}
          <Input label="Email Address" value={email} onChange={setEmail} placeholder="faculty@daffodilvarsity.edu.bd" type="email"/>
          <Input label="Password" value={pass} onChange={setPass} placeholder="••••••••" type="password"/>
          {err && <div style={{background:`${C.red}22`, border:`1px solid ${C.red}44`, borderRadius:8, padding:'12px 14px', color:C.red, fontSize:12, marginBottom:18}}>{err}</div>}
          {msg && <div style={{background:`${C.green}18`, border:`1px solid ${C.green}44`, borderRadius:8, padding:'12px 14px', color:C.green, fontSize:12, marginBottom:18}}>{msg}</div>}
          <Btn onClick={handleSubmit} full disabled={load} size="lg">{load ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Sign In to Portal' : 'Create Account')}</Btn>
        </Card>
      </div>
    </div>
  );
}

// ===================== SIDEBAR =====================
function Sidebar({module, setModule, onLogout, user, onEditProfile}) {
  const nav = [
    {id:'dashboard', icon:Home, label:'Dashboard'},
    {id:'teaching', icon:BookOpen, label:'Teaching & Assessment'},
    {id:'curriculum', icon:Map, label:'Curriculum Design'},
    {id:'materials', icon:FileText, label:'Teaching Materials'},
    {id:'capstone', icon:Award, label:'Capstone Supervision'}
  ];
  return (
    <div style={{width:240, background:C.surface, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', height:'100vh', flexShrink:0}}>
      <div style={{padding:'20px 16px 16px', borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <div style={{background:C.accent, borderRadius:8, padding:7, display:'flex'}}><GraduationCap size={18} color="#000"/></div>
          <span style={{fontFamily:'"Playfair Display",serif', fontSize:20, fontWeight:700, color:C.text}}>EduAI</span>
        </div>
        <div style={{fontSize:10, color:C.muted, marginTop:4, paddingLeft:2}}>Advanced AI-Powered Teaching and Assessment Portal for Faculty Members</div>
      </div>
      <nav style={{flex:1, padding:'12px 8px', overflowY:'auto'}}>
        {nav.map(n => {
          const active = module === n.id;
          return (
            <button key={n.id} onClick={() => setModule(n.id)} style={{width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:8, border:'none', background:active ? `${C.accent}18` : 'transparent', color:active ? C.accent : C.sub, fontWeight:active ? 600 : 400, cursor:'pointer', fontFamily:'inherit', fontSize:13, marginBottom:2, textAlign:'left', transition:'all 0.2s'}}>
              <n.icon size={16}/>{n.label}{active && <ChevronRight size={12} style={{marginLeft:'auto'}}/>}
            </button>
          );
        })}
      </nav>
      <div style={{padding:'12px 8px', borderTop:`1px solid ${C.border}`}}>
        <div 
          onClick={onEditProfile}
          style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', marginBottom:8, background:C.card, borderRadius:8, cursor:'pointer', border:'1px solid transparent', transition:'all 0.2s'}}
          onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
        >
          <Avatar user={user} size={32} style={{fontSize:12, fontWeight:700}}/>
          <div style={{overflow:'hidden', flex:1}}> 
            <div style={{fontSize:12, fontWeight:600, color:C.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{user?.name || user?.email || 'Teacher'}</div> 
            <div style={{fontSize:10, color:C.muted}}>{user?.role || 'Professor'}, {user?.dept || 'CSE'}</div> 
          </div>
          <Settings size={14} color={C.muted}/>
        </div>
        <button onClick={onLogout} style={{width:'100%', display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:8, border:'none', background:'transparent', color:C.red, cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:500}}> 
          <LogOut size={14}/>Sign Out 
        </button>
      </div>
    </div>
  );
}

// ===================== TOPBAR =====================
function TopBar({user, module, onSearchOpen, notifications, onNotifToggle, notifOpen}) {
  const labels = {
    dashboard:'Faculty Dashboard',
    teaching:'Teaching & Assessment',
    curriculum:'Curriculum Design & OBE Alignment',
    materials:'Teaching Materials & Resources',
    capstone:'Capstone Supervision & Evaluation'
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{background:C.surface, borderBottom:`1px solid ${C.border}`, padding:'16px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0}}>
      <div>
        <div style={{fontSize:11, color:C.muted, textTransform:'uppercase', letterSpacing:1.5, fontWeight:600, marginBottom:4}}>
          Daffodil International University {'\u2022'} Dept. of {user?.dept || 'CSE'}
        </div>
        <h1 style={{fontSize:22, fontWeight:700, color:C.text, fontFamily:FONT_SERIF}}>{labels[module] || module}</h1>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:20}}>
        <button onClick={onSearchOpen} style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 12px', color:C.sub, display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, fontFamily:FONT_SANS}}>
          <Search size={16}/> <span>Search...</span> <span style={{marginLeft:12, background:C.card, padding:'2px 6px', borderRadius:4, fontSize:10, border:`1px solid ${C.border}`}}>⌘K</span>
        </button>
        <div style={{fontSize:13, color:C.sub, fontWeight:500}}>{new Date().toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric', year:'numeric'})}</div>
        <div style={{position:'relative', cursor:'pointer'}}>
          <button onClick={onNotifToggle} style={{background:'none', border:'none', cursor:'pointer', position:'relative', display:'flex'}}>
            <Bell size={20} color={C.sub}/>
            {unreadCount > 0 && <span style={{position:'absolute', top:-2, right:-2, width:10, height:10, borderRadius:'50%', background:C.red, border:`2px solid ${C.surface}`}}/>}
          </button>
          {notifOpen && (
            <div style={{position:'absolute', top:40, right:0, width:320, background:C.card, border:`1px solid ${C.border}`, borderRadius:12, boxShadow:'0 10px 25px rgba(0,0,0,0.5)', zIndex:100, overflow:'hidden'}}>
              <div style={{padding:'16px', borderBottom:`1px solid ${C.border}`, fontWeight:600, display:'flex', justifyContent:'space-between'}}>
                <span>Notifications</span>
                <span style={{fontSize:11, color:C.accent, cursor:'pointer'}}>Mark all read</span>
              </div>
              <div style={{maxHeight:300, overflowY:'auto'}}>
                {notifications.map(n => (
                  <div key={n.id} style={{padding:'12px 16px', borderBottom:`1px solid ${C.border}`, background:n.read?'transparent':`${C.accent}08`}}>
                    <div style={{fontSize:13, color:C.text}}>{n.text}</div>
                    <div style={{fontSize:11, color:C.muted, marginTop:4}}>{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <Avatar user={user} size={40} style={{boxShadow:'0 4px 6px rgba(0,0,0,0.2)'}}/>
      </div>
    </div>
  );
}

// ===================== GLOBAL SEARCH =====================
function GlobalSearch({open, onClose, grades, courses, materials, projects}) {
  const [q, setQ] = useState('');
  
  const results = useMemo(() => {
    if (!q.trim()) return {students: [], courses: [], materials: [], projects: []};
    const lower = q.toLowerCase();
    return {
      students: grades.filter(g => g.student.toLowerCase().includes(lower) || g.sid.toLowerCase().includes(lower)),
      courses: courses.filter(c => c.name.toLowerCase().includes(lower) || c.code.toLowerCase().includes(lower)),
      materials: materials.filter(m => m.title.toLowerCase().includes(lower) || (m.course && m.course.toLowerCase().includes(lower))),
      projects: projects.filter(p => p.title.toLowerCase().includes(lower) || p.student.toLowerCase().includes(lower))
    };
  }, [q, grades, courses, materials, projects]);

  const total = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <Modal open={open} onClose={onClose} title="Global Search" width={700}>
      <div style={{position:'relative', marginBottom:20}}>
        <Search size={18} style={{position:'absolute', left:14, top:14, color:C.muted}}/>
        <input 
          autoFocus
          value={q} 
          onChange={e => setQ(e.target.value)} 
          placeholder="Search students, courses, materials, projects..." 
          style={{width:'100%', background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'12px 14px 12px 42px', color:C.text, fontSize:15, outline:'none', fontFamily:FONT_SANS}}
        />
      </div>
      {q.trim() && (
        <div style={{maxHeight:400, overflowY:'auto'}}>
          {total === 0 && <div style={{textAlign:'center', color:C.muted, padding:20}}>No results found for "{q}"</div>}
          {results.students.length > 0 && (
            <div style={{marginBottom:20}}>
              <div style={{fontSize:12, color:C.muted, fontWeight:600, textTransform:'uppercase', marginBottom:8}}>Students ({results.students.length})</div>
              {results.students.map(s => (
                <div key={s.sid} style={{padding:'10px 14px', background:C.surface, borderRadius:8, marginBottom:6, display:'flex', justifyContent:'space-between'}}>
                  <span style={{color:C.text}}>{s.student}</span>
                  <span style={{color:C.muted, fontSize:12}}>{s.sid} {'\u2022'} {s.grade}</span>
                </div>
              ))}
            </div>
          )}
          {results.courses.length > 0 && (
            <div style={{marginBottom:20}}>
              <div style={{fontSize:12, color:C.muted, fontWeight:600, textTransform:'uppercase', marginBottom:8}}>Courses ({results.courses.length})</div>
              {results.courses.map(c => (
                <div key={c.id} style={{padding:'10px 14px', background:C.surface, borderRadius:8, marginBottom:6, display:'flex', justifyContent:'space-between'}}>
                  <span style={{color:C.text}}>{c.name}</span>
                  <span style={{color:C.muted, fontSize:12}}>{c.code} {'\u2022'} {c.credits} Credits</span>
                </div>
              ))}
            </div>
          )}
          {results.materials.length > 0 && (
            <div style={{marginBottom:20}}>
              <div style={{fontSize:12, color:C.muted, fontWeight:600, textTransform:'uppercase', marginBottom:8}}>Materials ({results.materials.length})</div>
              {results.materials.map(m => (
                <div key={m.id} style={{padding:'10px 14px', background:C.surface, borderRadius:8, marginBottom:6, display:'flex', justifyContent:'space-between'}}>
                  <span style={{color:C.text}}>{m.title}</span>
                  <span style={{color:C.muted, fontSize:12}}>{m.type} {'\u2022'} {m.course}</span>
                </div>
              ))}
            </div>
          )}
          {results.projects.length > 0 && (
            <div style={{marginBottom:20}}>
              <div style={{fontSize:12, color:C.muted, fontWeight:600, textTransform:'uppercase', marginBottom:8}}>Capstone Projects ({results.projects.length})</div>
              {results.projects.map(p => (
                <div key={p.id} style={{padding:'10px 14px', background:C.surface, borderRadius:8, marginBottom:6, display:'flex', justifyContent:'space-between'}}>
                  <span style={{color:C.text}}>{p.title}</span>
                  <span style={{color:C.muted, fontSize:12}}>{p.student} {'\u2022'} {p.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

// ===================== DASHBOARD =====================
function DashboardHome({grades, courses, projects, setModule, deadlines, setDeadlines}) {
  const aiTools = [
    {title:'Generate Quiz', desc:'Create quiz questions from any topic', icon:ClipboardList, color:C.accent, module:'teaching'},
    {title:'Draft Feedback', desc:'AI-assisted student feedback writing', icon:MessageCircle, color:C.blue, module:'teaching'},
    {title:'Notes Generator', desc:'Create lecture notes instantly with AI', icon:FileText, color:C.green, module:'materials'},
    {title:'Curriculum Gap Analysis', desc:'Analyze CLO-PLO alignment gaps', icon:Target, color:C.purple, module:'curriculum'},
    {title:'FAQ Generator', desc:'Auto-generate course FAQs with AI', icon:BookMarked, color:C.cyan, module:'materials'},
    {title:'Screen Proposals', desc:'AI-assisted capstone proposal review', icon:Eye, color:C.red, module:'capstone'}
  ];

  const [deadlineModal, setDeadlineModal] = useState(false);
  const [deadlineForm, setDeadlineForm] = useState({task:'', course:'', date:'', priority:'Medium'});
  const priorityColor = {High:C.red, Medium:C.gold, Low:C.blue};

  function openAddDeadline() {
    setDeadlineForm({task:'', course:'', date:new Date().toISOString().split('T')[0], priority:'Medium'});
    setDeadlineModal(true);
  }
  function saveDeadline() {
    if (!deadlineForm.task.trim() || !deadlineForm.date) return;
    const next = [...deadlines, {...deadlineForm, id:Date.now()}].sort((a, b) => new Date(a.date) - new Date(b.date));
    setDeadlines(next);
    setDeadlineModal(false);
  }
  function delDeadline(id) { setDeadlines(deadlines.filter(d => d.id !== id)); }

  const pending = grades.filter(g => g.final === 0).length;
  
  return (
    <div className="fade-in">
      <SectionHead title={`Welcome back, Faculty Member ${'\uD83D\uDC4B'}`} sub="Here is your teaching overview for the current semester at Daffodil International University."/>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:20, marginBottom:32}}>
        <StatCard icon={Users} label="Total Students" value={grades.length} color={C.accent} sub="Across active courses"/>
        <StatCard icon={BookOpen} label="Active Courses" value={courses.length} color={C.blue} sub="Current Semester"/>
        <StatCard icon={ClipboardList} label="Pending Grades" value={pending} color={pending > 0 ? C.red : C.green} sub={pending > 0 ? "Need attention" : "All graded"}/>
        <StatCard icon={Award} label="Capstone Projects" value={projects.length} color={C.purple} sub="In supervision"/>
      </div>
      
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:32}}>
        <div>
          <h3 style={{fontSize:16, fontWeight:600, color:C.text, marginBottom:16, display:'flex', alignItems:'center', gap:10, fontFamily:FONT_SERIF}}><Brain size={18} color={C.accent}/>Quick AI Tools</h3>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            {aiTools.map(t => (
              <Card key={t.title} onClick={() => setModule(t.module)} style={{cursor:'pointer', padding:18}}>
                <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
                  <div style={{background:`${t.color}20`, borderRadius:8, padding:8, display:'flex'}}><t.icon size={16} color={t.color}/></div>
                  <span style={{fontSize:14, fontWeight:600, color:C.text}}>{t.title}</span>
                </div>
                <p style={{fontSize:12, color:C.muted, lineHeight:1.5}}>{t.desc}</p>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <h3 style={{fontSize:16, fontWeight:600, color:C.text, marginBottom:16, display:'flex', alignItems:'center', gap:10, fontFamily:FONT_SERIF}}><TrendingUp size={18} color={C.blue}/>Capstone Progress</h3>
          {projects.map(p => (
            <Card key={p.id} style={{marginBottom:12, padding:18}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12}}>
                <div>
                  <div style={{fontSize:14, fontWeight:600, color:C.text}}>{p.title}</div>
                  <div style={{fontSize:12, color:C.muted, marginTop:4}}>{p.student}</div>
                </div>
                <Tag label={p.status} color={p.status === 'On Track' ? C.green : C.accent}/>
              </div>
              <div style={{background:C.border, borderRadius:4, height:6, overflow:'hidden'}}>
                <div style={{width:`${p.progress}%`, height:'100%', background:p.progress > 60 ? C.green : C.accent, borderRadius:4, transition:'width 0.5s'}}/>
              </div>
              <div style={{fontSize:11, color:C.muted, marginTop:6}}>{p.progress}% complete</div>
            </Card>
          ))}
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:24, marginBottom:32}}>
        <div>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16}}>
            <h3 style={{fontSize:16, fontWeight:600, color:C.text, display:'flex', alignItems:'center', gap:10, fontFamily:FONT_SERIF}}><Clock size={18} color={C.gold}/>Upcoming Deadlines</h3>
            <Btn onClick={openAddDeadline} icon={Plus} size="sm" variant="secondary">Add Deadline</Btn>
          </div>
          <Card style={{padding:0, overflow:'hidden'}}>
            {deadlines.length === 0 ? (
              <div style={{padding:'24px 20px', textAlign:'center', color:C.muted, fontSize:13}}>No deadlines yet. Click "Add Deadline" to create one.</div>
            ) : deadlines.map((d, i) => (
              <div key={d.id} style={{padding:'16px 20px', borderBottom: i < deadlines.length-1 ? `1px solid ${C.border}` : 'none', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <div style={{fontSize:14, fontWeight:500, color:C.text}}>{d.task}</div>
                  <div style={{fontSize:12, color:C.muted}}>{d.course}</div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <span style={{fontSize:12, color:C.sub}}>{d.date}</span>
                  <Tag label={d.priority} color={priorityColor[d.priority] || C.gold}/>
                  <button onClick={() => delDeadline(d.id)} style={{background:'none', border:'none', color:C.muted, cursor:'pointer', display:'flex', padding:2}}><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </Card>
        </div>
        <div>
          <h3 style={{fontSize:16, fontWeight:600, color:C.text, marginBottom:16, display:'flex', alignItems:'center', gap:10, fontFamily:FONT_SERIF}}><Mail size={18} color={C.cyan}/>Quick Email Drafter</h3>
          <AIBox title="Draft Student Email" placeholder="e.g. Remind students about midterm exam on Friday, chapters 1-3..." buildPrompt={inp => `Draft a professional academic email to students regarding: ${inp}. Include a clear subject line, polite salutation, structured body, and professional sign-off.`} resultLabel="Email Draft"/>
        </div>
      </div>

      <h3 style={{fontSize:16, fontWeight:600, color:C.text, marginTop:24, marginBottom:16, display:'flex', alignItems:'center', gap:10, fontFamily:FONT_SERIF}}><BookOpen size={18} color={C.green}/>Courses This Semester</h3>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        {courses.map(c => (
          <Card key={c.id} style={{padding:18}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <span style={{fontSize:14, fontWeight:700, color:C.accent, fontFamily:FONT_SERIF}}>{c.code}</span>
                <span style={{fontSize:14, color:C.text, marginLeft:10}}>{c.name}</span>
              </div>
              <Tag label={`${c.students} students`} color={C.blue}/>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={deadlineModal} onClose={() => setDeadlineModal(false)} title="Add Deadline" width={460}>
        <Input label="Task" value={deadlineForm.task} onChange={v => setDeadlineForm({...deadlineForm, task:v})} placeholder="e.g. Submit Final Grades"/>
        <Input label="Course" value={deadlineForm.course} onChange={v => setDeadlineForm({...deadlineForm, course:v})} placeholder="e.g. CSE401 or All Courses"/>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <Input label="Due Date" type="date" value={deadlineForm.date} onChange={v => setDeadlineForm({...deadlineForm, date:v})}/>
          <div style={{marginBottom:18}}>
            <label style={{display:'block', fontSize:12, color:C.sub, marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Priority</label>
            <select value={deadlineForm.priority} onChange={e => setDeadlineForm({...deadlineForm, priority:e.target.value})} style={{width:'100%', background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'12px 14px', color:C.text, fontSize:14, fontFamily:'inherit', outline:'none'}}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
        <div style={{display:'flex', gap:10, justifyContent:'flex-end', marginTop:12}}>
          <Btn onClick={() => setDeadlineModal(false)} variant="ghost">Cancel</Btn>
          <Btn onClick={saveDeadline} icon={Save}>Add Deadline</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ===================== TEACHING MODULE =====================
function TeachingModule({grades, setGrades, courses, attendance, setAttendance}) {
  const [tab, setTab] = useState('quiz');
  const tabs = [
    {id:'quiz', icon:ClipboardList, label:'Quiz Generator'},
    {id:'gradebook', icon:BarChart3, label:'Grade Book'},
    {id:'attendance', icon:CheckSquare, label:'Attendance'},
    {id:'grader', icon:Check, label:'AI Grader'},
    {id:'feedback', icon:MessageCircle, label:'Feedback Generator'},
    {id:'analytics', icon:TrendingUp, label:'Learning Analytics'}
  ];
  return (
    <div className="fade-in">
      <SectionHead title="Teaching & Assessment" sub="Manage evaluations, grades, attendance, and AI-powered tools."/>
      <TabBar tabs={tabs} active={tab} setActive={setTab}/>
      {tab === 'quiz' && <QuizGen courses={courses}/>}
      {tab === 'gradebook' && <GradeBook grades={grades} setGrades={setGrades} onManageStudents={() => setTab('attendance')}/>}
      {tab === 'attendance' && <AttendanceTracker grades={grades} setGrades={setGrades} attendance={attendance} setAttendance={setAttendance}/>}
      {tab === 'grader' && <AIGrader/>}
      {tab === 'feedback' && <FeedbackGen/>}
      {tab === 'analytics' && <Analytics grades={grades}/>}
    </div>
  );
}

function QuizGen({courses}) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
      <AIBox title="Multiple Choice Quiz Generator" placeholder="Enter topic, CLO, or paste content to generate MCQ quiz questions..." buildPrompt={inp => `Generate 5 multiple choice quiz questions for university level about: ${inp}. Format each question with: Question, A) B) C) D) options, and **Answer: X** at the end. Make them academically rigorous.`} resultLabel="Generated Quiz Questions"/>
      <AIBox title="Short Answer / Essay Questions" placeholder="Enter topic or learning outcome for short answer questions..." buildPrompt={inp => `Generate 4 short-answer and essay questions for university-level assessment on: ${inp}. Include: question, expected answer key points (3-5 bullet points each), and marks allocation. Make them test higher-order thinking (analysis, synthesis, evaluation).`} resultLabel="Generated Questions"/>
      <AIBox title="True/False & Fill-in-the-Blank" placeholder="Enter topic for True/False and fill-in-the-blank questions..." buildPrompt={inp => `Create 6 True/False questions and 4 fill-in-the-blank questions for: ${inp}. For True/False, provide the answer. For fill-in-the-blank, provide the correct word/phrase in brackets.`} resultLabel="Generated Questions"/>
      <AIBox title="Case Study / Scenario Questions" placeholder="Enter subject area for scenario-based questions..." buildPrompt={inp => `Create a real-world scenario/case study and 3 analytical questions related to: ${inp}. The scenario should be relevant to industry practice. Include evaluation criteria for each question.`} resultLabel="Case Study & Questions"/>
    </div>
  );
}

function GradeBook({grades, setGrades, onManageStudents}) {
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({student:'', sid:'', quiz1:0, quiz2:0, mid:0, assign:0, final:0});
  
  function openEdit(g) { setForm({...g}); setEdit(g.id); setModal(true); }
  function calcGrade(f) { const t = (+f.quiz1 + +f.quiz2) * 0.1 + (+f.assign) * 0.2 + (+f.mid) * 0.3 + (+f.final) * 0.4; if (t >= 90) return 'A+'; if (t >= 85) return 'A'; if (t >= 80) return 'A-'; if (t >= 75) return 'B+'; if (t >= 70) return 'B'; if (t >= 65) return 'B-'; if (t >= 60) return 'C+'; if (t >= 55) return 'C'; if (t >= 50) return 'D'; return 'F'; }
  function save() { const g = calcGrade(form); setGrades(grades.map(x => x.id === edit ? {...form, grade:g} : x)); setModal(false); }
  function del(id) { setGrades(grades.filter(g => g.id !== id)); }
  const avg = g => ((+g.quiz1 + +g.quiz2) * 0.1 + (+g.assign) * 0.2 + (+g.mid) * 0.3 + (+g.final) * 0.4).toFixed(1);
  
  function exportCSV() {
    const headers = ['Student Name', 'Student ID', 'Quiz 1', 'Quiz 2', 'Assignment', 'Mid Term', 'Final', 'Total%', 'Grade'];
    const rows = grades.map(g => [g.student, g.sid, g.quiz1, g.quiz2, g.assign, g.mid, g.final, avg(g), g.grade]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'gradebook.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginBottom:20, flexWrap:'wrap'}}>
        <div style={{display:'flex', alignItems:'center', gap:8, fontSize:13, color:C.muted}}>
          <Users size={15} color={C.accent}/>
          <span>Adding a new student? Manage your class roster from the <strong style={{color:C.text}}>Attendance</strong> tab.</span>
          {onManageStudents && <button onClick={onManageStudents} style={{background:'none', border:'none', color:C.accent, cursor:'pointer', fontWeight:600, fontSize:13, textDecoration:'underline', padding:0}}>Go there</button>}
        </div>
        <Btn onClick={exportCSV} icon={Download} variant="secondary">Export CSV</Btn>
      </div>
      {grades.length === 0 ? (
        <Card style={{padding:40, textAlign:'center'}}>
          <Users size={28} color={C.muted} style={{marginBottom:12}}/>
          <div style={{color:C.sub, fontSize:14, marginBottom:16}}>No students yet. Add your first student from the Attendance tab and they'll appear here for grading.</div>
          {onManageStudents && <Btn onClick={onManageStudents} icon={Plus}>Add Student in Attendance</Btn>}
        </Card>
      ) : (
      <>
      <div style={{overflowX:'auto', border:`1px solid ${C.border}`, borderRadius:12}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
          <thead>
            <tr style={{background:C.surface}}>
              {['Student Name','Student ID','Quiz 1','Quiz 2','Assignment','Mid Term','Final','Total%','Grade','Actions'].map(h => <th key={h} style={{padding:'14px 16px', textAlign:'left', color:C.muted, fontWeight:600, borderBottom:`2px solid ${C.border}`, whiteSpace:'nowrap', fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em'}}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {grades.map((g, i) => (
              <tr key={g.id} style={{borderBottom:`1px solid ${C.border}`, background:i % 2 === 0 ? C.card : C.surface, transition:'background 0.2s'}}>
                <td style={{padding:'16px', color:C.text, fontWeight:500}}>{g.student}</td>
                <td style={{padding:'16px', color:C.muted}}>{g.sid}</td>
                <td style={{padding:'16px', color:C.text}}>{g.quiz1}</td>
                <td style={{padding:'16px', color:C.text}}>{g.quiz2}</td>
                <td style={{padding:'16px', color:C.text}}>{g.assign}</td>
                <td style={{padding:'16px', color:C.text}}>{g.mid}</td>
                <td style={{padding:'16px', color:g.final === 0 ? C.red : C.text}}>{g.final === 0 ? '\u2014' : g.final}</td>
                <td style={{padding:'16px'}}><span style={{fontWeight:700, color:+avg(g) >= 70 ? C.green : +avg(g) >= 50 ? C.accent : C.red}}>{avg(g)}%</span></td>
                <td style={{padding:'16px'}}><Tag label={g.grade} color={g.grade.startsWith('A') ? C.green : g.grade.startsWith('B') ? C.blue : g.grade.startsWith('C') ? C.accent : C.red}/></td>
                <td style={{padding:'16px'}}>
                  <div style={{display:'flex', gap:12}}>
                    <button onClick={() => openEdit(g)} style={{background:'none', border:'none', color:C.blue, cursor:'pointer'}}><Edit3 size={15}/></button>
                    <button onClick={() => del(g.id)} style={{background:'none', border:'none', color:C.red, cursor:'pointer'}}><Trash2 size={15}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{display:'flex', gap:24, marginTop:20, padding:'16px 20px', background:C.surface, borderRadius:12, border:`1px solid ${C.border}`}}>
        <span style={{fontSize:13, color:C.muted}}>Class Average: <strong style={{color:C.text}}>{grades.length ? (grades.reduce((s, g) => s + parseFloat(avg(g)), 0) / grades.length).toFixed(1) : 0}%</strong></span>
        <span style={{fontSize:13, color:C.muted}}>Students: <strong style={{color:C.text}}>{grades.length}</strong></span>
        <span style={{fontSize:13, color:C.muted}}>Pending Finals: <strong style={{color:C.red}}>{grades.filter(g => g.final === 0).length}</strong></span>
      </div>
      </>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Edit Student Record" width={500}>
        <Input label="Student Name" value={form.student} onChange={v => setForm({...form, student:v})} placeholder="Full name"/>
        <Input label="Student ID" value={form.sid} onChange={v => setForm({...form, sid:v})} placeholder="e.g. CSE2101"/>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <Input label="Quiz 1 (out of 100)" value={form.quiz1} onChange={v => setForm({...form, quiz1:v})} type="number"/>
          <Input label="Quiz 2 (out of 100)" value={form.quiz2} onChange={v => setForm({...form, quiz2:v})} type="number"/>
          <Input label="Assignment (out of 100)" value={form.assign} onChange={v => setForm({...form, assign:v})} type="number"/>
          <Input label="Mid Term (out of 100)" value={form.mid} onChange={v => setForm({...form, mid:v})} type="number"/>
          <Input label="Final Exam (out of 100)" value={form.final} onChange={v => setForm({...form, final:v})} type="number"/>
          <div style={{display:'flex', alignItems:'flex-end', paddingBottom:18}}>
            <div style={{padding:'12px 14px', background:C.surface, borderRadius:8, fontSize:14, color:C.text, width:'100%', border:`1px solid ${C.border}`}}>Grade: <strong style={{color:C.accent}}>{calcGrade(form)}</strong></div>
          </div>
        </div>
        <div style={{display:'flex', gap:12, justifyContent:'flex-end', marginTop:12}}>
          <Btn onClick={() => setModal(false)} variant="ghost">Cancel</Btn>
          <Btn onClick={save} icon={Save}>Save Record</Btn>
        </div>
      </Modal>
    </div>
  );
}

function AttendanceTracker({grades, setGrades, attendance, setAttendance}) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState({});
  const [savedMsg, setSavedMsg] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({student:'', sid:''});
  const [addError, setAddError] = useState('');

  useEffect(() => {
    const existing = attendance.find(a => a.date === selectedDate);
    const initial = {};
    grades.forEach(g => { initial[g.sid] = (existing && existing.records[g.sid]) || 'Present'; });
    setRecords(initial);
  }, [selectedDate, grades, attendance]);

  function toggleStatus(sid) {
    setRecords(prev => {
      const current = prev[sid] || 'Present';
      const next = current === 'Present' ? 'Absent' : current === 'Absent' ? 'Late' : 'Present';
      return {...prev, [sid]: next};
    });
  }

  function save() {
    const newAttendance = attendance.filter(a => a.date !== selectedDate);
    newAttendance.push({date: selectedDate, records});
    setAttendance(newAttendance);
    setSavedMsg('Attendance saved successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  }

  function openAddStudent() { setNewStudent({student:'', sid:''}); setAddError(''); setAddModal(true); }

  function saveNewStudent() {
    const student = newStudent.student.trim();
    const sid = newStudent.sid.trim();
    if (!student || !sid) { setAddError('Please enter both student name and ID.'); return; }
    if (grades.some(g => g.sid.toLowerCase() === sid.toLowerCase())) { setAddError('A student with this ID already exists.'); return; }
    setGrades([...grades, {id:Date.now(), student, sid, quiz1:0, quiz2:0, mid:0, assign:0, final:0, grade:'F'}]);
    setAddModal(false);
  }

  const statusColor = {'Present': C.green, 'Absent': C.red, 'Late': C.gold};

  return (
    <div>
      <div style={{display:'flex', gap:16, marginBottom:20, alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap'}}>
        <div style={{display:'flex', gap:16, alignItems:'flex-end'}}>
          <Input label="Select Date" type="date" value={selectedDate} onChange={setSelectedDate} />
          <Btn onClick={save} icon={Save} size="lg">Save Attendance</Btn>
          {savedMsg && <span style={{color:C.green, fontSize:13, marginBottom:12}}>{savedMsg}</span>}
        </div>
        <Btn onClick={openAddStudent} icon={Plus} variant="secondary" size="lg">Add Student</Btn>
      </div>
      <Card>
        {grades.length === 0 ? (
          <div style={{padding:'32px 20px', textAlign:'center', color:C.sub, fontSize:14}}>No students yet. Click "Add Student" above to build your class roster &mdash; they'll also show up in the Grade Book.</div>
        ) : (
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
            <thead>
              <tr style={{background:C.surface}}>
                <th style={{padding:'14px 16px', textAlign:'left', color:C.muted, borderBottom:`2px solid ${C.border}`}}>Student</th>
                <th style={{padding:'14px 16px', textAlign:'left', color:C.muted, borderBottom:`2px solid ${C.border}`}}>ID</th>
                <th style={{padding:'14px 16px', textAlign:'center', color:C.muted, borderBottom:`2px solid ${C.border}`}}>Status (Click to toggle)</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g, i) => (
                <tr key={g.sid} style={{borderBottom:`1px solid ${C.border}`, background:i%2===0?C.card:C.surface}}>
                  <td style={{padding:'16px', color:C.text}}>{g.student}</td>
                  <td style={{padding:'16px', color:C.muted}}>{g.sid}</td>
                  <td style={{padding:'16px', textAlign:'center'}}>
                    <button 
                      onClick={() => toggleStatus(g.sid)}
                      style={{
                        padding:'6px 16px', 
                        borderRadius:20, 
                        border:`1px solid ${statusColor[records[g.sid]] || C.border}`,
                        background:`${statusColor[records[g.sid]]}20`,
                        color:statusColor[records[g.sid]],
                        fontWeight:600,
                        cursor:'pointer',
                        fontSize:12,
                        minWidth:80
                      }}
                    >
                      {records[g.sid] || 'Present'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </Card>

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Student" width={420}>
        <Input label="Student Name" value={newStudent.student} onChange={v => setNewStudent({...newStudent, student:v})} placeholder="Full name"/>
        <Input label="Student ID" value={newStudent.sid} onChange={v => setNewStudent({...newStudent, sid:v})} placeholder="e.g. CSE2106"/>
        {addError && <div style={{color:C.red, fontSize:12, marginTop:-8, marginBottom:14}}>{addError}</div>}
        <div style={{fontSize:12, color:C.muted, marginBottom:16}}>This student will be added to attendance and become available for grading in the Grade Book.</div>
        <div style={{display:'flex', gap:12, justifyContent:'flex-end'}}>
          <Btn onClick={() => setAddModal(false)} variant="ghost">Cancel</Btn>
          <Btn onClick={saveNewStudent} icon={Save}>Add Student</Btn>
        </div>
      </Modal>
    </div>
  );
}

function AIGrader() {
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
      <AIBox title="Assignment / Essay Grader" placeholder="Paste the marking rubric criteria, then the student's submission..." buildPrompt={inp => `As a university professor, evaluate and grade this student submission. Provide: 1) Overall grade/score with justification, 2) Strengths (3-4 points), 3) Areas for improvement (3-4 points), 4) Specific feedback on each rubric criterion, 5) Suggestions for revision. Be constructive and academically rigorous.\n\nSubmission/Rubric:\n${inp}`} resultLabel="Grading Feedback"/>
      <AIBox title="MCQ Auto-Score Helper" placeholder="Paste MCQ answer key followed by student answers (e.g., Key: ABCD... | Student: ABDC...)..." buildPrompt={inp => `Evaluate these MCQ answers. Compare the answer key with student answers and: 1) Calculate total score, 2) List which questions were wrong, 3) Identify topic gaps based on errors, 4) Suggest study areas. Format clearly.\n\n${inp}`} resultLabel="Score Analysis"/>
      <AIBox title="Recheck / Resubmission Review" placeholder="Paste the original feedback and student's resubmission for re-evaluation..." buildPrompt={inp => `Review this resubmission compared to original feedback. Assess: 1) Did the student address previous feedback? 2) What improvements were made? 3) What still needs work? 4) Revised grade with justification. Be fair and thorough.\n\n${inp}`} resultLabel="Recheck Assessment"/>
      <AIBox title="Plagiarism Pattern Detection" placeholder="Paste student submission to analyze for suspicious writing patterns..." buildPrompt={inp => `Analyze this academic submission for: 1) Unusual writing style inconsistencies, 2) Abrupt topic transitions, 3) Mixing of citation styles, 4) Vocabulary inconsistencies, 5) Structural anomalies. Rate suspicion level (Low/Medium/High) with specific observations. Note: This is a pattern analysis, not a definitive plagiarism check.\n\n${inp}`} resultLabel="Pattern Analysis"/>
    </div>
  );
}

function FeedbackGen() {
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
      <AIBox title="Individual Student Feedback" placeholder="Describe the student's performance, strengths, and areas to improve..." buildPrompt={inp => `Write constructive, encouraging academic feedback for a university student based on: ${inp}. Structure it as: 1) Opening acknowledgment, 2) Specific strengths observed, 3) Areas for improvement with actionable advice, 4) Encouraging closing statement. Keep it professional, empathetic, and motivating.`} resultLabel="Generated Feedback"/>
      <AIBox title="Class-Wide Announcement" placeholder="Describe common mistakes or patterns observed across the class..." buildPrompt={inp => `Write a professional class-wide feedback announcement for students based on: ${inp}. Include: 1) General performance summary, 2) Common strengths, 3) Common mistakes to avoid, 4) Specific improvement strategies, 5) Next steps. Tone should be encouraging but clear.`} resultLabel="Class Announcement"/>
      <AIBox title="Assessment Query Response" placeholder="Paste the student's query about their marks or assessment..." buildPrompt={inp => `Draft a professional, empathetic response to this student assessment query: ${inp}. The response should: 1) Acknowledge their concern, 2) Explain the evaluation criteria clearly, 3) Provide specific reasons for the grade given, 4) Offer constructive path forward. Be respectful and fair.`} resultLabel="Response Draft"/>
      <AIBox title="Progress Report Generator" placeholder="List key observations about student performance over the semester..." buildPrompt={inp => `Write a comprehensive semester progress report for a student based on: ${inp}. Include sections: Academic Performance, Participation & Engagement, Skills Development, Areas of Excellence, Areas Needing Improvement, and Recommendations for Next Semester. Make it suitable for official records.`} resultLabel="Progress Report"/>
    </div>
  );
}

function Analytics({grades}) {
  const avg = g => ((+g.quiz1 + +g.quiz2) * 0.1 + (+g.assign) * 0.2 + (+g.mid) * 0.3 + (+g.final) * 0.4);
  const dist = {'A+':0, 'A':0, 'A-':0, 'B+':0, 'B':0, 'B-':0, 'C+':0, 'C':0, 'D':0, 'F':0};
  grades.forEach(g => dist[g.grade] = (dist[g.grade] || 0) + 1);
  const barColors = {'A+':C.green, 'A':C.green, 'A-':C.green, 'B+':C.blue, 'B':C.blue, 'B-':C.blue, 'C+':C.accent, 'C':C.accent, 'D':C.red, 'F':C.red};
  const max = Math.max(...Object.values(dist), 1);
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
      <Card>
        <h3 style={{fontSize:16, fontWeight:600, color:C.text, marginBottom:20, fontFamily:FONT_SERIF}}>Grade Distribution</h3>
        {Object.entries(dist).filter(([, v]) => v > 0).map(([g, n]) => (
          <div key={g} style={{display:'flex', alignItems:'center', gap:12, marginBottom:12}}>
            <span style={{fontSize:13, color:C.muted, width:28, fontWeight:600}}>{g}</span>
            <div style={{flex:1, background:C.border, borderRadius:4, height:24, overflow:'hidden'}}>
              <div style={{width:`${(n / max) * 100}%`, height:'100%', background:barColors[g] || C.accent, borderRadius:4, display:'flex', alignItems:'center', paddingLeft:10}}>
                <span style={{fontSize:11, color:'#fff', fontWeight:600}}>{n}</span>
              </div>
            </div>
            <span style={{fontSize:12, color:C.muted}}>{n} student{n !== 1 ? 's' : ''}</span>
          </div>
        ))}
      </Card>
      <Card>
        <h3 style={{fontSize:16, fontWeight:600, color:C.text, marginBottom:20, fontFamily:FONT_SERIF}}>Student Performance Overview</h3>
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          {grades.sort((a, b) => avg(b) - avg(a)).map(g => (
            <div key={g.id} style={{display:'flex', alignItems:'center', gap:12}}>
              <span style={{fontSize:12, color:C.muted, width:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{g.student.split(' ')[0]}</span>
              <div style={{flex:1, background:C.border, borderRadius:4, height:18, overflow:'hidden'}}>
                <div style={{width:`${avg(g)}%`, height:'100%', background:avg(g) >= 70 ? C.green : avg(g) >= 50 ? C.accent : C.red, borderRadius:4}}/>
              </div>
              <span style={{fontSize:12, color:C.text, width:45, textAlign:'right', fontWeight:600}}>{avg(g).toFixed(0)}%</span>
              <Tag label={g.grade} color={barColors[g.grade] || C.accent}/>
            </div>
          ))}
        </div>
      </Card>
      <Card style={{gridColumn:'span 2'}}>
        <AIBox title="AI Learning Analytics Insights" placeholder="Describe patterns you've noticed or paste student performance data for analysis..." buildPrompt={inp => `As an educational analytics expert, analyze these student performance insights and provide: 1) Key performance trends, 2) At-risk student identification strategies, 3) Content areas with low performance, 4) Recommended interventions, 5) Teaching strategy adjustments. Data: ${inp}`} resultLabel="Analytics Insights"/>
      </Card>
    </div>
  );
}

// ===================== CURRICULUM MODULE =====================
function CurriculumModule({courses, setCourses, curriculumAssets, setCurriculumAssets}) {
  const [tab, setTab] = useState('mapping');
  const [addCourseModal, setAddCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({code:'', name:'', credits:3, semester:'Fall 2025', students:0});
  const tabs = [
    {id:'mapping', icon:Map, label:'CLO-PLO Mapping'},
    {id:'syllabus', icon:FileText, label:'Syllabus Manager'},
    {id:'assessment', icon:Clipboard, label:'Assessment Plan'},
    {id:'repository', icon:Upload, label:'Course & Program Uploads'},
    {id:'gap', icon:Target, label:'Gap Analyzer'},
    {id:'trends', icon:TrendingUp, label:'Trend Analysis'}
  ];
  function addCourse() {
    if (!newCourse.code.trim() || !newCourse.name.trim()) return;
    const course = {...newCourse, id:Date.now(), credits:+newCourse.credits || 3, students:+newCourse.students || 0, clos:[], plos:[], mapping:{}, documents:[]};
    setCourses([...courses, course]);
    setNewCourse({code:'', name:'', credits:3, semester:'Fall 2025', students:0});
    setAddCourseModal(false);
  }
  return (
    <div className="fade-in">
      <SectionHead title="Curriculum Design & OBE Alignment" sub="Manage learning outcomes, syllabi, curriculum files, course documents, and program files according to BAET standards." action={<Btn onClick={() => setAddCourseModal(true)} icon={Plus}>Add Course</Btn>}/>
      <TabBar tabs={tabs} active={tab} setActive={setTab}/>
      {tab === 'mapping' && <CLOPLOMapper courses={courses} setCourses={setCourses}/>}
      {tab === 'syllabus' && <SyllabusManager courses={courses} setCourses={setCourses}/>}
      {tab === 'assessment' && <AssessmentPlan courses={courses}/>}
      {tab === 'repository' && <CurriculumRepository courses={courses} setCourses={setCourses} curriculumAssets={curriculumAssets} setCurriculumAssets={setCurriculumAssets}/>}
      {tab === 'gap' && <GapAnalyzer/>}
      {tab === 'trends' && <TrendAnalyzer/>}
      <Modal open={addCourseModal} onClose={() => setAddCourseModal(false)} title="Add New Course" width={500}>
        <Input label="Course Code" value={newCourse.code} onChange={v => setNewCourse({...newCourse, code:v})} placeholder="e.g. CSE501"/>
        <Input label="Course Name" value={newCourse.name} onChange={v => setNewCourse({...newCourse, name:v})} placeholder="e.g. Machine Learning"/>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <Input label="Credits" value={newCourse.credits} onChange={v => setNewCourse({...newCourse, credits:v})} type="number"/>
          <Input label="Semester" value={newCourse.semester} onChange={v => setNewCourse({...newCourse, semester:v})} placeholder="e.g. Fall 2025"/>
        </div>
        <Input label="Number of Students" value={newCourse.students} onChange={v => setNewCourse({...newCourse, students:v})} type="number"/>
        <div style={{display:'flex', gap:12, justifyContent:'flex-end', marginTop:12}}>
          <Btn onClick={() => setAddCourseModal(false)} variant="ghost">Cancel</Btn>
          <Btn onClick={addCourse} icon={Plus} disabled={!newCourse.code.trim() || !newCourse.name.trim()}>Add Course</Btn>
        </div>
      </Modal>
    </div>
  );
}

function AssessmentPlan({courses}) {
  const [sel, setSel] = useState(courses[0]?.id || null);
  const course = courses.find(c => c.id === sel);
  return (
    <div>
      <div style={{marginBottom:24}}>
        <select value={sel} onChange={e => setSel(+e.target.value)} style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'12px 16px', color:C.text, fontSize:14, outline:'none'}}>
          {courses.map(c => <option key={c.id} value={c.id}>{c.code}: {c.name}</option>)}
        </select>
      </div>
      <Card>
        <h3 style={{fontSize:16, fontWeight:600, color:C.text, marginBottom:16, fontFamily:FONT_SERIF}}>Assessment Method Mapping</h3>
        <p style={{fontSize:13, color:C.muted, marginBottom:20}}>Map your Course Learning Outcomes (CLOs) to specific assessment methods to ensure OBE compliance.</p>
        {course?.clos?.length > 0 ? (
          <div style={{display:'flex', flexDirection:'column', gap:16}}>
            {course.clos.map((clo, i) => (
              <div key={i} style={{padding:16, background:C.surface, borderRadius:10, border:`1px solid ${C.border}`}}>
                <div style={{fontSize:14, fontWeight:600, color:C.accent, marginBottom:8}}>CLO {i+1}</div>
                <div style={{fontSize:13, color:C.sub, marginBottom:12}}>{typeof clo === 'string' ? clo : clo.description}</div>
                <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                  <Tag label="Midterm Exam" color={C.blue}/>
                  <Tag label="Final Project" color={C.purple}/>
                  <Tag label="Assignment 2" color={C.green}/>
                  <button style={{background:'transparent', border:`1px dashed ${C.border}`, color:C.muted, borderRadius:20, padding:'4px 12px', fontSize:11, cursor:'pointer'}}>+ Add Assessment</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{textAlign:'center', padding:30, color:C.muted}}>No CLOs defined for this course. Please add CLOs in the CLO-PLO Mapping tab.</div>
        )}
      </Card>
    </div>
  );
}

function CurriculumRepository({courses, setCourses, curriculumAssets, setCurriculumAssets}) {
  const [modal, setModal] = useState(false);
  const [viewer, setViewer] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [form, setForm] = useState({title:'', category:'Curriculum Document', notes:'', file:null, fileName:'', fileUrl:'', fileType:'', storagePath:'', storageProvider:'local'});
  const categories = ['Curriculum Document','Course Upload','Program Upload','CLO Document','PLO Document','CLO-PLO Mapping','Assessment Plan','Policy / Guideline'];
  const courseOptions = [{id:'all', label:'All Courses'}, ...courses.map(c => ({id:String(c.id), label:`${c.code}: ${c.name}`}))];
  const typeColor = {'Curriculum Document':C.accent, 'Course Upload':C.blue, 'Program Upload':C.green, 'CLO Document':C.cyan, 'PLO Document':C.purple, 'CLO-PLO Mapping':C.red, 'Assessment Plan':C.green, 'Policy / Guideline':C.muted};
  function resetForm() { setForm({title:'', category:'Curriculum Document', notes:'', file:null, fileName:'', fileUrl:'', fileType:'', storagePath:'', storageProvider:'local'}); }
  async function onPickFile(file) {
    if (!file) return;
    setForm(prev => ({...prev, file, fileName:file.name, fileType:fileKind(file)}));
    try {
      const uploaded = await uploadManagedFile(file, 'materials');
      setForm(prev => ({...prev, fileUrl:uploaded.fileUrl, storagePath:uploaded.storagePath, storageProvider:uploaded.storageProvider}));
    } catch(e) { console.warn('File upload to storage failed, file stored locally:', e.message); }
  }
  async function add() {
    const linkedCourse = selectedCourse === 'all' ? 'All Courses' : (courses.find(c => String(c.id) === String(selectedCourse))?.code || 'All Courses');
    const item = {...form, id:Date.now(), date:new Date().toISOString().split('T')[0], course:linkedCourse, size:form.file ? prettySize(form.file.size) : 'N/A'};
    setCurriculumAssets([...curriculumAssets, item]);
    setModal(false); resetForm();
  }
  function del(id) { setCurriculumAssets(curriculumAssets.filter(a => a.id !== id)); }
  function open(item) { setViewer(item); }
  const filtered = selectedCourse === 'all' ? curriculumAssets : curriculumAssets.filter(a => a.course === (courses.find(c => String(c.id) === String(selectedCourse))?.code || 'All Courses') || a.course === 'All Courses');
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginBottom:20}}>
        <div style={{color:C.sub, fontSize:13, maxWidth:680}}>Upload curriculum files, course packs, program documents, CLO files, PLO files, and mapping resources.</div>
        <Btn onClick={() => setModal(true)} icon={Plus}>Add Curriculum Resource</Btn>
      </div>
      <div style={{display:'flex', gap:10, flexWrap:'wrap', marginBottom:20}}>
        {courseOptions.map(opt => (
          <button key={opt.id} onClick={() => setSelectedCourse(opt.id)} style={{padding:'8px 16px', borderRadius:999, border:`1px solid ${selectedCourse === opt.id ? C.accent : C.border}`, background:selectedCourse === opt.id ? `${C.accent}18` : C.surface, color:selectedCourse === opt.id ? C.accent : C.sub, cursor:'pointer', fontSize:12, fontWeight:500}}>{opt.label}</button>
        ))}
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16}}>
        {filtered.map(item => (
          <Card key={item.id} style={{padding:18}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:12}}>
              <Tag label={item.category} color={typeColor[item.category] || C.muted}/>
              <div style={{display:'flex', gap:10}}>
                <button onClick={() => open(item)} title="View" style={{background:'none', border:'none', color:C.accent, cursor:'pointer'}}><Eye size={14}/></button>
                <button onClick={() => window.open(item.fileUrl || '#', '_blank')} title="Open" style={{background:'none', border:'none', color:C.green, cursor:'pointer'}}><ChevronRight size={14}/></button>
                <button onClick={() => del(item.id)} title="Delete" style={{background:'none', border:'none', color:C.red, cursor:'pointer'}}><Trash2 size={14}/></button>
              </div>
            </div>
            <h4 style={{fontSize:14, fontWeight:600, color:C.text, marginBottom:8, lineHeight:1.4}}>{item.title}</h4>
            <div style={{fontSize:12, color:C.muted, marginBottom:4}}>Course/Program: {item.course}</div>
            <div style={{fontSize:12, color:C.muted, marginBottom:4}}>File: {item.fileName || 'No file uploaded'}</div>
            <div style={{fontSize:12, color:C.muted, marginBottom:4}}>Type: {String(item.fileType || 'unknown').toUpperCase()}</div>
            <div style={{fontSize:12, color:C.muted}}>Added: {item.date} {'\u2022'} {item.size}</div>
          </Card>
        ))}
      </div>
      <Modal open={modal} onClose={() => {setModal(false); resetForm();}} title="Add Curriculum / Course / Program Resource" width={620}>
        <Input label="Resource Title" value={form.title} onChange={v => setForm({...form, title:v})} placeholder="e.g. CSE401 Curriculum Outline"/>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <div style={{marginBottom:18}}>
            <label style={{display:'block', fontSize:12, color:C.sub, marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Category</label>
            <select value={form.category} onChange={e => setForm({...form, category:e.target.value})} style={{width:'100%', background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'12px 14px', color:C.text, fontSize:14, fontFamily:FONT_SANS, outline:'none'}}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{marginBottom:18}}>
            <label style={{display:'block', fontSize:12, color:C.sub, marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Course / Program Scope</label>
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} style={{width:'100%', background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'12px 14px', color:C.text, fontSize:14, fontFamily:FONT_SANS, outline:'none'}}>
              {courseOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
            </select>
          </div>
        </div>
        <Input label="Notes" value={form.notes} onChange={v => setForm({...form, notes:v})} placeholder="Optional notes about this upload" rows={3}/>
        <div style={{marginBottom:18}}>
          <label style={{display:'block', fontSize:12, color:C.sub, marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Upload File (PDF, PPT, PPTX, DOCX, XLSX)</label>
          <input type="file" onChange={e => onPickFile(e.target.files?.[0])} style={{width:'100%', color:C.text, fontSize:13}}/>
        </div>
        {form.fileName && <div style={{fontSize:12, color:C.muted, marginBottom:18}}>Selected: {form.fileName}</div>}
        <div style={{display:'flex', gap:12, justifyContent:'flex-end'}}>
          <Btn onClick={() => {setModal(false); resetForm();}} variant="ghost">Cancel</Btn>
          <Btn onClick={add} icon={Plus}>Add Resource</Btn>
        </div>
      </Modal>
      <Modal open={!!viewer} onClose={() => setViewer(null)} title={viewer?.title || 'Preview'} width={900}>
        {viewer && (
          <div style={{display:'flex', flexDirection:'column', gap:16}}>
            <div style={{display:'flex', justifyContent:'space-between', gap:16, flexWrap:'wrap'}}>
              <div>
                <div style={{fontSize:16, fontWeight:700, color:C.text, marginBottom:6, fontFamily:FONT_SERIF}}>{viewer.title}</div>
                <div style={{fontSize:13, color:C.sub}}>{viewer.category} {'\u2022'} {viewer.course}</div>
              </div>
              <div style={{display:'flex', gap:12}}><Btn onClick={() => window.open(viewer.fileUrl || '#', '_blank')} variant="secondary" size="sm">Open File</Btn></div>
            </div>
            {viewer.fileType === 'pdf' && viewer.fileUrl ? (
              <iframe title={viewer.title} src={viewer.fileUrl} style={{width:'100%', height:'70vh', border:`1px solid ${C.border}`, borderRadius:12, background:'#fff'}}/>
            ) : (
              <div style={{padding:20, border:`1px solid ${C.border}`, borderRadius:12, background:C.surface, color:C.sub, fontSize:14, lineHeight:1.7}}>
                <div style={{marginBottom:10}}>Preview is not available inside the browser for this file type.</div>
                <div>Use <strong style={{color:C.text}}>Open File</strong> to view or download the uploaded document.</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function CLOPLOMapper({courses, setCourses}) {
  const [sel, setSel] = useState(courses[0]?.id || null);
  const course = courses.find(c => c.id === sel);

  const PLOS = [
    {id:'PO1', desc:'Apply knowledge of mathematics, natural science, computing, engineering fundamentals and an engineering specialization as specified in WK1 to WK4 respectively to develop solutions of complex engineering problems.'},
    {id:'PO2', desc:'Identify, formulate, research literature and analyze complex engineering problems reaching substantiated conclusions using first principles of mathematics, natural sciences and engineering sciences with holistic considerations for sustainable development (WK 1 to WK4).'},
    {id:'PO3', desc:'Design creative solutions for complex engineering problems and design systems, components or processes to meet identified needs with appropriate consideration for public health and safety, whole-life cost, net zero carbon as well as resource, cultural, societal, and environmental considerations as required (WK5).'},
    {id:'PO4', desc:'Conduct investigations of complex engineering problems using research methods including research-based knowledge, design of experiments, analysis and interpretation of data, and synthesis of information to provide valid conclusions (WK8).'},
    {id:'PO5', desc:'Create, select and apply and recognize limitations of appropriate techniques, resources, and modern engineering and IT tools, including prediction and modeling, to complex engineering problems (WK2, WK6).'},
    {id:'PO6', desc:'When solving complex engineering problems, analyze and evaluate sustainable development impacts to: society, the economy, sustainability, health and safety, legal frameworks, and the environment (WK1, WK5, and WK7).'},
    {id:'PO7', desc:'Apply ethical principles and commit to professional ethics and norms of engineering practice and adhere to relevant national and international laws. Demonstrate an understanding of the need for diversity and inclusion (WK9).'},
    {id:'PO8', desc:'Function effectively as an individual, and as a member or leader in diverse and inclusive teams and in multi-disciplinary, face-to-face, remote and distributed settings (WK9).'},
    {id:'PO9', desc:'Communicate effectively and inclusively on complex engineering activities with the engineering community and with society at large, such as being able to comprehend and write effective reports and design documentation, make effective presentations, taking into account cultural, language, and learning differences.'},
    {id:'PO10', desc:"Apply knowledge and understanding of engineering management principles and economic decision-making and apply these to one's own work, as a member and leader in a team and to manage projects and in multidisciplinary environments."},
    {id:'PO11', desc:'Recognize the need for, and have the preparation and ability for i) independent and life-long learning ii) adaptability to new and emerging technologies and iii) critical thinking in the broadest context of technological change (WK8).'},
    {id:'PO12', desc:'Demonstrate knowledge and understanding of the competences necessary to transform opportunities and ideas into a new business.'},
  ];

  const [pdfFile, setPdfFile] = useState(null);
  const [extractedCLOs, setExtractedCLOs] = useState([]);
  const [cloMappings, setCloMappings] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('');
  const [error, setError] = useState('');
  const [mappingDone, setMappingDone] = useState(false);

  // Restore saved mapping when course selection changes
  useEffect(() => {
    const c = courses.find(x => x.id === sel);
    if (c && Array.isArray(c.extractedCLOObjects) && c.extractedCLOObjects.length > 0 && c.mapping && Object.keys(c.mapping).length > 0) {
      setExtractedCLOs(c.extractedCLOObjects);
      setCloMappings(c.mapping);
      setMappingDone(true);
    } else {
      setExtractedCLOs([]);
      setCloMappings({});
      setMappingDone(false);
    }
    setPdfFile(null);
    setError('');
    setStep('');
  }, [sel]);

  async function extractPdfText(file) {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({data: buf}).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n';
    }
    return text.trim();
  }

  async function handlePdfUpload(file) {
    if (!file) return;
    setError(''); setPdfFile(file); setExtractedCLOs([]); setCloMappings({}); setMappingDone(false);
    setLoading(true); setStep('Extracting text from PDF...');
    try {
      const text = await extractPdfText(file);
      if (!text || text.length < 20) throw new Error('Could not extract enough text from this PDF. Ensure the file contains selectable text (not a scanned image).');
      setStep('Analyzing CLOs with AI...');
      const cloPrompt = `You are an expert in academic curriculum design. The following text was extracted from a PDF document that contains Course Learning Outcomes (CLOs). Extract ALL the CLOs from this text. Return ONLY a valid JSON array of objects. Each object must have: "id" (like "CLO1", "CLO2", etc.) and "description" (the full CLO text). Example format: [{"id":"CLO1","description":"..."},{"id":"CLO2","description":"..."}]. Do NOT include any other text, explanation or markdown formatting. Just the JSON array.\n\nExtracted PDF text:\n${text.substring(0,6000)}`;
      const cloResult = await ai(cloPrompt, 'You extract CLOs from academic documents. Return ONLY valid JSON arrays, no markdown, no explanation.');
      let clos = [];
      try {
        const cleaned = cloResult.replace(/```json\s*/gi,'').replace(/```\s*/g,'').trim();
        clos = JSON.parse(cleaned);
      } catch { throw new Error('AI could not parse CLOs from this document. The PDF may not contain clearly defined CLOs.'); }
      if (!Array.isArray(clos) || clos.length === 0) throw new Error('No CLOs found in the document.');
      setExtractedCLOs(clos);
      setStep('Mapping CLOs to PLOs...');
      const ploList = PLOS.map(p => `${p.id}: ${p.desc}`).join('\n');
      const mapPrompt = `You are an expert in OBE (Outcome-Based Education) curriculum alignment. Map each CLO to exactly one PLO using a STRICT ONE-TO-ONE rule:\n- Each CLO maps to exactly ONE PLO.\n- Each PLO can be used by AT MOST ONE CLO. No two CLOs may share the same PLO.\n- If there are more CLOs than PLOs, leave extra CLOs unmapped (set value to null).\n- Spread CLOs across different PLOs. Never assign the same PLO to multiple CLOs.\n\nReturn ONLY a valid JSON object where keys are CLO ids and values are single PLO ids (e.g. {"CLO1":"PO3","CLO2":"PO1","CLO3":"PO7"}). Every PLO value MUST be unique.\n\nCLOs:\n${clos.map(c => `${c.id}: ${c.description}`).join('\n')}\n\nPLOs:\n${ploList}\n\nReturn ONLY the JSON object. Each PLO must appear at most once across all values.`;
      const mapResult = await ai(mapPrompt, 'You are a curriculum mapping expert. Return ONLY valid JSON. CRITICAL RULE: Each PLO id must appear AT MOST ONCE across all values. No two CLOs can share the same PLO.');
      let mappings = {};
      try {
        const cleaned = mapResult.replace(/```json\s*/gi,'').replace(/```\s*/g,'').trim();
        mappings = JSON.parse(cleaned);
      } catch { throw new Error('AI could not generate the mapping. Please try again.'); }
      const usedPLOs = new Set();
      const dedupedMappings = {};
      for (const cloId of Object.keys(mappings)) {
        const ploId = mappings[cloId];
        if (ploId && !usedPLOs.has(ploId)) { usedPLOs.add(ploId); dedupedMappings[cloId] = ploId; }
      }
      setCloMappings(dedupedMappings);
      if (sel && setCourses) {
        const cloStrings = clos.map(c => `${c.id}: ${c.description}`);
        setCourses(courses.map(c => c.id === sel ? {...c, clos: cloStrings, mapping: dedupedMappings, extractedCLOObjects: clos, cloDocument: file.name} : c));
      }
      setMappingDone(true); setStep('');
    } catch (err) {
      setError(err.message || 'An error occurred during processing.');
    } finally { setLoading(false); setStep(''); }
  }

  const mappedPLOIds = new Set(Object.values(cloMappings));

  return (
    <div>
      {/* Course selector */}
      <div style={{marginBottom:20, display:'flex', alignItems:'center', gap:16, flexWrap:'wrap'}}>
        <select value={sel} onChange={e => setSel(+e.target.value)} style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'12px 16px', color:C.text, fontSize:14, fontFamily:FONT_SANS, cursor:'pointer', outline:'none'}}>
          {courses.map(c => <option key={c.id} value={c.id}>{c.code}: {c.name}</option>)}
        </select>
      </div>

      {/* PDF Upload */}
      <Card style={{marginBottom:20, border:`1px dashed ${C.accent}44`, background:`${C.accent}08`}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:14}}>
          <div style={{background:`${C.accent}22`, borderRadius:8, padding:8, display:'flex'}}><Upload size={18} color={C.accent}/></div>
          <div>
            <h3 style={{fontSize:14, fontWeight:700, color:C.text}}>Upload CLO Document (PDF)</h3>
            <p style={{fontSize:11, color:C.muted, marginTop:2}}>Upload a PDF containing Course Learning Outcomes. AI will extract CLOs and auto-map each to the most relevant PLO.</p>
          </div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
          <label style={{display:'inline-flex', alignItems:'center', gap:8, padding:'10px 18px', background:C.accent, color:'#000', borderRadius:8, fontWeight:600, fontSize:13, cursor:loading?'not-allowed':'pointer', opacity:loading?0.5:1}}>
            <Upload size={14}/>{loading ? 'Processing...' : 'Choose PDF File'}
            <input type="file" accept=".pdf,application/pdf" onChange={e => handlePdfUpload(e.target.files?.[0])} style={{display:'none'}} disabled={loading}/>
          </label>
          {pdfFile && <span style={{fontSize:12, color:C.sub}}>{pdfFile.name}</span>}
          {course?.cloDocument && !pdfFile && <span style={{fontSize:12, color:C.green, display:'flex', alignItems:'center', gap:6}}><CheckCircle size={13} color={C.green}/> Saved: {course.cloDocument}</span>}
          {loading && <span style={{fontSize:12, color:C.accent, display:'flex', alignItems:'center', gap:6}}><Loader size={13} color={C.accent}/>{step}</span>}
        </div>
        {error && <div style={{marginTop:12, background:`${C.red}18`, border:`1px solid ${C.red}44`, borderRadius:8, padding:'10px 14px', color:C.red, fontSize:12}}>{error}</div>}
      </Card>

      {/* CLO list + PO list */}
      {extractedCLOs.length > 0 && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:24}}>
          <Card>
            <h3 style={{fontSize:16, fontWeight:600, color:C.text, marginBottom:8, fontFamily:FONT_SERIF}}>Course Learning Outcomes (CLOs)</h3>
            <p style={{fontSize:12, color:C.muted, marginBottom:14}}>{extractedCLOs.length} CLOs{course?.cloDocument ? ` from "${course.cloDocument}"` : ''}</p>
            <div style={{maxHeight:420, overflowY:'auto'}}>
              {extractedCLOs.map((clo, i) => (
                <div key={i} style={{padding:'10px 12px', background:C.surface, borderRadius:8, marginBottom:8, fontSize:13, color:C.text, border:`1px solid ${C.border}`, borderLeft:`4px solid ${C.accent}`}}>
                  <span style={{color:C.accent, fontWeight:700}}>{clo.id}</span> {'\u2014'} {clo.description}
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 style={{fontSize:16, fontWeight:600, color:C.text, marginBottom:8, fontFamily:FONT_SERIF}}>Program Outcomes (PO1{'\u2013'}PO12)</h3>
            <p style={{fontSize:12, color:C.muted, marginBottom:14}}>Green = mapped by a CLO</p>
            <div style={{maxHeight:420, overflowY:'auto'}}>
              {PLOS.map(plo => {
                const mapped = mappedPLOIds.has(plo.id);
                return (
                  <div key={plo.id} style={{padding:'10px 12px', background:mapped?`${C.green}15`:C.surface, borderRadius:8, marginBottom:8, fontSize:12, color:mapped?C.text:C.muted, border:`1px solid ${mapped?C.green+'44':C.border}`, display:'flex', gap:8, alignItems:'flex-start'}}>
                    <span style={{fontWeight:700, color:mapped?C.green:C.muted, flexShrink:0}}>{plo.id}</span>
                    <span style={{lineHeight:1.4}}>{plo.desc.length > 120 ? plo.desc.substring(0,120)+'...' : plo.desc}</span>
                    {mapped && <CheckCircle size={13} color={C.green} style={{flexShrink:0, marginTop:2}}/>}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Mapping Matrix */}
      {mappingDone && (
        <Card style={{marginBottom:24}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16}}>
            <h3 style={{fontSize:16, fontWeight:600, color:C.text, fontFamily:FONT_SERIF}}>CLO {'\u2192'} PLO Mapping Matrix</h3>
            <Tag label={`${extractedCLOs.length} CLOs \u00d7 ${PLOS.length} POs`} color={C.accent}/>
          </div>
          <div style={{overflowX:'auto'}}>
            <table style={{borderCollapse:'collapse', fontSize:12, width:'100%'}}>
              <thead>
                <tr>
                  <th style={{padding:'10px 14px', textAlign:'left', color:C.muted, borderBottom:`2px solid ${C.border}`, minWidth:90, position:'sticky', left:0, background:C.card, zIndex:1, fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em'}}>CLO</th>
                  {PLOS.map(p => <th key={p.id} style={{padding:'10px 6px', color:C.muted, borderBottom:`2px solid ${C.border}`, textAlign:'center', whiteSpace:'nowrap', fontSize:10, textTransform:'uppercase'}}>{p.id}</th>)}
                </tr>
              </thead>
              <tbody>
                {extractedCLOs.map((clo, ci) => (
                  <tr key={ci} style={{borderBottom:`1px solid ${C.border}`, background:ci%2===0?C.card:C.surface}}>
                    <td style={{padding:'10px 14px', color:C.text, fontWeight:600, position:'sticky', left:0, background:ci%2===0?C.card:C.surface, zIndex:1, whiteSpace:'nowrap'}} title={clo.description}>{clo.id}</td>
                    {PLOS.map(p => {
                      const mapped = cloMappings[clo.id] === p.id;
                      return (
                        <td key={p.id} style={{textAlign:'center', padding:'10px 6px'}}>
                          {mapped
                            ? <div style={{width:22, height:22, background:C.green, borderRadius:5, display:'inline-flex', alignItems:'center', justifyContent:'center'}}><CheckCircle size={13} color="#fff"/></div>
                            : <div style={{width:22, height:22, background:C.border, borderRadius:5, display:'inline-block', opacity:0.25}}/>
                          }
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Detailed mapping cards */}
      {mappingDone && (
        <Card>
          <h3 style={{fontSize:16, fontWeight:600, color:C.text, marginBottom:16, fontFamily:FONT_SERIF}}>Detailed CLO {'\u2192'} PLO Mapping</h3>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
            {extractedCLOs.map(clo => {
              const poId = cloMappings[clo.id];
              const po = PLOS.find(p => p.id === poId);
              return (
                <div key={clo.id} style={{padding:16, background:C.surface, borderRadius:10, border:`1px solid ${C.border}`}}>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
                    <Tag label={clo.id} color={C.accent}/>
                    <ChevronRight size={12} color={C.muted}/>
                    <Tag label={poId || 'N/A'} color={poId ? C.green : C.red}/>
                  </div>
                  <div style={{fontSize:12, color:C.sub, lineHeight:1.5, marginBottom:8}}><strong style={{color:C.text}}>CLO:</strong> {clo.description}</div>
                  {po && <div style={{fontSize:12, color:C.muted, lineHeight:1.5}}><strong style={{color:C.sub}}>PLO:</strong> {po.desc.length > 160 ? po.desc.substring(0,160)+'...' : po.desc}</div>}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Fallback: course has CLOs but no extractedCLOObjects */}
      {!mappingDone && extractedCLOs.length === 0 && course && (course.clos || []).length > 0 && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:24}}>
          <Card>
            <h3 style={{fontSize:16, fontWeight:600, color:C.text, marginBottom:16, fontFamily:FONT_SERIF}}>Course Learning Outcomes (CLOs)</h3>
            {(course.clos || []).map((clo, i) => {
              const cloText = typeof clo === 'string' ? clo.replace(/^CLO\d+:\s*/, '') : (clo.description || String(clo));
              return <div key={i} style={{padding:'12px 14px', background:C.surface, borderRadius:8, marginBottom:10, fontSize:13, color:C.text, border:`1px solid ${C.border}`, borderLeft:`4px solid ${C.accent}`}}><span style={{color:C.accent, fontWeight:700}}>CLO{i+1}</span> {'\u2014'} {cloText}</div>;
            })}
          </Card>
          <Card>
            <h3 style={{fontSize:16, fontWeight:600, color:C.text, marginBottom:16, fontFamily:FONT_SERIF}}>Program Outcomes (PO1{'\u2013'}PO12)</h3>
            {PLOS.map(plo => (
              <div key={plo.id} style={{padding:'12px 14px', background:C.surface, borderRadius:8, marginBottom:10, fontSize:12, color:C.muted, border:`1px solid ${C.border}`, display:'flex', gap:10, alignItems:'flex-start'}}>
                <span style={{fontWeight:700, flexShrink:0}}>{plo.id}</span>
                <span style={{lineHeight:1.5}}>{plo.desc.length > 120 ? plo.desc.substring(0,120)+'...' : plo.desc}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* Empty state */}
      {!mappingDone && extractedCLOs.length === 0 && course && (course.clos || []).length === 0 && (
        <div style={{padding:32, background:C.surface, borderRadius:12, border:`1px dashed ${C.border}`, textAlign:'center'}}>
          <p style={{fontSize:14, color:C.muted, marginBottom:8}}>No CLOs uploaded yet</p>
          <p style={{fontSize:13, color:C.muted}}>Upload a CLO PDF above to automatically extract and map CLOs to PLOs.</p>
        </div>
      )}
    </div>
  );
}

function SyllabusManager({courses, setCourses}) {
  const [sel, setSel] = useState(courses[0]?.id || null);
  const [editing, setEditing] = useState(false);
  const course = courses.find(c => c.id === sel);
  const [form, setForm] = useState({});
  function startEdit() { setForm({...course}); setEditing(true); }
  function save() { setCourses(courses.map(c => c.id === sel ? {...c, ...form} : c)); setEditing(false); }
  const courseClos = course?.clos || [];
  return (
    <div>
      <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:24}}>
        <select value={sel} onChange={e => setSel(+e.target.value)} style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'12px 16px', color:C.text, fontSize:14, fontFamily:FONT_SANS, cursor:'pointer', outline:'none'}}>
          {courses.map(c => <option key={c.id} value={c.id}>{c.code}: {c.name}</option>)}
        </select>
        {!editing && <Btn onClick={startEdit} icon={Edit3} variant="secondary" size="sm">Edit Syllabus</Btn>}
        {editing && <><Btn onClick={save} icon={Save} size="sm">Save Changes</Btn><Btn onClick={() => setEditing(false)} variant="ghost" size="sm">Cancel</Btn></>}
      </div>
      {course && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
          <Card>
            <h4 style={{fontSize:15, fontWeight:600, color:C.accent, marginBottom:16, fontFamily:FONT_SERIF}}>Course Information</h4>
            {editing ? (
              <>
                <Input label="Course Code" value={form.code} onChange={v => setForm({...form, code:v})}/>
                <Input label="Course Name" value={form.name} onChange={v => setForm({...form, name:v})}/>
                <Input label="Credits" value={form.credits} onChange={v => setForm({...form, credits:v})} type="number"/>
                <Input label="Semester" value={form.semester} onChange={v => setForm({...form, semester:v})}/>
              </>
            ) : (
              <div style={{fontSize:13, color:C.sub, display:'flex', flexDirection:'column', gap:10}}>
                <div><span style={{color:C.muted}}>Code: </span><strong style={{color:C.text}}>{course.code}</strong></div>
                <div><span style={{color:C.muted}}>Name: </span><strong style={{color:C.text}}>{course.name}</strong></div>
                <div><span style={{color:C.muted}}>Credits: </span><strong style={{color:C.text}}>{course.credits} credit hours</strong></div>
                <div><span style={{color:C.muted}}>Semester: </span><strong style={{color:C.text}}>{course.semester}</strong></div>
                <div><span style={{color:C.muted}}>Students: </span><strong style={{color:C.text}}>{course.students}</strong></div>
              </div>
            )}
          </Card>
          <Card>
            <h4 style={{fontSize:15, fontWeight:600, color:C.accent, marginBottom:16, fontFamily:FONT_SERIF}}>Course Learning Outcomes</h4>
            {courseClos.length > 0 ? courseClos.map((clo, i) => {
              const cloText = typeof clo === 'string' ? clo : `${clo.id}: ${clo.description}`;
              return <div key={i} style={{padding:'10px 12px', background:C.surface, borderRadius:6, marginBottom:8, fontSize:13, color:C.sub, border:`1px solid ${C.border}`, borderLeft:`4px solid ${C.accent}`}}>{cloText}</div>;
            }) : (
              <div style={{padding:20, background:C.surface, borderRadius:8, border:`1px dashed ${C.border}`, textAlign:'center'}}>
                <p style={{fontSize:13, color:C.muted, marginBottom:6}}>No CLOs uploaded yet</p>
              </div>
            )}
          </Card>
          <Card style={{gridColumn:'span 2'}}>
            <AIBox title="AI-Assisted Syllabus Update Suggestions" placeholder="Describe your course and ask for syllabus update suggestions based on latest industry trends..." buildPrompt={inp => `As a curriculum expert, provide suggestions to update and improve this course syllabus: ${inp}. Include: 1) Outdated content to replace, 2) New topics to add reflecting industry trends, 3) Suggested CLO improvements, 4) Recommended learning activities, 5) Modern assessment methods. Be specific and practical.`} resultLabel="Syllabus Improvement Suggestions"/>
          </Card>
        </div>
      )}
    </div>
  );
}

function GapAnalyzer() {
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
      <AIBox title="CLO-PLO Gap Analysis" placeholder="Paste your CLOs and PLOs mapping to analyze coverage gaps..." buildPrompt={inp => `Perform a comprehensive CLO-PLO alignment gap analysis for: ${inp}. Identify: 1) PLOs with insufficient CLO coverage, 2) CLOs not aligned to any PLO, 3) Over-emphasized areas, 4) Missing competency areas, 5) Specific recommendations to close gaps. Use a structured format with tables where helpful.`} resultLabel="Gap Analysis Report"/>
      <AIBox title="Curriculum Benchmarking" placeholder="Describe your curriculum or course. Specify field, level, and what you want to benchmark against..." buildPrompt={inp => `Benchmark this curriculum against international standards and best practices: ${inp}. Compare with: 1) Top global university curricula in this field, 2) Industry certification requirements, 3) Accreditation body standards (e.g., ABET, ACM, BAET), 4) Emerging skill requirements. Provide specific recommendations for improvement.`} resultLabel="Benchmarking Report"/>
      <AIBox title="Accreditation Readiness Check" placeholder="Describe your program's current state and target accreditation (e.g., ABET, BAET, NBA)..." buildPrompt={inp => `Assess accreditation readiness for: ${inp}. Evaluate: 1) Documentation completeness, 2) PLO assessment strategies, 3) Continuous improvement processes, 4) Industry engagement evidence, 5) Faculty qualifications alignment. Identify gaps and suggest remediation steps for each criterion.`} resultLabel="Accreditation Assessment"/>
      <AIBox title="Version History & Change Documentation" placeholder="Describe curriculum changes made and the rationale for documentation..." buildPrompt={inp => `Generate a formal curriculum change documentation record for: ${inp}. Format as: 1) Summary of Changes, 2) Rationale for each change, 3) Impact Assessment, 4) Stakeholder Approval status, 5) Implementation timeline, 6) Compliance notes. Make it suitable for official university records.`} resultLabel="Change Documentation"/>
    </div>
  );
}

function TrendAnalyzer() {
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
      <AIBox title="Emerging Technology Trends" placeholder="Enter your field/discipline to analyze emerging tech trends relevant to curriculum..." buildPrompt={inp => `Analyze the top emerging technology trends relevant to ${inp} that should be incorporated into university curriculum by 2025-2026. Cover: 1) Key technologies gaining industry traction, 2) Specific skills in demand, 3) Suggested new course topics or modules, 4) Industry partnerships to seek, 5) Learning resources and labs needed.`} resultLabel="Technology Trend Report"/>
      <AIBox title="Industry Skill Gap Analysis" placeholder="Enter job roles or industry sector to analyze skill gaps in graduates..." buildPrompt={inp => `Analyze the skill gap between typical university graduates and industry requirements for ${inp}. Based on current hiring trends: 1) Top 10 most demanded skills, 2) Skills typically missing from graduates, 3) Soft skills gap, 4) Recommended curriculum additions, 5) Suggested project/internship formats to bridge gaps.`} resultLabel="Skill Gap Report"/>
      <AIBox title="Research Trend Integration" placeholder="Enter your research field or department to integrate research trends into teaching..." buildPrompt={inp => `Identify how current research trends in ${inp} can be integrated into undergraduate/graduate teaching. Suggest: 1) Research-informed topics for curriculum, 2) Student research project ideas, 3) Industry-academia collaboration opportunities, 4) Lab or simulation requirements, 5) Guest lecture topics from industry researchers.`} resultLabel="Research Integration Plan"/>
      <AIBox title="Global Curriculum Comparison" placeholder="Enter your program type and region to compare with global standards..." buildPrompt={inp => `Compare ${inp} curriculum with global best practices from MIT, Stanford, IIT, and other top universities. Analyze: 1) Core differences in course structure, 2) Unique elective offerings abroad, 3) Capstone/project requirements comparison, 4) Assessment method differences, 5) Specific improvements to adopt for global competitiveness.`} resultLabel="Global Comparison Report"/>
    </div>
  );
}

// ===================== MATERIALS MODULE =====================
function MaterialsModule({materials, setMaterials}) {
  const [tab, setTab] = useState('notes');
  const tabs = [
    {id:'notes', icon:PenTool, label:'Notes Generator'},
    {id:'slides', icon:LayoutDashboard, label:'Slide Deck Generator'},
    {id:'faq', icon:MessageCircle, label:'FAQ Generator'},
    {id:'library', icon:Archive, label:'Resource Library'},
    {id:'reading', icon:BookMarked, label:'Reading Lists'}
  ];
  return (
    <div className="fade-in">
      <SectionHead title="Teaching Materials & Resources" sub="Create, organize, and manage all teaching resources."/>
      <TabBar tabs={tabs} active={tab} setActive={setTab}/>
      {tab === 'notes' && <NotesGen/>}
      {tab === 'slides' && <SlidesGen/>}
      {tab === 'faq' && <FAQGen/>}
      {tab === 'library' && <ResourceLib materials={materials} setMaterials={setMaterials}/>}
      {tab === 'reading' && <ReadingLists/>}
    </div>
  );
}

function NotesGen() {
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
      <AIBox title="Lecture Notes Generator" placeholder="Enter lecture topic, week number, and key concepts to cover..." buildPrompt={inp => `Create comprehensive university-level lecture notes for: ${inp}. Structure as: 1) Learning Objectives (3-5 points), 2) Introduction & Background, 3) Main Content (with subheadings, examples, diagrams description), 4) Key Concepts Summary box, 5) Real-world applications, 6) Discussion Questions, 7) References & Further Reading. Use clear academic language.`} resultLabel="Generated Lecture Notes"/>
      <AIBox title="Lab Manual / Practical Guide" placeholder="Enter lab topic, required tools, and experiment objectives..." buildPrompt={inp => `Create a detailed lab manual for: ${inp}. Include: 1) Lab Title & Objectives, 2) Background Theory, 3) Required Materials/Tools/Software, 4) Safety Precautions, 5) Step-by-Step Procedure, 6) Expected Results, 7) Data Recording Tables, 8) Analysis Questions, 9) Report Submission Guidelines. Format for student use.`} resultLabel="Lab Manual"/>
      <AIBox title="Summary & Cheat Sheet" placeholder="Enter topic or chapter name to create a concise summary/cheat sheet..." buildPrompt={inp => `Create a comprehensive but concise cheat sheet/quick reference guide for: ${inp}. Include: key formulas, important definitions, core concepts in bullet points, common mistakes to avoid, mnemonic devices if applicable, and quick examples. Format for easy printing on one page.`} resultLabel="Summary Cheat Sheet"/>
      <AIBox title="Course Handout Creator" placeholder="Describe the topic and type of handout needed (e.g., problem set, worksheet)..." buildPrompt={inp => `Create a well-structured course handout for: ${inp}. Include: 1) Topic overview, 2) Key terms glossary, 3) Worked examples with step-by-step solutions, 4) Practice problems (easy to hard), 5) Extension challenges, 6) Tips and common pitfalls. Make it print-ready and student-friendly.`} resultLabel="Course Handout"/>
    </div>
  );
}

function SlidesGen() {
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
      <AIBox title="Slide Deck Outline" placeholder="Enter topic and number of slides..." buildPrompt={inp => `Create a comprehensive slide deck outline for a university lecture on: ${inp}. For each slide, provide: 1) Slide Title, 2) Bullet points (3-4 per slide), 3) Speaker notes / key talking points, 4) Suggested visual/diagram. Format clearly.`} resultLabel="Slide Outline"/>
      <AIBox title="Interactive Lecture Activities" placeholder="Enter topic to generate in-class activities..." buildPrompt={inp => `Design 3 interactive in-class activities or discussion prompts for a university lecture on: ${inp}. Include: 1) Activity Name, 2) Time required, 3) Instructions for students, 4) Learning objective addressed, 5) Debriefing questions.`} resultLabel="Lecture Activities"/>
      <AIBox title="Multimedia Resource Finder" placeholder="Enter topic to find videos, simulations, etc...." buildPrompt={inp => `Suggest high-quality multimedia resources for teaching: ${inp}. Include: 1) YouTube video recommendations (with search terms), 2) Interactive simulations (e.g., PhET, GitHub), 3) Podcast episodes, 4) Virtual lab ideas. Provide descriptions of why they are useful.`} resultLabel="Multimedia Resources"/>
      <AIBox title="Icebreaker & Hook Generator" placeholder="Enter topic to generate engaging lecture hooks..." buildPrompt={inp => `Generate 5 engaging "hooks" or icebreakers to start a university lecture on: ${inp}. These should grab attention, relate to real-world scenarios, or pose a thought-provoking question. Provide the hook and a brief explanation of how to transition into the main lecture.`} resultLabel="Lecture Hooks"/>
    </div>
  );
}

function FAQGen() {
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
      <AIBox title="Course FAQ Generator" placeholder="Describe your course and common student concerns or struggles..." buildPrompt={inp => `Generate a comprehensive FAQ document for a university course about: ${inp}. Create 15 realistic questions students commonly ask, organized by category: Assessment & Grading, Course Content, Submission & Deadlines, Resources & Support, and Course Policies. Provide clear, helpful answers for each.`} resultLabel="Generated FAQ"/>
      <AIBox title="Assignment FAQ" placeholder="Describe the assignment details and common student confusion points..." buildPrompt={inp => `Generate a targeted FAQ for this specific assignment: ${inp}. Include 10 specific questions students typically ask about: task requirements, format & length, submission process, citation style, allowed resources, grading breakdown, and clarification on ambiguous parts. Provide precise, helpful answers.`} resultLabel="Assignment FAQ"/>
      <AIBox title="Chatbot Script Generator" placeholder="Enter course name and main topics for automated student query responses..." buildPrompt={inp => `Create a chatbot response script for a university course on: ${inp}. Generate 20 Q&A pairs for automated student support covering: registration, prerequisites, office hours, exam dates, grading policy, late submission policy, academic integrity, and technical support. Format as Q: / A: pairs for easy implementation.`} resultLabel="Chatbot Script"/>
      <AIBox title="Semester Start FAQ Pack" placeholder="Enter course name, key policies, and semester dates for a complete FAQ pack..." buildPrompt={inp => `Create a comprehensive First Week FAQ pack for: ${inp}. Cover everything a student needs at semester start: 1) How to access course materials, 2) Communication channels, 3) Assessment schedule overview, 4) Group work policy, 5) Lab/Tutorial schedule, 6) Academic support resources, 7) Important deadlines calendar. Make it welcoming and informative.`} resultLabel="Semester FAQ Pack"/>
    </div>
  );
}

function ResourceLib({materials, setMaterials}) {
  const [modal, setModal] = useState(false);
  const [viewer, setViewer] = useState(null);
  const [form, setForm] = useState({title:'', course:'', type:'Lecture Notes', date:'', notes:'', file:null, fileName:'', fileUrl:'', fileType:'', storagePath:'', storageProvider:'local'});
  const types = ['Lecture Slides','Lecture Notes','Reading List','Lab Manual','Assignment Brief','PDF Resource','PPT Resource','PPTX Resource','External Resource'];
  const typeColor = {'Lecture Slides':C.blue, 'Lecture Notes':C.green, 'Reading List':C.purple, 'Lab Manual':C.cyan, 'Assignment Brief':C.accent, 'PDF Resource':C.green, 'PPT Resource':C.blue, 'PPTX Resource':C.blue, 'External Resource':C.muted};
  async function onPickFile(file) {
    if (!file) return;
    try {
      const uploaded = await uploadManagedFile(file, 'curriculum');
      setForm(prev => ({...prev, file, fileName:file.name, fileUrl:uploaded.fileUrl, fileType:fileKind(file), storagePath:uploaded.storagePath, storageProvider:uploaded.storageProvider}));
    } catch(e) {
      setForm(prev => ({...prev, file, fileName:file.name, fileType:fileKind(file)}));
    }
  }
  function resetForm() {
    setForm({title:'', course:'', type:'Lecture Notes', date:'', notes:'', file:null, fileName:'', fileUrl:'', fileType:'', storagePath:'', storageProvider:'local'});
  }
  function add() {
    const item = {
      ...form,
      id:Date.now(),
      size:form.file ? prettySize(form.file.size) : 'N/A',
      date:form.date || new Date().toISOString().split('T')[0]
    };
    setMaterials([...materials, item]);
    setModal(false);
    resetForm();
  }
  function del(id) {
    setMaterials(materials.filter(m => m.id !== id));
    setViewer(prev => prev?.id === id ? null : prev);
  }
  function open(item) { setViewer(item); }
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginBottom:20}}>
        <div style={{color:C.sub, fontSize:13, maxWidth:680}}>Upload lecture slides, PDFs, notes, and other teaching resources. Click a card to preview a PDF or open the uploaded file.</div>
        <Btn onClick={() => setModal(true)} icon={Plus}>Add Resource</Btn>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16}}>
        {materials.map(m => (
          <Card key={m.id} style={{padding:18}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:12}}>
              <Tag label={m.type} color={typeColor[m.type] || C.muted}/>
              <div style={{display:'flex', gap:10}}>
                <button onClick={() => open(m)} title="View" style={{background:'none', border:'none', color:C.accent, cursor:'pointer'}}><Eye size={14}/></button>
                <button onClick={() => m.fileUrl ? window.open(m.fileUrl, '_blank') : null} title="Open" disabled={!m.fileUrl} style={{background:'none', border:'none', color:m.fileUrl ? C.green : C.muted, cursor:m.fileUrl ? 'pointer' : 'not-allowed'}}><ChevronRight size={14}/></button>
                <button onClick={() => del(m.id)} title="Delete" style={{background:'none', border:'none', color:C.red, cursor:'pointer'}}><Trash2 size={14}/></button>
              </div>
            </div>
            <h4 style={{fontSize:14, fontWeight:600, color:C.text, marginBottom:8, lineHeight:1.4}}>{m.title}</h4>
            <div style={{fontSize:12, color:C.muted}}>Course: {m.course || 'N/A'}</div>
            <div style={{fontSize:12, color:C.muted, marginTop:4}}>File: {m.fileName || 'No file uploaded'}</div>
            <div style={{fontSize:12, color:C.muted, marginTop:4}}>Type: {String(m.fileType || 'unknown').toUpperCase()}</div>
            <div style={{fontSize:12, color:C.muted, marginTop:4}}>Added: {m.date} {'\u2022'} {m.size}</div>
            {m.notes && <div style={{fontSize:12, color:C.sub, marginTop:10, lineHeight:1.5}}>{m.notes}</div>}
          </Card>
        ))}
      </div>
      <Modal open={modal} onClose={() => {setModal(false); resetForm();}} title="Add Teaching Resource" width={560}>
        <Input label="Resource Title" value={form.title} onChange={v => setForm({...form, title:v})} placeholder="e.g. Week 3 - Neural Networks Slides"/>
        <Input label="Course Code / Name" value={form.course} onChange={v => setForm({...form, course:v})} placeholder="e.g. CSE401"/>
        <div style={{marginBottom:18}}>
          <label style={{display:'block', fontSize:12, color:C.sub, marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Resource Type</label>
          <select value={form.type} onChange={e => setForm({...form, type:e.target.value})} style={{width:'100%', background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'12px 14px', color:C.text, fontSize:14, fontFamily:FONT_SANS, outline:'none'}}>
            {types.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <Input label="Date" value={form.date} onChange={v => setForm({...form, date:v})} type="date"/>
        <Input label="Notes" value={form.notes} onChange={v => setForm({...form, notes:v})} placeholder="Optional description for the resource" rows={3}/>
        <div style={{marginBottom:18}}>
          <label style={{display:'block', fontSize:12, color:C.sub, marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Upload File (PDF / PPT / PPTX)</label>
          <input type="file" accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" onChange={e => onPickFile(e.target.files?.[0])} style={{width:'100%', color:C.text, fontSize:13}}/>
        </div>
        {form.fileName && <div style={{fontSize:12, color:C.muted, marginBottom:18}}>Selected: {form.fileName} {'\u2022'} {String(form.fileType || 'unknown').toUpperCase()}</div>}
        <div style={{display:'flex', gap:12, justifyContent:'flex-end'}}>
          <Btn onClick={() => {setModal(false); resetForm();}} variant="ghost">Cancel</Btn>
          <Btn onClick={add} icon={Plus}>Add Resource</Btn>
        </div>
      </Modal>
      <Modal open={!!viewer} onClose={() => setViewer(null)} title={viewer?.title || 'Preview'} width={900}>
        {viewer && (
          <div style={{display:'flex', flexDirection:'column', gap:16}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, flexWrap:'wrap'}}>
              <div>
                <div style={{fontSize:16, fontWeight:700, color:C.text, marginBottom:6, fontFamily:FONT_SERIF}}>{viewer.title}</div>
                <div style={{fontSize:13, color:C.sub}}>{viewer.type} {'\u2022'} {viewer.course || 'No course assigned'}</div>
                <div style={{fontSize:12, color:C.muted, marginTop:6}}>File: {viewer.fileName || 'No file uploaded'}</div>
              </div>
              <div style={{display:'flex', gap:12}}>
                <Btn onClick={() => viewer.fileUrl ? window.open(viewer.fileUrl, '_blank') : null} variant="secondary" size="sm" disabled={!viewer.fileUrl}>Open File</Btn>
              </div>
            </div>
            {viewer.fileType === 'pdf' && viewer.fileUrl ? (
              <iframe title={viewer.title} src={viewer.fileUrl} style={{width:'100%', height:'70vh', border:`1px solid ${C.border}`, borderRadius:12, background:'#fff'}}/>
            ) : (
              <div style={{padding:20, border:`1px solid ${C.border}`, borderRadius:12, background:C.surface, color:C.sub, fontSize:14, lineHeight:1.7}}>
                <div style={{marginBottom:10}}>Preview is not available inside the browser for this file type.</div>
                <div>Use <strong style={{color:C.text}}>Open File</strong> to view or download the uploaded document.</div>
                {viewer.notes && <div style={{marginTop:16, whiteSpace:'pre-wrap'}}>{viewer.notes}</div>}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function ReadingLists() {
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
      <AIBox title="Curated Reading List Generator" placeholder="Enter course topic, level (undergrad/postgrad), and learning objectives..." buildPrompt={inp => `Create a comprehensive academic reading list for: ${inp}. Include: 1) Essential Textbooks (3-5 with edition info), 2) Core Academic Papers (5-8 foundational papers), 3) Recent Research Articles (2025-era topics), 4) Online Resources & MOOCs, 5) Industry Reports & Case Studies. For each, provide: title, author, year, and brief annotation explaining why it's relevant.`} resultLabel="Curated Reading List"/>
      <AIBox title="Annotated Bibliography Generator" placeholder="List topics or specific books/papers to create an annotated bibliography..." buildPrompt={inp => `Create an annotated bibliography for: ${inp}. For each source, provide: 1) Full citation in APA format, 2) 3-4 sentence annotation covering: main argument/content, methodology, relevance to the course, and any limitations. Be academically precise.`} resultLabel="Annotated Bibliography"/>
      <AIBox title="Open Access Resources Finder" placeholder="Enter topic and level to find free, high-quality academic resources..." buildPrompt={inp => `Suggest high-quality open access and freely available academic resources for: ${inp}. Include: 1) Open textbooks (e.g., OpenStax, MIT OpenCourseWare), 2) YouTube channels by credible academics, 3) Free online courses (Coursera audit, edX, Khan Academy), 4) Academic databases (Google Scholar searches), 5) GitHub repositories with relevant code/data. Provide URLs where known.`} resultLabel="Open Access Resources"/>
      <AIBox title="Reference Material Update Checker" placeholder="List your current reference list and the topic area to check for updates..." buildPrompt={inp => `Review and suggest updates to this reference/reading list for: ${inp}. Identify: 1) Outdated references to replace (pre-2020 unless classic), 2) New editions of existing textbooks, 3) Recent landmark papers in the field (2022-2025), 4) Emerging resources to add, 5) Resources to remove for being superseded. Provide specific replacement suggestions.`} resultLabel="Updated Reference List"/>
    </div>
  );
}

// ===================== CAPSTONE MODULE =====================
function CapstoneModule({projects, setProjects, capstoneSubmissions, setCapstoneSubmissions, meetingLogs, setMeetingLogs}) {
  const [tab, setTab] = useState('projects');
  const tabs = [
    {id:'projects', icon:Database, label:'Project Tracker'},
    {id:'milestones', icon:Calendar, label:'Milestones'},
    {id:'uploads', icon:Upload, label:'Student Uploads'},
    {id:'meetings', icon:MessageCircle, label:'Meeting Logs'},
    {id:'screen', icon:Eye, label:'AI Proposal Screener'},
    {id:'eval', icon:CheckSquare, label:'Evaluation & Rubrics'},
    {id:'reports', icon:FileText, label:'Reports'}
  ];
  return (
    <div className="fade-in">
      <SectionHead title="Capstone Supervision & Evaluation" sub="Track projects, screen proposals, support uploads, and evaluate student capstones."/>
      <TabBar tabs={tabs} active={tab} setActive={setTab}/>
      {tab === 'projects' && <ProjectTracker projects={projects} setProjects={setProjects}/>}
      {tab === 'milestones' && <MilestoneTracker projects={projects} setProjects={setProjects}/>}
      {tab === 'uploads' && <CapstoneSubmissionCenter submissions={capstoneSubmissions} setSubmissions={setCapstoneSubmissions}/>}
      {tab === 'meetings' && <MeetingLogs projects={projects} meetingLogs={meetingLogs} setMeetingLogs={setMeetingLogs}/>}
      {tab === 'screen' && <ProposalScreener/>}
      {tab === 'eval' && <EvalRubrics/>}
      {tab === 'reports' && <CapstoneReports projects={projects}/>}
    </div>
  );
}

function MeetingLogs({projects, meetingLogs, setMeetingLogs}) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({projectId: '', date: new Date().toISOString().split('T')[0], notes: '', actionItems: ''});

  function add() {
    if (!form.projectId || !form.notes.trim()) return;
    const project = projects.find(p => p.id === +form.projectId);
    const log = {...form, id: Date.now(), projectTitle: project?.title || 'Unknown', student: project?.student || 'Unknown'};
    setMeetingLogs([log, ...meetingLogs]);
    setModal(false);
    setForm({projectId: '', date: new Date().toISOString().split('T')[0], notes: '', actionItems: ''});
  }

  function del(id) {
    setMeetingLogs(meetingLogs.filter(l => l.id !== id));
  }

  return (
    <div>
      <div style={{display:'flex', justifyContent:'flex-end', marginBottom:20}}>
        <Btn onClick={() => setModal(true)} icon={Plus}>Log Meeting</Btn>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:16}}>
        {meetingLogs.length === 0 && (
          <Card style={{textAlign:'center', padding:40}}>
            <Calendar size={32} color={C.muted} style={{marginBottom:12}}/>
            <p style={{color:C.muted}}>No meeting logs recorded yet.</p>
          </Card>
        )}
        {meetingLogs.map(log => (
          <Card key={log.id} style={{padding:20}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
              <div>
                <div style={{fontSize:16, fontWeight:600, color:C.text, fontFamily:FONT_SERIF}}>{log.projectTitle}</div>
                <div style={{fontSize:12, color:C.muted}}>{log.student} {'\u2022'} {log.date}</div>
              </div>
              <button onClick={() => del(log.id)} style={{background:'none', border:'none', color:C.red, cursor:'pointer'}}><Trash2 size={16}/></button>
            </div>
            <div style={{fontSize:13, color:C.sub, lineHeight:1.6, marginBottom:12}}>
              <strong style={{color:C.text}}>Discussion Notes:</strong><br/>
              {log.notes}
            </div>
            {log.actionItems && (
              <div style={{fontSize:13, color:C.sub, lineHeight:1.6, background:C.surface, padding:12, borderRadius:8, borderLeft:`3px solid ${C.accent}`}}>
                <strong style={{color:C.accent}}>Action Items:</strong><br/>
                {log.actionItems}
              </div>
            )}
          </Card>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Log Advisor Meeting" width={600}>
        <div style={{marginBottom:18}}>
          <label style={{display:'block', fontSize:12, color:C.sub, marginBottom:8, fontWeight:600}}>Select Project</label>
          <select value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})} style={{width:'100%', background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'12px 14px', color:C.text, fontSize:14, outline:'none'}}>
            <option value="">Select a capstone project...</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.title} ({p.student})</option>)}
          </select>
        </div>
        <Input label="Meeting Date" type="date" value={form.date} onChange={v => setForm({...form, date: v})}/>
        <Input label="Discussion Notes" value={form.notes} onChange={v => setForm({...form, notes: v})} placeholder="What was discussed?" rows={4}/>
        <Input label="Action Items / Next Steps" value={form.actionItems} onChange={v => setForm({...form, actionItems: v})} placeholder="Tasks assigned to student" rows={3}/>
        <div style={{display:'flex', gap:12, justifyContent:'flex-end', marginTop:12}}>
          <Btn onClick={() => setModal(false)} variant="ghost">Cancel</Btn>
          <Btn onClick={add} icon={Save}>Save Log</Btn>
        </div>
      </Modal>
    </div>
  );
}

function CapstoneSubmissionCenter({submissions, setSubmissions}) {
  const [modal, setModal] = useState(false);
  const [viewer, setViewer] = useState(null);
  const [checking, setChecking] = useState(null);
  const [form, setForm] = useState({student:'', title:'', supervisor:'', abstract:'', file:null, fileName:'', fileUrl:'', fileType:'', notes:'', report:'', provider:'groq', storagePath:'', storageProvider:'local'});
  async function onPickFile(file) {
    if (!file) return;
    try {
      const uploaded = await uploadManagedFile(file, 'capstone');
      setForm(prev => ({...prev, file, fileName:file.name, fileUrl:uploaded.fileUrl, fileType:fileKind(file), storagePath:uploaded.storagePath, storageProvider:uploaded.storageProvider}));
    } catch(e) {
      setForm(prev => ({...prev, file, fileName:file.name, fileType:fileKind(file)}));
    }
  }
  function resetForm() { setForm({student:'', title:'', supervisor:'', abstract:'', file:null, fileName:'', fileUrl:'', fileType:'', notes:'', report:'', provider:'groq', storagePath:'', storageProvider:'local'}); }
  function add() {
    if (!form.title.trim() && !form.student.trim()) return;
    const item = {...form, id:Date.now(), date:new Date().toISOString().split('T')[0], size: form.file ? prettySize(form.file.size) : 'N/A', plagiarismStatus:'Not checked', report:''};
    setSubmissions([...submissions, item]);
    setModal(false);
    resetForm();
  }
  function del(id) { setSubmissions(submissions.filter(s => s.id !== id)); }
  function open(item) { setViewer(item); }
  async function analyze(item) {
    setChecking(item.id);
    const sourceText = [item.abstract, item.notes].filter(Boolean).join('\n\n');
    const prompt = `You are an academic originality screening assistant. Review this student capstone submission and give a plagiarism/originality risk assessment. Be careful not to claim access to a plagiarism database or exact-match index. Focus on red flags, citation problems, style inconsistencies, patchwriting risk, and suggestions for revision. Return concise sections: 1) Overall risk (Low/Medium/High), 2) Reasons, 3) Likely issues, 4) Improvement suggestions, 5) A short disclaimer that this is a heuristic AI screening and not a definitive plagiarism report.\n\nSubmission metadata:\nTitle: ${item.title || 'N/A'}\nStudent: ${item.student || 'N/A'}\nSupervisor: ${item.supervisor || 'N/A'}\nFile: ${item.fileName || 'No file attached'} (${item.fileType || 'unknown'})\n\nStudent provided text / abstract:\n${sourceText || 'No extracted text was provided. Use the file metadata and title to give a cautious, limited-scope screening.'}`;
    const report = await ai(prompt, 'You are an academic originality screening assistant. Never state certainty beyond the evidence provided. Do not pretend to run a database similarity scan. Clearly label the output as a heuristic screening.', item.provider || 'groq');
    setSubmissions(submissions.map(s => s.id === item.id ? {...s, report, plagiarismStatus: report.toLowerCase().includes('high') ? 'High risk' : report.toLowerCase().includes('medium') ? 'Medium risk' : 'Checked'} : s));
    setChecking(null);
  }
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginBottom:20}}>
        <div style={{color:C.sub, fontSize:13, maxWidth:720}}>Students can upload their capstone project files here. The AI plagiarism/originality screen works best when an abstract or extracted text is also provided.</div>
        <Btn onClick={() => setModal(true)} icon={Upload}>Upload Project</Btn>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16}}>
        {submissions.map(item => (
          <Card key={item.id} style={{padding:18}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:12}}>
              <Tag label={item.plagiarismStatus || 'Not checked'} color={item.plagiarismStatus?.includes('High') ? C.red : item.plagiarismStatus?.includes('Medium') ? C.accent : C.green}/>
              <div style={{display:'flex', gap:10}}>
                <button onClick={() => open(item)} title="View" style={{background:'none', border:'none', color:C.accent, cursor:'pointer'}}><Eye size={14}/></button>
                <button onClick={() => del(item.id)} title="Delete" style={{background:'none', border:'none', color:C.red, cursor:'pointer'}}><Trash2 size={14}/></button>
              </div>
            </div>
            <h4 style={{fontSize:14, fontWeight:600, color:C.text, marginBottom:8, lineHeight:1.4}}>{item.title || 'Untitled Project'}</h4>
            <div style={{fontSize:12, color:C.muted, marginBottom:4}}>Student: {item.student || 'N/A'}</div>
            <div style={{fontSize:12, color:C.muted, marginBottom:4}}>Supervisor: {item.supervisor || 'N/A'}</div>
            <div style={{fontSize:12, color:C.muted, marginBottom:4}}>File: {item.fileName || 'No file'}</div>
            <div style={{fontSize:12, color:C.muted, marginBottom:12}}>Uploaded: {item.date} {'\u2022'} {item.size}</div>
            <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
              <Btn onClick={() => analyze(item)} size="sm" variant="secondary" icon={Brain}>{checking === item.id ? 'Checking...' : 'Check Plagiarism'}</Btn>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={modal} onClose={() => {setModal(false); resetForm();}} title="Upload Student Capstone Project" width={700}>
        <Input label="Project Title" value={form.title} onChange={v => setForm({...form, title:v})} placeholder="Project title"/>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <Input label="Student Name" value={form.student} onChange={v => setForm({...form, student:v})} placeholder="Student full name"/>
          <Input label="Supervisor" value={form.supervisor} onChange={v => setForm({...form, supervisor:v})} placeholder="Supervisor name"/>
        </div>
        <Input label="Abstract / Extracted Text" value={form.abstract} onChange={v => setForm({...form, abstract:v})} placeholder="Paste abstract or extracted text for plagiarism screening" rows={4}/>
        <Input label="Notes" value={form.notes} onChange={v => setForm({...form, notes:v})} placeholder="Optional comments about the submission" rows={3}/>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:18}}>
          <div>
            <label style={{display:'block', fontSize:12, color:C.sub, marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Upload Project File (PDF, PPT, PPTX, DOCX)</label>
            <input type="file" onChange={e => onPickFile(e.target.files?.[0])} style={{width:'100%', color:C.text, fontSize:13}}/>
          </div>
          <div>
            <label style={{display:'block', fontSize:12, color:C.sub, marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>AI Provider</label>
            <select value={form.provider} onChange={e => setForm({...form, provider:e.target.value})} style={{width:'100%', background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'12px 14px', color:C.text, fontSize:14, fontFamily:FONT_SANS, outline:'none'}}>
              <option value="groq">Groq</option>
              <option value="gemini">Gemini</option>
              <option value="openrouter">OpenRouter</option>
            </select>
          </div>
        </div>
        {form.fileName && <div style={{fontSize:12, color:C.muted, marginBottom:18}}>Selected: {form.fileName}</div>}
        <div style={{display:'flex', gap:12, justifyContent:'flex-end'}}>
          <Btn onClick={() => {setModal(false); resetForm();}} variant="ghost">Cancel</Btn>
          <Btn onClick={add} icon={Upload}>Save Submission</Btn>
        </div>
      </Modal>
      <Modal open={!!viewer} onClose={() => setViewer(null)} title={viewer?.title || 'Submission'} width={900}>
        {viewer && (
          <div style={{display:'flex', flexDirection:'column', gap:16}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, flexWrap:'wrap'}}>
              <div>
                <div style={{fontSize:16, fontWeight:700, color:C.text, marginBottom:6, fontFamily:FONT_SERIF}}>{viewer.title}</div>
                <div style={{fontSize:13, color:C.sub}}>{viewer.student} {'\u2022'} {viewer.supervisor}</div>
              </div>
              <div style={{display:'flex', gap:12}}>
                <Btn onClick={() => window.open(viewer.fileUrl || '#', '_blank')} variant="secondary" size="sm">Open File</Btn>
              </div>
            </div>
            <div style={{padding:20, border:`1px solid ${C.border}`, borderRadius:12, background:C.surface, color:C.sub, fontSize:14, lineHeight:1.7}}>
              <div><strong style={{color:C.text}}>Abstract / Text: </strong></div>
              <div style={{whiteSpace:'pre-wrap', marginTop:8}}>{viewer.abstract || 'No abstract/text provided.'}</div>
              <div style={{marginTop:16}}><strong style={{color:C.text}}>AI Report: </strong></div>
              <div style={{whiteSpace:'pre-wrap', marginTop:8}}>{viewer.report || 'No plagiarism/originality check has been run yet.'}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ProjectTracker({projects, setProjects}) {
  const emptyForm = {title:'', student:'', supervisor:'', status:'In Progress', progress:0, proposal:'Pending', defense:'Pending'};
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  function openAdd() { setEditId(null); setForm(emptyForm); setModal(true); }
  function openEdit(p) {
    setEditId(p.id);
    setForm({title:p.title, student:p.student, supervisor:p.supervisor, status:p.status, progress:p.progress, proposal:p.proposal||'Pending', defense:p.defense||'Pending'});
    setModal(true);
  }
  function closeModal() { setModal(false); setEditId(null); setForm(emptyForm); }

  function save() {
    if (editId) {
      setProjects(projects.map(p => p.id === editId ? {...p, ...form, progress:+form.progress} : p));
    } else {
      setProjects([...projects, {...form, id:Date.now(), progress:+form.progress, milestones:[{name:'Proposal',done:false,date:''},{name:'Literature Review',done:false,date:''},{name:'System Design',done:false,date:''},{name:'Implementation',done:false,date:''},{name:'Testing',done:false,date:''},{name:'Defense',done:false,date:''}]}]);
    }
    closeModal();
  }

  function del(id) { setProjects(projects.filter(p => p.id !== id)); }
  const statColor = {'In Progress':C.blue, 'On Track':C.green, 'Behind':C.red, 'Completed':C.accent, 'At Risk':C.red};

  return (
    <div>
      <div style={{display:'flex', justifyContent:'flex-end', marginBottom:20}}><Btn onClick={openAdd} icon={Plus}>Add Project</Btn></div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
        {projects.map(p => (
          <Card key={p.id} style={{padding:24}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16}}>
              <div style={{flex:1, marginRight:16}}>
                <h4 style={{fontSize:16, fontWeight:600, color:C.text, marginBottom:6, lineHeight:1.4, fontFamily:FONT_SERIF}}>{p.title}</h4>
                <div style={{fontSize:13, color:C.muted}}>{p.student}</div>
              </div>
              <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8}}>
                <Tag label={p.status} color={statColor[p.status] || C.blue}/>
                <div style={{display:'flex', gap:10}}>
                  <button onClick={() => openEdit(p)} title="Edit" style={{background:'none', border:'none', color:C.accent, cursor:'pointer'}}><Edit3 size={14}/></button>
                  <button onClick={() => del(p.id)} title="Delete" style={{background:'none', border:'none', color:C.muted, cursor:'pointer'}}><Trash2 size={14}/></button>
                </div>
              </div>
            </div>
            <div style={{display:'flex', gap:20, marginBottom:16, fontSize:12, color:C.muted}}>
              <span>Supervisor: <strong style={{color:C.sub}}>{p.supervisor}</strong></span>
            </div>
            <div style={{background:C.border, borderRadius:4, height:8, overflow:'hidden', marginBottom:8}}>
              <div style={{width:`${p.progress}%`, height:'100%', background:p.progress >= 80 ? C.green : p.progress >= 50 ? C.accent : C.blue, borderRadius:4, transition:'width 0.3s'}}/>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:12, color:C.muted}}>
              <span>{p.progress}% complete</span>
              <div style={{display:'flex', gap:10}}>
                <Tag label={`Proposal: ${p.proposal}`} color={p.proposal === 'Approved' ? C.green : C.muted}/>
                <Tag label={`Defense: ${p.defense}`} color={p.defense === 'Completed' ? C.green : C.muted}/>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={modal} onClose={closeModal} title={editId ? 'Edit Capstone Project' : 'Add Capstone Project'} width={500}>
        <Input label="Project Title" value={form.title} onChange={v => setForm({...form, title:v})} placeholder="Project title"/>
        <Input label="Student Name" value={form.student} onChange={v => setForm({...form, student:v})} placeholder="Student full name"/>
        <Input label="Supervisor" value={form.supervisor} onChange={v => setForm({...form, supervisor:v})} placeholder="Supervisor name"/>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <div style={{marginBottom:18}}>
            <label style={{display:'block', fontSize:12, color:C.sub, marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Status</label>
            <select value={form.status} onChange={e => setForm({...form, status:e.target.value})} style={{width:'100%', background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'12px 14px', color:C.text, fontSize:14, fontFamily:FONT_SANS, outline:'none'}}>
              {['In Progress','On Track','Behind','At Risk','Completed'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <Input label="Progress (%)" value={form.progress} onChange={v => setForm({...form, progress:+v})} type="number"/>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <div style={{marginBottom:18}}>
            <label style={{display:'block', fontSize:12, color:C.sub, marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Proposal</label>
            <select value={form.proposal} onChange={e => setForm({...form, proposal:e.target.value})} style={{width:'100%', background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'12px 14px', color:C.text, fontSize:14, fontFamily:FONT_SANS, outline:'none'}}>
              {['Pending','Submitted','Approved','Rejected'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{marginBottom:18}}>
            <label style={{display:'block', fontSize:12, color:C.sub, marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Defense</label>
            <select value={form.defense} onChange={e => setForm({...form, defense:e.target.value})} style={{width:'100%', background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'12px 14px', color:C.text, fontSize:14, fontFamily:FONT_SANS, outline:'none'}}>
              {['Pending','Scheduled','Completed'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={{display:'flex', gap:12, justifyContent:'flex-end'}}>
          <Btn onClick={closeModal} variant="ghost">Cancel</Btn>
          <Btn onClick={save} icon={editId ? Save : Plus}>{editId ? 'Save Changes' : 'Add Project'}</Btn>
        </div>
      </Modal>
    </div>
  );
}

function MilestoneTracker({projects, setProjects}) {
  function toggleMilestone(pid, mi) {
    setProjects(projects.map(p => {
      if (p.id !== pid) return p;
      const updatedMilestones = p.milestones.map((m, i) => i === mi ? {...m, done: !m.done} : m);
      const doneCount = updatedMilestones.filter(m => m.done).length;
      const progress = Math.round((doneCount / updatedMilestones.length) * 100);
      const status = progress === 100 ? 'Completed' : (p.status === 'Completed' ? 'In Progress' : p.status);
      return {...p, milestones: updatedMilestones, progress, status};
    }));
  }
  return (
    <div style={{display:'flex', flexDirection:'column', gap:20}}>
      {projects.map(p => (
        <Card key={p.id}>
          <h4 style={{fontSize:16, fontWeight:600, color:C.text, marginBottom:6, fontFamily:FONT_SERIF}}>{p.title}</h4>
          <div style={{fontSize:13, color:C.muted, marginBottom:20}}>{p.student} {'\u2014'} {p.progress}% complete</div>
          <div style={{display:'flex', alignItems:'center', gap:0, overflowX:'auto', paddingBottom:12}}>
            {p.milestones.map((m, i) => (
              <div key={i} style={{display:'flex', alignItems:'center', flexShrink:0}}>
                <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:8}}>
                  <button onClick={() => toggleMilestone(p.id, i)} style={{width:36, height:36, borderRadius:'50%', border:`2px solid ${m.done ? C.green : C.border}`, background:m.done ? C.green : C.surface, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all 0.2s'}}>
                    {m.done ? <CheckCircle size={16} color="#fff"/> : <div style={{width:10, height:10, borderRadius:'50%', background:C.border}}/>}
                  </button>
                  <span style={{fontSize:10, color:m.done ? C.green : C.muted, textAlign:'center', maxWidth:70, lineHeight:1.3, fontWeight:500}}>{m.name}</span>
                </div>
                {i < p.milestones.length - 1 && <div style={{width:50, height:2, background:m.done ? C.green : C.border, flexShrink:0, marginBottom:24}}/>}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function ProposalScreener() {
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
      <AIBox title="Proposal Feasibility Screener" placeholder="Paste the student's capstone project proposal here..." buildPrompt={inp => `Screen this capstone project proposal for feasibility. Evaluate: 1) Technical Feasibility (0-10), 2) Scope Appropriateness (0-10), 3) Innovation Level (0-10), 4) Resource Requirements vs. Available, 5) Timeline Realism. Provide: Overall recommendation (Accept/Revise/Reject), specific concerns, and revision suggestions if needed.\n\nProposal:\n${inp}`} resultLabel="Proposal Assessment"/>
      <AIBox title="Literature Review Feedback" placeholder="Paste the student's literature review for AI feedback..." buildPrompt={inp => `Evaluate this academic literature review from a capstone project: ${inp}. Assess: 1) Coverage of key papers/authors in the field, 2) Critical analysis depth, 3) Synthesis vs. mere summary, 4) Identification of research gaps, 5) Citation quality and recency, 6) Writing quality. Provide a grade estimate and specific improvement recommendations.`} resultLabel="Literature Review Feedback"/>
      <AIBox title="Originality & Contribution Check" placeholder="Paste project title, abstract, and key contributions claimed..." buildPrompt={inp => `Evaluate the academic originality and contribution of this capstone project: ${inp}. Analyze: 1) Novelty of approach compared to existing work, 2) Clarity of contribution statement, 3) Technical merit, 4) Practical significance, 5) Potential research/industry impact. Rate originality 1-10 and explain what makes it unique or what could strengthen it.`} resultLabel="Originality Assessment"/>
      <AIBox title="Defense Preparation Questionnaire" placeholder="Enter project title and abstract to generate likely defense questions..." buildPrompt={inp => `Generate 15 challenging but fair questions an examination committee would ask during a capstone defense for: ${inp}. Include questions from categories: Technical depth, Methodology justification, Literature knowledge, Limitations awareness, Future work, and Practical application. Also provide brief guidance on what a strong answer should include for each.`} resultLabel="Defense Questions"/>
    </div>
  );
}

function EvalRubrics() {
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
      <AIBox title="Evaluation Rubric Generator" placeholder="Describe the type of project/deliverable and assessment criteria needed..." buildPrompt={inp => `Create a detailed evaluation rubric for: ${inp}. Format as a table with: Criterion | Weight% | Excellent (A) | Good (B) | Satisfactory (C) | Poor (D/F). Include criteria for: Technical Implementation, Innovation/Originality, Documentation Quality, Presentation Skills, Problem-Solving Approach, and Team Collaboration (if applicable). Total weight must equal 100%.`} resultLabel="Evaluation Rubric"/>
      <AIBox title="Defense Evaluation Form" placeholder="Describe the capstone project type for a customized defense evaluation form..." buildPrompt={inp => `Design a comprehensive defense evaluation form for ${inp}. Include: 1) Project Overview Score (20%), 2) Technical Depth Q&A Score (30%), 3) Presentation Quality (20%), 4) Demo/Prototype Evaluation (20%), 5) Response to Examiner Questions (10%). For each section: include specific evaluation criteria, score ranges, and space for comments. Format professionally.`} resultLabel="Defense Evaluation Form"/>
      <AIBox title="Feedback Report Generator" placeholder="Describe student performance in the defense/evaluation for a formal report..." buildPrompt={inp => `Write a formal capstone evaluation feedback report based on: ${inp}. Include: 1) Executive Summary, 2) Technical Achievement assessment, 3) Presentation & Communication skills evaluation, 4) Strengths demonstrated, 5) Areas requiring improvement, 6) Overall grade recommendation with justification, 7) Recommendation for publication/industry application (if applicable). Format for official university records.`} resultLabel="Feedback Report"/>
      <AIBox title="Plagiarism & Ethics Checklist" placeholder="Describe the project to generate an ethics and originality verification checklist..." buildPrompt={inp => `Create a comprehensive plagiarism and research ethics verification checklist for: ${inp}. Cover: 1) Code/implementation originality checks, 2) Data collection ethics compliance, 3) Proper attribution of all sources, 4) AI tool usage disclosure requirements, 5) Copyright compliance for datasets, 6) Human subjects research ethics (if applicable). Make it actionable with Yes/No checkboxes and verification steps.`} resultLabel="Ethics Checklist"/>
    </div>
  );
}

function CapstoneReports({projects}) {
  const done = projects.filter(p => p.status === 'Completed').length;
  const inProgress = projects.filter(p => p.status === 'In Progress').length;
  const atRisk = projects.filter(p => p.status === 'At Risk' || p.status === 'Behind').length;
  return (
    <div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:20, marginBottom:24}}>
        <StatCard icon={Award} label="Total Projects" value={projects.length} color={C.blue}/>
        <StatCard icon={CheckCircle} label="Completed" value={done} color={C.green}/>
        <StatCard icon={AlertCircle} label="At Risk" value={atRisk} color={C.red} sub={atRisk > 0 ? "Needs attention" : "All on track"}/>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
        <Card>
          <h3 style={{fontSize:16, fontWeight:600, color:C.text, marginBottom:16, fontFamily:FONT_SERIF}}>Project Status Summary</h3>
          {projects.map(p => (
            <div key={p.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:`1px solid ${C.border}`}}>
              <div>
                <div style={{fontSize:13, fontWeight:500, color:C.text}}>{p.title}</div>
                <div style={{fontSize:12, color:C.muted, marginTop:4}}>{p.student}</div>
              </div>
              <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6}}>
                <Tag label={p.status} color={p.status === 'Completed' ? C.green : p.status === 'At Risk' ? C.red : C.blue}/>
                <span style={{fontSize:11, color:C.muted}}>{p.progress}% done</span>
              </div>
            </div>
          ))}
        </Card>
        <AIBox title="Capstone Summary Report Generator" placeholder="Describe the semester or batch for a comprehensive capstone summary report..." buildPrompt={inp => `Generate a formal capstone supervision summary report for: ${inp}. Include: 1) Executive Summary, 2) Total projects supervised with status breakdown, 3) Notable achievements and innovations, 4) Challenges faced and how resolved, 5) Assessment statistics (grade distribution), 6) Recommendations for next semester's capstone program. Format for departmental records and accreditation purposes.`} resultLabel="Summary Report"/>
      </div>
    </div>
  );
}

// ===================== PROFILE MODAL =====================
function ProfileModal({ open, onClose, user, onSave }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [dept, setDept] = useState('');
  const [phone, setPhone] = useState('');
  const [office, setOffice] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open && user) {
      setName(user.name || '');
      setRole(user.role || 'Professor');
      setDept(user.dept || 'CSE');
      setPhone(user.phone || '');
      setOffice(user.office || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
      setAvatarError('');
    }
  }, [open, user]);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { setAvatarError('Please choose an image file (JPG or PNG).'); return; }
    if (file.size > 3 * 1024 * 1024) { setAvatarError('Image is too large. Please choose a file under 3MB.'); return; }
    try {
      const dataUrl = await fileToDataUrl(file);
      setAvatar(dataUrl);
      setAvatarError('');
    } catch {
      setAvatarError('Could not load that image. Please try another file.');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile" width={520}>
      <div style={{display:'flex', alignItems:'center', gap:18, marginBottom:24, paddingBottom:20, borderBottom:`1px solid ${C.border}`}}>
        <Avatar user={{name, avatar}} size={76} style={{fontSize:24, border:`2px solid ${C.border}`}}/>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <div style={{display:'flex', gap:8}}>
            <Btn onClick={() => fileInputRef.current?.click()} variant="secondary" size="sm" icon={Upload}>Change Photo</Btn>
            {avatar && <Btn onClick={() => setAvatar('')} variant="ghost" size="sm" icon={X}>Remove</Btn>}
          </div>
          <span style={{fontSize:11, color:C.muted}}>JPG or PNG, up to 3MB.</span>
          {avatarError && <span style={{fontSize:11, color:C.red}}>{avatarError}</span>}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleAvatarChange}/>
      </div>
      <Input label="Full Name" value={name} onChange={setName} placeholder="e.g. Md. Fuad Hasan"/>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <div style={{marginBottom:18}}>
          <label style={{display:'block', fontSize:12, color:C.sub, marginBottom:6, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Designation / Role</label>
          <select value={role} onChange={e => setRole(e.target.value)} style={{width:'100%', background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 12px', color:C.text, fontSize:13, fontFamily:'inherit', outline:'none'}}>
            <option value="Professor">Professor</option>
            <option value="Associate Professor">Associate Professor</option>
            <option value="Assistant Professor">Assistant Professor</option>
            <option value="Lecturer">Lecturer</option>
            <option value="Senior Lecturer">Senior Lecturer</option>
            <option value="Lab Instructor">Lab Instructor</option>
          </select>
        </div>
        <Input label="Department" value={dept} onChange={setDept} placeholder="e.g. CSE"/>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <Input label="Phone Number" value={phone} onChange={setPhone} placeholder="e.g. +880 1XXX-XXXXXX"/>
        <Input label="Office / Room" value={office} onChange={setOffice} placeholder="e.g. AB1, Room 405"/>
      </div>
      <Input label="Short Bio" value={bio} onChange={setBio} placeholder="A line or two about your research interests or background..." rows={3}/>
      {user?.email && (
        <div style={{fontSize:12, color:C.muted, marginTop:-6, marginBottom:18}}>Signed in as <strong style={{color:C.sub}}>{user.email}</strong></div>
      )}
      <div style={{display:'flex', gap:10, justifyContent:'flex-end', marginTop:12}}>
        <Btn onClick={onClose} variant="ghost">Cancel</Btn>
        <Btn onClick={() => onSave({ name, role, dept, phone, office, bio, avatar })} icon={Save}>Save Profile</Btn>
      </div>
    </Modal>
  );
}

// ===================== MAIN APP =====================
export default function EduAI() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState(null);
  const [module, setModule] = useState('dashboard');
  const [authLoading, setAuthLoading] = useState(true);
  const [profileModal, setProfileModal] = useState(false);
  
  // New Global States
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {id: 1, text: 'Midterm grading deadline approaching for CSE401', time: '2 hours ago', read: false},
    {id: 2, text: 'New capstone proposal submitted by Ahmed Hassan', time: '5 hours ago', read: false},
    {id: 3, text: 'Curriculum review meeting scheduled for Friday', time: '1 day ago', read: true},
  ]);

  const [grades, setGrades] = useState(DEMO_GRADES);
  const [courses, setCourses] = useState(DEMO_COURSES);
  const [projects, setProjects] = useState(DEMO_PROJECTS);
  const [materials, setMaterials] = useState(DEMO_MATS);
  const [curriculumAssets, setCurriculumAssets] = useState([]);
  const [capstoneSubmissions, setCapstoneSubmissions] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [meetingLogs, setMeetingLogs] = useState([]);
  const [deadlines, setDeadlines] = useState(DEMO_DEADLINES);

  useEffect(() => {
    (async () => {
      const g = await gget('eduai_grades', DEMO_GRADES);
      const c = await gget('eduai_courses', DEMO_COURSES);
      const p = await gget('eduai_projects', DEMO_PROJECTS);
      const m = await gget('eduai_materials', DEMO_MATS);
      const ca = await gget('eduai_curriculum_assets', []);
      const cs = await gget('eduai_capstone_submissions', []);
      const att = await gget('eduai_attendance', []);
      const ml = await gget('eduai_meeting_logs', []);
      const dl = await gget('eduai_deadlines', DEMO_DEADLINES);
      
      setGrades(g); setCourses(c); setProjects(p); setMaterials(m); setCurriculumAssets(ca); setCapstoneSubmissions(cs);
      setAttendance(att); setMeetingLogs(ml); setDeadlines(dl);

      const savedProfile = localStorage.getItem('eduai_user_profile');
      const parsedProfile = savedProfile ? JSON.parse(savedProfile) : null;

      if (HAS_SUPABASE) {
        try {
          const { data } = await supabase.auth.getSession();
          const sessionUser = data?.session?.user;
          if (sessionUser) {
            const baseUser = { id: sessionUser.id, email: sessionUser.email, name: getDisplayName(sessionUser), role: 'Professor', dept: 'CSE' };
            setUser(parsedProfile ? { ...baseUser, ...parsedProfile } : baseUser);
            setPage('app');
          }
        } catch (err) { console.warn("Supabase auth check failed:", err); }
      }
      setAuthLoading(false);
    })();

    if (HAS_SUPABASE) {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          const sessionUser = session?.user;
          if (sessionUser) {
            const baseUser = { id: sessionUser.id, email: sessionUser.email, name: getDisplayName(sessionUser), role: 'Professor', dept: 'CSE' };
            const savedProfile = localStorage.getItem('eduai_user_profile');
            const parsedProfile = savedProfile ? JSON.parse(savedProfile) : null;
            setUser(parsedProfile ? { ...baseUser, ...parsedProfile } : baseUser);
            setPage('app');
          } else {
            setUser(null);
            setPage('login');
          }
        });
        return () => subscription.unsubscribe();
      } catch (err) { console.warn("Supabase listener failed:", err); }
    }
  }, []);

  async function updGrades(g) { setGrades(g); await gset('eduai_grades', g); }
  async function updCourses(c) { if (typeof c === 'function') { setCourses(prev => { const next = c(prev); gset('eduai_courses', next); return next; }); } else { setCourses(c); await gset('eduai_courses', c); } }
  async function updProjects(p) { setProjects(p); await gset('eduai_projects', p); }
  async function updMaterials(m) { setMaterials(m); await gset('eduai_materials', m); }
  async function updCurriculumAssets(a) { setCurriculumAssets(a); await gset('eduai_curriculum_assets', a); }
  async function updCapstoneSubmissions(s) { setCapstoneSubmissions(s); await gset('eduai_capstone_submissions', s); }
  async function updAttendance(a) { setAttendance(a); await gset('eduai_attendance', a); }
  async function updMeetingLogs(m) { setMeetingLogs(m); await gset('eduai_meeting_logs', m); }
  async function updDeadlines(d) { setDeadlines(d); await gset('eduai_deadlines', d); }

  function handleProfileUpdate(newData) {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    localStorage.setItem('eduai_user_profile', JSON.stringify(updatedUser));
    if (HAS_SUPABASE && user?.id && user.id !== 'demo') {
      supabase.auth.updateUser({
        data: { full_name: newData.name, role: newData.role, dept: newData.dept }
      }).catch(() => {});
    }
    setProfileModal(false);
  }

  async function handleLogout() {
    if (HAS_SUPABASE) { await supabase.auth.signOut().catch(() => {}); }
    setUser(null);
    setPage('login');
  }



  if (page === 'login') return <LoginPage onAuthSuccess={(authUser) => {
    const baseUser = { name: getDisplayName(authUser), email: authUser?.email, dept: 'CSE', role: 'Professor', id: authUser?.id || 'demo' };
    const savedProfile = localStorage.getItem('eduai_user_profile');
    const parsedProfile = savedProfile ? JSON.parse(savedProfile) : null;
    setUser(parsedProfile ? { ...baseUser, ...parsedProfile } : baseUser);
    setPage('app');
  }}/>;

  return (
    <div style={{display:'flex', height:'100vh', background:C.bg, color:C.text, fontFamily:'"DM Sans",system-ui,sans-serif', overflow:'hidden'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}button:hover{opacity:0.9;}select option{background:${C.surface};}`}</style>
      
      <Sidebar module={module} setModule={setModule} onLogout={handleLogout} user={user} onEditProfile={() => setProfileModal(true)}/>
      
      <div style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden'}}>
        <TopBar 
          user={user} 
          module={module} 
          onSearchOpen={() => setSearchOpen(true)}
          notifications={notifications}
          onNotifToggle={() => setNotifOpen(!notifOpen)}
          notifOpen={notifOpen}
        />
        <main style={{flex:1, overflowY:'auto', padding:'24px 28px'}}>
          {module === 'dashboard' && <DashboardHome grades={grades} courses={courses} projects={projects} setModule={setModule} deadlines={deadlines} setDeadlines={updDeadlines}/>}
          {module === 'teaching' && <TeachingModule grades={grades} setGrades={updGrades} courses={courses} attendance={attendance} setAttendance={updAttendance}/>}
          {module === 'curriculum' && <CurriculumModule courses={courses} setCourses={updCourses} curriculumAssets={curriculumAssets} setCurriculumAssets={updCurriculumAssets}/>}
          {module === 'materials' && <MaterialsModule materials={materials} setMaterials={updMaterials}/>}
          {module === 'capstone' && <CapstoneModule projects={projects} setProjects={updProjects} capstoneSubmissions={capstoneSubmissions} setSubmissions={updCapstoneSubmissions} meetingLogs={meetingLogs} setMeetingLogs={updMeetingLogs}/>}
        </main>
      </div>

      <GlobalSearch 
        open={searchOpen} 
        onClose={() => setSearchOpen(false)} 
        grades={grades} 
        courses={courses} 
        materials={materials} 
        projects={projects} 
      />

      <ProfileModal 
        open={profileModal} 
        onClose={() => setProfileModal(false)} 
        user={user} 
        onSave={handleProfileUpdate} 
      />
    </div>
  );
}
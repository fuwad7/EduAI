import { useState, useEffect, useRef } from "react";
import { BookOpen, Users, BarChart3, FileText, GraduationCap, LogOut, Brain, Zap, Target, TrendingUp, ClipboardList, Loader, X, Edit3, Trash2, ChevronRight, Award, Calendar, Database, PenTool, BookMarked, Map, Bell, CheckSquare, MessageCircle, Home, Archive, Plus, Save, Search, ChevronDown, CheckCircle, AlertCircle, Star, Upload, Eye, RefreshCw, Filter, Settings } from "lucide-react";

const C = { bg:'#07090f', surface:'#0f1629', card:'#13192e', border:'#1e2d4a', accent:'#f59e0b', blue:'#3b82f6', green:'#10b981', red:'#ef4444', purple:'#8b5cf6', cyan:'#06b6d4', text:'#f1f5f9', muted:'#64748b', sub:'#94a3b8' };

const AI_KEYS = {
  groq: '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',
  gemini: 'AIzaSyCmdq6ePVFsBSphH6ZDWL2pKen2UTG4Iu4',
  openrouter: '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',
};

const AI_CONFIG = {
  groq: {
    label: 'Groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    headers: (key) => ({
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    }),
    body: (prompt, sys) => ({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 1200,
    }),
    parse: (data) => data?.choices?.[0]?.message?.content || data?.output_text || '',
  },
  gemini: {
    label: 'Gemini',
    url: (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    model: 'gemini-2.5-flash',
    headers: (key) => ({
      'x-goog-api-key': key,
      'Content-Type': 'application/json',
    }),
    body: (prompt, sys) => ({
      systemInstruction: { parts: [{ text: sys }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 1200 },
    }),
    parse: (data) => data?.candidates?.[0]?.content?.parts?.map((p) => p?.text || '').join('') || data?.candidates?.[0]?.content?.parts?.[0]?.text || '',
  },
  openrouter: {
    label: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'openrouter/free',
    headers: (key) => ({
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    }),
    body: (prompt, sys) => ({
      model: 'openrouter/free',
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 1200,
    }),
    parse: (data) => data?.choices?.[0]?.message?.content || '',
  },
};

async function ai(prompt, sys='You are EduAI, an expert educational assistant for university professors. Be detailed, practical, and professional in your responses.', provider='groq') {
  const p = String(prompt || '').trim();
  if (!p) return 'Please enter a prompt first.';

  const chosen = (provider || 'groq').toLowerCase();
  const cfg = AI_CONFIG[chosen] || AI_CONFIG.groq;
  const key = AI_KEYS[chosen] || AI_KEYS.groq;

  try {
    const res = await fetch(typeof cfg.url === 'function' ? cfg.url(cfg.model) : cfg.url, {
      method: 'POST',
      headers: cfg.headers(key),
      body: JSON.stringify(cfg.body(p, sys)),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.error?.message || data?.message || `API request failed (${res.status})`;
      throw new Error(msg);
    }

    const out = cfg.parse(data);
    if (out && String(out).trim()) return String(out).trim();

    return 'The API returned no usable text response.';
  } catch (err) {
    return `AI request failed: ${err?.message || 'Unknown error'}`;
  }
}

async function gset(key,val){try{localStorage.setItem(key,JSON.stringify(val));}catch{}}
async function gget(key,fb){try{const r=localStorage.getItem(key);return r?JSON.parse(r):fb;}catch{return fb;}}

const DEMO_GRADES=[{id:1,student:'Ahmed Hassan',sid:'CSE2101',quiz1:85,quiz2:80,mid:72,assign:78,final:0,grade:'B+'},{id:2,student:'Fatima Rahman',sid:'CSE2102',quiz1:92,quiz2:95,mid:90,assign:88,final:0,grade:'A'},{id:3,student:'Karim Uddin',sid:'CSE2103',quiz1:70,quiz2:65,mid:58,assign:72,final:0,grade:'C+'},{id:4,student:'Nadia Islam',sid:'CSE2104',quiz1:88,quiz2:90,mid:85,assign:82,final:0,grade:'A-'},{id:5,student:'Rafiq Hossain',sid:'CSE2105',quiz1:60,quiz2:55,mid:48,assign:65,final:0,grade:'C'}];
const DEMO_COURSES=[{id:1,code:'CSE401',name:'Artificial Intelligence',credits:3,clos:['CLO1: Apply ML algorithms','CLO2: Design neural networks','CLO3: Evaluate AI ethics'],plos:['PLO1','PLO2','PLO5'],mapping:{CLO1:'PLO1,PLO2',CLO2:'PLO2',CLO3:'PLO5'},students:35,semester:'Fall 2025'},{id:2,code:'CSE301',name:'Data Structures',credits:3,clos:['CLO1: Implement core data structures','CLO2: Analyze algorithm complexity','CLO3: Solve real-world problems'],plos:['PLO1','PLO3'],mapping:{CLO1:'PLO1',CLO2:'PLO1,PLO3',CLO3:'PLO3'},students:42,semester:'Fall 2025'}];
const DEMO_PROJECTS=[{id:1,title:'Smart Traffic Management System',student:'Ahmed Hassan',supervisor:'Dr. Sarah Ahmed',status:'In Progress',progress:65,proposal:'Submitted',defense:'Pending',milestones:[{name:'Proposal',done:true,date:'2025-02-01'},{name:'Literature Review',done:true,date:'2025-03-01'},{name:'System Design',done:true,date:'2025-04-01'},{name:'Implementation',done:false,date:'2025-06-01'},{name:'Testing',done:false,date:'2025-07-01'},{name:'Defense',done:false,date:'2025-08-15'}]},{id:2,title:'AI-Based Medical Diagnosis',student:'Fatima Rahman',supervisor:'Dr. Sarah Ahmed',status:'On Track',progress:40,proposal:'Approved',defense:'Scheduled',milestones:[{name:'Proposal',done:true,date:'2025-02-15'},{name:'Literature Review',done:true,date:'2025-03-15'},{name:'System Design',done:false,date:'2025-04-20'},{name:'Implementation',done:false,date:'2025-06-20'},{name:'Testing',done:false,date:'2025-07-20'},{name:'Defense',done:false,date:'2025-08-20'}]}];
const DEMO_MATS=[{id:1,title:'Introduction to Neural Networks',course:'CSE401',type:'Lecture Slides',date:'2025-01-15',size:'2.4 MB'},{id:2,title:'Algorithm Analysis - Week 3',course:'CSE301',type:'Lecture Notes',date:'2025-01-20',size:'1.1 MB'},{id:3,title:'AI Ethics Reading List',course:'CSE401',type:'Reading List',date:'2025-01-25',size:'0.5 MB'},{id:4,title:'Lab Manual - Sorting Algorithms',course:'CSE301',type:'Lab Manual',date:'2025-02-01',size:'3.2 MB'}];

function Btn({children,onClick,variant='primary',disabled,size='md',icon:Icon,full,style={}}) {
  const base={border:'none',cursor:disabled?'not-allowed':'pointer',borderRadius:8,fontFamily:'inherit',fontWeight:600,display:'inline-flex',alignItems:'center',gap:6,opacity:disabled?0.5:1,transition:'all 0.2s',whiteSpace:'nowrap'};
  const sz={sm:{padding:'6px 12px',fontSize:12},md:{padding:'10px 18px',fontSize:13},lg:{padding:'12px 24px',fontSize:14}};
  const vars={primary:{background:C.accent,color:'#000'},secondary:{background:C.border,color:C.text},success:{background:C.green,color:'#fff'},danger:{background:C.red,color:'#fff'},ghost:{background:'transparent',color:C.sub,border:`1px solid ${C.border}`},blue:{background:C.blue,color:'#fff'},purple:{background:C.purple,color:'#fff'}};
  return <button onClick={onClick} disabled={disabled} style={{...base,...sz[size],...vars[variant],width:full?'100%':'auto',...style}}>{Icon&&<Icon size={size==='sm'?12:14}/>}{children}</button>;
}

function Card({children,style,onClick}) { return <div onClick={onClick} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:20,cursor:onClick?'pointer':'default',...style}}>{children}</div>; }

function StatCard({icon:Icon,label,value,color=C.accent,sub}) {
  return <Card style={{display:'flex',flexDirection:'column',gap:8}}>
    <div style={{display:'flex',alignItems:'center',gap:10}}>
      <div style={{background:`${color}22`,borderRadius:8,padding:8,display:'flex'}}><Icon size={18} color={color}/></div>
      <span style={{fontSize:12,color:C.sub,fontWeight:500}}>{label}</span>
    </div>
    <div style={{fontSize:28,fontWeight:700,color:C.text}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:C.muted}}>{sub}</div>}
  </Card>;
}

function AIBox({title,placeholder,buildPrompt,resultLabel='AI Response'}) {
  const [inp,setInp]=useState('');const [res,setRes]=useState('');const [load,setLoad]=useState(false);const [provider,setProvider]=useState('groq');
  useEffect(()=>{try{const saved=localStorage.getItem('eduai_ai_provider');if(saved)setProvider(saved);}catch{}},[]);
  useEffect(()=>{try{localStorage.setItem('eduai_ai_provider',provider);}catch{}},[provider]);
  async function run(){setLoad(true);setRes('');const r=await ai(buildPrompt(inp),'You are EduAI, an expert educational assistant for university professors. Be detailed, practical, and professional in your responses.',provider);setRes(r);setLoad(false);}
  return <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20}}>
    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
      <Brain size={16} color={C.accent}/><span style={{fontWeight:600,color:C.accent,fontSize:13}}>{title}</span>
      <span style={{marginLeft:'auto',fontSize:11,color:C.muted,background:`${C.accent}22`,padding:'2px 8px',borderRadius:20}}>AI Powered</span>
      <select value={provider} onChange={e=>setProvider(e.target.value)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:'6px 8px',color:C.text,fontSize:12,fontFamily:'inherit',outline:'none'}}>
        <option value="groq">Groq</option>
        <option value="gemini">Gemini</option>
        <option value="openrouter">OpenRouter</option>
      </select>
    </div>
    <textarea value={inp} onChange={e=>setInp(e.target.value)} placeholder={placeholder} style={{width:'100%',background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:12,color:C.text,fontSize:13,minHeight:80,resize:'vertical',outline:'none',fontFamily:'inherit'}}/>
    <Btn onClick={run} disabled={load||!inp.trim()} icon={load?Loader:Brain} style={{marginTop:10}}>{load?'Generating...':'Generate with AI'}</Btn>
    {res&&<div style={{marginTop:14,background:C.card,borderRadius:8,padding:16,color:C.sub,fontSize:13,lineHeight:1.7,whiteSpace:'pre-wrap',maxHeight:350,overflowY:'auto',border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.accent}`}}>
      <div style={{fontSize:11,color:C.accent,marginBottom:8,fontWeight:600}}>{resultLabel}</div>
      {res}
    </div>}
  </div>;
}

function TabBar({tabs,active,setActive}) {
  return (
    <div style={{display:'flex',gap:4,borderBottom:`1px solid ${C.border}`,marginBottom:20}}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setActive(t.id)}
          style={{padding:'10px 18px',background:'none',border:'none',borderBottom:active===t.id?`2px solid ${C.accent}`:'2px solid transparent',color:active===t.id?C.accent:C.sub,fontWeight:active===t.id?600:400,cursor:'pointer',fontSize:13,fontFamily:'inherit',display:'flex',alignItems:'center',gap:6,transition:'color 0.2s'}}
        >
          {t.icon && <t.icon size={14} />}
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Tag({label,color=C.accent}) { return <span style={{fontSize:11,padding:'3px 8px',borderRadius:20,background:`${color}22`,color,fontWeight:600}}>{label}</span>; }

function SectionHead({title,sub,action}) {
  return <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
    <div><h2 style={{fontSize:20,fontWeight:700,color:C.text,fontFamily:'"Playfair Display",serif'}}>{title}</h2>{sub&&<p style={{fontSize:13,color:C.sub,marginTop:4}}>{sub}</p>}</div>
    {action}
  </div>;
}

function Modal({open,onClose,title,children,width=600}) {
  if(!open)return null;
  return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:24,width,maxWidth:'95vw',maxHeight:'85vh',overflowY:'auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <h3 style={{fontSize:16,fontWeight:700,color:C.text}}>{title}</h3>
        <button onClick={onClose} style={{background:'none',border:'none',color:C.muted,cursor:'pointer'}}><X size={18}/></button>
      </div>
      {children}
    </div>
  </div>;
}

function Input({label,value,onChange,placeholder,type='text',rows}) {
  const style={width:'100%',background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:'10px 12px',color:C.text,fontSize:13,outline:'none',fontFamily:'inherit',boxSizing:'border-box'};
  return <div style={{marginBottom:14}}>
    {label&&<label style={{display:'block',fontSize:12,color:C.sub,marginBottom:6,fontWeight:600}}>{label}</label>}
    {rows?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{...style,resize:'vertical'}}/>:<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={style}/>}
  </div>;
}

// ===================== LOGIN PAGE =====================
function LoginPage({onLogin}) {
  const [email,setEmail]=useState('');const [pass,setPass]=useState('');const [err,setErr]=useState('');const [load,setLoad]=useState(false);
  function handleLogin(){
    if(!email||!pass){setErr('Please fill all fields');return;}
    setLoad(true);setTimeout(()=>{
      if(email==='teacher@eduai.com'&&pass==='demo123'){onLogin(email,pass);}
      else{setErr('Invalid credentials. Use demo account below.');setLoad(false);}
    },800);
  }
  return <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'"DM Sans",system-ui,sans-serif'}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0;}`}</style>
    <div style={{position:'absolute',inset:0,background:`radial-gradient(ellipse at 20% 50%, ${C.accent}08 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, ${C.blue}08 0%, transparent 60%)`}}/>
    <div style={{width:420,position:'relative',zIndex:1}}>
      <div style={{textAlign:'center',marginBottom:40}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:12,marginBottom:16}}>
          <div style={{background:C.accent,borderRadius:12,padding:10,display:'flex'}}><GraduationCap size={24} color="#000"/></div>
          <span style={{fontFamily:'"Playfair Display",serif',fontSize:32,fontWeight:700,color:C.text}}>EduAI</span>
        </div>
        <p style={{color:C.sub,fontSize:14}}>AI-Powered Teaching Management Platform</p>
      </div>
      <Card style={{padding:32}}>
        <h2 style={{fontSize:20,fontWeight:700,color:C.text,marginBottom:6,fontFamily:'"Playfair Display",serif'}}>Teacher Login</h2>
        <p style={{color:C.sub,fontSize:13,marginBottom:24}}>Sign in to access your dashboard</p>
        <Input label="Email Address" value={email} onChange={setEmail} placeholder="teacher@eduai.com" type="email"/>
        <Input label="Password" value={pass} onChange={setPass} placeholder="••••••••" type="password"/>
        {err&&<div style={{background:`${C.red}22`,border:`1px solid ${C.red}44`,borderRadius:8,padding:'10px 12px',color:C.red,fontSize:12,marginBottom:14}}>{err}</div>}
        <Btn onClick={handleLogin} full disabled={load} size="lg">{load?'Signing in...':'Sign In to EduAI'}</Btn>
        <div style={{marginTop:20,background:C.surface,borderRadius:8,padding:14,border:`1px dashed ${C.border}`}}>
          <div style={{fontSize:11,color:C.accent,fontWeight:600,marginBottom:6}}>DEMO CREDENTIALS</div>
          <div style={{fontSize:12,color:C.sub,display:'flex',flexDirection:'column',gap:4}}>
            <span>Email: <span style={{color:C.text,fontWeight:500}}>teacher@eduai.com</span></span>
            <span>Password: <span style={{color:C.text,fontWeight:500}}>demo123</span></span>
          </div>
          <Btn onClick={()=>{setEmail('teacher@eduai.com');setPass('demo123');}} variant="ghost" size="sm" style={{marginTop:8}}>Use Demo Account</Btn>
        </div>
      </Card>
    </div>
  </div>;
}

// ===================== SIDEBAR =====================
function Sidebar({module,setModule,onLogout,user}) {
  const nav=[{id:'dashboard',icon:Home,label:'Dashboard'},{id:'teaching',icon:BookOpen,label:'Teaching & Assessment'},{id:'curriculum',icon:Map,label:'Curriculum Design'},{id:'materials',icon:FileText,label:'Teaching Materials'},{id:'capstone',icon:Award,label:'Capstone Supervision'}];
  return <div style={{width:240,background:C.surface,borderRight:`1px solid ${C.border}`,display:'flex',flexDirection:'column',height:'100vh',flexShrink:0}}>
    <div style={{padding:'20px 16px 16px',borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{background:C.accent,borderRadius:8,padding:7,display:'flex'}}><GraduationCap size={18} color="#000"/></div>
        <span style={{fontFamily:'"Playfair Display",serif',fontSize:20,fontWeight:700,color:C.text}}>EduAI</span>
      </div>
      <div style={{fontSize:10,color:C.muted,marginTop:4,paddingLeft:2}}>AI Teaching Platform</div>
    </div>
    <nav style={{flex:1,padding:'12px 8px',overflowY:'auto'}}>
      {nav.map(n=>{const active=module===n.id;return <button key={n.id} onClick={()=>setModule(n.id)} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:8,border:'none',background:active?`${C.accent}18`:'transparent',color:active?C.accent:C.sub,fontWeight:active?600:400,cursor:'pointer',fontFamily:'inherit',fontSize:13,marginBottom:2,textAlign:'left',transition:'all 0.2s'}}><n.icon size={16}/>{n.label}{active&&<ChevronRight size={12} style={{marginLeft:'auto'}}/>}</button>;})}
    </nav>
    <div style={{padding:'12px 8px',borderTop:`1px solid ${C.border}`}}>
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',marginBottom:8}}>
        <div style={{width:32,height:32,borderRadius:'50%',background:C.accent,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#000'}}>{user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
        <div style={{overflow:'hidden'}}><div style={{fontSize:12,fontWeight:600,color:C.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.name}</div><div style={{fontSize:10,color:C.muted}}>Professor</div></div>
      </div>
      <button onClick={onLogout} style={{width:'100%',display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderRadius:8,border:'none',background:'transparent',color:C.red,cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:500}}><LogOut size={14}/>Sign Out</button>
    </div>
  </div>;
}

// ===================== TOPBAR =====================
function TopBar({user,module}) {
  const labels={dashboard:'Dashboard Overview',teaching:'Teaching & Assessment',curriculum:'Curriculum Design',materials:'Teaching Materials & Notes',capstone:'Capstone Supervision & Evaluation'};
  return <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:'12px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
    <div><h1 style={{fontSize:16,fontWeight:600,color:C.text}}>{labels[module]||module}</h1><p style={{fontSize:11,color:C.muted}}>Fall Semester 2025 — Department of CSE</p></div>
    <div style={{display:'flex',alignItems:'center',gap:12}}>
      <div style={{position:'relative'}}><Bell size={18} color={C.sub}/><span style={{position:'absolute',top:-3,right:-3,width:8,height:8,borderRadius:'50%',background:C.accent}}/></div>
      <div style={{fontSize:12,color:C.sub}}>{new Date().toLocaleDateString('en-BD',{weekday:'short',month:'short',day:'numeric'})}</div>
      <div style={{width:30,height:30,borderRadius:'50%',background:C.accent,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#000'}}>{user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
    </div>
  </div>;
}

// ===================== DASHBOARD =====================
function DashboardHome({grades,courses,projects,setModule}) {
  const aiTools=[{title:'Generate Quiz',desc:'Create quiz questions from any topic',icon:ClipboardList,color:C.accent,module:'teaching'},{title:'Draft Feedback',desc:'AI-assisted student feedback writing',icon:MessageCircle,color:C.blue,module:'teaching'},{title:'Notes Generator',desc:'Create lecture notes instantly with AI',icon:FileText,color:C.green,module:'materials'},{title:'Curriculum Gap Analysis',desc:'Analyze CLO-PLO alignment gaps',icon:Target,color:C.purple,module:'curriculum'},{title:'FAQ Generator',desc:'Auto-generate course FAQs with AI',icon:BookMarked,color:C.cyan,module:'materials'},{title:'Screen Proposals',desc:'AI-assisted capstone proposal review',icon:Eye,color:C.red,module:'capstone'}];
  const pending=grades.filter(g=>g.final===0).length;
  return <div>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
    <SectionHead title="Welcome back, Dr. Ahmed 👋" sub="Here's your teaching overview for this semester"/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
      <StatCard icon={Users} label="Total Students" value={grades.length} color={C.accent} sub="Across 2 courses"/>
      <StatCard icon={BookOpen} label="Active Courses" value={courses.length} color={C.blue} sub="Fall 2025"/>
      <StatCard icon={ClipboardList} label="Pending Grades" value={pending} color={pending>0?C.red:C.green} sub={pending>0?"Need attention":"All graded"}/>
      <StatCard icon={Award} label="Capstone Projects" value={projects.length} color={C.purple} sub="In supervision"/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:28}}>
      <div>
        <h3 style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:14,display:'flex',alignItems:'center',gap:8}}><Brain size={14} color={C.accent}/>Quick AI Tools</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {aiTools.map(t=><Card key={t.title} onClick={()=>setModule(t.module)} style={{cursor:'pointer',padding:14,transition:'all 0.2s',':hover':{borderColor:t.color}}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}><div style={{background:`${t.color}22`,borderRadius:6,padding:6,display:'flex'}}><t.icon size={14} color={t.color}/></div><span style={{fontSize:12,fontWeight:600,color:C.text}}>{t.title}</span></div>
            <p style={{fontSize:11,color:C.muted,lineHeight:1.4}}>{t.desc}</p>
          </Card>)}
        </div>
      </div>
      <div>
        <h3 style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:14,display:'flex',alignItems:'center',gap:8}}><TrendingUp size={14} color={C.blue}/>Capstone Progress</h3>
        {projects.map(p=><Card key={p.id} style={{marginBottom:10,padding:14}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
            <div><div style={{fontSize:12,fontWeight:600,color:C.text}}>{p.title}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{p.student}</div></div>
            <Tag label={p.status} color={p.status==='On Track'?C.green:C.accent}/>
          </div>
          <div style={{background:C.border,borderRadius:4,height:4,overflow:'hidden'}}><div style={{width:`${p.progress}%`,height:'100%',background:p.progress>60?C.green:C.accent,borderRadius:4}}/></div>
          <div style={{fontSize:10,color:C.muted,marginTop:4}}>{p.progress}% complete</div>
        </Card>)}
        <h3 style={{fontSize:14,fontWeight:600,color:C.text,marginTop:16,marginBottom:14,display:'flex',alignItems:'center',gap:8}}><BookOpen size={14} color={C.green}/>Courses This Semester</h3>
        {courses.map(c=><Card key={c.id} style={{marginBottom:10,padding:14}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><span style={{fontSize:12,fontWeight:700,color:C.accent}}>{c.code}</span><span style={{fontSize:12,color:C.text,marginLeft:8}}>{c.name}</span></div>
            <Tag label={`${c.students} students`} color={C.blue}/>
          </div>
        </Card>)}
      </div>
    </div>
  </div>;
}

// ===================== TEACHING MODULE =====================
function TeachingModule({grades,setGrades,courses}) {
  const [tab,setTab]=useState('quiz');
  const tabs=[{id:'quiz',icon:ClipboardList,label:'Quiz Generator'},{id:'gradebook',icon:BarChart3,label:'Grade Book'},{id:'grader',icon:CheckSquare,label:'AI Grader'},{id:'feedback',icon:MessageCircle,label:'Feedback Generator'},{id:'analytics',icon:TrendingUp,label:'Learning Analytics'}];
  return <div><SectionHead title="Teaching & Assessment" sub="Manage evaluations, grades, and AI-powered tools"/><TabBar tabs={tabs} active={tab} setActive={setTab}/>
    {tab==='quiz'&&<QuizGen courses={courses}/>}
    {tab==='gradebook'&&<GradeBook grades={grades} setGrades={setGrades}/>}
    {tab==='grader'&&<AIGrader/>}
    {tab==='feedback'&&<FeedbackGen/>}
    {tab==='analytics'&&<Analytics grades={grades}/>}
  </div>;
}

function QuizGen({courses}) {
  return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
    <AIBox title="Multiple Choice Quiz Generator" placeholder="Enter topic, CLO, or paste content to generate MCQ quiz questions..." buildPrompt={inp=>`Generate 5 multiple choice quiz questions for university level about: ${inp}. Format each question with: Question, A) B) C) D) options, and **Answer: X** at the end. Make them academically rigorous.`} resultLabel="Generated Quiz Questions"/>
    <AIBox title="Short Answer / Essay Questions" placeholder="Enter topic or learning outcome for short answer questions..." buildPrompt={inp=>`Generate 4 short-answer and essay questions for university-level assessment on: ${inp}. Include: question, expected answer key points (3-5 bullet points each), and marks allocation. Make them test higher-order thinking (analysis, synthesis, evaluation).`} resultLabel="Generated Questions"/>
    <AIBox title="True/False & Fill-in-the-Blank" placeholder="Enter topic for True/False and fill-in-the-blank questions..." buildPrompt={inp=>`Create 6 True/False questions and 4 fill-in-the-blank questions for: ${inp}. For True/False, provide the answer. For fill-in-the-blank, provide the correct word/phrase in brackets.`} resultLabel="Generated Questions"/>
    <AIBox title="Case Study / Scenario Questions" placeholder="Enter subject area for scenario-based questions..." buildPrompt={inp=>`Create a real-world scenario/case study and 3 analytical questions related to: ${inp}. The scenario should be relevant to industry practice. Include evaluation criteria for each question.`} resultLabel="Case Study & Questions"/>
  </div>;
}

function GradeBook({grades,setGrades}) {
  const [modal,setModal]=useState(false);const [edit,setEdit]=useState(null);
  const [form,setForm]=useState({student:'',sid:'',quiz1:0,quiz2:0,mid:0,assign:0,final:0});
  function openAdd(){setForm({student:'',sid:'',quiz1:0,quiz2:0,mid:0,assign:0,final:0});setEdit(null);setModal(true);}
  function openEdit(g){setForm({...g});setEdit(g.id);setModal(true);}
  function calcGrade(f){const t=(+f.quiz1+f.quiz2)*0.1+(+f.assign)*0.2+(+f.mid)*0.3+(+f.final)*0.4;if(t>=90)return'A+';if(t>=85)return'A';if(t>=80)return'A-';if(t>=75)return'B+';if(t>=70)return'B';if(t>=65)return'B-';if(t>=60)return'C+';if(t>=55)return'C';if(t>=50)return'D';return'F';}
  function save(){const g=calcGrade(form);if(edit){setGrades(grades.map(x=>x.id===edit?{...form,grade:g}:x));}else{setGrades([...grades,{...form,id:Date.now(),grade:g}]);}setModal(false);}
  function del(id){setGrades(grades.filter(g=>g.id!==id));}
  const avg=g=>((+g.quiz1+g.quiz2)*0.1+(+g.assign)*0.2+(+g.mid)*0.3+(+g.final)*0.4).toFixed(1);
  return <div>
    <div style={{display:'flex',justifyContent:'flex-end',marginBottom:16}}><Btn onClick={openAdd} icon={Plus}>Add Student</Btn></div>
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
        <thead><tr style={{background:C.surface}}>
          {['Student Name','Student ID','Quiz 1','Quiz 2','Assignment','Mid Term','Final','Total%','Grade','Actions'].map(h=><th key={h} style={{padding:'10px 12px',textAlign:'left',color:C.muted,fontWeight:600,borderBottom:`1px solid ${C.border}`,whiteSpace:'nowrap'}}>{h}</th>)}
        </tr></thead>
        <tbody>{grades.map((g,i)=><tr key={g.id} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?C.card:C.surface}}>
          <td style={{padding:'10px 12px',color:C.text,fontWeight:500}}>{g.student}</td>
          <td style={{padding:'10px 12px',color:C.muted}}>{g.sid}</td>
          <td style={{padding:'10px 12px',color:C.text}}>{g.quiz1}</td>
          <td style={{padding:'10px 12px',color:C.text}}>{g.quiz2}</td>
          <td style={{padding:'10px 12px',color:C.text}}>{g.assign}</td>
          <td style={{padding:'10px 12px',color:C.text}}>{g.mid}</td>
          <td style={{padding:'10px 12px',color:g.final===0?C.red:C.text}}>{g.final===0?'—':g.final}</td>
          <td style={{padding:'10px 12px'}}><span style={{fontWeight:700,color:+avg(g)>=70?C.green:+avg(g)>=50?C.accent:C.red}}>{avg(g)}%</span></td>
          <td style={{padding:'10px 12px'}}><Tag label={g.grade} color={g.grade.startsWith('A')?C.green:g.grade.startsWith('B')?C.blue:g.grade.startsWith('C')?C.accent:C.red}/></td>
          <td style={{padding:'10px 12px'}}><div style={{display:'flex',gap:8}}><button onClick={()=>openEdit(g)} style={{background:'none',border:'none',color:C.blue,cursor:'pointer'}}><Edit3 size={13}/></button><button onClick={()=>del(g.id)} style={{background:'none',border:'none',color:C.red,cursor:'pointer'}}><Trash2 size={13} /></button></div></td>
        </tr>)}</tbody>
      </table>
    </div>
    <div style={{display:'flex',gap:16,marginTop:16,padding:'14px 16px',background:C.surface,borderRadius:8,border:`1px solid ${C.border}`}}>
      <span style={{fontSize:12,color:C.muted}}>Class Average: <strong style={{color:C.text}}>{grades.length?(grades.reduce((s,g)=>s+parseFloat(avg(g)),0)/grades.length).toFixed(1):0}%</strong></span>
      <span style={{fontSize:12,color:C.muted}}>Students: <strong style={{color:C.text}}>{grades.length}</strong></span>
      <span style={{fontSize:12,color:C.muted}}>Pending Finals: <strong style={{color:C.red}}>{grades.filter(g=>g.final===0).length}</strong></span>
    </div>
    <Modal open={modal} onClose={()=>setModal(false)} title={edit?"Edit Student Record":"Add Student Record"} width={480}>
      <Input label="Student Name" value={form.student} onChange={v=>setForm({...form,student:v})} placeholder="Full name"/>
      <Input label="Student ID" value={form.sid} onChange={v=>setForm({...form,sid:v})} placeholder="e.g. CSE2101"/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Input label="Quiz 1 (out of 100)" value={form.quiz1} onChange={v=>setForm({...form,quiz1:v})} type="number"/>
        <Input label="Quiz 2 (out of 100)" value={form.quiz2} onChange={v=>setForm({...form,quiz2:v})} type="number"/>
        <Input label="Assignment (out of 100)" value={form.assign} onChange={v=>setForm({...form,assign:v})} type="number"/>
        <Input label="Mid Term (out of 100)" value={form.mid} onChange={v=>setForm({...form,mid:v})} type="number"/>
        <Input label="Final Exam (out of 100)" value={form.final} onChange={v=>setForm({...form,final:v})} type="number"/>
        <div style={{display:'flex',alignItems:'flex-end',paddingBottom:14}}><div style={{padding:'10px 12px',background:C.surface,borderRadius:8,fontSize:13,color:C.text,width:'100%',border:`1px solid ${C.border}`}}>Grade: <strong style={{color:C.accent}}>{calcGrade(form)}</strong></div></div>
      </div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:8}}>
        <Btn onClick={()=>setModal(false)} variant="ghost">Cancel</Btn>
        <Btn onClick={save} icon={Save}>Save Record</Btn>
      </div>
    </Modal>
  </div>;
}

function AIGrader() {
  return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
    <AIBox title="Assignment / Essay Grader" placeholder="Paste the marking rubric criteria, then the student's submission..." buildPrompt={inp=>`As a university professor, evaluate and grade this student submission. Provide: 1) Overall grade/score with justification, 2) Strengths (3-4 points), 3) Areas for improvement (3-4 points), 4) Specific feedback on each rubric criterion, 5) Suggestions for revision. Be constructive and academically rigorous.\n\nSubmission/Rubric:\n${inp}`} resultLabel="Grading Feedback"/>
    <AIBox title="MCQ Auto-Score Helper" placeholder="Paste MCQ answer key followed by student answers (e.g., Key: ABCD... | Student: ABDC...)..." buildPrompt={inp=>`Evaluate these MCQ answers. Compare the answer key with student answers and: 1) Calculate total score, 2) List which questions were wrong, 3) Identify topic gaps based on errors, 4) Suggest study areas. Format clearly.\n\n${inp}`} resultLabel="Score Analysis"/>
    <AIBox title="Recheck / Resubmission Review" placeholder="Paste the original feedback and student's resubmission for re-evaluation..." buildPrompt={inp=>`Review this resubmission compared to original feedback. Assess: 1) Did the student address previous feedback? 2) What improvements were made? 3) What still needs work? 4) Revised grade with justification. Be fair and thorough.\n\n${inp}`} resultLabel="Recheck Assessment"/>
    <AIBox title="Plagiarism Pattern Detection" placeholder="Paste student submission to analyze for suspicious writing patterns..." buildPrompt={inp=>`Analyze this academic submission for: 1) Unusual writing style inconsistencies, 2) Abrupt topic transitions, 3) Mixing of citation styles, 4) Vocabulary inconsistencies, 5) Structural anomalies. Rate suspicion level (Low/Medium/High) with specific observations. Note: This is a pattern analysis, not a definitive plagiarism check.\n\n${inp}`} resultLabel="Pattern Analysis"/>
  </div>;
}

function FeedbackGen() {
  return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
    <AIBox title="Individual Student Feedback" placeholder="Describe the student's performance, strengths, and areas to improve..." buildPrompt={inp=>`Write constructive, encouraging academic feedback for a university student based on: ${inp}. Structure it as: 1) Opening acknowledgment, 2) Specific strengths observed, 3) Areas for improvement with actionable advice, 4) Encouraging closing statement. Keep it professional, empathetic, and motivating.`} resultLabel="Generated Feedback"/>
    <AIBox title="Class-Wide Announcement" placeholder="Describe common mistakes or patterns observed across the class..." buildPrompt={inp=>`Write a professional class-wide feedback announcement for students based on: ${inp}. Include: 1) General performance summary, 2) Common strengths, 3) Common mistakes to avoid, 4) Specific improvement strategies, 5) Next steps. Tone should be encouraging but clear.`} resultLabel="Class Announcement"/>
    <AIBox title="Assessment Query Response" placeholder="Paste the student's query about their marks or assessment..." buildPrompt={inp=>`Draft a professional, empathetic response to this student assessment query: ${inp}. The response should: 1) Acknowledge their concern, 2) Explain the evaluation criteria clearly, 3) Provide specific reasons for the grade given, 4) Offer constructive path forward. Be respectful and fair.`} resultLabel="Response Draft"/>
    <AIBox title="Progress Report Generator" placeholder="List key observations about student performance over the semester..." buildPrompt={inp=>`Write a comprehensive semester progress report for a student based on: ${inp}. Include sections: Academic Performance, Participation & Engagement, Skills Development, Areas of Excellence, Areas Needing Improvement, and Recommendations for Next Semester. Make it suitable for official records.`} resultLabel="Progress Report"/>
  </div>;
}

function Analytics({grades}) {
  const avg=g=>((+g.quiz1+g.quiz2)*0.1+(+g.assign)*0.2+(+g.mid)*0.3+(+g.final)*0.4);
  const dist={'A+':0,'A':0,'A-':0,'B+':0,'B':0,'B-':0,'C+':0,'C':0,'D':0,'F':0};
  grades.forEach(g=>dist[g.grade]=(dist[g.grade]||0)+1);
  const barColors={'A+':C.green,'A':C.green,'A-':C.green,'B+':C.blue,'B':C.blue,'B-':C.blue,'C+':C.accent,'C':C.accent,'D':C.red,'F':C.red};
  const max=Math.max(...Object.values(dist),1);
  return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
    <Card>
      <h3 style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:16}}>Grade Distribution</h3>
      {Object.entries(dist).filter(([,v])=>v>0).map(([g,n])=><div key={g} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
        <span style={{fontSize:12,color:C.muted,width:24}}>{g}</span>
        <div style={{flex:1,background:C.border,borderRadius:4,height:20,overflow:'hidden'}}><div style={{width:`${(n/max)*100}%`,height:'100%',background:barColors[g]||C.accent,borderRadius:4,display:'flex',alignItems:'center',paddingLeft:6}}><span style={{fontSize:10,color:'#fff',fontWeight:600}}>{n}</span></div></div>
        <span style={{fontSize:11,color:C.muted}}>{n} student{n!==1?'s':''}</span>
      </div>)}
    </Card>
    <Card>
      <h3 style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:16}}>Student Performance Overview</h3>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {grades.sort((a,b)=>avg(b)-avg(a)).map(g=><div key={g.id} style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:11,color:C.muted,width:90,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{g.student.split(' ')[0]}</span>
          <div style={{flex:1,background:C.border,borderRadius:4,height:16,overflow:'hidden'}}><div style={{width:`${avg(g)}%`,height:'100%',background:avg(g)>=70?C.green:avg(g)>=50?C.accent:C.red,borderRadius:4}}/></div>
          <span style={{fontSize:11,color:C.text,width:40,textAlign:'right',fontWeight:600}}>{avg(g).toFixed(0)}%</span>
          <Tag label={g.grade} color={barColors[g.grade]||C.accent}/>
        </div>)}
      </div>
    </Card>
    <Card style={{gridColumn:'span 2'}}>
      <AIBox title="AI Learning Analytics Insights" placeholder="Describe patterns you've noticed or paste student performance data for analysis..." buildPrompt={inp=>`As an educational analytics expert, analyze these student performance insights and provide: 1) Key performance trends, 2) At-risk student identification strategies, 3) Content areas with low performance, 4) Recommended interventions, 5) Teaching strategy adjustments. Data: ${inp}`} resultLabel="Analytics Insights"/>
    </Card>
  </div>;
}

// ===================== CURRICULUM MODULE =====================
function CurriculumModule({courses,setCourses}) {
  const [tab,setTab]=useState('mapping');
  const tabs=[{id:'mapping',icon:Map,label:'CLO-PLO Mapping'},{id:'syllabus',icon:FileText,label:'Syllabus Manager'},{id:'gap',icon:Target,label:'Gap Analyzer'},{id:'trends',icon:TrendingUp,label:'Trend Analysis'}];
  return <div><SectionHead title="Curriculum Design & Update" sub="Manage learning outcomes, syllabi, and curriculum alignment"/><TabBar tabs={tabs} active={tab} setActive={setTab}/>
    {tab==='mapping'&&<CLOPLOMapper courses={courses}/>}
    {tab==='syllabus'&&<SyllabusManager courses={courses} setCourses={setCourses}/>}
    {tab==='gap'&&<GapAnalyzer/>}
    {tab==='trends'&&<TrendAnalyzer/>}
  </div>;
}

function CLOPLOMapper({courses}) {
  const [sel,setSel]=useState(courses[0]?.id||null);
  const course=courses.find(c=>c.id===sel);
  const plos=['PLO1: Apply CS fundamentals','PLO2: Design complex systems','PLO3: Problem-solving','PLO4: Communication','PLO5: Ethics & social impact','PLO6: Lifelong learning','PLO7: Teamwork'];
  return <div>
    <div style={{marginBottom:20}}>
      <select value={sel} onChange={e=>setSel(+e.target.value)} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:'10px 14px',color:C.text,fontSize:13,fontFamily:'inherit',cursor:'pointer',outline:'none'}}>
        {courses.map(c=><option key={c.id} value={c.id}>{c.code}: {c.name}</option>)}
      </select>
    </div>
    {course&&<div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
        <Card>
          <h3 style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:14}}>Course Learning Outcomes (CLOs)</h3>
          {course.clos.map((clo,i)=><div key={i} style={{padding:'10px 12px',background:C.surface,borderRadius:8,marginBottom:8,fontSize:12,color:C.text,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.accent}`}}><span style={{color:C.accent,fontWeight:700}}>CLO{i+1}</span> — {clo.replace(/^CLO\d+:\s*/,'')}</div>)}
        </Card>
        <Card>
          <h3 style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:14}}>Program Learning Outcomes (PLOs)</h3>
          {plos.map((plo,i)=>{const key=`PLO${i+1}`;const mapped=Object.values(course.mapping||{}).some(v=>v.includes(key));return <div key={i} style={{padding:'10px 12px',background:mapped?`${C.green}15`:C.surface,borderRadius:8,marginBottom:8,fontSize:12,color:mapped?C.text:C.muted,border:`1px solid ${mapped?C.green+'44':C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}><span>{plo}</span>{mapped&&<CheckCircle size={13} color={C.green}/>}</div>;})}
        </Card>
      </div>
      <Card>
        <h3 style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:14}}>CLO-PLO Mapping Matrix</h3>
        <div style={{overflowX:'auto'}}>
          <table style={{borderCollapse:'collapse',fontSize:11,width:'100%'}}>
            <thead><tr><th style={{padding:'8px 12px',textAlign:'left',color:C.muted,borderBottom:`1px solid ${C.border}`,minWidth:120}}>CLO</th>{plos.map((_,i)=><th key={i} style={{padding:'8px 10px',color:C.muted,borderBottom:`1px solid ${C.border}`,textAlign:'center',whiteSpace:'nowrap'}}>PLO{i+1}</th>)}</tr></thead>
            <tbody>{course.clos.map((clo,ci)=><tr key={ci} style={{borderBottom:`1px solid ${C.border}`}}>
              <td style={{padding:'8px 12px',color:C.text,fontWeight:500}}>CLO{ci+1}</td>
              {plos.map((_,pi)=>{const mapped=(course.mapping?.[`CLO${ci+1}`]||'').includes(`PLO${pi+1}`);return <td key={pi} style={{textAlign:'center',padding:'8px 10px'}}>{mapped?<div style={{width:18,height:18,background:C.green,borderRadius:4,display:'inline-flex',alignItems:'center',justifyContent:'center'}}><CheckCircle size={10} color="#fff"/></div>:<div style={{width:18,height:18,background:C.border,borderRadius:4,display:'inline-block'}}/>}</td>;})}
            </tr>)}</tbody>
          </table>
        </div>
      </Card>
    </div>}
  </div>;
}

function SyllabusManager({courses,setCourses}) {
  const [sel,setSel]=useState(courses[0]?.id||null);const [editing,setEditing]=useState(false);
  const course=courses.find(c=>c.id===sel);
  const [form,setForm]=useState({});
  function startEdit(){setForm({...course});setEditing(true);}
  function save(){setCourses(courses.map(c=>c.id===sel?{...c,...form}:c));setEditing(false);}
  return <div>
    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
      <select value={sel} onChange={e=>setSel(+e.target.value)} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:'10px 14px',color:C.text,fontSize:13,fontFamily:'inherit',cursor:'pointer',outline:'none'}}>
        {courses.map(c=><option key={c.id} value={c.id}>{c.code}: {c.name}</option>)}
      </select>
      {!editing&&<Btn onClick={startEdit} icon={Edit3} variant="secondary" size="sm">Edit Syllabus</Btn>}
      {editing&&<><Btn onClick={save} icon={Save} size="sm">Save Changes</Btn><Btn onClick={()=>setEditing(false)} variant="ghost" size="sm">Cancel</Btn></>}
    </div>
    {course&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
      <Card><h4 style={{fontSize:13,fontWeight:600,color:C.accent,marginBottom:12}}>Course Information</h4>
        {editing?<><Input label="Course Code" value={form.code} onChange={v=>setForm({...form,code:v})}/><Input label="Course Name" value={form.name} onChange={v=>setForm({...form,name:v})}/><Input label="Credits" value={form.credits} onChange={v=>setForm({...form,credits:v})} type="number"/><Input label="Semester" value={form.semester} onChange={v=>setForm({...form,semester:v})}/></>
        :<div style={{fontSize:12,color:C.sub,display:'flex',flexDirection:'column',gap:8}}><div><span style={{color:C.muted}}>Code: </span><strong style={{color:C.text}}>{course.code}</strong></div><div><span style={{color:C.muted}}>Name: </span><strong style={{color:C.text}}>{course.name}</strong></div><div><span style={{color:C.muted}}>Credits: </span><strong style={{color:C.text}}>{course.credits} credit hours</strong></div><div><span style={{color:C.muted}}>Semester: </span><strong style={{color:C.text}}>{course.semester}</strong></div><div><span style={{color:C.muted}}>Students: </span><strong style={{color:C.text}}>{course.students}</strong></div></div>}
      </Card>
      <Card><h4 style={{fontSize:13,fontWeight:600,color:C.accent,marginBottom:12}}>Course Learning Outcomes</h4>
        {course.clos.map((clo,i)=><div key={i} style={{padding:'8px 10px',background:C.surface,borderRadius:6,marginBottom:6,fontSize:12,color:C.sub,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.accent}`}}>{clo}</div>)}
      </Card>
      <Card style={{gridColumn:'span 2'}}><AIBox title="AI-Assisted Syllabus Update Suggestions" placeholder="Describe your course and ask for syllabus update suggestions based on latest industry trends..." buildPrompt={inp=>`As a curriculum expert, provide suggestions to update and improve this course syllabus: ${inp}. Include: 1) Outdated content to replace, 2) New topics to add reflecting industry trends, 3) Suggested CLO improvements, 4) Recommended learning activities, 5) Modern assessment methods. Be specific and practical.`} resultLabel="Syllabus Improvement Suggestions"/></Card>
    </div>}
  </div>;
}

function GapAnalyzer() {
  return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
    <AIBox title="CLO-PLO Gap Analysis" placeholder="Paste your CLOs and PLOs mapping to analyze coverage gaps..." buildPrompt={inp=>`Perform a comprehensive CLO-PLO alignment gap analysis for: ${inp}. Identify: 1) PLOs with insufficient CLO coverage, 2) CLOs not aligned to any PLO, 3) Over-emphasized areas, 4) Missing competency areas, 5) Specific recommendations to close gaps. Use a structured format with tables where helpful.`} resultLabel="Gap Analysis Report"/>
    <AIBox title="Curriculum Benchmarking" placeholder="Describe your curriculum or course. Specify field, level, and what you want to benchmark against..." buildPrompt={inp=>`Benchmark this curriculum against international standards and best practices: ${inp}. Compare with: 1) Top global university curricula in this field, 2) Industry certification requirements, 3) Accreditation body standards (e.g., ABET, ACM), 4) Emerging skill requirements. Provide specific recommendations for improvement.`} resultLabel="Benchmarking Report"/>
    <AIBox title="Accreditation Readiness Check" placeholder="Describe your program's current state and target accreditation (e.g., ABET, NBA)..." buildPrompt={inp=>`Assess accreditation readiness for: ${inp}. Evaluate: 1) Documentation completeness, 2) PLO assessment strategies, 3) Continuous improvement processes, 4) Industry engagement evidence, 5) Faculty qualifications alignment. Identify gaps and suggest remediation steps for each criterion.`} resultLabel="Accreditation Assessment"/>
    <AIBox title="Version History & Change Documentation" placeholder="Describe curriculum changes made and the rationale for documentation..." buildPrompt={inp=>`Generate a formal curriculum change documentation record for: ${inp}. Format as: 1) Summary of Changes, 2) Rationale for each change, 3) Impact Assessment, 4) Stakeholder Approval status, 5) Implementation timeline, 6) Compliance notes. Make it suitable for official university records.`} resultLabel="Change Documentation"/>
  </div>;
}

function TrendAnalyzer() {
  return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
    <AIBox title="Emerging Technology Trends" placeholder="Enter your field/discipline to analyze emerging tech trends relevant to curriculum..." buildPrompt={inp=>`Analyze the top emerging technology trends relevant to ${inp} that should be incorporated into university curriculum by 2025-2026. Cover: 1) Key technologies gaining industry traction, 2) Specific skills in demand, 3) Suggested new course topics or modules, 4) Industry partnerships to seek, 5) Learning resources and labs needed.`} resultLabel="Technology Trend Report"/>
    <AIBox title="Industry Skill Gap Analysis" placeholder="Enter job roles or industry sector to analyze skill gaps in graduates..." buildPrompt={inp=>`Analyze the skill gap between typical university graduates and industry requirements for ${inp}. Based on current hiring trends: 1) Top 10 most demanded skills, 2) Skills typically missing from graduates, 3) Soft skills gap, 4) Recommended curriculum additions, 5) Suggested project/internship formats to bridge gaps.`} resultLabel="Skill Gap Report"/>
    <AIBox title="Research Trend Integration" placeholder="Enter your research field or department to integrate research trends into teaching..." buildPrompt={inp=>`Identify how current research trends in ${inp} can be integrated into undergraduate/graduate teaching. Suggest: 1) Research-informed topics for curriculum, 2) Student research project ideas, 3) Industry-academia collaboration opportunities, 4) Lab or simulation requirements, 5) Guest lecture topics from industry researchers.`} resultLabel="Research Integration Plan"/>
    <AIBox title="Global Curriculum Comparison" placeholder="Enter your program type and region to compare with global standards..." buildPrompt={inp=>`Compare ${inp} curriculum with global best practices from MIT, Stanford, IIT, and other top universities. Analyze: 1) Core differences in course structure, 2) Unique elective offerings abroad, 3) Capstone/project requirements comparison, 4) Assessment method differences, 5) Specific improvements to adopt for global competitiveness.`} resultLabel="Global Comparison Report"/>
  </div>;
}

// ===================== MATERIALS MODULE =====================
function MaterialsModule({materials,setMaterials}) {
  const [tab,setTab]=useState('notes');
  const tabs=[{id:'notes',icon:PenTool,label:'Notes Generator'},{id:'faq',icon:MessageCircle,label:'FAQ Generator'},{id:'library',icon:Archive,label:'Resource Library'},{id:'reading',icon:BookMarked,label:'Reading Lists'}];
  return <div><SectionHead title="Teaching Materials, Notes & FAQs" sub="Create, organize, and manage all teaching resources"/><TabBar tabs={tabs} active={tab} setActive={setTab}/>
    {tab==='notes'&&<NotesGen/>}
    {tab==='faq'&&<FAQGen/>}
    {tab==='library'&&<ResourceLib materials={materials} setMaterials={setMaterials}/>}
    {tab==='reading'&&<ReadingLists/>}
  </div>;
}

function NotesGen() {
  return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
    <AIBox title="Lecture Notes Generator" placeholder="Enter lecture topic, week number, and key concepts to cover..." buildPrompt={inp=>`Create comprehensive university-level lecture notes for: ${inp}. Structure as: 1) Learning Objectives (3-5 points), 2) Introduction & Background, 3) Main Content (with subheadings, examples, diagrams description), 4) Key Concepts Summary box, 5) Real-world applications, 6) Discussion Questions, 7) References & Further Reading. Use clear academic language.`} resultLabel="Generated Lecture Notes"/>
    <AIBox title="Lab Manual / Practical Guide" placeholder="Enter lab topic, required tools, and experiment objectives..." buildPrompt={inp=>`Create a detailed lab manual for: ${inp}. Include: 1) Lab Title & Objectives, 2) Background Theory, 3) Required Materials/Tools/Software, 4) Safety Precautions, 5) Step-by-Step Procedure, 6) Expected Results, 7) Data Recording Tables, 8) Analysis Questions, 9) Report Submission Guidelines. Format for student use.`} resultLabel="Lab Manual"/>
    <AIBox title="Summary & Cheat Sheet" placeholder="Enter topic or chapter name to create a concise summary/cheat sheet..." buildPrompt={inp=>`Create a comprehensive but concise cheat sheet/quick reference guide for: ${inp}. Include: key formulas, important definitions, core concepts in bullet points, common mistakes to avoid, mnemonic devices if applicable, and quick examples. Format for easy printing on one page.`} resultLabel="Summary Cheat Sheet"/>
    <AIBox title="Course Handout Creator" placeholder="Describe the topic and type of handout needed (e.g., problem set, worksheet)..." buildPrompt={inp=>`Create a well-structured course handout for: ${inp}. Include: 1) Topic overview, 2) Key terms glossary, 3) Worked examples with step-by-step solutions, 4) Practice problems (easy to hard), 5) Extension challenges, 6) Tips and common pitfalls. Make it print-ready and student-friendly.`} resultLabel="Course Handout"/>
  </div>;
}

function FAQGen() {
  return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
    <AIBox title="Course FAQ Generator" placeholder="Describe your course and common student concerns or struggles..." buildPrompt={inp=>`Generate a comprehensive FAQ document for a university course about: ${inp}. Create 15 realistic questions students commonly ask, organized by category: Assessment & Grading, Course Content, Submission & Deadlines, Resources & Support, and Course Policies. Provide clear, helpful answers for each.`} resultLabel="Generated FAQ"/>
    <AIBox title="Assignment FAQ" placeholder="Describe the assignment details and common student confusion points..." buildPrompt={inp=>`Generate a targeted FAQ for this specific assignment: ${inp}. Include 10 specific questions students typically ask about: task requirements, format & length, submission process, citation style, allowed resources, grading breakdown, and clarification on ambiguous parts. Provide precise, helpful answers.`} resultLabel="Assignment FAQ"/>
    <AIBox title="Chatbot Script Generator" placeholder="Enter course name and main topics for automated student query responses..." buildPrompt={inp=>`Create a chatbot response script for a university course on: ${inp}. Generate 20 Q&A pairs for automated student support covering: registration, prerequisites, office hours, exam dates, grading policy, late submission policy, academic integrity, and technical support. Format as Q: / A: pairs for easy implementation.`} resultLabel="Chatbot Script"/>
    <AIBox title="Semester Start FAQ Pack" placeholder="Enter course name, key policies, and semester dates for a complete FAQ pack..." buildPrompt={inp=>`Create a comprehensive First Week FAQ pack for: ${inp}. Cover everything a student needs at semester start: 1) How to access course materials, 2) Communication channels, 3) Assessment schedule overview, 4) Group work policy, 5) Lab/Tutorial schedule, 6) Academic support resources, 7) Important deadlines calendar. Make it welcoming and informative.`} resultLabel="Semester FAQ Pack"/>
  </div>;
}

function ResourceLib({materials,setMaterials}) {
  const [modal,setModal]=useState(false);
  const [viewer,setViewer]=useState(null);
  const [form,setForm]=useState({
    title:'',
    course:'',
    type:'Lecture Notes',
    date:'',
    notes:'',
    file:null,
    fileName:'',
    fileUrl:'',
    fileType:''
  });

  const types=['Lecture Slides','Lecture Notes','Reading List','Lab Manual','Assignment Brief','Video Link','External Resource'];
  const typeColor={['Lecture Slides']:C.blue,['Lecture Notes']:C.green,['Reading List']:C.purple,['Lab Manual']:C.cyan,['Assignment Brief']:C.accent,['Video Link']:C.red,['External Resource']:C.muted};

  function guessKind(file){
    const name = (file?.name || '').toLowerCase();
    const mime = (file?.type || '').toLowerCase();
    if (mime.includes('pdf') || name.endsWith('.pdf')) return 'pdf';
    if (mime.includes('presentation') || mime.includes('powerpoint') || name.endsWith('.pptx') || name.endsWith('.ppt')) return 'pptx';
    return 'other';
  }

  function onPickFile(file){
    if(!file) return;
    const url = URL.createObjectURL(file);
    setForm(prev => ({
      ...prev,
      file,
      fileName: file.name,
      fileUrl: url,
      fileType: guessKind(file)
    }));
  }

  function resetForm(){
    if(form.fileUrl) URL.revokeObjectURL(form.fileUrl);
    setForm({title:'',course:'',type:'Lecture Notes',date:'',notes:'',file:null,fileName:'',fileUrl:'',fileType:''});
  }

  function add(){
    const item = {
      ...form,
      id: Date.now(),
      size: form.file ? `${Math.max(1, Math.round(form.file.size/1024))} KB` : 'N/A',
      date: form.date || new Date().toISOString().split('T')[0],
      fileName: form.fileName || '',
      fileUrl: form.fileUrl || '',
      fileType: form.fileType || '',
      contentType: form.fileType || '',
    };
    setMaterials([...materials,item]);
    setModal(false);
    setForm({title:'',course:'',type:'Lecture Notes',date:'',notes:'',file:null,fileName:'',fileUrl:'',fileType:''});
  }

  function del(id){setMaterials(materials.filter(m=>m.id!==id));}

  function openResource(m){
    setViewer(m);
  }

  function closeViewer(){
    setViewer(null);
  }

  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:16}}>
      <div style={{color:C.sub,fontSize:12}}>Upload lecture slides, PDFs, notes, and other teaching resources. Click a card to preview.</div>
      <Btn onClick={()=>setModal(true)} icon={Plus}>Add Resource</Btn>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
      {materials.map(m=>(
        <Card key={m.id} style={{padding:14,position:'relative'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8,gap:8}}>
            <Tag label={m.type} color={typeColor[m.type]||C.muted}/>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <button
                onClick={()=>openResource(m)}
                title="View resource"
                style={{background:'none',border:'none',color:C.accent,cursor:'pointer',display:'flex',alignItems:'center',gap:4}}
              >
                <Eye size={12} />
              </button>
              <button onClick={()=>del(m.id)} style={{background:'none',border:'none',color:C.red,cursor:'pointer'}}>
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          <button
            onClick={()=>openResource(m)}
            style={{
              width:'100%',
              textAlign:'left',
              background:'transparent',
              border:'none',
              padding:0,
              cursor:'pointer'
            }}
          >
            <h4 style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:6,lineHeight:1.3}}>
              {m.title}
            </h4>
            <div style={{fontSize:11,color:C.muted}}>{m.course}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:4}}>Added: {m.date}</div>
            {(m.fileName || m.size !== 'N/A') && (
              <div style={{fontSize:11,color:C.sub,marginTop:6,display:'flex',flexDirection:'column',gap:3}}>
                {m.fileName && <span>File: {m.fileName}</span>}
                {m.size && <span>Size: {m.size}</span>}
              </div>
            )}
          </button>
        </Card>
      ))}
    </div>

    <Modal open={modal} onClose={()=>{setModal(false);resetForm();}} title="Add Teaching Resource" width={520}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Input label="Resource Title" value={form.title} onChange={v=>setForm({...form,title:v})} placeholder="e.g. Week 3 - Neural Networks Slides"/>
        <Input label="Course Code / Name" value={form.course} onChange={v=>setForm({...form,course:v})} placeholder="e.g. CSE401"/>
      </div>

      <div style={{marginBottom:14}}>
        <label style={{display:'block',fontSize:12,color:C.sub,marginBottom:6,fontWeight:600}}>Resource Type</label>
        <select
          value={form.type}
          onChange={e=>setForm({...form,type:e.target.value})}
          style={{width:'100%',background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:'10px 12px',color:C.text,fontSize:13,fontFamily:'inherit',outline:'none'}}
        >
          {types.map(t=><option key={t}>{t}</option>)}
        </select>
      </div>

      <Input label="Date" value={form.date} onChange={v=>setForm({...form,date:v})} type="date"/>

      <div style={{marginBottom:14}}>
        <label style={{display:'block',fontSize:12,color:C.sub,marginBottom:6,fontWeight:600}}>Upload File (PDF / PPT / PPTX)</label>
        <input
          type="file"
          accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          onChange={e=>onPickFile(e.target.files?.[0])}
          style={{width:'100%',background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:'10px 12px',color:C.text,fontSize:13,fontFamily:'inherit',outline:'none'}}
        />
        <div style={{fontSize:11,color:C.muted,marginTop:6}}>
          {form.fileName ? `Selected: ${form.fileName}` : 'No file selected yet.'}
        </div>
      </div>

      <div style={{marginBottom:14}}>
        <label style={{display:'block',fontSize:12,color:C.sub,marginBottom:6,fontWeight:600}}>Notes</label>
        <textarea
          value={form.notes}
          onChange={e=>setForm({...form,notes:e.target.value})}
          placeholder="Optional description for the resource"
          rows={4}
          style={{width:'100%',background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:'10px 12px',color:C.text,fontSize:13,fontFamily:'inherit',outline:'none',resize:'vertical'}}
        />
      </div>

      <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
        <Btn onClick={()=>{setModal(false);resetForm();}} variant="ghost">Cancel</Btn>
        <Btn onClick={add} icon={Plus}>Add Resource</Btn>
      </div>
    </Modal>

    <Modal open={!!viewer} onClose={closeViewer} title={viewer?.title || 'View Resource'} width={780}>
      {viewer && (
        <div style={{display:'grid',gridTemplateColumns:'1fr',gap:14}}>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              <div style={{fontSize:12,color:C.sub}}>Course: <span style={{color:C.text,fontWeight:600}}>{viewer.course || '—'}</span></div>
              <div style={{fontSize:12,color:C.sub}}>Type: <span style={{color:C.text,fontWeight:600}}>{viewer.type || 'Resource'}</span></div>
              <div style={{fontSize:12,color:C.sub}}>Added: <span style={{color:C.text,fontWeight:600}}>{viewer.date || '—'}</span></div>
            </div>
            {viewer.fileUrl && (
              <a
                href={viewer.fileUrl}
                target="_blank"
                rel="noreferrer"
                download={viewer.fileName || true}
                style={{
                  color:C.accent,
                  fontSize:12,
                  textDecoration:'none',
                  fontWeight:600
                }}
              >
                Open / Download
              </a>
            )}
          </div>

          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:12}}>
            {viewer.fileUrl ? (
              viewer.fileType === 'pdf' ? (
                <iframe
                  src={viewer.fileUrl}
                  title={viewer.title}
                  style={{width:'100%',height:'68vh',border:'none',borderRadius:10,background:'#fff'}}
                />
              ) : viewer.fileType === 'pptx' ? (
                <div style={{display:'flex',flexDirection:'column',gap:12,alignItems:'center',justifyContent:'center',minHeight:300,textAlign:'center',padding:20}}>
                  <div style={{fontSize:16,fontWeight:700,color:C.text}}>PowerPoint preview</div>
                  <div style={{fontSize:13,color:C.sub,maxWidth:520,lineHeight:1.6}}>
                    PowerPoint files are attached and can be opened or downloaded from here. Browser-based inline rendering for .ppt/.pptx is not reliable without a conversion service, so this view keeps the file accessible and ready to open.
                  </div>
                  <div style={{fontSize:12,color:C.sub}}>File: {viewer.fileName || 'Presentation'}</div>
                  <a
                    href={viewer.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={viewer.fileName || true}
                    style={{
                      display:'inline-flex',
                      alignItems:'center',
                      gap:6,
                      background:C.accent,
                      color:'#000',
                      padding:'10px 14px',
                      borderRadius:8,
                      textDecoration:'none',
                      fontWeight:700
                    }}
                  >
                    <Eye size={14} />
                    Open / Download Presentation
                  </a>
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:12,alignItems:'center',justifyContent:'center',minHeight:240,textAlign:'center',padding:20}}>
                  <div style={{fontSize:16,fontWeight:700,color:C.text}}>File attached</div>
                  <div style={{fontSize:13,color:C.sub}}>This file type cannot be previewed inline in the browser.</div>
                  <a
                    href={viewer.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={viewer.fileName || true}
                    style={{
                      display:'inline-flex',
                      alignItems:'center',
                      gap:6,
                      background:C.accent,
                      color:'#000',
                      padding:'10px 14px',
                      borderRadius:8,
                      textDecoration:'none',
                      fontWeight:700
                    }}
                  >
                    <Eye size={14} />
                    Open / Download
                  </a>
                </div>
              )
            ) : (
              <div style={{padding:20,color:C.sub,fontSize:13,lineHeight:1.7}}>
                {viewer.notes || 'No file was uploaded for this resource. Add a PDF or PPT/PPTX file to enable preview.'}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  </div>;
}

function ReadingLists() {

  return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
    <AIBox title="Curated Reading List Generator" placeholder="Enter course topic, level (undergrad/postgrad), and learning objectives..." buildPrompt={inp=>`Create a comprehensive academic reading list for: ${inp}. Include: 1) Essential Textbooks (3-5 with edition info), 2) Core Academic Papers (5-8 foundational papers), 3) Recent Research Articles (2025-era topics), 4) Online Resources & MOOCs, 5) Industry Reports & Case Studies. For each, provide: title, author, year, and brief annotation explaining why it's relevant.`} resultLabel="Curated Reading List"/>
    <AIBox title="Annotated Bibliography Generator" placeholder="List topics or specific books/papers to create an annotated bibliography..." buildPrompt={inp=>`Create an annotated bibliography for: ${inp}. For each source, provide: 1) Full citation in APA format, 2) 3-4 sentence annotation covering: main argument/content, methodology, relevance to the course, and any limitations. Be academically precise.`} resultLabel="Annotated Bibliography"/>
    <AIBox title="Open Access Resources Finder" placeholder="Enter topic and level to find free, high-quality academic resources..." buildPrompt={inp=>`Suggest high-quality open access and freely available academic resources for: ${inp}. Include: 1) Open textbooks (e.g., OpenStax, MIT OpenCourseWare), 2) YouTube channels by credible academics, 3) Free online courses (Coursera audit, edX, Khan Academy), 4) Academic databases (Google Scholar searches), 5) GitHub repositories with relevant code/data. Provide URLs where known.`} resultLabel="Open Access Resources"/>
    <AIBox title="Reference Material Update Checker" placeholder="List your current reference list and the topic area to check for updates..." buildPrompt={inp=>`Review and suggest updates to this reference/reading list for: ${inp}. Identify: 1) Outdated references to replace (pre-2020 unless classic), 2) New editions of existing textbooks, 3) Recent landmark papers in the field (2022-2025), 4) Emerging resources to add, 5) Resources to remove for being superseded. Provide specific replacement suggestions.`} resultLabel="Updated Reference List"/>
  </div>;
}

// ===================== CAPSTONE MODULE =====================
function CapstoneModule({projects,setProjects}) {
  const [tab,setTab]=useState('projects');
  const tabs=[{id:'projects',icon:Database,label:'Project Tracker'},{id:'milestones',icon:Calendar,label:'Milestones'},{id:'screen',icon:Eye,label:'AI Proposal Screener'},{id:'eval',icon:CheckSquare,label:'Evaluation & Rubrics'},{id:'reports',icon:FileText,label:'Reports'}];
  return <div><SectionHead title="Capstone Supervision & Evaluation" sub="Track projects, screen proposals, and evaluate student capstones"/><TabBar tabs={tabs} active={tab} setActive={setTab}/>
    {tab==='projects'&&<ProjectTracker projects={projects} setProjects={setProjects}/>}
    {tab==='milestones'&&<MilestoneTracker projects={projects} setProjects={setProjects}/>}
    {tab==='screen'&&<ProposalScreener/>}
    {tab==='eval'&&<EvalRubrics/>}
    {tab==='reports'&&<CapstoneReports projects={projects}/>}
  </div>;
}

function ProjectTracker({projects,setProjects}) {
  const [modal,setModal]=useState(false);const [form,setForm]=useState({title:'',student:'',supervisor:'',status:'In Progress',progress:0,proposal:'Pending',defense:'Pending'});
  function add(){setProjects([...projects,{...form,id:Date.now(),milestones:[{name:'Proposal',done:false,date:''},{name:'Literature Review',done:false,date:''},{name:'System Design',done:false,date:''},{name:'Implementation',done:false,date:''},{name:'Testing',done:false,date:''},{name:'Defense',done:false,date:''}]}]);setModal(false);}
  function del(id){setProjects(projects.filter(p=>p.id!==id));}
  const statColor={'In Progress':C.blue,'On Track':C.green,'Behind':C.red,'Completed':C.accent,'At Risk':C.red};
  return <div>
    <div style={{display:'flex',justifyContent:'flex-end',marginBottom:16}}><Btn onClick={()=>setModal(true)} icon={Plus}>Add Project</Btn></div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
      {projects.map(p=><Card key={p.id} style={{padding:18}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
          <div style={{flex:1,marginRight:12}}><h4 style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:4,lineHeight:1.3}}>{p.title}</h4><div style={{fontSize:12,color:C.muted}}>{p.student}</div></div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}><Tag label={p.status} color={statColor[p.status]||C.blue}/><button onClick={()=>del(p.id)} style={{background:'none',border:'none',color:C.muted,cursor:'pointer'}}><Trash2 size={12} /></button></div>
        </div>
        <div style={{display:'flex',gap:16,marginBottom:12,fontSize:11,color:C.muted}}>
          <span>Supervisor: <strong style={{color:C.sub}}>{p.supervisor}</strong></span>
        </div>
        <div style={{background:C.border,borderRadius:4,height:6,overflow:'hidden',marginBottom:6}}><div style={{width:`${p.progress}%`,height:'100%',background:p.progress>=80?C.green:p.progress>=50?C.accent:C.blue,borderRadius:4,transition:'width 0.3s'}}/></div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:C.muted}}>
          <span>{p.progress}% complete</span>
          <div style={{display:'flex',gap:8}}><Tag label={`Proposal: ${p.proposal}`} color={p.proposal==='Approved'?C.green:C.muted}/><Tag label={`Defense: ${p.defense}`} color={p.defense==='Completed'?C.green:C.muted}/></div>
        </div>
      </Card>)}
    </div>
    <Modal open={modal} onClose={()=>setModal(false)} title="Add Capstone Project" width={500}>
      <Input label="Project Title" value={form.title} onChange={v=>setForm({...form,title:v})} placeholder="Project title"/>
      <Input label="Student Name" value={form.student} onChange={v=>setForm({...form,student:v})} placeholder="Student full name"/>
      <Input label="Supervisor" value={form.supervisor} onChange={v=>setForm({...form,supervisor:v})} placeholder="Supervisor name"/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div style={{marginBottom:14}}><label style={{display:'block',fontSize:12,color:C.sub,marginBottom:6,fontWeight:600}}>Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={{width:'100%',background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:'10px 12px',color:C.text,fontSize:13,fontFamily:'inherit',outline:'none'}}>
          {['In Progress','On Track','Behind','At Risk','Completed'].map(s=><option key={s}>{s}</option>)}</select></div>
        <Input label="Progress (%)" value={form.progress} onChange={v=>setForm({...form,progress:+v})} type="number"/>
      </div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}><Btn onClick={()=>setModal(false)} variant="ghost">Cancel</Btn><Btn onClick={add} icon={Plus}>Add Project</Btn></div>
    </Modal>
  </div>;
}

function MilestoneTracker({projects,setProjects}) {
  function toggleMilestone(pid,mi) {
    setProjects(projects.map(p=>p.id===pid?{...p,milestones:p.milestones.map((m,i)=>i===mi?{...m,done:!m.done}:m)}:p));
  }
  return <div style={{display:'flex',flexDirection:'column',gap:16}}>
    {projects.map(p=><Card key={p.id}>
      <h4 style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:4}}>{p.title}</h4>
      <div style={{fontSize:12,color:C.muted,marginBottom:16}}>{p.student} — {p.progress}% complete</div>
      <div style={{display:'flex',alignItems:'center',gap:0,overflowX:'auto',paddingBottom:8}}>
        {p.milestones.map((m,i)=><div key={i} style={{display:'flex',alignItems:'center',flexShrink:0}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
            <button onClick={()=>toggleMilestone(p.id,i)} style={{width:32,height:32,borderRadius:'50%',border:`2px solid ${m.done?C.green:C.border}`,background:m.done?C.green:C.surface,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all 0.2s'}}>{m.done?<CheckCircle size={14} color="#fff"/>:<div style={{width:8,height:8,borderRadius:'50%',background:C.border}}/>}</button>
            <span style={{fontSize:9,color:m.done?C.green:C.muted,textAlign:'center',maxWidth:60,lineHeight:1.2}}>{m.name}</span>
          </div>
          {i<p.milestones.length-1&&<div style={{width:40,height:2,background:m.done?C.green:C.border,flexShrink:0,marginBottom:18}}/>}
        </div>)}
      </div>
    </Card>)}
  </div>;
}

function ProposalScreener() {
  return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
    <AIBox title="Proposal Feasibility Screener" placeholder="Paste the student's capstone project proposal here..." buildPrompt={inp=>`Screen this capstone project proposal for feasibility. Evaluate: 1) Technical Feasibility (0-10), 2) Scope Appropriateness (0-10), 3) Innovation Level (0-10), 4) Resource Requirements vs. Available, 5) Timeline Realism. Provide: Overall recommendation (Accept/Revise/Reject), specific concerns, and revision suggestions if needed.\n\nProposal:\n${inp}`} resultLabel="Proposal Assessment"/>
    <AIBox title="Literature Review Feedback" placeholder="Paste the student's literature review for AI feedback..." buildPrompt={inp=>`Evaluate this academic literature review from a capstone project: ${inp}. Assess: 1) Coverage of key papers/authors in the field, 2) Critical analysis depth, 3) Synthesis vs. mere summary, 4) Identification of research gaps, 5) Citation quality and recency, 6) Writing quality. Provide a grade estimate and specific improvement recommendations.`} resultLabel="Literature Review Feedback"/>
    <AIBox title="Originality & Contribution Check" placeholder="Paste project title, abstract, and key contributions claimed..." buildPrompt={inp=>`Evaluate the academic originality and contribution of this capstone project: ${inp}. Analyze: 1) Novelty of approach compared to existing work, 2) Clarity of contribution statement, 3) Technical merit, 4) Practical significance, 5) Potential research/industry impact. Rate originality 1-10 and explain what makes it unique or what could strengthen it.`} resultLabel="Originality Assessment"/>
    <AIBox title="Defense Preparation Questionnaire" placeholder="Enter project title and abstract to generate likely defense questions..." buildPrompt={inp=>`Generate 15 challenging but fair questions an examination committee would ask during a capstone defense for: ${inp}. Include questions from categories: Technical depth, Methodology justification, Literature knowledge, Limitations awareness, Future work, and Practical application. Also provide brief guidance on what a strong answer should include for each.`} resultLabel="Defense Questions"/>
  </div>;
}

function EvalRubrics() {
  return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
    <AIBox title="Evaluation Rubric Generator" placeholder="Describe the type of project/deliverable and assessment criteria needed..." buildPrompt={inp=>`Create a detailed evaluation rubric for: ${inp}. Format as a table with: Criterion | Weight% | Excellent (A) | Good (B) | Satisfactory (C) | Poor (D/F). Include criteria for: Technical Implementation, Innovation/Originality, Documentation Quality, Presentation Skills, Problem-Solving Approach, and Team Collaboration (if applicable). Total weight must equal 100%.`} resultLabel="Evaluation Rubric"/>
    <AIBox title="Defense Evaluation Form" placeholder="Describe the capstone project type for a customized defense evaluation form..." buildPrompt={inp=>`Design a comprehensive defense evaluation form for ${inp}. Include: 1) Project Overview Score (20%), 2) Technical Depth Q&A Score (30%), 3) Presentation Quality (20%), 4) Demo/Prototype Evaluation (20%), 5) Response to Examiner Questions (10%). For each section: include specific evaluation criteria, score ranges, and space for comments. Format professionally.`} resultLabel="Defense Evaluation Form"/>
    <AIBox title="Feedback Report Generator" placeholder="Describe student performance in the defense/evaluation for a formal report..." buildPrompt={inp=>`Write a formal capstone evaluation feedback report based on: ${inp}. Include: 1) Executive Summary, 2) Technical Achievement assessment, 3) Presentation & Communication skills evaluation, 4) Strengths demonstrated, 5) Areas requiring improvement, 6) Overall grade recommendation with justification, 7) Recommendation for publication/industry application (if applicable). Format for official university records.`} resultLabel="Feedback Report"/>
    <AIBox title="Plagiarism & Ethics Checklist" placeholder="Describe the project to generate an ethics and originality verification checklist..." buildPrompt={inp=>`Create a comprehensive plagiarism and research ethics verification checklist for: ${inp}. Cover: 1) Code/implementation originality checks, 2) Data collection ethics compliance, 3) Proper attribution of all sources, 4) AI tool usage disclosure requirements, 5) Copyright compliance for datasets, 6) Human subjects research ethics (if applicable). Make it actionable with Yes/No checkboxes and verification steps.`} resultLabel="Ethics Checklist"/>
  </div>;
}

function CapstoneReports({projects}) {
  const done=projects.filter(p=>p.status==='Completed').length;
  const inProgress=projects.filter(p=>p.status==='In Progress').length;
  const atRisk=projects.filter(p=>p.status==='At Risk'||p.status==='Behind').length;
  return <div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:20}}>
      <StatCard icon={Award} label="Total Projects" value={projects.length} color={C.blue}/>
      <StatCard icon={CheckCircle} label="Completed" value={done} color={C.green}/>
      <StatCard icon={AlertCircle} label="At Risk" value={atRisk} color={C.red} sub={atRisk>0?"Needs attention":"All on track"}/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
      <Card>
        <h3 style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:14}}>Project Status Summary</h3>
        {projects.map(p=><div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${C.border}`}}>
          <div><div style={{fontSize:12,fontWeight:500,color:C.text}}>{p.title}</div><div style={{fontSize:11,color:C.muted}}>{p.student}</div></div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
            <Tag label={p.status} color={p.status==='Completed'?C.green:p.status==='At Risk'?C.red:C.blue}/>
            <span style={{fontSize:10,color:C.muted}}>{p.progress}% done</span>
          </div>
        </div>)}
      </Card>
      <AIBox title="Capstone Summary Report Generator" placeholder="Describe the semester or batch for a comprehensive capstone summary report..." buildPrompt={inp=>`Generate a formal capstone supervision summary report for: ${inp}. Include: 1) Executive Summary, 2) Total projects supervised with status breakdown, 3) Notable achievements and innovations, 4) Challenges faced and how resolved, 5) Assessment statistics (grade distribution), 6) Recommendations for next semester's capstone program. Format for departmental records and accreditation purposes.`} resultLabel="Summary Report"/>
    </div>
  </div>;
}

// ===================== MAIN APP =====================
export default function EduAI() {
  const [page,setPage]=useState('login');const [user,setUser]=useState(null);
  const [module,setModule]=useState('dashboard');
  const [grades,setGrades]=useState(DEMO_GRADES);
  const [courses,setCourses]=useState(DEMO_COURSES);
  const [projects,setProjects]=useState(DEMO_PROJECTS);
  const [materials,setMaterials]=useState(DEMO_MATS);
  useEffect(()=>{(async()=>{
    const g=await gget('eduai_grades',DEMO_GRADES);const c=await gget('eduai_courses',DEMO_COURSES);
    const p=await gget('eduai_projects',DEMO_PROJECTS);const m=await gget('eduai_materials',DEMO_MATS);
    setGrades(g);setCourses(c);setProjects(p);setMaterials(m);
  })();},[]);
  async function updGrades(g){setGrades(g);await gset('eduai_grades',g);}
  async function updCourses(c){setCourses(c);await gset('eduai_courses',c);}
  async function updProjects(p){setProjects(p);await gset('eduai_projects',p);}
  async function updMaterials(m){setMaterials(m);await gset('eduai_materials',m);}
  if(page==='login')return <LoginPage onLogin={()=>{setUser({name:'Dr. Sarah Ahmed',dept:'CSE'});setPage('app');}}/>;
  return <div style={{display:'flex',height:'100vh',background:C.bg,color:C.text,fontFamily:'"DM Sans",system-ui,sans-serif',overflow:'hidden'}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}button:hover{opacity:0.9;}select option{background:${C.surface};}`}</style>
    <Sidebar module={module} setModule={setModule} onLogout={()=>setPage('login')} user={user}/>
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <TopBar user={user} module={module}/>
      <main style={{flex:1,overflowY:'auto',padding:'24px 28px'}}>
        {module==='dashboard'&&<DashboardHome grades={grades} courses={courses} projects={projects} setModule={setModule}/>}
        {module==='teaching'&&<TeachingModule grades={grades} setGrades={updGrades} courses={courses}/>}
        {module==='curriculum'&&<CurriculumModule courses={courses} setCourses={updCourses}/>}
        {module==='materials'&&<MaterialsModule materials={materials} setMaterials={updMaterials}/>}
        {module==='capstone'&&<CapstoneModule projects={projects} setProjects={updProjects}/>}
      </main>
    </div>
  </div>;
}

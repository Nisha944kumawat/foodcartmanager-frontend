import React,{useEffect,useMemo,useState} from 'react';
import{createRoot}from'react-dom/client';
import{LayoutDashboard,ChefHat,Boxes,ShoppingCart,BarChart3,LogOut,Plus,Trash2,Edit3,RefreshCw,Menu,X,Calculator,Save,CheckCircle2,XCircle}from'lucide-react';
import{api}from'./api';
import'./styles.css';

const money=n=>`₹${Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:2})}`;
const localToday=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const units=['g','kg','ml','l','piece','packet','other'];
const categories=[['vegetable','Vegetables'],['kitchen','Kitchen'],['dairy','Dairy Products']];

function Login({onLogin}){const[mode,setMode]=useState('login'),[form,setForm]=useState({name:'',email:'',password:''}),[err,setErr]=useState('');
async function submit(e){e.preventDefault();setErr('');try{const d=await api(`/auth/${mode}`,{method:'POST',body:JSON.stringify(form)});localStorage.setItem('fc_token',d.token);onLogin(d.user)}catch(x){setErr(x.message)}}
return <div className="auth"><div className="auth-card"><div className="brand"><span>🍴</span><div><b>Food Cart</b><small>Cost & Profit Manager</small></div></div><h1>{mode==='login'?'Welcome back':'Create account'}</h1><p className="muted">Personal food cart calculation dashboard</p><form onSubmit={submit}>{mode==='register'&&<input placeholder="Your name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>}<input type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/><input type="password" placeholder="Password (6+ characters)" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength="6"/>{err&&<div className="error">{err}</div>}<button className="primary full">{mode==='login'?'Login':'Register'}</button></form><button className="link" onClick={()=>setMode(mode==='login'?'register':'login')}>{mode==='login'?'New here? Create account':'Already have an account? Login'}</button></div></div>}

function Modal({title,onClose,children,wide=false}){return <div className="modal-back"><div className={`modal ${wide?'modal-wide':''}`}><div className="modal-head"><h3>{title}</h3><button className="icon" onClick={onClose}><X/></button></div>{children}</div></div>}
function PageTitle({title,subtitle,action}){return <div className="page-title"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>}
function Loading(){return <div className="loading">Loading…</div>}

function ProfitChart({daily,title='Profit / Loss'}){
 const max=Math.max(1,...daily.map(x=>Math.abs(Number(x.profit||0))));
 return <div className="chart-panel"><div className="chart-head"><h3>{title}</h3><span className="muted">Green = profit · Red = loss</span></div>
 <div className="bar-chart">{daily.map(x=>{const v=Number(x.profit||0);const h=Math.max(4,Math.round(Math.abs(v)/max*150));return <div className="bar-item" key={x.date} title={`${x.date}: ${money(v)}`}><div className="bar-value">{money(v)}</div><div className={`bar ${v<0?'loss':''}`} style={{height:h}}></div><small>{x.date.slice(5)}</small></div>})}</div></div>
}
function DishProfitChart({rows}){
 const list=rows.slice(0,8);const max=Math.max(1,...list.map(x=>Math.abs(Number(x.profit||0))));
 return <div className="chart-panel"><div className="chart-head"><h3>Dish-wise Profit</h3><span className="muted">Top dishes by profit</span></div><div className="dish-bars">{list.map(x=>{const v=Number(x.profit||0);return <div className="dish-bar-row" key={x.dish}><div className="dish-bar-label">{x.dish}</div><div className="dish-bar-track"><div className={`dish-bar ${v<0?'loss':''}`} style={{width:`${Math.max(3,Math.abs(v)/max*100)}%`}}></div></div><b className={v<0?'bad':'good'}>{money(v)}</b></div>})}{!list.length&&<div className="empty">No sales data for this period.</div>}</div></div>
}

function Dashboard({reload}){
 const[type,setType]=useState('today'),[d,setD]=useState(null),[from,setFrom]=useState(localToday()),[to,setTo]=useState(localToday());
 async function load(){const q=type==='custom'?`/dashboard?type=custom&from=${from}&to=${to}`:`/dashboard?type=${type}`;setD(await api(q))}
 useEffect(()=>{load()},[type,reload]);
 if(!d)return <Loading/>;
 const s=d.today;
 return <><PageTitle title="Dashboard" subtitle="Your food cart at a glance"/>
 <div className="period-tabs">{[['today','Today'],['week','This Week'],['month','This Month'],['custom','Custom']].map(x=><button className={type===x[0]?'active':''} onClick={()=>setType(x[0])} key={x[0]}>{x[1]}</button>)}{type==='custom'&&<><input type="date" value={from} onChange={e=>setFrom(e.target.value)}/><input type="date" value={to} onChange={e=>setTo(e.target.value)}/><button className="primary small" onClick={load}>Apply</button></>}</div>
 <div className="cards"><div className="stat"><span>Sales</span><strong>{money(s.sales)}</strong><small>Net sold sales · Selected period</small></div><div className="stat"><span>Return Loss</span><strong>{money(s.returnLoss)}</strong><small>Returned plates × cost of pieces used</small></div><div className="stat"><span>Making Cost</span><strong>{money(s.makingCost)}</strong><small>Cost of plates sold</small></div><div className="stat"><span>Net Profit / Loss</span><strong className={s.profit<0?'bad':''}>{money(s.profit)}</strong><small>Net sales − making cost</small></div><div className="stat"><span>Total Plates Sell</span><strong>{s.platesMade}</strong><small>Plates entered as sold</small></div></div>
 <div className="dashboard-grid"><ProfitChart daily={d.daily} title={type==='today'?'Today Profit / Loss':type==='week'?'Weekly Profit / Loss':type==='month'?'Monthly Profit / Loss':'Custom Profit / Loss'}/><DishProfitChart rows={d.byDish}/></div>
 <div className="quick"><div><h3>Current data</h3><p className="muted">All calculations use the latest ingredient rates. Old sales keep their saved cost snapshot.</p></div><div className="pill-row"><span>🍽 {d.totals.dishes} dishes</span><span>📦 {d.totals.ingredients} ingredients</span><span>⚡ Automatic costing</span></div></div></>
}

function Ingredients({reload,setReload}){
 const[items,setItems]=useState([]),[open,setOpen]=useState(false),[edit,setEdit]=useState(null),[search,setSearch]=useState(''),[category,setCategory]=useState('all'),[saving,setSaving]=useState({});
 async function load(){setItems(await api('/ingredients'))}
 useEffect(()=>{load()},[reload]);
 const filtered=useMemo(()=>items.filter(x=>(category==='all'||x.category===category)&&x.name.toLowerCase().includes(search.toLowerCase())),[items,category,search]);
 const grouped=category==='all'?categories:categories.filter(x=>x[0]===category);
 async function save(e){e.preventDefault();const f=new FormData(e.currentTarget);const body={name:f.get('name'),category:f.get('category'),currentRate:+f.get('currentRate')};try{await api(edit?`/ingredients/${edit._id}`:'/ingredients',{method:edit?'PUT':'POST',body:JSON.stringify(body)});setOpen(false);setEdit(null);setReload(x=>x+1)}catch(x){alert(x.message)}}
 async function saveRate(i){setSaving(s=>({...s,[i._id]:true}));try{await api(`/ingredients/${i._id}`,{method:'PUT',body:JSON.stringify({currentRate:Number(i.currentRate)})});setReload(x=>x+1)}catch(x){alert(x.message)}finally{setSaving(s=>({...s,[i._id]:false}))}}
 async function del(id){if(!confirm('Delete this ingredient permanently? Related recipe lines, rate history and purchase records will also be removed.'))return;try{await api(`/ingredients/${id}`,{method:'DELETE'});setReload(x=>x+1)}catch(x){alert(x.message)}}
 return <><PageTitle title="Ingredients" subtitle="Add ingredients once, then update their ₹/kg rate from one place" action={<button className="primary" onClick={()=>setOpen(true)}><Plus/> Add Ingredient</button>}/>
 <div className="ingredient-index"><div className="index-head"><div><h3>Ingredient Index</h3><p className="muted">Daily price changes can be saved directly in this table.</p></div><div className="toolbar"><input placeholder="Search ingredient…" value={search} onChange={e=>setSearch(e.target.value)}/><button className="ghost" onClick={load}><RefreshCw/></button></div></div>
 <div className="category-tabs"><button className={category==='all'?'active':''} onClick={()=>setCategory('all')}>All</button>{categories.map(x=><button key={x[0]} className={category===x[0]?'active':''} onClick={()=>setCategory(x[0])}>{x[1]}</button>)}</div>
 {grouped.map(([key,label])=>{const rows=filtered.filter(i=>i.category===key);return <div className="category-block" key={key}><div className="category-title"><h3>{label}</h3><span>{rows.length} items</span></div><div className="table-wrap"><table><thead><tr><th>Ingredient</th><th>Category</th><th>Price / kg</th><th>Last updated</th><th>Actions</th></tr></thead><tbody>{rows.map(i=><tr key={i._id}><td><b>{i.name}</b></td><td>{label}</td><td><input className="inline-rate" type="number" min="0" step="0.01" value={i.currentRate} onChange={e=>setItems(items.map(x=>x._id===i._id?{...x,currentRate:e.target.value}:x))}/></td><td>{i.updatedAt?new Date(i.updatedAt).toLocaleDateString('en-IN'): '—'}</td><td className="actions"><button className="save-icon" title="Save current price" onClick={()=>saveRate(i)} disabled={saving[i._id]}><Save/></button><button title="Edit name/category" onClick={()=>{setEdit(i);setOpen(true)}}><Edit3/></button><button className="danger" title="Delete permanently" onClick={()=>del(i._id)}><Trash2/></button></td></tr>)}{!rows.length&&<tr><td colSpan="5" className="empty">No ingredients in this category.</td></tr>}</tbody></table></div></div>})}</div>
 {open&&<Modal title={edit?'Edit Ingredient':'Add Ingredient'} onClose={()=>{setOpen(false);setEdit(null)}}><form onSubmit={save} className="form-grid"><label>Ingredient name<input name="name" defaultValue={edit?.name||''} required/></label><label>Category<select name="category" defaultValue={edit?.category||'vegetable'}>{categories.map(x=><option key={x[0]} value={x[0]}>{x[1]}</option>)}</select></label><label className="wide">Price per kg (₹)<input type="number" name="currentRate" min="0" step="0.01" defaultValue={edit?.currentRate??0} required/></label><div className="form-note wide">Only these details are required for an ingredient. Recipe quantities can be entered in g/kg; the rate is always maintained as ₹/kg.</div><div className="form-actions"><button type="button" className="ghost" onClick={()=>{setOpen(false);setEdit(null)}}>Cancel</button><button className="primary"><Save/> Save Ingredient</button></div></form></Modal>}</>
}

function Dishes({reload,setReload}){
 const[ds,setDs]=useState([]),[ings,setIngs]=useState([]),[open,setOpen]=useState(false),[edit,setEdit]=useState(null),[cost,setCost]=useState(null);
 async function load(){try{const[a,b]=await Promise.all([api('/dishes'),api('/ingredients')]);setDs(a);setIngs(b)}catch(e){alert(e.message)}}
 useEffect(()=>{load()},[reload]);
 async function save(e){e.preventDefault();const f=new FormData(e.currentTarget),lines=JSON.parse(f.get('lines')||'[]'),add=JSON.parse(f.get('additionalCosts')||'[]');const body={name:f.get('name'),yieldQty:+f.get('yieldQty')||0,yieldUnit:f.get('yieldUnit')||'piece',sellingPrice:+f.get('sellingPrice')||0,piecesPerDish:+f.get('piecesPerDish')||0,ingredients:lines.filter(x=>x.ingredientId&&+x.quantity>0),additionalCosts:add.filter(x=>x.name&&+x.amount>=0).map(x=>({...x,amount:+x.amount}))};if(!(body.yieldQty>0)||!(body.piecesPerDish>0))return alert('Enter total pieces made and pieces used per dish greater than zero');try{await api(edit?`/dishes/${edit._id}`:'/dishes',{method:edit?'PUT':'POST',body:JSON.stringify(body)});setOpen(false);setEdit(null);setCost(null);setReload(x=>x+1)}catch(x){alert(x.message)}}
 async function del(id){if(!confirm('Delete this dish permanently? Its old sales reports will remain as saved snapshots.'))return;try{await api(`/dishes/${id}`,{method:'DELETE'});setReload(x=>x+1)}catch(x){alert(x.message)}}
 return <><PageTitle title="Dishes & Recipes" subtitle="Build recipes, set a fixed selling price and calculate dish profit or loss" action={<button className="primary" onClick={()=>{setEdit(null);setOpen(true)}}><Plus/> Add Dish</button>}/>
 <div className="dish-grid">{ds.map(d=><div className="dish-card" key={d._id}><div className="dish-icon">🍽️</div><div><h3>{d.name}</h3><p>{d.ingredients.length} ingredients · {d.yieldQty} {d.yieldUnit} made · {d.piecesPerDish} {d.yieldUnit} used/dish</p></div><div className="dish-price"><span>Selling price</span><b>{money(d.sellingPrice)}</b></div><div className="dish-bottom"><button className="outline" onClick={async()=>{try{setCost(await api(`/dishes/${d._id}/cost`))}catch(e){alert(e.message)}}}><Calculator/> Cost & Profit</button><button className="outline" onClick={()=>{setEdit(d);setOpen(true)}}><Edit3/></button><button className="outline danger" title="Delete dish" onClick={()=>del(d._id)}><Trash2/></button></div></div>)}{!ds.length&&<div className="empty panel">No dishes yet. Add your first recipe.</div>}</div>
 {cost&&<Modal title="Dish Cost & Profit" onClose={()=>setCost(null)}><div className="cost-lines">{cost.lines.map((x,i)=><div key={i}><span>{x.name} — {x.quantity} {x.unit}</span><b>{money(x.cost)}</b></div>)}<div><span>Additional costs</span><b>{money(cost.additionalCost)}</b></div><hr/><div><span>Total ingredient cost</span><b>{money(cost.ingredientCost)}</b></div><div><span>Total batch cost</span><b>{money(cost.totalCost)}</b></div><div><span>Total pieces made</span><b>{cost.totalPieces} {cost.totalPieces===1?'piece':'pieces'}</b></div><div><span>Cost per piece</span><b>{money(cost.costPerPiece)}</b></div><div><span>Pieces used per dish</span><b>{cost.piecesPerDish}</b></div><div><span>Cost of pieces used</span><b>{money(cost.dishCost)}</b></div><div><span>Selling price</span><b>{money(cost.sellingPrice)}</b></div><div className={`highlight ${cost.profitLoss<0?'loss-highlight':''}`}><span>{cost.profitLoss>=0?'Profit':'Loss'}</span><b>{money(Math.abs(cost.profitLoss))}</b></div><p className="muted cost-note">Profit/Loss = Selling price − cost of the pieces used.</p></div></Modal>}
 {open&&<DishModal edit={edit} ings={ings} onClose={()=>{setOpen(false);setEdit(null)}} onSave={save}/>}</>
}

function DishModal({edit,ings,onClose,onSave}){
 const[lines,setLines]=useState(edit?.ingredients?.map(x=>({ingredientId:x.ingredientId?._id||x.ingredientId,quantity:x.quantity,unit:x.unit}))||[ings[0]?{ingredientId:ings[0]._id,quantity:0,unit:'g'}:{ingredientId:'',quantity:0,unit:'g'}]);
 const[adds,setAdds]=useState(edit?.additionalCosts||[]);
 return <Modal title={edit?'Edit Dish':'Add Dish'} onClose={onClose} wide><form onSubmit={onSave}><div className="form-grid"><label>Dish name<input name="name" defaultValue={edit?.name||''} required/></label><label>Selling price (₹)<input type="number" step="0.01" min="0" name="sellingPrice" defaultValue={edit?.sellingPrice??0} required/></label><label>Total pieces made<input type="number" step="0.001" min="0.001" name="yieldQty" defaultValue={edit?.yieldQty||1} required/></label><label>Pieces used per dish<input type="number" step="0.001" min="0.001" name="piecesPerDish" defaultValue={edit?.piecesPerDish||1} required/></label><input type="hidden" name="yieldUnit" value="piece"/></div><div className="form-note form-note-space">Enter the total pieces produced from the ingredients in one batch, then enter how many pieces are used for one dish. The software calculates the cost of those pieces and compares it with the fixed selling price.</div><div className="section-head"><h4>Ingredients</h4><button type="button" className="ghost small" onClick={()=>setLines([...lines,{ingredientId:ings[0]?._id||'',quantity:0,unit:'g'}])}><Plus/> Add</button></div>{lines.map((l,i)=><div className="line-row" key={i}><select value={l.ingredientId} onChange={e=>setLines(lines.map((x,j)=>j===i?{...x,ingredientId:e.target.value}:x))}>{ings.map(x=><option key={x._id} value={x._id}>{x.name}</option>)}</select><input type="number" min="0" step="0.001" placeholder="Qty" value={l.quantity} onChange={e=>setLines(lines.map((x,j)=>j===i?{...x,quantity:e.target.value}:x))}/><select value={l.unit} onChange={e=>setLines(lines.map((x,j)=>j===i?{...x,unit:e.target.value}:x))}>{units.map(u=><option key={u}>{u}</option>)}</select><button type="button" className="danger icon" onClick={()=>setLines(lines.filter((_,j)=>j!==i))}><Trash2/></button></div>)}<div className="section-head"><h4>Additional costs</h4><button type="button" className="ghost small" onClick={()=>setAdds([...adds,{name:'',amount:0}])}><Plus/> Add</button></div>{adds.map((a,i)=><div className="line-row" key={i}><input placeholder="Oil / Gas / Packaging" value={a.name} onChange={e=>setAdds(adds.map((x,j)=>j===i?{...x,name:e.target.value}:x))}/><input type="number" min="0" step="0.01" placeholder="₹" value={a.amount} onChange={e=>setAdds(adds.map((x,j)=>j===i?{...x,amount:e.target.value}:x))}/><span></span><button type="button" className="danger icon" onClick={()=>setAdds(adds.filter((_,j)=>j!==i))}><Trash2/></button></div>)}<input type="hidden" name="lines" value={JSON.stringify(lines)}/><input type="hidden" name="additionalCosts" value={JSON.stringify(adds)}/><div className="form-actions"><button type="button" className="ghost" onClick={onClose}>Cancel</button><button className="primary"><Save/> Save Dish</button></div></form></Modal>
}

function Sales({reload,setReload}){
 const[ds,setDs]=useState([]),[rows,setRows]=useState([]),[date,setDate]=useState(localToday()),[saving,setSaving]=useState(false);
 async function load(){try{const[d,s]=await Promise.all([api('/dishes'),api(`/sales?date=${date}`)]);setDs(d);setRows(d.map(x=>{const old=s.find(y=>y.dishId?._id===x._id);const made=Number(old?.quantity||0),returned=Number(old?.returnedQuantity||0);return{_id:old?._id||'',dishId:x._id,dishName:x.name,sellingPrice:Number(x.sellingPrice||0),unitCost:Number(x.costing?.dishCost||0),madeToday:Boolean(old?.madeToday||(made>0||returned>0)),platesMade:old?Math.max(0,made-returned):0,returnedQuantity:returned}}))}catch(e){alert(e.message)}}
 useEffect(()=>{load()},[date,reload]);
 const update=(id,key,val)=>setRows(rows.map(r=>r.dishId===id?{...r,[key]:val}:r));
 const toggleToday=(id)=>setRows(rows.map(r=>r.dishId===id?{...r,madeToday:!r.madeToday}:r));
 const calc=(r)=>{const made=Math.max(0,Number(r.platesMade||0)),returned=Math.max(0,Number(r.returnedQuantity||0)),netSold=Math.max(0,made-returned),sales=Math.round((netSold*Number(r.sellingPrice||0)+Number.EPSILON)*100)/100,makingCost=Math.round((made*Number(r.unitCost||0)+Number.EPSILON)*100)/100,profit=Math.round((sales-makingCost+Number.EPSILON)*100)/100,perPlate=Math.round((Number(r.sellingPrice||0)-Number(r.unitCost||0)+Number.EPSILON)*100)/100;return{made,returned,netSold,sales,makingCost,profit,perPlate}};
 async function saveAll(){const invalid=rows.find(r=>Number(r.platesMade||0)<0||Number(r.returnedQuantity||0)<0);if(invalid)return alert(`Plate values cannot be negative for ${invalid.dishName}`);const payload={date,rows:rows.map(r=>({...r,platesSold:r.madeToday?(Number(r.platesMade)||0):0,returnedQuantity:r.madeToday?(Number(r.returnedQuantity)||0):0,madeToday:Boolean(r.madeToday)}))};if(!payload.rows.some(r=>r.madeToday))return alert('Select at least one dish as made today');setSaving(true);try{await api('/sales/bulk',{method:'POST',body:JSON.stringify(payload)});await load();alert('Daily sales saved successfully');setReload(x=>x+1)}catch(e){alert(e.message)}finally{setSaving(false)}}
 async function del(id){if(!confirm('Delete this daily sale entry permanently?'))return;try{await api(`/sales/${id}`,{method:'DELETE'});await load();setReload(x=>x+1)}catch(e){alert(e.message)}}
 return <><PageTitle title="Daily Sales" subtitle="Select a date, mark today’s dishes, then enter plates made and plates returned"/>
 <div className="panel form-panel"><div className="sales-head"><label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><div className="sales-note">Mark the dish with the green tick if it was made today. Only selected dishes can accept plate values.</div></div><div className="table-wrap"><table className="sales-table daily-entry-table"><thead><tr><th>Date</th><th>Dish</th><th>Today Dish</th><th>Plates Made</th><th>Plates Returns</th><th>Net Sold</th><th>Sales</th><th>Making Cost</th><th>Profit / Loss</th><th>Per Plate Profit / Loss</th></tr></thead><tbody>{rows.map(r=>{const c=calc(r);return <tr key={r.dishId}><td>{date}</td><td><b>{r.dishName}</b></td><td><button type="button" className={`today-toggle ${r.madeToday?'is-made':'not-made'}`} onClick={()=>toggleToday(r.dishId)} title={r.madeToday?'Dish marked as made today':'Dish not marked as made today'} aria-label={r.madeToday?'Dish made today':'Dish not made today'}>{r.madeToday?<CheckCircle2/>:<XCircle/>}</button></td><td><input type="number" min="0" step="1" value={r.platesMade} disabled={!r.madeToday} onChange={e=>update(r.dishId,'platesMade',e.target.value)}/></td><td><input type="number" min="0" step="1" value={r.returnedQuantity} disabled={!r.madeToday} onChange={e=>update(r.dishId,'returnedQuantity',e.target.value)}/></td><td><b>{r.madeToday?c.netSold:0}</b></td><td>{money(r.madeToday?c.sales:0)}</td><td>{money(r.madeToday?c.makingCost:0)}</td><td className={(r.madeToday?c.profit:0)>=0?'good':'bad'}>{money(r.madeToday?c.profit:0)}</td><td className={(r.madeToday?c.perPlate:0)>=0?'good':'bad'}>{money(r.madeToday?c.perPlate:0)}</td></tr>})}{!rows.length&&<tr><td colSpan="10" className="empty">No dishes available. Create a dish first.</td></tr>}</tbody></table></div><div className="form-actions sales-save"><button className="primary" onClick={saveAll} disabled={saving}>{saving?<><Save/> Saving…</>:<><Save/> Save All Sales</>}</button></div></div>
 <div className="panel"><h3>Saved Daily Sales</h3><p className="muted">Edit or delete any saved entry for the selected date.</p><div className="table-wrap"><table><thead><tr><th>Date</th><th>Dish</th><th>Plates Made</th><th>Plates Returns</th><th>Net Sold</th><th>Actions</th></tr></thead><tbody>{rows.filter(x=>x._id&&x.madeToday).map(r=>{const c=calc(r);return <tr key={r._id}><td>{date}</td><td>{r.dishName}</td><td>{r.platesMade}</td><td>{r.returnedQuantity}</td><td>{c.netSold}</td><td className="actions"><button title="Edit" onClick={()=>document.querySelector('.sales-table')?.scrollIntoView({behavior:'smooth',block:'center'})}><Edit3/></button><button className="danger" title="Delete" onClick={()=>del(r._id)}><Trash2/></button></td></tr>})}{!rows.some(x=>x._id&&x.madeToday)&&<tr><td colSpan="6" className="empty">No saved sales for this date.</td></tr>}</tbody></table></div></div></>
}
function formatReportDate(r,type){
 const fmt=v=>{if(!v)return '';const text=String(v);const d=text.length===10?new Date(`${text}T12:00:00`):new Date(text);return d.toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'});};
 if(!r?.range)return '';
 const from=fmt(r.range.from),to=fmt(r.range.to);
 return type==='today'?`Report Date: ${from}`:`Report Period: ${from} – ${to}`;
}

function formatTableDate(v){if(!v)return '';const text=String(v);const d=text.length===10?new Date(`${text}T12:00:00`):new Date(text);return d.toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'});}

function Reports(){
 const[type,setType]=useState('today'),[r,setR]=useState(null),[from,setFrom]=useState(localToday()),[to,setTo]=useState(localToday());
 async function load(){const q=type==='custom'?`/reports?type=custom&from=${from}&to=${to}`:`/reports?type=${type}`;setR(await api(q))}
 useEffect(()=>{load()},[type]);
 if(!r)return <Loading/>;
 return <><PageTitle title="Reports" subtitle={<>Daily, weekly, monthly and custom profitability <span className="report-date">{formatReportDate(r,type)}</span></>}/><div className="report-tabs">{[['today','Today'],['week','This Week'],['month','This Month'],['custom','Custom']].map(x=><button className={type===x[0]?'active':''} onClick={()=>setType(x[0])} key={x[0]}>{x[1]}</button>)}{type==='custom'&&<><input type="date" value={from} onChange={e=>setFrom(e.target.value)}/><input type="date" value={to} onChange={e=>setTo(e.target.value)}/><button className="primary small" onClick={load}>Apply</button></>}</div><div className="cards"><div className="stat"><span>Sales</span><strong>{money(r.summary.revenue)}</strong><small>Net sold plates × selling price</small></div><div className="stat"><span>Return Loss</span><strong>{money(r.summary.returnLoss)}</strong><small>Returned plates × cost of pieces used</small></div><div className="stat"><span>Making Cost</span><strong>{money(r.summary.makingCost)}</strong><small>Cost of plates sold</small></div><div className="stat"><span>Net Profit / Loss</span><strong className={r.summary.profit<0?'bad':''}>{money(r.summary.profit)}</strong><small>Net sales − making cost</small></div><div className="stat"><span>Total Plates Made</span><strong>{r.summary.platesMade}</strong><small>Plates entered as sold</small></div></div><div className="dashboard-grid"><ProfitChart daily={r.daily}/><DishProfitChart rows={r.byDish}/></div><div className="panel"><h3>Dish-wise performance</h3><div className="table-wrap compact"><table><thead><tr><th>Date</th><th>Dish</th><th>Plates Made</th><th>Plates Returns</th><th>Net Sold</th><th>Sales</th><th>Making Cost</th><th>Profit / Loss</th><th>Per Plate Profit / Loss</th></tr></thead><tbody>{(r.byDayDish||[]).map(x=><tr key={`${x.date}-${x.dish}`}><td>{formatTableDate(x.date)}</td><td><b>{x.dish}</b></td><td>{x.platesSell}</td><td>{x.returned}</td><td>{x.netSold}</td><td>{money(x.sales)}</td><td>{money(x.cost)}</td><td className={x.profit>=0?'good':'bad'}>{x.profit>=0?money(x.profit):`-₹${Math.abs(Number(x.profit||0)).toLocaleString('en-IN',{maximumFractionDigits:2})}`}</td><td className={x.perPlateProfitLoss>=0?'good':'bad'}>{x.perPlateProfitLoss>=0?money(x.perPlateProfitLoss):`-₹${Math.abs(Number(x.perPlateProfitLoss||0)).toLocaleString('en-IN',{maximumFractionDigits:2})}`}</td></tr>)}{!(r.byDayDish||[]).length&&<tr><td colSpan="9" className="empty">No sales data in this period.</td></tr>}</tbody></table></div></div></>
}

function ActualProfit(){
 const currentYear=new Date().getFullYear();
 const[month,setMonth]=useState(()=>localToday().slice(0,7));
 const[data,setData]=useState(null),[days,setDays]=useState([]),[months,setMonths]=useState([]),[years,setYears]=useState([]);
 const[monthYear,setMonthYear]=useState(String(currentYear));
 const[fromYear,setFromYear]=useState(String(Math.max(1970,currentYear-4))),[toYear,setToYear]=useState(String(currentYear));
 const[name,setName]=useState(''),[price,setPrice]=useState(''),[saving,setSaving]=useState(false),[edit,setEdit]=useState(null),[loadingOverview,setLoadingOverview]=useState(false);

 async function loadMonth(value=month){
   const [d,dayData]=await Promise.all([
     api(`/actual-profit?month=${value}`),
     api(`/actual-profit/days?month=${value}`)
   ]);
   setData(d);setDays(dayData.days||[]);
 }
 async function loadMonths(year=monthYear){
   const d=await api(`/actual-profit/months?year=${year}`);
   setMonths(d.months||[]);
 }
 async function loadYears(a=fromYear,b=toYear){
   const d=await api(`/actual-profit/years?from=${a}&to=${b}`);
   setYears(d.years||[]);
 }
 useEffect(()=>{loadMonth().catch(e=>alert(e.message))},[month]);
 useEffect(()=>{loadMonths().catch(e=>alert(e.message))},[monthYear]);
 useEffect(()=>{loadYears().catch(e=>alert(e.message))},[]);

 async function save(e){
   e.preventDefault();if(!name.trim()||price==='')return;setSaving(true);
   try{
     if(edit) await api(`/actual-profit/${edit._id}`,{method:'PUT',body:JSON.stringify({name,price:Number(price),month})});
     else await api('/actual-profit',{method:'POST',body:JSON.stringify({name,price:Number(price),month})});
     setName('');setPrice('');setEdit(null);await loadMonth();await loadMonths(month.slice(0,4));
   }catch(x){alert(x.message)}finally{setSaving(false)}
 }
 async function del(id){
   if(!confirm('Delete this ingredient from Actual Profit?'))return;
   try{await api(`/actual-profit/${id}`,{method:'DELETE'});await loadMonth();await loadMonths(month.slice(0,4))}catch(x){alert(x.message)}
 }
 function startEdit(item){setEdit(item);setName(item.name);setPrice(String(item.price))}
 function selectMonth(value){setMonth(value);setMonthYear(value.slice(0,4))}
 async function applyYears(){
   const a=Number(fromYear),b=Number(toYear);
   if(!Number.isInteger(a)||!Number.isInteger(b)||a<1970||b>2100||a>b)return alert('Please enter a valid year range.');
   setLoadingOverview(true);try{await loadYears(String(a),String(b))}catch(e){alert(e.message)}finally{setLoadingOverview(false)}
 }
 const monthLabel=(value)=>new Date(`${value}-01T12:00:00`).toLocaleDateString('en-IN',{month:'long',year:'numeric'});
 const dayDate=(value)=>new Date(`${value}T12:00:00`).toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'});
 const signedMoney=(value)=>Number(value||0)<0?`-₹${Math.abs(Number(value||0)).toLocaleString('en-IN',{maximumFractionDigits:2})}`:money(value);
 if(!data)return <Loading/>;
 return <>
  <PageTitle title="Actual Profit" subtitle={<>Day-wise, month-wise and year-wise actual profit <span className="report-date">{monthLabel(month)}</span></>}/>

  <div className="panel actual-profit-panel">
   <div className="actual-profit-head">
    <label>Month<input type="month" value={month} onChange={e=>selectMonth(e.target.value)}/></label>
    <div className="form-note">Actual Profit = Monthly Net Profit / Loss − Total ingredient prices entered for that month. Day-wise profit below does not subtract monthly ingredient expenses.</div>
   </div>
   <form className="actual-profit-form" onSubmit={save}>
    <label>Ingredient Name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter ingredient name" required/></label>
    <label>Price (₹)<input type="number" min="0" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} placeholder="Enter price" required/></label>
    <div className="form-actions actual-actions"><button type="button" className="ghost" onClick={()=>{setName('');setPrice('');setEdit(null)}}>{edit?'Cancel':'Clear'}</button><button className="primary" disabled={saving}><Save/> {saving?(edit?'Updating…':'Saving…'):(edit?'Update Ingredient':'Save Ingredient')}</button></div>
   </form>
   <div className="table-wrap"><table><thead><tr><th>Ingredient Name</th><th>Price</th><th>Actions</th></tr></thead><tbody>{data.items.map(item=><tr key={item._id}><td><b>{item.name}</b></td><td>{money(item.price)}</td><td className="actions"><button title="Edit" onClick={()=>startEdit(item)}><Edit3/></button><button className="danger" title="Delete" onClick={()=>del(item._id)}><Trash2/></button></td></tr>)}{!data.items.length&&<tr><td colSpan="3" className="empty">No ingredient prices added for this month.</td></tr>}</tbody></table></div>
   <div className="actual-profit-summary"><div className="stat"><span>Monthly Net Profit / Loss</span><strong className={data.netProfit<0?'bad':''}>{signedMoney(data.netProfit)}</strong><small>From the selected month’s sales</small></div><div className="stat"><span>Total Ingredient Price</span><strong>{money(data.totalIngredientPrice)}</strong><small>All manually entered ingredient prices</small></div><div className="stat actual-result"><span>Actual Profit</span><strong className={data.actualProfit<0?'bad':'good'}>{signedMoney(data.actualProfit)}</strong><small>Net Profit / Loss − ingredient prices</small></div></div>
  </div>

  <div className="panel actual-profit-section">
   <div className="section-head actual-section-head"><div><h3>Day-wise Profit</h3><p className="muted">Click any month below to see every date of that month and its profit.</p></div><span className="selected-period">{monthLabel(month)}</span></div>
   <div className="table-wrap"><table><thead><tr><th>Date</th><th>Profit / Loss</th><th>Day</th></tr></thead><tbody>{days.map(x=><tr key={x.date}><td>{dayDate(x.date)}</td><td className={x.profit>=0?'good':'bad'}>{signedMoney(x.profit)}</td><td>{x.day}</td></tr>)}{!days.length&&<tr><td colSpan="3" className="empty">No dates available.</td></tr>}</tbody></table></div>
  </div>

  <div className="panel actual-profit-section">
   <div className="section-head actual-section-head"><div><h3>Month-wise Actual Profit</h3><p className="muted">{monthYear} — click a month to open its date-wise profit and ingredient expenses.</p></div><label className="year-picker">Year<input type="number" min="1970" max="2100" value={monthYear} onChange={e=>setMonthYear(e.target.value)}/></label></div>
   <div className="table-wrap"><table><thead><tr><th>Month</th><th>Actual Profit</th></tr></thead><tbody>{months.map(x=><tr key={x.month} className={x.month===month?'clickable-row selected-row':''} onClick={()=>selectMonth(x.month)} title="Click to view this month's day-wise profit"><td><b>{x.monthName}</b></td><td className={x.actualProfit>=0?'good':'bad'}>{signedMoney(x.actualProfit)}</td></tr>)}{!months.length&&<tr><td colSpan="2" className="empty">No month data available.</td></tr>}</tbody></table></div>
   <div className="actual-year-total"><span>Total Actual Profit for {monthYear}</span><strong className={(months.reduce((s,x)=>s+Number(x.actualProfit||0),0))>=0?'good':'bad'}>{signedMoney(months.reduce((s,x)=>s+Number(x.actualProfit||0),0))}</strong></div>
  </div>

  <div className="panel actual-profit-section">
   <div className="section-head actual-section-head"><div><h3>Year-wise Actual Profit</h3><p className="muted">Each year is the total of that year’s 12 monthly Actual Profit values.</p></div><div className="year-range-controls"><label>From Year<input type="number" min="1970" max="2100" value={fromYear} onChange={e=>setFromYear(e.target.value)}/></label><label>To Year<input type="number" min="1970" max="2100" value={toYear} onChange={e=>setToYear(e.target.value)}/></label><button className="primary small" onClick={applyYears} disabled={loadingOverview}>{loadingOverview?'Loading…':'Apply'}</button></div></div>
   <div className="table-wrap"><table><thead><tr><th>Year</th><th>Actual Profit</th></tr></thead><tbody>{years.map(x=><tr key={x.year}><td><b>{x.year}</b></td><td className={x.actualProfit>=0?'good':'bad'}>{signedMoney(x.actualProfit)}</td></tr>)}{!years.length&&<tr><td colSpan="2" className="empty">No year data available.</td></tr>}</tbody></table></div>
  </div>
 </>
}

function App(){
 const[user,setUser]=useState(null),[page,setPage]=useState('dashboard'),[reload,setReload]=useState(0),[mobile,setMobile]=useState(false);
 useEffect(()=>{if(localStorage.getItem('fc_token'))api('/auth/me').then(x=>setUser(x.user)).catch(()=>localStorage.removeItem('fc_token'))},[]);
 if(!user)return <Login onLogin={setUser}/>;
 const nav=[['dashboard','Dashboard',LayoutDashboard],['ingredients','Ingredients',Boxes],['dishes','Dishes & Recipes',ChefHat],['sales','Daily Sales',ShoppingCart],['reports','Reports',BarChart3],['actual-profit','Actual Profit',Calculator]];
 function content(){if(page==='dashboard')return <Dashboard reload={reload}/>;if(page==='ingredients')return <Ingredients reload={reload} setReload={setReload}/>;if(page==='dishes')return <Dishes reload={reload} setReload={setReload}/>;if(page==='sales')return <Sales reload={reload} setReload={setReload}/>;if(page==='reports')return <Reports/>;if(page==='actual-profit')return <ActualProfit/>;return <Dashboard reload={reload}/>;}
 return <div className="app"><aside className={mobile?'open':''}><div className="brand side"><span>🍴</span><div><b>Food Cart</b><small>Manager</small></div></div><nav>{nav.map(([id,label,Icon])=><button key={id} className={page===id?'selected':''} onClick={()=>{setPage(id);setMobile(false)}}><Icon/>{label}</button>)}</nav><div className="side-bottom"><div className="user-mini">{user.name?.[0]?.toUpperCase()}<span>{user.name}<small>{user.email}</small></span></div><button onClick={()=>{localStorage.removeItem('fc_token');setUser(null)}}><LogOut/> Logout</button></div></aside><main><header><button className="mobile-menu" onClick={()=>setMobile(!mobile)}>{mobile?<X/>:<Menu/>}</button><div><b>Food Cart Cost & Profit</b><span>Personal management dashboard</span></div><button className="icon" onClick={()=>setReload(x=>x+1)} title="Refresh"><RefreshCw/></button></header><div className="content">{content()}</div></main></div>
}
createRoot(document.getElementById('root')).render(<App/>);

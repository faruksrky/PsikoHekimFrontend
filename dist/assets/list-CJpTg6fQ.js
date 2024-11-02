import{b as T,j as s,r as h,q as f,I as R,d as u,c as y,u as A,v as F,t as L,w as I,p as j,R as B,x as E,y as D,B as v,z as K,o as U,C as P,H as z}from"./index-vlb9HlXC.js";import"./user-new-edit-form-Bh5nnYQ-.js";import{T as O,a as m,C as H,F as W,b as g,c as b,u as _,g as G,r as M,d as $,e as V,f as X,h as Y,i as q,j as J,k as Q,l as Z,m as ee}from"./filters-result-CIMCH3Gm.js";import{C as se,a as ae}from"./Snackbar-CP_yv8-C.js";import{c as k,C as te,e as N,T as C,d as le,M as w,f as S,g as ne,h as oe}from"./form-provider-Bz6QP5Zw.js";import{B as re}from"./Button-B-JZ8GXM.js";import"./new-password-icon-BY2SX4NJ.js";function ie({row:e,selected:l,onSelectRow:o}){return T(),k(),s.jsx(s.Fragment,{children:s.jsxs(O,{hover:!0,selected:l,"aria-checked":l,tabIndex:-1,children:[s.jsx(m,{padding:"checkbox",children:s.jsx(te,{id:e.id,checked:l,onClick:o})}),s.jsx(m,{sx:{whiteSpace:"nowrap"},children:e.id}),s.jsx(m,{sx:{whiteSpace:"nowrap"},children:e.firstName}),s.jsx(m,{sx:{whiteSpace:"nowrap"},children:e.lastName}),s.jsx(m,{sx:{whiteSpace:"nowrap"},children:e.email}),s.jsx(m,{sx:{whiteSpace:"nowrap"},children:e.userName})]})})}function ce({filters:e,options:l,onResetPage:o}){const r=k(),i=h.useCallback(a=>{o(),e.setState({lastName:a.target.value})},[e,o]),c=h.useCallback(a=>{o(),e.setState({firstName:a.target.value})},[e,o]);return s.jsxs(s.Fragment,{children:[s.jsxs(f,{spacing:2,alignItems:{xs:"flex-end",md:"center"},direction:{xs:"column",md:"row"},sx:{p:2.5,pr:{xs:2.5,md:1}},children:[s.jsx(N,{sx:{flexShrink:0,width:{xs:1,md:200}},children:s.jsx(C,{fullWidth:!0,label:"Adı",value:e.state.firstName,onChange:c})}),s.jsx(N,{sx:{flexShrink:0,width:{xs:1,md:200}},children:s.jsx(C,{fullWidth:!0,label:"Soyadı",value:e.state.lastName,onChange:i})}),s.jsxs(f,{direction:"row",alignItems:"center",spacing:2,flexGrow:1,sx:{width:1},children:[s.jsx(C,{fullWidth:!0,value:e.state.name,onChange:c,placeholder:"Ara...",InputProps:{startAdornment:s.jsx(R,{position:"start",children:s.jsx(u,{icon:"eva:search-fill",sx:{color:"text.disabled"}})})}}),s.jsx(y,{onClick:r.onOpen,children:s.jsx(u,{icon:"eva:more-vertical-fill"})})]})]}),s.jsx(H,{open:r.open,anchorEl:r.anchorEl,onClose:r.onClose,slotProps:{arrow:{placement:"right-top"}},children:s.jsxs(le,{children:[s.jsxs(w,{onClick:()=>{r.onClose()},children:[s.jsx(u,{icon:"solar:printer-minimalistic-bold"}),"Print"]}),s.jsxs(w,{onClick:()=>{r.onClose()},children:[s.jsx(u,{icon:"solar:import-bold"}),"Import"]}),s.jsxs(w,{onClick:()=>{r.onClose()},children:[s.jsx(u,{icon:"solar:export-bold"}),"Export"]})]})})]})}function de({filters:e,onResetPage:l,totalResults:o,sx:r}){const i=h.useCallback(()=>{l(),e.setState({firstName:""})},[e,l]),c=h.useCallback(()=>{l(),e.setState({lastName:""})},[e,l]),a=h.useCallback(()=>{l(),e.setState({status:"all"})},[e,l]),n=h.useCallback(()=>{l(),e.onResetState()},[e,l]);return s.jsxs(W,{totalResults:o,onReset:n,sx:r,children:[s.jsx(g,{label:"Servis Tamamlanma Durumu:",isShow:e.state.status!=="all",children:s.jsx(S,{...b,label:e.state.status,onDelete:a,sx:{textTransform:"capitalize"}})}),s.jsx(g,{label:"Adı:",isShow:!!e.state.firstName,children:s.jsx(S,{...b,label:e.state.firstName,onDelete:i})}),s.jsx(g,{label:"Soyadı:",isShow:!!e.state.lastName,children:s.jsx(S,{...b,label:e.state.lastName,onDelete:c})})]})}const he=[{value:"all",label:"Liste"}],xe=[{id:"id",label:"ID"},{id:"firstName",label:"Ad"},{id:"lastName",label:"Soyad"},{id:"email",label:"Email"},{id:"userName",label:"Kullanıcı Adı"}];function me(){const e=_();A();const l=T();h.useState(!0);const[o,r]=h.useState([]),i=F({firstName:"",lastName:"",status:"all"}),c=sessionStorage.getItem(L);h.useEffect(()=>{(async()=>{try{const d=await U.get(P.usersListUrl,{headers:{Authorization:`Bearer ${c}`}});r(d.data)}catch(d){console.error("error",d)}})()},[c]);const a=ue({inputData:o,comparator:G(e.order,e.orderBy),filters:i.state});M(a,e.page,e.rowsPerPage);const n=!!i.state.firstName||i.state.lastName,x=!a.length&&n||!a.length,p=(t,d)=>{" "};return s.jsxs(s.Fragment,{children:[s.jsxs(I,{children:[s.jsx(se,{heading:"Kullanıcı Listesi",links:[{name:"Dashboard",href:j.dashboard.root},{name:"Kullanıcı",href:j.dashboard.user.root},{name:"Kullanıcı Listesi"}],action:s.jsx(re,{component:B,href:j.dashboard.user.new,variant:"contained",startIcon:s.jsx(u,{icon:"mingcute:add-line"}),children:"Yeni Kullanıcı"}),sx:{mb:{xs:3,md:5}}}),s.jsxs(ae,{sx:{width:"100%",overflowX:"auto"},children:[s.jsx(ne,{value:i.state.status,onChange:p,sx:{px:2.5,boxShadow:t=>`inset 0 -2px 0 0 ${E(t.vars.palette.grey["500Channel"],.08)}`},children:he.map(t=>s.jsx(oe,{iconPosition:"end",value:t.value,label:t.label,icon:s.jsx(D,{variant:(t.value==="all"||t.value===i.state.status)&&"filled"||"soft",children:["active","pending","banned","rejected"].includes(t.value)?o.filter(d=>d.status===t.value).length:o.length})},t.value))}),s.jsx(ce,{filters:i,onResetPage:e.onResetPage}),n&&s.jsx(de,{filters:i,totalResults:a.length,onResetPage:e.onResetPage,sx:{p:2.5,pt:0}}),s.jsxs(v,{sx:{position:"relative"},children:[s.jsx($,{dense:e.dense,numSelected:e.selected.length,rowCount:a.length,onSelectAllRows:t=>e.onSelectAllRows(t,a.map(d=>d.id))}),s.jsx(v,{sx:{position:"relative",height:"500px",display:"flex",justifyContent:"flex-start",width:"100%",overflowX:"auto"},children:s.jsx(K,{children:s.jsxs(V,{size:e.dense?"small":"medium",sx:{minWidth:1500,width:"100%"},children:[s.jsx(X,{order:e.order,orderBy:e.orderBy,headLabel:xe,rowCount:a.length,numSelected:e.selected.length,onSort:e.onSort,onSelectAllRows:t=>e.onSelectAllRows(t,a.map(d=>d.id))}),s.jsxs(Y,{children:[a.slice(e.page*e.rowsPerPage,e.page*e.rowsPerPage+e.rowsPerPage).map(t=>s.jsx(ie,{row:t,selected:e.selected.includes(t.id),onSelectRow:()=>e.onSelectRow(t.id)},t.id)),s.jsx(q,{height:e.dense?56:76,emptyRows:J(e.page,e.rowsPerPage,a.length)}),s.jsx(Q,{notFound:x})]})]})})})]}),s.jsx(Z,{page:e.page,dense:e.dense,count:a.length,rowsPerPage:e.rowsPerPage,onPageChange:e.onChangePage,onChangeDense:e.onChangeDense,onRowsPerPageChange:e.onChangeRowsPerPage})]})]}),s.jsx(ee,{open:l.value,onClose:l.onFalse})]})}function ue({inputData:e,comparator:l,filters:o}){const{firstName:r,lastName:i,status:c}=o;if(!Array.isArray(e))return console.error("inputData is not an array:",e),[];const a=e.map((n,x)=>[n,x]);return a.sort((n,x)=>{const p=l(n[0],x[0]);return p!==0?p:n[1]-x[1]}),e=a.map(n=>n[0]),r&&(e=e.filter(n=>n.firstName.toLowerCase().includes(r.toLowerCase()))),i&&(e=e.filter(n=>n.lastName.toLowerCase().includes(i.toLowerCase()))),c!=="all"&&(e=e.filter(n=>n.status===c)),e}const pe={title:`Kullanıcı Listesi | Dashboard - ${P.appName}`};function ve(){return s.jsxs(s.Fragment,{children:[s.jsx(z,{children:s.jsx("title",{children:pe.title})}),s.jsx(me,{})]})}export{ve as default};

import{b as P,j as s,r as h,F as S,I as y,d as u,c as R,W as g,u as F,a3 as A,a7 as L,a4 as I,p as j,o as B,R as E,y as D,a8 as O,B as v,N as W,a9 as z,C as T,H}from"./index-C93MCRui.js";import"./psychologist-new-edit-form-yaale4CC.js";import{T as _,a as x,u as G,g as K,r as M,b as $,c as U,d as V,e as X,f as Y,h as q,i as J,j as Q,C as Z}from"./table-pagination-custom-cXpcQbpv.js";import{C as ee}from"./Snackbar-CsnZb_x7.js";import{b as k,e as se,f as N,T as b,M as ae,d as C,g as te,h as oe}from"./form-provider-C9iOJ1LY.js";import{C as le,F as ne,a as w,c as f}from"./filters-result-Bdl42qqn.js";import{C as re}from"./Card-Ce3bea7q.js";import"./tr-Dnx_KkQs.js";function ie({row:e,selected:o,onSelectRow:n}){return P(),k(),s.jsx(s.Fragment,{children:s.jsxs(_,{hover:!0,selected:o,"aria-checked":o,tabIndex:-1,children:[s.jsx(x,{padding:"checkbox",children:s.jsx(se,{id:e.id,checked:o,onClick:n})}),s.jsx(x,{sx:{whiteSpace:"nowrap"},children:e.id}),s.jsx(x,{sx:{whiteSpace:"nowrap"},children:e.firstName}),s.jsx(x,{sx:{whiteSpace:"nowrap"},children:e.lastName}),s.jsx(x,{sx:{whiteSpace:"nowrap"},children:e.email}),s.jsx(x,{sx:{whiteSpace:"nowrap"},children:e.userName})]})})}function ce({filters:e,options:o,onResetPage:n}){const r=k(),i=h.useCallback(a=>{n(),e.setState({lastName:a.target.value})},[e,n]),c=h.useCallback(a=>{n(),e.setState({firstName:a.target.value})},[e,n]);return s.jsxs(s.Fragment,{children:[s.jsxs(S,{spacing:2,alignItems:{xs:"flex-end",md:"center"},direction:{xs:"column",md:"row"},sx:{p:2.5,pr:{xs:2.5,md:1}},children:[s.jsx(N,{sx:{flexShrink:0,width:{xs:1,md:200}},children:s.jsx(b,{fullWidth:!0,label:"Adı",value:e.state.firstName,onChange:c})}),s.jsx(N,{sx:{flexShrink:0,width:{xs:1,md:200}},children:s.jsx(b,{fullWidth:!0,label:"Soyadı",value:e.state.lastName,onChange:i})}),s.jsxs(S,{direction:"row",alignItems:"center",spacing:2,flexGrow:1,sx:{width:1},children:[s.jsx(b,{fullWidth:!0,value:e.state.name,onChange:c,placeholder:"Ara...",InputProps:{startAdornment:s.jsx(y,{position:"start",children:s.jsx(u,{icon:"eva:search-fill",sx:{color:"text.disabled"}})})}}),s.jsx(R,{onClick:r.onOpen,children:s.jsx(u,{icon:"eva:more-vertical-fill"})})]})]}),s.jsx(le,{open:r.open,anchorEl:r.anchorEl,onClose:r.onClose,slotProps:{arrow:{placement:"right-top"}},children:s.jsxs(ae,{children:[s.jsxs(g,{onClick:()=>{r.onClose()},children:[s.jsx(u,{icon:"solar:printer-minimalistic-bold"}),"Print"]}),s.jsxs(g,{onClick:()=>{r.onClose()},children:[s.jsx(u,{icon:"solar:import-bold"}),"Import"]}),s.jsxs(g,{onClick:()=>{r.onClose()},children:[s.jsx(u,{icon:"solar:export-bold"}),"Export"]})]})})]})}function de({filters:e,onResetPage:o,totalResults:n,sx:r}){const i=h.useCallback(()=>{o(),e.setState({firstName:""})},[e,o]),c=h.useCallback(()=>{o(),e.setState({lastName:""})},[e,o]),a=h.useCallback(()=>{o(),e.setState({status:"all"})},[e,o]),l=h.useCallback(()=>{o(),e.onResetState()},[e,o]);return s.jsxs(ne,{totalResults:n,onReset:l,sx:r,children:[s.jsx(w,{label:"Servis Tamamlanma Durumu:",isShow:e.state.status!=="all",children:s.jsx(C,{...f,label:e.state.status,onDelete:a,sx:{textTransform:"capitalize"}})}),s.jsx(w,{label:"Adı:",isShow:!!e.state.firstName,children:s.jsx(C,{...f,label:e.state.firstName,onDelete:i})}),s.jsx(w,{label:"Soyadı:",isShow:!!e.state.lastName,children:s.jsx(C,{...f,label:e.state.lastName,onDelete:c})})]})}const he=[{value:"all",label:"Liste"}],me=[{id:"id",label:"ID"},{id:"firstName",label:"Ad"},{id:"lastName",label:"Soyad"},{id:"email",label:"Email"},{id:"userName",label:"Kullanıcı Adı"}];function xe(){const e=G();F();const o=P();h.useState(!0);const[n,r]=h.useState([]),i=A({firstName:"",lastName:"",status:"all"}),c=sessionStorage.getItem(L);h.useEffect(()=>{(async()=>{try{const d=await z.get(T.usersListUrl,{headers:{Authorization:`Bearer ${c}`}});r(d.data)}catch(d){console.error("error",d)}})()},[c]);const a=ue({inputData:n,comparator:K(e.order,e.orderBy),filters:i.state});M(a,e.page,e.rowsPerPage);const l=!!i.state.firstName||i.state.lastName,m=!a.length&&l||!a.length,p=(t,d)=>{" "};return s.jsxs(s.Fragment,{children:[s.jsxs(I,{children:[s.jsx(ee,{heading:"Kullanıcı Listesi",links:[{name:"Dashboard",href:j.dashboard.root},{name:"Psikolog",href:j.dashboard.user.root},{name:"Psikolog Listesi"}],action:s.jsx(B,{component:E,href:j.dashboard.user.new,variant:"contained",startIcon:s.jsx(u,{icon:"mingcute:add-line"}),children:"Yeni Piskolog"}),sx:{mb:{xs:3,md:5}}}),s.jsxs(re,{sx:{width:"100%",overflowX:"auto"},children:[s.jsx(te,{value:i.state.status,onChange:p,sx:{px:2.5,boxShadow:t=>`inset 0 -2px 0 0 ${D(t.vars.palette.grey["500Channel"],.08)}`},children:he.map(t=>s.jsx(oe,{iconPosition:"end",value:t.value,label:t.label,icon:s.jsx(O,{variant:(t.value==="all"||t.value===i.state.status)&&"filled"||"soft",children:["active","pending","banned","rejected"].includes(t.value)?n.filter(d=>d.status===t.value).length:n.length})},t.value))}),s.jsx(ce,{filters:i,onResetPage:e.onResetPage}),l&&s.jsx(de,{filters:i,totalResults:a.length,onResetPage:e.onResetPage,sx:{p:2.5,pt:0}}),s.jsxs(v,{sx:{position:"relative"},children:[s.jsx($,{dense:e.dense,numSelected:e.selected.length,rowCount:a.length,onSelectAllRows:t=>e.onSelectAllRows(t,a.map(d=>d.id))}),s.jsx(v,{sx:{position:"relative",height:"500px",display:"flex",justifyContent:"flex-start",width:"100%",overflowX:"auto"},children:s.jsx(W,{children:s.jsxs(U,{size:e.dense?"small":"medium",sx:{minWidth:1500,width:"100%"},children:[s.jsx(V,{order:e.order,orderBy:e.orderBy,headLabel:me,rowCount:a.length,numSelected:e.selected.length,onSort:e.onSort,onSelectAllRows:t=>e.onSelectAllRows(t,a.map(d=>d.id))}),s.jsxs(X,{children:[a.slice(e.page*e.rowsPerPage,e.page*e.rowsPerPage+e.rowsPerPage).map(t=>s.jsx(ie,{row:t,selected:e.selected.includes(t.id),onSelectRow:()=>e.onSelectRow(t.id)},t.id)),s.jsx(Y,{height:e.dense?56:76,emptyRows:q(e.page,e.rowsPerPage,a.length)}),s.jsx(J,{notFound:m})]})]})})})]}),s.jsx(Q,{page:e.page,dense:e.dense,count:a.length,rowsPerPage:e.rowsPerPage,onPageChange:e.onChangePage,onChangeDense:e.onChangeDense,onRowsPerPageChange:e.onChangeRowsPerPage})]})]}),s.jsx(Z,{open:o.value,onClose:o.onFalse})]})}function ue({inputData:e,comparator:o,filters:n}){const{firstName:r,lastName:i,status:c}=n;if(!Array.isArray(e))return console.error("inputData is not an array:",e),[];const a=e.map((l,m)=>[l,m]);return a.sort((l,m)=>{const p=o(l[0],m[0]);return p!==0?p:l[1]-m[1]}),e=a.map(l=>l[0]),r&&(e=e.filter(l=>l.firstName.toLowerCase().includes(r.toLowerCase()))),i&&(e=e.filter(l=>l.lastName.toLowerCase().includes(i.toLowerCase()))),c!=="all"&&(e=e.filter(l=>l.status===c)),e}const pe={title:`Piskolog Listesi | Dashboard - ${T.appName}`};function Ne(){return s.jsxs(s.Fragment,{children:[s.jsx(H,{children:s.jsx("title",{children:pe.title})}),s.jsx(xe,{})]})}export{Ne as default};

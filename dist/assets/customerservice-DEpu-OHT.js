import{r as p,j as a,D as X,A as Y,B as f,k as M,W as J,n as Z,C as P,o as O,b as k,q as F,s as C,c as U,d as T,t as ee,I as ae,u as se,v as le,w as te,p as ie,x as ne,y as oe,z as re,H as de}from"./index-vlb9HlXC.js";import{D as ce,T as he,a as c,C as _,F as pe,b as D,c as N,u as xe,g as me,r as ue,d as ge,e as je,f as Se,h as be,i as ve,j as we,k as Te,l as ye,m as fe}from"./filters-result-CIMCH3Gm.js";import{s as Pe,S as De,M as Ne,C as Ae,a as ke}from"./Snackbar-CP_yv8-C.js";import{z as x,i as Fe,u as Ee,t as Oe,a as Re,D as Le,F as m,M as v,b as Ie,L as Be,c as W,C as V,d as H,e as ze,I as Ge,S as Me,O as Ue,T as _e,f as A,g as We,h as Ve}from"./form-provider-Bz6QP5Zw.js";import{B as He}from"./Button-B-JZ8GXM.js";const $e=x.object({customerFirstName:x.string().min(1,{message:"İsim zorunludur!"}),customerLastName:x.string().min(1,{message:"Soyisim zorunludur!"}),phoneNumber:Pe.phoneNumber({isValidPhoneNumber:Fe}),emailAddress:x.string().email({message:"Geçerli bir e-posta girin!"}),address:x.string().min(1,{message:"Adres zorunludur!"}),productName:x.string().min(1,{message:"Ürün adı zorunludur!"}),faultDescription:x.string().optional(),faultDate:x.string().optional(),servicePersonnel:x.string().optional(),serviceCompletionStatus:x.string().optional(),warrantyStatus:x.string().optional(),cargoStatus:x.string().optional(),operationDate:x.string().optional(),deliveryDate:x.string().optional(),notes:x.string().optional()});function Ke({currentCustomer:e,open:t,onClose:o,fetchData:r,userNamesFromQuick:g}){const j=p.useMemo(()=>({id:(e==null?void 0:e.id)||"",customerFirstName:(e==null?void 0:e.customerFirstName)||"",customerLastName:(e==null?void 0:e.customerLastName)||"",phoneNumber:e!=null&&e.phoneNumber?`+90${e==null?void 0:e.phoneNumber}`:"",emailAddress:(e==null?void 0:e.emailAddress)||"",address:(e==null?void 0:e.address)||"",productName:(e==null?void 0:e.productName)||"",faultDescription:(e==null?void 0:e.faultDescription)||"",faultDate:(e==null?void 0:e.faultDate)||"",servicePersonnel:(e==null?void 0:e.servicePersonnel)||"",serviceCompletionStatus:(e==null?void 0:e.serviceCompletionStatus)||"",operationDate:(e==null?void 0:e.operationDate)||"",warrantyStatus:(e==null?void 0:e.warrantyStatus)||"",cargoStatus:(e==null?void 0:e.cargoStatus)||"",deliveryDate:(e==null?void 0:e.deliveryDate)||"",notes:(e==null?void 0:e.notes)||""}),[e]),l=Ee({resolver:Oe($e),defaultValues:j}),{handleSubmit:s}=l,{reset:n,formState:{isSubmitting:w},watch:y}=l,[R,i]=p.useState(!1),S=y("servicePersonnel"),[$,L]=p.useState(""),[K,I]=p.useState("success"),Q=d=>{const B=["customerLastName","customerFirstName","phoneNumber","emailAddress","address","productName","faultDescription","faultDate"],z=Object.keys(d).filter(b=>!B.includes(b)).reduce((b,G)=>(b[G]=d[G],b),{});B.forEach(b=>{e[b]&&(z[b]=e[b])});const q=`${P.customerUpdateUrl}${e.id}`;O.put(q,z).then(b=>{L("Güncelleme işlemi başarılı!"),I("success"),i(!0),r(),o()}).catch(b=>{console.error("Güncelleme işleminde hata oluştu:",b),L("Güncelleme işleminde hata oluştu!"),I("error"),i(!0)})};return a.jsxs(X,{fullWidth:!0,maxWidth:!1,open:t,onClose:o,PaperProps:{sx:{maxWidth:720}},children:[a.jsxs(Re,{methods:l,onSubmit:s(Q),children:[a.jsx(ce,{children:"Müşteri Teknik Servis Bilgilerini Güncelle"}),a.jsxs(Le,{children:[a.jsx(Y,{variant:"outlined",severity:"info",sx:{mb:3},children:"Bilgileri girdikten sonra güncelle butonuna basınız"}),a.jsxs(f,{rowGap:3,columnGap:2,display:"grid",gridTemplateColumns:{xs:"repeat(1, 1fr)",sm:"repeat(2, 1fr)"},children:[a.jsx(m.Text,{name:"customerFirstName",label:"İsim",readOnly:!0}),a.jsx(m.Text,{name:"customerLastName",label:"Soyisim",readOnly:!0}),a.jsx(m.Phone,{name:"phoneNumber",label:"Telefon",readOnly:!0}),a.jsx(m.Text,{name:"emailAddress",label:"E-posta",readOnly:!0}),a.jsx(m.Text,{name:"address",label:"Adres",readOnly:!0}),a.jsx(m.Text,{name:"productName",label:"Ürün Adı",readOnly:!0}),a.jsx(m.Text,{name:"faultDescription",label:"Arıza Tanımı",readOnly:!0}),a.jsx(m.DatePicker,{name:"faultDate",label:"Arıza Tarihi",readOnly:!0}),a.jsx(m.Select,{name:"servicePersonnel",label:"Servis Personeli",value:S,children:g.map(d=>a.jsx(v,{value:d,children:d},d))}),a.jsx(m.Select,{name:"serviceCompletionStatus",label:"Servis Durumu",children:M.map(d=>a.jsx(v,{value:d.value,children:d.label},d.value))}),a.jsx(m.Select,{name:"warrantyStatus",label:"Garanti Durumu",children:J.map(d=>a.jsx(v,{value:d.value,children:d.label},d.value))}),a.jsx(m.Select,{name:"cargoStatus",label:"Kargo Durumu",children:Z.map(d=>a.jsx(v,{value:d.value,children:d.label},d.value))}),a.jsx(m.DatePicker,{name:"operationDate",label:"Operasyon Tarihi"}),a.jsx(m.DatePicker,{name:"deliveryDate",label:"Teslim Tarihi"}),a.jsx(m.Text,{name:"notes",label:"Notlar"})]})]}),a.jsxs(Ie,{children:[a.jsx(He,{variant:"outlined",onClick:o,children:"İptal"}),a.jsx(Be,{type:"submit",variant:"contained",tabIndex:-1,children:"Güncelle"})]})]}),a.jsx(De,{open:t,autoHideDuration:6e3,children:a.jsx(Ne,{severity:K,sx:{width:"100%"},children:$})})]})}function u(e){const o=document.createElement("canvas").getContext("2d");return o.font="16px Arial",o.measureText(e).width}function Qe({row:e,selected:t,onEditRow:o,onSelectRow:r,userNames:g,fetchData:j}){k();const l=k(),s=W();return a.jsxs(a.Fragment,{children:[a.jsxs(he,{hover:!0,selected:t,"aria-checked":t,tabIndex:-1,children:[a.jsx(c,{padding:"checkbox",children:a.jsx(V,{id:e.id.toString(),checked:t,onClick:r})}),a.jsx(c,{style:{width:u(e.customerFirstName)},sx:{whiteSpace:"nowrap"},children:e.customerFirstName}),a.jsx(c,{style:{width:u(e.customerLastName)},sx:{whiteSpace:"nowrap"},children:e.customerLastName}),a.jsx(c,{style:{width:u(e.phoneNumber)},sx:{whiteSpace:"nowrap"},children:e.phoneNumber}),a.jsx(c,{style:{width:u(e.emailAddress)},sx:{whiteSpace:"nowrap"},children:e.emailAddress}),a.jsx(c,{style:{width:u(e.address)},sx:{whiteSpace:"nowrap"},children:e.address}),a.jsx(c,{style:{width:u(e.productName)},sx:{whiteSpace:"nowrap"},children:e.productName}),a.jsx(c,{style:{width:u(e.faultDescription)},sx:{whiteSpace:"nowrap"},children:e.faultDescription}),a.jsx(c,{style:{width:u(e.faultDate)},sx:{whiteSpace:"nowrap"},children:e.faultDate}),a.jsx(c,{style:{width:u(e.servicePersonnel)},sx:{whiteSpace:"nowrap"},children:e.servicePersonnel}),a.jsx(c,{style:{width:u(e.warrantyStatus)},sx:{whiteSpace:"nowrap"},children:e.warrantyStatus}),a.jsx(c,{style:{width:u(e.cargoStatus)},sx:{whiteSpace:"nowrap"},children:e.cargoStatus}),a.jsx(c,{style:{width:u(e.serviceCompletionStatus)},sx:{whiteSpace:"nowrap"},children:e.serviceCompletionStatus}),a.jsx(c,{style:{width:u(e.operationDate)},sx:{whiteSpace:"nowrap"},children:e.operationDate}),a.jsx(c,{style:{width:u(e.deliveryDate)},sx:{whiteSpace:"nowrap"},children:e.deliveryDate}),a.jsx(c,{style:{width:u(e.notes)},sx:{whiteSpace:"nowrap"},children:e.notes}),a.jsx(c,{children:a.jsx(F,{direction:"row",alignItems:"center",children:a.jsx(C,{title:"Tabloya Ekle",placement:"top",arrow:!0,children:a.jsx(U,{color:l.value?"inherit":"default",onClick:l.onTrue,children:a.jsx(T,{icon:"solar:pen-bold"})})})})})]}),a.jsx(Ke,{currentCustomer:e,open:l.value,onClose:l.onFalse,userNamesFromQuick:g,fetchData:j}),a.jsx(_,{open:s.open,anchorEl:s.anchorEl,onClose:s.onClose,slotProps:{arrow:{placement:"right-top"}},children:a.jsx(H,{children:a.jsxs(v,{onClick:()=>{o(),s.onClose()},children:[a.jsx(T,{icon:"solar:pen-bold"}),"Edit"]})})})]})}const qe=sessionStorage.getItem(ee);let E=[];const Xe=async()=>{try{E=(await O.get(P.usersListUserName,{headers:{Authorization:`Bearer ${qe}`}})).data}catch(e){console.error("error",e)}},Ye=async()=>(E.length===0&&await Xe(),E);function Je({filters:e,onResetPage:t,userNames:o}){const r=W(),g=p.useCallback(l=>{t(),e.setState({name:l.target.value})},[e,t]),j=p.useCallback(l=>{const s=typeof l.target.value=="string"?l.target.value.split(","):l.target.value;t(),e.setState({role:s})},[e,t]);return a.jsxs(a.Fragment,{children:[a.jsxs(F,{spacing:2,alignItems:{xs:"flex-end",md:"center"},direction:{xs:"column",md:"row"},sx:{p:2.5,pr:{xs:2.5,md:1}},children:[a.jsxs(ze,{sx:{flexShrink:0,width:{xs:200,md:350}},children:[a.jsx(Ge,{htmlFor:"user-filter-role-select-label",children:"Servis Personeli"}),a.jsx(Me,{fullWidth:!0,multiple:!0,value:e.state.role,onChange:j,input:a.jsx(Ue,{label:"ServisPersoneli"}),renderValue:l=>l.map(s=>s).join(", "),inputProps:{id:"user-filter-role-select-label"},MenuProps:{PaperProps:{sx:{maxHeight:240}}},children:(o||[]).map(l=>a.jsxs(v,{value:l,children:[a.jsx(V,{id:l.toString(),disableRipple:!0,size:"small",checked:e.state.role.includes(l)}),l]},l))})]}),a.jsxs(F,{direction:"row",alignItems:"center",spacing:2,flexGrow:1,sx:{width:1},children:[a.jsx(_e,{fullWidth:!0,value:e.state.name,onChange:g,placeholder:"Ara...",InputProps:{startAdornment:a.jsx(ae,{position:"start",children:a.jsx(T,{icon:"eva:search-fill",sx:{color:"text.disabled"}})})}}),a.jsx(U,{onClick:r.onOpen,children:a.jsx(T,{icon:"eva:more-vertical-fill"})})]})]}),a.jsx(_,{open:r.open,anchorEl:r.anchorEl,onClose:r.onClose,slotProps:{arrow:{placement:"right-top"}},children:a.jsxs(H,{children:[a.jsxs(v,{onClick:()=>{r.onClose()},children:[a.jsx(T,{icon:"solar:printer-minimalistic-bold"}),"Print"]}),a.jsxs(v,{onClick:()=>{r.onClose()},children:[a.jsx(T,{icon:"solar:import-bold"}),"Import"]}),a.jsxs(v,{onClick:()=>{r.onClose()},children:[a.jsx(T,{icon:"solar:export-bold"}),"Export"]})]})})]})}const Ze=async()=>{try{const e=await O.get(P.customerListUrl);return Array.isArray(e.data)?e.data:[]}catch(e){return console.error("Error fetching customer list",e),[]}};function Ce({filters:e,onResetPage:t,totalResults:o,sx:r}){const g=p.useCallback(()=>{t(),e.setState({name:""})},[e,t]),j=p.useCallback(()=>{t(),e.setState({status:"all"})},[e,t]),l=p.useCallback(n=>{const w=e.state.role.filter(y=>y!==n);t(),e.setState({role:w})},[e,t]),s=p.useCallback(()=>{t(),e.onResetState()},[e,t]);return a.jsxs(pe,{totalResults:o,onReset:s,sx:r,children:[a.jsx(D,{label:"Servis Tamamlanma Durumu:",isShow:e.state.status!=="all",children:a.jsx(A,{...N,label:e.state.status,onDelete:j,sx:{textTransform:"capitalize"}})}),a.jsx(D,{label:"Role:",isShow:!!e.state.role.length,children:e.state.role.map(n=>p.createElement(A,{...N,key:n,label:n,onDelete:()=>l(n)}))}),a.jsx(D,{label:"Keyword:",isShow:!!e.state.name,children:a.jsx(A,{...N,label:e.state.name,onDelete:g})})]})}const ea=[{value:"all",label:"Liste"},...M],h=e=>{const o=e.length*8;return Math.max(o,200)},aa=[{id:"customerFirstName",label:"İsim",width:h("İsim")},{id:"customerLastName",label:"Soyisim",width:h("Soyisim")},{id:"phoneNumber",label:"Telefon",width:h("Telefon")},{id:"emailAddress",label:"E-Posta",width:h("E-Posta")},{id:"address",label:"Adres",width:h("Adres")},{id:"productName",label:"Ürün Adı",width:h("Ürün Adı")},{id:"faultDescription",label:"Arıza Tanımı",width:h("Arıza Tanımı")},{id:"faultDate",label:"Arıza Tarihi",width:h("Arıza Tarihi")},{id:"servicePersonnel",label:"Servis Personeli",width:h("Servis Personeli")},{id:"warrantyStatus",label:"Garanti Durumu",width:h("Garanti Durumu")},{id:"cargoStatus",label:"Kargo Durumu",width:h("Kargo Durumu")},{id:"serviceCompletionStatus",label:"Servis Tamamlanma Durumu",width:h("Servis Tamamlanma Durum")},{id:"operationDate",label:"Operasyon Tarihi",width:h("Operasyon Tarihi")},{id:"deliveryDate",label:"Teslim Tarihi",width:h("Teslim Tarihi")},{id:"notes",label:"Notlar",width:h("Notlar")},{id:"",label:"",width:h("")}];function sa(){const e=xe();se();const t=k(),[o,r]=p.useState([]),[g,j]=p.useState([]),l=async()=>{const i=await Ze();r(i)};p.useEffect(()=>{l()},[]),p.useEffect(()=>{(async()=>{const S=await Ye();j(S)})()},[]);const s=le({customerFirstName:"",customerLastName:"",role:[],status:"all"}),n=la({inputData:o,comparator:me(e.order,e.orderBy),filters:s.state});ue(n,e.page,e.rowsPerPage);const w=!!s.state.customerFirstName||!!s.state.customerLastName||s.state.role.length>0||s.state.status!=="all",y=!n.length&&w||!n.length,R=p.useCallback((i,S)=>{e.onResetPage(),s.setState({status:S})},[s,e]);return a.jsxs(a.Fragment,{children:[a.jsx(te,{maxWidth:"xl",children:a.jsxs(f,{sx:{display:"flex",flexDirection:"column",alignItems:"flex-start",width:"100%"},children:[a.jsx(Ae,{heading:"Müşteri Teknik Servis Bilgileri",links:[{name:"Dashboard",href:ie.dashboard.root},{name:"Teknik Servis Listesi"}],sx:{mb:{xs:3,md:5}}}),a.jsxs(ke,{sx:{width:"100%",overflowX:"auto"},children:[a.jsx(We,{value:s.state.status,onChange:R,sx:{px:2.5,boxShadow:i=>`inset 0 -2px 0 0 ${ne(i.vars.palette.grey["500Channel"],.08)}`},children:ea.map(i=>a.jsx(Ve,{iconPosition:"end",value:i.value,label:i.label,icon:a.jsx(oe,{variant:(i.value==="all"||i.value===s.state.status)&&"filled"||"soft",color:i.value==="Teslim_Edildi"&&"success"||i.value==="Tamamlandı"&&"warning"||i.value==="Beklemede"&&"error"||"default",children:["Teslim_Edildi","Tamamlandı","Beklemede"].includes(i.value)?o.filter(S=>S.serviceCompletionStatus===i.value).length:o.length})},i.value))}),a.jsx(Je,{filters:s,onResetPage:e.onResetPage,userNames:g}),w&&a.jsx(Ce,{filters:s,totalResults:n.length,onResetPage:e.onResetPage,sx:{p:2.5,pt:0}}),a.jsxs(f,{sx:{position:"relative"},children:[a.jsx(ge,{dense:e.dense,numSelected:e.selected.length,rowCount:n.length,onSelectAllRows:i=>e.onSelectAllRows(i,n.map(S=>S.id))}),a.jsx(f,{sx:{position:"relative",height:"500px",display:"flex",justifyContent:"flex-start",width:"100%",overflowX:"auto"},children:a.jsx(re,{children:a.jsxs(je,{size:e.dense?"small":"medium",sx:{minWidth:1500,width:"100%"},children:[a.jsx(Se,{order:e.order,orderBy:e.orderBy,headLabel:aa,rowCount:n.length,numSelected:e.selected.length,onSort:e.onSort,onSelectAllRows:i=>e.onSelectAllRows(i,n.map(S=>S.id))}),a.jsxs(be,{children:[n.slice(e.page*e.rowsPerPage,e.page*e.rowsPerPage+e.rowsPerPage).map(i=>a.jsx(Qe,{fetchData:l,row:i,selected:e.selected.includes(i.id),onSelectRow:()=>e.onSelectRow(i.id),userNames:g},i.id)),a.jsx(ve,{height:e.dense?56:76,emptyRows:we(e.page,e.rowsPerPage,n.length)}),a.jsx(Te,{notFound:y})]})]})})})]}),a.jsx(ye,{page:e.page,dense:e.dense,count:n.length,rowsPerPage:e.rowsPerPage,onPageChange:e.onChangePage,onChangeDense:e.onChangeDense,onRowsPerPageChange:e.onChangeRowsPerPage})]})]})}),a.jsx(fe,{open:t.value,onClose:t.onFalse})]})}function la({inputData:e,comparator:t,filters:o}){const{role:r,name:g,status:j}=o;if(!Array.isArray(e))return console.error("inputData is not an array:",e),[];const l=e.map((s,n)=>[s,n]);return l.sort((s,n)=>{const w=t(s[0],n[0]);return w!==0?w:s[1]-n[1]}),e=l.map(s=>s[0]),r.length&&(e=e.filter(s=>r.includes(s.role))),g&&(e=e.filter(s=>s.customerFirstName.toLowerCase().indexOf(g.toLowerCase())!==-1)),j!=="all"&&(e=e.filter(s=>s.serviceCompletionStatus===j)),e}const ta={title:`Müşteri Servis Listesi | Dashboard - ${P.appName}`};function ca(){return a.jsxs(a.Fragment,{children:[a.jsx(de,{children:a.jsx("title",{children:ta.title})}),a.jsx(sa,{})]})}export{ca as default};

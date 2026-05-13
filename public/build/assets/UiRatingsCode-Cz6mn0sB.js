import{t as e}from"./jsx-runtime-BOguVsb-.js";import{t}from"./Prism-BT0CpWjL.js";var n=e(),r=`
<Rating
initialRating={3}
emptySymbol="mdi mdi-star-outline text-muted "
fullSymbol="mdi mdi-star text-warning "
/>
`,i=()=>(0,n.jsx)(t,{code:r,language:`html`,plugins:[`line-numbers`]}),a=`
<Rating
initialRating={1.5}
fractions={2}
emptySymbol="mdi mdi-star-outline text-muted "
fullSymbol="mdi mdi-star text-warning "
/>
`,o=()=>(0,n.jsx)(t,{code:a,language:`html`,plugins:[`line-numbers`]}),s=`
<Rating
emptySymbol="mdi mdi-star-outline text-muted "
fullSymbol="mdi mdi-star text-warning "
/>
`,c=()=>(0,n.jsx)(t,{code:s,language:`html`,plugins:[`line-numbers`]}),l=`
<Rating
stop={16}
emptySymbol="mdi mdi-star-outline text-muted fa-1x"
fullSymbol="mdi mdi-star text-warning"
initialRating={4.5}
readonly
/>
`,u=()=>(0,n.jsx)(t,{code:l,language:`html`,plugins:[`line-numbers`]}),d=`
const [customize, setcustomize] = useState("");

<Rating
stop={5}
emptySymbol="mdi mdi-star-outline text-muted "
fullSymbol="mdi mdi-star text-warning "
onChange={(customize) => setcustomize(customize)}
/>
`,f=()=>(0,n.jsx)(t,{code:d,language:`html`,plugins:[`line-numbers`]}),p=`
const [reset, setreset] = useState("");

<Rating
emptySymbol="mdi mdi-star-outline text-muted"
fullSymbol={reset}
onHover={() => setreset("mdi mdi-star text-warning")}
/>
`,m=()=>(0,n.jsx)(t,{code:p,language:`html`,plugins:[`line-numbers`]});export{i as BasicRaterExample,c as CustomMsgExample,f as OnHoverExample,o as RaterWithStepExample,u as ReadOnlyRaterExample,m as ReasetRaterExample};
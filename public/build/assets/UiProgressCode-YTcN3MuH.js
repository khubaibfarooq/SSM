import{t as e}from"./jsx-runtime-BOguVsb-.js";import{t}from"./Prism-BT0CpWjL.js";var n=e(),r=`
<!-- Base Examples -->
<div className="mb-4">
    <ProgressBar now={0} />
</div>

<div className="mb-4">
    <ProgressBar now={25} />
</div>

<div className="mb-4">
    <ProgressBar now={50} />
</div>

<div className="mb-4">
    <ProgressBar now={75} />
</div>

<div>
    <ProgressBar now={100} />
</div>`,i=()=>(0,n.jsx)(t,{code:r,language:`html`,plugins:[`line-numbers`]}),a=`
<!-- Backgrounds -->
<div className="mb-4">
    <ProgressBar variant="primary" now={15} />
</div>

<div className="mb-4">
    <ProgressBar variant="success" now={25} />
</div>

<div className="mb-4">
    <ProgressBar variant="info" now={50} />
</div>

<div className="mb-4">
    <ProgressBar variant="warning" now={75} />
</div>

<div>
    <ProgressBar variant="danger" now={100} />
</div>`,o=()=>(0,n.jsx)(t,{code:a,language:`html`,plugins:[`line-numbers`]}),s=`
<!-- Labels Example -->
<ProgressBar variant="primary" now={25}> 25% </Progress>
`,c=()=>(0,n.jsx)(t,{code:s,language:`html`,plugins:[`line-numbers`]}),l=`
<!-- Multiple Bars -->
<ProgressBar multi>
    <ProgressBar bar now="15" />
    <ProgressBar bar variant="success" now="30" />
    <ProgressBar bar variant="info" now="20" />
</Progress>
`,u=()=>(0,n.jsx)(t,{code:l,language:`html`,plugins:[`line-numbers`]}),d=`
<!-- Prgress sm -->
<div className="mb-4">
    <h5 className="fs-13">Small Progress</h5>
    <ProgressBar variant="primary" now={25} className="progress-sm" />
</div>

<!-- Prgress Default -->
<div className="mb-4">
    <h5 className="fs-13">Default Progress </h5>
    <ProgressBar variant="success" now={40} className="progress-md" />
</div>

<!-- Prgress lg -->
<div className="mb-4">
    <h5 className="fs-13">Large Progress</h5>
    <ProgressBar variant="warning" now={50} className="progress-lg" />
</div>

<!-- Prgress xl -->
<div>
    <h5 className="fs-13">Extra Large Progress</h5>
    <ProgressBar variant="danger" now={70} className="progress-xl" />
</div>
`,f=()=>(0,n.jsx)(t,{code:d,language:`html`,plugins:[`line-numbers`]}),p=`
<!-- Striped Prgress -->
<div className="mb-4">
    <ProgressBar striped now={25} />
</div>
<div>
    <ProgressBar variant="success" striped now={40} />
</div>
`,m=()=>(0,n.jsx)(t,{code:p,language:`html`,plugins:[`line-numbers`]}),h=`
<!-- Animated Striped Progress -->
<div>
    <ProgressBar now={75} striped animated />
</div>
`,g=()=>(0,n.jsx)(t,{code:h,language:`html`,plugins:[`line-numbers`]}),_=`
<!-- Gradient -->
<div className="mb-4">
    <ProgressBar now={15} className="bg-gradient" />
</div>
<div className="mb-4">
    <ProgressBar variant="success" now={25} className="bg-gradient" />
</div>
<div className="mb-4">
    <ProgressBar variant="info" now={50} className="bg-gradient" />
</div>
<div className="mb-4">
    <ProgressBar variant="warning" now={75} className="bg-gradient" />
</div>
<div>
    <ProgressBar variant="danger" now={100} className="bg-gradient" />
</div>
`,v=()=>(0,n.jsx)(t,{code:_,language:`html`,plugins:[`line-numbers`]}),y=`
<!-- Animated Progress -->
<div className="mb-4">
    <ProgressBar now={15} className="animated-progess" />
</div>
<div className="mb-4">
    <ProgressBar now={25} variant="success" className="animated-progess" />
</div>
<div className="mb-4">
    <ProgressBar now={50} variant="info" className="animated-progess" />
</div>
<div className="mb-4">
    <ProgressBar now={75} variant="warning" className="animated-progess" />
</div>
<div>
    <ProgressBar now={100} variant="danger" className="animated-progess" />
</div>
`,b=()=>(0,n.jsx)(t,{code:y,language:`html`,plugins:[`line-numbers`]}),x=`
<!-- Custom Progress -->
<div className="mb-4">
    <ProgressBar now={15} variant="primary" className="animated-progess custom-progress" />
</div>
<div className="mb-4">
    <ProgressBar now={25} variant="success" className="animated-progess custom-progress" />
</div>
<div className="mb-4">
    <ProgressBar now={50} variant="info" className="animated-progess custom-progress" />
</div>
<div className="mb-4">
    <ProgressBar now={75} variant="warning" className="animated-progess custom-progress" />
</div>
<div>
    <ProgressBar now={100} variant="danger" className="animated-progess custom-progress" />
</div>
`,S=()=>(0,n.jsx)(t,{code:x,language:`html`,plugins:[`line-numbers`]}),C=`
<!-- Custom Progress with Label -->
<div className="d-flex align-items-center pb-2 mt-4">
    <div className="flex-shrink-0 me-3">
        <div className="avatar-xs">
            <div className="avatar-title bg-light rounded-circle text-muted fs-16">
                <i className="mdi mdi-facebook"></i>
            </div>
        </div>
    </div>
    <div className="flex-grow-1">
        <div>
            <ProgressBar now={15} variant="primary" className="animated-progess custom-progress progress-label" ><div className="label">15%</div> </Progress>
        </div>
    </div>
</div>

<div className="d-flex align-items-center py-2">
    <div className="flex-shrink-0 me-3">
        <div className="avatar-xs">
            <div className="avatar-title bg-light rounded-circle text-muted fs-16">
                <i className="mdi mdi-twitter"></i>
            </div>
        </div>
    </div>
    <div className="flex-grow-1">
        <div>
            <ProgressBar now={25} variant="success" className="animated-progess custom-progress progress-label" ><div className="label">25%</div> </Progress>
        </div>
    </div>
</div>

<div className="d-flex align-items-center py-2">
    <div className="flex-shrink-0 me-3">
        <div className="avatar-xs">
            <div className="avatar-title bg-light rounded-circle text-muted fs-16">
                <i className="mdi mdi-github"></i>
            </div>
        </div>
    </div>
    <div className="flex-grow-1">
        <div>
            <ProgressBar now={50} variant="info" className="animated-progess custom-progress progress-label" ><div className="label">30%</div> </Progress>
        </div>
    </div>
</div>
`,w=()=>(0,n.jsx)(t,{code:C,language:`html`,plugins:[`line-numbers`]}),T=`
<!-- Content Progress -->
<Card className="bg-light overflow-hidden shadow-none">
    <Card.Body>
        <div className="d-flex">
            <div className="flex-grow-1">
                <h6 className="mb-0"><b className="text-secondary">30%</b> Update in
                    progress...</h6>
            </div>
            <div className="flex-shrink-0">
                <h6 className="mb-0">1 min left</h6>
            </div>
        </div>
    </Card.Body>
    <div >
        <ProgressBar now={30} variant="info" className="bg-info-subtle rounded-0" />
    </div>
</Card>

<Card className="bg-light overflow-hidden shadow-none">
    <Card.Body>
        <div className="d-flex">
            <div className="flex-grow-1">
                <h6 className="mb-0"><b className="text-success">60%</b> Update in
                    progress...</h6>
            </div>
            <div className="flex-shrink-0">
                <h6 className="mb-0">45s left</h6>
            </div>
        </div>
    </Card.Body>
    <div>
        <ProgressBar now={60} variant="success" className="bg-success-subtle rounded-0" />
    </div>
</Card>

<Card className="bg-light overflow-hidden shadow-none">
    <Card.Body>
        <div className="d-flex">
            <div className="flex-grow-1">
                <h6 className="mb-0"><b className="text-danger">82%</b> Update in
                    progress...</h6>
            </div>
            <div className="flex-shrink-0">
                <h6 className="mb-0">25s left</h6>
            </div>
        </div>
    </Card.Body>
    <div>
        <ProgressBar now={82} variant="danger" className="bg-danger-subtle rounded-0" />
    </div>
</Card>
`,E=()=>(0,n.jsx)(t,{code:T,language:`html`,plugins:[`line-numbers`]}),D=`
<!-- Progress with Steps -->
<div className="position-relative m-4">
    <ProgressBar now={50} style={{ height: "1px" }} />
    <Button size="sm" variant="primary" className="position-absolute top-0 start-0 translate-middle rounded-pill" style={{ width: "2rem", height: "2rem" }}>1</Button>
    <Button size="sm" variant="primary" className="position-absolute top-0 start-50 translate-middle rounded-pill" style={{ width: "2rem", height: "2rem" }}>2</Button>
    <Button size="sm" variant="light" className="position-absolute top-0 start-100 translate-middle rounded-pill" style={{ width: "2rem", height: "2rem" }}>3</Button>
</div>
`,O=()=>(0,n.jsx)(t,{code:D,language:`html`,plugins:[`line-numbers`]}),k=`
<!-- Step Progress with Arrow -->
<ProgressBar multi className='progress-step-arrow progress-info'>
    <ProgressBar bar now="35"> Step 1 </Progress>
    <ProgressBar bar now="35"> Step 2 </Progress>
    <ProgressBar bar now="35" variant="light" className="text-body"> Step 3 </Progress>
</Progress>
`,A=()=>(0,n.jsx)(t,{code:k,language:`html`,plugins:[`line-numbers`]});export{b as AnimatedExample,g as AnimatedStripedExample,o as BackgroundColorExample,E as ContentExample,S as CustomExample,w as CustomProgressExample,i as DefaultProgressExample,v as GradientExample,f as HeightExample,c as LabelExample,u as MultipleBarsExample,O as ProgressWithStepExample,A as StepProgressArrowExample,m as StripedExample};
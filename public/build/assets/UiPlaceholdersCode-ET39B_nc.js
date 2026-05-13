import{t as e}from"./jsx-runtime-BOguVsb-.js";import{t}from"./Prism-BT0CpWjL.js";var n=e(),r=`
<!-- Base Examples -->
<Card>
<img src={img1} className="card-img-top" alt="card img" />
    <Card.Body>
        <h5 className="card-title">Card title</h5>
        <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
        <Link href="#" className="btn btn-primary">Go somewhere</Link>
    </Card.Body>
</Card>

<Card>
    <img src={img2} className="card-img-top" alt="card dummy img" />
    <Card.Body>
        <h5 className="card-title placeholder-glow">
            <span className="placeholder col-6"></span>
        </h5>
        <p className="card-text placeholder-glow">
            <span className="placeholder col-7"></span>
            <span className="placeholder col-4"></span>
            <span className="placeholder col-4"></span>
            <span className="placeholder col-6"></span>
        </p>
        <Link href="#" tabIndex="-1" className="btn btn-primary disabled placeholder col-6"></Link>
    </Card.Body>
</Card>

`,i=()=>(0,n.jsx)(t,{code:r,language:`html`,plugins:[`line-numbers`]}),a=`
<!-- Width Sizing-->
<div className="live-preview">
    <span className="placeholder col-6"></span>
    <span className="placeholder w-75"></span>
    <span className="placeholder" style={{width: "25%"}}></span>
</div>
`,o=()=>(0,n.jsx)(t,{code:a,language:`html`,plugins:[`line-numbers`]}),s=`
<!-- Sizing -->
<span className="placeholder col-12 placeholder-lg"></span>

<span className="placeholder col-12"></span>

<span className="placeholder col-12 placeholder-sm"></span>

<span className="placeholder col-12 placeholder-xs"></span>
`,c=()=>(0,n.jsx)(t,{code:s,language:`html`,plugins:[`line-numbers`]}),l=`
<!-- Color -->
<span className="placeholder col-12 mb-3"></span>

<span className="placeholder col-12 mb-3 bg-primary"></span>

<span className="placeholder col-12 mb-3 bg-secondary"></span>

<span className="placeholder col-12 mb-3 bg-success"></span>

<span className="placeholder col-12 mb-3 bg-danger"></span>

<span className="placeholder col-12 mb-3 bg-warning"></span>

<span className="placeholder col-12 mb-3 bg-info"></span>

<span className="placeholder col-12 mb-3 bg-light"></span>

<span className="placeholder col-12 mb-3 bg-dark"></span>
`,u=()=>(0,n.jsx)(t,{code:l,language:`html`,plugins:[`line-numbers`]});export{u as ColorExample,i as DefaultPlaceholderExample,c as SizingExample,o as WidthExample};
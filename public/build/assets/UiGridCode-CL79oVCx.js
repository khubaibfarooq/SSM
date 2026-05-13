import{t as e}from"./jsx-runtime-BOguVsb-.js";import{t}from"./Prism-BT0CpWjL.js";var n=e(),r=`
<!-- Vertical alignment (align-items-start) -->
<Row className="align-items-start">
    <Col sm={4}>
        ...
    </Col>
    <Col sm={4}>
        ...
    </Col>
    <Col sm={4}>
        ...
    </Col>
</Row>
`,i=()=>(0,n.jsx)(t,{code:r,language:`html`,plugins:[`line-numbers`]}),a=`
<!-- Vertical alignment (align-items-center) -->
<Row className="align-items-center">
    <Col sm={4}>
        ...
    </Col>
    <Col sm={4}>
        ...
    </Col>
    <Col sm={4}>
        ...
    </Col>
</Row>
`,o=()=>(0,n.jsx)(t,{code:a,language:`html`,plugins:[`line-numbers`]}),s=`
<!-- Vertical alignment (align-items-end) -->
<Row className="align-items-end">
    <Col sm={4}>
        ...
    </Col>
    <Col sm={4}>
        ...
    </Col>
    <Col sm={4}>
        ...
    </Col>
</Row>
`,c=()=>(0,n.jsx)(t,{code:s,language:`html`,plugins:[`line-numbers`]}),l=`
<!-- Align Self -->
<Row>
    <Col sm={4} className="align-self-start">
        ...
    </Col>
    <Col sm={4} className="align-self-center">
        ...
    </Col>
    <Col sm={4} className="align-self-end">
        ...
    </Col>
</Row>
`,u=()=>(0,n.jsx)(t,{code:l,language:`html`,plugins:[`line-numbers`]}),d=`
<!-- Horizontal Alignment -->
<Row className="justify-content-start">
    <Col sm={4}>
        ...
    </Col>
</Row>
<Row className="justify-content-center">
    <Col sm={4}>
        ...
    </Col>
</Row>
<Row className="justify-content-end">
<Col sm={4}>
        ...
</Col>
</Row>
`,f=()=>(0,n.jsx)(t,{code:d,language:`html`,plugins:[`line-numbers`]});export{u as AlignSelfExample,f as HorizontalAlignExample,o as VerticalCenterExample,c as VerticalEndExample,i as VerticalStartExample};
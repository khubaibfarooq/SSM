import{t as e}from"./jsx-runtime-BOguVsb-.js";import{t}from"./Prism-BT0CpWjL.js";var n=e(),r=`
<!-- Slides Only -->
<UncontrolledCarousel
    controls={false}
    indicators={false}
    interval={3000}
    items={[
      {
        altText: " ",
        caption: " ",
        key: 1,
        src: img1,
      },
      {
        altText: " ",
        caption: " ",
        key: 2,
        src: img2,
      },
      {
        altText: " ",
        caption: " ",
        key: 3,
        src: img3,
      },
    ]}
  />
`,i=()=>(0,n.jsx)(t,{code:r,language:`html`,plugins:[`line-numbers`]}),a=`
<!-- With Controls -->
<UncontrolledCarousel
    interval={4000}
    indicators={false}
    items={[
      {
        altText: " ",
        caption: " ",
        key: 1,
        src: img1,
      },
      {
        altText: " ",
        caption: " ",
        key: 2,
        src: img2,
      },
      {
        altText: " ",
        caption: " ",
        key: 3,
        src: img3,
      },
    ]}
  />
`,o=()=>(0,n.jsx)(t,{code:a,language:`html`,plugins:[`line-numbers`]}),s=`
    <!-- With Indicators -->
<UncontrolledCarousel
  interval={4000}
    items={[
      {
        altText: " ",
        caption: " ",
        key: 1,
        src: img3,
      },
      {
        altText: " ",
        caption: " ",
        key: 2,
        src: img2,
      },
      {
        altText: " ",
        caption: " ",
        key: 3,
        src: img1,
      },
    ]}
  />
`,c=()=>(0,n.jsx)(t,{code:s,language:`html`,plugins:[`line-numbers`]}),l=`
    <!-- With Captions -->
<UncontrolledCarousel
    interval={4000}
    items={[
      {
        altText: "First slide label ",
        caption: "First slide label",
        key: 1,
        src: img7,
      },
      {
        altText: "Second slide label",
        caption: "Second slide label",
        key: 2,
        src: img2,
      },
      {
        altText: "Third slide label",
        caption: "Third slide label",
        key: 3,
        src: img9,
      },
    ]}
  />
`,u=()=>(0,n.jsx)(t,{code:l,language:`html`,plugins:[`line-numbers`]}),d=`
<!-- With Crossfade Animation -->
<UncontrolledCarousel
  interval={4000}
    items={[
      {
        altText: " ",
        caption: " ",
        key: 1,
        src: img1,
      },
      {
        altText: " ",
        caption: " ",
        key: 2,
        src: img2,
      },
      {
        altText: " ",
        caption: " ",
        key: 3,
        src: img3,
      },
    ]}
  />
`,f=()=>(0,n.jsx)(t,{code:d,language:`html`,plugins:[`line-numbers`]}),p=`
<!-- Individual Slide -->
<UncontrolledCarousel
    interval={4000}
    indicators={false}
    items={[
      {
        altText: " ",
        caption: " ",
        key: 1,
        src: img12,
      },
      {
        altText: " ",
        caption: " ",
        key: 2,
        src: img11,
      },
      {
        altText: " ",
        caption: " ",
        key: 3,
        src: img10,
      },
    ]}
  />
`,m=()=>(0,n.jsx)(t,{code:p,language:`html`,plugins:[`line-numbers`]}),h=`
<!-- Disable Touch Swiping -->
<UncontrolledCarousel
    interval={false}
    indicators={false}
    enableTouch={false}
    items={[
        {
            altText: " ",
            caption: " ",
            key: 1,
            src: img9,
        },
        {
            altText: " ",
            caption: " ",
            key: 2,
            src: img8,
        },
        {
            altText: " ",
            caption: " ",
            key: 3,
            src: img7,
        },
    ]}
/>
`,g=()=>(0,n.jsx)(t,{code:h,language:`html`,plugins:[`line-numbers`]}),_=`
    <!-- Dark Variant -->
<UncontrolledCarousel
    dark={true}
    interval={false}
    items={[
      {
        altText: " ",
        caption: "Drawing a sketch",
        key: 1,
        src: img1,
      },
      {
        altText: " ",
        caption: "Blue clock on a pastel background",
        key: 2,
        src: img2,
      },
      {
        altText: " ",
        caption: "Working at a coffee shop",
        key: 3,
        src: img3,
      },
    ]}
  />
`,v=()=>(0,n.jsx)(t,{code:_,language:`html`,plugins:[`line-numbers`]});export{f as CrossFadeExample,v as DarkVariantExample,g as DisableTouchExample,m as InduvidualIntervalExample,i as SlideOnlyExample,u as WithCaptionExample,o as WithControlExample,c as WithIndicatorExample};
import{r as e}from"./rolldown-runtime-BM3Ffeng.js";import{t}from"./jsx-runtime-BOguVsb-.js";import{t as n}from"./Prism-BT0CpWjL.js";var r=e({default:()=>o}),i=t(),a=`
var app = document.getElementById("app");
var run = (model) => get(model, "users", () =>
    get(model, "posts",
    () => {
        model.users.forEach(user => model.userIdx[user.id] = user);
        app.innerText = '';
        model.posts.forEach(post =>
        app.appendChild(renderPost(post, model.userIdx[post.userId])));
    }));
app.appendChild(Wrapper.generate("button", "Load").click(() => run({
    userIdx: {}
})).element);
`,o=()=>(0,i.jsx)(n,{code:a,language:`html`,plugins:[`line-numbers`]});export{r as n,o as t};
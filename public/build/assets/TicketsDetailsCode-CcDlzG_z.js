import{j as e}from"./app-CyIHl2iJ.js";import{P as o}from"./Prism-B5ivrfkD.js";const s=`
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
`,p=()=>e.jsx(o,{code:s,language:"html",plugins:["line-numbers"]});export{p as default};

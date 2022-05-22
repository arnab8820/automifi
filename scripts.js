
// var o=$({});
// $.pub=function(){
//     o.trigger.apply(o,arguments)
// }


console.log("it works");
var s = document.createElement("script");
s.src = chrome.runtime.getURL('inject.js');
s.onload = function(){
    s.remove();
}
document.head.appendChild(s);



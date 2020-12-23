let width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

if (width < 600) {
    alert("Screen width too small");
    window.location.replace("./");
}
if (height < 700) {
    alert("Screen height too small");
    window.location.replace("./");
}
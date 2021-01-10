let width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

if (width < 600) {
    alert("Screen width too small. Play experience might be suboptimal.");
    //window.location.replace("./"); this would redirect to homepage
}
if (height < 700) {
    alert("Screen height too small. Play experience might be suboptimal.");
    //window.location.replace("./");
}
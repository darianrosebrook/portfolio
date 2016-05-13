// writing function to make writing this easier
var icons = document.getElementsByClassName('logo'),
    desc = document.getElementsByClassName('icon-description'),
    container = document.getElementById('icons');


// solution via Timo, thank you
function toggleAllIcons() {
  for(var i = 0; i < icons.length; i++) {
    icons[i].classList.toggle('hidden');
  }
}

function toggleDescription(e) {
  var target = e.target,
      parent = target.parentNode,
      targetIndex = Array.prototype.indexOf.call(icons, parent),
      description = desc[targetIndex];
  if(!parent.classList.contains('logo')) {
    return;
  }

  toggleAllIcons();
  parent.classList.remove('hidden');
  description.classList.toggle('active');
  container.classList.toggle('clicked');
}

container.addEventListener('click', toggleDescription);

//smooth scroll-behavior
var toggler = document.getElementById('nav-toggler'),
    contactBtn = document.getElementsByClassName('contactBtn'),
    targetOffset, currentPosition,
    body = document.body,
    animateTime = 700;
// get the y offset
function getPageScroll() {
  var yScroll;
  if (window.pageYOffset) {
    yScroll = window.pageYOffset;
  } else if (document.documentElement && document.documentElement.scrollTop) {
    yScroll = document.documentElement.scrollTop;
  } else if (document.body) { //last resort
    yScroll = document.body.scrollTop;
  }
  return yScroll;
}
function smoothSroll(event) {
  targetOffset = document.getElementById(event.target.hash.substr(1)).offsetTop;
  currentPosition = getPageScroll(); // uses yScroll's value
  console.log(toggler.checked);
  // accounting for hidden-nav
  if (toggler.checked){
    targetOffset = targetOffset  / 1.65;
    currentPosition = currentPosition /1.65;

  }
  body.classList.add('in-transition');
  body.style.transform = "translate(0, -" + (targetOffset - currentPosition) + "px)";

  window.setTimeout(function () {
    body.classList.remove('in-transition');
    body.style.cssText = "";
    window.scrollTo(0, targetOffset);
  }, animateTime);

  event.preventDefault();
    console.log(targetOffset)
}
for (var i = 0; i < contactBtn.length; i++){
contactBtn[i].addEventListener('click', function(event) {
  smoothSroll(event);
  if (event.target.id === 'btn-primary'&& toggler.checked) {
    toggler.checked = false;
  }

}, false);

}

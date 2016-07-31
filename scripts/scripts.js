
// writing function to make writing this easier
function byId(id) {
  return document.getElementById(id);
}
function byClass(className) {
  return document.getElementsByClassName(className);

}


var icons = byClass('logo'),
    desc = byClass('icon-description'),
    container = byId('icons');


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

if (container) {
  container.addEventListener('click', toggleDescription);
}


//smooth scroll-behavior
var toggler = byId('nav-toggler'),
    contactBtn = byClass('contactBtn'),
    targetOffset, currentPosition,
    body = document.body,
    animateTime = 000;
var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    if(!!window.chrome && !isOpera )
    { animateTime = 900;
    }

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
  if(!event) {
    event = window.event;
  }
  var target = event.target;
  targetOffset = byId(target.dataset.href.substr(1)).offsetTop;
  currentPosition = getPageScroll(); // uses yScroll's value

  // accounting for hidden-nav
  if (toggler.checked && window.innerWidth < 750){
    targetOffset = targetOffset ;
    currentPosition = currentPosition;
  } else if(toggler.checked){
    targetOffset = targetOffset  / 1.65;
    currentPosition = currentPosition /1.65;
  }
  body.classList.add('in-transition');
  body.style.WebitTransform = "translate(0, -" + (targetOffset - currentPosition) + "px)";
  body.style.MozTransform = "translate(0, -" + (targetOffset - currentPosition) + "px)";
  body.style.transform = "translate(0, -" + (targetOffset - currentPosition) + "px)";


  window.setTimeout(function () {
    body.classList.remove('in-transition');
    body.style.cssText = "";
    window.scrollTo(0, targetOffset);
  }, animateTime);

  event.preventDefault();
}
for (var i = 0; i < contactBtn.length; i++){
contactBtn[i].addEventListener('click', function(event) {
    smoothSroll(event);
  }, false);
}

// Web Design Page process checkoff

var checks = byClass('process-checkbox'),
    workButton = byClass('process-checkoff'),
    parentProcess = byId('process'),
    checkMark = '<i class="fa fa-check"></i>';
function toggleCheckbox(i){
  checks[i].checked = !checks[i].checked;
  console.log(workButton[i]);
  workButton[i].innerHTML = checkMark;
}
function isNodeType(node) {
  if(node.nodeType === 1){
    return node;
  }
}
function checkboxEvent(e) {
  var target = e.target,
      parent = target.parentNode,
      parentList = Array.prototype.slice.call(target.parentNode.parentNode.childNodes).filter(isNodeType),
      targetIndex = Array.prototype.indexOf.call(parentList, parent);
      toggleCheckbox(targetIndex);
  if(!parent.classList.contains('logo')) {
      return;
    }
}
if(parentProcess) {
  parentProcess.addEventListener('click', checkboxEvent);
}

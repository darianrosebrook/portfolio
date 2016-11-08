//functions
function byId(id) {
  return document.getElementById(id);
}
function byClass(className) {
  return document.getElementsByClassName(className);
}
function forEach(list, callback) {
  for (var i = list.length; i--;) {
    callback(list[i], i, list);
  }
}

//questionnaire
var question = byClass('continue');
var wHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
var wScroll;
var rect = [];
var continueBox = [];
var checkboxes = document.getElementsByTagName('input');
for(var i = 0; i < checkboxes.length; i++) {
  if(checkboxes[i].dataset.continue) {
    continueBox.push(checkboxes[i]);
  } else {
    checkboxes[i].addEventListener('change', checked, false);
  }
}
for (var i = 0; i < continueBox.length; i++) {
  continueBox[i].addEventListener('change', checked, false)
}
function passesCenter(a) {
   return !(a.bottom - (wHeight / 2) < 0 || a.top - (wHeight / 2) >= 0);
}

function checked() {
  if (this.checked) {

    rect = [];
    for (var i = 0; i < question.length; i++) {
      rect.push(question[i].getBoundingClientRect());
    }
    console.log(rect);
    window.addEventListener('scroll', function(){
      wScroll = window.pageYOffset;
      for (var i = 0; i < question.length; i++) {
        if(passesCenter(question[i].getBoundingClientRect())) {
          question[i].classList.add('in-center');
        } else {
          question[i].classList.remove('in-center');
        }
      }
      }
    )
  }
}

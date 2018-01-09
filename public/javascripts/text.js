// window.onload = function() {
//     if (window.jQuery) {  
//         // jQuery is loaded  
//         alert("Yeah!");
//     } else {
//         // jQuery is not loaded
//         alert("Doesn't Work");
//     }
// }

$(document).ready(function() {
  $('#jBold').click(function() {
    document.execCommand('bold');
  });
  $('#jItalic').click(function() {
    document.execCommand('italic');
  });
  $('#jUnderline').click(function() {
    document.execCommand('underline');
  });
});

// document.getElementById("form").onsubmit = function(e){
//     e.preventDefault();
//     var el = document.getElementById("editDescription");
//     el.value = document.getElementById("fake_textarea").innerHTML;
//     document.getElementById("form").submit();
// }
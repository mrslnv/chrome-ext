console.log("Popup NN")

// popup
$(document).ready($(function(){
    $( "#clear" ).click(function() {
        chrome.runtime.sendMessage({what: "clear"});
    });

}));


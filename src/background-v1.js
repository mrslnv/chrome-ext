console.log("Backrground NN")
var list = []
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");

        if (request.what === "getList")
            sendHotelList(sendResponse);
        else if (request.what === "addHotel")
            addHotel(request);
        else if (request.what === "getSiteUrl")
            getSiteUrl(sender.tab, sendResponse);
    });


function addHotel(request) {
    console.log("Add hotel:" + request.hotel.hotelName + " id " + request.hotel.hotelId);
    list.push(request.hotel)
}

function sendHotelList(sendResponse) {
    console.log("Send list back");
    console.log(list);
    sendResponse({list: list});
}

function getSiteUrl(tab, sendResponse) {
    console.log("Get Site URL");
    var siteUrl = tab.url;
    console.log("Get Site URL");
    sendResponse({siteUrl: siteUrl});
}


//storage

localStorage.setItem()
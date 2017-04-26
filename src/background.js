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
        else if (request.what === "clear")
            clearStorage();
        else if (request.what === "remove")
            remove(request.hotel);
    });

function cleanup() {
    var items = loadItems();
    var childOk = 0;
    var coolList = [];
    console.log("Hotels:"+items.length);
    for (var i=0;i<items.length;i++){
        var hotel = items[i];
        console.log(JSON.stringify(hotel));
        if (!hotel.hotelIgnore){
            childOk++;
        }
        if (hotel.hotelRating){
            var rate = parseInt(hotel.hotelRating);
            if (rate > 4){
                coolList.push(hotel);
            }
        }
    }
    console.log("Cool:"+coolList.length);
    for (var j=0;j<coolList.length;j++){
        console.log(JSON.stringify(coolList[j]));
    }
};
cleanup();

function addHotel(request) {
    console.log("Add hotel:" + request.hotel.hotelName + " id " + request.hotel.hotelId);
    console.log(request.hotel);
    storeItem(request.hotel);
}

function sendHotelList(sendResponse) {
    console.log("Send list back");
    list = loadItems();
//    console.log(list);
    sendResponse({list: list});
}

function getSiteUrl(tab, sendResponse) {
    console.log("Get Site URL");
    var siteUrl = tab.url;
    console.log("Get Site URL");
    sendResponse({siteUrl: siteUrl});
}


//storage
function storeItem(hotel) {
    localStorage.setItem(hotel.hotelId, JSON.stringify(hotel));
}

function loadItems() {
    var list = [];
    for (var i = 0, len = localStorage.length; i < len; ++i) {
        list.push(JSON.parse(localStorage.getItem(localStorage.key(i))));
    }
    return list;
}

function clearStorage(){
    console.log("ClearStorage")
    localStorage.clear();
}

function remove(hotel){
    console.log("Remove "+hotel.hotelId)
    localStorage.removeItem(hotel.hotelId);
}
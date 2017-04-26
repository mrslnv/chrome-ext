console.info("INfo NN");

var list;

var siteUrl;
var hotelDetail = getHotelDetail();

// start detail page or main page
if (hotelDetail.length) {
    detailPageMain(hotelDetail, siteUrl);
}
else {
    $("div.product-list").prepend("<span>Refresh</span>").click(function(){
        handleListPage();
    });
    handleListPage();
}

function handleListPage() {
/*
    $("p.paging").on('click', 'a', function (event) {
        console.log(event);
        console.log("Pagging -- Refresh");
        handleListPage();
        return true;
    });
*/
    /*
     $("a","p.paging").each(function(i,el){
     console.log(el);
     el.click(function(){
     console.log("Pagging -- Refresh");
     handleListPage();
     return true;
     });
     });
     */
    var items = getHotelList();
    if (items.length)
        listPageMain(items);
}

// detail page handler
function detailPageMain(hotelDetail, url) {
    console.info("-=Detail Page=-");
    getSiteUrl(function (url) {
        siteUrl = url;
        chrome.runtime.sendMessage({what: "getList"}, function (response) {
            list = response.list;
            console.log("Searching for " + getHotelId(url));
            var hotel = isInList(list, getHotelId(url));

            var button = $("<button class='noBut'>NO</button>").click(function () {
                addNoHotelClicked(hotelDetail, url)
            });
            var notes = $("<button class='nots'>Notes</button>").click(function () {
                console.log("Open DIA");
                var price = $("span.price", "p.sum-price").text();
                $('#mprc1').val(price);
                $("#mdia0").css("display", "block");
                $("#mdia1").dialog("open");
                event.preventDefault();
            });
            var hotelNameEl = hotelDetail.find("span.stars");
            hotelNameEl.append(button).append(notes);
            addDialog(hotelDetail, url, hotel);

            renderHotelNotes(hotel, hotelNameEl);
        });
    });
}

function addDialog(hotelDetail, url, hotel) {
    console.log("Adding dia");
    var hNote = "";
    var hRating = "";
    if (hotel) {
        hNote = hotel.hotelNote;
        hRating = hotel.hotelRating;
    }

    var price = $("span.price", "p.sum-price").text();
    //todo: pre select checkbox
    var divE = $("<div id='mdia0'><div id='mdia1' title='Notes'>" +
        "<textarea id='mte1' rows='10' cols='50'>" + hNote + "</textarea>" +
        "<div id='mrad1'>" +
        "<input type='radio' name='mrate1' value='5' > Cool <br>" +
        "<input type='radio' name='mrate1' value='4' > Good <br>" +
        "<input type='radio' name='mrate1' value='3' > So so <br>" +
        "<input type='radio' name='mrate1' value='2' > Maybe <br>" +
        "</div>" +
        "<input type='text' id='mprc1' value='" + price + "'></input>" +
        "</div></div>");
    $("#product-detail").prepend(divE);
    $("#mdia1").dialog({
        autoOpen: false,
        width: 400,
        buttons: [
            {
                text: "Ok",
                click: function () {
                    $(this).dialog("close");
                    $("#mdia0").css("display", "none");
                    var text = $("#mte1").val();
                    var rating = $('input[name=mrate1]:checked', '#mdia1').val();
                    var price = $('#mprc1').val();
                    addHotelEl(hotelDetail, url, false, text, rating, price);
                }
            },
            {
                text: "Cancel",
                click: function () {
                    $(this).dialog("close");
                    $("#mdia0").css("display", "none");
                }
            }
        ]
    });
}

function getSiteUrl(handler) {
    chrome.runtime.sendMessage({what: "getSiteUrl"}, function (response) {
        console.log("Got URL:" + response.siteUrl);
        handler(response.siteUrl);
    });
}

function addNoHotelClicked(hotelDetail, url) {
    addHotelEl(hotelDetail, url, true, null, null, null);
}

function getHotelId(url) {
    var id = url.match(/id=([^&]+)/)[1];
//    console.log("id=" + id);
    return id;
}

function addHotelEl(hotelDetail, url, hotelIgnore, hotelNote, hotelRating, hotelPrice) {
    console.log("Add No Hotel Clicked");
    var hotelName = $(hotelDetail).clone()
        .children().remove().end().text();
    hotelName = $.trim(hotelName);
    var hotelId = getHotelId(url);
    console.log("Found hotel name:" + hotelName + " id " + hotelId)
    addHotel(hotelId, hotelName, hotelIgnore, hotelNote, hotelRating, hotelPrice);
}

function addHotel(hotelId, hotelName, hotelIgnore, hotelNote, hotelRating, hotelPrice) {
    var hotel = {
        hotelId: hotelId,
        hotelName: hotelName,
        hotelIgnore: hotelIgnore,
        hotelNote: hotelNote,
        hotelRating: hotelRating,
        hotelPrice: hotelPrice
    };
    console.log("Sending hotel");
    console.log(hotel);
    chrome.runtime.sendMessage({what: "addHotel", hotel: hotel});
}


// main page handler
function listPageMain(items) {
    console.info("-=List Page=-");
    chrome.runtime.sendMessage({what: "getList"}, function (response) {
        list = response.list;
        displayList(items, list)
    });
}

function getHotelList() {
    return $("div.search-results").children("ul.reset").children("li");
}

function getHotelDetail() {
    return $("#hotel-name-header");
}


function displayList(items, list) {
    items.each(function (i, el) {
        var name = $(el).find("span.name");
//        console.log("in page hotel:" + name.text());
        var url = name.parent().attr("href");
        var id = getHotelId(url);
        var hotelName = $(name).text();

        console.log("More for "+hotelName);

        var moreIds = [];
        moreIds.push(id);
        $(el).find("div.terms").find("ul.reset").find("li").each(function(i,el){
            $(el).children("a.inner").each(function(j,e2){
                var url2 = $(e2).attr("href");
//                console.log("More - "+url2);
                moreIds.push(getHotelId(url2));
            });
        });

        var hotel = isInListMoreIds(list, moreIds);
        console.log("More done "+hotelName);
        if (hotel)
            console.log(" "+hotel.hotelNote);
        renderHotelNotes(hotel, name);
    });
}

function renderHotelNotes(hotel, element) {
    if (hotel) {
        console.log("Render notes: " + hotel.hotelName);
        var parent = $(element).parent();
        if (hotel.hotelIgnore) {
            $(element).css("text-decoration", "line-through");
            $(element).css("color", "grey");
        } else {
            if (hotel.hotelNote) {
                var short = hotel.hotelNote;
                $(parent).append("<span> </span><span class='mlnt1'>" + short + "</span>");
            }
            if (hotel.hotelRating) {
                $(parent).append("<span> </span><span class='mrate1'>" + hotel.hotelRating + "</span>");
            }
            if (hotel.hotelPrice) {
                $(parent).append("<span> </span><span class='mpri1'>" + hotel.hotelPrice + "</span>");
            }
        }
        var remEl = $("<span class='mrem'>X</span>");
        parent.append(remEl);
        remEl.click(function () {
            console.log("Remove clicked");
            chrome.runtime.sendMessage({what: "remove", hotel: hotel});
        });
    }
}

function isInList(list, what) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].hotelId === what) {
            return list[i];
        }
    }
    return null;
}

function isInListMoreIds(list, idList) {
//    console.log("MERGE:"+idList.join(" "));
    var hotel;
    for (var i = 0; i < idList.length; i++) {
        var hotelN = isInList(list,idList[i]);
        if (!hotelN)
            continue;
        if (hotel) {
            if (hotelN){
//                console.log("Old hotel: "+JSON.stringify(hotel));
//                console.log("New hotel: "+JSON.stringify(hotelN));
                if (hotel.idList.indexOf(hotelN.hotelId) == -1) {
//                    console.log("ID Diff: '"+hotel.idList+"' '"+hotelN.hotelId+"'");
                    if (!hotel.hotelNote){
                        hotel.hotelNote = hotelN.hotelNote;
                    } else{
                        if (hotelN.hotelNote){
//                            console.log("JOIN");
                            hotel.hotelNote += " ; " + hotelN.hotelNote;
                            hotel.idList += " "+hotelN.hotelId;
                        }
                    }
                }
            }
        } else {
            hotel = hotelN;
            hotel.idList = hotel.hotelId;
        }
    }
//    console.log("END");
    return hotel;
}


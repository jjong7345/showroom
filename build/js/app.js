var ShowRoom = ShowRoom || {};

jQuery(document).ready(function(jQuery) {

    ShowRoom.main();

});

ShowRoom = (function(jQuery) {

    var winWidth;
    var newTileWidth;
    var newTileHeight;
    var games;
    var gamesData;
    var totalGames;
    var numRowOnWin = 6;
    var totalRows;
    var blockAspectRatio = 182 / 244;
    var isCSSTransform3D = false;
    var sort_by = "atoz";
    var searchString = "";
    var gameDetailTemplate;
    var filterTimer;

    this.mySwiper;

    function main() {

        if (Modernizr.csstransforms3d) isCSSTransform3D = true;
        h5gf.gameData.set(H5G.config.games);
        init();
    }

    function init() {

        //initially sort by "atoz"
        h5gf.sortBy.set(sort_by);
        initGames(h5gf.games.get());
        renderGames();
        preCompileTemplate();
        constructUniqueList();
        initClearFilter();
        initSwiper();
        initWindowResize();
        initKeyPress();
        initScrollArrows();
        initSortByMenu();
        initSearchField();
        updateGameResultCount();

        setTimeout(function() {
            mySwiper.reInit();
        }, 100);

        jQuery(".scroll-arrow").show();
        //jQuery(".main-preloader").hide();
        //jQuery(".main-preloader").remove();
    }

    var templateString = jQuery('#game_block_template').html();

    var imageURLMatch = new RegExp('{{ image_url }}', "g");

    function createGameDOMElement(_imagePath) {

        var replacedTemplateString = templateString.replace(imageURLMatch, "http://h5gshowroom.com/" + _imagePath);
        return jQuery(jQuery.trim(replacedTemplateString));

    }

    function initGames(_gamesData) {

        games = [];

        jQuery.each(_gamesData, function(index, data) {
            var el = createGameDOMElement("Social/games/" + data.id + "/images/gameroom.jpg");
            //var el = createGameDOMElement(data.thumb);
            var game = new Game(el, data);
            game.setOrderNo(index);
            games.push(game);
            Events.on("onWinResize", "updateSize", game);
            Events.on("onReState", "updateState", game);
        });

        totalGames = games.length;
        totalRows = totalGames / 2;

    }

    /********Using Handlebar to render game detail popup*****************/

    function preCompileTemplate() {

        var source = jQuery("#game_details_template").html();
        gameDetailTemplate = Handlebars.compile(source);

    }

    function getGameDetailTemplate(_data) {

        var html = gameDetailTemplate(_data);

        return html;

    }

    /********************************************************************/

    function constructUniqueList() {

        var uniques = h5gf.uniques.get();
        var uniquesNames = Object.keys(uniques);

        jQuery.each(uniques.features.sort(), function(index, val) {
            jQuery(".features-menu").append(createUniqueItem(val));

        });
        jQuery.each(uniques.themes.sort(), function(index, val) {
            jQuery(".themes-menu").append(createUniqueItem(val));

        });

        jQuery.each(uniques.platforms, function(index, val) {
            jQuery(".platforms-menu").append(createUniqueItem(val));

        });
        jQuery.each(uniques.casinos, function(index, val) {
            jQuery(".casinos-menu").append(createUniqueItem(val));

        });
        jQuery.each(uniques.market, function(index, val) {
            jQuery(".market-menu").append(createUniqueItem(val));

        });
        jQuery.each(uniques.publishers, function(index, val) {
            jQuery(".publishers-menu").append(createUniqueItem(val));

        });

    }

    function createUniqueItem(unique) {

        var li = document.createElement('li');
        li.setAttribute("class", "filter-toggle");
        li.setAttribute("data-filter", unique);
        var uniqueName = unique.replace(/-/g, ' ')
            .replace(/(\w+)\s/, '')
            .replace(/(\w+)/g, function(string) {
                return string.substr(0, 1).toUpperCase() + string.substr(1, string.length);
            });
        //Customizing Filters for Showroom only aprt from the Game Data
        if (uniqueName == "Rmg") uniqueName = "RMG";
        if (uniqueName == "Online") uniqueName = "Social";
        if (uniqueName == "Free Games") li.style.display="none";
        if (uniqueName == "Igt") uniqueName = "IGT";

        li.innerHTML = "<p>" + uniqueName + " (" + gameCount(unique) + ")</p>";

        li.onclick = click;

        var added = false;

        function click(e) {

            if (!jQuery(li).hasClass('disable')) {
                if (added = !added) {
                    //console.log('adding ' + unique);
                    h5gf.filters.add(unique);
                    jQuery(li).addClass("selected");
                    clearTimeout(filterTimer);
                    filterTimer = setTimeout(function() {
                        onFilter();
                    }, 100);
                    //updateFilterMenu();

                } else {
                    //console.log('removing ' + unique);
                    h5gf.filters.remove(unique);
                    jQuery(li).removeClass("selected");
                    clearTimeout(filterTimer);
                    filterTimer = setTimeout(function() {
                        onFilter();
                    }, 100);
                    //updateFilterMenu();
                }
            }
            e.stopPropagation();
        }

        return li;

    }

    function initClearFilter() {
        jQuery("#clear-bt").on("click", function() {
            if (h5gf.filters.get().length > 0) {
                h5gf.filters.clear();
                jQuery(".filter-toggle").removeClass("selected");
                onFilter();
            }
        });
    }

    function renderGames(_gamesData) {
        /* use template later */
        var games_container = jQuery(".games-container");

        jQuery.each(games, function(index, data) {
            games_container.append(games[index].el);
        });

    }

    function initSwiper() {

        mySwiper = new Swiper('.swiper-container', {
            freeMode: true,
            keyboardControl: false,
            freeModeFluid: true,
            slidesPerView: 'auto',
            mousewheelControl: false,
            scrollcontainer: true,
            preventLinksPropagation: true,
            preventLinks: true,
            calculateHeight: true,
            scrollbar: {
                container: ".swiper-scrollbar",
                draggable: true,
                hide: false,
                snapOnRelease: false
            }
        });

    }

    function initWindowResize() {

        var timer;

        jQuery(window).resize(function() {

            //console.log(newTileHeight);
            timer = setTimeout(function() {
                clearTimeout(timer);
                var tempWidth = winWidth / numRowOnWin;
                if ((newTileWidth) && (typeof newTileWidth != "undefined")) {
                    tempWidth = newTileWidth;
                }

                winWidth = jQuery(window).width();

                newTileWidth = winWidth / numRowOnWin;

                var r = newTileWidth / tempWidth;

                //console.log("ratio: "+tempWidth+" " + newTileWidth);

                //setSlideNewPos(getSlideCurrXPos() * r, 0);

                newTileHeight = newTileWidth * blockAspectRatio;

                jQuery(".game").height(newTileHeight);
                Events.publish("onWinResize", {
                    width: newTileWidth,
                    height: newTileHeight
                });

                Events.publish("onReState", null);

                jQuery(".games-container").width(newTileWidth * Math.ceil(totalGames / 2));
                jQuery(".swiper-container").height(Math.floor(newTileWidth * 2));
                jQuery(".swiper-scrollbar").css({
                    "margin-top": Math.floor(newTileWidth * 1.7) + "px"
                });
                //console.log(getCurrRow());
                //console.log((Math.ceil(totalRows) - numRowOnWin));
                //if (getCurrRow() > (Math.ceil(totalRows) - numRowOnWin))
                //setSlideNewPos(-((Math.ceil(totalRows) - numRowOnWin) * newTileWidth), 300);
                mySwiper.reInit();
                setSlideNewPos(getSlideCurrXPos() * r, 0);
            }, 300);

            //mySwiper.reInit();
        }).resize();

    }

    var keepScrollState = false;

    function initKeyPress() {

        jQuery(document).on("keydown", function(e) {
            //console.log(e.keyCode);
            var kc = e.keyCode;
            if (kc === 37)
                toPrevXPos();


            if (kc === 39)
                toNextXPos();

            //console.log("row:"+getCurrRow());

        });
        jQuery(document).on("keyup", function(e) {
            //console.log(e.keyCode);
            var kc = e.keyCode;
            if (kc === 37)
                keepScrollState = false;


            if (kc === 39)
                keepScrollState = false;

            //console.log("row:"+getCurrRow());

        });

    }

    var keepPressTimer;
    var keepPressTimerStart;

    function initScrollArrows() {

        jQuery(".right").on("click", function(e) {
            toNextXPos();
            e.preventDefault();
        });
        jQuery(".right").on("mousedown", function() {
            clearTimeout(keepPressTimerStart);
            clearInterval(keepPressTimer);
            keepPressTimerStart = setTimeout(function() {
                clearInterval(keepPressTimer);
                keepPressTimer = setInterval(function() {
                    toNextXPos();
                }, 50);
            }, 200);
            jQuery(window).on("mouseup", stopKeepPressTimer);
            window.addEventListener("touchend", stopKeepPressTimer, false);
        });

        jQuery(".left").on("click", function(e) {
            toPrevXPos();
            e.preventDefault();
        });
        jQuery(".left").on("mousedown", function() {
            clearTimeout(keepPressTimerStart);
            clearInterval(keepPressTimer);
            keepPressTimerStart = setTimeout(function() {
                clearInterval(keepPressTimer);
                keepPressTimer = setInterval(function() {
                    toPrevXPos();
                }, 50);
            }, 200);
            jQuery(window).on("mouseup", stopKeepPressTimer);
            window.addEventListener("touchend", stopKeepPressTimer, false);
        });

        updateArrowPresence();

    }

    function initSortByMenu() {

        jQuery(".dropdown-menu li a").click(function() {
             
            var selText = jQuery(this).text();
            jQuery(this).parents('.btn-group').find('.dropdown-toggle').html(selText + ' <span class="caret"></span><span class="caret2"></span>');

            switch (selText) {
                case "NAME: A to Z":
                    setSortBy("atoz");
                    onFilter();
                    break;
                case "NAME: Z to A":
                    setSortBy("ztoa");
                    onFilter();
                    break;
                case "RELEASE: Newest to Oldest":
                    setSortBy("newest-to-oldest");
                    onFilter();
                    break;
                case "RELEASE: Oldest to Newest":
                    setSortBy("oldest-to-newest");
                    onFilter();
                    break;
                case "POPULARITY: Most to Least":
                    setSortBy("most-popular-to-least-popular");
                    onFilter();
                    break;
                case "POPULARITY: Least to Most":
                    setSortBy("least-popular-to-most-popular");
                    onFilter();
                    break;
                default:
                    setSortBy("atoz");
                    onFilter();
                    break;
            }
        });

    }

    var searchTimer;

    function initSearchField() {

        //h5gf.searchBy.clear(); 
        //h5gf.searchBy.add(h5gf.searchByTerms.themesTitle); 
        //h5gf.searchBy.add(h5gf.searchByTerms.title); 
        //h5gf.searchBy.add(h5gf.searchByTerms.featuresTitle); 
        //h5gf.searchBy.add(h5gf.searchByTerms.casinosTitle); 
        //h5gf.searchBy.add(h5gf.searchByTerms.platformsTitle); 
        //h5gf.searchBy.add(h5gf.searchByTerms.releasesPlatformTitle); 
        //h5gf.searchBy.add(h5gf.searchByTerms.releasesDistributionTitle); 
        //h5gf.searchBy.add(h5gf.searchByTerms.typeTitle); 

        jQuery("#search-bt").on("click", function() {
            //alert(jQuery("#field1").val());
            searchString = jQuery("#field1").val();
            h5gf.search.set(searchString);
            onFilter();
        });
        jQuery("#clear-search-bt").on("click", function() {
            //alert(jQuery("#field1").val());
            jQuery("#field1").val("");
            searchString = "";
            h5gf.search.set(searchString);
            onFilter();
        });

        jQuery(document).on("keydown", function(e) {
            var kc = e.keyCode;
            if (kc === 13) {
                if (jQuery("#field1:focus").length > 0) {
                    searchString = jQuery("#field1").val();
                    h5gf.search.set(searchString);
                    onFilter();
                }
            }
        });
        jQuery(document).on("keyup", function(e) {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(function() {
                if ((jQuery("#field1:focus").length > 0) && (jQuery("#field1").val().length > 2)) {
                    searchString = jQuery("#field1").val();
                    h5gf.search.set(searchString);
                    onFilter();
                } else if ((jQuery("#field1:focus").length > 0) && (jQuery("#field1").val().length <= 2)) {

                    searchString = "";
                    h5gf.search.set(searchString);
                    onFilter();

                }
            }, 350);
        });

    }
    /*************end of init functions********************/
    function gameCount(unique) {

        var num = 0;
        jQuery.each(h5gf.gameData.get(), function(index, val) {
            var property = unique.split("-")[0];
            if (property == "markets") property = "market";
            //determine if the property is array 
            if (h5gf.gameData.get()[index][property].length > 0) {
                jQuery.each(h5gf.gameData.get()[index][property], function(index2, val2) {
                    if (h5gf.gameData.get()[index][property][index2].slug == unique) {
                        num++;
                    }
                });
            } else {
                if (h5gf.gameData.get()[index][property].slug == unique) {
                    num++;
                }
            }
        });
        return num;

    }

    function setSortBy(_val) {

        sort_by = _val;
        return sort_by;

    }

    var timer2;

    function onFilter() {

        //pre-sorting 
        //console.log(h5gf.sortBy.get());
        if ((sort_by == "newest-to-oldest") || (sort_by == "newest-to-oldest")) {
            h5gf.sortBy.set("ztoa"); 
        }
        else { 
            h5gf.sortBy.set("atoz");  
        }

        h5gf.search.set(searchString);
        h5gf.sortBy.set(sort_by);

        gamesData = h5gf.games.get();

        var temp = [];

        jQuery.each(gamesData, function(index, data) {
            jQuery.each(games, function(index2, data2) {
                if (gamesData[index].id == games[index2].id) {
                    temp.push(games[index2]);
                }
            });
        });

        jQuery.each(games, function(index, data) {
            games[index].setOrderNo(null);
            games[index].el.addClass("applyTransition");
        });

        clearTimeout(timer2);
        timer2 = setTimeout(function() {
            jQuery.each(games, function(index, data) {
                games[index].el.removeClass("applyTransition");
            });
        }, 1000);

        jQuery.each(temp, function(index, data) {
            temp[index].setOrderNo(index);
        });

        //console.log(games);
        //console.log(temp);

        totalGames = gamesData.length;
        totalRows = totalGames / 2;

        //Events.publish("onReState", null);

        jQuery(window).resize();

        setTimeout(function() {
            mySwiper.reInit();
        }, 100);

        setSlideNewPos(0, 200);
        updateArrowPresence();
        updateFilterMenu();
        updateGameResultCount();

    }

    function updateFilterMenu() {

        //console.log(h5gf.currentUniques.get());
        var currUniques = h5gf.currentUniques.get();
        var temp = [];

        jQuery.each(Object.keys(currUniques), function(_index, _val) {
            jQuery.each(currUniques[_val], function(index, val) {
                jQuery.each(jQuery(".filter-toggle"), function(index2, val2) {
                    jQuery(this).addClass("disable");
                    if (val == jQuery(this).data("filter")) {
                        temp.push(jQuery(this));
                    }
                });
            });
        });

        jQuery.each(temp, function() {
            this.removeClass("disable");
        });

    }

    function updateGameResultCount() {

        //console.log(h5gf.games.get().length + "/" + games.length);
        jQuery(".result-count").html("<p>" + h5gf.games.get().length + " of " + games.length + "</p>");

    }

    function updateArrowPresence() {

        if (h5gf.games.get().length > (numRowOnWin * 2)) {
            jQuery(".scroll-arrow").show();
        } else {
            jQuery(".scroll-arrow").hide();
        }

    }

    function stopKeepPressTimer() {
        //console.log("mouse up from window object");
        clearTimeout(keepPressTimerStart);
        clearInterval(keepPressTimer);
        keepScrollState = false;
        jQuery(window).off("mouseup", stopKeepPressTimer);
        window.removeEventListener("touchend", stopKeepPressTimer, false);

    }

    function getSlideCurrXPos() {

        return mySwiper.getWrapperTranslate("x");

    }

    function setSlideNewPos(_pos, _speed) {

        mySwiper.setWrapperTransition(_speed);
        mySwiper.setWrapperTranslate(_pos, 0, 0);
    }

    function getCurrRow() {

        // console.log("xpos:"+Math.abs(getSlideCurrXPos()));
        // console.log("tile width:"+newTileWidth);
        //console.log((Math.abs(getSlideCurrXPos()) / newTileWidth).toFixed(2));

        return Math.floor((Math.abs(getSlideCurrXPos()) / newTileWidth).toFixed(2));

    }

    function toNextXPos() {

        if (getCurrRow() < (totalRows - numRowOnWin)) {
            if (!keepScrollState) {
                setSlideNewPos(-(((getCurrRow() + 1) * newTileWidth)), 200);
                keepScrollState = true;
            } else {
                setSlideNewPos(getSlideCurrXPos() - newTileWidth, 100);
            }
        } else {
            setSlideNewPos(-(((getCurrRow()) * newTileWidth)), 200);
        }

    }

    function toPrevXPos() {

        if (getCurrRow() > 0)
            if (!keepScrollState) {
                setSlideNewPos(-(((getCurrRow() - 1) * newTileWidth)), 200);
                keepScrollState = true;
            } else {
                setSlideNewPos(getSlideCurrXPos() + newTileWidth, 100);
            } else if (getCurrRow() == 0)
            setSlideNewPos(0, 200);

    }

    function getGame(_id) {

        if ((_id) && (typeof _id != 'undefined') && (_id != null)) {
            var result;
            jQuery.each(games, function(index, val) {
                if (val.id == _id) result = val;
            });

            try {
                if (typeof result == "undefined") {
                    throw "can not be found!!!";
                }
            } catch (err) {
                throw err;
            }

            return result;
        } else {

            return games;
        }

    }

    function openGameInfo(_game, _container) {

        //console.log(_game.id);

        var container = jQuery('#' + _container);
        container.html(getGameDetailTemplate(_game));

        container.dialog({
            width: 790,
            resizable: false,
            modal: true,
            create: function(event, ui) {
                jQuery(window).resize(function() {
                    container.dialog('option', 'position', 'center');
                });
            },
            open: function(event, ui) {
                jQuery(".ui-widget-overlay").css({
                    background: "#000",
                    opacity: ".75"
                });
            },
            beforeClose: function(event, ui) {
                jQuery(".ui-widget-overlay").css({
                    background: "#fff",
                    opacity: ".75"
                });
            },
            show: {
                effect: "fade"
            },
            hide: {
                effect: "fade"
            }
        });

    }

    //Create Game Class for each game
    function Game(_el, _data) {

        var THIS = this;
        this.el = _el;
        this.data = _data;

        for (var property in _data) {
            THIS[property] = _data[property];
        }

        //attach click
        this.el.on("click", function(e) {
            //console.log(allowClick);

            //var gameId    = THIS.id;
            openGameInfo(THIS, "game-detail-container");
            //e.preventDefault();

        });

        if (isCSSTransform3D) {
            this.el.css({
                "transform": "translate3d(0px, -3000px, 0px)"
            });
        } else {
            this.el.css({
                "transform": "translateY(-3000px)"
            });
        }

        return this;

    }

    Game.prototype.setOrderNo = function(_index) {

        var THIS = this;
        this.orderNo = _index;

    }

    Game.prototype.getTitles = function(_titleArray) {

        var titles = [];

        jQuery.each(_titleArray, function(index, value) {
            if ((_titleArray[index].title) && (_titleArray[index].title != "undefined") && (_titleArray[index].title != "")) {

                var result = _titleArray[index].title
                    .replace(/\+/g, ' ')
                    .replace(/(\w+)/g, function(string) {
                        return string.substr(0, 1).toUpperCase() + string.substr(1, string.length);
                    });

                titles.push(result);
            }
        });

        var titlesConcat = "";

        if (titles.length > 0) {
            titlesConcat = titles.join(", ");
        }
        return titlesConcat;

    }

    Game.prototype.getFeatures = function() {

        if ((this.features) && (typeof this.features != "undefined") && (this.features.length > 0)) {
            return this.getTitles(this.features);
        } else {
            return false;
        }

    }

    Game.prototype.getMarkets = function() {

        if ((this.market) && (typeof this.market.title != "undefined")) {
            return this.market.title.replace(/\+/g, ' ');
        } else {
            return false;
        }

    }

    Game.prototype.getLongDescription = function() {

        return this.longDescription.replace(/\+/g, ' ');

    }

    Game.prototype.getMechanics = function() {

        if ((this.mechanics) && (typeof this.mechanics != "undefined") && (this.mechanics.length > 0)) {
            return this.mechanics.replace(/\+/g, ' ');
        } else {
            return false;
        }

    }

    Game.prototype.isPlayable = function() {

        return 3000 > parseInt(this.id);

    }

    Game.prototype.showIgtLogo = function() {

        return String(this.hasLandBasedDistribution('igt'));

    }

    Game.prototype.showBallyLogo = function() {

        return String(this.hasLandBasedDistribution('bally'));

    }

    Game.prototype.getPublisher = function() {

        var publisher;

        if (jQuery.isArray(this.publishers) && this.publishers.length > 0) {

            publisher = this.publishers[0];

            return publisher.title;
        }
        
        return false;
    }

    Game.prototype.hasLandBasedDistribution = function(_title) {

        var flag = false;

        if (jQuery.isArray(this.releases)) {

            jQuery.each(this.releases, function(index, val) {

                if ((typeof val.platform == "undefined") && (typeof val.distribution == "undefined")) {
                    return;
                }

                if ('platforms-land-based' !== val.platform.slug) {
                    return;
                }

                if (_title.toLowerCase() === val.distribution.title.toLowerCase()) {
                    //console.log(_title.toLowerCase() +":"+val.distribution.title.toLowerCase());
                    flag = true;
                    return false;
                }

            });
        }

        return flag;

    }

    Game.prototype.updateSize = function(_data) {

        this.width = _data.width;
        this.height = _data.height;
        this.el.width(this.width);

    }

    Game.prototype.updateState = function(_data) {

        //console.log("orderNo: "+this.orderNo);
        var THIS = this;

        setTimeout(function() {
            if ((THIS.orderNo != null) && (THIS.orderNo != "undefined")) {
                THIS.el.fadeIn(200);
                THIS.x = Math.floor(THIS.orderNo / 2) * THIS.width;
                THIS.y = ((THIS.orderNo % 2) == 1) ? THIS.height : 0;
                if (isCSSTransform3D) {
                    THIS.el.css({
                        "transform": "translate3d(" + THIS.x + "px, " + THIS.y + "px, 0px)"
                    });
                } else {
                    THIS.el.css({
                        "transform": "translateX(" + THIS.x + "px) translateY(" + THIS.y + "px)"
                    });
                }
                setTimeout(function() {
                    THIS.el.css({
                        "z-index": 2
                    });
                }, 500);
            } else {
                THIS.el.css({
                    "z-index": 1
                });
                THIS.el.fadeOut(350);
                //var y = ((this.orderNo % 2) == 1) ?600 : -200 ;

                //console.log(THIS.orderNo);
                //this.el.css({"transform":"translateX(-300px)"});

                if (isCSSTransform3D) {
                    THIS.el.css({
                        "transform": "translate3d(" + THIS.x + "px, " + THIS.y + "px, 0px) scale3d(0.6, 0.6, 1)"
                    });
                }
            }
        }, 2 * THIS.orderNo);

    }

    // Pus/Sub design Pattern

    var Events = {
        subscribers: {
            any: [] // event type: subscribers
        },
        on: function(type, fn, context) {
            type = type || 'any';
            fn = typeof fn === 'function' ? fn : context[fn];
            if (typeof this.subscribers[type] === "undefined") {
                this.subscribers[type] = [];
            }
            this.subscribers[type].push({
                fn: fn,
                context: context || this
            });
        },
        remove: function(type, fn, context) {
            this.visitSubscribers('unsubscribe', type, fn, context);
        },
        publish: function(type, publication) {
            this.visitSubscribers('publish', type, publication);
        },
        visitSubscribers: function(action, type, arg, context) {
            var pubtype = type || 'any',
                subscribers = this.subscribers[pubtype],
                i,
                max = subscribers ? subscribers.length : 0;

            for (i = 0; i < max; i += 1) {
                if (action === 'publish') {
                    // Call our observers, passing along arguments
                    subscribers[i].fn.call(subscribers[i].context, arg);
                } else {
                    if (subscribers[i].fn === arg && subscribers[i].context === context) {
                        subscribers.splice(i, 1);
                    }
                }
            }
        }
    }

    return {
        main: main,
        getGame: getGame,
        onFilter: onFilter,
        getCurrRow: getCurrRow,
        setSlideNewPos: setSlideNewPos,
        getSlideCurrXPos: getSlideCurrXPos,
        openGameInfo: openGameInfo,
        setSortBy: setSortBy
    };

}(jQuery));


// Enter: 13
// Up: 38
// Down: 40
// Right: 39
// Left: 37
// Esc: 27
// SpaceBar: 32
// Ctrl: 17
// Alt: 18
// Shift: 16

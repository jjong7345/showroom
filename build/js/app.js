/*var ShowRoom = ShowRoom || {};

jQuery(document).ready(function($) {
	ShowRoom.init();
});*/

ShowRoom = (function($) {

	var winWidth;
    var newTileWidth;
    var newTileHeight;
	this.mySwiper;
	var games;
	var gamesData;
	var totalGames;
    var numRowOnWin = 6;
    var totalRows;
	var allowClick = true;
	var blockAspectRatio = 182/244;

	function loadGameData () {
      var p = $.get('games.json')

      return {
        success: function (cb) {
          p.success(function (data) {
            cb(data.data);
          });
        }
      };
    }



	function init() {

		loadGameData()
      		.success(function (games) {
        		h5gf.gameData.set(games);
        		main();
      		});
	}

	function main() {
		//alert("ie8 is "+mySwiper.browser.ie8 );
		initGames(h5gf.gameData.get());
		render();
		initSwiper();
		initWindowResize();
        initKeyPress();
        createUniqueItem("features-collect-2-wild-bonus");
        createUniqueItem("features-stacked-wilds");
        createUniqueItem("features-split-symbols");
        listenToGames();

        Events.publish("onReState", null);

        setTimeout(function() { 
        	mySwiper.reInit();  
        }, 100);

	}

	function createUniqueItem (unique) {
      //var li = document.createElement('li');
      var li = document.getElementById(unique);
      //li.innerHTML = unique;

      li.onclick = click;

      var added = false;
      function click () {
        if (added = !added) {
          console.log('adding ' + unique);
          h5gf.filters.add(unique);
        } else {
          console.log('removing ' + unique);
          h5gf.filters.remove(unique);
        }
      }

      return li;
    }


	function listenToGames () {
      h5gf.games.addListener(listener);

      function listener (key, oldValue, newValue) {
        onFilter(h5gf.games.get());
      }
    }



	var templateString = $('#game_block_template').html();

	var imageURLMatch = new RegExp('{{ image_url }}', "g");

	function createGameDOMElement (_imagePath) {
		var replacedTemplateString = templateString.replace(imageURLMatch, _imagePath);
		return $($.trim(replacedTemplateString));
	}

	function render(_gamesData) {
		/* use template later */

		var games_container = $(".games-container");

		$.each(games, function(index, data){
			games_container.append(games[index].el);
		});
	}

	var timer2;

	function onFilter(_gamesData) {
		gamesData = _gamesData;

		var temp = [];

		$.each(gamesData, function(index, data) {
			$.each(games, function(index2, data2){
				if (gamesData[index].id == games[index2].id) {
					temp.push(games[index2]);				
				}
			});
		});

		$.each(games, function(index, data) {
			games[index].setOrderNo(null);
			games[index].el.addClass("applyTransition");
		});

		clearTimeout(timer2);
		timer2 = setTimeout(function() {
			$.each(games, function(index, data) {
				games[index].el.removeClass("applyTransition");
			});
		}, 1000);

		$.each(temp, function(index, data) {
			temp[index].setOrderNo(index);
		});

		console.log(games);
		console.log(temp);

		totalGames = gamesData.length;
        totalRows = totalGames / 2;

        Events.publish("onReState", null);

        $(window).resize();

        setTimeout(function() { 
        	mySwiper.reInit();  
        }, 100);

        setSlideNewPos(0, 0);
	}

	function initGames(_gamesData) {
		games = [];
		
		$.each(_gamesData, function(index, data){
			var el = createGameDOMElement("Social/games/"+data.id+"/images/gameroom.jpg");
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

	function initSwiper() {
		mySwiper = new Swiper('.swiper-container', {
			freeMode: true,
			keyboardControl: false,
			freeModeFluid: true,
			slidesPerView: 'auto',
			mousewheelControl:false,
			scrollcontainer: true,
			preventLinksPropagation: true,
			preventLinks : false,
			calculateHeight : true,
			onTouchMove: function() {
                allowClick = false;
                //console.log("allowClick = false");
            },
            onTouchEnd: function() {
                setTimeout(
                    function() {
                        allowClick = true;
                        //console.log("allowClick = true");
                    }, 200);
            },
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

		$(window).resize(function() {

			//console.log(newTileHeight);
			timer = setTimeout(function() {
				clearTimeout(timer);
				var tempWidth = winWidth/numRowOnWin;
				if ((newTileWidth) && (typeof newTileWidth != "undefined")) {
					tempWidth = newTileWidth;
				}

				winWidth = $(window).width();

				newTileWidth = winWidth/numRowOnWin;

				var r = newTileWidth/tempWidth;

				//console.log("ratio: "+tempWidth+" " + newTileWidth);

				setSlideNewPos(getSlideCurrXPos()*r, 0);

				newTileHeight = newTileWidth * blockAspectRatio;

				$(".game").height(newTileHeight);
				Events.publish("onWinResize", {width:newTileWidth, height:newTileHeight});
				Events.publish("onReState", null);

				$(".games-container").width(newTileWidth*Math.ceil(totalGames/2));
				$(".swiper-container").height(Math.floor(newTileWidth*2));
				$(".swiper-scrollbar").css({"margin-top": Math.floor(newTileWidth*1.7) + "px"});
				console.log(getCurrRow());
				//console.log((Math.ceil(totalRows) - numRowOnWin));
				//if (getCurrRow() > (Math.ceil(totalRows) - numRowOnWin))
					//setSlideNewPos(-((Math.ceil(totalRows) - numRowOnWin) * newTileWidth), 300);
				mySwiper.reInit();
			}, 500);

			mySwiper.reInit();


		}).resize();
	}

    function initKeyPress() {
        $(document).on("keydown", function(e) {
            //console.log(e.keyCode);
            var kc = e.keyCode;
            if (kc === 37) 
                toPrevXPos();

            else if (kc === 39) 
                toNextXPos();

            //console.log("row:"+getCurrRow());

        });
    }

    function getSlideCurrXPos() {
        return mySwiper.getWrapperTranslate("x");
    }
    function setSlideNewPos(_pos, _speed) {
        mySwiper.setWrapperTranslate(_pos,0,0);
        mySwiper.setWrapperTransition(_speed);
    }

    function getCurrRow() {
        // console.log("xpos:"+Math.abs(getSlideCurrXPos()));
        // console.log("tile width:"+newTileWidth);
        console.log((Math.abs(getSlideCurrXPos()) / newTileWidth).toFixed(2));
        
        return Math.floor((Math.abs(getSlideCurrXPos()) / newTileWidth).toFixed(2));
    }
    function toNextXPos() {
    	var r = getCurrRow();
    	console.log(r);
        if (r < (totalRows - numRowOnWin))
            setSlideNewPos(-(((r + 1) * newTileWidth)), 300);
    }
    function toPrevXPos() {
    	var r = getCurrRow();
        if (r > 0) 
            setSlideNewPos(-(((r - 1) * newTileWidth)), 300);
        else if (r == 0)
            setSlideNewPos(0);
    }

	function getGames() {
		return games;
	}


	//Create Game Class for each game
	function Game(_el, _data) {

		var THIS = this;
		this.el = _el; 
		this.data = _data;

		for ( var property in _data ) {
			THIS[property] = _data[property];
		}

		//attach click
		this.el.on("click", function(e) {
			//console.log(allowClick);
			if (allowClick) {
                console.log(THIS.data);
                alert(THIS.id);
			}
			
		});
	

		return this;
	}

	Game.prototype.setOrderNo = function(_index) {
		var THIS = this;
		this.orderNo = _index;
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
				THIS.x = Math.floor(THIS.orderNo/2) * THIS.width;
				//console.log(x);
				THIS.y = ((THIS.orderNo % 2) == 1) ?THIS.height : 0 ;
				THIS.el.css({"transform":"translate3d("+THIS.x+"px, "+THIS.y+"px, 0px)"});
				//console.log("show!!");
				setTimeout(function() { THIS.el.css({"z-index":2});}, 500);
			}
			else {
				THIS.el.css({"z-index":1});
				THIS.el.fadeOut(400);
				//var y = ((this.orderNo % 2) == 1) ?600 : -200 ;

				console.log(THIS.orderNo);
				//this.el.css({"transform":"translateX(-300px)"});

				THIS.el.css({"transform":"translate3d("+(THIS.x)+"px, "+THIS.y+"px, 0px) scale3d(0.01, 0.01, 1)"});
				//console.log("hide!!");
			}
		}, 2*THIS.orderNo);
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
            this.subscribers[type].push({ fn: fn, context: context || this });
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
		init: init,
		getGames: getGames,
		onFilter :onFilter,
		getCurrRow: getCurrRow,
		setSlideNewPos: setSlideNewPos,
		getSlideCurrXPos:getSlideCurrXPos
	};

}(jQuery));

module.exports = ShowRoom;


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

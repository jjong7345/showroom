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
		if (ShowRoom.allowClick) {
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

module.exports = Game;
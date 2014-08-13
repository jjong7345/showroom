
$(document).ready(function() {

    // vertical center
    var centerIt = function(){
        var $parent = $("#owl-demo");
        var middleSpace = ($(window).height() - $parent.height())/2 - 20;

        $parent.css("top", middleSpace);
    };

    centerIt();

    $(window).resize(function(){
        centerIt();
    });
});

var d = new Date();
var n = d.getTime();

$("#egg").click(function(){
    // window.location.reload();
    window.location = "/?time=" + n;
});

var owl = $("#owl-demo").owlCarousel({
    items : 6, //10 items above 1000px browser width
    itemsDesktop : [1000,4], //5 items between 1000px and 901px
    itemsDesktopSmall : [900,4], // betweem 900px and 601px
    itemsTablet: [600,2], //2 items between 600 and 0
    itemsMobile : false, // itemsMobile disabled - inherit from itemsTablet option

    navigation : false,
    itemsScaleUp : true,
    singleItem : false,
    addClassActive: true,

    touchDrag: true,
    mouseDrag: true,
    slideSpeed: 300,

    responsive: true,

    expand: true,
    expandWidth: 2, // number of slides to expand
    expandElement: ".imgbtn", // What element acts as a button to expand
    expandClose: ".closebtn",  //an element to close the expand

    beforeMove : function(){
        owl.trigger('owl.expandClose');
    }
});

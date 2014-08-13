$(document).ready(function() {

    H5G.Game.bindPlayButtonClick();
    H5G.Game.bindAvailabilityButtonClick();

    $('a').click(function(event){
        console.log("\n a click");
        console.log(event.target);
    });

});

H5G.namespace('Game');

H5G.Game.bindPlayButtonClick = function() {

    $(document).on('click', '.game-play-trigger', function(e) {

        var container = $('#game-modal');
        var gameLink = $(this);
        var padding  = 36 * 2;
        var border   = 2 * 2;
        var inset    = 2;

        e.preventDefault();

        container.dialog({
            height: 597 + padding + border + inset,
            width: 760 + padding + border + inset,
            resizable: false,
            modal: true,
            open: function(event, ui) {
                H5G.Game.loadGame(gameLink);

                l('game loading...');

                $('#game-preloader').show();
            },
            create: function(event, ui) {
                $(window).resize(function() {
                    container.dialog('option', 'position', 'center');
                });
            },
            close: function(event, ui) {
                l('close modal, remove game swf');

                //swfobject.removeSWF('flash-content');
            },
            show: {
                effect:"fade"
            },
            hide: {
                effect:"fade"
            }
        });

    });

};

H5G.Game.loadGame = function(gameLink) {
    var swfVersionStr = '10.2.153';
    var xiSwfUrlStr   = 'expressInstall.swf';
    var flashvars     = {};
    var params        = {};
    var attributes    = {};

    // if (H5G.config.userId.length) {
    //     flashvars.userid = H5G.config.userId;
    // }

    if (H5G.config.electroServer) {
        flashvars.serverip = escape(H5G.config.electroServer);
    }

    flashvars.cacheId       = H5G.config.cacheId.toString();
    flashvars.showIGTLogo   = gameLink.data('game-show-igt').toString();
    flashvars.showBallyLogo = gameLink.data('game-show-bally').toString();

    l('flashvars:');
    l(flashvars);
    l('game id: ' + gameLink.data('game-id'));

    params.bgcolor           = '#000000';
    params.wmode             = 'opaque';
    params.name              = 'flash-content';
    params.allowscriptaccess = 'sameDomain';
    params.allowfullscreen   = 'true';
    params.base              = 'Social/games/' + gameLink.data('game-id');

    swfobject.embedSWF(
        params.base + '/game.swf',
        'flash-content',
        '760px',
        '630px',
        swfVersionStr,
        xiSwfUrlStr,
        flashvars,
        params,
        attributes,
        swfobjectCallback
    );
};

H5G.Game.bindAvailabilityButtonClick = function() {

    $(document).on('click', '.game-modal-availability-button', function(e) {

        var container = $('.game-availability-modal');

        e.preventDefault();

        container.dialog({
            height: 200,
            width: 200,
            resizable: false,
            modal: true,
            create: function(event, ui) {
                $(window).resize(function() {
                    container.dialog('option', 'position', 'center');
                });
            },
            show: {
                effect:"fade"
            },
            hide: {
                effect:"fade"
            }
        });
    });
};

H5G.Game.Flash = false;

function swfobjectCallback(e) {
    if (true == e.success) {
        H5G.Game.Flash = document.getElementById(e.id);

        l('flash embed success');

        setTimeout(function() {
            H5G.Game.Flash.tabIndex = 0;
            H5G.Game.Flash.focus();

            l('set flash focus');

        }, 500);

    } else {
        // JSON.stringify() will not work in IE 7 and lower
        H5G.log('flash embed failed: ' + JSON.stringify(e), 10, 'game.js', 'swfobjectCallback');
    }
}

function gameLoadComplete() {
    l('game loaded, WOOHOO!');

    $('#game-preloader').fadeOut();
}

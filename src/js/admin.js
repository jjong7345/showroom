
(function($) {

    /**
     * Make game library selectable
     */
    $('#excluded-games').selectable().disableSelection();

    /**
     * Make user games sortable and selectable
     */
    $('#included-games').sortable({
        handle: '.handle'
    }).selectable({
        cancel: '.handle'
    }).disableSelection();

    /**
     * Bind include selected games button click
     */
    $('#exclude-games-button').click(function() {

        var selected = $('#included-games').find('.ui-selected');

        $.each(selected, function(key, value) {

            var game   = $(this);
            var gameId = game.data('game-id');

            $(value).removeClass('ui-selected').appendTo($('#excluded-games'));

            var contacts = $('#excluded-games');
            var cont = contacts.children('li');

            cont.detach().sort(function(a, b) {

                var astts = $(a).data('sid');
                var bstts = $(b).data('sid');
                //return astts - bstts;
                return (astts > bstts) ? (astts > bstts) ? 1 : 0 : -1;
            });

            contacts.append(cont);
        });
    });

    /**
     * Bind exclude selected games button click
     */
    $('#include-games-button').click(function() {

        var selected = $('#excluded-games').find('.ui-selected');

        $.each(selected, function(key, value) {

            var game   = $(this);
            var gameId = game.data('game-id');

            $(value).removeClass('ui-selected').clone().appendTo($('#included-games'));

            $(value).hide();

            var contacts = $('#included-games');
            var cont = contacts.children('li');

            // cont.detach().sort(function(a, b) {

            //     var astts = $(a).data('sid');
            //     var bstts = $(b).data('sid');
            //     //return astts - bstts;
            //     return (astts > bstts) ? (astts > bstts) ? 1 : 0 : -1;
            // });

            // contacts.append(cont);
        });
    });

    /**
     * Bind exclude selected games button click
     */
    $('#user-games-form').click(function(e) {
        e.preventDefault();

        var form = $(this);

        // console.log(form.attr('action'));

    });

})(jQuery);


/**
 * Bind delete confirmation trigger
 */
$('.trigger-delete-confirmation').click(function() {

    if (confirm('Are you sure?')) {

        $(this).parents('form').submit();

        return false;
    }

    return false;
});

$('#save-button').click(function() {

    var gameIds  = [];
    var selected = $('#included-games').find('li.ui-selectee');

    $.each(selected, function(key, value) {

        var gameId = $(this).attr('data-game-id');

        gameIds.push(gameId);

     });

    $.ajax({
        url: $('#save-button').attr('data-url'),
        type: 'POST',
        data :{
            "games[]": gameIds
        }
    }).done(function(html) {
        window.location.replace("/admin");
    });
});

$('#show-all').click(function() {

    var selected = $('#excluded-games').find('.ui-widget-content');

    $.each(selected, function(key, value) {

        $(this).show();

    });

    var to_hide = $('#included-games').find('.ui-widget-content');

    $.each(to_hide, function(key, value) {

        gameId = $(this).attr('data-game-id');

        $("#excluded-games").find("[data-game-id='" + gameId + "']").hide();

     });
});


$('#filter-button').click(function() {

    var casinos   = [];
    var platforms = [];
    var features  = [];
    var filtered;

    $('#casino:checked').each(function() {
        casinos.push($(this).val());
    });

    $('#platform:checked').each(function() {
        platforms.push($(this).val());
    });

    $('#feature:checked').each(function() {
        features.push($(this).val());
    });

    // console.log(features);   
    // console.log(platforms);  
    // console.log(casinos);  

    if ( casinos != '' || platforms != '' || features != '' ) {

        $.ajax({
            url: '/filters',
            type: 'POST',
            data :{
                "casinos[]" : casinos,
                "platforms[]" : platforms,
                "features[]" : features
            }
        }).done(function(html) {

            var selected;

            html = $.parseJSON(html);

            if (html.length > 0) {

                selected = $('#excluded-games').find('.ui-widget-content');

                $.each(selected, function(key, value) {

                    $(this).hide();

                });

                $.each(html, function(keys, values) {

                    // console.log(values);

                    $("ul").find("[data-game-id='" + values + "']").show();

                });

                var to_hide = $('#included-games').find('.ui-widget-content');

                $.each(to_hide, function(key, value) {

                    gameId = $(this).attr('data-game-id');

                    $("#excluded-games").find("[data-game-id='" + gameId + "']").hide();

                 });

            } else {

                // alert('No result found!');

                selected = $('#excluded-games').find('.ui-widget-content');

                $.each(selected, function(key, value) {

                    $(this).show();

                });
            }
        });
    }
});


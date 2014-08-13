
$(document).ready(function() {

    H5G.config = H5G.parseElementJson('#js-config');

    l(H5G.config);

});

/*
base H5G namespace
add namespace example: H5G.namespace('Game');
*/
var H5G = {
    namespace: function (namespace) {
        var object = this;
        var parts  = namespace.split('.');
        var length = parts.length;
        var i      = 0;

        // loop number or parts
        for (i; i < length; i++) {
            // determine if part exists
            if (!object[parts[i]]) {
                object[parts[i]] = {};
            }

            object = object[parts[i]];
        }

        return object;
    }
};

// debug flag
H5G.debug = function() {

    // todo: determine debug state

    return true;
};

// logger
H5G.log = function(data) {
    if (H5G.debug) {
        console.log(data);
    }
};

// parse element json
H5G.parseElementJson = function(selector) {
    var value = $(selector).val();

    value = decodeURIComponent(value);
    value = $.parseJSON(value);

    return value;
};

// global logger
function l(data) {
    H5G.log(data);
}

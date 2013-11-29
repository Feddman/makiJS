;
(function($, window, document, undefined) {
    "use strict";
    // Create a global makiSettings array to fill with settings objects
    window.__makiSettings = [];

    /* jQuery.prototype.maki */
    $.fn.maki = function(overrides) {

        // Make sure all the ajax requests are sync and nothing is cached
        $.ajaxSetup({
            async: false,
            cache: false
        });

        // If there are no overrides, create an empty overrides object
        if (!overrides) {
            overrides = {};
        }

        // Cache element context incl one wrapped in jQuery
        var el = this,
            $el = $(this);

        // Store default maki settings
        this.defaults = {
            content: "h1>{Welcome to maki!}",
            contentSrc: false,
            codeView: false,
            copyControls: false,
            append: false,
            clearfix: true,
            hash: false,
            path: "/Scripts/makiSrc",
            debug: false
        };

        if (overrides.hash && overrides.hash.indexOf('#') !== 0) {
            overrides.hash = '#' + overrides.hash;
        }

        // Load in maki.js
        if (overrides.hash && overrides.hash == location.hash) {
            var makiPath = (typeof overrides.path !== 'undefined') ? overrides.path + "/" : "/Scripts/makiSrc/";
            $.getScript(makiPath + "maki.js");

            var settings = makiJS.setup(overrides, this.defaults);
        } else if (!overrides.hash) {
            var makiPath = (typeof overrides.path !== 'undefined') ? overrides.path + "/" : "/Scripts/makiSrc/";
            $.getScript(makiPath + "maki.js");

            var settings = makiJS.setup(overrides, this.defaults);
        } else {
            var settings = $.extend({}, this.defaults, overrides);
        }

        // Keep a property of whether maki is activated or not
        settings.init = false;

        // If the hash is provided and it equals the hash that is passed in
        if (settings.hash && location.hash == settings.hash) {
            location.hash = "#maki-init";
            settings.init = true;
        }

        // On hash changed, do some checks and initialize maki
        $(window).on('hashchange', function() {
            if (overrides.hash && location.hash == overrides.hash && settings.init == false) {
                settings.init = true;
            }

            // If hash location is #maki-init and it is initialized
            if (location.hash == "#maki-init" && settings.init == true) {
                makiJS.loadDependencies(settings);
                makiJS.create(settings, $el);
                // If hash location is NOT #maki-init yet it is set to be initialized, reload the browser
            } else if (location.hash !== "#maki-init" && settings.init == true) {
                location.reload();
            }
        });

        // if there is no hash property filled in, execute maki instantly
        if (!overrides.hash) {
            makiJS.loadDependencies(settings);
            makiJS.create(settings, $el);
        }

        // Finally, store a settings array in the global scope
        window.__makiSettings.push(settings);

    } /* End jQuery.prototype.maki */


})(jQuery, window, document);
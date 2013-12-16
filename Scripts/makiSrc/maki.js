/**
@obj    makiJS
@desc   The object that holds all maki's methods
*/

var makiJS = {

    /** 
    @func       =setup
    @namespace  @makiJS
    @desc       Sets up all makis properties before running them through
    @returns    formatted settings object
    **/
    setup: function(overrides, defaults) {
        // Set codeView variable equal to the copyControls if not defined
        overrides.codeView = (overrides.codeView) ? overrides.codeView : defaults.copyControls;
        // Merge the defaults and overrides in a settings variable
        var settings = $.extend({}, defaults, overrides);

        // If contentSrc is filled in, load in that source
        if (settings.contentSrc) {
            settings.contentSrc = (settings.contentSrc.indexOf('/') == 0) ? settings.contentSrc : settings.path + "/" + settings.contentSrc;

            this.loadConfig(settings);
        }

        // If the contents of settings.content is an array or multiple, if so: concat them
        if ($.isArray(settings.content[0])) {
            for (var i = 0, len = settings.content.length; i < len; ++i) {
                settings.content += settings.content[i - 1];
            }
            settings.content = settings.content.split(',');
        }
        // Check if hash does not contain a hash, if not: put a hash in front of the given string
        if (settings.hash && settings.hash.indexOf('#') < 0) {
            settings.hash = '#' + settings.hash;
        }

        // Check if content is a string, and if so. Convert it to an array.
        if (typeof settings.content == "string") {
            var comma = (settings.content.indexOf(', ') !== -1) ? ', ' : ',';
            settings.content = settings.content.split(comma);
        }

        // Check if path has a slash at the end, if not: add it on there
        if (settings.path && settings.path.indexOf('/') > -1 && settings.path.lastIndexOf('/') !== settings.path.length - 1) {
            settings.path = settings.path + "/";
        }
        // Check if path has a slash at the beginning, if so: strip it off
        if (settings.path.indexOf('/') == 0) {
            settings.path = settings.path.substr(1);
        }

        return settings;
    },
    /* End makiJS.setup */

    /** 
    @func       =loadConfig
    @namespace  @makiJS
    @desc       Loads in maki's contentSrc asynchronously
    **/
    loadConfig: function(settings) {
        var sc = settings.contentSrc,
            extension = sc.indexOf('.txt') !== -1 ? "text" : "json";

        $.ajax({
            dataType: extension,
            url: sc,
            success: function(resp) {
                if (typeof settings.content == 'string' && settings.content.indexOf('>') == -1) {
                    var elemArr = settings.content;
                }

                if (extension == "text") {
                    settings.content = resp.split('\n');
                } else if (extension == "json") {
                    settings.content = (elemArr !== undefined && resp[elemArr] !== null) ? resp[elemArr] : (function() {
                        var settArray = [];
                        $.map(resp, function(val, key) {
                            for (var i = 0, len = val.length; i < len; i++) {
                                settArray.push(val[i]);
                            }
                        });

                        return settArray;
                    })();
                }
            },
            error: function(e) {
                console.log(e);
            }
        });
    },

    /** 
    @func       =loadMakiDependencies
    @namespace  @makiJS
    @desc       Loads maki's dependencies
    **/
    loadDependencies: function(settings) {
        // If debug is set to true, load in all depedencies individually
        if (settings.debug) {
            $.getScript(settings.path + "prettify.js");
            $.getScript(settings.path + "jquery.zencoding.js");
            $.getScript(settings.path + "ZeroClipboard.js");
        } else if (!settings.debug) {
            // Load in a minified file of all dependencies        
            $.getScript(settings.path + "makiDependencies.min.js");
        }
    },
    /* End makiJS.loadDependencies */

    /** 
    @func       =create
    @namespace  @makiJS
    @param      settings | maki's settings object
    @param      $this | The element selected
    **/
    create: function(settings, $this) {

            /**
            @func       =loremReplace
            @desc       Function to replace lorem, since the zencoding-plugin doesn't understand this.
            @param      e | emmet string to check
            @return     the emmet-string with lorem's replaced
            **/
        var loremReplace = function(e) {
                while (e.indexOf('lorem') > -1) {
                    e = e.replace("{lorem}", "{Lorem ipsum dolor sit amet, <a href=\"/\">consectetur adipisicing elit</a>. Mollitia, cumque, quasi, consequatur, esse accusantium perferendis delectus quis pariatur nobis quam saepe voluptates quia iusto facere quidem dolorum dicta omnis consectetur.}");
                }
                return e;
            };

        // If there is content filled in and copyControls are enabled 
        if (settings.content.length && settings.copyControls == true) {
            // Create an empty div element as placeholder for content
            var $element = $('<div />'),
                e;

            // If append is false, remove all contents from the element before appending
            if (settings.append == false) {
                $this.html('');
            }

            // Loop through the content array and display the needed elements on the screen
            for (var i = 0, len = settings.content.length; i < len; i++) {
                    e = loremReplace(settings.content[i]);

                var $makiWrapper = $('<div class="makiWrapper clearfix"><div class="makiBtnWrapper"><button class="btnCopyEmmet">Copy Emmet</button> <button class="btnCopyHTML">Copy HTML</button></div></div>').attr('data-emmet', e),
                    $makiSnippet = $('<div class="makiSnippet clearfix"/>').zencode(e);

                // Append it to the temporary div element
                $element.append($makiWrapper.prepend($makiSnippet));
            }

            // Append the html() from the temporary div to the selected element
            $this.append($element.html());
            
            // If codeView is set to true, loop through wrappers and append codeView
            if (settings.codeView) {
                for (var i = $('.prettyprint').length, len = i + settings.content.length; i < len; i++) {
                    var makiHTML = $('.makiSnippet').eq(i).html(),
                        codeView = $("<pre class='prettyprint' />").text(makiHTML);
                    $('.makiWrapper').eq(i).append(codeView);
                }
            }

            // Create the syntax highlighting
            prettyPrint();
        } else {
            var $element = $('<div />'),
                e;

            if (settings.append == false) {
                $this.html('');
            }

            // Loop through the content array and display the needed elements on the screen
            for (var i = 0, len = settings.content.length; i < len; i++) {
                    e = loremReplace(settings.content[i]);

                    $makiWrapper = $('<span />').attr('data-emmet', e),
                    $makiSnippet = $('<span />').zencode(e);

                if (settings.clearfix) {
                    $makiSnippet.addClass('clearfix');
                }

                // Append it to the temporary div element
                $element.append($makiWrapper.prepend($makiSnippet));

            }
            // Append the html() from the temporary div to the selected element
            $this.append($element.html());
        }

        // Create the buttons to copy emmet/HTML with
        var copyButtons = $('button.btnCopyEmmet, button.btnCopyHTML'),
            snippet = "",

            // Create a new ZeroClipboard instance
            clip = new ZeroClipboard(copyButtons, {
                moviePath: settings.path + "ZeroClipboard.swf"
            });

        // As soon as the data is requested from one of the buttons, copy the right content to the clipboard */
        clip.on('dataRequested', function(client, args) {
            $('.copyNotification').remove();            
            var $this = $(this)
            if ($this.hasClass('btnCopyEmmet')) {
                snippet = $this.parents('.makiWrapper').attr('data-emmet');
                $this.parents('.makiBtnWrapper').append($('<div class="copyNotification">Copied Emmet!</div>'));
            }

            if ($this.hasClass('btnCopyHTML')) {
                snippet = $this.parents('.makiWrapper').find('.makiSnippet').html();
                $this.parents('.makiBtnWrapper').append($('<div class="copyNotification">Copied HTML!</div>'));
            }

            clip.setText(snippet);

            $('.copyNotification').fadeOut(5000, function() {
                $(this).remove();
            });
        });

    } /* End makiJS.create */


}; /* End makiJS object */

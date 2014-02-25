(function(window, $) {

    var ImboDemo = function(options) {
        if (!options.element) {
            console.error('Don\'t know which element to hook on to');
            return false;
        }

        this.element = $(options.element);
        this.addEvents();

        if (!options.host) {
            console.error('No host specified for Imbo-demo');
            this.element.find('.file-uploader').replaceWith('<h3>No demo-host specified</h3>');
            return false;
        }

        this.client  = new Imbo.Client(options.host, options.publicKey, options.privateKey);
        this.result  = this.element.find('.demo-result');
        this.urlEl   = this.element.find('.demo-url');
    };

    $.extend(ImboDemo.prototype, {

        handleFileChange: function(e) {
            this.progress = $('<progress />').attr({
                max: 100,
                value: 0
            });

            this.progress.insertAfter($('<br>').insertAfter(e.target));

            var files = e.target.files || e.dataTransfer.files;

            this.client.addImage(files[0], {
                onComplete      : this.onComplete.bind(this),
                onProgress      : this.onUploadProgress.bind(this)
            });
        },

        onUploadProgress: function(e) {
            if (!e.lengthComputable) { return; }
            var percentage = Math.round((e.loaded * 100) / e.total);
            this.progress.attr('value', percentage);
        },

        onComplete: function(err, identifier, res) {
            var success;
            if (err || !identifier) {
                success = $('<h3 />').text('Failed! Sorry :(');
            } else {
                success = $('<h3 />').text('Done! Image identifier: ' + identifier);
            }

            this.result.append(success);
            var url = this.client.getImageUrl(identifier).maxSize({ width: 200, height: 200 });
            var img = $('<img />').attr('src', url.toString()).insertAfter(success);

            this.imageDemo = $('.result-img', this.element).attr('src', url.reset().toString());

            this.url = url;
            this.updateUrl();
            Reveal.down();

            if (document.activeElement !== document.body) {
                document.activeElement.blur();
                document.body.focus();
            }

            this.progress.remove();
        },

        addEvents: function() {
            Reveal.addEventListener('slidechanged', function(e) {
                if ($(e.currentSlide).hasClass('transformations') && !this.url) {
                    Reveal.up();
                    Reveal.up();
                } else if ($(e.currentSlide).hasClass('result') && !this.url) {
                    Reveal.up();
                }
            }.bind(this));

            this.element.find('input[type=file]').on('change', this.handleFileChange.bind(this));

            var buttons = this.element.find('.buttons'), imbo = this;

            $('.thumbnail', buttons).on('click', function() {
                var dim = prompt('Width,height', '120,120');
                if (!dim) { return; }
                dim = dim.split(',');
                imbo.imageDemo.attr('src', imbo.url.thumbnail({ width: dim[0] || 120, height: dim[1] || 120 }));
            });

            $('.border', buttons).on('click', function() {
                imbo.imageDemo.attr('src', imbo.url.border({ color: '#bf1942', width: 25, height: 25 }));
            });

            $('.maxSize', buttons).on('click', function() {
                var dim = prompt('Width,height', '120,120');
                if (!dim) { return; }
                dim = dim.split(',');
                imbo.imageDemo.attr('src', imbo.url.maxSize({ width: dim[0] || 120, height: dim[1] || 120 }));
            });

            $('.crop', buttons).on('click', function() {
                var dim = prompt('X,Y,Width,Height', '64,150,256,256');
                if (!dim) { return; }
                dim = dim.split(',');
                imbo.imageDemo.attr('src', imbo.url.crop({ x: dim[0], y: dim[1], width: dim[2], height: dim[3] }));
            });

            $('.flipY', buttons).on('click', function() {
                imbo.imageDemo.attr('src', imbo.url.flipVertically());
            });

            $('.flipX', buttons).on('click', function() {
                imbo.imageDemo.attr('src', imbo.url.flipHorizontally());
            });

            $('.rotate', buttons).on('click', function() {
                var angle = prompt('Angle', '-45');
                if (!angle) { return; }
                imbo.imageDemo.attr('src', imbo.url.rotate({ angle: angle }));
            });

            $('.sepia', buttons).on('click', function() {
                imbo.imageDemo.attr('src', imbo.url.sepia());
            });

            $('.desat', buttons).on('click', function() {
                imbo.imageDemo.attr('src', imbo.url.desaturate());
            });

            $('.reset').on('click', function() {
                imbo.imageDemo.attr('src', imbo.url.reset());
            }).parent().find('button').on('click', function() {
                this.updateUrl();
            }.bind(imbo));
        },

        updateUrl: function() {
            this.urlEl.text(decodeURIComponent(this.url.toString()));
        }

    });

    window.ImboDemo = ImboDemo;

})(window, jQuery);
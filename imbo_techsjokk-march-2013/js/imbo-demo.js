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
            var file  = files[0];
            var demo  = this;

            var reader = new FileReader();
            reader.onload = function(e) {
                this.client.addImageFromBlob(e.target.result, {
                    complete      : demo.onComplete.bind(this),
                    uploadComplete: demo.onUploadComplete.bind(this),
                    progress      : demo.onUploadProgress.bind(this)
                });
            }.bind(this);
            reader.readAsBinaryString(file);
        },

        onUploadProgress: function(e) {
            if (!e.lengthComputable) { return; }
            var percentage = Math.round((e.loaded * 100) / e.total);
            this.progress.attr('value', percentage);
        },

        onUploadComplete: function(err, identifier, res) {

        },

        onComplete: function(err, identifier, res) {
            var success;
            if (err || !identifier) {
                success = $('<h3 />').text('Failed! Sorry :(');
            } else {
                success = $('<h3 />').text('Done! Image identifier: ' + identifier);
            }

            this.result.append(success);
            var url = this.client.getImageUrl(identifier).maxSize(200, 200);
            var img = $('<img />').attr('src', url.toString()).insertAfter(success);

            this.imageDemo = $('.result-img', this.element).attr('src', url.reset().toString());

            this.url = url;
            this.updateUrl();
            Reveal.down();

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
                var dim = prompt('Width,height', '120,120').split(',');
                imbo.imageDemo.attr('src', imbo.url.thumbnail(dim[0] || 120, dim[1] || 120));
            });

            $('.border', buttons).on('click', function() {
                imbo.imageDemo.attr('src', imbo.url.border('#bf1942', 25, 25));
            });

            $('.maxSize', buttons).on('click', function() {
                var dim = prompt('Width,height', '120,120').split(',');
                imbo.imageDemo.attr('src', imbo.url.maxSize(dim[0] || 120, dim[1] || 120));
            });

            $('.crop', buttons).on('click', function() {
                var dim = prompt('X,Y,Width,Height', '64,150,256,256').split(',');
                imbo.imageDemo.attr('src', imbo.url.crop(dim[0], dim[1], dim[2], dim[3]));
            });

            $('.flipY', buttons).on('click', function() {
                imbo.imageDemo.attr('src', imbo.url.flipVertically());
            });

            $('.flipX', buttons).on('click', function() {
                imbo.imageDemo.attr('src', imbo.url.flipHorizontally());
            });

            $('.rotate', buttons).on('click', function() {
                imbo.imageDemo.attr('src', imbo.url.rotate(prompt('Angle', '-45')));
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
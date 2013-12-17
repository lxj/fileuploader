(function() {
    var d = document,
    w = window;
    function addEvent(el, type, fn) {
        if (w.addEventListener) {
            el.addEventListener(type, fn, false)
        } else {
            if (w.attachEvent) {
                var f = function() {
                    fn.call(el, w.event)
                };
                el.attachEvent("on" + type, f)
            }
        }
    }
    var toElement = function() {
        var div = d.createElement("div");
        return function(html) {
            div.innerHTML = html;
            var el = div.childNodes[0];
            div.removeChild(el);
            return el
        }
    } ();
    var getUID = function() {
        var id = 0;
        return function() {
            return "ValumsAjaxUpload" + id++
        }
    } ();
    function fileFromPath(file) {
        return file.replace(/.*(\/|\\)/, "")
    }
    function getExt(file) {
        return (/[.]/.exec(file)) ? /[^.]+$/.exec(file.toLowerCase()) : ""
    }
    AjaxUpload = function(button, options) {
        this._input = null;
		this._div = null;
        this._button = button[0];
        this._isdestory = true;
        this._settings = {
            action: "upload.php",
            name: "userfile",
            data: {},
            autoSubmit: true,
            responseType: false,
            onChange: function(file, extension) {},
            onSubmit: function(file, extension) {},
            onComplete: function(file, response) {}
        };
        this._styles = {
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            fontSize: 28
        };
		$.extend(this._styles,options.styles);
		$.extend(this._settings,options);
        var self = this;
        button.bind("mouseover",
        function() {
			self._createInput();
        });
    };
    AjaxUpload.prototype = {
        setData: function(data) {
            this._settings.data = data
        },
        destroy: function() {
            if (this._input) {
				d.body.removeChild(this._div);
                this._input = null;
				this._div = null;
            }
        },
        _initInput: function() {
            var self = this;
            var offset = $(self._button).offset();
            var top = (offset.top + self._styles.top) + "px";
            var left = (offset.left + self._styles.left) + "px";
            var width = $(self._button).width() + self._styles.width;
            var height = $(self._button).height() + self._styles.height;
            var ml = width - $(self._input).width() + "px";
            var styles1 = {
                top: top,
                left: left,
				width: width + "px",
                height: height + "px"
            };
            var styles2 = {
                marginLeft: ml,
                height: height + "px"
            };
            for (var i in styles1) {
                self._div.style[i] = styles1[i]
            }
			for (var i in styles2) {
                self._input.style[i] = styles2[i]
            }
        },
        _createInput: function() {
            var self = this;
            var input = d.createElement("input");
			var div = d.createElement("div");
            input.setAttribute("type", "file");
            input.setAttribute("name", this._settings.name);
            var styles1 = {
                position: "absolute",
                padding: 0,
                top: 0,
                left: 0,
                height: 0,
				width: "100px",
				overflow:"hidden",
				cursor: "pointer",
                zIndex: 45555
            };
            var styles2 = {
                fontSize: self._styles.fontSize + "px",
                height: 0,
                opacity: 0,
                cursor: "pointer"
            };

			for(var i in styles1){
				div.style[i] = styles1[i];
			}
            for (var i in styles2) {
                input.style[i] = styles2[i]
            }
            if (! (input.style.opacity === "0")) {
                input.style.filter = "alpha(opacity=0)"
            }
            addEvent(div, "mouseout",
            function() {
				if(self._isdestory){
					self.destroy();
				}
            });	
			d.body.appendChild(div);
            div.appendChild(input);

            addEvent(input, "change",
            function() {
                var file = fileFromPath(this.value);
                if (self._settings.onChange.call(self, file, getExt(file)) == false) {
                    return
                }
                if (self._settings.autoSubmit) {
                    self.submit()
                }
            });
            addEvent(input, "click",
            function() {
                self._isdestory = false;
                setTimeout(function() {
                    self._isdestory = true
                },
                2500)
            });
            this._input = input;
			this._div = div;
			this._initInput();
        },
        _createIframe: function() {
            var id = getUID();
            var iframe = toElement('<iframe src="javascript:false;" name="' + id + '" />');
            iframe.id = id;
            iframe.style.display = "none";
            d.body.appendChild(iframe);
            return iframe
        },
        submit: function() {
            var self = this,
            settings = this._settings;
            if (this._input.value === "") {
                return
            }
            var file = fileFromPath(this._input.value);
            if (! (settings.onSubmit.call(this, file, getExt(file)) == false)) {
                var iframe = this._createIframe();
                var form = this._createForm(iframe);
                form.appendChild(this._input);
                form.submit();
                d.body.removeChild(form);
                form = null;
				this.destroy();
                //this._createInput();
                var toDeleteFlag = false;
                addEvent(iframe, "load",
                function(e) {
                    if (iframe.src == "javascript:'%3Chtml%3E%3C/html%3E';" || iframe.src == "javascript:'<html></html>';") {
                        if (toDeleteFlag) {
                            setTimeout(function() {
                                d.body.removeChild(iframe)
                            },
                            0)
                        }
                        return
                    }
                    var doc = iframe.contentDocument ? iframe.contentDocument: frames[iframe.id].document;
                    if (doc.readyState && doc.readyState != "complete") {
                        return
                    }
                    if (doc.body && doc.body.innerHTML == "false") {
                        return
                    }
                    var response;
                    if (doc.XMLDocument) {
                        response = doc.XMLDocument
                    } else {
                        if (doc.body) {
                            response = doc.body.innerHTML;
                            if (settings.responseType && settings.responseType.toLowerCase() == "json") {
                                if (doc.body.firstChild && doc.body.firstChild.nodeName.toUpperCase() == "PRE") {
                                    response = doc.body.firstChild.firstChild.nodeValue
                                }
                                if (response) {
                                    response = response.replace(/<div\sfirebugversion="[\d\.]+"\sstyle="display:\snone;"\sid="_firebugConsole"><\/div>/, "");
                                    response = eval("(" + response + ")")
                                } else {
                                    response = {}
                                }
                            }
                        } else {
                            var response = doc
                        }
                    }
                    settings.onComplete.call(self, file, response);
                    toDeleteFlag = true;
                    iframe.src = "javascript:'<html></html>';"
                })
            } else {
                this.destroy();
                this._createInput();
            }
        },
        _createForm: function(iframe) {
            var settings = this._settings;
            var form = toElement('<form method="post" enctype="multipart/form-data"></form>');
            form.style.display = "none";
            form.action = settings.action;
            form.target = iframe.name;
            d.body.appendChild(form);
            for (var prop in settings.data) {
                var el = d.createElement("input");
                el.type = "hidden";
                el.name = prop;
                el.value = settings.data[prop];
                form.appendChild(el)
            }
            return form
        }
    }
})();
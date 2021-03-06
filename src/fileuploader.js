/**
 * Created with JetBrains WebStorm.
 * User: LXJ
 * Date: 13-3-9
 * Time: 下午3:48
 * version: v1.0.0
 * To change this template use File | Settings | File Templates.
 */
;(function(S){
    function fileuploader(btn,opts){
        var body = document.body,
            btn = typeof btn == 'string' ? document.getElementById(btn) : btn,
            action = opts.action,
            changeBefore = opts.changeBefore,
            complete = opts.complete,
            zIndex = opts.zIndex,
            fileinputname = opts.fileinputname;
        function iframeLoad(iframe, callback) {
            var _this = this;
            if (! (_this instanceof iframeLoad)) {
                return new iframeLoad(iframe, callback);
            }
            this.frame = iframe;
            function loadFt(){
                if (!iframe.parentNode){
                    return;
                }
                if (iframe.contentDocument &&
                    iframe.contentDocument.body &&
                    iframe.contentDocument.body.innerHTML == "false"){
                    return;
                }
                callback.call(iframe,getIframeContentJSON(iframe));
            }
            function getIframeContentJSON(iframe){
                var doc = iframe.contentDocument ? iframe.contentDocument: iframe.contentWindow.document,
                    response;
                try {
                    response = eval("(" + doc.body.innerHTML + ")");
                } catch(err){
                    response = {};
                }
                return response;
            }
            if (this.frame.attachEvent){
                this.frame.attachEvent("onload",loadFt);
            } else {
                this.frame.onload = function() {loadFt();}
            }
        };
        function fileuploaderBase(opts){
            var _this = this;
            if (! (_this instanceof fileuploaderBase)) {
                return new fileuploaderBase(opts);
            }
            this.destroyKey = true;
            this.init();
        }
        fileuploaderBase.prototype={
            "init" : function(){
                if(!btn){
                    return false;
                }
                this.btnBind();
            },
            "offset":function(obj){
                var x = 0, y = 0;
                if (obj.getBoundingClientRect){ //for IE,FF3.0+,Opera9.5+ ,google
                    var box = obj.getBoundingClientRect();
                    var D = document.documentElement;
                    x = box.left + Math.max(D.scrollLeft, document.body.scrollLeft) - D.clientLeft;
                    y = box.top + Math.max(D.scrollTop, document.body.scrollTop) - D.clientTop;

                } else {    //个别低版本不支持getBoundingClientRect()t的浏览器

                    for(; obj != document.body; x += obj.offsetLeft, y += obj.offsetTop, obj = obj.offsetParent );
                }
                return {'x':x, 'y':y,'left':x, 'top':y};
            },
            "onchange" : function(){
                var self =this;
                this.input.onchange = function(){
                    if(changeBefore && changeBefore.call(this,btn)===false){
                        return false;
                    };
                    self.formWrap.style.display='none';
                    self.createIframe();
                    self.form.submit();
                    btn.uploadkey = true;
                    iframeLoad(self.iframe,function(data){
                        complete && complete.call(self,data,btn);
                        self.destroy();
                        self.destroyKey = true;
                        btn.uploadkey = false;
                    });
                }
            },
            "btnBind" : function(){
                var self =this;
                btn.uploadkey = false;
                btn.onmouseover = function(){
                    if(this.uploadkey) return false;
                    var w = this.offsetWidth,h=this.offsetHeight,offset = self.offset(this),formWrap;
                    self.destroy();
                    !self.formWrap && (formWrap = self.createForm(w,h));
                    formWrap.style.left = offset.x+'px';
                    formWrap.style.top = offset.y+'px';
                    formWrap.style.display = 'block';
                    self.onchange();
                    formWrap.onmouseout = function(){
                        self.destroyKey && self.destroy();
                    }
                    formWrap.onclick = function(){
                        self.destroyKey = false;
                    }
                }
            },
            "createElement" : function(html,parent){
                var div = document.createElement('div');
                div.innerHTML = html;
                var element = div.firstChild;
                div.removeChild(element);
                parent && parent.appendChild(element);
                return element;
            },
            "createIframe" : function(){
                this.iframe = this.createElement('<iframe src="javascript:false;" name="'+fileinputname+'_uploaderframe" id="'+fileinputname+'_uploaderframe" style="display:none"></iframe>',body);
                return this.iframe;
            },
            "createForm" : function(w,h){
                this.formWrap = this.createElement('<div style="width:'+w+'px;height:'+h+'px;position:absolute;opacity:0;filter:alpha(opacity=0);overflow:hidden;cursor:pointer"></div>',body);
                if(zIndex){
                    this.formWrap.style.zIndex=zIndex;
                };
                this.form = this.createElement('<form method="post" target="'+fileinputname+'_uploaderframe" action="'+action+'" enctype="multipart/form-data"></form>',this.formWrap);
                this.input = this.createElement('<input style="position:absolute;top:-10px;right:-5px;font-size:50px;opacity:0;filter:alpha(opacity=0);cursor:pointer" type="file" name="'+fileinputname+'">',this.form);
                return this.formWrap;
            },
            "destroy" : function(){
                if(this.iframe){
                    body.removeChild(this.iframe);
                    this.iframe = null;
                }
                if(this.formWrap){
                    body.removeChild(this.formWrap);
                    this.formWrap = null;
                    this.form = null;
                    this.input = null;
                }
            }
        }
        return fileuploaderBase(btn,opts);
    }
    S.fileuploader = fileuploader;
})(window);
/* 
 * $Id:om-comboTree
 * Depends:
 *  om-core.js
 *  om-tree.js
 */
(function($){
   // var _valueKey='_value';
    
    $.omWidget('om.omComboTree', {
        options:{
            optionField:'text',
            valueField:'id',
            parentField:'pid',
            simpleDataModel:false,
            showCheckbox: false,
            expandAll:false,
            collapseAll:true,
            width : 'auto',
            disabled : false,
            readOnly : false,
            editable : false,
            lazyLoad : false,
            listMaxHeight : 300,
            listAutoWidth : false,
            onlyChild:false,
            multi : false, 
            multiSeparator : ',',
            emptyText:'None'
        },
        _init:function(){      //创建dom完成以后执行
            var options = this.options,
            inputEl = this.textInput,
            source = options.dataSource;
                
            //由于在lazyLoad=false的情况下设置value时无法显示正确的fieldText
            if (typeof options.value !== 'undefined') {
                options.lazyLoad = false;
            }
            
            if (options.width != 'auto') {
                var span = inputEl.parent().width(options.width);
                inputEl.width(span.innerWidth() - inputEl.next().outerWidth() - inputEl.outerWidth() + inputEl.width());
            }
            
            if (options.multi) {
                options.editable = this.options.editable = false;
            }
            
            this._refeshEmptyText(options.emptyText);
            
            options.disabled ? inputEl.attr('disabled', true) : inputEl.removeAttr('disabled');
            (options.readOnly || !options.editable) ? inputEl.attr('readonly', 'readOnly') : inputEl.removeAttr('readonly');
            
            if (!options.lazyLoad) {
                //load data immediately
                this._toggleLoading('add');
                if(source && typeof source == 'string'){
                    this._ajaxLoad(source);
                }else if(source && typeof source == 'object'){
                    this._loadData(source);
                    this._toggleLoading('remove');
                }else{
                    //neither records nor remote url was found
                    this.dataHasLoaded = true;
                    this._toggleLoading('remove');
                }
                
            } else {
                this.dataHasLoaded = false;
            }
            
            var unusable = options.disabled || options.readOnly;

            if (unusable) {
                this.expandTrigger.addClass('om-state-disabled');
            } else {
                this._bindEvent();
            }
        },
        _create:function(){ //创建dom
            var inputEl = this.element;
          //  inputEl.attr('autocomplete', 'off');
            var span = $('<span class="om-combo om-combotree om-widget om-state-default"></span>').css({position:'relative'}).insertAfter(inputEl).wrapInner(inputEl);
            //this.textInput = inputEl.clone().removeAttr("id").removeAttr("name").appendTo(span);
            //inputEl.hide();
            this.textInput = $('<input type="text"/>').appendTo(span);
            this.valueEl=inputEl.hide();
            this.expandTrigger = $('<span class="om-combo-trigger"></span>').appendTo(span);
            this.dropList = $($('<div class="om-widget"><div class="om-widget-content om-droplist"></div></div>').css({position:'absolute', zIndex:2000}).appendTo(span).children()[0]).hide();
            this.dropListTree=$('<ul class="om-droplist-tree"></ul>').appendTo(this.dropList);
        },
        _toggleLoading:function(type){
            if(!this.options.disabled){
                if (type == 'add') {
                    this.expandTrigger.removeClass('om-icon-carat-1-s').addClass('om-loading');
                } else if (type == 'remove') {
                    this.expandTrigger.removeClass('om-loading').addClass('om-icon-carat-1-s');
                }
            }
        },
        _loadData:function(records){
           var options = this.options,
                self=this,
                dropList=this.dropList,
                dropListTree=this.dropListTree,
                inputEl = this.element;
            options.dataSource = records;
            this.dataHasLoaded = true,
            treeOptions={
            	dataSource:options.dataSource,
                simpleDataModel:options.simpleDataModel,
                showCheckbox:options.multi,
                onExpand:function(){
		        	dropList.parent().width("auto");
            	},
				onBeforeSelect: function(nodedata){
	        	    if(options.onlyChild &&nodedata.children){
	    		    	return false;
	        	    }
                },
                onCheck:function(nodeData){
                	var data=dropListTree.omTree('getChecked',true);
                    self._setValue(data);
                    //dropList.hide();
                },
                onSelect:function(nodeData){
                    self._setValue(nodeData);
                    dropList.hide();
                }
            };
            if(options.multi){
            	$.extend(treeOptions,{
                    onCheck: function(nodeData){
                        if($(this).omTree('isCheck',nodeData)){
                            self._setValue(nodeData);
                        }else{
                            self._setValue(nodeData,true);
                        }
                    }
            	});
            }
            dropListTree.omTree(treeOptions);
            if(options.expandAll){
                dropListTree.omTree('expandAll');
            }
            if(options.collapseAll){
                dropListTree.omTree('collapseAll');
            }
            if (options.value) {
                  var valueNode=dropListTree.omTree('findNode','id',options.value);
                  if(valueNode){
                      dropListTree.omTree('expand',valueNode);
                      dropListTree.omTree('select',valueNode);
                      this._setValue(valueNode);
                  }
            }

            this._showDropList();
           // }
            dropList.hide();
        },
        _setValue:function(data){
        	var options = this.options,
        		//valueField=options.valueField,
        		//optionField=options.optionField,
        		valueChange = true,
        		input = this.textInput, valueEl = this.valueEl,
        		value=[],
        		text=[],
        		oldValue = valueEl.val();
        		if($.isArray(data)){
        			for(var i=0;i<data.length;i++){
        				value.push(data[i]['id']);
                		text.push(data[i]['text']);
        			}
        		}else{
	                value.push(data['id']);
	                text.push(data['text']);
        		}
                value=value.join(options.multiSeparator?options.multiSeparator:'');
                text=text.join(options.multiSeparator?options.multiSeparator:'');
	            if(value == oldValue){
	                valueChange = false ;
	            }
	            valueEl.val(value);
	            input.val(text);
            if (options.onValueChange && valueChange) {
            	this._trigger("onValueChange",null,input,value,oldValue);
            }
            //refresh the emptyText
            this._refeshEmptyText(options.emptyText);
        },
        _ajaxLoad:function(url){
            var self=this;
            var options = this.options;
            $.ajax({
                url: url,
                method: 'POST',
                dataType: 'json',
                success: function(data, textStatus){
                    self.dataHasLoaded = true;
                    var onSuccess = options.onSuccess;
                    if (onSuccess && self._trigger("onSuccess", null, data, textStatus) === false) {
                        options.dataSource = data;
                        return;
                    }
                    self._loadData(data);
                    self._toggleLoading('remove');
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    self.dataHasLoaded = true; // 必须设置为true，否则在lazyLoad为true的时候会陷入死循环
                    if (options.onError) {
                        self._toggleLoading('remove');
                        self._trigger("onError", null, XMLHttpRequest, textStatus, errorThrown);
                    } else {
                        self._toggleLoading('remove');
                        throw new Error('An error occurred while load records from URL "' + url + '",the error message is:' + errorThrown.message);
                    }
                }
            });
        },
        //绑定事件
        _bindEvent:function(){
            var self = this;
            var options = this.options;
            var input=this.textInput;
            var valueEl = this.valueEl;
            var span = input.parent('span');
            var dropList = this.dropList;
            var expandTrigger = this.expandTrigger;
            var emptyText = options.emptyText;
            var isFocus = false;
            span.mouseenter(function(){   
               if(!options.disabled){
                   span.addClass("om-state-hover");
               }
            }).mouseleave(function(){      
                span.removeClass("om-state-hover");
            });
            input.focus(function(){
                if(isFocus) 
                    return;
                isFocus = true;
                $('.om-droplist').not(dropList).hide(); //hide all other dropLists
                span.addClass('om-state-focus');
                self._refeshEmptyText(emptyText);
                if (!self.dataHasLoaded) {
                    if(!expandTrigger.hasClass('om-loading')){
                        self._toggleLoading('add');
                        if (typeof(options.dataSource) == 'object') {
                            self._loadData(options.dataSource);
                            self._toggleLoading('remove');
                        } else if (typeof(options.dataSource) == 'string') {
                            self._ajaxLoad(options.dataSource);
                        } else {
                            //neither records nor remote url was found
                            self.dataHasLoaded = true;
                            self._toggleLoading('remove');
                        }
                    }
                }
                if (!options.disabled && !options.readOnly) {
                    dropList.toggle();
                }
            }).blur(function(e){
                isFocus = false;
                span.removeClass('om-state-focus');
                input.removeClass('om-combo-focus');
                //expandTrigger.removeClass('om-trigger-hover');
                if (!options.disabled && !options.readOnly && !options.multi) {
                    self._refeshEmptyText(emptyText);
                }
            }).keyup(function(e){
                var key = e.keyCode,
                    value = $.om.keyCode;
                switch (key) {
                    case value.DOWN:
                       // self._selectNext();
                        break;
                    case value.UP: 
                       // self._selectPrev();
                        break;
                    case value.ENTER: 
                     //   self._backfill(self.dropList.find('.om-state-hover'));
                        break;
                    case value.ESCAPE: 
                        dropList.hide();
                        break;
                    case value.TAB:
                        //only trigger the blur event
                        break;
                    default:
                        //fiter功能
                        //self.hasManualInput = true;
                }
            });
            span.mousedown(function(e){
                e.stopPropagation(); //document的mousedown会隐藏下拉框，这里要阻止冒泡
            });
            dropList.mousedown(function(e){
                e.stopPropagation(); //document的mousedown会隐藏下拉框，这里要阻止冒泡
            });
            expandTrigger.click(function(){
                !expandTrigger.hasClass('om-loading') && input.focus();
            }).mousedown(function(){
                !expandTrigger.hasClass('om-loading') && span.addClass('om-state-active');
            }).mouseup(function(){
                !expandTrigger.hasClass('om-loading') && span.removeClass('om-state-active');
            });
            $(document).bind('mousedown.omCombo',this.globalEvent=function(){
                dropList.hide();
            });
        },
        _showDropList:function(){
            var inputEl = this.element;
            
            var options = this.options,
             	dropList = this.dropList.scrollTop(0).css({'height':'auto'});

            var dropListContainer = dropList.parent(), span = inputEl.parent(),inputWidth=span.outerWidth();
            var dropListWidth=dropList.outerWidth();
    		if($.browser.msie&&($.browser.version == "7.0")&&!$.support.style){
    			dropListWidth=dropList.show().outerWidth();
    		}
    		if(options.listAutoWidth || dropListWidth < inputWidth){
    			dropListContainer.width(inputWidth);
    		}
    		dropList.css('height','auto');
            if (options.listMaxHeight != 'auto' /*&& dropList.height() > options.listMaxHeight*/) {
                dropList.height(options.listMaxHeight).css('overflow-y','auto');
            }
            var inputPos = span.offset();
            dropListContainer.css({
                'left': '-1px',//补齐边框
                'top': span.outerHeight()
            });
            if(dropList.is(':hidden')){
                 dropList.show();
            }else{
                dropList.hide();
            }
        },
        _refeshEmptyText: function(emptyText){
            var inputEl = this.textInput;
            if(!emptyText)
                return;
            if (inputEl.val() === '') {
                inputEl.val(emptyText).addClass('om-empty-text');
            } else {
                if(inputEl.val() === emptyText){
                    inputEl.val('');
                }
                inputEl.removeClass('om-empty-text');
            }
        }
    });
})(jQuery);
/* 
 * $Id:om-comboGrid
 * Depends:
 *  om-core.js
 *	om-mouse.js
 *	om-resizable.js
 *  om-grid.js
 */
define('vendor/omui/om-combogrid',function(require, exports, module) {
    var $ = require('jquery');
(function($){
    $.omWidget('om.omComboGrid', {
        options:{
        	/*
			*	只有所有列的宽度都不是'autoExpand'时该属性才会起作用
        	*/
        	autoFit:false, //grid列自适应
        	/*	
			*	列数据模型。每一个元素都是一个对象字面量，定义该列的各个属性，这些属性包括:
			*	header : 表头文字。
			*	name : 与数据模型对应的字段。
			*	align : 列文字对齐方式，可以为'left'、'center'、'right'之中的一个。
			*	renderer : 列的渲染函数，接受3个参数，v表示当前值，rowData表示当前行数据，rowIndex表示当前行号(从0开始)，
			*	width : 列的宽度，取值为Number或者'autoExpand'。注意只能有一个列被设置为'autoExpand'属性。
			*	wrap : 是否自动换行，取值为true或者false
			*   @default: false
			*   @type: Array[Json]
        	*/
        	colModel:false,
        	//	extraData: ajax取数时附加到请求的额外参数,这里JSON的value值只能使用普通值
        	/*	grid的高度*/
        	gridHeight:'fit',
            gridWidth:'100%',
        	/*	grid的宽度*/
        	//width:'fit',
        	/*	grid每页多少条*/
        	limit:15,
            /*  显示在分页条上“上一页”和“下一页”按钮之间的文字。在显示时其中的{totalPage}会被替换为总页数，{index}会被替换为一个输入框*/
            pageText:'{index}',
        	/*	请求类型*/
        	// preProcess: @type: Function 取数成功后的预处理,此方法一定要返回一个值
        	/*	是否显示行号*/
        	showIndex:true,
        	method:'GET',
        	//	dataSource: 数据源
        	//	value: 初始值
            optionField:'text',
            valueField:'id',
            showCheckbox: false,
            width : 'auto',
            disabled : false,
            readOnly : false,
            editable : false,
            lazyLoad : false,
            listMaxHeight : 300,
            listAutoWidth : false,
            emptyText:'None',
            multi : false, 
            multiSeparator : ','
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
                    this._loadData(source);
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
            var span = $('<span class="om-combo om-combogrid om-widget om-state-default"></span>').css({position:'relative'}).insertAfter(inputEl).wrapInner(inputEl);
            //this.textInput = inputEl.clone().removeAttr("id").removeAttr("name").appendTo(span);
            //inputEl.hide();
            this.textInput = $('<input type="text"/>').appendTo(span);
            this.valueEl=inputEl.hide();
            this.expandTrigger = $('<span class="om-combo-trigger"></span>').appendTo(span);
            this.dropList = $($('<div class="om-widget"><div class="om-widget-content om-droplist"></div></div>').css({position:'absolute', zIndex:2000}).appendTo(document.body).children()[0]).hide();
            this.toolbar=$('<div class="om-droplist-toolbar"></div>').appendTo(this.dropList);
            this.dropListGrid=$('<table class="om-droplist-grid"></table>').appendTo(this.dropList);
           // this.dropList=$($('<div class="om-widget"><table class="om-widget-content om-droplist om-droplist-grid"></table></div>').css({position:'absolute', zIndex:2000}).appendTo(document.body).children()[0]).hide();
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
        _setValue:function(data){
        	var options = this.options,
        		valueField=options.valueField,
        		optionField=options.optionField,
        		valueChange = true,
        		input = this.textInput, valueEl = this.valueEl,
        		value=[],
        		text=[],
        		oldValue = valueEl.val();
                for(var i=0;i<data.length;i++){
                    value.push(data[i][valueField]);
                    text.push(data[i][optionField]);
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
        _droplistToolbar:function() {
            var toolbar =$('<div class="input-append"></div>')
            .append('<input class="span2" id="om-droplist-toolbar-searchText" type="text"><button type="button" id="om-droplist-toolbar-search" class="btn btn-mini">'+$.om.lang.omComboGrid['search']+'</button>')
            .appendTo(this.toolbar),
                 dropListGrid=this.dropListGrid,
                 dataSource=this.options.dataSource,
                searchBtn=toolbar.children('#om-droplist-toolbar-search');
            searchBtn.bind('click',function(e) {
                var searchData=toolbar.children('#om-droplist-toolbar-searchText').val();
                if(searchData){
                    dropListGrid.omGrid('setData',dataSource,{
                        'name':searchData
                    });
                }
            });

        },
        _loadData:function(source){
           var options = this.options,
                self=this,
                dropList=this.dropList,
                dropListGrid=this.dropListGrid,
                inputEl = this.element;
            options.dataSource = source;
            this.dataHasLoaded = true;
           var  gridOptions={
            	autoFit:options.autoFit,
            	dataSource:options.dataSource,
            	method:options.method,
            	extraData:options.extraData,
                colModel:options.colModel,
            	limit:options.limit,
                pageText:options.pageText,
				singleSelect:options.multi?false:true,
                height: 'auto',
                width:options.gridWidth,
				showIndex:options.showIndex,
				preProcess:options.preProcess,
				onRowSelect:function(index,data,e){
					var records=dropListGrid.omGrid('getSelections',true);
					self._setValue(records);
                    dropList.hide();
				},
                onSuccess:function(data,status,xhr,e){
                    if (options.value) {
                        self._fillValue(data)
                    }
                    self.dataHasLoaded = true;
                    var onSuccess = options.onSuccess;
                    if (onSuccess && self._trigger("onSuccess", null, data, textStatus) === false) {
                        options.dataSource = data;
                        return;
                    }
                    self._toggleLoading('remove');
                },
                onError:function(XMLHttpRequest, textStatus, errorThrown){
                    self.dataHasLoaded = true; // 必须设置为true，否则在lazyLoad为true的时候会陷入死循环
                    if (options.onError) {
                        self._toggleLoading('remove');
                        self._trigger("onError", null, XMLHttpRequest, textStatus, errorThrown);
                    } else {
                        self._toggleLoading('remove');
                        throw new Error('An error occurred while load records from URL "' + source + '",the error message is:' + errorThrown.message);
                    }
                }
            };
            this._droplistToolbar();
            dropListGrid.omGrid(gridOptions);
            if(options.value){
                dropListGrid.omGrid('setSelections',[])
            }
            this._showDropList();
           // }
            dropList.hide();
        },
        _fillValue:function(data){
            var dropListGrid=this.dropListGrid,options=this.options,
                page=data['page'],indexes=data['indexes'];
            if(page && indexes){
                dropListGrid.omGrid('reload',page);
                dropListGrid.omGrid('setSelections',indexes);
            }
            if (options.value) {
                this._setValue(options.value);
            }
            //this.reload(page);
           // this.setSelections(rows);
        },
        //绑定事件
        _bindEvent:function(){
            var self = this;
            var options = this.options;
            var input=this.textInput;
            var valueEl = this.element;
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
                        if (typeof(options.dataSource) == 'string') {
                            self._loadData(options.dataSource);
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
    		if(!options.listAutoWidth /*|| dropListWidth < inputWidth*/){
    			dropListContainer.width(inputWidth);
    		}
    		dropList.css('height','auto').children().css('border',0)
            .find('.hDiv').css('border-top','1px solid #DDD')
            .find('.hDivBox').css('padding-right','5px'); //fix 右边内间距
            if (options.listMaxHeight != 'auto' /*&& dropList.height() > options.listMaxHeight*/) {
                dropList.height(options.listMaxHeight).css('overflow-y','auto');
            }
            var inputPos = span.offset();
            dropListContainer.css({
                'left': inputPos.left-1,//补齐边框
                'top': inputPos.top+span.outerHeight()+2
            });
            if(dropList.is(':hidden')){
                 dropList.show();
            }else{
                dropList.hide();
            }
        },
        _refeshEmptyText: function(emptyText){
            var textInput=this.textInput;
            if(!emptyText)
                return;
            if (textInput.val() === '') {
                textInput.val(emptyText).addClass('om-empty-text');
            } else {
                if(textInput.val() === emptyText){
                    textInput.val('');
                }
                textInput.removeClass('om-empty-text');
            }
        }
    });
    $.om.lang.omComboGrid = {
        search:'搜索',
    };
})(jQuery);
});
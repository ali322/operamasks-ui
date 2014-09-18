#Operamasks-UI

OperaMasks-UI是基于Jquery并提供丰富组件的前端UI库,这是基于官方2.1版本的一个分支,新增了ComboTree,ComboGrid,Window三个组件,并修改了官方的Calendar,Panel,Tabs,Grid,Combo,Menu,Tree,Accordion,Dialog组件以适应项目需要

###如何使用
- 下载到本地
```shell
git clone git@github.com:ali322/operamasks-ui.git
```
- 初始化
```shell
npm install
```
- 配置gulpfile.js文件选择所需要的组件,或者选择build目录下已经构建好的版本
- 开始构建
```shell
gulp
```
- 将theme目录下的css样式文件以及build目录下的omui.js引入项目
```html
<script type="text/javascript" src="js/omui.js"></script>
<link rel="stylesheet" type="text/css" href="css/theme/default/om-default.css">
```

###组件列表及依赖关系

1. om-core
2. om-mouse 依赖组件: om-core.js
3. om-position
4. om-draggable 依赖组件: om-core.js,om-mouse.js
5. om-droppable 依赖组件: om-core.js,om-mouse.js,om-draggable.js
6. om-resizable 依赖组件: om-core.js,om-mouse.js
7. om-sortable 依赖组件: om-core.js,om-mouse.js
8. om-panel 依赖组件: om-core.js
9. om-grid 依赖组件: om-core.js,om-mouse.js,om-resizable.js
10. om-grid-headergroup 依赖组件: om-grid.js
11. om-grid-roweditor 依赖组件: om-grid.js,om-button.js
12. om-grid-rowexpander 依赖组件: om-grid.js
13. om-grid-sort 依赖组件: om-grid.js
14. om-accordion 依赖组件: om-core.js,om-panel.js
15. om-ajaxsubmit
16. om-borderlayout 依赖组件: om-core.js,om-mouse.js,om-resizable.js,om-panel.js
17. om-button 依赖组件: om-core.js
18. om-buttonbar 依赖组件: om-core.js 
19. om-calendar
20. om-combo 依赖组件: om-core.js
21. om-dialog 依赖组件: om-core.js,om-button.js,om-draggable.js,om-mouse.js,om-position.js,om-resizable.js
22. om-fileupload
23. om-itemselector 依赖组件: om-core.js,om-mouse.js,om-sortable.js
24. om-menu 依赖组件: om-core.js
25. om-messagebox 依赖组件: om-core.js,om-mouse.js,om-draggable.js,om-position.js
26. om-messagetip 依赖组件: om-core.js
27. om-numberfield 依赖组件: om-core.js
28. om-progressbar 依赖组件: om-core.js
29. om-scrollbar 依赖组件: om-core.js 
30. om-slider.js 依赖组件: om-core.js 
31. om-suggestion 依赖组件: om-core.js
32. om-tabs 依赖组件: om-panel.js
33. om-tooltip 依赖组件: om-core.js
34. om-tree 依赖组件: om-core.js
35. om-validate

###开源许可
基于 [MIT License](http://zh.wikipedia.org/wiki/MIT_License) 开源
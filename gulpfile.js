var gulp = require("gulp"),
    plugins = require("gulp-load-plugins")();

var fileList=[
	"src/om-core.js",
	"src/om-position.js",
	"src/om-mouse.js",
	"src/om-draggable.js",
	"src/om-droppable.js",
	"src/om-resizable.js",
	"src/om-sortable.js",
	"src/om-panel.js",
	"src/om-button.js",
	"src/om-grid.js",
	"src/om-grid-headergroup.js",
	"src/om-grid-roweditor.js",
	"src/om-grid-rowexpander.js",
	"src/om-grid-sort.js",
	"src/om-accordion.js",
	"src/om-borderlayout.js",
	"src/om-calendar.js",
	"src/om-combo.js",
	"src/om-dialog.js",
	"src/om-fileupload.js",
	"src/om-itemselector.js",
	"src/om-menu.js",
	"src/om-messagebox.js",
	"src/om-messagetip.js",
	"src/om-numberfield.js",
	"src/om-progressbar.js",
	"src/om-suggestion.js",
	"src/om-tabs.js",
	"src/om-tooltip.js",
	"src/om-tree.js",
	"src/om-validate.js",
	"src/om-combotree.js",
	"src/om-window.js",
	"src/om-combogrid.js"
];

gulp.task('default', function() {
    return gulp.src(fileList)
    .pipe(plugins.jshint())
    .pipe(plugins.concat('omui.js'))
    .pipe(gulp.dest("build"))
    .pipe(plugins.uglify())
    .pipe(plugins.rename("omui.min.js"))
    .pipe(gulp.dest('build'));
});
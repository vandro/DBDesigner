
DBDesigner = function(data){
	
	this.setGlobalUIBehavior();
	this.setTableCollection();
	this.setToolBar();
	this.setCanvas();
	this.setObjectDetail();
	this.setTableDialog();
	this.setColumnDialog();
	
	//this.toolBar.setAction(globals.Action.ADD_TABLE);
	
};

DBDesigner.init = function(){
	DBDesigner.app = new DBDesigner();
};


DBDesigner.prototype.doAction = function(action) {
	if(DBDesigner.app.canvas) DBDesigner.app.canvas.setCapturingPlacement(false);
		
	switch(action){	
		case DBDesigner.Action.ADD_TABLE:
			DBDesigner.app.canvas.setCapturingPlacement(true);
			break;
		case DBDesigner.Action.ADD_COLUMN:
			DBDesigner.app.columnDialog.createColumn();
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
	}
};

/**
 * Initialize the toolbar
 */
DBDesigner.prototype.setToolBar = function(){
	this.toolBar = new ToolBar();
	this.toolBar.bind(ToolBar.Event.ACTION_CHANGED, this.toolBarActionChanged, this);
};

DBDesigner.prototype.toolBarActionChanged = function(event){
	this.doAction(event.action);
};

/**
 * Initialize the canvas
 */
DBDesigner.prototype.setCanvas = function(){
	this.canvas = new Canvas();
	this.canvas.bind(Canvas.Event.PLACEMENT_CAPTURED, this.canvasPlacementCaptured, this);
};

DBDesigner.prototype.canvasPlacementCaptured = function(event){
	//this.tableDialog.getUI().getDom().dialog('open');
	if(DBDesigner.Action.ADD_TABLE){
		this.toolBar.setAction(DBDesigner.Action.SELECT);
		this.tableDialog.createTable(event.position);
	}
};


/**
 * Initialize the objectdetail
 */
DBDesigner.prototype.setObjectDetail = function(){
	this.objectDetail = new ObjectDetail();
	this.objectDetail.bind(ObjectDetail.Event.STATE_CHANGED, this.objectDetailStateChanged, this);
	this.objectDetail.setCollapsed(true);
};

DBDesigner.prototype.objectDetailStateChanged = function(event){
	this.canvas.setCollapsed(!event.isCollapsed);
};


DBDesigner.prototype.setTableDialog = function() {
	this.tableDialog = new TableDialog();
};

DBDesigner.prototype.setColumnDialog = function() {
	this.columnDialog = new ColumnDialog();
};

DBDesigner.prototype.setTableCollection = function() {
	this.tableCollection = new TableCollection();
	this.tableCollection.bind(Table.Event.SELECTION_CHANGED, this.tableSelectionChanged, this);
	this.tableCollection.bind(Table.Event.ALTER_TABLE, this.alterTable, this);
};

DBDesigner.prototype.tableSelectionChanged = function(event){
	var actionState = {};
	switch(this.tableCollection.count()){
		case 0:
			actionState[DBDesigner.Action.ADD_COLUMN] = false;
			actionState[DBDesigner.Action.ADD_FOREIGNKEY] = false;
			actionState[DBDesigner.Action.DROP_TABLE] = false;
			break;
		case 1:
			actionState[DBDesigner.Action.ADD_COLUMN] = true;
			actionState[DBDesigner.Action.ADD_FOREIGNKEY] = true;
			actionState[DBDesigner.Action.DROP_TABLE] = true;
			break;
		default:
			actionState[DBDesigner.Action.ADD_COLUMN] = false;
			actionState[DBDesigner.Action.ADD_FOREIGNKEY] = false;
			actionState[DBDesigner.Action.DROP_TABLE] = true;
			break;
	}
	DBDesigner.app.toolBar.setActionState(actionState);
};

DBDesigner.prototype.alterTable = function(event){
	this.tableDialog.editTable(event.table);
};


DBDesigner.prototype.setGlobalUIBehavior = function(){
	$('a.button').live('hover', function(event){ 
		var $this = $(this);
		if(!$this.hasClass('ui-state-disabled')) $this.toggleClass('ui-state-hover'); 
	});
};

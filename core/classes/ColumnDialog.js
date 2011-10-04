
ColumnDialog = function() {	
	this.setModel(new ColumnDialogModel());
	this.setUI(new ColumnDialogUI(this));
};

$.extend(ColumnDialog.prototype, DBObjectDialog);

ColumnDialog.prototype.createColumn = function(){
	var model = this.getModel();
	model.setAction(DBDesigner.Action.ADD_COLUMN);
	model.setDBObjectModel(new ColumnModel());
	this.getUI().open(DBDesigner.lang.straddcolumn);
};

ColumnDialog.prototype.editColumn = function(){

};

ColumnDialog.prototype.saveColumn = function(form){
	var model = this.getModel();
	var columnModel = model.getDBObjectModel();
	var action = model.getAction();
	
	if(this.validateForm(form)){

		
		if(action == DBDesigner.Action.ADD_TABLE){
			DBDesigner.app.tableCollection.add(new Table(tableModel));
		}
		
		this.getUI().close();
	}
};

ColumnDialog.prototype.validateForm = function(form){
	var isValid = true;
	var ui = this.getUI();
	var lowType = form.type.toLowerCase();

	if(form.name == ''){
		ui.showError(DBDesigner.lang.strcolneedsname, DBDesigner.lang.strname);
		isValid = false;
	}
	if((lowType == 'numeric' && !/^(\d+(,\d+)?)?$/.test(form.length)) || (lowType != 'numeric' && !/^\d*$/.test(form.length))){
		ui.showError(DBDesigner.lang.strbadinteger, DBDesigner.lang.strlength);
		isValid = false;
	}
	else if(/^d+$/.test(form.length)) {
		//Remove left side 0's
		form.length = parseInt(form.length) + '';
		//add scale of 0
		if(lowType == 'numeric') form.length += ',0';
	}
	else if(lowType == 'numeric' && /^\d+,\d+$/.test(form.length)){
		var splitted = form.length.split(',');
		var precision = parseInt(splitted[0]);
		var scale = parseInt(splitted[1]);
		if(scale > precision){
			ui.showError(DBDesigner.lang.strbadnumericlength.replace('%d', scale).replace('%d', precision), DBDesigner.lang.strlength);
			isValid = false;
		}
		form.length = precision + ',' + scale;
	}
	return isValid;
}


// *****************************************************************************

ColumnDialogModel = function() {
	
};

$.extend(ColumnDialogModel.prototype, DBObjectDialogModel);



// *****************************************************************************

ColumnDialogUI = function(controller) {
	this.setTemplateID('ColumnDialog');
	this.setController(controller);
	this.init();
	this.getDom().appendTo('body').dialog({modal: true, autoOpen: false, width: 'auto'});
};

$.extend(ColumnDialogUI.prototype, DBObjectDialogUI);

ColumnDialogUI.prototype.bindEvents = function(){
	var dom = this.getDom();
	dom.find('#column-dialog_cancel').click($.proxy(this.close, this));
	dom.find('#column-dialog_save').click($.proxy(this.save, this));
	dom.find('#column-dialog_column-type').change($.proxy(this.dataTypeChanged, this));
};


ColumnDialogUI.prototype.open = function(title){
	
	var columnModel = this.getController().getDBObjectModel();
	var dom = this.getDom();
	
	this.cleanErrors();
	
	if(columnModel != null){
		$('#column-dialog_column-type').prop('selectedIndex', 0).trigger('change');
		$('#column-dialog_column-name').val(columnModel.getName());
		$('#column-dialog_column-comment').val(columnModel.getComment());
		dom.dialog('open').dialog('option', 'title', title);
		this.focus();
	}
	
};

ColumnDialogUI.prototype.save = function(){
	this.cleanErrors();
	
	var form = {
		name: $.trim($('#column-dialog_column-name').val()),
		type: $('#column-dialog_column-type').val(),
		isArray: $('#column-dialog_column-array').prop('checked'),
		isPrimaryKey: $('#column-dialog_column-primarykey').prop('checked'),
		isForeignKey: $('#column-dialog_column-foreignkey').prop('checked'),
		isUniqueKey: $('#column-dialog_column-foreignkey').prop('checked'),
		isNotNull: $('#column-dialog_column-foreignkey').prop('checked'),
		def: $.trim($('#column-dialog_column-default').val()),
		comment: $.trim($('#column-dialog_column-comment').val())
	};
	form.length = (this.typeHasPredefinedSize(form.type))? '': $.trim($('#column-dialog_column-length').val()).replace(/\s+/g, '');
	this.getController().saveColumn(form);
};

ColumnDialogUI.prototype.dataTypeChanged = function(event){
	var sizePredefined = this.typeHasPredefinedSize($(event.currentTarget).val());
	var $input = $('#column-dialog_column-length').prop('disabled', sizePredefined);
	if(sizePredefined) $input.val('');
};

ColumnDialogUI.prototype.typeHasPredefinedSize = function(type){
	for(var i = 0, n = DBDesigner.dataTypes.length; i < n; i++){
		if(DBDesigner.dataTypes[i].typedef == type){
			return DBDesigner.dataTypes[i].size_predefined;
		}
	}
	return false;
};
function alertMsg(message, callback, title)
{
	if (!title)
		title = "系统提示";
	Vue.prototype.$alert(message, title, { type: 'info',callback: callback})
}

function confirmMsg(message, confirmCallback, cancelCallback, title)
{
	if (!title)
		title = "系统提示";
	Vue.prototype.$confirm(message, title,
		{
			type: 'info',
			callback: function (action)
			{
				if (action == "confirm")
				{
					if (confirmCallback)
						confirmCallback();
					return;
				}
				if (cancelCallback)
					cancelCallback();
			}
		})
}

var fullScreenLoading;
function showLoading()
{
	fullScreenLoading = Vue.prototype.$loading({
		lock: true,
		//text: 'Loading',
		//spinner: 'el-icon-loading',
		background: 'rgba(255, 255, 255, 0.7)'
	});
}

function closeLoading()
{
	fullScreenLoading.close();
}

_newControlId = 1;
function getNewControlId()
{
	return _newControlId++;
}

function getTreeNodeFullName(node)
{
	var name = "";
	for (var n = node; n; n = n.parent)
	{
		if (name)
			name = " " + name;
		//可能会存在一个最顶层的虚拟树节点
		if (n.label)
			name = n.label + name;
	}
	return name;
}

Vue.component('tl-radio-tree', {
	props:
	{
		value: [Number, String],
		data: Array,
		textProperty: String,
		valueProperty: String,
		childrenProperty: String,
		dataSourceUrl: String,
		canCheckParent: { type: Boolean, default: true }
	},
	//props: ['value',"data","textProperty","valueProperty","canSelectParent"],
	data: function ()
	{
		return {
			searchKey: null
		}
	},
	watch:
	{
		searchKey: function (val)
		{
			this.$refs.tree.filter(val);
		},
		dataSourceUrl: function (url)
		{
			this.getDataFromUrl();
		},
		value: function (v)
		{
			this.$refs.tree.setCheckedKeys([v]);
		}
	},
	template: '<div>\
	<el-input suffix-icon="el-icon-search" v-model="searchKey" />\
	<el-tree class="tl-radio-tree" :props="{label:textProperty,children:childrenProperty}" :node-key="valueProperty" :default-checked-keys="[value]" :data="data" ref="tree" :render-content="renderContent" @current-change="currentChange" show-checkbox check-strictly :expand-on-click-node="false" :filter-node-method="filterNode" />\
</div>',
	created: function ()
	{
		this.getDataFromUrl();
	},
	methods:
	{
		renderContent: function (h, e)
		{
			var radio = {
				data: function ()
				{
					return {
						node: e.node,
						text: e.node.label
					}
				},
				template: this.canCheckNode(e.node) ? '<el-radio v-model="node.checked" :label="true">{{text}}</el-radio>' : '<span>{{text}}</span>',
			};
			return h(Vue.extend(radio));
		},
		currentChange: function (data, node)
		{
			if (!this.canCheckNode(node))
				return;
			this.value = node.key;
			this.$refs.tree.setCheckedKeys([node.key]);
			this.$emit('input', this.value);
		},
		filterNode: function (v, data, node)
		{
			if (!v)
				return true;
			return node.label.indexOf(v) !== -1;
		},
		canCheckNode: function (node)
		{
			if (this.canCheckParent)
				return true;
			return node.isLeaf;
		},
		getDataFromUrl: function ()
		{
			if (!this.dataSourceUrl)
				return;
			var _self = this;
			$.getJSON(this.dataSourceUrl, function (data)
			{
				_self.data = data;
			});
		},
		getCheckedNode: function ()
		{
			if (this.value)
				return this.$refs.tree.getNode(this.value);
			return this.value;
		}
	}
});

Vue.component('tl-check-tree', {
	props: ['value', "data", "textProperty", "valueProperty", "childrenProperty", "checkStrictly", "dataSourceUrl"],
	data: function ()
	{
		return {
			searchKey: null
		}
	},
	watch:
	{
		searchKey: function (val)
		{
			this.$refs.tree.filter(val);
		},
		dataSourceUrl: function (url)
		{
			this.getDataFromUrl();
		},
		value: function (v)
		{
			//if (v.toString() == this.$refs.tree.getCheckedKeys())
			//	return;
			if (this.changedByUser)
				this.changedByUser = false;
			else this.$refs.tree.setCheckedKeys(v);
		}
	},
	template: '<div>\
	<el-input suffix-icon="el-icon-search" v-model="searchKey" />\
	<el-tree ref="tree" :props="{label:textProperty,children:childrenProperty}" :node-key="valueProperty" :default-checked-keys="value" :data="data" @check-change="checkChange" show-checkbox :check-strictly="checkStrictly" :expand-on-click-node="false" :filter-node-method="filterNode" />\
</div>',
	created: function ()
	{
		this.getDataFromUrl();
	},
	mounted: function ()
	{
		if (this.value)
			this.$refs.tree.setCheckedKeys(this.value, true);
	},
	methods:
	{
		checkChange: function ()
		{
			this.changedByUser = true;
			this.value = this.$refs.tree.getCheckedKeys();
			this.$emit('input', this.value);
		},
		filterNode: function (v, data)
		{
			if (!v)
				return true;
			return node.label.indexOf(v) !== -1;
		},
		getDataFromUrl: function ()
		{
			if (!this.dataSourceUrl)
				return;
			var _self = this;
			$.getJSON(this.dataSourceUrl, function (data)
			{
				_self.data = data;
			});
		},
		getCheckedNodes: function ()
		{
			var nodes = this.$refs.tree.getCheckedKeys().map((function (key) { return this.$refs.tree.getNode(key) }).bind(this));
			if (this.checkStrictly)
				return nodes;
			return nodes.filter(function (n) { return n.isLeaf });
		},
		setChecked: function (key,checked)
		{
			return this.$refs.tree.setChecked(key, checked);
		}
	}
});

Vue.component('tl-radio-tree-dropdown', {
	props:
	{
		value: [Number, String],
		data: Array,
		textProperty: String,
		valueProperty: String,
		childrenProperty: String,
		dataSourceUrl: String,
		canCheckParent: { type: Boolean, default: true }
	},
	data: function ()
	{
		return {
			popoverVisible: null,
			displayName: null
		}
	},
	watch:
	{
		value: function (v)
		{
			this.displayName = getTreeNodeFullName(this.$refs.tree.getCheckedNode());
			this.popoverVisible = false;
			this.$emit('input', this.value);
		}
	},
	mounted: function ()
	{
		var node = this.$refs.tree.getCheckedNode();
		if (node)
			this.displayName = getTreeNodeFullName(node);
	},
	template: '<div class="tl-radio-tree-dropdown">\
	<el-popover ref="popover" placement="bottom-start" width="100%" trigger="click" v-model="popoverVisible" @show="popover_show">\
		<tl-radio-tree ref="tree" v-model="value" :data="data" :text-property="textProperty" :value-property="valueProperty" :children-property="childrenProperty" :data-source-url="dataSourceUrl" :can-check-parent="canCheckParent" />\
	</el-popover>\
	<div class="el-select" @click="popoverVisible=true">\
		<div class="el-input el-input--suffix" :class="{\'is-focus\':popoverVisible}">\
			<div class="el-input__inner">{{displayName}}</div>\
			<span class="el-input__suffix">\
				<i class="el-select__caret el-input__icon el-icon-arrow-up" :class="{\'is-reverse\':popoverVisible}"></i>\
			</span>\
		</div>\
	</div>\
	<div style="position:absolute;visibility:hidden"><div style="position:relative"><div style="position:absolute;left:24px;top:-10px" v-popover:popover></div></div></div>\
</div>',
	methods:
	{
		popover_show: function ()
		{
			$("#" + $(this.$el).find("[aria-describedby]:first").attr("aria-describedby")).width(this.$el.offsetWidth-24);
		}
	}
});

Vue.component('tl-check-tree-dropdown', {
	props: ['value', "data", "textProperty", "valueProperty", "childrenProperty", "checkStrictly", "dataSourceUrl"],
	data: function ()
	{
		return {
			popoverVisible: null,
			nodes: null
		}
	},
	watch:
	{
		value: function (v)
		{
			this.nodes = this.$refs.tree.getCheckedNodes();
			this.$emit('input', this.value);
		}
	},
	mounted: function ()
	{
		this.nodes = this.$refs.tree.getCheckedNodes();
	},
	template: '<div class="tl-check-tree-dropdown">\
	<el-popover ref="popover" placement="bottom-start" width="100%" trigger="click" v-model="popoverVisible" @show="popover_show">\
		<tl-check-tree ref="tree" v-model="value" :data="data" :text-property="textProperty" :value-property="valueProperty" :children-property="childrenProperty" :data-source-url="dataSourceUrl" :check-strictly="checkStrictly" />\
	</el-popover>\
	<div class="el-select" @click="popoverVisible=true">\
		<div class="el-input el-input--suffix" :class="{\'is-focus\':popoverVisible}">\
			<div class="el-input__inner">\
				<el-tag v-for="node in nodes" closable @close="removeTag(node.key)">{{getTreeNodeFullName(node)}}</el-tag>\
			</div>\
			<span class="el-input__suffix">\
				<i class="el-select__caret el-input__icon el-icon-arrow-up" :class="{\'is-reverse\':popoverVisible}"></i>\
			</span>\
		</div>\
	</div>\
	<div style="position:absolute;visibility:hidden"><div style="position:relative"><div style="position:absolute;left:24px;top:-10px" v-popover:popover></div></div></div>\
</div>',
	methods:
	{
		popover_show: function ()
		{
			$("#" + $(this.$el).find("[aria-describedby]:first").attr("aria-describedby")).width(this.$el.offsetWidth-24 );
		},
		removeTag: function (key)
		{
			this.$refs.tree.setChecked(key, false);
			//this.value.splice(this.value.indexOf(key), 1);
		}
	}
});

Vue.component('tl-date-picker', {
	props: ['value',"disabledDate"],
	data: function ()
	{
		return {
			pickerOptions: {
				disabledDate(time)
				{
					if (this.disabledDate)
						return this.disabledDate(time);
					return false;
				},
				shortcuts: [{
					text: '今天',
					onClick(picker)
					{
						picker.$emit('pick', new Date());
					}
				}, {
					text: '昨天',
					onClick(picker)
					{
						const date = new Date();
						date.setTime(date.getTime() - 3600 * 1000 * 24);
						picker.$emit('pick', date);
					}
				}, {
					text: '一周前',
					onClick(picker)
					{
						const date = new Date();
						date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
						picker.$emit('pick', date);
					}
				}]
			}
		}
	},
	methods:
	{
		change: function (v)
		{
			this.$emit('input', v);
		}
	},
	template: '<el-date-picker v-model="value" :picker-options="pickerOptions" style="width:135px" @change="change" />'
});

Vue.component('tl-month-picker', {
	props: ['value'],
	template: '<el-date-picker type="month" v-model="value"  style="width:115px" />'
});

Vue.component('tl-date-time-picker', {
	props: ['value'],
	template: '<el-date-picker type="datetime" v-model="value"  style="width:195px" />'
});

Vue.component('tl-year-picker', {
	props: ['value'],
	data: function ()
	{
		return {
			pickerValue: null,
			changedByUser: false
		}
	},
	created: function ()
	{
		if (this.value)
			this.pickerValue = new Date(this.value, null, null);
		else this.value = null;
	},
	watch:
	{
		value: function (v)
		{
			if (this.changedByUser)
			{
				this.changedByUser = false;
				return;
			}
			if (this.value)
				this.pickerValue = new Date(this.value, null, null);
			else this.value = null;
		}
	},
	template: '<el-date-picker type="year" v-model="pickerValue" style="width:95px" @change="value_changed" />',
	methods:
	{
		value_changed: function (v)
		{
			this.changedByUser = true;
			if (v)
				this.value = v.getFullYear();
			else this.value = null;
			this.$emit('input', this.value);
		}
	}
});

Vue.component('tl-select', {
	props: ['value', "data", "textProperty", "valueProperty"],
	template: '<el-select v-model="value">\
	<el-option v-for="item in data" :key="item[valueProperty]" :label="item[textProperty]" :value="item[valueProperty]" />\
  </el-select>'
});

Vue.component('tl-pagination', {
	props: ['total', "currentPage"],
	template: '<el-pagination :current-page="currentPage" :page-sizes="[100, 200, 300, 400]" :page-size="20" layout="total, sizes, prev, pager, next, jumper" :total="total" style="text-align:right;margin-top:10px" />'
});

Vue.component('tl-input-number', {
	props: ['value'],
	template: '<el-input-number v-model="value" controls-position="right" @change="change" />',
	methods:
	{
		change: function (v)
		{
			this.$emit('input', v);
		}
	}
});

Vue.component('tl-list-table', {
	mounted: function ()
	{
		var container = $(this.$el);
		container.find(">table>thead").addClass(["is-group", "has-gutter"]);
		container.find(">table>thead>tr>th,table>tbody>tr>td,table>tr>td").addClass("cell");
	},
	template: '<div class="el-table el-table--border el-table--enable-row-hover">\
	<table cellpadding="0" cellspacing="0" class="el-table__body" style="width: 100%;"><slot /></table>\
</div>'
});

Vue.component('tl-edit-table', {
	//props:
	//{
	//	equalWidth: Boolean
	//},
	mounted: function ()
	{
		var container = $(this.$el);
		container.find(">table>tbody>tr:nth-child(odd),>table>tr:nth-child(odd)").addClass("el-table__row--striped");
		container.find(">table>tbody>tr>td,table>tr>td").addClass("cell");
		//if (!this.equalWidth)
		//	return;

		//var table = this.$el.children[0];
		//var group = $("<colgroup />").insertBefore(table.children[0]);
		//var columnCount = 0;
		//var cells = table.rows[0].cells;
		//for (var i = 0; i < cells.length; i++)
		//	columnCount += cells[i].colSpan;
		//var width = 100 / columnCount + "%";
		//for (var i = 0; i < columnCount; i++)
		//	group.append($("<col />").css("width", width));
	},
	template: '<div class="el-table el-table--border el-table--striped el-table--enable-row-hover tl-edit-table">\
	<table cellpadding="0" cellspacing="0" class="el-table__body" style="width: 100%;"><slot /></table>\
</div>'
});

Vue.component('tl-link-menu-item', {
	props: ["url"],
	template: '<el-menu-item :index="url"><slot /></el-menu-item>'
});

Vue.component('tl-menu-frame', {
	props:
	{
		asideWidth:{type:[Number,String],default:"200px"}
	},
	data: function ()
	{
		return {
			url: null
		}
	},
	mounted: function ()
	{
		var menu = $(this.$el).find(".el-menu-item:first");
		menu.click();
		for(var subMenu=menu.closest(".el-submenu");subMenu.length;subMenu=subMenu.parent().closest(".el-submenu"))
			subMenu[0].children[0].click();
	},
	template: '<el-container style="height:100%">\
	<el-aside :width="asideWidth"><el-menu ref="popover" style="height:100%" @select="select"><slot /></el-menu></el-aside>\
	<el-main style="padding:0"><iframe style="width:100%;height:100%" frameborder="0" :src="url" /></el-main>\
</el-container>',
	methods:
	{
		select: function (linkUrl)
		{
			this.url=linkUrl;
		}
	}
});

Vue.component('tl-link-tab-pane', {
	props: ["url","label"],
	template: '<el-tab-pane :label="label" :name="url">111</el-tab-pane>',
	methods:
	{
		addPanes: function (pane)
		{
			return this.$parent.$parent.addPanes(pane);
		}
	}
});

Vue.component('tl-tab-frame', {
	data: function ()
	{
		return {
			url: null,
			panes:[]
		}
	},
	mounted: function ()
	{
		if (!this.url || this.url=="0")
			this.url = this.panes[0].name;
	},
	template: '<el-container style="height:100%"><slot />\
	<el-header height="40px" style="padding:0;overflow:hidden"><el-tabs type="border-card" @tab-click="tab_click" v-model="url"><el-tab-pane v-for="pane in panes" :label="pane.label" :name="pane.name" /></el-tabs></el-header>\
	<el-main style="padding:0">\
		<div class="el-tabs el-tabs--top el-tabs--border-card" style="border-top:0;height:100%;box-sizing:border-box">\
			<div class="el-tabs__content" style="padding:0;height:100%"><iframe style="width:100%;height:100%" frameborder="0" :src="url" /></div>\
		</div>\
	</el-main>\
</el-container>',
	methods:
	{
		tab_click: function (tab)
		{
			this.url = tab.name;
		},
		addPanes: function (pane)
		{
			return this.panes.push(pane);
		}
	}
});

Vue.component('tl-tab-pane', {
	props: ["label", "disabled","name"],
	template: '<el-tab-pane :label="label" :name="name" :disabled="disabled"><slot /></el-tab-pane>',
	methods:
	{
		addPanes: function (pane)
		{
			return this.$parent.$parent.addPanes(pane);
		}
	}
});

Vue.component('tl-tabs', {
	props: ["value"],
	data: function ()
	{
		return {
			panes: []
		}
	},
	mounted: function ()
	{
		if (!this.value || this.value == "0")
			this.value = this.panes[0].name;
		this.tab_click();
	},
	template: '<el-tabs class="tl-tabs" v-model="value" type="border-card" @tab-click="tab_click" v-model="value"><slot />\
	<el-tab-pane v-for="pane in panes" :label="pane.label" :name="pane.name"><component :is="pane.$slots.default"></component></el-tab>\
</el-tabs>',
	methods:
	{
		tab_click: function (pane)
		{
			$(this.$el).find(">.el-tabs__content>.el-tab-pane").css("display", "none");
			window.document.getElementById("pane-" + this.value).style.display = "";
			this.$emit('tab-click', this.value);
		},
		addPanes: function (pane)
		{
			return this.panes.push(pane);
		}
	}
});

Vue.component('tl-op-bar', {
	data: function ()
	{
		return {
			popoverVisible: null
		}
	},
	template: '<span><el-popover ref="popover" width="auto" trigger="hover" :visible-arrow="false" popper-class="tl-op-bar-popover"><slot /></el-popover>\
<el-button type="text" icon="el-icon-edit-outline" style="color:black" v-popover:popover>操作</el-button></span>',
	methods:
	{
		addPanes: function (pane)
		{
			return this.$parent.$parent.addPanes(pane);
		}
	}
});

Vue.component('tl-search-bar', {
	template: '<div><slot /></div>'
});

Vue.component('tl-search-item', {
	template: '<span style="margin-right:15px"><slot /></span>'
});

Vue.component('tl-tool-bar', {
	template: '<div style="margin-top:10px;margin-bottom:10px"><slot /></div>'
});

Vue.component('tl-tool-button', {
	template: '<el-button size="small" type="success" @click="click"><slot /></el-button>',
	methods:
	{
		click: function (e)
		{
			return this.$emit('click', e);;
		}
	}
});
Vue.component('runoob', {
	template: '<h1 v-bind:style={color:this.color}>自定{{ color }}义组件!<slot /></h1>',
	data: function ()
	{
		return {
			color: "red"
		}
	}
});

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
	props:
	{
		equalWidth: Boolean
	},
	mounted: function ()
	{
		var container = $(this.$el);
		container.find("table>tbody>tr:nth-child(odd),table>tr:nth-child(odd)").addClass("el-table__row--striped");
		container.find(">table>tbody>tr>td,table>tr>td").addClass("cell");
		if (!this.equalWidth)
			return;

		var table = this.$el.children[0];
		var group = $("<colgroup />").insertBefore(table.children[0]);
		var columnCount = 0;
		var cells = table.rows[0].cells;
		for (var i = 0; i < cells.length; i++)
			columnCount += cells[i].colSpan;
		var width = 100 / columnCount + "%";
		for (var i = 0; i < columnCount; i++)
			group.append($("<col />").css("width", width));
	},
	template: '<div class="el-table el-table--border el-table--striped el-table--enable-row-hover tl-edit-table">\
	<table cellpadding="0" cellspacing="0" class="el-table__body" style="width: 100%;"><slot /></table>\
</div>'
});
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
			this.$emit('change', this.value);
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
			this.$refs.tree.setCheckedKeys(v);
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
			this.$refs.tree.setCheckedKeys(v);
	},
	methods:
	{
		checkChange: function ()
		{
			this.value = this.$refs.tree.getCheckedKeys();
			this.$emit('input', this.value);
			this.$emit('change', this.value);
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
			var nodes = this.$refs.tree.setCheckedKeys().map(function (key) { return this.$refs.tree.getNode(key) });
			if (this.checkStrictly)
				return nodes.map(function (n) { return n.isLeaf });
			return nodes;
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
	mounted: function ()
	{
		var node = this.$refs.tree.getCheckedNode();
		if (node)
			this.displayName = getTreeNodeFullName(node);
	},
	template: '<div class="tl-tree-dropdown">\
	<el-popover ref="popover" placement="bottom-start" width="100%" trigger="click" v-model="popoverVisible" @show="popover_show">\
		<tl-radio-tree ref="tree" v-model="value" :data="data" :text-property="textProperty" :value-property="valueProperty" :children-property="childrenProperty" :data-source-url="dataSourceUrl" :can-check-parent="canCheckParent" @change="valueChanged" />\
	</el-popover>\
	<div class="el-select" @click="popoverVisible=true">\
		<div class="el-input el-input--suffix" :class="{\'is-focus\':popoverVisible}">\
			<div class="el-input__inner">{{displayName}}</div>\
			<span class="el-input__suffix">\
				<i class="el-select__caret el-input__icon el-icon-arrow-up" :class="{\'is-reverse\':popoverVisible}"></i>\
			</span>\
		</div>\
	</div>\
	<div style="position:absolute;visibility:hidden;margin-top:-10px;margin-left:10px" v-popover:popover></div>\
</div>',
	methods:
	{
		valueChanged: function (v)
		{
			this.displayName = getTreeNodeFullName(this.$refs.tree.getCheckedNode());
			this.popoverVisible = false;
			this.$emit('input', this.value);
		},
		popover_show: function ()
		{
			$("#" + $(this.$el).find(">[aria-describedby]").attr("aria-describedby")).width(this.$el.offsetWidth );
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
	mounted: function ()
	{
		this.nodes = this.$refs.tree.getCheckedNodes();
		if (node)
			this.displayName = getTreeNodeFullName(node);
	},
	template: '<div class="tl-tree-dropdown">\
	<el-popover ref="popover" placement="bottom-start" width="100%" trigger="click" v-model="popoverVisible" @show="popover_show">\
		<tl-radio-tree ref="tree" v-model="value" :data="data" :text-property="textProperty" :value-property="valueProperty" :children-property="childrenProperty" :data-source-url="dataSourceUrl" :check-strictly="checkStrictly" @change="valueChanged" />\
	</el-popover>\
	<div class="el-select" @click="popoverVisible=true">\
		<div class="el-input el-input--suffix" :class="{\'is-focus\':popoverVisible}">\
			<div class="el-input__inner">{{displayName}}</div>\
			<span class="el-input__suffix">\
				<i class="el-select__caret el-input__icon el-icon-arrow-up" :class="{\'is-reverse\':popoverVisible}"></i>\
			</span>\
		</div>\
	</div>\
	<div style="position:absolute;visibility:hidden;margin-top:-10px;margin-left:10px" v-popover:popover></div>\
</div>',
	methods:
	{
		valueChanged: function (v)
		{
			this.displayName = getTreeNodeFullName(this.$refs.tree.getCheckedNode());
			this.popoverVisible = false;
			this.$emit('input', this.value);
		},
		popover_show: function ()
		{
			$("#" + $(this.$el).find(">[aria-describedby]").attr("aria-describedby")).width(this.$el.offsetWidth );
		}
	}
});

Vue.component('tl-list-table', {
	props: ['value', "data", "textProperty", "valueProperty", "checkStrictly"],
	data: function ()
	{
		return {
			searchKey: null
		}
	},
	template: '<div class="el-table el-table--fit el-table--border el-table--enable-row-hover el-table--enable-row-transition">\
	<table border="0" cellpadding="0" cellspacing="0" class="el-table__body" style="width: 100%;"><slot /></table>\
</div>',
	methods:
	{
	}
});
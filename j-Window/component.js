COMPONENT('window', 'zindex:12;scrollbar:true', function(self, config) {

	var cls = 'ui-window';
	var cls2 = '.' + cls;

	if (!W.$$window) {

		W.$$window_level = W.$$window_level || 1;
		W.$$window = true;

		$(document).on('click', cls2 + '-button-close', function() {
			SET($(this).attrd('path'), '');
		});

		var resize = function() {
			for (var i = 0; i < M.components.length; i++) {
				var com = M.components[i];
				if (com.name === 'window' && com.dom.offsetParent && com.$ready && !com.$removed)
					com.resize();
			}
		};

		if (W.OP)
			W.OP.on('resize', resize);
		else
			$(W).on('resize', resize);
	}

	self.readonly();

	self.hide = function() {
		self.set('');
	};

	self.resize = function() {
		var el = self.find(cls2 + '-body');
		el.height(WH - self.find(cls2 + '-header').height());
		self.scrollbar && self.scrollbar.resize();
	};

	self.make = function() {

		var scr = self.find('> script');
		self.template = scr.length ? scr.html() : '';

		$(document.body).append('<div id="{0}" class="hidden {3}-container"><div class="{3}"><div data-bind="@config__change .{3}-icon:@icon__html span:value.title" class="{3}-title"><button name="cancel" class="{3}-button-close{2}" data-path="{1}"><i class="fa fa-times"></i></button><i class="{3}-icon"></i><span></span></div><div class="{3}-header"></div><div class="{3}-body"></div></div>'.format(self.ID, self.path, config.closebutton == false ? ' hidden' : '', cls));
		var el = $('#' + self.ID);
		var body = el.find(cls2 + '-body');
		body[0].appendChild(self.dom);

		if (config.scrollbar && window.SCROLLBAR) {
			self.scrollbar = SCROLLBAR(body, { visibleY: !!config.scrollbarY });
			self.scrollleft = self.scrollbar.scrollLeft;
			self.scrolltop = self.scrollbar.scrollTop;
			self.scrollright = self.scrollbar.scrollRight;
			self.scrollbottom = self.scrollbar.scrollBottom;
		} else
			body.aclass(cls + '-scroll');

		self.rclass('hidden');
		self.replace(el);
		self.event('click', 'button[name]', function() {
			switch (this.name) {
				case 'cancel':
					self.hide();
					break;
			}
		});
	};

	self.icon = function(value) {
		var el = this.rclass2('fa');
		value.icon && el.aclass('fa fa-' + value.icon);
	};

	self.configure = function(key, value, init) {
		if (!init) {
			switch (key) {
				case 'closebutton':
					self.find(cls2 + '-button-close').tclass(value !== true);
					break;
			}
		}
	};

	self.setter = function(value) {

		setTimeout2(cls + '-noscroll', function() {
			$('html').tclass(cls + '-noscroll', !!$(cls2 + '-container').not('.hidden').length);
		}, 50);

		var isHidden = value !== config.if;

		if (self.hclass('hidden') === isHidden)
			return;

		setTimeout2('windowreflow', function() {
			EMIT('reflow', self.name);
		}, 10);

		if (isHidden) {
			self.aclass('hidden');
			self.release(true);
			self.find(cls2).rclass(cls + '-animate');
			W.$$window_level--;
			return;
		}

		if (self.template) {
			var is = self.template.COMPILABLE();
			self.find('div[data-jc-replaced]').html(self.template);
			self.template = null;
			is && COMPILE();
		}

		if (W.$$window_level < 1)
			W.$$window_level = 1;

		W.$$window_level++;

		var body = self.find(cls2 + '-body');

		self.css('z-index', W.$$window_level * config.zindex);
		body[0].scrollTop = 0;
		self.rclass('hidden');
		self.release(false);
		self.resize();

		config.reload && EXEC(config.reload, self);
		config.default && DEFAULT(config.default, true);

		if (!isMOBILE && config.autofocus) {
			var el = self.find(config.autofocus === true ? 'input[type="text"],input[type="password"],select,textarea' : config.autofocus);
			el.length && setTimeout(function() {
				el[0].focus();
			}, 1500);
		}

		setTimeout(function() {
			body[0].scrollTop = 0;
			self.find(cls2 ).aclass(cls + '-animate');
		}, 300);

		// Fixes a problem with freezing of scrolling in Chrome
		setTimeout2(self.id, function() {
			self.css('z-index', (W.$$window_level * config.zindex) + 1);
		}, 500);
	};
});
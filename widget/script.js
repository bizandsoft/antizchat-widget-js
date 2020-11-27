define(['jquery', 'moment', 'lib/components/base/modal', "./vendor/inputmask.js"], function($, moment, Modal){
	var CustomWidget = function () {
		var self = this, system = self.system(), widgetTca = 'bizandsoft_antizchat', widgetPath = 'antizchat', currentUser = $('.n-avatar').first().attr('id'), serverName = 'wdg.biz-crm.ru';
		window.antizchat = this;
		self.checkNotifications = function()
			{
			var link = 'https://' + serverName + '/' + widgetPath + '/'+system.subdomain+'/notif';
			self.crm_post(
				link,
					{
					amo_domain: 	system.subdomain,
					amouser_id: system.amouser_id
					},
				function (serverResponse)
					{
					if(self.isJson(serverResponse))
						{
						result = serverResponse;
						self.add_notify(JSON.parse(serverResponse));
						return result;
						}
					},
				'text',
				function ()
					{
					return null;
					}
			)
			}

			self.isJson = function (item)
				{
				item = typeof item !== "string"
						? JSON.stringify(item)
						: item;

				try {
						item = JSON.parse(item);
				} catch (e) {
						return false;
				}

				if (typeof item === "object" && item !== null) {
						return true;
				}

				return false;
				}

			self.postNotificationsRes = function(id, show)
				{
				var link = 'https://' + serverName + '/' + widgetPath + '/'+system.subdomain+'/notif';
				self.crm_post(
					link,
						{
						amo_domain: 	system.subdomain,
						amouser_id: system.amouser_id,
						message_id: id,
						show: show,
						},
					function (json)
						{
						},
					'text',
					function ()
						{

						}
					)
				}

		self.add_notify = function (mess)
			{
			var w_name = "Виджет " + self.i18n('widget').name,
						date_now = Math.ceil(Date.now() / 1000),
						lang = false;
			var message_params = {
				header: w_name,
				text: mess.text,
				date: date_now,
				link: mess.link
				};
			if(mess.show == true && mess.type == "error")
				{
				AMOCRM.notifications.add_error(message_params);
				}
			//default:
			if(mess.show == true && mess.type !== "error")
				{
				AMOCRM.notifications.show_message(message_params);
				}
			self.postNotificationsRes(mess.id, false);
			}


		self.postInstallStatus = function(installState, partnerCode, phone)
			{
			var operationReason = null;
			switch(installState)
				{
				case	'install': // виджет не установлен!
				operationReason = 'disabled';
				break;
				case 'installed': // виджет установлен
				operationReason = 'install';
				break;
				case 'not_configured': // не настроен
				operationReason = 'install';
				break;
				default:
				operationReason = 'install';
				}

			self.crm_post(
				'https://' + serverName + '/' + widgetPath + '/'+system.subdomain+'/register',
				{
					amo_domain: 	system.subdomain,
					amo_current:	system.amouser_id,
					phone:			phone,
					partner:		partnerCode,
					reason:			operationReason
				}
			);
			}

		self.getTemplate = function (template, params, callback) {
						params = (typeof params == 'object') ? params : {};
						template = template || '';

						return self.render({
								href: '/templates/' + template + '.twig',
								base_path: self.params.path,
								load: callback
						}, params);
				}


		self.pad = function (d) {
						return (d < 10) ? "0" + d.toString() : d.toString();
				};

		self.timeSelectOptions = function() {
				var m_data = [];
				var timeStr = "";
				for (var i = 0; i < 24; i++) {
						timeStr = self.pad(i) + ":00";
						m_data.push({option: timeStr, id: timeStr});
						timeStr = self.pad(i) + ":30";
						m_data.push({option: timeStr, id: timeStr});
				}
				return m_data;
		};

		self.deadlineAbsoluteHide = function() {
				if ($(".select_time-deadline-absolute:visible").length > 0) {
						$(".select_time-deadline-absolute")
								.hide();
				}
		};

		self.deadlineDuringeHide = function() {
				if ($(".wrap-during_time:visible").length > 0) {
						$(".wrap-during_time").hide().find("input").val("");
				}
		};

		self.deadlineTimeRuleHide = function() {
				if ($(".control-select-timerule:visible").length > 0) {
						$(".control-select-timerule").hide().find("input").val("");
				}
		};

		self.deadlineTimeCfHide = function() {
				if ($(".control--field-time__cf:visible").length > 0) {
						$(".control--field-time__cf").hide().find("input").val("");
				}
		};


		self.isTimeValid = function(time) {
				var times = time.split(':');
				if (Number(times[0]) > 23) {
						return false;
				}
				if (Number(times[1]) > 59) {
						return false;
				}
				return true;
		};

		self.isTimeIntervalValid = function(time) {
				var _date = moment().format('YYYY-MM-DD');
				var timeInterval = time.split('-');
				if (timeInterval.length == 2) {
						var bool_time_from = self.isTimeValid(timeInterval[0]);
						var bool_time_to = self.isTimeValid(timeInterval[1]);
						if (bool_time_from && bool_time_to) {
								if (moment(_date + ' ' + timeInterval[0]).unix() > moment(_date + ' ' + timeInterval[1]).unix()) {
										return false;
								}
						} else {
								return false;
						}
				} else {
						return false;
				}
				return true;
		};

		this.callbacks = {
			onSave: function () {

					var partnerCode = $('.widget_settings_block__controls__.text-input[name=partner]').val();
					var phone = $('.widget_settings_block__controls__.text-input[name=customer]').val();

					setTimeout(function() {
						var installState = self.get_install_status();
						self.postInstallStatus(installState, partnerCode, phone);
					}, 3000);

					return true;

			},
			settings: function(){},
			dpSettings: function(){

				var dp = $(".digital-pipeline__short-task_widget-style_" + self.w_code).parent().parent();

					var val_entity = dp.find('input[name="entity"]').val();
					var val_entity_lead_active = dp.find('input[name="entity_lead_active"]').val();
					var val_time_deadline_field = dp.find('input[name="time_deadline_field"]').val();
					var val_time_deadline_absolute = dp.find('input[name="time_deadline_absolute"]').val();
					var val_time_deadline_absolute_to = dp.find('input[name="time_deadline_absolute_to"]').val();
					var val_time_deadline_hour = dp.find('input[name="time_deadline_hour"]').val();
					var val_time_deadline_minute = dp.find('input[name="time_deadline_minute"]').val();
					var val_time_deadline_cf_minute = dp.find('input[name="time_deadline_cf_minute"]').val();
					var val_time_deadline_cf_rule = dp.find('input[name="time_deadline_cf_rule"]').val();
					var val_time_rule = dp.find('input[name="time_rule"]').val();
					var val_user_id = dp.find('input[name="user_id"]').val();
					var val_task_type = dp.find('input[name="task_type"]').val();
					var val_comment = dp.find('input[name="comment"]').val();

					var timeRule = {};
					if (val_time_rule.length > 0) {
						try {
							timeRule = JSON.parse(val_time_rule);
						} catch (e) {}
					}

					var times = new Inputmask("99:99-99:99", {
							clearIncomplete: true
					});
					var template_time_rule = "";
						var week_days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
						var index = 1;
						for (var _day of week_days) {
							var time = "";
							var duration = "";
							if (timeRule.hasOwnProperty(index)) {
								time = timeRule[index].time;
								duration = timeRule[index].duration;
							}
							template_time_rule += '<li class="control--select--rule--item" data-day="' + index + '">' +
									'<span class="item--label--rule__day">' + _day + '</span>' +
									'<input type="text" name="time[rule][]" placeholder="10:00-19:00" value="' + time + '" class="input-linked-rule__time js-control-input-time_rule">' +
									'<input type="text" name="time[duration][]" placeholder="..." value="' + duration + '" class="input-linked-rule__duration js-control-allow-numeric js-control-input-time_rule">' +
							'</li>';
						index++;
						}
					var time_field_options = [{
							id: "during",
							option: "В течение",
							is_system: true
					},{
							id: "today",
							option: "Конец дня",
							is_system: true
					},{
							id: "absolute",
							option: "Указать время",
							is_system: true
					}];
		
					var users = AMOCRM.constant('managers');
					var user_options = [{
							id: "current",
							option: "Текущий ответственный"
					},{
							id: "creator",
							option: "Создатель сделки"
					}];

					for (var key in users) {
							var user = users[key];
							if (user.active) {
									user_options.push({
											id: user.id,
											option: user.title
									});
							}
					}
					var task_types = AMOCRM.constant('task_types');
					var task_types_options = [{
							id: 1,
							option: "Связаться с клиентом"
					},{
							id: 2,
							option: "Встреча"
					}];
					for (var key in task_types) {
							var task_type = task_types[key];
							task_types_options.push({
								id: task_type.id,
								option: task_type.option
							});
					}

					var is_time_system_selected = true;
					for (var key in time_field_options) {
						var _option = time_field_options[key];
						if (_option.id == val_time_deadline_field) {
							is_time_system_selected = _option.is_system;
							break;
						}
					}

					dp.find('#widget_settings__fields_wrapper').html('<div class="dp_settings_' + self.w_code + '">' +
						'<style type="text/css">' +
									'.dp_settings_' + self.w_code + ' .widget-wrapper_fd {' +
										'display: flex;' +
										'align-items: center;' +
									'}' +
									'.dp_settings_' + self.w_code + ' .select_time-deadline-absolute {' +
										'display: flex;' +
										'align-items: center;' +
									'}' +
									'.dp_settings_' + self.w_code + ' .control-select-overlay {' +
										'display: none;' +
										'position: fixed;' +
										'top: 0;' +
										'right: 0;' +
										'bottom: 0;' +
										'left: 0;' +
										'z-index: 100;' +
									'}' +
									'.dp_settings_' + self.w_code + ' .control-select-timerule {' +
										'position: relative;' +
										'height: 36px;' +
										'width: 158px;' +
										'color: #2e3640;' +
										'box-sizing: border-box;' +
										'margin-left: 10px;' +
										'z-index: 10;' +
									'}' +
									'.dp_settings_' + self.w_code + ' .list-linked-timerule {' +
										'display: none;' +
										'position: absolute;' +
										'bottom: 0;' +
										'left: 0;' +
										'width: 100%;' +
										'border: 1px solid #d4d5d8;' +
										'border-radius: 3px;' +
										'background-color: #fff;' +
										'height: auto;' +
										'z-index: 101;' +
									'}' +
									'.dp_settings_' + self.w_code + ' .control-select-rule-item {' +
										'display: flex;' +
										'align-items: center;' +
										'list-style-type: none;' +
										'padding: 8px 6px 7px 6px;' +
										'overflow: hidden;' +
										'box-sizing: border-box;' +
									'}' +
									'.dp_settings_' + self.w_code + ' .input-linked-rule_time {' +
										'width: 90px;' +
										'padding: 5px;' +
										'margin: 0 3px;' +
										'height: 30px;' +
										'border: 1px solid #dbdedf;' +
										'border-radius: 3px;' +
										'box-sizing: border-box;' +
										'color: #313942;' +
										'background: #fff;' +
									'}' +
									'.dp_settings_' + self.w_code + ' .input-linked-rule_duration {' +
										'height: 30px;' +
										'width: 26px;' +
										'box-sizing: border-box;' +
										'color: #313942;' +
										'background: #fff;' +
										'border-bottom: 1px solid #2A95CC;' +
									'}' +
									'.dp_settings_' + self.w_code + ' .button--select-time_rule {' +
										'background: #fff;' +
										'box-sizing: border-box;' +
										'display: inline-block;' +
										'height: 100%;' +
										'width: 100%;' +
										'outline: 0;' +
										'border: 1px solid #d4d5d8;' +
										'border-bottom-width: 2px;' +
										'border-radius: 3px;' +
										'padding-right: 25px;' +
										'padding-left: 10px;' +
										'text-align: left;' +
									'}' +
									'.dp_settings_' + self.w_code + ' .input-deadline-inner_small {' +
											'padding-right: 18px;' +
									'}' +
									'.dp_settings_' + self.w_code + ' .input-deadline-inner_small::placeholder {' +
											'font-size: 14px;' +
									'}' +
								'</style>' +
							'<div class="form-group">' +
									self.render({ ref: "/tmpl/controls/select.twig" }, {
											items: [{
													id: "lead",
													option: "Сделки"
											},{
													id: "contact",
													option: "Основного контакта"
											},{
													id: "lead_and_contact",
													option: "Сделки и осн.контакта"
											}],
											name: "entity",
											class_name: "js-control-task_entity",
											additional_data: 'style="margin-top: 0;flex-grow: 1;"',
											selected: val_entity,
											selected_before: "Создавать задачу для: "
									}) +
							'</div>' +
							'<div class="form-group widget-wrapper_fd">' +
									self.render({ ref: "/tmpl/controls/select.twig" }, {
											items: time_field_options,
											name: "time_deadline_field",
											class_name: "js-control-time_deadline",
											additional_data: 'style="margin-top: 0;flex-grow: 1;width: 265px;"',
											selected: val_time_deadline_field,
											selected_before: "Время выполнения задачи: "
									}) +
									'<div class="select_time-deadline-absolute" style="display: ' + (val_time_deadline_field == "absolute" ? "" : "none") + ';">' +
										self.render({ ref: "/tmpl/controls/select.twig" }, {
												items: self.timeSelectOptions(),
												name: "time_deadline_absolute",
												additional_data: 'style="margin-left: 10px;margin-top: 0;width: 72px;"',
												selected: val_time_deadline_absolute
										}) +
										'<div style="margin-left: 5px;">-</div>' +
										self.render({ ref: "/tmpl/controls/select.twig" }, {
												items: self.timeSelectOptions(),
												name: "time_deadline_absolute_to",
												additional_data: 'style="margin-left: 5px;margin-top: 0;width: 72px;"',
												selected: val_time_deadline_absolute_to ? val_time_deadline_absolute_to : val_time_deadline_absolute
										}) +
									'</div>' +
									'<div class="wrap-during_time" style="margin-left: 10px; flex-wrap: wrap; display: ' + (val_time_deadline_field == "during" ? "flex" : "none") + ';">' +
											'<div class="deadline_select__input" style="display: flex; flex-direction: row;">' +
													self.render({ ref: "/tmpl/controls/select.twig" }, {
															items: [{
																	id: "0",
																	option: "0ч"
															},{
																	id: "1",
																	option: "1ч"
															},{
																	id: "2",
																	option: "2ч"
															},{
																	id: "3",
																	option: "3ч"
															},{
																	id: "4",
																	option: "4ч"
															},{
																	id: "5",
																	option: "5ч"
															},{
																	id: "6",
																	option: "6ч"
															},{
																	id: "7",
																	option: "7ч"
															},{
																	id: "8",
																	option: "8ч"
															},{
																	id: "9",
																	option: "9ч"
															},{
																	id: "10",
																	option: "10ч"
															},{
																	id: "11",
																	option: "11ч"
															},{
																	id: "12",
																	option: "12ч"
															},{
																	id: "16",
																	option: "16ч"
															},{
																	id: "24",
																	option: "24ч"
															}],
															name: "time_deadline_hour",
															class_name: "js-control-time_deadline_hour",
															additional_data: 'margin-top: 0;width: 72px;"',
															selected: val_time_deadline_hour
													}) +
											'</div>' +
											'<div class="deadline" style="display: flex; flex-direction: row; margin-right: 0;">' +
											self.render({ ref: "/tmpl/controls/select.twig" }, {
													items: [{
															id: "30",
															option: "30м"
													},{
															id: "0",
															option: "0м"
													},{
															id: "5",
															option: "5м"
													},{
															id: "10",
															option: "10м"
													},{
														id: "15",
														option: "15м"
													},{
														id: "20",
														option: "20м"
													},{
															id: "45",
															option: "45м"
													},{
															id: "50",
															option: "50м"
													}],
													name: "time_deadline_minute",
													class_name: "js-control-time_deadline_minute",
													additional_data: 'style="margin-top: 0;width: 72px;"',
													selected: val_time_deadline_minute
											}) +
											'</div>' +
									'</div>' +
									'<div class="control--field-time__cf" style="display: ' + (is_time_system_selected ? "none" : "block") + ';">' +
											'<div class="deadline_select__input" style="margin-left: 10px;">' +
													'<input name="time_deadline_cf_minute" class="text-input input-deadline-inner_small js-control-date-deadline_number" type="text" placeholder="+/-10" value="' + val_time_deadline_cf_minute + '" maxlength="4" autocomplete="off">' +
													'<span class="deadline_select__input_descr">м</span>' +
											'</div>' +
											'<div class="deadline_select__input" style="margin-right: 0;">' +
													'<input name="time_deadline_cf_rule" class="text-input input-deadline-inner_small js-control-allow-numeric" type="text" placeholder="в теч." value="' + val_time_deadline_cf_rule + '" maxlength="3" autocomplete="off">' +
													'<span class="deadline_select__input_descr">м</span>' +
											'</div>' +
									'</div>' +
									'<div class="control-select-timerule" style="display: ' + (val_time_deadline_field == "time_rule" ? "block" : "none") + ';">' +
										'<div class="control-select-overlay"></div>' +
										'<ul class="list-linked-timerule">' + template_time_rule + '</ul>' +
										'<button class="button--select-time_rule js-control-button-time__rule" tabindex="" type="button">' +
											'<span class="button--select--rule-inner">Настроить</span>' +
										'</button>' +
										'<input type="hidden" name="time_rule" value=' + val_time_rule + '>' +
								'</div>' +
							'</div>' +
							'<div class="form-group">' +
									self.render({ ref: "/tmpl/controls/select.twig" }, {
											items: user_options,
											name: "user_id",
											additional_data: 'style="margin-top: 0;width: 100%;"',
											selected: val_user_id,
											selected_before: "Для: "
									}) +
							'</div>' +
							'<div class="form-group">' +
									self.render({ ref: "/tmpl/controls/select.twig" }, {
											items: task_types_options,
											name: "task_type",
											additional_data: 'style="margin-top: 0;width: 100%;"',
											selected: val_task_type,
											selected_before: "Тип задачи: "
									}) +
							'</div>' +
							'<div class="form-group">' +
									self.render({ ref: "/tmpl/controls/textarea.twig" }, {
											name: "comment",
											placeholder: "Добавьте комментарий",
											additional_data: 'style="min-height: 100px;width: 100%;"',
											value: val_comment
									}) +
							'</div>' +
					'</div>');

					dp = $('.dp_settings_' + self.w_code);
					times.mask(dp.find('.input-linked-rule_time'));
					self.deadlineAbsoluteHide();
					self.deadlineTimeRuleHide();
					self.deadlineTimeCfHide();
					$(".wrap-during_time").show();
					dp.on("keydown", ".js-control-date-deadline_number", function() {
							var e = $(this);
							setTimeout(function() {
									var input_val = e.val().replace(/[^0-9\+\-]/g, "");
									e.val(input_val);
							}, 1);
					}).on("change", ".js-control-date-deadline_number", function() {
							var input_val = $(this).val();
							if (input_val.length === 0)
									return;
							if (input_val.indexOf("+") === -1 && input_val.indexOf("-") === -1) {
									$(this).val("");
									return;
							}
							var number = input_val.replace(/[^0-9]/g, "");
							if (number.length === 0) {
									$(this).val("");
									return;
							}
					}).on("controls:change", ".js-control-task_date_select .control--select--input", function() {
							var input_val = $(this).val();
					}).on("controls:change", ".js-control-time_deadline .control--select--input", function() {
							var input_val = $(this).val();
							if (input_val == "now" || input_val == "today") {
								self.deadlineAbsoluteHide();
									self.deadlineDuringeHide();
									self.deadlineTimeRuleHide();
									self.deadlineTimeCfHide();
							} else if (input_val == "absolute") {
									self.deadlineDuringeHide();
									self.deadlineTimeRuleHide();
									self.deadlineTimeCfHide();
									$(".select_time-deadline-absolute").show();
							} else if (input_val == "during") {
									self.deadlineAbsoluteHide();
									self.deadlineTimeRuleHide();
									self.deadlineTimeCfHide();
									$(".wrap-during_time").show();
							} else if (input_val == "time_rule") {
									self.deadlineAbsoluteHide();
									self.deadlineDuringeHide();
									self.deadlineTimeCfHide();
									$(".control-select-timerule").show();
							} else {
									self.deadlineAbsoluteHide();
									self.deadlineDuringeHide();
									self.deadlineTimeRuleHide();
									$(".control--field-time__cf").show();
							}
					}).on("controls:change", ".js-control-task_duplicate .control--select--input", function() {
							var input_val = $(this).val();
							var el_action_duplicate = dp.find('.linked-item__task-action__duplicate');
							if (input_val == 1) {
									el_action_duplicate.show();
							} else {
									el_action_duplicate.hide();
							}
					}).on("controls:change", ".js-control-task_entity .control--select--input", function() {
							var input_val = $(this).val();
							var el_action_entity_lead = dp.find('.linked-item__task-action__entity_lead');
							if (input_val == "lead") {
									el_action_entity_lead.show();
							} else {
									el_action_entity_lead.hide();
							}
					}).on("click", ".js-copy-cf__dp_tag", function() {
						var title_cf = $(this).attr("title");
						var el = dp.find('textarea[name="comment"]');
						var position = el.get(0).selectionEnd;
				var comment = el.val();
				var c_start = comment.substr(0, position);
				var c_end = comment.substr(position);
				el.val(c_start + title_cf + c_end);
				el.change();
					}).on("click", ".js-control-button-time__rule", function() {
						dp.find('.list-linked-timerule').show();
						dp.find('.control-select-overlay').show();
					}).on("click", ".control-select-overlay", function() {
						$(this).hide();
						dp.find('.list-linked-timerule').hide();
					}).on("change", ".js-control-input-time_rule", function() {
						var obj_rule = {};
						dp.find('.list-linked-timerule .control-select-rule-item').each(function() {
							var day = $(this).data('day');
									var el_time = $(this).find('.input-linked-rule_time');
							var duration = $(this).find('.input-linked-rule_duration').val();
									var time = el_time.val();
							if (time.length > 0) {
											var isValid = self.isTimeIntervalValid(time);
											if (isValid) {
													obj_rule[day] = {
															time: time,
															duration: duration
													};
											} else {
													el_time.val('');
											}
							}
						});
						var str_rule = $.isEmptyObject(obj_rule) ? "" : JSON.stringify(obj_rule);
						dp.find('input[name="time_rule"]').val(str_rule);
					});
			},
			init: function () {
			var notifications = self.checkNotifications();
			return true;
			},
			bind_actions: function () {
				$('.' + widgetTca + '-button').on('click', function () {
					var partner = self.get_settings().partner;
					$('.' + widgetTca + '_mgc-template-modal').remove();
					var searchForm = '\
					<form id="form">\
						<iframe src="https://' + serverName + '/' + widgetPath + '/index.php?\
							dom=' + window.location.hostname.split('.')[0] + '&\
							lead=' + AMOCRM.data.current_card.id + '&\
							current=' + currentUser + '" \
							style="width:100%;height:400px;">\
						</iframe>\
					</form>\
				</div>\
				<div id="' + widgetTca + '_result"></div>';
					$('body').append('\
				<div class="modal modal-list modal_print modal-action ' + widgetTca + '_mgc-modal">\
					<div class="modal-scroller custom-scroll">\
						<div class="modal-body modal-body-relative">\
							<div class="modal-body__inner">\
								<div class="' + widgetTca + '_sdk">\
									<div class="' + widgetTca + '-action__header">\
										<h2 class="' + widgetTca + '-action__caption head_2"> Настройки ' + self.i18n('widget').name +'</h2>\
										<div class="' + widgetTca + '-action__top-controls">\
											<button type="button" class="button-input button-cancel ' + widgetTca + '_bye">✕</button>\
										</div>\
									</div>\
									' + searchForm + '\
								</div>\
							</div>\
						<div class="default-overlay modal-overlay default-overlay-visible">\
							<span class="modal-overlay__spinner spinner-icon spinner-icon-abs-center"style="display: none;"></span>\
						</div>\
					</div>\
				</div>\
			</div>');
					$('.' + widgetTca + '_mgc-modal .button-cancel').on('click', function () {
						$('.' + widgetTca + '_mgc-modal').remove();
					});
				});

				return true;

			},
			render: function () {
				$('.' + widgetTca + '_mgc-modal').hide();
				var lang = self.i18n('userLang');
				self.w_code = self.params.widget_code;
				if (typeof(AMOCRM.data.current_card) != 'undefined') {
					if (AMOCRM.data.current_card.id == 0) {
						return false;
					}
				}
				self.render_template({
					caption: {
						class_name: widgetTca + '_js-ac-caption',
						html: ''
					},
					body: '',
					render: '\
						<div class="' + widgetTca + '_ac-form">\
							<div class="' + widgetTca + '-button ' + widgetTca + '_ac_sub">Настройки</div>\
						</div>\
						<link type="text/css" rel="stylesheet" href="' + self.get_settings().path + '/style.css?v='+self.get_settings().version+'">'
				});

				return true;
			},
			contacts: {
			selected: function () {}
			},
			leads: {
			selected: function () {}
			}
		};
		return this;
	};
	return CustomWidget;
});

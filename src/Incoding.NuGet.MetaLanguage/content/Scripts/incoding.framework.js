﻿"use strict";

//#region class IncAjaxEvent

function IncAjaxEvent() {
    this.ResponseText = '';
    this.StatusCode = '';
    this.StatusText = '';
}

IncAjaxEvent.Create = function (response) {
    var res = new IncAjaxEvent();
    res.ResponseText = response.responseText;
    res.StatusCode = response.status;
    res.StatusText = response.statusText;
    return res;
};

//#endregion

//#region class IncSpecialBind

function IncSpecialBinds() {

}

IncSpecialBinds.Incoding = 'incoding';

IncSpecialBinds.InitIncoding = 'initincoding';

IncSpecialBinds.IncChangeUrl = 'incchangeurl';

IncSpecialBinds.IncAjaxBefore = 'incajaxbefore';

IncSpecialBinds.IncAjaxError = 'incajaxerror';

IncSpecialBinds.IncAjaxComplete = 'incajaxcomplete';

IncSpecialBinds.IncAjaxProgress = 'incajaxprogress';

IncSpecialBinds.IncAjaxSuccess = 'incajaxsuccess';

IncSpecialBinds.IncInsert = 'incinsert';

IncSpecialBinds.IncGlobalError = 'incglobalerror';

IncSpecialBinds.DocumentBinds = [
    IncSpecialBinds.IncChangeUrl,
    IncSpecialBinds.IncAjaxBefore,
    IncSpecialBinds.IncAjaxError,
    IncSpecialBinds.IncAjaxComplete,
    IncSpecialBinds.IncAjaxSuccess,
    IncSpecialBinds.IncGlobalError,
    IncSpecialBinds.IncInsert
];

//#endregion

function AjaxAdapter() {

    this.params = function (data) {
        var res = [];
        $(data).each(function () {
            var name = this.name;
            var value = this.selector;

            if (ExecutableHelper.IsNullOrEmpty(value)) {
                res.push({ name: name, value: value });
                return;
            }

            var isElementCanArray = $(name.toSelectorAsName()).is('[type=checkbox],select,[type=radio]');
            var isValueCanArray = _.isArray(value) || value.toString().contains(',');

            if (_.isArray(value) || (isValueCanArray && isElementCanArray)) {
                $(value.toString().split(',')).each(function () {
                    res.push({ name: name, value: this });
                });
            }
            else {
                res.push({ name: name, value: value });
            }

        });
        return res;
    };

    this.request = function (options, callback, self) {
        if (!options.hasOwnProperty('global')) {
            options.global = true;
        }
        var isReadyForLocalCache = options.localCache && LocalStorageFactory.IsReady;
        var key = options.url;
        $(options.data).each(function () {
            key += "&{0}={1}".f(this.name, this.selector);
        });
        if (isReadyForLocalCache) {
            var value = LocalStorageFactory.Get(key);
            if (!ExecutableHelper.IsNullOrEmpty(value)) {
                if (options.global) {
                    $(self).trigger(jQuery.Event(IncSpecialBinds.IncAjaxSuccess));
                }
                callback(JSON.parse(value));
                return;
            }
        }

        $.extend(options, {
            url: options.url.split("?")[0],
            headers: { "X-Requested-With": "XMLHttpRequest" },
            dataType: 'JSON',
            success: function (data, textStatus, jqXHR) {
                var parseResult = new IncodingResult(data);
                if (options.global) {
                    $(self).trigger(jQuery.Event(IncSpecialBinds.IncAjaxSuccess), parseResult);
                }
                
                if (isReadyForLocalCache) {
                    LocalStorageFactory.Set(key, JSON.stringify(data));
                }
                callback(parseResult);
            },
            beforeSend: function (jqXHR, settings) {
                if (options.global) {
                    $(self).trigger(jQuery.Event(IncSpecialBinds.IncAjaxBefore), IncodingResult.Success(IncAjaxEvent.Create(jqXHR)));
                }
            },
            complete: function (jqXHR, textStatus) {
                if (options.global) {
                    $(self).trigger(jQuery.Event(IncSpecialBinds.IncAjaxComplete), new IncodingResult(jqXHR.responseText).data);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (options.global) {
                    $(self).trigger(jQuery.Event(IncSpecialBinds.IncAjaxError), new IncodingResult(jqXHR.responseText).data);
                }
            },
            data: this.params(options.data)
        });

        return $.ajax(options);
    };

}

AjaxAdapter.Instance = new AjaxAdapter();

//#region class ExecutableHelper

function ExecutableHelper() {
    var isSelector = function (selector) {
        return selector.startsWith("||") && selector.endWith("||");
    };
    var isJquerySelector = function (selector) {
        return selector.startsWith("$(");
    };
    var getJquery = function (selector) {

        if ($(selector).is(':checkbox')) {
            var onlyCheckbox = $(selector).filter(':checkbox');
            if (onlyCheckbox.length == 1) {
                return $(onlyCheckbox).is(':checked');
            }
            if (onlyCheckbox.length > 1) {

                var res = [];
                $(onlyCheckbox).each(function () {
                    if (!$(this).is(':checked')) {
                        return true;
                    }
                    res.push($(this).val());
                    return true;
                });

                return res;
            }
        }
        else if (($(selector).is("select") && $(selector).length > 1)) {
            var res = [];
            $(selector).each(function () {
                var val = $(this).val();
                if (!ExecutableHelper.IsNullOrEmpty(val)) {
                    res.push(val);
                }
            });
            return res;
        }
        else if ($(selector).is("select[multiple]")) {
            var res = [];
            $($(selector).val()).each(function () {
                if (!ExecutableHelper.IsNullOrEmpty(this)) {
                    res.push(this);
                }
            });
            return res;
        }
        else if ($(selector).is(":radio")) {
            return $($(selector).prop("name").toSelectorAsName() + ":checked").val();
        }
        else if ($(selector).isFormElement()) {
            return $(selector).val();
        }

        var something = $(selector).val();
        return ExecutableHelper.IsNullOrEmpty(something)
            ? $.trim($(selector).html())
            : something;
    };
    var getResult = function (selector, currentResult) {
        if (ExecutableHelper.IsNullOrEmpty(selector)) {
            return currentResult;
        }
        var res = [];
        if (selector.startsWith("[")) {
            var index = selector.substring(selector.indexOf('[') + 1, selector.indexOf(']'));
            currentResult = currentResult[index];
            selector = selector.substring(selector.indexOf(']') + 1, selector.length);
        }

        $(!_.isArray(currentResult) ? [currentResult] : currentResult).each(function () {

            var valueOfProperty = this;
            $(selector.split('.')).each(function () {
                if (ExecutableHelper.IsNullOrEmpty(this)) {
                    return true;
                }

                var index = this.substring(this.indexOf('[') + 1, this.indexOf(']'));
                if (!ExecutableHelper.IsNullOrEmpty(index)) {
                    var array = valueOfProperty[this.substring(0, this.indexOf('['))];
                    valueOfProperty = array[index];
                    return true;
                }

                var valueOfMethod = this.substring(this.indexOf('(') + 1, this.lastIndexOf(')'));
                if (!ExecutableHelper.IsNullOrEmpty(valueOfMethod)) {
                    var nameOfMethod = this.substring(0, this.indexOf('('));
                    if (nameOfMethod === 'Select') {
                        var tmpValueOfProperty = [];

                        $(valueOfProperty).each(function () {
                            tmpValueOfProperty.push(getResult(valueOfMethod, this));
                        });
                        valueOfProperty = tmpValueOfProperty;

                    }
                    if (nameOfMethod === 'Any') {
                        var res = false;
                        var splitValue = valueOfMethod.split(' ');
                        $(valueOfProperty).each(function () {
                            var helper = $.extend({}, ExecutableHelper.Instance, { result: this });
                            var actual = helper.TryGetVal(splitValue[0]);
                            var expected = helper.TryGetVal(splitValue[2]);
                            var method = splitValue[1];
                            res = ExecutableHelper.Compare(actual, expected, method);
                            return res ? false : true;
                        });
                        valueOfProperty = res;
                    }
                    return true;
                }

                valueOfProperty = valueOfProperty[this];

            });

            res.push(ExecutableHelper.IsNullOrEmpty(valueOfProperty) ? '' : valueOfProperty);
        });

        return res.length === 1 ? res[0] : res;

    };
    this.self = '';
    this.target = '';
    this.event = '';
    this.result = '';
    this.resultOfEvent = '';

    this.TryGetVal = function (selector) {

        if (ExecutableHelper.IsNullOrEmpty(selector)) {
            return selector;
        }
        if (selector instanceof jQuery) {
            return selector.length != 0 ? getJquery(selector) : '';
        }

        var isPrimitiveType = (_.isNumber(selector) || _.isBoolean(selector) || _.isArray(selector) || _.isDate(selector) || _.isFunction(selector));
        var isObject = _.isObject(selector) && !_.isElement($(selector)[0]);
        if ((isPrimitiveType || isObject) && !_.isString(selector)) {
            return selector;
        }

        selector = selector.toString();

        if (!isJquerySelector(selector) && !isSelector(selector)) {
            return selector;
        }

        if (isJquerySelector(selector)) {
            return this.TryGetVal(eval(selector));
        }

        var res;

        if (isSelector(selector)) {

            var valueSelector = selector.substring(2, selector.length - 2)
                .substring(selector.indexOf('*') - 1, selector.length);

            var isType = function (type) {
                return selector.startsWith("||{0}*".f(type));
            };

            if (isType('buildurl')) {
                var toBuildUrl = $.url(valueSelector);
                $.eachProperties(toBuildUrl.param(), function () {
                    toBuildUrl.setParam(this, ExecutableHelper.Instance.TryGetVal(toBuildUrl.param()[this]));
                });

                $.eachProperties(toBuildUrl.fparam(), function () {
                    toBuildUrl.setFparam(this, ExecutableHelper.Instance.TryGetVal(toBuildUrl.fparam()[this]));
                });
                return toBuildUrl.toHref();
            }
            if (isType('ajax')) {
                var options = $.extend(true, { data: [] }, $.parseJSON(valueSelector));
                var ajaxUrl = $.url(options.url);
                $.eachProperties(ajaxUrl.param(), function () {
                    options.data.push({ name: this, selector: ExecutableHelper.Instance.TryGetVal(ajaxUrl.param()[this]) });
                });
                var ajaxData;
                AjaxAdapter.Instance.request(options, function (result) {
                    ajaxData = result.data;
                }, this.self);
                res = ajaxData;
            }
            else if (isType('cookie')) {
                res = $.cookie(valueSelector);
            }
            else if (isType('hashQueryString')) {
                res = $.url(window.location.href).fparam(valueSelector.split(':')[0], valueSelector.split(':')[1]);
            }
            else if (isType('hashUrl')) {
                res = $.url(window.location.href).furl(valueSelector);
            }
            else if (isType('queryString')) {
                res = $.url(window.location.href).param(valueSelector);
            }
            else if (isType('value')) {
                res = valueSelector.replaceAll('1ADC3DB4-D196-4E59-9FC0-6FAD2633EF07', "|")
                    .replaceAll("42CE7EF2-7812-4E6D-8071-676DA8CA7ED7", "*");
            }
            else if (isType('javascript')) {
                res = eval(valueSelector);
            }
            else if (isType('jquery')) {
                res = $(valueSelector);
            }
            else if (isType('result') || isType('resultOfevent')) {
                res = getResult(valueSelector, isType('result') ? this.result : this.resultOfEvent);
            }
        }

        return ExecutableHelper.IsNullOrEmpty(res) ? '' : res;

    };

    this.TrySetValue = function (element, val) {

        if ($(element).is('[type=hidden]') && $(element).is(':checkbox') && $(element).length == 2) {
            element = $(element).filter(':checkbox');
        } //fix CheckBoxFor

        if ($(element).is(':checkbox')) {
            var onlyCheckBoxes = element;
            $(onlyCheckBoxes).prop('checked', false);
            if ($(onlyCheckBoxes).length == 1) {
                if (ExecutableHelper.ToBool(val)) {
                    $(onlyCheckBoxes).prop('checked', true);
                }
            }
            else {
                var arrayVal = _.isArray(val) ? val : val.split(',');
                $(onlyCheckBoxes).each(function () {
                    if (arrayVal.contains($(this).val())) {
                        $(this).prop('checked', true);
                    }
                    else {
                        $(this).prop('checked', false);
                    }
                });
            }
            return;
        }

        if ($(element).is('select[multiple]')) {
            $(element).val(val.split(','));
            return;
        }

        if ($(element).is('select') && $(element).length > 1) {
            $(_.isArray(val) ? val : val.split(',')).each(function () {
                if (this.toString() != '') // fix to not update different selects if val is empty
                {
                    $('option[value="{0}"]'.f(this)).closest('select').val(this.toString());
                } //this.toString() fixed for ie < 9
            });
            return;
        }

        if ($(element).is(':radio')) {
            $($(element).prop("name").toSelectorAsName() + "[value=\"{0}\"]".f(val)).prop('checked', true);
            return;
        }

        if ($(element).isFormElement()) {
            $(element).val(val);
        }
        else {
            $(element).html(val);
        }

    };

}

ExecutableHelper.Instance = new ExecutableHelper();

ExecutableHelper.IsData = function (data, property, evaluated) {

    if (ExecutableHelper.IsNullOrEmpty(property)) {
        return evaluated.call(data);
    }

    var res = false;
    $(!_.isArray(data) ? [data] : data).each(function () {
        var valueOfProperty = this[property];
        if (evaluated.call(ExecutableHelper.IsNullOrEmpty(valueOfProperty) ? '' : valueOfProperty)) {
            res = true;
            return false;
        }
    });

    return res;
};

ExecutableHelper.Filter = function (data, filter) {
    var res;
    if (_.isArray(data)) {
        res = [];
        $(data).each(function () {
            if (filter.isSatisfied(this)) {
                res.push(this);
            }
        });
    }
    else {
        res = filter.isSatisfied(data) ? data : {};
    }
    return res;
};

ExecutableHelper.Compare = function (actual, expected, method) {

    method = method.toString().toLowerCase();

    if (method == 'isempty') {
        return ExecutableHelper.IsNullOrEmpty(actual);
    }

    actual = ExecutableHelper.IsNullOrEmpty(actual) ? '' : actual.toString().toUpperCase();
    expected = ExecutableHelper.IsNullOrEmpty(expected) ? '' : expected.toString().toUpperCase();

    if (method == 'equal') {
        return actual === expected;
    }

    if (method == 'notequal') {
        return actual !== expected;
    }

    if (method == 'iscontains') {
        return actual.contains(expected);
    }

    if (method == 'lessthan') {
        return parseFloat(actual) < parseFloat(expected);
    }
    if (method == 'lessthanorequal') {
        return parseFloat(actual) <= parseFloat(expected);
    }

    if (method == 'greaterthan') {
        return parseFloat(actual) > parseFloat(expected);
    }

    if (method == 'greaterthanorequal') {
        return parseFloat(actual) >= parseFloat(expected);
    }

    throw new IncClientException({ message: "Can't compare by method {0}".f(method) }, {});
};

ExecutableHelper.IsNullOrEmpty = function (value) {
    var isNothing = _.isUndefined(value) || _.isNull(value) || _.isNaN(value) || value == "undefined";
    if (isNothing) {
        return true;
    }

    if (_.isString(value)) {
        return _.isEmpty(value.toString());
    }

    if (_.isArray(value)) {
        return value.length == 0;
    }

    if (_.isNumber(value) || _.isDate(value) || _.isBoolean(value) || _.isFunction(value)) {
        return false;
    }

    var hasOwnProperty = false;
    $.eachProperties(value, function () {
        hasOwnProperty = true;
    });

    return !hasOwnProperty;
};

ExecutableHelper.RedirectTo = function (destentationUrl) {
    // decode url issue for special characters like % or /
    // fixed like here: https://github.com/medialize/URI.js/commit/fd8ee89a024698986ebef57393fcedbe22631616

    var safeGetUri = function (url) {
        try {
            return decodeURIComponent(url);
        }
        catch (ex) {
            return url;
        }
    };
    var decodeUri = safeGetUri(destentationUrl);
    var decodeHash = safeGetUri(window.location.hash);

    var isSame = decodeUri.contains('#') && decodeHash.replace("#", "") == decodeUri.split('#')[1];
    if (isSame) {
        $(document).trigger(jQuery.Event(IncSpecialBinds.IncChangeUrl));
        return;
    }

    window.location = destentationUrl;
};

ExecutableHelper.UrlDecode = function (value) {
    return decodeURIComponent(value);
};

ExecutableHelper.UrlEncode = function (value) {
    if (ExecutableHelper.IsNullOrEmpty(value)) {
        return value;
    }

    var encode = function () {
        return this
            .replaceAll('&', '%26')
            .replaceAll('?', '%3F')
            .replaceAll('/', '%2F')
            .replaceAll('=', '%3D')
            .replaceAll(':', '%3A')
            .replaceAll('@', '%40')
            .replaceAll('#', '%23');
    };

    if (value instanceof Array) {
        for (var i = 0; i < value.length; i++) {
            value[i] = encode.call(value[i]);
        }
        return value;
    }
    else {
        return encode.call(value.toString());
    }
};

ExecutableHelper.ToBool = function (value) {

    if (ExecutableHelper.IsNullOrEmpty(value)) {
        return false;
    }

    if (value instanceof Boolean) {
        return value;
    }
    var toStringVal = value.toString().toLocaleLowerCase();

    return toStringVal === 'true';
};

//#endregion

//#region Templates

function IncMustacheTemplate() {

    this.compile = function (tmpl) {
        return tmpl;
    };

    this.render = function (tmpl, data) {
        var compile = Mustache.compile(tmpl);
        return compile(data);
    };

}

function IncHandlerbarsTemplate() {

    this.compile = function (tmpl) {
        return navigator.Ie8 ? tmpl
            : Handlebars.precompile(tmpl);
    };

    this.render = function (tmpl, data) {

        if (navigator.Ie8) {
            return Handlebars.compile(tmpl)(data);
        }

        if (!_.isFunction(tmpl)) {
            tmpl = eval("(" + tmpl + ")");
        }
        return Handlebars.template(tmpl)(data);
    };

}

function IncDoTTemplate() {

    this.compile = function (tmpl) {
        return navigator.Ie8 ? tmpl
            : doT.compile(tmpl);
    };

    this.render = function (tmpl, data) {
        return doT.template(tmpl)(data);
    };

}

function LocalStorageFactory() {

}

LocalStorageFactory.Clear = function () {
    if (!LocalStorageFactory.IsReady) {
        return;
    }
    var specialKey = 'inc-version';
    var lastVersion = LocalStorageFactory.Get(specialKey);
    if (ExecutableHelper.IsNullOrEmpty(lastVersion)) {
        localStorage.clear();
    }
    else {
        LocalStorageFactory.Set(specialKey, TemplateFactory.Version);
    }

};
LocalStorageFactory.IsReady = typeof (Storage) !== "undefined";
LocalStorageFactory.PrepareKey = function (selectorKey) {
    selectorKey = selectorKey + TemplateFactory.Version;
    if (navigator.Ie8) {
        selectorKey = selectorKey + 'ie8';
    }
    return selectorKey;
};

LocalStorageFactory.Set = function (key, value) {
    if (!LocalStorageFactory.IsReady) {
        return;
    }

    try {
        if (localStorage.remainingSpace < 2000) {
            localStorage.clear();
        }
        localStorage.setItem(LocalStorageFactory.PrepareKey(key), value);
    }
    catch (e) {
        if (!ExecutableHelper.IsNullOrEmpty(e.name) && e.name.toUpperCase().indexOf('QUOTA') > -1) {
            try {
                localStorage.clear();
            }
            catch (e) {

            }
        }
    }

};
LocalStorageFactory.Get = function (key) {
    try {
        return localStorage.getItem(LocalStorageFactory.PrepareKey(key));
    }
    catch (e) {
        return '';
    }

};

function TemplateFactory() {
}

TemplateFactory.Version = '';

TemplateFactory.ToHtml = function (builder, selectorKey, evaluatedSelector, data) {

    var compile = LocalStorageFactory.Get(selectorKey);
    if (ExecutableHelper.IsNullOrEmpty(compile)) {
        var tmplContent = evaluatedSelector();
        if (ExecutableHelper.IsNullOrEmpty(tmplContent)) {
            throw 'Template is empty';
        }

        compile = builder.compile(tmplContent);
        LocalStorageFactory.Set(selectorKey, compile);
    }

    if (!_.isArray(data) && !ExecutableHelper.IsNullOrEmpty(data)) {
        data = [data];
    }

    return builder.render(compile, { data: data });
};

//#endregion﻿"use strict";

function purl(existsUrl) {

    function urlParser() {

        this.parseUri = function (url) {

            var uri = { attr: {}, param: {} };
            var hashSeparated = '#';
            if (url.contains(hashSeparated)) {
                uri.attr['fragment'] = url.split(hashSeparated)[1].replace("!", "");

                var current = this;
                var fparams = {};
                $.each(uri.attr['fragment'].split('&'), function () {

                    var prefix = this.contains(":") ? this.split(':')[0] : 'root';
                    var fragmentQuery = this.contains("?") ? this.split('?')[1] : this;
                    fragmentQuery = fragmentQuery.replace(prefix + ':', '');

                    var paramsByPrefix = current.parseString(fragmentQuery, '/');
                    $.eachProperties(paramsByPrefix, function () {
                        var fullKey = "{0}__{1}".f(prefix, this);
                        fparams[fullKey] = paramsByPrefix[this];
                    });

                });
                uri.param['fragment'] = fparams;
            }
            else {
                uri.attr['fragment'] = '';
                uri.param['fragment'] = {};
            }

            if (url.split(hashSeparated)[0].contains('?')) {
                uri.param['query'] = this.parseString(url.split(hashSeparated)[0].split('?')[1], '&');
            }
            else {
                uri.param['query'] = {};
            }

            // compile a 'base' domain attribute            
            uri.attr['base'] = url.split("#")[0].split('?')[0];
            uri.attr['isWasHash'] = url.contains("#");
            uri.attr['fullBase'] = url.contains("#") ? url.split("#")[0] : url;

            return uri;
        };

        this.merge = function (parent, key, val) {
            this.set(parent.base, key, val);
            return parent;
        };

        this.parseString = function (str, charSplit) {
            var current = this;
            return this.reduce(String(str).split(charSplit), function (ret, pair) {
                try {
                    pair = ExecutableHelper.UrlDecode(pair.replace(/\+/g, ' '));
                }
                catch (e) {
                    // ignore
                }
                var eql = pair.indexOf('='),
                    brace = current.lastBraceInKey(pair),
                    key = pair.substr(0, brace || eql),
                    val = pair.substr(brace || eql, pair.length),
                    val = val.substr(val.indexOf('=') + 1, val.length);

                if ('' == key) {
                    key = pair, val = '';
                }

                return current.merge(ret, key, val);
            }, { base: {} }).base;
        };

        this.set = function (obj, key, val) {
            var v = obj[key];
            if (undefined === v) {
                obj[key] = val;
            }
        };

        this.lastBraceInKey = function (str) {
            var len = str.length,
                brace,
                c;
            for (var i = 0; i < len; ++i) {
                c = str[i];
                if (']' == c) {
                    brace = false;
                }
                if ('[' == c) {
                    brace = true;
                }
                if ('=' == c && !brace) {
                    return i;
                }
            }
        };

        this.reduce = function (obj, accumulator) {
            var i = 0,
                l = obj.length >> 0,
                curr = arguments[2];
            while (i < l) {
                if (i in obj) {
                    curr = accumulator.call(undefined, curr, obj[i], i, obj);
                }
                ++i;
            }
            return curr;
        };

    }

    return {
        data: new urlParser().parseUri(existsUrl),

        // get various attributes from the URI
        attr: function (attr) {
            attr = { 'anchor': 'fragment' }[attr] || attr;
            return typeof attr !== 'undefined' ? this.data.attr[attr] : this.data.attr;
        },

        // return query string parameters
        param: function (param) {
            return arguments.length != 0 ? ExecutableHelper.UrlDecode(this.data.param.query[param]) : this.data.param.query;
        },
        // return fragment parameters
        fparam: function (param, prefix) {

            if (arguments.length == 0) {
                return this.data.param.fragment;
            }
            var key = "{0}__{1}".f(prefix, param);
            return this.data.param.fragment.hasOwnProperty(key) ? ExecutableHelper.UrlDecode(this.data.param.fragment[key]) : '';
        },

        encodeAllParams: function () {
            var self = this;
            var params = self.fparam();
            $.eachProperties(params, function () {
                var key = this.split('__')[1];
                var prefix = this.split('__')[0];
                var value = params[this.toString()];
                self.setFparam(key, value, prefix);
            });
        },

        // set fragment parameters
        setFparam: function (param, value, prefix) {
            var fullParam = ExecutableHelper.IsNullOrEmpty(prefix) ? param : "{0}__{1}".f(prefix, param);
            return this.data.param.fragment[fullParam] = ExecutableHelper.UrlEncode(value);
        },

        // set fragment parameters
        setParam: function (param, value) {
            var encodeValue = ExecutableHelper.UrlEncode(value);
            if (ExecutableHelper.IsNullOrEmpty(encodeValue)) {
                delete this.data.param.query[param];
            }
            else {
                return this.data.param.query[param] = encodeValue;
            }
        },

        // set fragment parameters
        removeFparam: function (param, prefix) {
            var fullParam = "{0}__{1}".f(prefix, param);
            if (this.data.param.fragment.hasOwnProperty(fullParam)) {
                delete this.data.param.fragment[fullParam];
            }
        },

        // clear fragment parameters
        clearFparam: function () {
            return this.data.param.fragment = [];
        },

        fprefixes: function () {
            var uniquePrefixes = ['root'];
            $.eachProperties(this.fparam(), function () {
                var prefixKey = this.split('__')[0];
                if (uniquePrefixes.contains(prefixKey)) {
                    return true;
                }
                uniquePrefixes.push(prefixKey);
            });
            return uniquePrefixes;
        },

        furl: function (prefix) {

            var urls = { root: '' };

            $([this.data.attr['fragment']]).each(function () {
                if (this.contains(':')) {
                    var splitByPrefix = this.split(':');
                    urls[splitByPrefix[0]] = splitByPrefix[1];
                }
                else {
                    urls.root = this;
                }
            });

            var resultUrl = urls[prefix];
            if (_.isUndefined(resultUrl)) {
                return '';
            }
            return resultUrl.contains("?") ? resultUrl.split("?")[0] : '';
        },

        setFurl: function (value) {
            var clearValue = value.contains('?') ? value : value + "?";
            this.data.attr['fragment'] = clearValue;
        },

        toHref: function () {

            var current = this;

            var queryString = "?";
            $.eachProperties(current.param(), function (i) {
                queryString += "{0}{1}={2}".f(i === 0 ? '' : '&', this, ExecutableHelper.UrlEncode(current.param()[this]));
            });

            var hash = '#!';
            $.each(current.fprefixes(), function (indexPrefix) {
                hash += indexPrefix == 0 ? "" : "&";
                var currentPrefix = this;
                if (currentPrefix != 'root') {
                    hash += "{0}:".f(currentPrefix);
                }
                if (!ExecutableHelper.IsNullOrEmpty(current.furl(currentPrefix))) {
                    hash += current.furl(currentPrefix) + '?';
                }
                $.eachProperties(current.fparam(), function (i) {
                    var prefixKey = currentPrefix + "__";
                    if (!this.contains(prefixKey)) {
                        return true;
                    }

                    var clearKey = this.replace(prefixKey, '');
                    if (ExecutableHelper.IsNullOrEmpty(clearKey)) {
                        return true;
                    }
                    var isFirstParameter = ['?', '!', ':'].contains(hash.charAt(hash.length - 1));
                    hash += "{0}{1}={2}".f(isFirstParameter ? '' : "/", clearKey, ExecutableHelper.UrlEncode(current.fparam()[this]));

                });

            });

            queryString = queryString === '?' ? '' : queryString.trim();
            hash = hash === '#!' && current.data.attr["isWasHash"] ? '' : hash.trim();
            return current.data.attr['base'] + queryString + hash;

        }
    };

} /*!
 * Incoding framework v 1.0.252.1122
 * http://incframework.com
 *
 * Copyright 2013, 2013 Incoding software
 * Apache License
 * Version 2.0, January 2004
 * http://www.apache.org/licenses/ 
 */

"use strict";

if (!window.console) {
    window.console = {
        log: function () {
        },
        error: function () {

        },
        dir: function () {
        }
    };
}

document.setTitle = function (value) {
    document.title = value;
};

function InitGps() {
    if (navigator.geolocation && !navigator.geolocation.currentPosition) {
        navigator.geolocation.currentPosition = { longitude: 0, latitude: 0 };
        navigator.geolocation.getCurrentPosition(function (position) {
            navigator.geolocation.currentPosition = position.coords;
        }, function () {
        });
    }
}

$.extend(String.prototype, {
    replaceAll: function (find, replace) {
        return this.split(find).join(replace);
    },
    endWith: function (suffix) {
        return (this.substr(this.length - suffix.length) === suffix);
    },
    length : function() {
        return this.length;
    },
    toSelectorAsName: function () {
        var name = this;
        if (ExecutableHelper.IsNullOrEmpty(name)) {
            name = '';
        }
        return '[name="{0}"]'.f(name.toString()
            .replaceAll("[", "\\[")
            .replaceAll("]", "\\]"));
    },
    startsWith: function (prefix) {
        return (this.substr(0, prefix.length) === prefix);
    },
    trim: function () {
        return this.replace(/^\s\s*|\s\s*$/g, '');
    },
    ltrim: function () {
        return this.replace(/^\s+/, "");
    },
    rtrim: function () {
        return this.replace(/\s+$/, "");
    },
    cutLastChar: function () {
        return this.substring(0, this.length - 1);
    },
    contains: function (find) {
        return this.indexOf(find) !== -1;
    },
    f: function () {
        var s = this;
        var i = arguments.length;

        while (i--) {
            s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
        }

        return s;
    }
});

$.extend(Array.prototype, {
    contains: function (findValue) {
        return $.inArray(findValue, this) != -1;
    },
    remove: function (from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    },
    sum: function () {
        var sum = 0;
        $(this).each(function () {
            sum += parseFloat(this);
        });
        return sum;
    },
    max: function () {
        return this.length > 0 ? Math.max.apply(Math, this) : 0;
    },
    min: function () {
        return this.length > 0 ? Math.min.apply(Math, this) : 0;
    },
    average: function () {
        return this.length > 0 ? this.sum() / this.length : 0;
    },
    first: function () {
        return this.length > 0 ? this[0] : '';
    },
    last: function () {
        return this.length > 0 ? this[this.length - 1] : '';
    },
    count: function () {
        return this.length;
    },
    select: function (convert) {
        var res = [];
        $(this).each(function () {
            res.push(convert(this));
        });
        return res;
    }
});

function incodingExtend(child, parent) {
    var f = function () {
    };
    f.prototype = parent.prototype;
    child.prototype = new f();
    child.prototype.constructor = child;
    child.superclass = parent.prototype;
}

$.fn.extend({
    maxZIndex: function (opt) {
        var def = { inc: 10, group: "*" };
        $.extend(def, opt);
        var zMax = 0;
        $(def.group).each(function () {
            var cur = parseInt($(this).css('z-index'));
            zMax = cur > zMax ? cur : zMax;
        });

        return this.each(function () {
            zMax += def.inc;
            $(this).css({ "z-index": zMax });
        });
    },

    toggleProp: function (key) {
        if (this.prop(key)) {
            $(this).prop(key, false);
        }
        else {
            $(this).prop(key, true);
        }
        return this;
    },
    toggleAttr: function (key) {
        if (this.attr(key)) {
            $(this).removeAttr(key);
        }
        else {
            this.attr(key, key);
        }
        return this;
    },
    increment: function (step) {
        return $(this).each(function () {
            var val = parseInt($(this).val());
            $(this).val((_.isNaN(val) ? 0 : val) + parseInt(step));
        });
    },
    isFormElement: function () {
        return $(this).is('select,textarea,input');
    },

});

$.extend({
    eachProperties: function (ob, evaluated) {
        var i = 0;
        for (var property in ob) {
            var isValid = !_.isUndefined(property) || !_.isEmpty(property);
            if (isValid && ob.hasOwnProperty(property)) {
                evaluated.call(property, i);
            }
            i++;
        }
    },
    eachFormElements: function (ob, evaluated) {
        var inputTag = 'input,select,textarea';
        var ignoreInputType = '[type="submit"],[type="reset"],[type="button"]';
        var targets;
        if ($(ob).is('input,select')) {
            targets = ob.length > 1 ? ob : [ob];
        }
        else {
            var allInput = $(ob).find(inputTag).not(ignoreInputType);
            targets = allInput.length > 1 ? allInput : [allInput];
        }

        $(targets).each(function () {
            var name = $(this).prop('name');

            if (ExecutableHelper.IsNullOrEmpty(name)) {
                return;
            }

            var isElement = ob.length === 1 && ob.isFormElement();
            if (isElement) {
                evaluated.call(ob);
            }
            else {
                var byFind = ob.find(name.toSelectorAsName());
                evaluated.call(byFind.length !== 0 ? byFind : ob.filter(name.toSelectorAsName()));
            }
        });

    },
    url: function (url) {
        return purl(url);
    }
});

//#region  Jquery cookies

(function ($, document) {

    var pluses = /\+/g;

    function decoded(s) {
        return decodeURIComponent(s.replace(pluses, ' '));
    }

    var config = $.cookie = function (key, value, options) {

        // write
        if (value !== undefined) {
            options = $.extend({}, config.defaults, options);

            if (value === null) {
                options.expires = -1;
            }

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }

            value = config.json ? JSON.stringify(value) : String(value);

            return (document.cookie = [
                encodeURIComponent(key), '=', encodeURIComponent(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path ? '; path=' + options.path : '',
                options.domain ? '; domain=' + options.domain : '',
                options.secure ? '; secure' : ''
            ].join(''));
        }

        // read
        var decode = decoded;
        var cookies = document.cookie.split('; ');
        for (var i = 0, l = cookies.length; i < l; i++) {
            var parts = cookies[i].split('=');
            if (decode(parts.shift()) === key) {
                var cookie = decode(parts.join('='));
                return config.json ? JSON.parse(cookie) : cookie;
            }
        }

        return null;
    };

    config.defaults = {};

    $.removeCookie = function (key, options) {
        if ($.cookie(key) !== null) {
            $.cookie(key, null, options);
            return true;
        }
        return false;
    };

})(jQuery, document);

navigator.Ie8 = (function () {
    var N = navigator.appName, ua = navigator.userAgent, tem;
    var M = ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
    if (M && (tem = ua.match(/version\/([\.\d]+)/i)) != null) {
        M[2] = tem[1];
    }
    M = M ? [M[1], M[2]] : [N, navigator.appVersion, '-?'];
    return M.contains('MSIE') && M.contains('8.0');
})();

//#endregion﻿"use strict";

//#region class IncodingMetaElement

function IncodingMetaElement(element) {

    var keyIncodingRunner = 'incoding-runner';

    this.element = element;
    this.attr = $(element).attr('incoding');
    this.runner = $.data(element, keyIncodingRunner);
    this.getExecutables = function () {
        return JSON.parse(this.attr);
    };
    this.bind = function(eventName, status) {

        var strStatus = status.toString();
        var currentElement = this.element;
        if (strStatus !== '4') {
            for (var i = 0; i < IncSpecialBinds.DocumentBinds.length; i++) {
                var docBind = IncSpecialBinds.DocumentBinds[i];
                if (!eventName.contains(docBind)) {
                    continue;
                }
                eventName = eventName.replaceAll(docBind, ''); //remove document bind from element bind           
                $(document)
                    .bind(docBind.toString(),
                        function(e, result) { //docBind.toString() fixed for ie <10
                            new IncodingMetaElement(currentElement)
                                .invoke(e, result);
                            return false;
                        });
            }
        }

        if (eventName === "") {
            return;
        }

        $(currentElement)
            .bind(eventName.toString(),
                function(e, result) {

                    if (strStatus === '4' || eventName === IncSpecialBinds.Incoding) {
                        e.stopPropagation(); // if native js trigger
                        e.preventDefault(); // if native js trigger                
                    }

                    if (strStatus === '2') {
                        e.preventDefault();
                    }
                    if (strStatus === '3') {
                        e.stopPropagation();
                    }

                    new IncodingMetaElement(this)
                        .invoke(e, result);

                    return !(strStatus === '4' || eventName === IncSpecialBinds.Incoding);
                });
    };

    this.invoke = function (e, result) {
        if (!ExecutableHelper.IsNullOrEmpty(this.runner)) {
            this.runner.DoIt(e, result);
        }
    };

    this.flushRunner = function (runner) {
        $.data(this.element, keyIncodingRunner, runner);
    };

}

//#endregion

//#region class Runner

function IncodingRunner() {
    this.actions = [];
    this.before = [];
    this.success = [];
    this.error = [];
    this.complete = [];
    this.breakes = [];
}

IncodingRunner.prototype = {
    DoIt: function (event, result) {

        var current = this;

        var filterExecutableByEvent = function (executable) {
            var isHas = $.trim(executable.onBind).split(' ').contains(event.type);
            if (isHas) {
                executable.event = event;
                executable.resultOfEvent = result;
            }
            return isHas;
        };

        try {
            $($.grep(this.before, filterExecutableByEvent)).each(function () {
                this.execute();
            });
        }
        catch (ex) {
            if (ex instanceof IncClientException) {
                $($.grep(this.breakes, filterExecutableByEvent)).each(function () {
                    this.execute(ex);
                });
                return;
            }
            throw ex;
        }

        $($.grep(this.actions, filterExecutableByEvent)).each(function () {
            var currentAction = this;
            var filterExecutableByAction = function (executable) {
                if (executable.onBind !== currentAction.onBind) {
                    return false;
                }
                return filterExecutableByEvent(executable);
            };

            currentAction.execute({
                success: $.grep(current.success, filterExecutableByAction),
                error: $.grep(current.error, filterExecutableByAction),
                complete: $.grep(current.complete, filterExecutableByAction),
                breakes: $.grep(current.breakes, filterExecutableByAction),
            });
        });
    },

    Registry: function (metaType, onStatus, instance) {

        if (metaType.contains('Action')) {
            this.actions.push(instance);
        }
        else {

            switch (onStatus) {
                case 1:
                    this.before.push(instance);
                    break;
                case 2:
                    this.success.push(instance);
                    break;
                case 3:
                    this.error.push(instance);
                    break;
                case 4:
                    this.complete.push(instance);
                    break;
                case 5:
                    this.breakes.push(instance);
                    break;
                default:
                    throw 'Not found status {0}'.f(onStatus);
            }

        }
    }
};

//#endregion

//#region class IncClientException

function IncClientException() {
}

//#endregion

//#region class ParseServerResult

function IncodingResult(result) {

    var parse = function (json) {
        try {
            var res = _.isObject(json) ? json : $.parseJSON(json);
            var isSchemaValid = _.has(res, 'success') && _.has(res, 'data');
            if (!isSchemaValid) {
                throw new 'Not valid json result';
            }
            return res;
        }
        catch (e) {
            console.log('fail parse result:{0}'.f(json));
            console.log('with exception:{0}'.f(e));
            return '';
        }
    };

    this.parseJson = parse(result);

    this.isValid = function () {
        return !ExecutableHelper.IsNullOrEmpty(this.parseJson);
    };

    this.redirectTo = this.isValid() ? this.parseJson.redirectTo : '';

    this.success = this.isValid() ? this.parseJson.success : false;

    this.data = this.isValid() ? this.parseJson.data : '';
    

}

IncodingResult.Success = function (data) {
    return new IncodingResult({ success: true, data: data, redirectTo: '' });
};

IncodingResult.Empty = new IncodingResult({ data: '', redirectTo: '', success: true });

//#endregion

//#region class IncodingEngine

function IncodingEngine() {

    this.parse = function (context) {

        var incSelector = '[incoding]';
        var defferedInit = [];
        $(incSelector, context)
            .add($(context).is(incSelector) ? context : '')
            .each(function () {
                var incodingMetaElement = new IncodingMetaElement(this);

                var runner = new IncodingRunner();
                var wasAddBinds = [];

                $(incodingMetaElement.getExecutables()).each(function () {

                    var executableInstance = ExecutableFactory.Create(this.type, this.data, incodingMetaElement.element);
                    runner.Registry(this.type, this.data.onStatus, executableInstance);

                    var bindName = this.data.onBind.toString();
                    if (wasAddBinds.contains(bindName)) {
                        return true;
                    }

                    wasAddBinds.push(bindName);
                    incodingMetaElement.bind(bindName
                        .toString()
                        .replaceAll(IncSpecialBinds.InitIncoding, '')
                        .replaceAll(' ' + IncSpecialBinds.InitIncoding, '')
                        .replaceAll(IncSpecialBinds.InitIncoding + ' ', '')
                        .trim(), this.data.onEventStatus.toString());
                });
                incodingMetaElement.flushRunner(runner);
                $(this).removeAttr('incoding');

                var hasInitIncoding = $.grep(wasAddBinds, function (r) {
                    return r.contains(IncSpecialBinds.InitIncoding);
                }).length != 0;

                if (hasInitIncoding) {
                    incodingMetaElement.bind(IncSpecialBinds.InitIncoding, '4');
                    defferedInit.push(this);
                }

            });

        $(defferedInit).each(function () {
            new IncodingMetaElement(this).invoke(jQuery.Event(IncSpecialBinds.InitIncoding));
        });

    };

}

IncodingEngine.Current = new IncodingEngine();

var initializedHistoryPlugin = false;
$(document).ready(function () {

    LocalStorageFactory.Clear();
    if ($.history) {
        $.history.init(function () {
            if (initializedHistoryPlugin) {
                $(document).trigger(jQuery.Event(IncSpecialBinds.IncChangeUrl));
            }

            initializedHistoryPlugin = true;
        });
    }

    window.addEventListener('popstate', function (e) {
        $(document).trigger(IncSpecialBinds.IncChangeUrl);
    });

    IncodingEngine.Current.parse(document);
});

//#endregion﻿"use strict";

//#region class ExecutableFactory

function ExecutableFactory() {
}

// ReSharper disable UnusedParameter

ExecutableFactory.Create = function (type, data, self) {

    if (!document[type]) {
        document[type] = eval('new ' + type + '();');
    }
    return $.extend(false, document[type], {
        jsonData: data,
        onBind: data.onBind,
        self: $(self),
        timeOut: data.timeOut,
        interval: data.interval,
        intervalId: data.intervalId,
        ands: data.ands,
        target: data.target,
        getTarget: function () {
            if (ExecutableHelper.IsNullOrEmpty(data.target)) {
                return '';
            }
            if (data.target === "$(this.self)") {
                return this.self;
            }

            if (data.target.startsWith("||") && data.target.endWith("||")) {
                var selector = data.target.substring(2, data.target.length - 2).substring(data.target.indexOf('*') - 1, data.target.length);
                return $(selector);
            }
            else {
                return eval(data.target);
            }
        }
    });

};

// ReSharper restore UnusedParameter

//#endregion

//#region class ExecutableBase

function ExecutableBase() {
    this.name = '';
    this.jsonData = '';
    this.onBind = '';
    this.self = '';
    this.event = '';
    this.timeOut = 0;
    this.interval = 0;
    this.intervalId = '';
    this.target = '';
    this.ands = null;
    this.result = '';
    this.resultOfEvent = '';

}

ExecutableBase.prototype = {
    // ReSharper disable UnusedParameter
    execute: function (state) {

        var current = this;
        this.target = this.getTarget();

        if (!this.isValid()) {
            return;
        }

        var delayExecute = function () {
            current.target = current.getTarget();
            current.internalExecute(state);
        };
        if (this.timeOut > 0) {
            window.setTimeout(delayExecute, current.timeOut);
            return;
        }
        if (this.interval > 0) {
            ExecutableBase.IntervalIds[current.intervalId] = window.setInterval(delayExecute, current.interval);
            return;
        }

        this.internalExecute(state);
    },
    internalExecute: function (state) {
    },

    isValid: function () {

        var current = this;

        if (ExecutableHelper.IsNullOrEmpty(current.ands)) {
            return true;
        }

        var res = false;

        for (var i = 0; i < current.ands.length; i++) {
            var hasAny = false;

            for (var j = 0; j < current.ands[i].length; j++) {
                hasAny = ConditionalFactory.Create(current.ands[i][j], current).isSatisfied(current.result);
                if (!hasAny) {
                    break;
                }
            }

            if (hasAny) {
                res = true;
                break;
            }

        }

        return res;
    },

    tryGetVal: function (variable) {
        ExecutableHelper.Instance.self = this.self;
        ExecutableHelper.Instance.target = this.target;
        ExecutableHelper.Instance.event = this.event;
        ExecutableHelper.Instance.result = this.result;
        ExecutableHelper.Instance.resultOfEvent = this.resultOfEvent;
        return ExecutableHelper.Instance.TryGetVal(variable);
    }
};

ExecutableBase.IntervalIds = {};

//#endregion

//#region Actions

//#region class ExecutableActionBase extend from ExecutableBase

incodingExtend(ExecutableActionBase, ExecutableBase);

function ExecutableActionBase() {
}

$.extend(ExecutableActionBase.prototype, {
    complete: function (result, state) {

        if (!ExecutableHelper.IsNullOrEmpty(result.redirectTo)) {
            ExecutableHelper.RedirectTo(result.redirectTo);
            return;
        }

        var resultData = result.data;

        if (!ExecutableHelper.IsNullOrEmpty(this.jsonData.filterResult)) {

            var filter = ConditionalFactory.Create(this.jsonData.filterResult, this);
            resultData = ExecutableHelper.Filter(result.data, filter);
        }

        var hasBreak = false;
        var executeState = function (executable) {
            try {
                executable.result = resultData;
                executable.execute();
            }
            catch (e) {
                if (e instanceof IncClientException) {
                    hasBreak = true;
                    return false; //stop execute
                }

                console.log('Incoding exception: {0}'.f(e.message ? e.message : e));
                $(executable.self).trigger(jQuery.Event(IncSpecialBinds.IncGlobalError));                
                if (navigator.Ie8) {
                    return false; //stop execute
                }
                throw e;
            }
        };
        var mainStates = result.success ? state.success : state.error;
        for (var i = 0; i < mainStates.length; i++) {
            executeState(mainStates[i]);
        }

        for (var j = 0; j < state.complete.length; j++) {
            executeState(state.complete[j]);
        }
        if (hasBreak) {
            for (var k = 0; k < state.breakes.length; k++) {
                executeState(state.breakes[k]);
            }
        }
    }
});

//#endregion

//#region class ExecutableDirectAction extend from ExecutableBase

incodingExtend(ExecutableDirectAction, ExecutableActionBase);

function ExecutableDirectAction() {
}

ExecutableDirectAction.prototype.name = "Direct";
ExecutableDirectAction.prototype.internalExecute = function (state) {
    var result = ExecutableHelper.IsNullOrEmpty(this.jsonData.result) ? IncodingResult.Empty : new IncodingResult(this.jsonData.result);
    this.complete(result, state);
};

//#endregion

//#region class ExecutableEventAction extend from ExecutableBase

incodingExtend(ExecutableEventAction, ExecutableActionBase);

function ExecutableEventAction() {
}

ExecutableEventAction.prototype.name = "Event";
ExecutableEventAction.prototype.internalExecute = function (state) {
    this.complete(IncodingResult.Success(this.resultOfEvent), state);
};

//#endregion

//#region class ExecutableAjaxAction extend from ExecutableBase

incodingExtend(ExecutableAjaxAction, ExecutableActionBase);

function ExecutableAjaxAction() {
}

ExecutableAjaxAction.prototype.name = "Ajax";
ExecutableAjaxAction.prototype.internalExecute = function (state) {

    var current = this;

    var ajaxOptions = $.extend(true, { data: [] }, current.jsonData.ajax);
    var url = ajaxOptions.url;
    var isEmptyUrl = ExecutableHelper.IsNullOrEmpty(url);
    if (!isEmptyUrl) {
        var queryFromString = $.url(url).param();
        $.eachProperties(queryFromString, function () {
            ajaxOptions.data.push({ name: this, selector: current.tryGetVal(queryFromString[this]) });
        });
        ajaxOptions.url = url.split('?')[0];
    }
    if (current.jsonData.hash) {
        var href = $.url(document.location.href);
        if (isEmptyUrl || ExecutableHelper.IsNullOrEmpty(url.split('?')[0])) {
            ajaxOptions.url = href.furl(current.jsonData.prefix);
        }

        var fragmentParams = href.fparam();
        $.eachProperties(fragmentParams, function () {
            var name = this.replace(current.jsonData.prefix + '__', '');
            if (!ExecutableHelper.IsNullOrEmpty(name)) {
                ajaxOptions.data.push({ name: name, selector: fragmentParams[this] });
            }
        });

    }

    AjaxAdapter.Instance.request(ajaxOptions, function (result) {
        current.complete(result, state);
    }, current.self);

};

//#endregion

//#region class ExecutableSubmitAction extend from ExecutableBase

incodingExtend(ExecutableSubmitAction, ExecutableActionBase);

function ExecutableSubmitAction() {
}

ExecutableSubmitAction.prototype.name = "Submit";
ExecutableSubmitAction.prototype.internalExecute = function (state) {

    var current = this;
    var formSelector = eval(this.jsonData.formSelector);
    var form = $(formSelector).is('form') ? formSelector : $(formSelector).closest('form').first();

    var ajaxOptions = $.extend(true,
        {
            data : [],
            xhr : function() {
                var xhr = new window.XMLHttpRequest();
                xhr.addEventListener("progress",
                    function(evt) {
                        current.self.trigger(IncSpecialBinds.IncAjaxProgress);
                    },
                    false);
                return xhr;
            },
            error : function(error) {
                var incodingResult = new IncodingResult(error.responseText).data;    
                $(current.self)
                    .trigger(jQuery.Event(IncSpecialBinds.IncAjaxError),incodingResult)
                    .trigger(jQuery.Event(IncSpecialBinds.IncAjaxComplete),incodingResult);
            },
            success : function(responseText, statusText, xhr, $form) {
                $(document)
                    .trigger(jQuery.Event(IncSpecialBinds.IncAjaxSuccess),
                        IncodingResult.Success(IncAjaxEvent.Create(xhr)));
                $(document)
                    .trigger(jQuery.Event(IncSpecialBinds.IncAjaxComplete),
                        IncodingResult.Success(IncAjaxEvent.Create(xhr)));
                current.complete(new IncodingResult(responseText), state);
            },
            beforeSubmit : function(formData, jqForm, options) {
                var isValid = $(form).valid();
                if (!isValid) {
                    $(form).validate().focusInvalid();
                }
                else {
                    $(document).trigger(jQuery.Event(IncSpecialBinds.IncAjaxBefore), IncodingResult.Success({}));
                }
                return isValid;
            }
        },
        this.jsonData.options);

    var url = this.jsonData.options.url || form.attr('action');
    if (!ExecutableHelper.IsNullOrEmpty(url)) {
        var queryFromString = $.url(url).param();
        $.eachProperties(queryFromString, function () {
            ajaxOptions.data.push({ name: this, value: current.tryGetVal(queryFromString[this]) });
        });
        ajaxOptions.url = url.split('?')[0];
        if (ExecutableHelper.IsNullOrEmpty(ajaxOptions.url)) {
            delete ajaxOptions.url;
        }
    }

    $(form).ajaxSubmit(ajaxOptions);
};

//#endregion

//#region Core

//#region class ExecutableInsert extend from ExecutableBase

incodingExtend(ExecutableInsert, ExecutableBase);

function ExecutableInsert() {
}

// ReSharper disable UnusedLocals
// ReSharper disable AssignedValueIsNeverUsed
ExecutableInsert.prototype.name = "Insert";
ExecutableInsert.prototype.internalExecute = function () {

    var current = this;

    var insertContent = ExecutableHelper.IsNullOrEmpty(current.jsonData.result)
        ? ExecutableHelper.IsNullOrEmpty(this.result) ? '' : this.result
        : this.tryGetVal(current.jsonData.result);

    if (!ExecutableHelper.IsNullOrEmpty(current.jsonData.property)) {
        var insertObject = this.result;
        if (_.isArray(this.result)) {
            insertObject = this.result.length > 0 ? this.result[0] : {};
        }
        insertContent = insertObject.hasOwnProperty(current.jsonData.property) ? insertObject[current.jsonData.property] : '';
    }

    if (ExecutableHelper.ToBool(current.jsonData.prepare)) {
        $(_.isArray(insertContent) ? insertContent : [insertContent]).each(function () {
            var item = this;
            $.eachProperties(this, function () {
                item[this] = current.tryGetVal(item[this]);
            });
        });
    }

    if (!ExecutableHelper.IsNullOrEmpty(current.jsonData.template)) {
        var templateId = current.jsonData.template;
        if (templateId.startsWith("||ajax*")) {

            var json = templateId.substring(2, templateId.length - 2)
                .substring(templateId.indexOf('*') - 1, templateId.length);
            templateId = current.tryGetVal('||buildurl*{0}||'.f($.parseJSON(json).url));
        }
        insertContent = TemplateFactory.ToHtml(ExecutableInsert.Template, templateId, function () {
            return current.tryGetVal(current.jsonData.template);
        }, insertContent);
    }

    if (ExecutableHelper.IsNullOrEmpty(insertContent)) {
        insertContent = '';
    }

    // temporary fix for IE9 (random rows in table having td offset)
    // https://issues.jboss.org/browse/JBPM-4396
    if (jQuery.browser.msie && jQuery.browser.version === '9.0') {
        if (typeof insertContent === 'string' || insertContent instanceof String) {
            insertContent = insertContent.replace(/>\s+(?=<\/?(t|c)[hardfob])/gm, '>');
        }
    }

    switch (current.jsonData.insertType) {
        case 'html':
            current.target.html(insertContent.toString());
            break;
        default:
            eval("$(current.target).{0}(insertContent.toString())".f(current.jsonData.insertType));
    }
    var target = current.target;
    if (current.jsonData.insertType.toLowerCase() === 'after') {
        IncodingEngine.Current.parse(current.target.nextAll());
    }
    else if (current.jsonData.insertType.toLowerCase() === 'before') {
        IncodingEngine.Current.parse(current.target.prevAll());
    }
    else {
        IncodingEngine.Current.parse(current.target);
    }
    $(self).trigger(jQuery.Event(IncSpecialBinds.IncInsert));

};

ExecutableInsert.Template = new IncHandlerbarsTemplate();
// ReSharper restore AssignedValueIsNeverUsed
// ReSharper restore UnusedLocals

//#endregion

//#region class ExecutableTrigger extend from ExecutableBase

incodingExtend(ExecutableTrigger, ExecutableBase);

function ExecutableTrigger() {
}

ExecutableTrigger.prototype.name = 'Trigger';
ExecutableTrigger.prototype.internalExecute = function () {

    var eventData = ExecutableHelper.IsNullOrEmpty(this.jsonData.property)
        ? this.result
        : this.result.hasOwnProperty(this.jsonData.property) ? this.result[this.jsonData.property] : '';

    this.target.trigger(this.jsonData.trigger, [eventData]);
};

//#endregion

//#region class ExecutableValidationParse extend from ExecutableBase

incodingExtend(ExecutableValidationParse, ExecutableBase);

function ExecutableValidationParse() {
}

ExecutableValidationParse.prototype.name = "Validation parse";
ExecutableValidationParse.prototype.internalExecute = function () {

    var form = this.target.is('form') ? this.target : this.target.closest('form').first();
    $(form).removeData('validator').removeData('unobtrusiveValidation');
    $.validator.unobtrusive.parse(form);

    //bug in fluent validation. fixed for input
    $('[data-val-equalto-other]', form).each(function () {
        var equalTo = '#' + $(this).data('val-equalto-other').replaceAll('*.', 'Input_');
        if ($(equalTo).length > 0) {
            $(this).rules("add", { required: true, equalTo: equalTo });
        }
    });
};

//#endregion

//#region class ExecutableValidationRefresh extend from ExecutableBase

incodingExtend(ExecutableValidationRefresh, ExecutableBase);

function ExecutableValidationRefresh() {
}

ExecutableValidationRefresh.prototype.name = "Validation Refresh";
ExecutableValidationRefresh.prototype.internalExecute = function () {

    var inputErrorClass = 'input-validation-error';
    var messageErrorClass = 'field-validation-error';
    var messageValidClass = 'field-validation-valid';
    var attrSpan = 'data-valmsg-for';
    var result = ExecutableHelper.IsNullOrEmpty(this.result) ? [] : this.result;
    var isWasRefresh = false;
    for (var i = 0; i < result.length; i++) {
        var item = result[i];
        if (!item.hasOwnProperty('name') || !item.hasOwnProperty('isValid') || !item.hasOwnProperty('errorMessage')) {
            break;
        }
        if (!ExecutableHelper.IsNullOrEmpty(this.jsonData.prefix)) {
            item.name = "{0}.{1}".f(this.jsonData.prefix, item.name);
        }

        var input = $('[name]', this.target).filter(function () {
            return $(this).attr('name').toLowerCase() == item.name.toString().toLowerCase();
        });
        var span = $('[{0}]'.f(attrSpan), this.target).filter(function () {
            return $(this).attr(attrSpan).toLowerCase() == item.name.toString().toLowerCase();
        });

        if (ExecutableHelper.ToBool(item.isValid)) {
            $(input).removeClass(inputErrorClass);
            $(span).removeClass(messageErrorClass)
                .addClass(messageValidClass)
                .empty();
        }
        else {
            $(input).addClass(inputErrorClass);
            $(span).removeClass(messageValidClass)
                .addClass(messageErrorClass)
                .html($('<span/>')
                    .attr({ for: item.name, generated: true })
                    .html(item.errorMessage));
        }
        isWasRefresh = true;
    }

    if (!isWasRefresh) {
        this.target.find('.' + inputErrorClass).removeClass(inputErrorClass);
        $('[{0}]'.f(attrSpan), this.target).removeClass(messageErrorClass)
            .addClass(messageValidClass)
            .empty();
        this.target.find('.' + messageErrorClass).addClass(messageValidClass).removeClass(messageErrorClass).empty();
    }

    (this.target.is('form') ? this.target : $('form', this.target))
        .validate()
        .focusInvalid();
};

//#endregion

//#region class ExecutableEval extend from ExecutableBase

incodingExtend(ExecutableEval, ExecutableBase);

function ExecutableEval() {
}

ExecutableEval.prototype.name = "Eval";
ExecutableEval.prototype.internalExecute = function () {
    eval(this.jsonData.code);
};

//#endregion

//#region class ExecutableEvalMethod extend from ExecutableBase

incodingExtend(ExecutableEvalMethod, ExecutableBase);

function ExecutableEvalMethod() {
}

ExecutableEvalMethod.prototype.name = "Eval Method";
ExecutableEvalMethod.prototype.internalExecute = function () {

    var length = this.jsonData.args.length;

    var args = '';
    for (var i = 0; i < length; i++) {
        args += "this.tryGetVal(this.jsonData.args[{0}])".f(i);
        if (i != length - 1) {
            args += ',';
        }
    }

    var contextStr = ExecutableHelper.IsNullOrEmpty(this.jsonData.context) ? '' : this.jsonData.context + '.';
    eval("{0}{1}({2})".f(contextStr, this.jsonData.method, args));
};

//#endregion

//#region class ExecutableBreak extend from ExecutableBase

incodingExtend(ExecutableBreak, ExecutableBase);

function ExecutableBreak() {
}

ExecutableBreak.prototype.name = "Break";
ExecutableBreak.prototype.internalExecute = function () {
    throw new IncClientException();
};

//#endregion

//#region class ExecutableStoreInsert extend from ExecutableBase

incodingExtend(ExecutableStoreInsert, ExecutableBase);

function ExecutableStoreInsert() {
}

ExecutableStoreInsert.prototype.name = "Store Insert";
ExecutableStoreInsert.prototype.internalExecute = function () {

    var url = $.url(document.location.href);
    var prefix = this.jsonData.prefix;

    if (ExecutableHelper.ToBool(this.jsonData.replace)) {
        url.clearFparam();
    }

    var target = this.target;
    $.eachFormElements(target, function () {
        var name = $(this).prop('name');
        var value = ExecutableHelper.Instance.TryGetVal(this);

        if (ExecutableHelper.IsNullOrEmpty(value)) {
            url.removeFparam(name, prefix);
        }
        else {
            url.setFparam(name, value, prefix);
        }
    });

    ExecutableHelper.RedirectTo(url.toHref());
};

//#endregion

//#region class ExecutableStoreFetch extend from ExecutableBase

incodingExtend(ExecutableStoreFetch, ExecutableBase);

function ExecutableStoreFetch() {
}

ExecutableStoreFetch.prototype.name = "Store fetch";
ExecutableStoreFetch.prototype.internalExecute = function () {

    var prefix = '';
    var isHash = this.jsonData.type == 'hash';

    if (isHash) {
        prefix = this.jsonData.prefix + "__";
    }
    var params = [];
    if (isHash) {
        params = $.url(window.location.href).fparam();
    }
    else if (this.jsonData.type = 'queryString') {
        params = $.url(window.location.href).param();
    }

    $.eachFormElements(this.target, function () {
        var name = $(this).prop('name');
        var key = prefix + name;
        var value = '';
        if (params.hasOwnProperty(key)) {
            value = params[key];
        }
        ExecutableHelper.Instance.TrySetValue(this, value);
    });

};

//#endregion

//#region class ExecutableStoreManipulate extend from ExecutableBase

incodingExtend(ExecutableStoreManipulate, ExecutableBase);

function ExecutableStoreManipulate() {
}

ExecutableStoreManipulate.prototype.name = "Store Manipulate";
ExecutableStoreManipulate.prototype.internalExecute = function () {
    var current = this;
    switch (current.jsonData.type) {
        case 'hash':
            var url = $.url(document.location.href);
            url.encodeAllParams();

            var methods = $.parseJSON(current.jsonData.methods);
            $(methods).each(function () {
                switch (this.verb) {
                    case 'remove':
                        url.removeFparam(this.key, this.prefix);
                        break;
                    case 'set':
                        url.setFparam(this.key, current.tryGetVal(this.value), this.prefix);
                        break;
                }
            });

            return ExecutableHelper.RedirectTo(url.toHref());
        default:
            throw 'Argument out of range {0}'.f(this.jsonData.type);
    }
};

//#endregion

//#region class ExecutableForm extend from ExecutableBase

incodingExtend(ExecutableForm, ExecutableBase);

function ExecutableForm() {
}

ExecutableForm.prototype.name = "Form";
ExecutableForm.prototype.internalExecute = function () {
    var form = this.target.is('form') ? this.target : this.target.closest('form').first();

    var method = this.jsonData.method;
    switch (method) {
        case 'reset':
            $(form).resetForm();
            break;
        case 'clear':
            $(form).clearForm();
            break;
    }
};

//#endregion

//#region class ExecutableBind extend from ExecutableBase

incodingExtend(ExecutableBind, ExecutableBase);

function ExecutableBind() {
}

ExecutableBind.prototype.name = "Bind";
ExecutableBind.prototype.internalExecute = function () {
    var type = this.jsonData.type;
    switch (type) {
        case 'attach':
            this.target.removeData('incoding-runner')
                .attr('incoding', this.jsonData.meta);
            IncodingEngine.Current.parse(this.target);
            break;
        case 'detach':
            if (ExecutableHelper.IsNullOrEmpty(this.jsonData.bind)) {
                this.target.unbind();
            }
            else {
                this.target.unbind(this.jsonData.bind);
            }
            break;
    }
};

//#endregion

//#region class ExcutableJquery extend from ExecutableBase

incodingExtend(ExecutableJquery, ExecutableBase);

function ExecutableJquery() {
}

ExecutableJquery.prototype.name = "Jquery";
ExecutableJquery.prototype.internalExecute = function () {
    switch (this.jsonData.method) {
        case 1:
            this.target.addClass(ExecutableHelper.Instance.TryGetVal(this.jsonData.args[0]));
            break;
        case 2:
            this.target.removeClass(ExecutableHelper.Instance.TryGetVal(this.jsonData.args[0]));
            break;
        default:
            throw 'Not found method {0}'.f(this.jsonData.method);
    }
};

//#endregion﻿"use strict";

//#region class ConditionalFactory

function ConditionalFactory() {
}

// ReSharper disable UnusedParameter
ConditionalFactory.Create = function (data, executable) {
    if (!document[data.type]) {
        document[data.type] = eval('new ' + 'Conditional' + data.type + '();');
    }
    return $.extend(false, document[data.type], {
        jsonData: data,
        executable: executable
    });

};

// ReSharper restore UnusedParameter

//#endregion

//#region class ConditionalBase

function ConditionalBase() {
    this.jsonData = '';
    this.executable = '';
    this.self = '';
    this.target = '';
}

ConditionalBase.prototype =
    {
        isSatisfied: function (data) {
            this.self = this.executable.self;
            this.target = this.executable.getTarget();
            var isSatisfied = this.isInternalSatisfied(data);
            return ExecutableHelper.ToBool(this.jsonData.inverse) ? !isSatisfied : isSatisfied;
        },
        // ReSharper disable UnusedParameter
        isInternalSatisfied: function (data) {
            // ReSharper restore UnusedParameter            
        },
        tryGetVal: function (variable) {
            return this.executable.tryGetVal(variable);
        }
    };

//#endregion

//#region class ConditionalData  extend from ConditionalBase

incodingExtend(ConditionalData, ConditionalBase);

function ConditionalData() {
}

ConditionalData.prototype.isInternalSatisfied = function (data) {

    var expectedVal = this.tryGetVal(this.jsonData.value);
    var method = this.jsonData.method;

    return ExecutableHelper.IsData(data, this.jsonData.property, function () {
        return ExecutableHelper.Compare(this, expectedVal, method);
    });
};

//#endregion

//#region class ConditionalDataIsId extend from ConditionalBase

incodingExtend(ConditionalDataIsId, ConditionalBase);

function ConditionalDataIsId() {
}

ConditionalDataIsId.prototype.isInternalSatisfied = function (data) {
    return ExecutableHelper.IsData(data, this.jsonData.property, function () {
        return $('#' + this).length > 0;
    });
};

//#endregion

//#region class ConditionalEval extend from ConditionalBase

incodingExtend(ConditionalEval, ConditionalBase);

function ConditionalEval() {
}

// ReSharper disable UnusedParameter
ConditionalEval.prototype.isInternalSatisfied = function (data) {
    return eval(this.jsonData.code);
};
// ReSharper restore UnusedParameter

//#endregion

//#region class ConditionalIs extend from ConditionalBase

incodingExtend(ConditionalIs, ConditionalBase);

function ConditionalIs() {
}

// ReSharper disable UnusedParameter
ConditionalIs.prototype.isInternalSatisfied = function (data) {
    var left = this.tryGetVal(this.jsonData.left);
    var right = this.tryGetVal(this.jsonData.right);

    return ExecutableHelper.Compare(left, right, this.jsonData.method);
};
// ReSharper restore UnusedParameter

//#endregion
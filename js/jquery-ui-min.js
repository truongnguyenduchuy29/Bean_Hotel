/*! jQuery UI - v1.12.1 - 2017-01-24
 * http://jqueryui.com
 * Includes: widget.js, keycode.js, widgets/mouse.js, widgets/slider.js
 * Copyright jQuery Foundation and other contributors; Licensed MIT */

(function (t) {
    "function" == typeof define && define.amd ? define(["jquery"], t) : t(jQuery);
})(function (t) {
    (t.ui = t.ui || {}), (t.ui.version = "1.12.1");
    var e = 0,
        i = Array.prototype.slice;
    (t.cleanData = (function (e) {
        return function (i) {
            var s, n, o;
            for (o = 0; null != (n = i[o]); o++)
                try {
                    (s = t._data(n, "events")),
                        s && s.remove && t(n).triggerHandler("remove");
                } catch (a) { }
            e(i);
        };
    })(t.cleanData)),
        (t.widget = function (e, i, s) {
            var n,
                o,
                a,
                r = {},
                l = e.split(".")[0];
            e = e.split(".")[1];
            var h = l + "-" + e;
            return (
                s || ((s = i), (i = t.Widget)),
                t.isArray(s) && (s = t.extend.apply(null, [{}].concat(s))),
                (t.expr[":"][h.toLowerCase()] = function (e) {
                    return !!t.data(e, h);
                }),
                (t[l] = t[l] || {}),
                (n = t[l][e]),
                (o = t[l][e] =
                    function (t, e) {
                        return this._createWidget
                            ? (arguments.length && this._createWidget(t, e), void 0)
                            : new o(t, e);
                    }),
                t.extend(o, n, {
                    version: s.version,
                    _proto: t.extend({}, s),
                    _childConstructors: [],
                }),
                (a = new i()),
                (a.options = t.widget.extend({}, a.options)),
                t.each(s, function (e, s) {
                    return t.isFunction(s)
                        ? ((r[e] = (function () {
                            function t() {
                                return i.prototype[e].apply(this, arguments);
                            }
                            function n(t) {
                                return i.prototype[e].apply(this, t);
                            }
                            return function () {
                                var e,
                                    i = this._super,
                                    o = this._superApply;
                                return (
                                    (this._super = t),
                                    (this._superApply = n),
                                    (e = s.apply(this, arguments)),
                                    (this._super = i),
                                    (this._superApply = o),
                                    e
                                );
                            };
                        })()),
                            void 0)
                        : ((r[e] = s), void 0);
                }),
                (o.prototype = t.widget.extend(
                    a,
                    { widgetEventPrefix: n ? a.widgetEventPrefix || e : e },
                    r,
                    { constructor: o, namespace: l, widgetName: e, widgetFullName: h }
                )),
                n
                    ? (t.each(n._childConstructors, function (e, i) {
                        var s = i.prototype;
                        t.widget(s.namespace + "." + s.widgetName, o, i._proto);
                    }),
                        delete n._childConstructors)
                    : i._childConstructors.push(o),
                t.widget.bridge(e, o),
                o
            );
        }) 
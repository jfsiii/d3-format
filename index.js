(function() {
    !function() {
        var d3 = {
            version: "3.4.4"
        };
        function d3_class(ctor, properties) {
            try {
                for (var key in properties) {
                    Object.defineProperty(ctor.prototype, key, {
                        value: properties[key],
                        enumerable: false
                    });
                }
            } catch (e) {
                ctor.prototype = properties;
            }
        }
        d3.map = function(object) {
            var map = new d3_Map();
            if (object instanceof d3_Map) object.forEach(function(key, value) {
                map.set(key, value);
            }); else for (var key in object) map.set(key, object[key]);
            return map;
        };
        function d3_Map() {}
        d3_class(d3_Map, {
            has: d3_map_has,
            get: function(key) {
                return this[d3_map_prefix + key];
            },
            set: function(key, value) {
                return this[d3_map_prefix + key] = value;
            },
            remove: d3_map_remove,
            keys: d3_map_keys,
            values: function() {
                var values = [];
                this.forEach(function(key, value) {
                    values.push(value);
                });
                return values;
            },
            entries: function() {
                var entries = [];
                this.forEach(function(key, value) {
                    entries.push({
                        key: key,
                        value: value
                    });
                });
                return entries;
            },
            size: d3_map_size,
            empty: d3_map_empty,
            forEach: function(f) {
                for (var key in this) if (key.charCodeAt(0) === d3_map_prefixCode) f.call(this, key.substring(1), this[key]);
            }
        });
        var d3_map_prefix = "\x00", d3_map_prefixCode = d3_map_prefix.charCodeAt(0);
        function d3_map_has(key) {
            return d3_map_prefix + key in this;
        }
        function d3_map_remove(key) {
            key = d3_map_prefix + key;
            return key in this && delete this[key];
        }
        function d3_map_keys() {
            var keys = [];
            this.forEach(function(key) {
                keys.push(key);
            });
            return keys;
        }
        function d3_map_size() {
            var size = 0;
            for (var key in this) if (key.charCodeAt(0) === d3_map_prefixCode) ++size;
            return size;
        }
        function d3_map_empty() {
            for (var key in this) if (key.charCodeAt(0) === d3_map_prefixCode) return false;
            return true;
        }
        function d3_identity(d) {
            return d;
        }
        function d3_format_precision(x, p) {
            return p - (x ? Math.ceil(Math.log(x) / Math.LN10) : 1);
        }
        d3.round = function(x, n) {
            return n ? Math.round(x * (n = Math.pow(10, n))) / n : Math.round(x);
        };
        var abs = Math.abs;
        var d3_formatPrefixes = [ "y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y" ].map(d3_formatPrefix);
        d3.formatPrefix = function(value, precision) {
            var i = 0;
            if (value) {
                if (value < 0) value *= -1;
                if (precision) value = d3.round(value, d3_format_precision(value, precision));
                i = 1 + Math.floor(1e-12 + Math.log(value) / Math.LN10);
                i = Math.max(-24, Math.min(24, Math.floor((i - 1) / 3) * 3));
            }
            return d3_formatPrefixes[8 + i / 3];
        };
        function d3_formatPrefix(d, i) {
            var k = Math.pow(10, abs(8 - i) * 3);
            return {
                scale: i > 8 ? function(d) {
                    return d / k;
                } : function(d) {
                    return d * k;
                },
                symbol: d
            };
        }
        function d3_locale_numberFormat(locale) {
            var locale_decimal = locale.decimal, locale_thousands = locale.thousands, locale_grouping = locale.grouping, locale_currency = locale.currency, formatGroup = locale_grouping ? function(value) {
                var i = value.length, t = [], j = 0, g = locale_grouping[0];
                while (i > 0 && g > 0) {
                    t.push(value.substring(i -= g, i + g));
                    g = locale_grouping[j = (j + 1) % locale_grouping.length];
                }
                return t.reverse().join(locale_thousands);
            } : d3_identity;
            return function(specifier) {
                var match = d3_format_re.exec(specifier), fill = match[1] || " ", align = match[2] || ">", sign = match[3] || "", symbol = match[4] || "", zfill = match[5], width = +match[6], comma = match[7], precision = match[8], type = match[9], scale = 1, prefix = "", suffix = "", integer = false;
                if (precision) precision = +precision.substring(1);
                if (zfill || fill === "0" && align === "=") {
                    zfill = fill = "0";
                    align = "=";
                    if (comma) width -= Math.floor((width - 1) / 4);
                }
                switch (type) {
                  case "n":
                    comma = true;
                    type = "g";
                    break;

                  case "%":
                    scale = 100;
                    suffix = "%";
                    type = "f";
                    break;

                  case "p":
                    scale = 100;
                    suffix = "%";
                    type = "r";
                    break;

                  case "b":
                  case "o":
                  case "x":
                  case "X":
                    if (symbol === "#") prefix = "0" + type.toLowerCase();

                  case "c":
                  case "d":
                    integer = true;
                    precision = 0;
                    break;

                  case "s":
                    scale = -1;
                    type = "r";
                    break;
                }
                if (symbol === "$") prefix = locale_currency[0], suffix = locale_currency[1];
                if (type == "r" && !precision) type = "g";
                if (precision != null) {
                    if (type == "g") precision = Math.max(1, Math.min(21, precision)); else if (type == "e" || type == "f") precision = Math.max(0, Math.min(20, precision));
                }
                type = d3_format_types.get(type) || d3_format_typeDefault;
                var zcomma = zfill && comma;
                return function(value) {
                    var fullSuffix = suffix;
                    if (integer && value % 1) return "";
                    var negative = value < 0 || value === 0 && 1 / value < 0 ? (value = -value, "-") : sign;
                    if (scale < 0) {
                        var unit = d3.formatPrefix(value, precision);
                        value = unit.scale(value);
                        fullSuffix = unit.symbol + suffix;
                    } else {
                        value *= scale;
                    }
                    value = type(value, precision);
                    var i = value.lastIndexOf("."), before = i < 0 ? value : value.substring(0, i), after = i < 0 ? "" : locale_decimal + value.substring(i + 1);
                    if (!zfill && comma) before = formatGroup(before);
                    var length = prefix.length + before.length + after.length + (zcomma ? 0 : negative.length), padding = length < width ? new Array(length = width - length + 1).join(fill) : "";
                    if (zcomma) before = formatGroup(padding + before);
                    negative += prefix;
                    value = before + after;
                    return (align === "<" ? negative + value + padding : align === ">" ? padding + negative + value : align === "^" ? padding.substring(0, length >>= 1) + negative + value + padding.substring(length) : negative + (zcomma ? value : padding + value)) + fullSuffix;
                };
            };
        }
        var d3_format_re = /(?:([^{])?([<>=^]))?([+\- ])?([$#])?(0)?(\d+)?(,)?(\.-?\d+)?([a-z%])?/i;
        var d3_format_types = d3.map({
            b: function(x) {
                return x.toString(2);
            },
            c: function(x) {
                return String.fromCharCode(x);
            },
            o: function(x) {
                return x.toString(8);
            },
            x: function(x) {
                return x.toString(16);
            },
            X: function(x) {
                return x.toString(16).toUpperCase();
            },
            g: function(x, p) {
                return x.toPrecision(p);
            },
            e: function(x, p) {
                return x.toExponential(p);
            },
            f: function(x, p) {
                return x.toFixed(p);
            },
            r: function(x, p) {
                return (x = d3.round(x, d3_format_precision(x, p))).toFixed(Math.max(0, Math.min(20, d3_format_precision(x * (1 + 1e-15), p))));
            }
        });
        function d3_format_typeDefault(x) {
            return x + "";
        }
        d3.requote = function(s) {
            return s.replace(d3_requote_re, "\\$&");
        };
        var d3_requote_re = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;
        var d3_time = d3.time = {}, d3_date = Date;
        function d3_date_utc() {
            this._ = new Date(arguments.length > 1 ? Date.UTC.apply(this, arguments) : arguments[0]);
        }
        d3_date_utc.prototype = {
            getDate: function() {
                return this._.getUTCDate();
            },
            getDay: function() {
                return this._.getUTCDay();
            },
            getFullYear: function() {
                return this._.getUTCFullYear();
            },
            getHours: function() {
                return this._.getUTCHours();
            },
            getMilliseconds: function() {
                return this._.getUTCMilliseconds();
            },
            getMinutes: function() {
                return this._.getUTCMinutes();
            },
            getMonth: function() {
                return this._.getUTCMonth();
            },
            getSeconds: function() {
                return this._.getUTCSeconds();
            },
            getTime: function() {
                return this._.getTime();
            },
            getTimezoneOffset: function() {
                return 0;
            },
            valueOf: function() {
                return this._.valueOf();
            },
            setDate: function() {
                d3_time_prototype.setUTCDate.apply(this._, arguments);
            },
            setDay: function() {
                d3_time_prototype.setUTCDay.apply(this._, arguments);
            },
            setFullYear: function() {
                d3_time_prototype.setUTCFullYear.apply(this._, arguments);
            },
            setHours: function() {
                d3_time_prototype.setUTCHours.apply(this._, arguments);
            },
            setMilliseconds: function() {
                d3_time_prototype.setUTCMilliseconds.apply(this._, arguments);
            },
            setMinutes: function() {
                d3_time_prototype.setUTCMinutes.apply(this._, arguments);
            },
            setMonth: function() {
                d3_time_prototype.setUTCMonth.apply(this._, arguments);
            },
            setSeconds: function() {
                d3_time_prototype.setUTCSeconds.apply(this._, arguments);
            },
            setTime: function() {
                d3_time_prototype.setTime.apply(this._, arguments);
            }
        };
        var d3_time_prototype = Date.prototype;
        function d3_time_interval(local, step, number) {
            function round(date) {
                var d0 = local(date), d1 = offset(d0, 1);
                return date - d0 < d1 - date ? d0 : d1;
            }
            function ceil(date) {
                step(date = local(new d3_date(date - 1)), 1);
                return date;
            }
            function offset(date, k) {
                step(date = new d3_date(+date), k);
                return date;
            }
            function range(t0, t1, dt) {
                var time = ceil(t0), times = [];
                if (dt > 1) {
                    while (time < t1) {
                        if (!(number(time) % dt)) times.push(new Date(+time));
                        step(time, 1);
                    }
                } else {
                    while (time < t1) times.push(new Date(+time)), step(time, 1);
                }
                return times;
            }
            function range_utc(t0, t1, dt) {
                try {
                    d3_date = d3_date_utc;
                    var utc = new d3_date_utc();
                    utc._ = t0;
                    return range(utc, t1, dt);
                } finally {
                    d3_date = Date;
                }
            }
            local.floor = local;
            local.round = round;
            local.ceil = ceil;
            local.offset = offset;
            local.range = range;
            var utc = local.utc = d3_time_interval_utc(local);
            utc.floor = utc;
            utc.round = d3_time_interval_utc(round);
            utc.ceil = d3_time_interval_utc(ceil);
            utc.offset = d3_time_interval_utc(offset);
            utc.range = range_utc;
            return local;
        }
        function d3_time_interval_utc(method) {
            return function(date, k) {
                try {
                    d3_date = d3_date_utc;
                    var utc = new d3_date_utc();
                    utc._ = date;
                    return method(utc, k)._;
                } finally {
                    d3_date = Date;
                }
            };
        }
        d3_time.year = d3_time_interval(function(date) {
            date = d3_time.day(date);
            date.setMonth(0, 1);
            return date;
        }, function(date, offset) {
            date.setFullYear(date.getFullYear() + offset);
        }, function(date) {
            return date.getFullYear();
        });
        d3_time.years = d3_time.year.range;
        d3_time.years.utc = d3_time.year.utc.range;
        d3_time.day = d3_time_interval(function(date) {
            var day = new d3_date(2e3, 0);
            day.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
            return day;
        }, function(date, offset) {
            date.setDate(date.getDate() + offset);
        }, function(date) {
            return date.getDate() - 1;
        });
        d3_time.days = d3_time.day.range;
        d3_time.days.utc = d3_time.day.utc.range;
        d3_time.dayOfYear = function(date) {
            var year = d3_time.year(date);
            return Math.floor((date - year - (date.getTimezoneOffset() - year.getTimezoneOffset()) * 6e4) / 864e5);
        };
        [ "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday" ].forEach(function(day, i) {
            i = 7 - i;
            var interval = d3_time[day] = d3_time_interval(function(date) {
                (date = d3_time.day(date)).setDate(date.getDate() - (date.getDay() + i) % 7);
                return date;
            }, function(date, offset) {
                date.setDate(date.getDate() + Math.floor(offset) * 7);
            }, function(date) {
                var day = d3_time.year(date).getDay();
                return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7) - (day !== i);
            });
            d3_time[day + "s"] = interval.range;
            d3_time[day + "s"].utc = interval.utc.range;
            d3_time[day + "OfYear"] = function(date) {
                var day = d3_time.year(date).getDay();
                return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7);
            };
        });
        d3_time.week = d3_time.sunday;
        d3_time.weeks = d3_time.sunday.range;
        d3_time.weeks.utc = d3_time.sunday.utc.range;
        d3_time.weekOfYear = d3_time.sundayOfYear;
        function d3_locale_timeFormat(locale) {
            var locale_dateTime = locale.dateTime, locale_date = locale.date, locale_time = locale.time, locale_periods = locale.periods, locale_days = locale.days, locale_shortDays = locale.shortDays, locale_months = locale.months, locale_shortMonths = locale.shortMonths;
            function d3_time_format(template) {
                var n = template.length;
                function format(date) {
                    var string = [], i = -1, j = 0, c, p, f;
                    while (++i < n) {
                        if (template.charCodeAt(i) === 37) {
                            string.push(template.substring(j, i));
                            if ((p = d3_time_formatPads[c = template.charAt(++i)]) != null) c = template.charAt(++i);
                            if (f = d3_time_formats[c]) c = f(date, p == null ? c === "e" ? " " : "0" : p);
                            string.push(c);
                            j = i + 1;
                        }
                    }
                    string.push(template.substring(j, i));
                    return string.join("");
                }
                format.parse = function(string) {
                    var d = {
                        y: 1900,
                        m: 0,
                        d: 1,
                        H: 0,
                        M: 0,
                        S: 0,
                        L: 0,
                        Z: null
                    }, i = d3_time_parse(d, template, string, 0);
                    if (i != string.length) return null;
                    if ("p" in d) d.H = d.H % 12 + d.p * 12;
                    var localZ = d.Z != null && d3_date !== d3_date_utc, date = new (localZ ? d3_date_utc : d3_date)();
                    if ("j" in d) date.setFullYear(d.y, 0, d.j); else if ("w" in d && ("W" in d || "U" in d)) {
                        date.setFullYear(d.y, 0, 1);
                        date.setFullYear(d.y, 0, "W" in d ? (d.w + 6) % 7 + d.W * 7 - (date.getDay() + 5) % 7 : d.w + d.U * 7 - (date.getDay() + 6) % 7);
                    } else date.setFullYear(d.y, d.m, d.d);
                    date.setHours(d.H + Math.floor(d.Z / 100), d.M + d.Z % 100, d.S, d.L);
                    return localZ ? date._ : date;
                };
                format.toString = function() {
                    return template;
                };
                return format;
            }
            function d3_time_parse(date, template, string, j) {
                var c, p, t, i = 0, n = template.length, m = string.length;
                while (i < n) {
                    if (j >= m) return -1;
                    c = template.charCodeAt(i++);
                    if (c === 37) {
                        t = template.charAt(i++);
                        p = d3_time_parsers[t in d3_time_formatPads ? template.charAt(i++) : t];
                        if (!p || (j = p(date, string, j)) < 0) return -1;
                    } else if (c != string.charCodeAt(j++)) {
                        return -1;
                    }
                }
                return j;
            }
            d3_time_format.utc = function(template) {
                var local = d3_time_format(template);
                function format(date) {
                    try {
                        d3_date = d3_date_utc;
                        var utc = new d3_date();
                        utc._ = date;
                        return local(utc);
                    } finally {
                        d3_date = Date;
                    }
                }
                format.parse = function(string) {
                    try {
                        d3_date = d3_date_utc;
                        var date = local.parse(string);
                        return date && date._;
                    } finally {
                        d3_date = Date;
                    }
                };
                format.toString = local.toString;
                return format;
            };
            d3_time_format.multi = d3_time_format.utc.multi = d3_time_formatMulti;
            var d3_time_periodLookup = d3.map(), d3_time_dayRe = d3_time_formatRe(locale_days), d3_time_dayLookup = d3_time_formatLookup(locale_days), d3_time_dayAbbrevRe = d3_time_formatRe(locale_shortDays), d3_time_dayAbbrevLookup = d3_time_formatLookup(locale_shortDays), d3_time_monthRe = d3_time_formatRe(locale_months), d3_time_monthLookup = d3_time_formatLookup(locale_months), d3_time_monthAbbrevRe = d3_time_formatRe(locale_shortMonths), d3_time_monthAbbrevLookup = d3_time_formatLookup(locale_shortMonths);
            locale_periods.forEach(function(p, i) {
                d3_time_periodLookup.set(p.toLowerCase(), i);
            });
            var d3_time_formats = {
                a: function(d) {
                    return locale_shortDays[d.getDay()];
                },
                A: function(d) {
                    return locale_days[d.getDay()];
                },
                b: function(d) {
                    return locale_shortMonths[d.getMonth()];
                },
                B: function(d) {
                    return locale_months[d.getMonth()];
                },
                c: d3_time_format(locale_dateTime),
                d: function(d, p) {
                    return d3_time_formatPad(d.getDate(), p, 2);
                },
                e: function(d, p) {
                    return d3_time_formatPad(d.getDate(), p, 2);
                },
                H: function(d, p) {
                    return d3_time_formatPad(d.getHours(), p, 2);
                },
                I: function(d, p) {
                    return d3_time_formatPad(d.getHours() % 12 || 12, p, 2);
                },
                j: function(d, p) {
                    return d3_time_formatPad(1 + d3_time.dayOfYear(d), p, 3);
                },
                L: function(d, p) {
                    return d3_time_formatPad(d.getMilliseconds(), p, 3);
                },
                m: function(d, p) {
                    return d3_time_formatPad(d.getMonth() + 1, p, 2);
                },
                M: function(d, p) {
                    return d3_time_formatPad(d.getMinutes(), p, 2);
                },
                p: function(d) {
                    return locale_periods[+(d.getHours() >= 12)];
                },
                S: function(d, p) {
                    return d3_time_formatPad(d.getSeconds(), p, 2);
                },
                U: function(d, p) {
                    return d3_time_formatPad(d3_time.sundayOfYear(d), p, 2);
                },
                w: function(d) {
                    return d.getDay();
                },
                W: function(d, p) {
                    return d3_time_formatPad(d3_time.mondayOfYear(d), p, 2);
                },
                x: d3_time_format(locale_date),
                X: d3_time_format(locale_time),
                y: function(d, p) {
                    return d3_time_formatPad(d.getFullYear() % 100, p, 2);
                },
                Y: function(d, p) {
                    return d3_time_formatPad(d.getFullYear() % 1e4, p, 4);
                },
                Z: d3_time_zone,
                "%": function() {
                    return "%";
                }
            };
            var d3_time_parsers = {
                a: d3_time_parseWeekdayAbbrev,
                A: d3_time_parseWeekday,
                b: d3_time_parseMonthAbbrev,
                B: d3_time_parseMonth,
                c: d3_time_parseLocaleFull,
                d: d3_time_parseDay,
                e: d3_time_parseDay,
                H: d3_time_parseHour24,
                I: d3_time_parseHour24,
                j: d3_time_parseDayOfYear,
                L: d3_time_parseMilliseconds,
                m: d3_time_parseMonthNumber,
                M: d3_time_parseMinutes,
                p: d3_time_parseAmPm,
                S: d3_time_parseSeconds,
                U: d3_time_parseWeekNumberSunday,
                w: d3_time_parseWeekdayNumber,
                W: d3_time_parseWeekNumberMonday,
                x: d3_time_parseLocaleDate,
                X: d3_time_parseLocaleTime,
                y: d3_time_parseYear,
                Y: d3_time_parseFullYear,
                Z: d3_time_parseZone,
                "%": d3_time_parseLiteralPercent
            };
            function d3_time_parseWeekdayAbbrev(date, string, i) {
                d3_time_dayAbbrevRe.lastIndex = 0;
                var n = d3_time_dayAbbrevRe.exec(string.substring(i));
                return n ? (date.w = d3_time_dayAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
            }
            function d3_time_parseWeekday(date, string, i) {
                d3_time_dayRe.lastIndex = 0;
                var n = d3_time_dayRe.exec(string.substring(i));
                return n ? (date.w = d3_time_dayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
            }
            function d3_time_parseMonthAbbrev(date, string, i) {
                d3_time_monthAbbrevRe.lastIndex = 0;
                var n = d3_time_monthAbbrevRe.exec(string.substring(i));
                return n ? (date.m = d3_time_monthAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
            }
            function d3_time_parseMonth(date, string, i) {
                d3_time_monthRe.lastIndex = 0;
                var n = d3_time_monthRe.exec(string.substring(i));
                return n ? (date.m = d3_time_monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
            }
            function d3_time_parseLocaleFull(date, string, i) {
                return d3_time_parse(date, d3_time_formats.c.toString(), string, i);
            }
            function d3_time_parseLocaleDate(date, string, i) {
                return d3_time_parse(date, d3_time_formats.x.toString(), string, i);
            }
            function d3_time_parseLocaleTime(date, string, i) {
                return d3_time_parse(date, d3_time_formats.X.toString(), string, i);
            }
            function d3_time_parseAmPm(date, string, i) {
                var n = d3_time_periodLookup.get(string.substring(i, i += 2).toLowerCase());
                return n == null ? -1 : (date.p = n, i);
            }
            return d3_time_format;
        }
        var d3_time_formatPads = {
            "-": "",
            _: " ",
            "0": "0"
        }, d3_time_numberRe = /^\s*\d+/, d3_time_percentRe = /^%/;
        function d3_time_formatPad(value, fill, width) {
            var sign = value < 0 ? "-" : "", string = (sign ? -value : value) + "", length = string.length;
            return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
        }
        function d3_time_formatRe(names) {
            return new RegExp("^(?:" + names.map(d3.requote).join("|") + ")", "i");
        }
        function d3_time_formatLookup(names) {
            var map = new d3_Map(), i = -1, n = names.length;
            while (++i < n) map.set(names[i].toLowerCase(), i);
            return map;
        }
        function d3_time_parseWeekdayNumber(date, string, i) {
            d3_time_numberRe.lastIndex = 0;
            var n = d3_time_numberRe.exec(string.substring(i, i + 1));
            return n ? (date.w = +n[0], i + n[0].length) : -1;
        }
        function d3_time_parseWeekNumberSunday(date, string, i) {
            d3_time_numberRe.lastIndex = 0;
            var n = d3_time_numberRe.exec(string.substring(i));
            return n ? (date.U = +n[0], i + n[0].length) : -1;
        }
        function d3_time_parseWeekNumberMonday(date, string, i) {
            d3_time_numberRe.lastIndex = 0;
            var n = d3_time_numberRe.exec(string.substring(i));
            return n ? (date.W = +n[0], i + n[0].length) : -1;
        }
        function d3_time_parseFullYear(date, string, i) {
            d3_time_numberRe.lastIndex = 0;
            var n = d3_time_numberRe.exec(string.substring(i, i + 4));
            return n ? (date.y = +n[0], i + n[0].length) : -1;
        }
        function d3_time_parseYear(date, string, i) {
            d3_time_numberRe.lastIndex = 0;
            var n = d3_time_numberRe.exec(string.substring(i, i + 2));
            return n ? (date.y = d3_time_expandYear(+n[0]), i + n[0].length) : -1;
        }
        function d3_time_parseZone(date, string, i) {
            return /^[+-]\d{4}$/.test(string = string.substring(i, i + 5)) ? (date.Z = +string, 
            i + 5) : -1;
        }
        function d3_time_expandYear(d) {
            return d + (d > 68 ? 1900 : 2e3);
        }
        function d3_time_parseMonthNumber(date, string, i) {
            d3_time_numberRe.lastIndex = 0;
            var n = d3_time_numberRe.exec(string.substring(i, i + 2));
            return n ? (date.m = n[0] - 1, i + n[0].length) : -1;
        }
        function d3_time_parseDay(date, string, i) {
            d3_time_numberRe.lastIndex = 0;
            var n = d3_time_numberRe.exec(string.substring(i, i + 2));
            return n ? (date.d = +n[0], i + n[0].length) : -1;
        }
        function d3_time_parseDayOfYear(date, string, i) {
            d3_time_numberRe.lastIndex = 0;
            var n = d3_time_numberRe.exec(string.substring(i, i + 3));
            return n ? (date.j = +n[0], i + n[0].length) : -1;
        }
        function d3_time_parseHour24(date, string, i) {
            d3_time_numberRe.lastIndex = 0;
            var n = d3_time_numberRe.exec(string.substring(i, i + 2));
            return n ? (date.H = +n[0], i + n[0].length) : -1;
        }
        function d3_time_parseMinutes(date, string, i) {
            d3_time_numberRe.lastIndex = 0;
            var n = d3_time_numberRe.exec(string.substring(i, i + 2));
            return n ? (date.M = +n[0], i + n[0].length) : -1;
        }
        function d3_time_parseSeconds(date, string, i) {
            d3_time_numberRe.lastIndex = 0;
            var n = d3_time_numberRe.exec(string.substring(i, i + 2));
            return n ? (date.S = +n[0], i + n[0].length) : -1;
        }
        function d3_time_parseMilliseconds(date, string, i) {
            d3_time_numberRe.lastIndex = 0;
            var n = d3_time_numberRe.exec(string.substring(i, i + 3));
            return n ? (date.L = +n[0], i + n[0].length) : -1;
        }
        function d3_time_zone(d) {
            var z = d.getTimezoneOffset(), zs = z > 0 ? "-" : "+", zh = ~~(abs(z) / 60), zm = abs(z) % 60;
            return zs + d3_time_formatPad(zh, "0", 2) + d3_time_formatPad(zm, "0", 2);
        }
        function d3_time_parseLiteralPercent(date, string, i) {
            d3_time_percentRe.lastIndex = 0;
            var n = d3_time_percentRe.exec(string.substring(i, i + 1));
            return n ? i + n[0].length : -1;
        }
        function d3_time_formatMulti(formats) {
            var n = formats.length, i = -1;
            while (++i < n) formats[i][0] = this(formats[i][0]);
            return function(date) {
                var i = 0, f = formats[i];
                while (!f[1](date)) f = formats[++i];
                return f[0](date);
            };
        }
        d3.locale = function(locale) {
            return {
                numberFormat: d3_locale_numberFormat(locale),
                timeFormat: d3_locale_timeFormat(locale)
            };
        };
        var d3_locale_enUS = d3.locale({
            decimal: ".",
            thousands: ",",
            grouping: [ 3 ],
            currency: [ "$", "" ],
            dateTime: "%a %b %e %X %Y",
            date: "%m/%d/%Y",
            time: "%H:%M:%S",
            periods: [ "AM", "PM" ],
            days: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
            shortDays: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
            months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
            shortMonths: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
        });
        d3.format = d3_locale_enUS.numberFormat;
        if (typeof define === "function" && define.amd) {
            define(d3);
        } else if (typeof module === "object" && module.exports) {
            module.exports = d3;
        } else {
            this.d3 = d3;
        }
    }();
})();
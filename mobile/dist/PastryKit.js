const PKSupportsTouches = ("createTouch" in document);
const PKStartEvent = PKSupportsTouches ? "touchstart" : "mousedown";
const PKMoveEvent = PKSupportsTouches ? "touchmove" : "mousemove";
const PKEndEvent = PKSupportsTouches ? "touchend" : "mouseup";

function PKUtils() {}
PKUtils.assetsPath = "";
PKUtils.t = function (b, a) {
    return "translate3d(" + b + "px, " + a + "px, 0)";
};
PKUtils.px = function (a) {
    return a + "px";
};
PKUtils.degreesToRadians = function (a) {
    return (a / 360) * (Math.PI * 2);
};
PKUtils.radiansToDegrees = function (a) {
    return (a / (Math.PI * 2)) * 360;
};
PKUtils.copyPropertiesFromSourceToTarget = function (c, b) {
    for (var a in c) {
        b[a] = c[a];
    }
};
PKUtils.objectIsFunction = function (a) {
    return (typeof a == "function");
};
PKUtils.objectIsUndefined = function (a) {
    return (a === undefined);
};
PKUtils.objectIsString = function (a) {
    return (typeof a == "string" || a instanceof String);
};
PKUtils.objectIsArray = function (a) {
    return (a instanceof Array);
};
PKUtils.objectHasMethod = function (b, a) {
    return (b !== null && !this.objectIsUndefined(b[a]) && this.objectIsFunction(b[a]));
};
PKUtils.disableScrolling = function (a) {
    a.stopPropagation();
    window.addEventListener("touchmove", PKUtils.preventEventDefault, true);
    window.addEventListener("touchend", PKUtils.restoreScrollingBehavior, true);
    window.addEventListener("touchcancel", PKUtils.restoreScrollingBehavior, true);
};
PKUtils.preventEventDefault = function (a) {
    a.preventDefault();
};
PKUtils.restoreScrolling = function () {
    window.removeEventListener("touchmove", PKUtils.preventEventDefault, true);
    window.removeEventListener("touchend", PKUtils.restoreScrollingBehavior, true);
    window.removeEventListener("touchcancel", PKUtils.restoreScrollingBehavior, true);
};
PKUtils.createUIEvent = function (a, b) {
    return PKSupportsTouches ? this.createEventWithTouch(a, b) : this.createEventWithMouse(a, b);
};
PKUtils.createEventWithTouch = function (c, a) {
    var b = document.createEvent("TouchEvent");
    b.initTouchEvent(c, a.bubbles, a.cancelable, window, a.detail, a.screenX, a.screenY, a.clientX, a.clientY, a.ctrlKey, a.altKey, a.shiftKey, a.metaKey, a.touches, a.targetTouches, a.changedTouches, a.scale, a.rotation);
    return b;
};
PKUtils.createEventWithMouse = function (a, b) {
    var c = document.createEvent("MouseEvent");
    c.initMouseEvent(a, b.bubbles, b.cancelable, document.defaultView, b.detail, b.screenX, b.screenY, b.clientX, b.clientY, b.ctrlKey, b.altKey, b.shiftKey, b.metaKey, b.metaKey, b.button, b.relatedTarget);
    return c;
};
PKUtils.init = function () {
    for (var b = 0; b < document.styleSheets.length; b++) {
        var c = document.styleSheets[b];
        var a = c.href ? c.href.indexOf("dist/PastryKit") : -1;
        if (a != -1) {
            PKUtils.assetsPath = c.href.substring(0, a) + "assets/";
            break;
        }
    }
};
PKUtils.preloadImageAsset = function (a) {
    new Image().src = PKUtils.assetsPath + a;
};
PKUtils.setupDisplayNames = function (a, d) {
    var c = d || a.name;
    for (var e in a) {
        if (a.__lookupGetter__(e)) {
            continue;
        }
        var b = a[e];
        if (PKUtils.objectIsFunction(b)) {
            b.displayName = PKUtils.createDisplayName(c, e);
        }
    }
    for (var e in a.prototype) {
        if (a.prototype.__lookupGetter__(e)) {
            continue;
        }
        var b = a.prototype[e];
        if (PKUtils.objectIsFunction(b)) {
            b.displayName = PKUtils.createDisplayName(c, e);
        }
    }
};
PKUtils.createDisplayName = function (b, a) {
    return b + "." + a + "()";
};
window.addEventListener("load", PKUtils.init, false);
PKUtils.setupDisplayNames(PKUtils, "PKUtils");
var PKEventTriage = {};
PKEventTriage.handleEvent = function (b) {
    if (this instanceof PKObject) {
        this.callSuper(b);
    }
    var c = b.type;
    var a = "handle" + c.charAt(0).toUpperCase() + c.substr(1);
    if (PKUtils.objectHasMethod(this, a)) {
        this[a](b);
    }
};
PKUtils.setupDisplayNames(PKEventTriage, "PKEventTriage");
var PKPropertyTriage = {};
PKPropertyTriage.handlePropertyChange = function (b, c) {
    var a = "handle" + c.charAt(0).toUpperCase() + c.substr(1) + "Change";
    if (PKUtils.objectHasMethod(this, a)) {
        this[a](b);
    }
};
PKUtils.setupDisplayNames(PKPropertyTriage, "PKPropertyTriage");
Element.prototype.hasClassName = function (a) {
    return new RegExp("(?:^|\\s+)" + a + "(?:\\s+|$)").test(this.className);
};
Element.prototype.addClassName = function (a) {
    if (!this.hasClassName(a)) {
        this.className = [this.className, a].join(" ");
    }
};
Element.prototype.removeClassName = function (b) {
    if (this.hasClassName(b)) {
        var a = this.className;
        this.className = a.replace(new RegExp("(?:^|\\s+)" + b + "(?:\\s+|$)", "g"), " ");
    }
};
Element.prototype.toggleClassName = function (a) {
    this[this.hasClassName(a) ? "removeClassName" : "addClassName"](a);
};
PKUtils.setupDisplayNames(Element, "Element");
Node.prototype.getNearestView = function () {
    var a = this;
    while (PKUtils.objectIsUndefined(a._view) && a.parentNode) {
        a = a.parentNode;
    }
    return (PKUtils.objectIsUndefined(a._view)) ? null : a._view;
};
PKUtils.setupDisplayNames(Node, "Node");

function PKClass(b) {
    if (PKUtils.objectIsUndefined(b.inherits) && b !== PKObject) {
        b.inherits = PKObject;
    }
    if (b.includes) {
        PKClass.mixin(b.prototype, b.includes);
    }
    var e = (b.synthetizes) ? b.synthetizes : [];
    for (var a = 0; a < e.length; a++) {
        PKClass.synthetizeProperty(b.prototype, e[a], true);
    }
    var d = b;
    var e = [];
    while (d.inherits) {
        d = d.inherits;
        if (d.synthetizes) {
            e = d.synthetizes.concat(e);
        }
    }
    for (var a = 0; a < e.length; a++) {
        PKClass.synthetizeProperty(b.prototype, e[a], false);
    }
    for (var a in b.prototype) {
        if (b.prototype.__lookupGetter__(a)) {
            continue;
        }
        var c = b.prototype[a];
        if (PKUtils.objectIsFunction(c)) {
            c._class = b;
            c._name = a;
            c.displayName = PKUtils.createDisplayName(b.name, a);
        }
    }
    if (b !== PKObject) {
        b.prototype.__proto__ = b.inherits.prototype;
    }
}
PKClass.synthetizeProperty = function (j, f, e) {
    var h = f.charAt(0).toUpperCase() + f.substr(1);
    var g = "get" + h;
    var i = "set" + h;
    var b = PKUtils.objectHasMethod(j, g);
    var d = PKUtils.objectHasMethod(j, i);
    if (!e && !(b || d)) {
        return;
    }
    if (d) {
        var k = function (l) {
            j[i].call(this, l);
            this.notifyPropertyChange(f);
        };
        k.displayName = "Specified setter for ." + f + " on " + j.constructor.name;
        j.__defineSetter__(f, k);
    } else {
        var a = function (l) {
            this["_" + f] = l;
            this.notifyPropertyChange(f);
        };
        a.displayName = "Default setter for ." + f + " on " + j.constructor.name;
        j.__defineSetter__(f, a);
    }
    if (b) {
        j.__defineGetter__(f, j[g]);
    } else {
        var c = function () {
            return this["_" + f];
        };
        c.displayName = "Default getter for ." + f + " on " + j.constructor.name;
        j.__defineGetter__(f, c);
    }
};
PKClass.mixin = function (b, a) {
    for (var c = 0; c < a.length; c++) {
        PKUtils.copyPropertiesFromSourceToTarget(a[c], b);
    }
};
PKUtils.setupDisplayNames(PKClass, "PKClass");
const PKObjectPropertyChanged = "handlePropertyChange";

function PKObject() {
    this.observedProperties = {};
}
PKObject.prototype.callSuper = function () {
    var a = PKObject.prototype.callSuper.caller;
    if (PKUtils.objectHasMethod(a, "inherits")) {
        a.inherits.apply(this, arguments);
    } else {
        var b = a._class.inherits.prototype;
        var c = a._name;
        if (PKUtils.objectHasMethod(b, c)) {
            return b[c].apply(this, arguments);
        }
    }
};
PKObject.prototype.isPropertyObserved = function (a) {
    return !PKUtils.objectIsUndefined(this.observedProperties[a]);
};
PKObject.prototype.addPropertyObserver = function (b, c, a) {
    if (!this.isPropertyObserved(b)) {
        this.observedProperties[b] = new Array();
    } else {
        if (this.observedProperties[b].indexOf(c) > -1) {
            return;
        }
    }
    var a = a || PKObjectPropertyChanged;
    if (PKUtils.objectHasMethod(c, a)) {
        this.observedProperties[b].push({
            observer: c,
            methodName: a
        });
    }
};
PKObject.prototype.removePropertyObserver = function (d, a) {
    if (!this.isPropertyObserved(d)) {
        return false;
    }
    var b = this.observedProperties[d];
    var c = b.indexOf(a);
    if (c > -1) {
        b.splice(c, 1);
    }
    return (c > -1);
};
PKObject.prototype.notifyPropertyChange = function (d) {
    if (!this.isPropertyObserved(d)) {
        return;
    }
    var b = this.observedProperties[d];
    for (var c = 0; c < b.length; c++) {
        var a = b[c];
        a.observer[a.methodName](this, d);
    }
};
PKObject.prototype.callMethodNameAfterDelay = function (a, c) {
    var b = this;
    var d = Array.prototype.slice.call(arguments, 2);
    var e = function () {
        b[a].apply(b, d);
    };
    e.displayName = PKUtils.createDisplayName(this.constructor.name, a);
    return setTimeout(e, c);
};
PKClass(PKObject, "PKObject");

function PKPoint(a, b) {
    this.x = (a != null && !isNaN(a)) ? a : 0;
    this.y = (b != null && !isNaN(b)) ? b : 0;
}
PKPoint.fromEvent = function (a) {
    var a = (a.touches && a.touches.length > 0) ? a.touches[0] : a;
    return new PKPoint(a.pageX, a.pageY);
};
PKPoint.fromEventInElement = function (b, a) {
    var b = (b.touches && b.touches.length > 0) ? b.touches[0] : b;
    return window.webkitConvertPointFromPageToNode(a, new WebKitPoint(b.pageX, b.pageY));
};
PKPoint.prototype.toString = function () {
    return "PKPoint[" + this.x + "," + this.y + "]";
};
PKPoint.prototype.copy = function () {
    return new PKPoint(this.x, this.y);
};
PKPoint.prototype.equals = function (a) {
    return (this.x == a.x && this.y == a.y);
};
PKUtils.setupDisplayNames(PKPoint, "PKPoint");

function PKSize(b, a) {
    this.width = (b != null && !isNaN(b)) ? b : 0;
    this.height = (a != null && !isNaN(a)) ? a : 0;
}
PKSize.prototype.toString = function () {
    return "PKSize[" + this.width + "," + this.height + "]";
};
PKSize.prototype.copy = function () {
    return new PKSize(this.width, this.height);
};
PKSize.prototype.equals = function (a) {
    return (this.width == a.width && this.height == a.height);
};
PKUtils.setupDisplayNames(PKSize);
PKImage.inherits = PKObject;
PKImage.synthetizes = ["width", "height"];

function PKImage(a) {
    this.callSuper();
    this.url = a;
    this.loaded = false;
    this.element = new Image();
    this.element.src = a;
    this.element.addEventListener("load", this, false);
    this._width = 0;
    this._height = 0;
}
PKImage.prototype.getWidth = function () {
    return this.element.width;
};
PKImage.prototype.getHeight = function () {
    return this.element.height;
};
PKImage.prototype.handleEvent = function (a) {
    this.loaded = true;
    this.notifyPropertyChange("loaded");
};
PKClass(PKImage);
const PKAnimatorLinearType = 0;
const PKAnimatorSplinesType = 1;
const PKAnimatorInvalidArgsException = 2;
const PKAnimatorAnimationDidIterate = "animationDidIterate";
const PKAnimatorAnimationDidEnd = "animationDidEnd";

function PKAnimator(c, a, b) {
    if (arguments.length != 2 && arguments.length != 3 && arguments.length != 7) {
        throw PKAnimatorInvalidArgsException;
        return false;
    }
    this.ready = false;
    this.animating = false;
    this.timer = null;
    this.duration = c;
    this.delegate = a;
    if (!PKUtils.objectHasMethod(this.delegate, PKAnimatorAnimationDidIterate)) {
        return;
    }
    if (arguments.length >= 2) {
        this.type = PKAnimatorSplinesType;
        this.x1 = b[0];
        this.y1 = b[1];
        this.x2 = b[2];
        this.y2 = b[3];
        this.init();
    } else {
        this.type = PKAnimatorLinearType;
    }
    this.ready = true;
}
PKAnimator.prototype.init = function () {
    this.cx = 3 * this.x1;
    this.bx = 3 * (this.x2 - this.x1) - this.cx;
    this.ax = 1 - this.cx - this.bx;
    this.cy = 3 * this.y1;
    this.by = 3 * (this.y2 - this.y1) - this.cy;
    this.ay = 1 - this.cy - this.by;
    var c = (this.duration / 1000) * 240;
    this.curve = new Array(c);
    var b = 1 / (c - 1);
    for (var d = 0; d < c; d++) {
        var a = d * b;
        this.curve[d] = {
            x: (this.ax * Math.pow(a, 3)) + (this.bx * Math.pow(a, 2)) + (this.cx * a),
            y: (this.ay * Math.pow(a, 3)) + (this.by * Math.pow(a, 2)) + (this.cy * a)
        };
    }
};
PKAnimator.prototype.start = function () {
    if (!this.ready) {
        var a = this;
        this.timer = setTimeout(function () {
            a.start();
        },
        0);
        return;
    }
    this.animating = true;
    this.lastIndex = 0;
    this.startTime = (new Date()).getTime();
    this.iterate();
};
PKAnimator.prototype.stop = function () {
    this.animating = false;
    clearTimeout(this.timer);
};
PKAnimator.prototype.iterate = function () {
    var f = (new Date()).getTime() - this.startTime;
    if (f < this.duration) {
        var g = f / this.duration;
        if (this.type == PKAnimatorSplinesType) {
            var b = 0;
            for (var e = this.lastIndex; e < this.curve.length; e++) {
                var a = this.curve[e];
                if (a.x >= g && e > 0) {
                    var d = this.curve[e - 1];
                    if ((g - d.x) < (a.x - g)) {
                        this.lastIndex = e - 1;
                        b = d.y;
                    } else {
                        this.lastIndex = e;
                        b = a.y;
                    }
                    break;
                }
            }
        }
        this.delegate[PKAnimatorAnimationDidIterate]((this.type == PKAnimatorSplinesType) ? b : g);
        var c = this;
        this.timer = setTimeout(function () {
            c.iterate();
        },
        0);
    } else {
        this.delegate[PKAnimatorAnimationDidIterate](1);
        if (PKUtils.objectHasMethod(this.delegate, PKAnimatorAnimationDidEnd)) {
            this.delegate[PKAnimatorAnimationDidEnd]();
        }
        this.animating = false;
    }
};
PKClass(PKAnimator);
const PKTransitionDidCompleteDelegate = "transitionDidComplete";
const PKTransitionDefaults = {
    duration: 0.5,
    delay: 0,
    removesTargetUponCompletion: false,
    revertsToOriginalValues: false
};
const PKTransitionStyles = ["-webkit-transition-property", "-webkit-transition-duration", "-webkit-transition-timing-function", "-webkit-transition-delay", "-webkit-transition"];

function PKTransition(a) {
    this.target = null;
    this.properties = null;
    this.duration = null;
    this.delay = null;
    this.from = null;
    this.to = null;
    this.timingFunction = null;
    this.delegate = null;
    this.removesTargetUponCompletion = null;
    this.revertsToOriginalValues = null;
    this.defaultsApplied = false;
    this.archivedStyles = null;
    this.archivedValues = [];
    PKUtils.copyPropertiesFromSourceToTarget(a, this);
}
PKTransition.prototype.applyDefaults = function () {
    if (this.defaultsApplied) {
        return;
    }
    for (var a in PKTransitionDefaults) {
        if (this[a] === null) {
            this[a] = PKTransitionDefaults[a];
        }
    }
    this.defaultsApplied = true;
};
PKTransition.prototype.archiveTransitionStyles = function () {
    if (this.archivedStyles !== null) {
        return;
    }
    var b = (this.target instanceof PKView) ? this.target.layer : this.target;
    this.archivedStyles = [];
    for (var a = 0; a < PKTransitionStyles.length; a++) {
        this.archivedStyles.push(b.style.getPropertyValue(PKTransitionStyles[a]));
    }
};
PKTransition.prototype.restoreTransitionStyles = function () {
    for (var a = 0; a < PKTransitionStyles.length; a++) {
        this.element.style.setProperty(PKTransitionStyles[a], this.archivedStyles[a], "");
    }
    this.archivedStyles = null;
};
PKTransition.prototype.archiveBaseValues = function () {
    if (!this.revertsToOriginalValues) {
        return;
    }
    if (this.target instanceof PKView) {
        for (var a = 0; a < this.properties.length; a++) {
            this.archivedValues.push(this.target[this.properties[a]]);
        }
    } else {
        for (var a = 0; a < this.properties.length; a++) {
            this.archivedValues.push(this.target.layer.style.getPropertyValue(this.properties[a]));
        }
    }
};
PKTransition.prototype.restoreBaseValues = function () {
    if (this.target instanceof PKView) {
        for (var a = 0; a < this.properties.length; a++) {
            this.target[this.properties[a]] = this.archivedValues[a];
        }
    } else {
        for (var a = 0; a < this.properties.length; a++) {
            this.target.layer.style.setProperty(this.properties[a], this.archivedValues[a], null);
        }
    }
};
PKTransition.prototype.start = function () {
    if (PKTransaction.openTransactions > 0) {
        PKTransaction.addTransition(this);
        return;
    }
    this.applyDefaults();
    if (this.from === null) {
        this.applyToState();
    } else {
        this.applyFromState();
        var a = this;
        setTimeout(function () {
            a.applyToState();
        },
        0);
    }
};
PKTransition.prototype.applyFromState = function () {
    if (this.from === null) {
        return;
    }
    this.applyDefaults();
    this.archiveTransitionStyles();
    if (this.target instanceof PKView) {
        this.target.layer.style.webkitTransitionDuration = 0;
        for (var a = 0; a < this.properties.length; a++) {
            this.target[this.properties[a]] = this.processTransitionValue(this.from[a]);
        }
    } else {
        this.target.style.webkitTransitionDuration = 0;
        for (var a = 0; a < this.properties.length; a++) {
            this.target.style.setProperty(this.properties[a], this.from[a], "");
        }
    }
};
PKTransition.prototype.applyToState = function () {
    this.applyDefaults();
    this.archiveTransitionStyles();
    this.archiveBaseValues();
    var e = (this.target instanceof PKView);
    this.cssProperties = [];
    var b = [];
    for (var g = 0; g < this.properties.length; g++) {
        var d = (e) ? this.target.cssPropertyNameForJSProperty(this.properties[g]) : this.properties[g];
        if (this.cssProperties.indexOf(d) > -1) {
            continue;
        }
        var c = (PKUtils.objectIsArray(this.duration)) ? this.duration[g] : this.duration;
        var f = (PKUtils.objectIsArray(this.timingFunction)) ? this.timingFunction[g] : this.timingFunction;
        var a = (PKUtils.objectIsArray(this.delay)) ? this.delay[g] : this.delay;
        b.push([d, c + "s", f, a + "s"].join(" "));
        this.cssProperties.push(d);
    }
    if (e) {
        this.element = this.target.layer;
        for (var g = 0; g < this.properties.length; g++) {
            this.target[this.properties[g]] = this.processTransitionValue(this.to[g]);
        }
    } else {
        this.element = this.target;
        for (var g = 0; g < this.properties.length; g++) {
            this.target.style.setProperty(this.properties[g], this.to[g], "");
        }
    }
    this.element.style.webkitTransition = b.join(", ");
    this.element.addEventListener("webkitTransitionEnd", this, false);
    this.completedTransitions = 0;
};
PKTransition.prototype.handleEvent = function (a) {
    if (a.currentTarget !== this.element) {
        return;
    }
    this.completedTransitions++;
    if (this.completedTransitions != this.cssProperties.length) {
        return;
    }
    if (PKUtils.objectHasMethod(this.delegate, PKTransitionDidCompleteDelegate)) {
        this.delegate[PKTransitionDidCompleteDelegate](this);
    }
    if (this.removesTargetUponCompletion) {
        var b = this.target;
        if (this.target instanceof PKView) {
            b.removeFromSuperview();
        } else {
            b.parentNode.removeChild(b);
        }
    } else {
        this.restoreTransitionStyles();
    }
    if (this.revertsToOriginalValues) {
        this.restoreBaseValues();
    }
};
const PKTransitionWidthRegExp = new RegExp(/\$width/g);
const PKTransitionHeightRegExp = new RegExp(/\$height/g);
PKTransition.prototype.processTransitionValue = function (a) {
    if (!PKUtils.objectIsString(a)) {
        return a;
    }
    a = a.replace(PKTransitionWidthRegExp, PKUtils.px(this.target.size.width));
    return a.replace(PKTransitionHeightRegExp, PKUtils.px(this.target.size.height));
};
PKClass(PKTransition);
var PKTransaction = {
    transitions: [],
    openTransactions: 0,
    defaults: {},
    defaultsStates: []
};
PKTransaction.begin = function () {
    if (this.openTransactions == 0) {
        this.transitions = [];
        this.defaults = {};
    } else {
        this.defaultsStates.push(this.defaults);
    }
    this.openTransactions++;
};
PKTransaction.addTransition = function (b) {
    for (var a in this.defaults) {
        if (b[a] === null) {
            b[a] = this.defaults[a];
        }
    }
    this.transitions.push(b);
};
PKTransaction.commit = function () {
    if (this.openTransactions == 0) {
        return;
    }
    this.openTransactions--;
    if (this.openTransactions != 0) {
        this.defaults = this.defaultsStates.pop();
        return;
    }
    var b = this.transitions;
    for (var a = 0; a < b.length; a++) {
        b[a].applyFromState();
    }
    setTimeout(function () {
        for (var c = 0; c < b.length; c++) {
            b[c].applyToState();
        }
    },
    0);
};
PKUtils.setupDisplayNames(PKTransaction, "PKTransaction");
const PKViewTransitionDissolveOut = {
    properties: ["opacity"],
    from: [1],
    to: [0]
};
const PKViewTransitionDissolveIn = {
    properties: ["opacity"],
    from: [0],
    to: [1]
};
const PKViewTransitionZoomIn = {
    properties: ["opacity", "transform"],
    from: [0, "scale(0.2)"],
    to: [1, "scale(1)"]
};
const PKViewTransitionZoomOut = {
    properties: ["opacity", "transform"],
    from: [0, "scale(1.2)"],
    to: [1, "scale(1)"]
};
const PKViewTransitionCrossSpinRight = {
    properties: ["opacity", "transform"],
    from: [0, "rotate(20deg)"],
    to: [1, "rotate(0)"]
};
const PKViewTransitionCrossSpinLeft = {
    properties: ["opacity", "transform"],
    from: [0, "rotate(-20deg)"],
    to: [1, "rotate(0)"]
};
const PKViewTransitionFlipLeftOut = {
    properties: ["transform"],
    from: ["perspective(800) rotateY(0deg)"],
    to: ["perspective(800) rotateY(-180deg)"]
};
const PKViewTransitionFlipLeftIn = {
    properties: ["transform"],
    from: ["perspective(800) rotateY(180deg)"],
    to: ["perspective(800) rotateY(0deg)"]
};
const PKViewTransitionFlipRightOut = {
    properties: ["transform"],
    from: ["perspective(800) rotateY(0deg)"],
    to: ["perspective(800) rotateY(180deg)"]
};
const PKViewTransitionFlipRightIn = {
    properties: ["transform"],
    from: ["perspective(800) rotateY(-180deg)"],
    to: ["perspective(800) rotateY(0deg)"]
};
const PKViewTransitionCubeLeftOut = {
    base: ["anchorPoint", new PKPoint(1, 0.5)],
    properties: ["transform"],
    from: ["perspective(800) rotateY(0deg) translateZ(0)"],
    to: ["perspective(800) rotateY(-90deg) translateZ($width)"]
};
const PKViewTransitionCubeLeftIn = {
    base: ["anchorPoint", new PKPoint(0, 0.5)],
    properties: ["transform"],
    from: ["perspective(800) rotateY(90deg) translateZ($width)"],
    to: ["perspective(800) rotateY(0deg) translateZ(0)"]
};
const PKViewTransitionCubeRightOut = {
    base: ["anchorPoint", new PKPoint(0, 0.5)],
    properties: ["transform"],
    from: ["perspective(800) rotateY(0deg) translateZ(0)"],
    to: ["perspective(800) rotateY(90deg) translateZ($width)"]
};
const PKViewTransitionCubeRightIn = {
    base: ["anchorPoint", new PKPoint(1, 0.5)],
    properties: ["transform"],
    from: ["perspective(800) rotateY(-90deg) translateZ($width)"],
    to: ["perspective(800) rotateY(0deg) translateZ(0)"]
};
const PKViewTransitionDoorOpenLeftOut = {
    base: ["anchorPoint", new PKPoint(0, 0.5), "zIndex", 1],
    properties: ["transform"],
    from: ["perspective(800) rotateY(0deg)"],
    to: ["perspective(800) rotateY(-90deg)"]
};
const PKViewTransitionDoorCloseLeftIn = {
    base: ["anchorPoint", new PKPoint(0, 0.5), "zIndex", 2],
    properties: ["transform"],
    from: ["perspective(800) rotateY(-90deg)"],
    to: ["perspective(800) rotateY(0deg)"]
};
const PKViewTransitionDoorOpenRightOut = {
    base: ["anchorPoint", new PKPoint(1, 0.5), "zIndex", 1],
    properties: ["transform"],
    from: ["perspective(800) rotateY(0deg)"],
    to: ["perspective(800) rotateY(90deg)"]
};
const PKViewTransitionDoorCloseRightIn = {
    base: ["anchorPoint", new PKPoint(1, 0.5), "zIndex", 2],
    properties: ["transform"],
    from: ["perspective(800) rotateY(90deg)"],
    to: ["perspective(800) rotateY(0deg)"]
};
const PKViewTransitionRevolveTowardsLeftOut = {
    base: ["anchorPoint", new PKPoint(0, 0.5)],
    properties: ["transform", "opacity"],
    from: ["perspective(800) rotateY(0deg)", 1],
    to: ["perspective(800) rotateY(-90deg)", 0]
};
const PKViewTransitionRevolveTowardsLeftIn = {
    base: ["anchorPoint", new PKPoint(0, 0.5)],
    properties: ["transform"],
    from: ["perspective(800) rotateY(90deg)"],
    to: ["perspective(800) rotateY(0deg)"]
};
const PKViewTransitionRevolveAwayLeftOut = {
    base: ["anchorPoint", new PKPoint(0, 0.5)],
    properties: ["transform"],
    from: ["perspective(800) rotateY(0deg)"],
    to: ["perspective(800) rotateY(90deg)"]
};
const PKViewTransitionRevolveAwayLeftIn = {
    base: ["anchorPoint", new PKPoint(0, 0.5)],
    properties: ["transform", "opacity"],
    from: ["perspective(800) rotateY(-90deg)", 0],
    to: ["perspective(800) rotateY(0deg)", 1]
};
const PKViewTransitionRevolveTowardsRightOut = {
    base: ["anchorPoint", new PKPoint(1, 0.5)],
    properties: ["transform", "opacity"],
    from: ["perspective(800) rotateY(0deg)", 1],
    to: ["perspective(800) rotateY(90deg)", 0]
};
const PKViewTransitionRevolveTowardsRightIn = {
    base: ["anchorPoint", new PKPoint(1, 0.5)],
    properties: ["transform"],
    from: ["perspective(800) rotateY(-90deg)"],
    to: ["perspective(800) rotateY(0deg)"]
};
const PKViewTransitionRevolveAwayRightOut = {
    base: ["anchorPoint", new PKPoint(1, 0.5)],
    properties: ["transform"],
    from: ["perspective(800) rotateY(0deg)"],
    to: ["perspective(800) rotateY(-90deg)"]
};
const PKViewTransitionRevolveAwayRightIn = {
    base: ["anchorPoint", new PKPoint(1, 0.5)],
    properties: ["transform", "opacity"],
    from: ["perspective(800) rotateY(90deg)", 0],
    to: ["perspective(800) rotateY(0deg)", 1]
};
const PKViewTransitionSpinOut = {
    properties: ["transform", "opacity"],
    from: ["perspective(800) rotate(0)", 1],
    to: ["perspective(800) rotate(-180deg)", 0]
};
const PKViewTransitionSpinIn = {
    base: ["zIndex", 1],
    properties: ["transform", "opacity"],
    from: ["perspective(800) rotate(-180deg)", 0],
    to: ["perspective(800) rotate(0)", 1]
};
const PKViewTransitionScaleIn = {
    base: ["zIndex", 1],
    properties: ["transform"],
    from: ["scale(0.01)"],
    to: ["scale(1)"]
};
const PKViewTransitionScaleOut = {
    base: ["zIndex", 1],
    properties: ["transform"],
    from: ["scale(1)"],
    to: ["scale(0.01)"]
};
PKView.inherits = PKObject;
PKView.synthetizes = ["id", "position", "size", "transform", "anchorPoint", "doubleSided", "zIndex", "opacity", "clipsToBounds", "transitionsEnabled", "transitionsDuration", "hostingLayer"];

function PKView() {
    this.callSuper();
    this.superview = null;
    this.subviews = [];
    this.tracksTouchesOnceTouchesBegan = false;
    this.userInteractionEnabled = true;
    this.autoresizesSubviews = true;
    this.autoresizingMask = PKViewAutoresizingNone;
    this._position = new PKPoint();
    this._size = new PKSize();
    this._anchorPoint = new PKPoint(0.5, 0.5);
    this._doubleSided = true;
    this._zIndex = 0;
    this._transform = PKUtils.t(0, 0);
    this._clipsToBounds = false;
    this._transitionsEnabled = false;
    this._transitionsDuration = 0.5;
    this._hostingLayer = null;
    if (PKUtils.objectIsUndefined(this.layer) || this.layer === null) {
        this.createLayer();
    }
    this.layer.addEventListener(PKStartEvent, this, false);
    this.layer._view = this;
}
PKView.prototype.toString = function () {
    return [this.constructor.name, "[", this._size.width, "x", this._size.height, "@", this._position.x, ",", this._position.y, "]"].join("");
};
PKView.prototype.getId = function () {
    return this.layer.id;
};
PKView.prototype.setId = function (a) {
    this.layer.id = a;
};
PKView.prototype.setPosition = function (a) {
    if (this._position.equals(a)) {
        return;
    }
    this._position = a;
    this.updateLayerTransform();
};
PKView.prototype.setSize = function (a) {
    if (this._size.equals(a)) {
        return;
    }
    var b = this._size.copy();
    this._size = a;
    this.layer.style.width = a.width + "px";
    this.layer.style.height = a.height + "px";
    if (this.autoresizesSubviews) {
        this.resizeSubviewsWithOldSize(b);
    }
};
PKView.prototype.setTransform = function (a) {
    this._transform = a;
    this.updateLayerTransform();
};
PKView.prototype.setAnchorPoint = function (a) {
    this._anchorPoint = a;
    this.layer.style.webkitTransformOrigin = Math.round(a.x * 100) + "% " + Math.round(a.y * 100) + "% 0";
};
PKView.prototype.setDoubleSided = function (a) {
    this._doubleSided = a;
    this.layer.style.webkitBackfaceVisibility = a ? "visible" : "hidden";
};
PKView.prototype.setZIndex = function (a) {
    this._zIndex = a;
    this.layer.style.zIndex = a;
};
PKView.prototype.updateLayerTransform = function () {
    this.layer.style.webkitTransform = PKUtils.t(this._position.x, this._position.y) + this._transform;
};
PKView.prototype.getOpacity = function () {
    return Number(window.getComputedStyle(this.layer).opacity);
};
PKView.prototype.setOpacity = function (a) {
    this.layer.style.opacity = a;
};
PKView.prototype.setTransitionsEnabled = function (a) {
    if (a) {
        this.layer.style.webkitTransitionProperty = "-webkit-transform, opacity";
        this.layer.style.webkitTransitionDuration = this._transitionsDuration + "s";
    } else {
        this.layer.style.webkitTransitionDuration = "0s";
    }
    this._transitionsEnabled = a;
};
PKView.prototype.setTransitionsDuration = function (a) {
    this.layer.style.webkitTransitionDuration = a + "s";
    this._transitionsDuration = a;
};
PKView.prototype.setClipsToBounds = function (a) {
    this._clipsToBounds = a;
    this.layer.style.overflow = a ? "hidden" : "visible";
};
PKView.prototype.getHostingLayer = function () {
    return (this._hostingLayer != null) ? this._hostingLayer : this.layer;
};
PKView.prototype.addSubview = function (a) {
    return this.insertSubviewAtIndex(a, this.subviews.length);
};
PKView.prototype.removeFromSuperview = function () {
    if (this.superview == null) {
        return;
    }
    this.willMoveToSuperview(null);
    this.superview.willRemoveSubview(this);
    var a = this._indexInSuperviewSubviews;
    this.superview.subviews.splice(a, 1);
    for (var b = a; b < this.superview.subviews.length; b++) {
        this.superview.subviews[b]._indexInSuperviewSubviews = b;
    }
    this.layer.parentNode.removeChild(this.layer);
    this.superview = null;
    this.didMoveToSuperview();
};
PKView.prototype.insertSubviewAtIndex = function (b, a) {
    if (a > this.subviews.length) {
        return;
    }
    if (b.superview === this) {
        a--;
    }
    b.removeFromSuperview();
    b.willMoveToSuperview(this);
    this.subviews.splice(a, 0, b);
    b._indexInSuperviewSubviews = a;
    for (var d = a + 1; d < this.subviews.length; d++) {
        this.subviews[d]._indexInSuperviewSubviews = d;
    }
    var c = this.hostingLayer;
    if (a == this.subviews.length - 1) {
        c.appendChild(b.layer);
    } else {
        c.insertBefore(b.layer, this.subviews[a + 1].layer);
    }
    b.superview = this;
    b.didMoveToSuperview();
    this.didAddSubview(b);
    return b;
};
PKView.prototype.insertSubviewAfterSubview = function (c, a) {
    if (a.superview !== this) {
        return;
    }
    var b = a._indexInSuperviewSubviews + 1;
    if (b < this.subviews.length) {
        this.insertSubviewAtIndex(c, b);
    } else {
        this.addSubview(c);
    }
    return c;
};
PKView.prototype.insertSubviewBeforeSubview = function (b, a) {
    if (a.superview !== this) {
        return;
    }
    return this.insertSubviewAtIndex(b, a._indexInSuperviewSubviews);
};
PKView.prototype.exchangeSubviewsAtIndices = function (c, d) {
    if (c >= this.subviews.length || d >= this.subviews.length) {
        return;
    }
    var a = this.subviews[c];
    var g = this.subviews[d];
    this.subviews[c] = g;
    this.subviews[d] = a;
    a._indexInSuperviewSubviews = d;
    g._indexInSuperviewSubviews = c;
    var f = a.layer;
    var h = g.layer;
    var e = this.hostingLayer;
    var i = f.nextSibling;
    var b = h.nextSibling;
    if (i != null) {
        e.insertBefore(h, i);
    } else {
        e.appendChild(h);
    }
    if (b != null) {
        e.insertBefore(f, b);
    } else {
        e.appendChild(f);
    }
};
PKView.prototype.isDescendantOfView = function (c) {
    var b = false;
    var a = this;
    while (a.superview != null) {
        if (a.superview === c) {
            b = true;
            break;
        }
        a = a.superview;
    }
    return b;
};
PKView.prototype.createLayer = function () {
    this.layer = document.createElement("div");
    this.layer.className = "pk-view";
};
PKView.prototype.willMoveToSuperview = function (a) {
    this._wasDescendantOfRootView = this.isDescendantOfView(PKRootView.sharedRoot);
};
PKView.prototype.didMoveToSuperview = function () {
    if (!this._wasDescendantOfRootView && this.isDescendantOfView(PKRootView.sharedRoot)) {
        this.becameDescendantOfRootView();
        this.notifySubviewsOfDescendencyOfRootView();
    }
};
PKView.prototype.didAddSubview = function (a) {};
PKView.prototype.willRemoveSubview = function (a) {};
PKView.prototype.becameDescendantOfRootView = function () {};
PKView.prototype.notifySubviewsOfDescendencyOfRootView = function () {
    for (var a = 0; a < this.subviews.length; a++) {
        this.subviews[a].becameDescendantOfRootView();
        this.subviews[a].notifySubviewsOfDescendencyOfRootView();
    }
};
PKView.prototype.handleEvent = function (a) {
    switch (a.type) {
    case PKStartEvent:
        this.touchesBegan(a);
        break;
    case PKMoveEvent:
        this.touchesMoved(a);
        break;
    case PKEndEvent:
        this.touchesEnded(a);
        break;
    case "touchcancel":
        this.touchesCancelled(a);
        break;
    }
};
PKView.prototype.touchesBegan = function (a) {
    if (!this.userInteractionEnabled) {
        return;
    }
    if (this.tracksTouchesOnceTouchesBegan) {
        window.addEventListener(PKMoveEvent, this, true);
        window.addEventListener(PKEndEvent, this, true);
        window.addEventListener("touchcancel", this, true);
    }
};
PKView.prototype.touchesMoved = function (a) {
    if (!this.userInteractionEnabled) {
        return;
    }
    a.preventDefault();
};
PKView.prototype.touchesEnded = function (a) {
    if (!this.userInteractionEnabled) {
        return;
    }
    window.removeEventListener(PKMoveEvent, this, true);
    window.removeEventListener(PKEndEvent, this, true);
    window.removeEventListener("touchcancel", this, true);
};
PKView.prototype.touchesCancelled = function (a) {
    if (!this.userInteractionEnabled) {
        return;
    }
    window.removeEventListener(PKMoveEvent, this, true);
    window.removeEventListener(PKEndEvent, this, true);
    window.removeEventListener("touchcancel", this, true);
};
PKView.prototype.pointInside = function (a) {
    return (a.x >= 0 && a.x <= this.size.width && a.y >= 0 && a.y <= this.size.height);
};
const PKViewAutoresizingNone = 0;
const PKViewAutoresizingFlexibleLeftMargin = 1 << 0;
const PKViewAutoresizingFlexibleWidth = 1 << 1;
const PKViewAutoresizingFlexibleRightMargin = 1 << 2;
const PKViewAutoresizingFlexibleTopMargin = 1 << 3;
const PKViewAutoresizingFlexibleHeight = 1 << 4;
const PKViewAutoresizingFlexibleBottomMargin = 1 << 5;
PKView.prototype.resizeSubviewsWithOldSize = function (b) {
    for (var a = 0; a < this.subviews.length; a++) {
        this.subviews[a].resizeWithOldSuperviewSize(b);
    }
};
PKView.prototype.resizeWithOldSuperviewSize = function (d) {
    var a = this._position.copy();
    var e = this._size.copy();
    var g = this.autoresizingMask;
    var f = (g & PKViewAutoresizingFlexibleLeftMargin) + (g & PKViewAutoresizingFlexibleWidth) + (g & PKViewAutoresizingFlexibleRightMargin);
    switch (f) {
    case PKViewAutoresizingNone:
        break;
    case PKViewAutoresizingFlexibleLeftMargin:
        a.x += this.superview._size.width - d.width;
        break;
    case PKViewAutoresizingFlexibleWidth:
        e.width = this.superview._size.width - (d.width - this._size.width);
        break;
    case PKViewAutoresizingFlexibleLeftMargin | PKViewAutoresizingFlexibleWidth:
        var b = (d.width - this._size.width - this._position.x);
        a.x = (this._position.x / (d.width - b)) * (this.superview._size.width - b);
        e.width = this.superview._size.width - a.x - b;
        break;
    case PKViewAutoresizingFlexibleRightMargin:
        break;
    case PKViewAutoresizingFlexibleLeftMargin | PKViewAutoresizingFlexibleRightMargin:
        var b = (d.width - this._size.width - this._position.x);
        a.x += (this.superview._size.width - d.width) * (this.position.x / (this.position.x + b));
        break;
    case PKViewAutoresizingFlexibleRightMargin | PKViewAutoresizingFlexibleWidth:
        var b = (d.width - this._size.width - this._position.x);
        scaled_right_margin = (b / (d.width - this._position.x)) * (this.superview._size.width - this._position.x);
        e.width = this.superview._size.width - a.x - scaled_right_margin;
        break;
    case PKViewAutoresizingFlexibleLeftMargin | PKViewAutoresizingFlexibleWidth | PKViewAutoresizingFlexibleRightMargin:
        a.x = (this._position.x / d.width) * this.superview._size.width;
        e.width = (this._size.width / d.width) * this.superview._size.width;
        break;
    }
    var h = (g & PKViewAutoresizingFlexibleTopMargin) + (g & PKViewAutoresizingFlexibleHeight) + (g & PKViewAutoresizingFlexibleBottomMargin);
    switch (h) {
    case PKViewAutoresizingNone:
        break;
    case PKViewAutoresizingFlexibleTopMargin:
        a.y += this.superview._size.height - d.height;
        break;
    case PKViewAutoresizingFlexibleHeight:
        e.height = this.superview._size.height - (d.height - this._size.height);
        break;
    case PKViewAutoresizingFlexibleTopMargin | PKViewAutoresizingFlexibleHeight:
        var c = (d.height - this._size.height - this._position.y);
        a.y = (this._position.y / (d.height - c)) * (this.superview._size.height - c);
        e.height = this.superview._size.height - a.y - c;
        break;
    case PKViewAutoresizingFlexibleBottomMargin:
        break;
    case PKViewAutoresizingFlexibleTopMargin | PKViewAutoresizingFlexibleBottomMargin:
        var c = (d.height - this._size.height - this._position.y);
        a.y += (this.superview._size.height - d.height) * (this.position.y / (this.position.y + c));
        break;
    case PKViewAutoresizingFlexibleBottomMargin | PKViewAutoresizingFlexibleHeight:
        var c = (d.height - this._size.height - this._position.y);
        scaled_bottom_margin = (c / (d.height - this._position.y)) * (this.superview._size.height - this._position.y);
        e.height = this.superview._size.height - a.y - scaled_bottom_margin;
        break;
    case PKViewAutoresizingFlexibleTopMargin | PKViewAutoresizingFlexibleHeight | PKViewAutoresizingFlexibleBottomMargin:
        a.y = (this._position.y / d.height) * this.superview._size.height;
        e.height = (this._size.height / d.height) * this.superview._size.height;
        break;
    }
    this.position = a;
    this.size = e;
};
const PKViewPropertyMapping = {
    opacity: "opacity",
    transform: "-webkit-transform",
    position: "-webkit-transform",
    anchorPoint: "-webkit-transform-origin",
    doubleSided: "-webkit-backface-visibility",
    zIndex: "z-index"
};
PKView.prototype.cssPropertyNameForJSProperty = function (a) {
    return PKViewPropertyMapping[a];
};
PKView.prototype.applyTransition = function (e, c) {
    if (e === null) {
        return;
    }
    var d = new PKTransition(e);
    d.target = this;
    if (c) {
        var b = d.from;
        d.from = d.to;
        d.to = b;
    }
    if (e.base) {
        for (var a = 0; a < e.base.length; a += 2) {
            this[e.base[a]] = e.base[a + 1];
        }
    }
    d.start();
};
PKView.getViewById = function (b) {
    var a = document.getElementById(b);
    return (a && !PKUtils.objectIsUndefined(a._view)) ? a._view : null;
};
PKClass(PKView);
PKContentView.inherits = PKView;

function PKContentView(b) {
    var a = b;
    if (PKUtils.objectIsString(b)) {
        a = document.querySelector(b);
    }
    this.layer = a;
    this.callSuper();
    this.layer.addClassName("pk-view");
    if (a === document.body) {
        this.size = new PKSize(window.innerWidth, window.innerHeight);
    }
}
PKContentView.prototype.becameDescendantOfRootView = function () {
    this.callSuper();
    this.refreshSize();
};
PKContentView.prototype.refreshSize = function () {
    var a = window.getComputedStyle(this.layer);
    this._size = new PKSize(parseInt(a.width, 10), parseInt(a.height, 10));
};
PKClass(PKContentView);
PKRootView.inherits = PKContentView;
PKRootView.synthetizes = ["disablesDefaultScrolling"];

function PKRootView(a) {
    this.callSuper(a);
    this._disablesDefaultScrolling = true;
    this.disablesDefaultScrolling = true;
    if (this.layer === document.body) {
        window.addEventListener("orientationchange", this, false);
        this.layer.removeClassName("pk-view");
    }
}
PKRootView.prototype.setDisablesDefaultScrolling = function (a) {
    this.layer[a ? "addEventListener" : "removeEventListener"](PKMoveEvent, PKUtils.preventEventDefault, false);
    this._disablesDefaultScrolling = a;
};
PKRootView.prototype.handleEvent = function (a) {
    this.callSuper(a);
    if (a.type == "orientationchange") {
        var b = this;
        setTimeout(function () {
            b.size = new PKSize(window.innerWidth, window.innerHeight);
            window.scrollTo(0, 0);
        },
        0);
    }
};
PKRootView._sharedRoot = null;
PKRootView.__defineGetter__("sharedRoot", function () {
    if (PKRootView._sharedRoot === null) {
        PKRootView._sharedRoot = new PKRootView(document.body);
    }
    return PKRootView._sharedRoot;
});
PKRootView.__defineSetter__("sharedRoot", function (a) {
    PKRootView._sharedRoot = a;
});
PKClass(PKRootView);
const PKScrollIndicatorThickness = 7;
const PKScrollIndicatorEndSize = 3;
const PKScrollIndicatorTypeHorizontal = "horizontal";
const PKScrollIndicatorTypeVertical = "vertical";
PKScrollIndicator.inherits = PKView;
PKScrollIndicator.synthetizes = ["visible", "width", "height", "style"];

function PKScrollIndicator(a) {
    this.callSuper();
    this.type = a;
    this.layer.addClassName(a);
    this._visible = false;
    this._width = PKScrollIndicatorThickness;
    this._height = PKScrollIndicatorThickness;
    this.position = new PKPoint(-PKScrollIndicatorThickness, -PKScrollIndicatorThickness);
    this.positionBeforeHide = this.position;
    this.lastPositionUpdateInHide = false;
    this._style = PKScrollViewIndicatorStyleDefault;
    this.visible = false;
}
PKScrollIndicator.prototype.createLayer = function () {
    this.layer = document.createElement("div");
    this.layer.addClassName("pk-scroll-indicator");
    this.layer.addEventListener("webkitTransitionEnd", this, false);
    this.start = this.layer.appendChild(document.createElement("div"));
    this.middle = this.layer.appendChild(document.createElement("img"));
    this.end = this.layer.appendChild(document.createElement("div"));
};
PKScrollIndicator.prototype.setPosition = function (a) {
    a.x = Math.round(a.x);
    a.y = Math.round(a.y);
    this.callSuper(a);
    this.lastPositionUpdateInHide = false;
};
PKScrollIndicator.prototype.setSize = function (a) {
    this.width = a.width;
    this.height = a.height;
    this._size = a;
};
PKScrollIndicator.prototype.setStyle = function (c) {
    this._style = c;
    this.layer.removeClassName(this._style);
    this.layer.addClassName(this._style);
    var a = (this.type === PKScrollIndicatorTypeHorizontal) ? "Horizontal" : "Vertical";
    var b = "Default";
    switch (c) {
    case PKScrollViewIndicatorStyleWhite:
        b = "White";
        break;
    case PKScrollViewIndicatorStyleBlack:
        b = "Black";
        break;
    }
    this.middle.src = PKUtils.assetsPath + "scrollindicator/UIScrollerIndicator" + b + a + "Middle.png";
};
PKScrollIndicator.prototype.setWidth = function (a) {
    this.middle.style.webkitTransform = "translate3d(0,0,0) scale(" + (a - PKScrollIndicatorEndSize * 2) + ",1)";
    this.end.style.webkitTransform = "translate3d(" + (a - PKScrollIndicatorEndSize) + "px,0,0)";
    this._width = a;
};
PKScrollIndicator.prototype.setHeight = function (a) {
    this.middle.style.webkitTransform = "translate3d(0,0,0) scale(1," + (a - PKScrollIndicatorEndSize * 2) + ")";
    this.end.style.webkitTransform = "translate3d(0," + (a - PKScrollIndicatorEndSize) + "px,0)";
    this._height = a;
};
PKScrollIndicator.prototype.setVisible = function (a) {
    if (a) {
        this.fading = false;
        this.opacity = 1;
        this.position = this.lastPositionUpdateInHide ? this.positionBeforeHide : this.position;
    } else {
        if (!this.fading) {
            this.fading = true;
            this.opacity = 0;
            this.lastPositionUpdateInHide = true;
            this.positionBeforeHide = this.position;
        }
    }
    this._visible = a;
};
PKScrollIndicator.prototype.flash = function () {
    this.flashing = true;
};
PKScrollIndicator.prototype.handleEvent = function (a) {
    if (a.type != "webkitTransitionEnd") {
        return;
    }
    this.callSuper(a);
    if (this.flashing) {
        this.flashing = false;
    } else {
        if (this.fading) {
            this.position = new PKPoint(-PKScrollIndicatorThickness, -PKScrollIndicatorThickness);
            this.fading = false;
        }
    }
};
PKClass(PKScrollIndicator);
const PKScrollViewWillBeginDragging = "scrollViewWillBeginDragging";
const PKScrollViewDidEndScrollingAnimation = "scrollViewDidEndScrollingAnimation";
const PKScrollViewDidScroll = "scrollViewDidScroll";
const PKScrollViewDidEndDragging = "scrollViewDidEndDragging";
const PKScrollViewWillBeginDecelerating = "scrollViewWillBeginDecelerating";
const PKScrollViewDidEndDecelerating = "scrollViewDidEndDecelerating";
const PKScrollViewMinimumTrackingForDrag = 5;
const PKScrollViewPagingTransitionDuration = "0.25s";
const PKScrollViewMinIndicatorLength = 34;
const PKScrollViewAcceleration = 15;
const PKScrollViewMaxTrackingTime = 100;
const PKScrollViewDecelerationFrictionFactor = 0.95;
const PKScrollViewDesiredAnimationFrameRate = 1000 / 60;
const PKScrollViewMinimumVelocityToHideScrollIndicators = 0.05;
const PKScrollViewMinimumVelocity = 0.01;
const PKScrollViewPenetrationDeceleration = 0.03;
const PKScrollViewPenetrationAcceleration = 0.08;
const PKScrollViewMinVelocityForDeceleration = 1;
const PKScrollViewMinVelocityForDecelerationWithPaging = 4;
const PKScrollViewClickableElementNames = ["a", "button", "input", "select"];
const PKScrollViewContentTouchesDelay = 150;
const PKScrollViewAutomatedContentSize = -1;
const PKScrollViewIndicatorStyleDefault = "indicator-default";
const PKScrollViewIndicatorStyleBlack = "indicator-black";
const PKScrollViewIndicatorStyleWhite = "indicator-white";
PKScrollView.inherits = PKView;
PKScrollView.synthetizes = ["contentOffset", "contentSize", "indicatorStyle", "scrollEnabled"];

function PKScrollView() {
    this.callSuper();
    this._contentOffset = new PKPoint();
    this._contentSize = PKScrollViewAutomatedContentSize;
    this.adjustedContentSize = new PKSize();
    this.tracking = false;
    this.dragging = false;
    this.horizontalScrollEnabled = true;
    this.verticalScrollEnabled = true;
    this.decelerating = false;
    this.decelerationTimer = null;
    this._indicatorStyle = "";
    this.showsHorizontalScrollIndicator = true;
    this.showsVerticalScrollIndicator = true;
    this.scrollIndicatorsNeedFlashing = false;
    this.pagingEnabled = false;
    this.bounces = true;
    this.clipsToBounds = true;
    this.delegate = null;
    this.layer.addEventListener("webkitTransitionEnd", this, false);
    this.hostingLayer.addEventListener("webkitTransitionEnd", this, false);
    this.indicatorStyle = PKScrollViewIndicatorStyleDefault;
    this.tracksTouchesOnceTouchesBegan = true;
    this.layer.addEventListener(PKStartEvent, this, true);
    this.delaysContentTouches = true;
    this.canCancelContentTouches = true;
    this._scrollEnabled = true;
}
PKScrollView.prototype.createLayer = function () {
    this.callSuper();
    this.layer.addClassName("pk-scroll-view");
    this.horizontalScrollIndicator = new PKScrollIndicator(PKScrollIndicatorTypeHorizontal);
    this.verticalScrollIndicator = new PKScrollIndicator(PKScrollIndicatorTypeVertical);
    this.layer.appendChild(this.horizontalScrollIndicator.layer);
    this.layer.appendChild(this.verticalScrollIndicator.layer);
    this.hostingLayer = this.layer.insertBefore(document.createElement("div"), this.horizontalScrollIndicator.layer);
    this.hostingLayer.className = "hosting-layer";
};
PKScrollView.prototype.setSize = function (a) {
    this.callSuper(a);
    this.adjustContentSize();
};
PKScrollView.prototype.setScrollEnabled = function (a) {
    this._scrollEnabled = a;
    if (!a) {
        this.stopTrackingTouches();
    }
};
PKScrollView.prototype.setContentOffset = function (a) {
    this.setContentOffsetWithAnimation(a, false);
};
PKScrollView.prototype.setContentOffsetWithAnimation = function (b, a) {
    this._contentOffset = b;
    this.hostingLayer.style.webkitTransform = PKUtils.t(this._contentOffset.x, this._contentOffset.y);
    if (a) {
        this.scrollTransitionsNeedRemoval = true;
        this.hostingLayer.style.webkitTransitionDuration = PKScrollViewPagingTransitionDuration;
    } else {
        this.didScroll(false);
    }
    if (!a) {
        if (this.horizontalScrollEnabled && this.showsHorizontalScrollIndicator) {
            this.updateHorizontalScrollIndicator();
        }
        if (this.verticalScrollEnabled && this.showsVerticalScrollIndicator) {
            this.updateVerticalScrollIndicator();
        }
    }
    this.notifyPropertyChange("contentOffset");
};
PKScrollView.prototype.snapContentOffsetToBounds = function (a) {
    var b = false;
    var c = new PKPoint();
    if (this.pagingEnabled) {
        c.x = Math.round(this._contentOffset.x / this.size.width) * this.size.width;
        c.y = Math.round(this._contentOffset.y / this.size.height) * this.size.height;
        b = true;
    } else {
        if (this.bounces) {
            c.x = Math.min(Math.max(this.minPoint.x, this._contentOffset.x), 0);
            c.y = Math.min(Math.max(this.minPoint.y, this._contentOffset.y), 0);
            b = (c.x != this._contentOffset.x || c.y != this._contentOffset.y);
        }
    }
    if (b) {
        this.setContentOffsetWithAnimation(c, a);
    }
};
PKScrollView.prototype.getContentSize = function () {
    var c = this._contentSize;
    if (c === PKScrollViewAutomatedContentSize) {
        c = new PKSize(this._hostingLayer.offsetWidth, this._hostingLayer.offsetHeight);
        if (this.subviews.length) {
            for (var a = 0; a < this.subviews.length; a++) {
                var b = this.subviews[a];
                c.width = Math.max(c.width, b.position.x + b.size.width);
                c.height = Math.max(c.height, b.position.y + b.size.height);
            }
        }
    }
    return c;
};
PKScrollView.prototype.adjustContentSize = function () {
    this.adjustedContentSize.width = Math.max(this.size.width, this.contentSize.width);
    this.adjustedContentSize.height = Math.max(this.size.height, this.contentSize.height);
};
PKScrollView.prototype.setIndicatorStyle = function (a) {
    this._indicatorStyle = a;
    this.horizontalScrollIndicator.style = a;
    this.verticalScrollIndicator.style = a;
};
PKScrollView.prototype.updateHorizontalScrollIndicator = function () {
    var c = (this.verticalScrollEnabled && this.showsVerticalScrollIndicator) ? PKScrollIndicatorEndSize * 2 : 1;
    var d = Math.max(PKScrollViewMinIndicatorLength, Math.round((this._size.width / this.adjustedContentSize.width) * (this._size.width - c)));
    var a = (-this._contentOffset.x / (this.adjustedContentSize.width - this._size.width)) * (this._size.width - c - d);
    var b = this._size.height - PKScrollIndicatorThickness - 1;
    if (this._contentOffset.x > 0) {
        d = Math.round(Math.max(d - this._contentOffset.x, PKScrollIndicatorThickness));
        a = 1;
    } else {
        if (this._contentOffset.x < -(this.adjustedContentSize.width - this._size.width)) {
            d = Math.round(Math.max(d + this.adjustedContentSize.width - this._size.width + this.contentOffset.x, PKScrollIndicatorThickness));
            a = this._size.width - d - c;
        }
    }
    this.horizontalScrollIndicator.position = new PKPoint(a, b);
    this.horizontalScrollIndicator.width = d;
};
PKScrollView.prototype.updateVerticalScrollIndicator = function () {
    var c = (this.horizontalScrollEnabled && this.showsHorizontalScrollIndicator) ? PKScrollIndicatorEndSize * 2 : 1;
    var d = Math.max(PKScrollViewMinIndicatorLength, Math.round((this._size.height / this.adjustedContentSize.height) * (this._size.height - c)));
    var a = this._size.width - PKScrollIndicatorThickness - 1;
    var b = (-this._contentOffset.y / (this.adjustedContentSize.height - this._size.height)) * (this._size.height - c - d);
    if (this._contentOffset.y > 0) {
        d = Math.round(Math.max(d - this._contentOffset.y, PKScrollIndicatorThickness));
        b = 1;
    } else {
        if (this._contentOffset.y < -(this.adjustedContentSize.height - this._size.height)) {
            d = Math.round(Math.max(d + this.adjustedContentSize.height - this._size.height + this.contentOffset.y, PKScrollIndicatorThickness));
            b = this._size.height - d - c;
        }
    }
    this.verticalScrollIndicator.position = new PKPoint(a, b);
    this.verticalScrollIndicator.height = d;
};
PKScrollView.prototype.flashScrollIndicators = function (a) {
    if (a) {
        this.scrollIndicatorsNeedFlashing = true;
        return;
    }
    if (this.horizontalScrollEnabled && this.showsHorizontalScrollIndicator && (this.adjustedContentSize.width > this.size.width)) {
        this.updateHorizontalScrollIndicator();
        this.horizontalScrollIndicator.flash();
    }
    if (this.verticalScrollEnabled && this.showsVerticalScrollIndicator && (this.adjustedContentSize.height > this.size.height)) {
        this.updateVerticalScrollIndicator();
        this.verticalScrollIndicator.flash();
    }
};
PKScrollView.prototype.hideScrollIndicators = function () {
    this.horizontalScrollIndicator.visible = false;
    this.verticalScrollIndicator.visible = false;
};
PKScrollView.prototype.handleEvent = function (a) {
    this.callSuper(a);
    if (a.type == "webkitTransitionEnd") {
        this.transitionEnded(a);
    }
};
PKScrollView.prototype.touchesBegan = function (a) {
    if (!this._scrollEnabled) {
        return;
    }
    if (a.eventPhase == Event.CAPTURING_PHASE) {
        if (a._manufactured) {
            return;
        }
        this.originalTarget = (PKSupportsTouches ? a.touches[0] : a).target;
        if (this.delaysContentTouches) {
            a.stopPropagation();
            this.callMethodNameAfterDelay("beginTouchesInContent", PKScrollViewContentTouchesDelay, a);
            this.beginTracking(a);
        }
    } else {
        this.beginTracking(a);
    }
};
PKScrollView.prototype.beginTouchesInContent = function (a) {
    if (this.tracking && !this.dragging) {
        var b = PKUtils.createUIEvent(PKStartEvent, a);
        b._manufactured = true;
        this.originalTarget.dispatchEvent(b);
        if (!this.canCancelContentTouches) {
            this.touchesEnded(PKUtils.createUIEvent(PKEndEvent, a));
        }
    }
};
PKScrollView.prototype.beginTracking = function (a) {
    if (this.tracking) {
        return;
    }
    a.preventDefault();
    this.stopDecelerationAnimation();
    this.hostingLayer.style.webkitTransitionDuration = 0;
    this.adjustContentSize();
    this.minPoint = new PKPoint(this.size.width - this.adjustedContentSize.width, this.size.height - this.adjustedContentSize.height);
    this.snapContentOffsetToBounds(false);
    this.startPosition = this._contentOffset;
    this.startTouchPosition = PKPoint.fromEvent(a);
    this.startTime = a.timeStamp;
    this.startTimePosition = this.contentOffset.copy();
    this.tracking = true;
    this.dragging = false;
    this.touchesHaveMoved = false;
    window.addEventListener(PKMoveEvent, this, true);
    window.addEventListener(PKEndEvent, this, true);
    window.addEventListener("touchcancel", this, true);
    window.addEventListener(PKEndEvent, this, false);
};
PKScrollView.prototype.touchesMoved = function (d) {
    this.touchesHaveMoved = true;
    this.callSuper(d);
    var e = PKPoint.fromEvent(d);
    var b = e.x - this.startTouchPosition.x;
    var c = e.y - this.startTouchPosition.y;
    if (!this.dragging) {
        if ((Math.abs(b) >= PKScrollViewMinimumTrackingForDrag && this.horizontalScrollEnabled) || (Math.abs(c) >= PKScrollViewMinimumTrackingForDrag && this.verticalScrollEnabled)) {
            if (PKUtils.objectHasMethod(this.delegate, PKScrollViewWillBeginDragging)) {
                this.delegate[PKScrollViewWillBeginDragging](this);
            }
            this.dragging = true;
            this.firstDrag = true;
            if (this.horizontalScrollEnabled && this.showsHorizontalScrollIndicator && (this.adjustedContentSize.width > this.size.width)) {
                this.horizontalScrollIndicator.visible = true;
            }
            if (this.verticalScrollEnabled && this.showsVerticalScrollIndicator && (this.adjustedContentSize.height > this.size.height)) {
                this.verticalScrollIndicator.visible = true;
            }
        }
    }
    if (this.dragging) {
        d.stopPropagation();
        var f = this.horizontalScrollEnabled ? (this.startPosition.x + b) : this._contentOffset.x;
        var a = this.verticalScrollEnabled ? (this.startPosition.y + c) : this._contentOffset.y;
        if (this.bounces) {
            f -= ((f < this.minPoint.x) ? (f - this.minPoint.x) : ((f > 0) ? f : 0)) / 2;
            a -= ((a < this.minPoint.y) ? (a - this.minPoint.y) : ((a > 0) ? a : 0)) / 2;
        } else {
            f = Math.min(Math.max(this.minPoint.x, f), 0);
            a = Math.min(Math.max(this.minPoint.y, a), 0);
        }
        if (this.firstDrag) {
            this.firstDrag = false;
            this.startTouchPosition = e;
            return;
        }
        this.contentOffset = new PKPoint(f, a);
        this.lastEventTime = d.timeStamp;
        if (this.lastEventTime - this.scrollStartTime > PKScrollViewMaxTrackingTime) {
            this.startTime = this.lastEventTime;
            this.startTimePosition = this.contentOffset.copy();
        }
    }
};
PKScrollView.prototype.touchesEnded = function (a) {
    this.callSuper(a);
    this.tracking = false;
    if (this.dragging) {
        this.dragging = false;
        a.stopPropagation();
        if (a.timeStamp - this.lastEventTime <= PKScrollViewMaxTrackingTime) {
            this._contentOffsetBeforeDeceleration = this._contentOffset.copy();
            this.startDecelerationAnimation();
        }
        if (!this.decelerating) {}
        window.removeEventListener(PKEndEvent, this, false);
        if (PKUtils.objectHasMethod(this.delegate, PKScrollViewDidEndDragging)) {
            this.delegate[PKScrollViewDidEndDragging](this);
        }
    }
    if (!this.decelerating) {
        this.snapContentOffsetToBounds(true);
        this.hideScrollIndicators();
    }
    if (a.eventPhase == Event.BUBBLING_PHASE) {
        window.removeEventListener(PKEndEvent, this, false);
        if (!this.touchesHaveMoved && this.originalTarget !== null && a.type == PKEndEvent) {
            this.activateOriginalTarget();
        }
    }
};
PKScrollView.prototype.touchesCancelled = function (a) {
    this.callSuper(a);
    this.touchesEnded(a);
};
PKScrollView.prototype.stopTrackingTouches = function () {
    if (!this.tracking) {
        return;
    }
    this.tracking = false;
    if (this.dragging) {
        this.dragging = false;
        this.snapContentOffsetToBounds(true);
        if (PKUtils.objectHasMethod(this.delegate, PKScrollViewDidEndDragging)) {
            this.delegate[PKScrollViewDidEndDragging](this);
        }
        this.hideScrollIndicators();
    }
    window.removeEventListener(PKMoveEvent, this, true);
    window.removeEventListener(PKEndEvent, this, true);
    window.removeEventListener(PKEndEvent, this, false);
    window.removeEventListener("touchcancel", this, true);
};
PKScrollView.prototype.transitionEnded = function (a) {
    if (this.scrollIndicatorsNeedFlashing && a.currentTarget === this.layer) {
        this.scrollIndicatorsNeedFlashing = false;
        this.flashScrollIndicators();
    }
    if (this.scrollTransitionsNeedRemoval && a.currentTarget === this.hostingLayer) {
        this.scrollTransitionsNeedRemoval = false;
        this.hostingLayer.style.webkitTransitionDuration = 0;
        this.didScroll(true);
    }
};
PKScrollView.prototype.didScroll = function (a) {
    if (a && PKUtils.objectHasMethod(this.delegate, PKScrollViewDidEndScrollingAnimation)) {
        this.delegate[PKScrollViewDidEndScrollingAnimation](this);
    }
    if (PKUtils.objectHasMethod(this.delegate, PKScrollViewDidScroll)) {
        this.delegate[PKScrollViewDidScroll](this);
    }
};
PKScrollView.prototype.startDecelerationAnimation = function () {
    var a = new PKPoint(this._contentOffset.x - this.startTimePosition.x, this._contentOffset.y - this.startTimePosition.y);
    var b = (event.timeStamp - this.startTime) / PKScrollViewAcceleration;
    this.decelerationVelocity = new PKPoint(a.x / b, a.y / b);
    this.minDecelerationPoint = this.minPoint.copy();
    this.maxDecelerationPoint = new PKPoint(0, 0);
    if (this.pagingEnabled) {
        this.minDecelerationPoint.x = Math.max(this.minPoint.x, Math.floor(this._contentOffsetBeforeDeceleration.x / this.size.width) * this.size.width);
        this.minDecelerationPoint.y = Math.max(this.minPoint.y, Math.floor(this._contentOffsetBeforeDeceleration.y / this.size.height) * this.size.height);
        this.maxDecelerationPoint.x = Math.min(0, Math.ceil(this._contentOffsetBeforeDeceleration.x / this.size.width) * this.size.width);
        this.maxDecelerationPoint.y = Math.min(0, Math.ceil(this._contentOffsetBeforeDeceleration.y / this.size.height) * this.size.height);
    }
    this.penetrationDeceleration = PKScrollViewPenetrationDeceleration;
    this.penetrationAcceleration = PKScrollViewPenetrationAcceleration;
    if (this.pagingEnabled) {
        this.penetrationDeceleration *= 5;
    }
    var c = this.pagingEnabled ? PKScrollViewMinVelocityForDecelerationWithPaging : PKScrollViewMinVelocityForDeceleration;
    if (Math.abs(this.decelerationVelocity.x) > c || Math.abs(this.decelerationVelocity.y) > c) {
        this.decelerating = true;
        this.decelerationTimer = this.callMethodNameAfterDelay("stepThroughDecelerationAnimation", PKScrollViewDesiredAnimationFrameRate);
        this.lastFrame = new Date();
        if (PKUtils.objectHasMethod(this.delegate, PKScrollViewWillBeginDecelerating)) {
            this.delegate[PKScrollViewWillBeginDecelerating](this);
        }
    }
};
PKScrollView.prototype.stopDecelerationAnimation = function () {
    this.decelerating = false;
    clearTimeout(this.decelerationTimer);
};
PKScrollView.prototype.stepThroughDecelerationAnimation = function (f) {
    if (!this.decelerating) {
        return;
    }
    var d = new Date();
    var k = d - this.lastFrame;
    var l = f ? 0 : (Math.round(k / PKScrollViewDesiredAnimationFrameRate) - 1);
    for (var j = 0; j < l; j++) {
        this.stepThroughDecelerationAnimation(true);
    }
    var g = this.contentOffset.x + this.decelerationVelocity.x;
    var h = this.contentOffset.y + this.decelerationVelocity.y;
    if (!this.bounces) {
        var a = Math.min(Math.max(this.minPoint.x, g), 0);
        if (a != g) {
            g = a;
            this.decelerationVelocity.x = 0;
        }
        var c = Math.min(Math.max(this.minPoint.y, h), 0);
        if (c != h) {
            h = c;
            this.decelerationVelocity.y = 0;
        }
    }
    if (f) {
        this.contentOffset.x = g;
        this.contentOffset.y = h;
    } else {
        this.contentOffset = new PKPoint(g, h);
    }
    if (!this.pagingEnabled) {
        this.decelerationVelocity.x *= PKScrollViewDecelerationFrictionFactor;
        this.decelerationVelocity.y *= PKScrollViewDecelerationFrictionFactor;
    }
    var b = Math.abs(this.decelerationVelocity.x);
    var i = Math.abs(this.decelerationVelocity.y);
    if (!f && b <= PKScrollViewMinimumVelocityToHideScrollIndicators && i <= PKScrollViewMinimumVelocityToHideScrollIndicators) {
        this.hideScrollIndicators();
        if (b <= PKScrollViewMinimumVelocity && i <= PKScrollViewMinimumVelocity) {
            this.decelerating = false;
            if (PKUtils.objectHasMethod(this.delegate, PKScrollViewDidEndDecelerating)) {
                this.delegate[PKScrollViewDidEndDecelerating](this);
            }
            return;
        }
    }
    if (!f) {
        this.decelerationTimer = this.callMethodNameAfterDelay("stepThroughDecelerationAnimation", PKScrollViewDesiredAnimationFrameRate);
    }
    if (this.bounces) {
        var e = new PKPoint(0, 0);
        if (g < this.minDecelerationPoint.x) {
            e.x = this.minDecelerationPoint.x - g;
        } else {
            if (g > this.maxDecelerationPoint.x) {
                e.x = this.maxDecelerationPoint.x - g;
            }
        }
        if (h < this.minDecelerationPoint.y) {
            e.y = this.minDecelerationPoint.y - h;
        } else {
            if (h > this.maxDecelerationPoint.y) {
                e.y = this.maxDecelerationPoint.y - h;
            }
        }
        if (e.x != 0) {
            if (e.x * this.decelerationVelocity.x <= 0) {
                this.decelerationVelocity.x += e.x * this.penetrationDeceleration;
            } else {
                this.decelerationVelocity.x = e.x * this.penetrationAcceleration;
            }
        }
        if (e.y != 0) {
            if (e.y * this.decelerationVelocity.y <= 0) {
                this.decelerationVelocity.y += e.y * this.penetrationDeceleration;
            } else {
                this.decelerationVelocity.y = e.y * this.penetrationAcceleration;
            }
        }
    }
    if (!f) {
        this.lastFrame = d;
    }
};
PKScrollView.prototype.activateOriginalTarget = function () {
    var b = this.originalTarget;
    while (b.parentNode && b !== this.hostingLayer) {
        if (b.nodeType == Node.ELEMENT_NODE) {
            if (PKScrollViewClickableElementNames.indexOf(b.localName) != -1) {
                break;
            }
        }
        b = b.parentNode;
    }
    if (!PKSupportsTouches) {
        return;
    }
    var a = document.createEvent("MouseEvent");
    a.initMouseEvent("click", true, true, document.defaultView, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null);
    a._manufactured = true;
    b.dispatchEvent(a);
};
PKClass(PKScrollView);
const PKTableViewCellForRowAtPath = "tableViewCellForRowAtPath";
const PKTableViewNumberOfSectionsInTableView = "numberOfSectionsInTableView";
const PKTableViewNumberOfRowsInSection = "tableViewNumberOfRowsInSection";
const PKTableViewTitleForHeaderInSection = "tableViewTitleForHeaderInSection";
const PKTableViewTitleForFooterInSection = "tableViewTitleForFooterInSection";
const PKTableViewCustomCellForRowAtPath = "tableViewCustomCellForRowAtPath";
const PKTableViewDidSelectRowAtPath = "tableViewDidSelectRowAtPath";
const PKTableViewDidSelectAccessoryForRowAtPath = "tableViewDidSelectAccessoryForRowAtPath";
const PKTableViewCustomCellCSS = "pk-custom-table-view-cell";
const PKTableViewStylePlain = "plain";
const PKTableViewStyleCustom = "custom";
const PKTableViewStyleGrouped = "grouped";
const PKTableViewMinTouchDurationForCellSelection = 150;
PKTableView.inherits = PKScrollView;
PKTableView.synthetizes = ["style"];
PKTableView.includes = [PKPropertyTriage];

function PKTableView() {
    this.callSuper();
    this._style = PKTableViewStyleCustom;
    this.horizontalScrollEnabled = false;
    this.dataSource = null;
    this.touchedCell = null;
    this.numberOfSections = 1;
    this.numberOfRows = [];
    this.sections = [];
    this.headers = [];
    this.sectionMetrics = [];
    this.selectedCell = null;
    this.inTree = false;
    this.populated = false;
}
PKTableView.prototype.createLayer = function () {
    this.callSuper();
    this.layer.addClassName("pk-table-view");
};
PKTableView.prototype.setStyle = function (a) {
    this.layer.removeClassName(this._style);
    this.layer.addClassName(a);
    this._style = a;
    this[((a === PKTableViewStylePlain) ? "add" : "remove") + "PropertyObserver"]("contentOffset", this);
};
PKTableView.prototype.numberOfRowsInSection = function (a) {
    if (a > this.numberOfSections - 1) {
        return;
    }
    return this.numberOfRows[a];
};
PKTableView.prototype.cellForRowAtPath = function (a) {
    if (this._style === PKTableViewStyleCustom || a.section > this.numberOfSections - 1 || a.row > this.numberOfRows[a.section]) {
        return null;
    }
    return this.hostingLayer.querySelector(".section:nth-of-type(" + (a.section + 1) + ") > div:nth-of-type(" + (a.row + 1) + ")")._view;
};
PKTableView.prototype.customCellForRowAtPath = function (a) {
    if (this._style !== PKTableViewStyleCustom || a.section > this.numberOfSections - 1 || a.row > this.numberOfRows[a.section]) {
        return null;
    }
    return this.hostingLayer.querySelector(".section:nth-of-type(" + (a.section + 1) + ") > ." + PKTableViewCustomCellCSS + ":nth-of-type(" + (a.row + 1) + ")");
};
PKTableView.prototype.pathForCell = function (a) {
    if (this._style === PKTableViewStyleCustom) {
        return null;
    }
    return a._tableViewDataSourcePath;
};
PKTableView.prototype.pathForCustomCell = function (a) {
    if (this._style !== PKTableViewStyleCustom) {
        return null;
    }
    return a._tableViewDataSourcePath;
};
PKTableView.prototype.becameDescendantOfRootView = function () {
    this.inTree = true;
    this.notifyCellsOfRootViewDescendancy();
};
PKTableView.prototype.notifyCellsOfRootViewDescendancy = function () {
    if (!this.inTree || !this.populated) {
        return;
    }
    var a = this.hostingLayer.querySelectorAll(".pk-table-view-cell");
    for (var b = 0; b < a.length; b++) {
        a[b]._view.becameDescendantOfRootView();
    }
};
PKTableView.prototype.reloadData = function () {
    var c = (this._style === PKTableViewStyleCustom);
    if (c) {
        if (!PKUtils.objectHasMethod(this.dataSource, PKTableViewCustomCellForRowAtPath) || !PKUtils.objectHasMethod(this.dataSource, PKTableViewNumberOfRowsInSection)) {
            console.error("A PKTableView's dataSource must implement all required methods");
            return;
        }
    } else {
        if (!PKUtils.objectHasMethod(this.dataSource, PKTableViewCellForRowAtPath) || !PKUtils.objectHasMethod(this.dataSource, PKTableViewNumberOfRowsInSection)) {
            console.error("A PKTableView's dataSource must implement all required methods");
            return;
        }
    }
    this._hostingLayer.innerText = "";
    this.sections = [];
    this.headers = [];
    if (PKUtils.objectHasMethod(this.dataSource, PKTableViewNumberOfSectionsInTableView)) {
        this.numberOfSections = this.dataSource[PKTableViewNumberOfSectionsInTableView](this);
        if (this.numberOfSections < 1) {
            console.error("A PKTableView must have at least one section");
            return;
        }
    }
    for (var i = 0; i < this.numberOfSections; i++) {
        var d = document.createElement("div");
        d.className = "section";
        this.sections[i] = d;
        if (PKUtils.objectHasMethod(this.dataSource, PKTableViewTitleForHeaderInSection)) {
            var a = this.dataSource[PKTableViewTitleForHeaderInSection](this, i);
            if (a !== null) {
                var k = d.appendChild(document.createElement("h1"));
                k.innerText = a;
                this.headers[i] = k;
            }
        }
        var g = this.dataSource[PKTableViewNumberOfRowsInSection](this, i);
        for (var f = 0; f < g; f++) {
            var e = new PKCellPath(i, f);
            if (c) {
                var h = this.dataSource[PKTableViewCustomCellForRowAtPath](this, e);
                h.addClassName(PKTableViewCustomCellCSS);
                h._tableViewDataSourcePath = e;
                d.appendChild(h);
            } else {
                var h = this.dataSource[PKTableViewCellForRowAtPath](this, e);
                h._tableViewDataSourcePath = e;
                d.appendChild(h.layer);
            }
        }
        if (PKUtils.objectHasMethod(this.dataSource, PKTableViewTitleForFooterInSection)) {
            var j = this.dataSource[PKTableViewTitleForFooterInSection](this, i);
            if (j !== null) {
                d.appendChild(document.createElement("span")).innerText = j;
            }
        }
        this.numberOfRows[i] = g;
        this._hostingLayer.appendChild(d);
    }
    if (this._style === PKTableViewStylePlain) {
        this.sectionMetrics = [];
        for (var b = 0; b < this.sections.length; b++) {
            this.sectionMetrics[b] = {
                y: this.sections[b].offsetTop,
                height: this.sections[b].offsetHeight
            };
        }
    }
    this.populated = true;
    this.notifyCellsOfRootViewDescendancy();
};
PKTableView.prototype.touchesBegan = function (d) {
    if (d._manufactured) {
        return;
    }
    this.wasDeceleratingWhenTouchesBegan = this.decelerating;
    this.callSuper(d);
    this.touchedCell = null;
    this.touchedAccessory = null;
    if (this.wasDeceleratingWhenTouchesBegan || !this.tracking) {
        return;
    }
    var c = document.elementFromPoint(this.startTouchPosition.x, this.startTouchPosition.y);
    if (this._style === PKTableViewStyleCustom) {
        var a = c;
        while (a.parentNode) {
            if (a.hasClassName(PKTableViewCustomCellCSS)) {
                this.touchedCell = a;
                this.touchedCellWasSelected = this.touchedCell.hasClassName(PKControlStateSelectedCSS);
                break;
            }
            a = a.parentNode;
        }
    } else {
        var b = (c._view !== undefined) ? c._view : c.getNearestView();
        if (b instanceof PKTableViewCell) {
            this.touchedCell = b;
            this.touchedCellWasSelected = this.touchedCell.selected;
        } else {
            if (b instanceof PKBarButtonItem) {
                this.touchedAccessory = b;
            }
        }
    }
    if (this.touchedCell !== null) {
        this.callMethodNameAfterDelay("highlightTouchedCell", PKTableViewMinTouchDurationForCellSelection);
    }
};
PKTableView.prototype.touchesMoved = function (b) {
    var a = this.dragging;
    this.callSuper(b);
    if (this.wasDeceleratingWhenTouchesBegan) {
        return;
    }
    if (a != this.dragging && this.touchedCell !== null && !this.touchedCellWasSelected) {
        if (this.touchedCell instanceof PKTableViewCell) {
            this.touchedCell.selected = false;
        } else {
            this.touchedCell.removeClassName(PKControlStateSelectedCSS);
        }
    }
};
PKTableView.prototype.touchesEnded = function (b) {
    var c = this.dragging;
    this.callSuper(b);
    if (this.wasDeceleratingWhenTouchesBegan) {
        return;
    }
    if (b.type != PKEndEvent) {
        return;
    }
    if (b.eventPhase == Event.CAPTURING_PHASE && this.touchedAccessory !== null) {
        var a = this.touchedAccessory.superview;
        if (a.accessoryType === PKTableViewCellAccessoryDetailDisclosureButton) {
            this.disclosureButtonWasSelectedAtPath(a._tableViewDataSourcePath);
        }
    } else {
        if (b.eventPhase == Event.BUBBLING_PHASE && !c && this.touchedCell !== null) {
            this.selectRowAtPath(this.touchedCell._tableViewDataSourcePath);
        }
    }
};
PKTableView.prototype.pathForSelectedRow = function () {
    if (this.selectedCell === null) {
        return null;
    }
    return (this._style === PKTableViewStyleCustom) ? this.pathForCustomCell(this.selectedCell) : this.pathForCell(this.selectedCell);
};
PKTableView.prototype.deselectRowAtPathAnimated = function (b, c) {
    if (b === null) {
        return;
    }
    var a = (this._style === PKTableViewStyleCustom) ? this.customCellForRowAtPath(b) : this.cellForRowAtPath(b);
    if (a !== null) {
        this.markCellAsSelectedAnimated(a, false, c);
    }
};
PKTableView.prototype.selectRowAtPath = function (b) {
    var a = (this._style === PKTableViewStyleCustom) ? this.customCellForRowAtPath(b) : this.cellForRowAtPath(b);
    if (a === null) {
        throw (new Error("No cell at " + b.toString()));
        return;
    }
    this.deselectRowAtPathAnimated(this.pathForSelectedRow(), false);
    this.selectedCell = a;
    this.markCellAsSelectedAnimated(this.selectedCell, true, false);
    if (PKUtils.objectHasMethod(this.delegate, PKTableViewDidSelectRowAtPath)) {
        this.delegate[PKTableViewDidSelectRowAtPath](this, b);
    }
};
PKTableView.prototype.highlightTouchedCell = function () {
    if (this.touchedCell !== null && !this.dragging && this.tracking) {
        this.markCellAsSelectedAnimated(this.touchedCell, true, false);
    }
};
PKTableView.prototype.markCellAsSelectedAnimated = function (a, c, b) {
    if (a instanceof PKTableViewCell) {
        a.setSelectedAnimated(c, b);
    } else {
        a[c ? "addClassName" : "removeClassName"](PKControlStateSelectedCSS);
    }
};
PKTableView.prototype.disclosureButtonWasSelectedAtPath = function (b) {
    var a = this.cellForRowAtPath(b);
    if (a.accessoryType === PKTableViewCellAccessoryDetailDisclosureButton && PKUtils.objectHasMethod(this.delegate, PKTableViewDidSelectAccessoryForRowAtPath)) {
        this.delegate[PKTableViewDidSelectAccessoryForRowAtPath](this, b);
    }
};
const PKTableViewPlainHeaderHeight = 23;
PKTableView.prototype.handleContentOffsetChange = function () {
    this.updateSectionHeaders();
};
PKTableView.prototype.updateSectionHeaders = function () {
    var h = -this.contentOffset.y;
    for (var c = 0; c < this.numberOfSections; c++) {
        var b = this.headers[c];
        if (b === undefined) {
            continue;
        }
        var d = this.sectionMetrics[c];
        var e = d.y;
        var f = e + d.height;
        var g = f - h;
        var a = 0;
        if (g > 0 && g < (PKTableViewPlainHeaderHeight - 1)) {
            a = d.height - PKTableViewPlainHeaderHeight;
        } else {
            if (e <= h && f > h) {
                a = Math.abs(e - h) - 1;
            }
        }
        b.style.webkitTransform = PKUtils.t(0, a);
    }
};
PKClass(PKTableView);
PKTableView.init = function () {
    PKUtils.preloadImageAsset("tableview/UITableSelection.png");
};
window.addEventListener("load", PKTableView.init, false);

function PKCellPath(a, b) {
    this.section = a || 0;
    this.row = b || 0;
}
PKCellPath.prototype.toString = function () {
    return "PKCellPath with section " + this.section + " and row " + this.row;
};
const PKTableViewCellAccessoryNone = "no-accessory";
const PKTableViewCellAccessoryDisclosureIndicator = "disclosure-accessory";
const PKTableViewCellAccessoryDetailDisclosureButton = "detail-accessory";
const PKTableViewCellSelectionStyleNone = "no-selection";
const PKTableViewCellSelectionStyleBlue = "blue-selection";
const PKTableViewCellSelectionStyleGray = "gray-selection";
const PKTableViewCellStyleDefault = "style-default";
const PKTableViewCellStyleValue1 = "style-value-1";
const PKTableViewCellStyleValue2 = "style-value-2";
const PKTableViewCellStyleSubtitle = "style-subtitle";
PKTableViewCell.inherits = PKView;
PKTableViewCell.synthetizes = ["text", "detailedText", "selectionStyle", "accessoryType", "selected"];

function PKTableViewCell(a) {
    this.style = a || PKTableViewCellStyleDefault;
    this.callSuper();
    this._selectionStyle = PKTableViewCellSelectionStyleBlue;
    this._accessoryType = PKTableViewCellAccessoryNone;
    this._selected = false;
    this.inTree = false;
    this.layer.removeEventListener(PKStartEvent, this, false);
}
PKTableViewCell.prototype.createLayer = function () {
    this.callSuper();
    this.layer.addClassName("pk-table-view-cell " + this.style);
    this.layer.setAttribute("role", "button");
    this.accessory = new PKBarButtonItem(PKBarButtonItemTypePlain);
    this.accessory.image = new PKImage(PKUtils.assetsPath + "pixel.png");
    this.addSubview(this.accessory);
    this.accessory.touchLayer.removeEventListener(PKStartEvent, this.accessory, false);
    this.textLabel = this.layer.appendChild(document.createElement("span"));
    this.textLabel.addClassName("text-label");
    this.detailedTextLabel = this.layer.appendChild(document.createElement("span"));
    this.detailedTextLabel.addClassName("detailed-text-label");
};
PKTableViewCell.prototype.getText = function () {
    return this.textLabel.innerText;
};
PKTableViewCell.prototype.setText = function (a) {
    this.textLabel.innerText = a;
    this.updateTextLayout();
};
PKTableViewCell.prototype.getDetailedText = function () {
    return this.detailedTextLabel.innerText;
};
PKTableViewCell.prototype.setDetailedText = function (a) {
    this.detailedTextLabel.innerText = a;
    this.updateTextLayout();
};
PKTableViewCell.prototype.setSelectionStyle = function (a) {
    this.layer.removeClassName(this._selectionStyle);
    this.layer.addClassName(a);
    this._selectionStyle = a;
};
const PKTableViewCellAccessoryDisclosureIndicatorWidth = 10;
const PKTableViewCellAccessoryDetailDisclosureButtonWidth = 29;
PKTableViewCell.prototype.setAccessoryType = function (a) {
    this.layer.removeClassName(this._accessoryType);
    this.layer.addClassName(a);
    this._accessoryType = a;
    if (a === PKTableViewCellAccessoryDisclosureIndicator) {
        this.accessory.width = PKTableViewCellAccessoryDisclosureIndicatorWidth;
    } else {
        if (a === PKTableViewCellAccessoryDetailDisclosureButton) {
            this.accessory.width = PKTableViewCellAccessoryDetailDisclosureButtonWidth;
        }
    }
};
PKTableViewCell.prototype.setSelected = function (a) {
    this.setSelectedAnimated(a, false);
};
PKTableViewCell.prototype.setSelectedAnimated = function (a, b) {
    if (this._selected == a) {
        return;
    }
    this._selected = a;
    this.layer[a ? "addClassName" : "removeClassName"](PKControlStateSelectedCSS);
};
PKTableViewCell.prototype.becameDescendantOfRootView = function () {
    this.callSuper();
    this.inTree = true;
    this.updateTextLayout();
};
const PKTableViewCellStyleValue1Margin = 10;
PKTableViewCell.prototype.updateTextLayout = function () {
    if (this.style != PKTableViewCellStyleValue1 || !this.inTree) {
        return;
    }
    var c = this.textLabel.offsetWidth - 2 * PKTableViewCellStyleValue1Margin;
    this.textLabel.style.right = "auto !important";
    this.detailedTextLabel.style.right = "auto !important";
    var d = Math.min(this.textLabel.offsetWidth, c);
    var a = Math.min(this.detailedTextLabel.offsetWidth, c);
    this.textLabel.setAttribute("style", "");
    this.detailedTextLabel.setAttribute("style", "");
    if (d + a > c) {
        var b = Math.floor((d / (d + a)) * c);
        if (d > a) {
            this.textLabel.style.width = PKUtils.px(b);
            this.detailedTextLabel.style.left = PKUtils.px(b + PKTableViewCellStyleValue1Margin * 2);
        } else {
            this.textLabel.style.width = PKUtils.px(b + PKTableViewCellStyleValue1Margin);
            this.detailedTextLabel.style.left = PKUtils.px(b + PKTableViewCellStyleValue1Margin * 3);
        }
    }
};
PKClass(PKTableViewCell);
const PKToolbarHeight = 44;
const PKToolbarEdgeMargin = 6;
const PKToolbarItemMargin = 10;
const PKToolbarStyleDefault = "default";
const PKToolbarStyleBlack = "black";
const PKToolbarStyleBlackTranslucent = "black-translucent";
PKToolbar.inherits = PKView;
PKToolbar.synthetizes = ["items", "style"];

function PKToolbar() {
    this._items = [];
    this._style = "";
    this.callSuper();
    this.layer.addEventListener("webkitTransitionEnd", this, false);
    this.style = PKToolbarStyleDefault;
    this.clipsToBounds = true;
}
PKToolbar.prototype.createLayer = function () {
    this.callSuper();
    this.layer.addClassName("pk-toolbar");
    this.glow = this.layer.appendChild(document.createElement("div"));
    this.glow.className = "glow";
};
PKToolbar.prototype.setSize = function (a) {
    a.height = PKToolbarHeight;
    this.callSuper(a);
    this.updateLayout();
};
PKToolbar.prototype.willMoveToSuperview = function (a) {
    if (a !== null && this._size.width == 0) {
        this.size = new PKSize(a.size.width, PKToolbarHeight);
    }
};
PKToolbar.prototype.setStyle = function (a) {
    this.layer.removeClassName(this._style);
    this.layer.addClassName(a);
    this._style = a;
};
PKToolbar.prototype.setItems = function (a) {
    this.setItemsWithAnimation(a, false);
};
PKToolbar.prototype.setItemsWithAnimation = function (g, b) {
    for (var i = 0; i < this._items.length; i++) {
        var e = this._items[i];
        if (g.indexOf(e) == -1) {
            e.transitionsEnabled = b;
            if (!b) {
                e.removeFromSuperview();
            } else {
                e.needsRemoval = true;
                e.transform = "scale(0.001)";
                e.opacity = 0;
            }
        }
    }
    for (var i = 0; i < g.length; i++) {
        var e = g[i];
        if (e.superview !== this) {
            e._newItem = true;
            this.addSubview(e);
            e.addPropertyObserver("size", this);
            if (e.type == PKBarButtonItemTypePlain) {
                e.addEventListener(PKControlTouchStateChangeEvent, this, false);
            }
        }
    }
    var a = 0;
    var d = 0;
    for (var i = 0; i < g.length; i++) {
        var e = g[i];
        if (e.type == PKBarButtonItemTypeFlexibleSpace) {
            a++;
        } else {
            d += e.size.width;
        }
    }
    var c = this.size.width - d - PKToolbarItemMargin * (g.length - 1) - PKToolbarEdgeMargin * 2;
    var f = (a > 0) ? (c / a) : 0;
    var h = PKToolbarEdgeMargin;
    for (var i = 0; i < g.length; i++) {
        var e = g[i];
        if (e.type == PKBarButtonItemTypeFlexibleSpace) {
            h += f;
        } else {
            if (e.type == PKBarButtonItemTypeFixedSpace) {
                h += e.size.width;
            } else {
                e.position = new PKPoint(h, (this.size.height - e.size.height) / 2);
                if (e._newItem) {
                    e._newItem = false;
                    if (b) {
                        e.applyTransition(PKViewTransitionDissolveIn);
                    }
                } else {
                    e.transitionsEnabled = b;
                }
                h += e.size.width;
            }
        }
        h += PKToolbarItemMargin;
    }
    this._items = g;
};
PKToolbar.prototype.updateLayout = function () {
    if (this._items.length > 0) {
        this.setItemsWithAnimation(this._items, false);
    }
};
PKToolbar.prototype.handleEvent = function (b) {
    this.callSuper(b);
    if (b.type == "webkitTransitionEnd") {
        if (b.target === this.layer) {
            return;
        } else {
            if (b.target !== this.glow) {
                this.removeItemIfNeeded(b.target._control);
            } else {
                if (this.glow.style.opacity == 0) {
                    this.glow.style.display = "none";
                }
            }
        }
    } else {
        if (b.type == PKControlTouchStateChangeEvent) {
            var a = b.control;
            this.glow.style.webkitTransform = PKUtils.t(a.position.x + a.size.width / 2 - 50, 0);
            this.glow.style.opacity = a.touchInside ? 1 : 0;
            this.glow.style.display = "block";
        }
    }
};
PKToolbar.prototype.removeItemIfNeeded = function (a) {
    if (a.needsRemoval) {
        a.removeFromSuperview();
        a.needsRemoval = false;
        a.transitionsEnabled = false;
        a.transform = "scale(1)";
        a.opacity = 1;
    }
};
PKToolbar.prototype.handlePropertyChange = function (b, a) {
    this.setItemsWithAnimation(this._items, false);
};
PKClass(PKToolbar);
PKToolbar.init = function () {
    PKUtils.preloadImageAsset("bar/UINavigationBarDefaultBackground.png");
    PKUtils.preloadImageAsset("bar/UINavigationBarBlackOpaqueBackground.png");
    PKUtils.preloadImageAsset("bar/UINavigationBarBlackTranslucentBackground.png");
    PKUtils.preloadImageAsset("bar/toolbar_glow.png");
};
window.addEventListener("load", PKToolbar.init, false);
const PKNavigationViewBarStyleDefault = "default";
const PKNavigationViewBarStyleBlack = "black";
const PKNavigationViewBarStyleBlackTranslucent = "black-translucent";
const PKNavigationViewButtonMarginLeft = 5;
const PKNavigationViewButtonMarginRight = 8;
const PKNavigationViewBarHeight = 44;
const PKNavigationViewAnimationDuration = 0.35;
const PKNavigationControllerHideShowBarDuration = 0.2;
const PKNavigationViewShouldPushItem = "navigationViewShouldPushItem";
const PKNavigationViewDidPushItem = "navigationViewDidPushItem";
const PKNavigationViewShouldPopItem = "navigationViewShouldPopItem";
const PKNavigationViewDidPopItem = "navigationViewDidPopItem";
PKNavigationView.inherits = PKView;
PKNavigationView.synthetizes = ["barStyle", "topItem", "backItem", "navigationBarHidden"];

function PKNavigationView() {
    this.callSuper();
    this.delegate = null;
    this._barStyle = "";
    this._navigationBarHidden = false;
    this.items = [];
    this.busy = false;
    this.barStyle = PKNavigationViewBarStyleDefault;
}
PKNavigationView.prototype.createLayer = function () {
    this.callSuper();
    this.layer.addClassName("pk-navigation-view");
    this.toolbar = this.addSubview(new PKToolbar());
    this.hostView = this.addSubview(new PKView());
    this.hostView.position = new PKPoint(0, PKNavigationViewBarHeight);
    this.hostView.layer.addClassName("pk-navigation-view-hosting-layer");
};
PKNavigationView.prototype.setSize = function (a) {
    this.toolbar.size = new PKSize(a.width, PKNavigationViewBarHeight);
    this.hostView.size = new PKSize(a.width, a.height - (this._navigationBarHidden ? 0 : PKNavigationViewBarHeight));
    this.callSuper(a);
    if (this.items.length > 0) {
        this.topItem.updateLayoutIfTopItem();
    }
    for (var d = this.items.length - 2; d >= 0; d--) {
        var c = this.items[d];
        if (c.becomesBackItemTransition !== null) {
            var b = new PKTransition(c.becomesBackItemTransition);
            b.target = c.view;
            b.duration = 0;
            b.applyToState();
        }
    }
};
PKNavigationView.prototype.willMoveToSuperview = function (a) {
    if (a !== null && this._size.width == 0) {
        this.size = new PKSize(a._size.width, a._size.height);
    }
};
PKNavigationView.prototype.setBarStyle = function (a) {
    this.layer.removeClassName(this._barStyle);
    this.layer.addClassName(a);
    this._barStyle = a;
    this.toolbar.style = a;
};
PKNavigationView.prototype.getTopItem = function () {
    return (this.items.length > 0) ? this.items[this.items.length - 1] : null;
};
PKNavigationView.prototype.getBackItem = function () {
    return (this.items.length > 1) ? this.items[this.items.length - 2] : null;
};
PKNavigationView.prototype.setNavigationBarHidden = function (a) {
    this.setNavigationBarHiddenAnimated(a, false);
};
PKNavigationView.prototype.setNavigationBarHiddenAnimated = function (b, a) {
    if (this._navigationBarHidden == b) {
        return;
    }
    this._navigationBarHidden = b;
    PKTransaction.begin();
    PKTransaction.defaults.duration = a ? PKNavigationControllerHideShowBarDuration : 0;
    PKTransaction.defaults.properties = ["position"];
    new PKTransition({
        target: this.toolbar,
        to: [new PKPoint(0, b ? -PKNavigationViewBarHeight : 0)]
    }).start();
    new PKTransition({
        target: this.hostView,
        to: [new PKPoint(0, b ? 0 : PKNavigationViewBarHeight)],
        delegate: this
    }).start();
    PKTransaction.commit();
    if (!a || b) {
        this.updateHostViewSize();
    }
};
PKNavigationView.prototype.transitionDidComplete = function (a) {
    if (!this._navigationBarHidden) {
        this.updateHostViewSize();
    }
};
PKNavigationView.prototype.updateHostViewSize = function () {
    this.hostView.size = new PKSize(this.size.width, this.size.height - (this._navigationBarHidden ? 0 : PKNavigationViewBarHeight));
};
PKNavigationView.prototype.handleEvent = function (a) {
    this.callSuper(a);
    if (this.busy && a.type == "webkitTransitionEnd") {
        this.transitionsEnded();
    }
};
PKNavigationView.prototype.pushNavigationItem = function (c, a) {
    if (this.busy) {
        return;
    }
    var b = (this.items.length == 0);
    if (!b) {
        PKTransaction.begin();
    }
    if (PKUtils.objectHasMethod(this.delegate, PKNavigationViewShouldPushItem)) {
        if (!this.delegate[PKNavigationViewShouldPushItem](this, c)) {
            if (!b) {
                PKTransaction.commit();
            }
            return;
        }
    }
    this.items.push(c);
    c.navigationView = this;
    if (c.view._size.width == 0) {
        c.view.size = new PKSize(this.hostView._size.width, this.hostView._size.height);
    }
    if (b) {
        this.addItemViewsInToolbar(c, null);
        c.sizeItemsAndComputePositions();
        c.updateLayout();
        this.hostView.addSubview(c.view);
    } else {
        this.transitionToTopItem(this.backItem, true, a);
    }
    c.view.autoresizingMask = PKViewAutoresizingFlexibleWidth | PKViewAutoresizingFlexibleHeight;
};
PKNavigationView.prototype.popNavigationItem = function (b) {
    if (this.busy || this.items.length < 2) {
        return;
    }
    PKTransaction.begin();
    if (PKUtils.objectHasMethod(this.delegate, PKNavigationViewShouldPopItem)) {
        if (!this.delegate[PKNavigationViewShouldPopItem](this, this.topItem)) {
            PKTransaction.commit();
            return;
        }
    }
    var a = this.items.pop();
    a.navigationView = null;
    this.transitionToTopItem(a, false, b);
};
PKNavigationView.prototype.addItemViewsInToolbar = function (c, e) {
    var b = c._leftBarButtonItem || ((e !== null) ? e.backBarButtonItem : null) || null;
    var f = [b, c.rightBarButtonItem, c.titleView];
    for (var d = 0; d < f.length; d++) {
        var a = f[d];
        if (!PKUtils.objectIsUndefined(a) && a !== null && (a.superview === null || a.superview !== this.toolbar)) {
            this.toolbar.addSubview(a);
        }
    }
};
PKNavigationView.prototype.transitionToTopItem = function (e, h, c) {
    this.busy = c;
    this.previousItem = e;
    this.transitionWentForward = h;
    var b = this.topItem;
    this.addItemViewsInToolbar(b, this.backItem);
    b.sizeItemsAndComputePositions();
    if (e !== null) {
        e.view.layer.style.display = "block";
    }
    b.view.layer.style.display = "block";
    PKTransaction.defaults.duration = c ? PKNavigationViewAnimationDuration : 0;
    PKTransaction.defaults.properties = ["opacity", "position"];
    if (e._leftBarButtonItem !== null) {
        if (e._leftBarButtonItem !== b._leftBarButtonItem) {
            new PKTransition({
                target: e._leftBarButtonItem,
                properties: ["opacity"],
                to: [0]
            }).start();
        }
    } else {
        if (e.leftButton !== null) {
            var a = (h) ? (-e.leftButton.size.width - PKNavigationItemLeftButtonLeftMargin) : b.positions.title;
            new PKTransition({
                target: e.leftButton,
                to: [0, new PKPoint(a, 0)]
            }).start();
        }
    }
    var a = (h) ? PKNavigationItemLeftButtonLeftMargin : this.size.width;
    new PKTransition({
        target: e.titleView,
        to: [0, new PKPoint(a, 0)]
    }).start();
    if (e._rightBarButtonItem !== null && e._rightBarButtonItem !== b._rightBarButtonItem) {
        new PKTransition({
            target: e._rightBarButtonItem,
            properties: ["opacity"],
            to: [0]
        }).start();
    }
    if (b._leftBarButtonItem !== null) {
        if (b._leftBarButtonItem !== e._leftBarButtonItem) {
            b._leftBarButtonItem.position = new PKPoint(b.positions.leftButton, 0);
            new PKTransition({
                target: b._leftBarButtonItem,
                properties: ["opacity"],
                from: [0],
                to: [1]
            }).start();
        }
    } else {
        if (b.leftButton !== null) {
            var g = (h) ? e.positions.title : (-e.leftButton.size.width - PKNavigationItemLeftButtonLeftMargin);
            new PKTransition({
                target: b.leftButton,
                from: [0, new PKPoint(g, 0)],
                to: [b.hidesBackButton ? 0 : 1, new PKPoint(b.positions.leftButton, 0)]
            }).start();
        }
    }
    var g = (h) ? this.size.width : PKNavigationItemLeftButtonLeftMargin;
    new PKTransition({
        target: b.titleView,
        from: [0, new PKPoint(g, 0)],
        to: [1, new PKPoint(b.positions.title, 0)]
    }).start();
    if (b._rightBarButtonItem !== null && b._rightBarButtonItem !== e._rightBarButtonItem) {
        b._rightBarButtonItem.position = new PKPoint(b.positions.rightButton, 0);
        new PKTransition({
            target: b._rightBarButtonItem,
            properties: ["opacity"],
            from: [0],
            to: [1]
        }).start();
    }
    var f = h ? e.becomesBackItemTransition : e.wasTopItemTransition;
    var d = h ? b.becomesTopItemTransition : b.wasBackItemTransition;
    e.view.applyTransition(f, false);
    b.view.applyTransition(d, false);
    if (h) {
        this.hostView.addSubview(this.topItem.view);
    }
    if (c) {
        e.titleView.layer.addEventListener("webkitTransitionEnd", this, false);
    }
    PKTransaction.commit();
    if (!c) {
        this.transitionsEnded();
    }
};
PKNavigationView.prototype.transitionsEnded = function () {
    this.busy = false;
    if (this.transitionWentForward) {
        if (PKUtils.objectHasMethod(this.delegate, PKNavigationViewDidPushItem)) {
            this.delegate[PKNavigationViewDidPushItem](this, this.topItem);
        }
        if (this.previousItem !== null) {
            this.previousItem.view.layer.style.display = "none";
        }
    } else {
        this.previousItem.view.removeFromSuperview();
        if (PKUtils.objectHasMethod(this.delegate, PKNavigationViewDidPopItem)) {
            this.delegate[PKNavigationViewDidPopItem](this, this.previousItem);
        }
    }
    if (this.previousItem.leftButton !== null && this.previousItem.leftButton !== this.topItem.leftButton) {
        this.previousItem.leftButton.removeFromSuperview();
    }
    this.previousItem.titleView.removeFromSuperview();
    if (this.previousItem._rightBarButtonItem !== null && this.previousItem._rightBarButtonItem !== this.topItem._rightBarButtonItem) {
        this.previousItem._rightBarButtonItem.removeFromSuperview();
    }
    if (this.previousItem.leftButton !== null) {
        this.previousItem.leftButton.removeEventListener(PKControlTouchUpInsideEvent, this, false);
    }
};
PKClass(PKNavigationView);
const PKNavigationItemLeftButtonLeftMargin = 5;
const PKNavigationItemLeftButtonRightMargin = 8;
const PKNavigationItemRightButtonLeftMargin = 11;
const PKNavigationItemRightButtonRightMargin = 5;
const PKNavigationItemTransitionInFromRight = {
    properties: ["transform"],
    from: ["translateX($width)"],
    to: ["translateX(0)"]
};
const PKNavigationItemTransitionInFromLeft = {
    properties: ["transform"],
    from: ["translateX(-$width)"],
    to: ["translateX(0)"]
};
const PKNavigationItemTransitionOutToRight = {
    properties: ["transform"],
    from: ["translateX(0)"],
    to: ["translateX($width)"]
};
const PKNavigationItemTransitionOutToLeft = {
    properties: ["transform"],
    from: ["translateX(0)"],
    to: ["translateX(-$width)"]
};
PKNavigationItem.inherits = PKObject;
PKNavigationItem.synthetizes = ["title", "view", "backBarButtonItem", "leftBarButtonItem", "rightBarButtonItem", "hidesBackButton"];
PKNavigationItem.includes = [PKEventTriage];

function PKNavigationItem(b, a) {
    this.callSuper();
    this._title = "";
    this._view = null;
    this._backBarButtonItem = new PKBarButtonItem(PKBarButtonItemTypeBack);
    this._hidesBackButton = false;
    this._leftBarButtonItem = null;
    this._rightBarButtonItem = null;
    this.titleView = new PKBarButtonItem(PKBarButtonItemTypePlain);
    this.titleView.layer.setAttribute("role", "header");
    this.buttons = null;
    this.positions = null;
    this.navigationView = null;
    this.wasBackItemTransition = PKNavigationItemTransitionInFromLeft;
    this.becomesBackItemTransition = PKNavigationItemTransitionOutToLeft;
    this.wasTopItemTransition = PKNavigationItemTransitionOutToRight;
    this.becomesTopItemTransition = PKNavigationItemTransitionInFromRight;
    this.title = b || "";
    this.view = a || null;
    this._backBarButtonItem.addEventListener(PKControlTouchUpInsideEvent, this, false);
}
PKNavigationItem.prototype.handleControlTouchUpInside = function (a) {
    if (this.navigationView !== null && !this.navigationView.busy && !this.navigationView.topItem.hidesBackButton) {
        this.navigationView.popNavigationItem(true);
    }
};
PKNavigationItem.prototype.setTitle = function (a) {
    this._title = a;
    this.updateLayoutIfTopItem();
};
PKNavigationItem.prototype.setView = function (a) {
    if (this.navigationView !== null && this.navigationView.topItem === this) {
        this._view.removeFromSuperview();
        this.navigationView.addSubview(a);
    }
    this._view = a;
};
PKNavigationItem.prototype.setBackBarButtonItem = function (a) {
    if (this.navigationView !== null && this.navigationView.backItem === this) {
        if (this._backBarButtonItem !== null) {
            this._backBarButtonItem.removeFromSuperview();
        }
        this._backBarButtonItem = a;
        this.navigationView.toolbar.addSubview(this._backBarButtonItem);
        this.navigationView.topItem.updateLayoutIfTopItem();
    } else {
        this._backBarButtonItem = a;
    }
    if (this._backBarButtonItem !== null) {
        this._backBarButtonItem.addEventListener(PKControlTouchUpInsideEvent, this, false);
    }
};
PKNavigationItem.prototype.setHidesBackButton = function (a) {
    this.setHidesBackButtonWithAnimation(a, false);
};
PKNavigationItem.prototype.setLeftBarButtonItem = function (a) {
    if (this.navigationView !== null && this.navigationView.topItem === this) {
        var b = this.getDefaultBackButton();
        if (this.leftButton !== null) {
            this.leftButton.removeFromSuperview();
        }
        this._leftBarButtonItem = a;
        var c = this._leftBarButtonItem || this.getDefaultBackButton();
        if (c !== null) {
            this.navigationView.toolbar.addSubview(c);
            if (this._leftBarButtonItem === null && !this.hidesBackButton) {
                c.opacity = 1;
            }
        }
        this.updateLayoutIfTopItem();
    } else {
        this._leftBarButtonItem = a;
    }
};
PKNavigationItem.prototype.setRightBarButtonItem = function (a) {
    if (this.navigationView !== null && this.navigationView.topItem === this) {
        if (this._rightBarButtonItem !== null) {
            this._rightBarButtonItem.removeFromSuperview();
        }
        this._rightBarButtonItem = a;
        this.navigationView.toolbar.addSubview(this._rightBarButtonItem);
        this.updateLayoutIfTopItem();
    } else {
        this._rightBarButtonItem = a;
    }
};
PKNavigationItem.prototype.setHidesBackButtonWithAnimation = function (a, c) {
    var b = this.getDefaultBackButton();
    if (this._hidesBackButton == a) {
        return;
    }
    this._hidesBackButton = a;
    if (b === null) {
        return;
    }
    b.transitionsEnabled = c;
    b.opacity = a ? 0 : 1;
};
PKNavigationItem.prototype.setLeftBarButtonItemWithAnimation = function (d, a) {
    if (!a || this.navigationView === null || this.navigationView.topItem !== this) {
        this.leftBarButtonItem = d;
        return;
    }
    PKTransaction.begin();
    PKTransaction.defaults.duration = 0.5;
    PKTransaction.defaults.properties = ["opacity"];
    var b = this.leftButton;
    if (b !== null) {
        new PKTransition({
            target: b,
            to: [0],
            removesTargetUponCompletion: true
        }).start();
    }
    this._leftBarButtonItem = d;
    var c = this._leftBarButtonItem || this.getDefaultBackButton();
    if (c !== null) {
        this.navigationView.toolbar.addSubview(c);
        if (this._leftBarButtonItem !== null || !this._hidesBackButton) {
            new PKTransition({
                target: c,
                from: [0],
                to: [1]
            }).start();
        }
    }
    this.updateLayoutIfTopItem();
    PKTransaction.commit();
};
PKNavigationItem.prototype.setRightBarButtonItemWithAnimation = function (c, a) {
    if (!a || this.navigationView === null || this.navigationView.topItem !== this) {
        this.rightBarButtonItem = c;
        return;
    }
    PKTransaction.begin();
    PKTransaction.defaults.duration = 0.5;
    PKTransaction.defaults.properties = ["opacity"];
    var b = this._rightBarButtonItem;
    if (b !== null) {
        new PKTransition({
            target: b,
            to: [0],
            removesTargetUponCompletion: true
        }).start();
    }
    this._rightBarButtonItem = c;
    if (this._rightBarButtonItem !== null) {
        this.navigationView.toolbar.addSubview(this._rightBarButtonItem);
        new PKTransition({
            target: this._rightBarButtonItem,
            from: [0],
            to: [1]
        }).start();
    }
    this.updateLayoutIfTopItem();
    PKTransaction.commit();
};
PKNavigationItem.prototype.getDefaultBackButton = function () {
    return (this.navigationView !== null && this.navigationView.backItem !== null) ? this.navigationView.backItem.backBarButtonItem : null;
};
PKNavigationItem.prototype.sizeItemsAndComputePositions = function () {
    if (this.navigationView === null) {
        return;
    }
    var i = this._leftBarButtonItem || this.getDefaultBackButton();
    var e = (this._rightBarButtonItem !== null) ? this._rightBarButtonItem.size.width : 0;
    var a = this.navigationView.size.width - PKNavigationItemLeftButtonLeftMargin - PKNavigationItemRightButtonRightMargin;
    if (i !== null) {
        a -= PKNavigationItemLeftButtonRightMargin;
    }
    if (this._rightBarButtonItem !== null) {
        a -= PKNavigationItemRightButtonLeftMargin + e;
    }
    var f = 0;
    if (i !== null) {
        i.maxWidth = this.navigationView.size.width / 2;
        if (i !== this._leftBarButtonItem && i.title == "" && i.image === null) {
            i.title = this.navigationView.backItem.title;
        }
        f = i.size.width;
    }
    this.titleView.maxWidth = 0;
    this.titleView.title = this._title;
    var g = this.titleView.size.width;
    if (g + f > a) {
        if (i !== null) {
            i.maxWidth = Math.min(Math.max(a / 3, a - g), i.maxWidth);
            f = i.size.width;
        }
        this.titleView.maxWidth = a - f;
        g = this.titleView.size.width;
    }
    var c = PKNavigationItemLeftButtonLeftMargin;
    var k = this.navigationView.size.width - PKNavigationItemRightButtonRightMargin - e;
    var j = c + ((i != null) ? f + PKNavigationItemLeftButtonRightMargin : 0);
    var b = k - g - ((e > 0) ? PKNavigationItemRightButtonLeftMargin : 0);
    var l = (this.navigationView.size.width - g) / 2;
    var h = l;
    if (l > b || l < j) {
        var d = Math.abs(l - j);
        var m = Math.abs(l - b);
        h = (d < m) ? j : b;
    }
    this.leftButton = i;
    this.positions = {
        leftButton: c,
        title: h,
        rightButton: k
    };
};
PKNavigationItem.prototype.updateLayout = function () {
    if (this.positions === null || this.button === null) {
        return;
    }
    if (this.leftButton != null) {
        this.leftButton.position = new PKPoint(this.positions.leftButton, 0);
    }
    if (this._rightBarButtonItem != null) {
        this._rightBarButtonItem.position = new PKPoint(this.positions.rightButton, 0);
    }
    this.titleView.position = new PKPoint(this.positions.title, 0);
};
PKNavigationItem.prototype.updateLayoutIfTopItem = function () {
    if (this.navigationView === null || this.navigationView.topItem !== this) {
        return;
    }
    this.sizeItemsAndComputePositions();
    this.updateLayout();
};
PKClass(PKNavigationItem);
const PKControlTouchDownEvent = "controlTouchDown";
const PKControlTouchDragInsideEvent = "controlTouchDragInside";
const PKControlTouchDragOutsideEvent = "controlTouchDragOutside";
const PKControlTouchDragEnterEvent = "controlTouchDragEnter";
const PKControlTouchDragExitEvent = "controlTouchDragExit";
const PKControlTouchUpInsideEvent = "controlTouchUpInside";
const PKControlTouchUpOutsideEvent = "controlTouchUpOutside";
const PKControlTouchCancelEvent = "controlTouchCancel";
const PKControlValueChangeEvent = "controlValueChange";
const PKControlTouchStateChangeEvent = "controlTouchStateChange";
const PKControlStateNormal = 0;
const PKControlStateNormalCSS = "normal";
const PKControlStateHighlighted = 1 << 0;
const PKControlStateHighlightedCSS = "highlighted";
const PKControlStateDisabled = 1 << 1;
const PKControlStateDisabledCSS = "disabled";
const PKControlStateSelected = 1 << 2;
const PKControlStateSelectedCSS = "selected";
PKControl.inherits = PKView;
PKControl.synthetizes = ["state", "enabled", "selected", "highlighted", "touchLayer"];

function PKControl() {
    this.tag = 0;
    this._enabled = true;
    this._selected = false;
    this._highlighted = false;
    this._touchLayer = null;
    this.callSuper();
    this.tracking = false;
    this.touchInside = false;
    this.layer._control = this;
    this.tracksTouchesOnceTouchesBegan = true;
    this.layer.removeEventListener(PKStartEvent, this, false);
    this.touchLayer.addEventListener(PKStartEvent, this, false);
}
PKControl.prototype.createLayer = function () {
    this.callSuper();
    this.layer.addClassName("pk-control");
};
PKControl.prototype.getState = function () {
    return (PKControlStateNormal | (this._highlighted ? PKControlStateHighlighted : 0) | (this._enabled ? 0 : PKControlStateDisabled) | (this._selected ? PKControlStateSelected : 0));
};
PKControl.prototype.setEnabled = function (a) {
    if (a == this._enabled) {
        return;
    }
    this.layer[a ? "removeClassName" : "addClassName"](PKControlStateDisabledCSS);
    this._enabled = a;
    this.tracksTouchesOnceTouchesBegan = a;
    this.notifyPropertyChange("state");
};
PKControl.prototype.setSelected = function (a) {
    if (a == this._selected) {
        return;
    }
    this.layer[a ? "addClassName" : "removeClassName"](PKControlStateSelectedCSS);
    this._selected = a;
    this.notifyPropertyChange("state");
};
PKControl.prototype.setHighlighted = function (a) {
    if (a == this._highlighted) {
        return;
    }
    this.layer[a ? "addClassName" : "removeClassName"](PKControlStateHighlightedCSS);
    this._highlighted = a;
    this.notifyPropertyChange("state");
};
PKControl.prototype.addEventListener = function (c, b, a) {
    this.layer.addEventListener(c, b, a);
};
PKControl.prototype.removeEventListener = function (c, b, a) {
    this.layer.removeEventListener(c, b, a);
};
PKControl.prototype.dispatchEvent = function (a) {
    this.layer.dispatchEvent(a);
};
PKControl.prototype.getTouchLayer = function () {
    return (this._touchLayer != null) ? this._touchLayer : this.layer;
};
PKControl.prototype.touchesBegan = function (a) {
    this.callSuper(a);
    if (!this._enabled) {
        return;
    }
    a.stopPropagation();
    a.preventDefault();
    this.touchInside = true;
    this.highlighted = true;
    this.dispatchEvent(this.createUIEvent(PKControlTouchDownEvent, a));
    this.dispatchEvent(this.createEvent(PKControlTouchStateChangeEvent));
    this.lastProcessedEvent = a;
};
PKControl.prototype.touchesMoved = function (c) {
    this.callSuper(c);
    this.tracking = true;
    var a = this.pointInside(PKPoint.fromEventInElement(c, this.layer));
    var b = a ? PKControlTouchDragInsideEvent : PKControlTouchDragOutsideEvent;
    if (a != this.touchInside) {
        this.touchInside = a;
        this.highlighted = a;
        b = a ? PKControlTouchDragEnterEvent : PKControlTouchDragExitEvent;
        this.dispatchEvent(this.createEvent(PKControlTouchStateChangeEvent));
    }
    this.dispatchEvent(this.createUIEvent(b, c));
    this.lastProcessedEvent = c;
};
PKControl.prototype.touchesEnded = function (b) {
    this.callSuper(b);
    this.tracking = false;
    this.highlighted = false;
    var a = this.touchInside ? PKControlTouchUpInsideEvent : PKControlTouchUpOutsideEvent;
    this.dispatchEvent(this.createUIEvent(a, this.lastProcessedEvent));
    this.touchInside = false;
    this.dispatchEvent(this.createEvent(PKControlTouchStateChangeEvent));
};
PKControl.prototype.touchesCancelled = function (a) {
    this.callSuper(a);
    this.dispatchEvent(this.createUIEvent(PKControlTouchCancelEvent, a));
};
PKControl.prototype.createEvent = function (a) {
    var b = document.createEvent("Event");
    b.initEvent(a, true, false);
    b.control = this;
    return b;
};
PKControl.prototype.createUIEvent = function (c, b) {
    var a = PKUtils.createUIEvent(c, b);
    a.control = this;
    return a;
};
PKClass(PKControl);
const PKBarButtonItemTypePlain = "plain";
const PKBarButtonItemTypeSquare = "square";
const PKBarButtonItemTypeBack = "back";
const PKBarButtonItemTypeForward = "forward";
const PKBarButtonItemTypeFlexibleSpace = "flexible-space";
const PKBarButtonItemTypeFixedSpace = "fixed-space";
const PKBarButtonItemStyleBlack = "black";
const PKBarButtonItemStyleDefault = "default";
const PKBarButtonItemStyleLightBlue = "lightblue";
const PKBarButtonItemHeight = 30;
const PKBarButtonItemPointyXOffset = 3;
PKBarButtonItem.inherits = PKControl;
PKBarButtonItem.synthetizes = ["maxWidth", "width", "title", "type", "style", "image", "imageOffset"];

function PKBarButtonItem(a) {
    this.callSuper();
    this._maxWidth = 0;
    this._width = 0;
    this._title = "";
    this._type = "";
    this._style = "";
    this._image = null;
    this.type = (a != null) ? a : PKBarButtonItemTypeSquare;
    this.style = PKBarButtonItemStyleDefault;
    this.usesAutomaticImageOffset = true;
}
PKBarButtonItem.prototype.createLayer = function () {
    this.callSuper();
    this.layer.addClassName("pk-bar-button-item");
    this.layer.setAttribute("role", "button");
    this.background = this.layer.appendChild(document.createElement("div"));
    this.icon = this.layer.appendChild(document.createElement("img"));
};
PKBarButtonItem.prototype.becameDescendantOfRootView = function () {
    this.callSuper();
    if (this._title != "" && this._width == 0) {
        this.autoSizeTitle();
    }
};
PKBarButtonItem.prototype.getSize = function () {
    var a = (this._maxWidth == 0) ? this._size.width : Math.min(this._maxWidth, this._size.width);
    return new PKSize(a, this._size.height);
};
PKBarButtonItem.prototype.setSize = function (a) {
    a.height = PKBarButtonItemHeight;
    this.callSuper(a);
};
PKBarButtonItem.prototype.touchesBegan = function (a) {
    if (this.type == PKBarButtonItemTypeFlexibleSpace || this.type == PKBarButtonItemTypeFixedSpace) {
        a.preventDefault();
        return;
    }
    this.callSuper(a);
};
PKBarButtonItem.prototype.setMaxWidth = function (a) {
    this.background.style.maxWidth = (a == 0) ? "inherit" : PKUtils.px(a);
    this._maxWidth = a;
    if (this._width == 0) {
        this.autoSizeTitle();
    }
};
PKBarButtonItem.prototype.setWidth = function (a) {
    if (a == 0) {
        this.autoSizeTitle();
        this.autoSizeImage();
        this.positionImage();
    } else {
        this._width = a;
        this.size = new PKSize(a, PKBarButtonItemHeight);
        this.positionImage();
    }
};
PKBarButtonItem.prototype.autoSizeTitle = function () {
    if (this._title != "" && this.isDescendantOfView(PKRootView.sharedRoot)) {
        this.layer.style.width = "auto";
        var a = parseInt(window.getComputedStyle(this.layer).width, 10);
        this.size = new PKSize(a, this._size.height);
    }
};
PKBarButtonItem.prototype.autoSizeImage = function () {
    if (this._image !== null) {
        var b = this.getBorderXOffsets();
        var a = this._image.width + b.left + b.right;
        this.size = new PKSize(a, this._size.height);
    }
};
PKBarButtonItem.prototype.setTitle = function (a) {
    this.background.innerText = a;
    this._title = a;
    if (this._width == 0) {
        this.autoSizeTitle();
    }
};
PKBarButtonItem.prototype.setImage = function (a) {
    this.icon.src = a.url;
    this._image = a;
    if (a.loaded) {
        this.positionImage();
    } else {
        a.addPropertyObserver("loaded", this);
    }
};
PKBarButtonItem.prototype.getImageOffset = function () {
    return new PKPoint(parseInt(this.icon.style.left, 10), parseInt(this.icon.style.top, 10));
};
PKBarButtonItem.prototype.setImageOffset = function (a) {
    this.icon.style.left = PKUtils.px(a.x);
    this.icon.style.top = PKUtils.px(a.y);
    this.usesAutomaticImageOffset = false;
};
PKBarButtonItem.prototype.positionImage = function () {
    if (this._image === null || !this.usesAutomaticImageOffset) {
        return;
    }
    var a = Math.min(this._image.height, this.size.height);
    this.icon.height = a;
    var b = new PKPoint((this._size.width - this.icon.width) / 2, (PKBarButtonItemHeight - this.icon.height) / 2);
    if (this._type == PKBarButtonItemTypeBack) {
        b.x += PKBarButtonItemPointyXOffset;
    }
    if (this._type == PKBarButtonItemTypeForward) {
        b.x -= PKBarButtonItemPointyXOffset;
    }
    this.imageOffset = b;
    this.usesAutomaticImageOffset = true;
};
PKBarButtonItem.prototype.setType = function (a) {
    this.layer.removeClassName(this._type);
    this.layer.addClassName(a);
    this._type = a;
};
PKBarButtonItem.prototype.setStyle = function (a) {
    this.layer.removeClassName(this._style);
    this.layer.addClassName(a);
    this._style = a;
};
PKBarButtonItem.prototype.getBorderXOffsets = function () {
    var c = window.getComputedStyle(this.background);
    var b = c.getPropertyCSSValue("border-left-width");
    var a = c.getPropertyCSSValue("border-right-width");
    return {
        left: (b !== null) ? b.getFloatValue(CSSPrimitiveValue.CSS_PX) : 0,
        right: (a !== null) ? a.getFloatValue(CSSPrimitiveValue.CSS_PX) : 0
    };
};
PKBarButtonItem.prototype.handlePropertyChange = function (b, a) {
    if (this._width == 0) {
        this.autoSizeImage();
    }
    this.positionImage();
};
PKClass(PKBarButtonItem);
PKBarButtonItem.init = function () {
    var a = ["UINavigationBarDoneButtonPressed", "UINavigationBarDoneButton", "UINavigationBarDefaultForwardPressed", "UINavigationBarDefaultForward", "UINavigationBarDefaultButtonPressed", "UINavigationBarDefaultButton", "UINavigationBarDefaultBackPressed", "UINavigationBarDefaultBack", "UINavigationBarBlackTranslucentForward", "UINavigationBarBlackTranslucentButton", "UINavigationBarBlackTranslucentBack", "UINavigationBarBlackOpaqueForward", "UINavigationBarBlackOpaqueButton", "UINavigationBarBlackOpaqueBack", "UINavigationBarBlackForwardPressed", "UINavigationBarBlackButtonPressed", "UINavigationBarBlackBackPressed"];
    for (var b = 0; b < a.length; b++) {
        PKUtils.preloadImageAsset("button/" + a[b] + ".png");
    }
};
window.addEventListener("load", PKBarButtonItem.init, false);
const PKSearchBarHeight = 44;
const PKSearchBarStyleDefault = "default";
const PKSearchBarStyleBlack = "black";
const PKSearchBarStyleBlackTranslucent = "black-translucent";
const PKSearchBarTextDidChange = "searchBarTextDidChange";
const PKSearchBarTextDidBeginEditing = "searchBarTextDidBeginEditing";
const PKSearchBarTextDidEndEditing = "searchBarTextDidEndEditing";
const PKSearchBarCancelButtonClicked = "searchBarCancelButtonClicked";
const PKSearchBarShowsCancelButtonCSS = "shows-cancel-button";
const PKSearchBarDisplaysPlaceholder = "displays-placeholder";
PKSearchBar.inherits = PKView;
PKSearchBar.includes = [PKEventTriage];
PKSearchBar.synthetizes = ["style", "placeholder", "text", "showsCancelButton", "editing"];

function PKSearchBar() {
    this.delegate = null;
    this._style = PKSearchBarStyleDefault;
    this._placeholder = "";
    this._text = "";
    this._showsCancelButton = false;
    this._editing = false;
    this.hasBeenExplicitelySized = false;
    this.callSuper();
    this.field.addEventListener("focus", this, false);
    this.field.addEventListener("blur", this, false);
    this.field.addEventListener("input", this, false);
    this.field.parentNode.addEventListener("submit", this, false);
    this.button.addEventListener(PKControlTouchUpInsideEvent, this, false);
    this.emptyButton.addEventListener(PKControlTouchUpInsideEvent, this, false);
    this.button.addPropertyObserver("size", this, "updateLayout");
    this.autoresizesSubviews = false;
}
PKSearchBar.prototype.createLayer = function () {
    this.callSuper();
    this.layer.addClassName("pk-search-bar");
    var a = this.layer.appendChild(document.createElement("form"));
    this.label = a.appendChild(document.createElement("div"));
    this.field = a.appendChild(document.createElement("input"));
    this.field.type = "text";
    this.button = new PKBarButtonItem();
    this.button.title = "Cancel";
    this.addSubview(this.button);
    this.emptyButton = new PKBarButtonItem(PKBarButtonItemTypePlain);
    this.emptyButton.width = 19;
    this.emptyButton.image = new PKImage(PKUtils.assetsPath + "pixel.png");
    this.addSubview(this.emptyButton);
};
PKSearchBar.prototype.setSize = function (a) {
    a.height = PKSearchBarHeight;
    this.callSuper(a);
    this.hasBeenExplicitelySized = true;
    this.updateLayout();
};
PKSearchBar.prototype.updateLayout = function () {
    if (!this.isDescendantOfView(PKRootView.sharedRoot)) {
        return;
    }
    var a = this.showsCancelButton ? (this.button.size.width + 5) : 0;
    this.field.parentNode.style.right = PKUtils.px(a + 5);
    this.emptyButton.layer.style.right = PKUtils.px(a + 10);
};
PKSearchBar.prototype.didMoveToSuperview = function () {
    this.callSuper();
    if (this.hasBeenExplicitelySized || this.superview === null) {
        return;
    }
    this.size = new PKSize(this.superview.size.width, PKSearchBarHeight);
    this.hasBeenExplicitelySized = false;
};
PKSearchBar.prototype.setStyle = function (a) {
    this.layer.removeClassName(this._style);
    this.layer.addClassName(a);
    this._style = a;
};
PKSearchBar.prototype.setPlaceholder = function (a) {
    this._placeholder = a;
    this.checkForPlaceholderDisplay();
};
PKSearchBar.prototype.getText = function (a) {
    return this.field.value;
};
PKSearchBar.prototype.setText = function (a) {
    this.label.innerText = a;
    this.field.value = a;
    if (PKUtils.objectHasMethod(this.delegate, PKSearchBarTextDidChange)) {
        this.delegate[PKSearchBarTextDidChange](this, a);
    }
    this.checkForPlaceholderDisplay();
};
PKSearchBar.prototype.setShowsCancelButton = function (a) {
    if (this._showsCancelButton == a) {
        return;
    }
    this.layer[a ? "addClassName" : "removeClassName"](PKSearchBarShowsCancelButtonCSS);
    this._showsCancelButton = a;
    this.updateLayout();
};
PKSearchBar.prototype.checkForPlaceholderDisplay = function () {
    this.layer[this.text == "" ? "addClassName" : "removeClassName"](PKSearchBarDisplaysPlaceholder);
    if (this.text == "") {
        this.label.innerText = this._placeholder;
    }
};
PKSearchBar.prototype.setEditing = function (a) {
    this._editing = a;
    this.field[a ? "focus" : "blur"]();
};
PKSearchBar.prototype.handleFocus = function (a) {
    if (PKUtils.objectHasMethod(this.delegate, PKSearchBarTextDidBeginEditing)) {
        this.delegate[PKSearchBarTextDidBeginEditing](this);
    }
    this.editing = true;
};
PKSearchBar.prototype.handleBlur = function (a) {
    if (PKUtils.objectHasMethod(this.delegate, PKSearchBarTextDidEndEditing)) {
        this.delegate[PKSearchBarTextDidEndEditing](this);
    }
    this.label.innerText = this.field.value;
    this.checkForPlaceholderDisplay();
    this.editing = false;
};
PKSearchBar.prototype.handleInput = function (a) {
    this.checkForPlaceholderDisplay();
    if (PKUtils.objectHasMethod(this.delegate, PKSearchBarTextDidChange)) {
        this.delegate[PKSearchBarTextDidChange](this, this.field.value);
    }
};
PKSearchBar.prototype.handleSubmit = function (a) {
    a.preventDefault();
    this.editing = false;
};
PKSearchBar.prototype.handleControlTouchUpInside = function (a) {
    if (a.control === this.emptyButton) {
        this.text = "";
        this.checkForPlaceholderDisplay();
    } else {
        if (PKUtils.objectHasMethod(this.delegate, PKSearchBarCancelButtonClicked)) {
            this.delegate[PKSearchBarCancelButtonClicked](this);
        }
    }
};
PKClass(PKSearchBar);
PKSearchBar.init = function () {
    PKUtils.preloadImageAsset("search/background_default.png");
    PKUtils.preloadImageAsset("search/cancel_touched.png");
};
window.addEventListener("load", PKSearchBar.init, false);
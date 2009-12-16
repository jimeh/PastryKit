var controller = {};
controller.init = function () {
    setTimeout(function () {
        controller.addVoiceOverButton();
    },
    100);
    var a = parseInt(document.body.style.height, 10);
    if (!a) {
        a = window.innerHeight;
    }
    this.navigation = new PKNavigationView();
    this.navigation.size = new PKSize(window.innerWidth, a);
    this.navigation.delegate = this;
    this.navigation.zIndex = 1;
    this.navigation.autoresizingMask = PKViewAutoresizingFlexibleWidth;
    PKRootView.sharedRoot.addSubview(this.navigation);
    this.navigation.layer.style.backgroundImage = "url('images/startupimage.png')";
    this.navigation.layer.style.backgroundRepeat = "repeat-x";
    this.becomesTopItemTransition = {
        properties: ["transform"],
        from: ["translateY($height)"],
        to: ["translateY(0)"]
    };
    this.wasTopItemTransition = {
        properties: ["transform"],
        from: ["translateY(0)"],
        to: ["translateY($height)"]
    };
    this.loadingView = new PKView();
    this.loadingView.size = new PKSize(30, 30);
    this.loadingView.position = new PKPoint((window.innerWidth - this.loadingView.size.width) / 2, (window.innerHeight - 40 - this.loadingView.size.height) / 2);
    this.loadingView.id = "loading";
    this.loadingView.delegate = this;
    this.loadingView.zIndex = 10;
    var b = document.createElement("img");
    b.src = "images/activityindicator.png";
    b.id = "loadingImage";
    this.loadingView.layer.appendChild(b);
    if (true !== navigator.standalone) {
        this.navigation.addSubview(this.loadingView);
    }
    this.navigateToElement("TOP_LEVEL_ITEM");
};
controller.navigationViewShouldPushItem = function (a, e) {
    updateOrientation();
    var c = a.topItem;
    var b = e;
    var d = false;
    var f = false;
    if (c && c._isSearch) {
        d = true;
    }
    if (b._isSearch) {
        f = true;
    }
    if (!d && f) {
        b.becomesTopItemTransition = controller.becomesTopItemTransition;
        c.becomesBackItemTransition = null;
    } else {
        b.becomesTopItemTransition = PKNavigationItemTransitionInFromRight;
        if (c) {
            c.becomesBackItemTransition = PKNavigationItemTransitionOutToLeft;
        }
    }
    this.updateNavigationBarHiddenWithItem(b);
    return true;
};
controller.navigationViewShouldPopItem = function (c, e) {
    updateOrientation();
    var g = e;
    var f = c.backItem;
    var a = false;
    var b = false;
    if (g && g._isSearch) {
        a = true;
    }
    if (f._isSearch) {
        b = true;
    }
    if (a && !b) {
        g.wasTopItemTransition = controller.wasTopItemTransition;
        f.wasBackItemTransition = null;
    } else {
        g.wasTopItemTransition = PKNavigationItemTransitionOutToRight;
        f.wasBackItemTransition = PKNavigationItemTransitionInFromLeft;
    }
    this.updateNavigationBarHiddenWithItem(f);
    var h;
    if (f.view.pathForSelectedRow) {
        h = f.view;
    } else {
        for (var d = 0; d < f.view.subviews.length; d++) {
            if (f.view.subviews[d].pathForSelectedRow) {
                h = f.view.subviews[d];
            }
        }
    }
    if (h) {
        var j = h.pathForSelectedRow();
        if (j) {
            h.deselectRowAtPathAnimated(j, false);
        }
    }
    return true;
};
controller.updateNavigationBarHiddenWithItem = function (a) {
    if (a._isSearch) {
        controller.navigation.setNavigationBarHiddenAnimated(true, false);
    } else {
        setTimeout(function () {
            controller.navigation.setNavigationBarHiddenAnimated(false, false);
        },
        PKNavigationViewAnimationDuration * 1000);
    }
};
controller.navigationViewDidPopItem = function (a, b) {
    this.activeElement = a.topItem._apdid;
    this.currentElements = dataController.getChildrenAPDIDsForItemWithAPDID(this.activeElement);
    if (document.getElementById("voiceOverButton")) {
        if (this.activeElement == "TOP_LEVEL_ITEM") {
            document.getElementById("voiceOverButton").style.visibility = "";
        } else {
            document.getElementById("voiceOverButton").style.visibility = "hidden";
        }
    }
};
controller.navigationViewDidPushItem = function (b, j) {
    if (j.view._listView) {
        j.view._listView.reloadData();
    }
    if (j.view._contentView) {
        var g = j.view._contentView.subviews[0];
        var a = g.layer;
        a.innerHTML = '<div class="Name">' + dataController.getTitleForItemWithAPDID(this.activeElement) + "</div>";
        a.innerHTML += dataController.getBodyForItemWithAPDID(this.activeElement);
        var f = a.getElementsByTagName("img");
        for (var d = 0; d < f.length; d++) {
            var c = f[d];
            var h = c.src;
            h = h.substring(h.indexOf("Art/"), h.length);
            var e = dataController.getBase64ForImageAtPath(h);
            if (e != undefined) {
                c.setAttribute("src", "data:image/png;base64," + e);
            }
            c.setAttribute("onLoad", "javascript:updateOrientationFixImageSizes(1);");
            c.setAttribute("onError", "javascript:controller.errorLoadingGraphic(this);");
        }
        g.refreshSize();
    }
    this.loadingView.removeFromSuperview();
    if (document.getElementById("voiceOverButton")) {
        if (this.activeElement == "TOP_LEVEL_ITEM") {
            document.getElementById("voiceOverButton").style.visibility = "";
        } else {
            document.getElementById("voiceOverButton").style.visibility = "hidden";
        }
    }
};
controller.numberOfSectionsInTableView = function (a) {
    if (a.style == PKTableViewStylePlain) {
        return 1;
    }
    return this.currentElements.length;
};
controller.tableViewNumberOfRowsInSection = function (a, d) {
    if (this.activeElement == "TOP_LEVEL_ITEM") {
        var c = this.currentElements.length;
        c += 1;
        if (localizationController.supportedLanguagesCount > 1) {
            c += 1;
        }
        if (1 == dataController.showVersionNumber) {
            c += 3;
        }
        return c;
    }
    if (a.style == PKTableViewStylePlain) {
        return this.currentElements.length;
    }
    var e = controller.tableViewTitleForHeaderInSection(a, d);
    if (e == "") {
        return 1;
    }
    for (var b in this.currentElements) {
        var f = this.currentElements[b];
        if (e == dataController.getTitleForItemWithAPDID(f)) {
            return dataController.getChildrenAPDIDsForItemWithAPDID(f).length;
        }
    }
    return 0;
};
controller.tableViewCellForRowAtPath = function (c, e) {
    var i = new PKTableViewCell();
    i.selectionStyle = PKTableViewCellSelectionStyleNone;
    i.text = "";
    i.accessoryType = PKTableViewCellAccessoryDisclosureIndicator;
    i.selectionStyle = PKTableViewCellSelectionStyleBlue;
    if (c.style == PKTableViewStylePlain) {
        rowIndex = e.row;
        var a = this.currentElements[rowIndex];
        var h = dataController.getTitleForItemWithAPDID(a);
        var g = dataController.getIconForItemWithAPDID(a);
        if (g && this.activeElement == "TOP_LEVEL_ITEM") {
            i.image = i.layer.appendChild(document.createElement("img"));
            i.image.setAttribute("src", g);
            i.image.setAttribute("class", "icon");
            i.layer.addClassName("topLevelCellWithImage");
        }
    } else {
        rowIndex = e.row;
        sectionIndex = e.section;
        var j = controller.tableViewTitleForHeaderInSection(c, sectionIndex);
        var a = this.currentElements[sectionIndex];
        if ("" == j) {
            var h = dataController.getTitleForItemWithAPDID(a);
        } else {
            var b = dataController.getChildrenAPDIDsForItemWithAPDID(a);
            var h = dataController.getTitleForItemWithAPDID(b[rowIndex]);
        }
    }
    if (this.activeElement == "TOP_LEVEL_ITEM" && localizationController.supportedLanguagesCount > 1 && rowIndex == this.currentElements.length) {
        a = "LOCALIZATION_CONTENT";
        h = "";
        i.layer.children[1].innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAATZJREFUeNqU0s9HRFEYxvG5cxPTDyVuylAiyiUiGpNoNYnSLqI/IFq1atMu/QGt2rVqU1pNSmlVWkRKEWkRESmlTAwxSn0fnsvddvg45/K+57zvOTeI4ziTGoNYRhF5POEMK7hJgrKe67GKHQd+WQ2PKHuzMJ20jj6MYBqzTpjBJAoYwpqCA8orMW/hGg8YcPI7WnHhEnsxhnEl7bHYwD0O8Ik2dOADL8hhDl2qREmvLLrdQwX9Dqz4pLxP60QT7pT0m/nfqGVdQoP6c2ntqXXg72TdjLc6N1nyVVdx7J5a8OxNq6m3O1F5E769SyfmfNVJT2Un6hKGMaWTDrHrepdw5R01evyXFPyW2zopedx51erS9n1y6FmbnuIWCwoOoyjS/I0jnEPljqLRvelJFrGJHwX/CTAAop9NZ356wJwAAAAASUVORK5CYII=" alt="Globe" />' + localizationController.localizedUIString("Change Language");
        i.layer.children[1].setAttribute("id", "localizationText");
        i.accessoryType = null;
    }
    if (this.activeElement == "TOP_LEVEL_ITEM" && ((localizationController.supportedLanguagesCount > 1 && rowIndex == this.currentElements.length + 1) || (localizationController.supportedLanguagesCount <= 1 && rowIndex == this.currentElements.length))) {
        a = "COPYRIGHT_PAGE_CONTENT";
        h = "";
        var d = dataController.getBodyForItemWithAPDID("COPYRIGHT_TOC_STRING");
        d = d.replace(/<\/p>/g, "<br />");
        d = d.replace(/<p.*?>/g, "");
        i.layer.children[1].innerHTML = d;
        i.layer.children[1].setAttribute("id", "trademarkText");
        i.accessoryType = null;
    }
    if (this.activeElement == "TOP_LEVEL_ITEM" && 1 == dataController.showVersionNumber) {
        var f = controller.tableViewNumberOfRowsInSection(c, e.section);
        if (rowIndex == f - 3) {
            a = "";
            h = "";
            i.accessoryType = null;
        }
        if (rowIndex == f - 2) {
            if (typeof(window.buildVersion) == "undefined") {
                buildVersion = "(unavailable)";
            }
            a = "";
            h = "mobile guide version '" + buildVersion + "'";
            i.layer.children[1].style.fontSize = "12px";
            i.layer.children[1].style.fontWeight = "normal";
            i.layer.children[1].style.paddingTop = "3px";
            i.layer.style.textAlign = "center";
            i.accessoryType = null;
        }
        if (rowIndex == f - 1) {
            a = "";
            h = "content version '" + dataController.databaseVersion + "'";
            i.layer.children[1].style.fontSize = "12px";
            i.layer.children[1].style.fontWeight = "normal";
            i.layer.children[1].style.paddingTop = "3px";
            i.layer.style.textAlign = "center";
            i.accessoryType = null;
        }
    }
    i.id = a;
    if (h != "") {
        i.text = h;
    }
    return i;
};
controller.tableViewTitleForHeaderInSection = function (a, d) {
    if (a.style == PKTableViewStylePlain) {
        return null;
    }
    var c = new Array();
    for (var b in this.currentElements) {
        var e = this.currentElements[b];
        if (1 == dataController.getFlattenStateForItemWithAPDID(e)) {
            c.push(dataController.getTitleForItemWithAPDID(e));
        } else {
            c.push("");
        }
    }
    return c[d];
};
controller.tableViewDidSelectAccessoryForRowAtPath = function (a, b) {
    controller.tableViewDidSelectRowAtPath(a, b);
};
controller.tableViewDidSelectRowAtPath = function (a, e) {
    if (a.style == PKTableViewStylePlain) {
        rowIndex = e.row;
        var f = this.currentElements[rowIndex];
        if (!f) {
            var d = a.delegate.tableViewCellForRowAtPath(a, e).id;
            if (d != "") {
                f = d;
            }
        }
    } else {
        rowIndex = e.row;
        sectionIndex = e.section;
        var b = controller.tableViewTitleForHeaderInSection(a, sectionIndex);
        var f = this.currentElements[sectionIndex];
        if ("" != b) {
            var c = dataController.getChildrenAPDIDsForItemWithAPDID(f);
            f = c[rowIndex];
        }
    }
    if (f) {
        this.navigateToElement(f);
    }
};
openCrossReference = function (a) {
    controller.navigateToElement(a);
};
controller.navigateToElement = function (e) {
    if (!dataController.isInitialized) {
        setTimeout(function () {
            controller.navigateToElement(e);
        },
        100);
        return;
    }
    this.activeElement = e;
    this.currentElements = dataController.getChildrenAPDIDsForItemWithAPDID(e);
    var d;
    if (this.activeElement == "LOCALIZATION_CONTENT") {
        d = localizationController.getLanguagesView();
    } else {
        d = new PKView();
        if (this.currentElements.length != 0) {
            var b = controller.createListWithAPDID(e);
            d.addSubview(b);
            d._listView = b;
        } else {
            var c = controller.createContentView();
            d.addSubview(c);
            d._contentView = c;
        }
        if (e != "TOP_LEVEL_ITEM") {
            d.addSubview(this.loadingView);
        }
    }
    var a = new PKNavigationItem(dataController.getTitleForItemWithAPDID(e), d);
    if (this.currentElements.length == 0) {
        a.titleView.layer.innerHTML = "";
    }
    a._apdid = controller.activeElement;
    if (0 == dataController.shouldHideSearchButton && !controller.searchBarButton) {
        controller.searchBarButton = new PKBarButtonItem();
        controller.searchBarButton.image = new PKImage("images/search.png");
        controller.searchBarButton.width = 35;
        controller.searchBarButton.addEventListener("controlTouchUpInside", this.showSearchView, false);
    }
    if (controller.searchBarButton) {
        a.rightBarButtonItem = controller.searchBarButton;
    }
    if (e == "TOP_LEVEL_ITEM" && "" != dataController.mainTOCBackButtonURL && "" != dataController.mainTOCBackButtonTitle) {
        if (!controller.mainTOCBackButton) {
            controller.mainTOCBackButton = new PKBarButtonItem(PKBarButtonItemTypeBack);
            controller.mainTOCBackButton.title = dataController.mainTOCBackButtonTitle;
            controller.mainTOCBackButton.addEventListener("controlTouchUpInside", function () {
                window.location = dataController.mainTOCBackButtonURL;
            },
            false);
        }
        if (controller.mainTOCBackButton) {
            a.leftBarButtonItem = controller.mainTOCBackButton;
        }
    }
    controller.navigation.pushNavigationItem(a, true);
    this.navigation.layer.style.backgroundImage = "";
};
controller.addVoiceOverButton = function () {
    if (!dataController.isInitialized) {
        setTimeout(function () {
            controller.addVoiceOverButton();
        },
        100);
        return;
    }
    var b = new XMLHttpRequest();
    var e = window.location.toString();
    var f = e.lastIndexOf("/");
    if (f != -1) {
        e = e.substring(0, f + 1);
    }
    e += "../voiceover/" + localizationController.language + "/index.html";
    b.open("GET", e, false);
    try {
        b.send(null);
    } catch(d) {
        b = null;
    }
    if (!b || b.status != 200) {
        console.log("No VoiceOver guide index available.");
        return;
    }
    if ("" == b.responseText) {
        console.log("No VoiceOver content available.");
        return;
    }
    var a = document.createElement("div");
    a.style.width = "0px";
    a.style.height = "0px";
    a.style.overflow = "hidden";
    a.id = "voiceOverButton";
    document.body.appendChild(a);
    document.body.insertBefore(a, document.body.firstChild);
    var c = document.createElement("input");
    c.type = "button";
    c.title = "Voice Over users click here.";
    c.setAttribute("onClick", "window.location = '" + e + "'");
    c.style.position = "absolute";
    c.style.zIndex = "1000";
    c.style.top = "-12px";
    a.appendChild(c);
    if (1 == dataController.shouldHideSearchButton && "" != dataController.mainTOCBackButtonURL) {
        c.style.right = "0px";
    } else {
        c.style.left = "-14px";
    }
};
controller.showSearchView = function () {
    var b = searchController.getSearchView();
    var a = new PKNavigationItem(localizationController.localizedUIString("Search"), b);
    a._isSearch = true;
    controller.navigation.pushNavigationItem(a, true);
};
controller.hideSearchView = function () {
    controller.navigation.popNavigationItem(true);
};
controller.showLanguagesView = function () {
    var b = localizationController.getLanguagesView();
    var a = new PKNavigationItem("Languages", b);
    controller.navigation.pushNavigationItem(a, true);
};
controller.hideLanguagesView = function () {
    controller.navigation.popNavigationItem(true);
};
controller.createListWithAPDID = function (b) {
    var a = new PKTableView();
    a.autoresizingMask = PKViewAutoresizingFlexibleWidth | PKViewAutoresizingFlexibleHeight;
    a.scrollIndicatorsColor = "#333";
    if (dataController.shouldFlatten && b != "TOP_LEVEL_ITEM") {
        a.style = PKTableViewStyleGrouped;
    } else {
        a.style = PKTableViewStylePlain;
    }
    a.dataSource = this;
    a.delegate = this;
    if (b == "TOP_LEVEL_ITEM") {
        a.reloadData();
        this.loadingView.removeFromSuperview();
    }
    return a;
};
controller.createContentView = function () {
    var a = new PKScrollView();
    a.autoresizingMask = PKViewAutoresizingFlexibleWidth | PKViewAutoresizingFlexibleHeight;
    a.horizontalScrollEnabled = false;
    a.scrollIndicatorsColor = "#333";
    a._isContent = true;
    a.layer.id = "contentScrollView";
    var b = document.createElement("div");
    b.className = "content";
    a.addSubview(new PKContentView(b));
    setTimeout(function () {
        updateOrientationFixImageSizes(1);
    },
    1);
    return a;
};
controller.errorLoadingGraphic = function (b) {
    var a = document.createElement("span");
    a.appendChild(document.createTextNode(" [ Missing image: " + b.alt));
    a.appendChild(document.createComment(b.src));
    a.appendChild(document.createTextNode(" ] "));
    b.parentNode.replaceChild(a, b);
};
controller.fixNavigationSize = function () {
    if (controller.navigation) {
        controller.navigation.size.height = parseInt(document.body.style.height, 10);
    }
};
controller.fixContentSize = function () {
    var c = controller.navigation.topItem.view.subviews[0];
    if (!c.contentOffset && !c.contentSize) {
        return;
    }
    var d = c.contentOffset.y;
    var a = c.contentSize.height;
    var b = -(d) / a;
    setTimeout(function () {
        controller.fixContentSizeOnDelay(b);
    },
    100);
};
controller.fixContentSizeOnDelay = function (a) {
    var c = controller.navigation.topItem;
    var b = c.view.subviews[0];
    if (b.subviews[0] && b.subviews[0].refreshSize) {
        b.subviews[0].refreshSize();
    }
    if (b.contentSize && c.view._isContent) {
        var d = (a * b.contentSize.height);
        b.setContentOffsetWithAnimation(new PKPoint(0, -d), false);
    }
};

function controllerInit() {
    setTimeout(function () {
        controller.init();
    },
    1);
}
window.addEventListener("load", controllerInit, false);
var dataController = {
    database: null,
    table: new Array(),
    titleTable: new Object(),
    childrenTable: new Object(),
    parentTable: new Object(),
    graphics: new Array(),
    graphicCacheFromJSON: null,
    isInitialized: 0,
    databaseVersion: 0,
    configurationSettings: new Object(),
    shouldFlatten: 0,
    shouldHideSearchButton: 0,
    mainTOCBackButtonURL: "",
    mainTOCBackButtonTitle: "",
    bookTitle: "",
    showVersionNumber: 0
};
dataController.init = function () {
    localizationController.localize();
    var a = localizationController.language;
    var f = window.location.href;
    this.dataFolder = f;
    this.dataFolder = this.dataFolder.substring(0, this.dataFolder.lastIndexOf("/"));
    this.dataFolder = this.dataFolder.substring(0, this.dataFolder.lastIndexOf("/"));
    this.dataFolder += "/Contents/" + a + "/";
    var e = this.dataFolder + "donotusedatabase.txt";
    var c = new XMLHttpRequest();
    c.open("GET", e, false);
    try {
        c.send(null);
    } catch(b) {
        c = null;
    }
    var g = "";
    if (!c || c.status != 200) {
        g = "datacontroller-database.js";
    } else {
        g = "datacontroller-json.js";
    }
    var d = document.createElement("script");
    d.setAttribute("src", "classes/" + g);
    document.body.appendChild(d);
};
dataController.fixNestedSingularChildren = function () {
    for (var b in dataController.childrenTable) {
        var f = dataController.childrenTable[b];
        if (1 != f.length) {
            continue;
        }
        var c = f[0];
        delete dataController.childrenTable[b];
        for (var d in dataController.childrenTable) {
            var e = dataController.childrenTable[d];
            for (var a = 0; a < e.length; a++) {
                if (e[a] == b) {
                    e[a] = c;
                }
            }
        }
    }
};
dataController.getChildrenAPDIDsForItemWithAPDID = function (b) {
    if (b == undefined) {
        b = "";
    }
    var a = this.childrenTable[b];
    if (!a) {
        a = new Array();
    }
    return a;
};
dataController.getTitleForItemWithAPDID = function (b) {
    if (b == "TOP_LEVEL_ITEM") {
        var a = dataController.bookTitle;
        if (!a || a.length == 0) {
            a = " ";
        }
        return a;
    }
    if (b == "COPYRIGHT_PAGE_CONTENT") {
        return "Copyright";
    }
    if (b == "") {
        return "ERROR! item missing apdid";
    }
    return this.titleTable[b];
};
dataController.getIconForItemWithAPDID = function (d) {
    if (d == "") {
        return "ERROR! item missing apdid";
    }
    for (var b in this.table) {
        var c = this.table[b];
        if (c.apdid == d) {
            var a = c.icon;
            a = a.replace("Art/", "../Contents/" + localizationController.language + "/Art/");
            return a;
        }
    }
};
dataController.getFlattenStateForItemWithAPDID = function (c) {
    if (c == "" || c == undefined) {
        return "";
    }
    for (var a in this.table) {
        var b = this.table[a];
        if (b.apdid == c) {
            return b.flatten;
        }
    }
};
dataController.getBodyForItemWithAPDID = function (d) {
    for (var a in this.table) {
        var c = this.table[a];
        if (c.apdid == d) {
            var b = c.content;
            b = b.replace(/Art\//g, "../Contents/" + localizationController.language + "/Art/");
            return b;
        }
    }
    return "";
};
dataController.getBase64ForImageAtPath = function (b) {
    for (var a in this.graphics) {
        var c = this.graphics[a];
        if (c.artPath == b) {
            return c.base64;
        }
    }
};
dataController.getParentAPDIDForItemWithAPDID = function (a) {
    if (a == "" || a == undefined) {
        return "";
    }
    return this.parentTable[a];
};
dataController.getBreadcrumbsForItemWithAPDID = function (c) {
    var b = "";
    var a = this.getParentAPDIDForItemWithAPDID(c);
    while (a != "TOP_LEVEL_ITEM") {
        b = this.getTitleForItemWithAPDID(a) + " > " + b;
        a = this.getParentAPDIDForItemWithAPDID(a);
    }
    b = b.substring(0, b.length - 2);
    return b;
};

function dataControllerInit() {
    dataController.init();
}
window.addEventListener("load", dataControllerInit, false);
var localizationController = {
    didLoadJSON: 0,
    language: null
};
localizationController.init = function () {
    if (this.didLoadJSON) {
        return;
    }
    var currentURL = window.location.href;
    dataFolder = currentURL;
    dataFolder = dataFolder.substring(0, dataFolder.lastIndexOf("/"));
    dataFolder = dataFolder.substring(0, dataFolder.lastIndexOf("/"));
    dataFolder += "/Contents/";
    var infoJsonRequest = new XMLHttpRequest();
    var infoJsonURL = dataFolder + "Info.json";
    infoJsonRequest.open("GET", infoJsonURL, false);
    try {
        infoJsonRequest.send(null);
    } catch(err) {
        infoJsonRequest = null;
    }
    if (!infoJsonRequest || infoJsonRequest.status != 200) {
        console.log("Error retrieving Info.json file.");
        this.supportedLanguages = new Array;
        return;
    }
    this.didLoadJSON = 1;
    var infoJsonContents = eval(infoJsonRequest.responseText);
    infoJsonContents = infoJsonContents[0];
    this.supportedLanguages = infoJsonContents;
    this.supportedLanguagesCount = 0;
    for (var key in this.supportedLanguages) {
        this.supportedLanguagesCount += 1;
    }
};
localizationController.localize = function () {
    localizationController.init();
    var e = window.location.search;
    if (e.length > 0) {
        e = e.substring(1, e.length);
    } else {
        e = null;
    }
    var d = new Object();
    if (e) {
        for (var c = 0; c < e.split("&").length; c++) {
            var b = e.split("&")[c];
            d[b.split("=")[0]] = b.split("=")[1];
        }
    }
    var f = d.lang;
    if (f) {
        this.language = f;
    } else {
        var a = navigator.language.substring(0, 2);
        if ("zh" == a) {
            if ("zh-cn" == navigator.language) {
                a = "zh_CN";
            } else {
                if ("zh-tw" == navigator.language) {
                    a = "zn_TW";
                }
            }
        } else {
            if ("pt" == a) {
                if ("pt-br" == navigator.language) {
                    a = "pt_BR";
                } else {
                    if ("pt-pt" == navigator.language) {
                        a = "pt";
                    }
                }
            }
        }
        if (a && this.supportedLanguages[a]) {
            this.language = a;
        } else {
            this.language = "en";
        }
    }
    if (this.language == "he") {
        document.getElementsByTagName("html")[0].setAttribute("dir", "rtl");
    }
};
localizationController.localizedUIString = function (c) {
    var b = localizationController.uiElements[localizationController.language];
    if (!b) {
        return c;
    }
    var a = b[c];
    if (!a) {
        return c;
    }
    return a;
};
localizationController.getLanguagesView = function () {
    localizationController.languages = new Array();
    localizationController.languageView = new PKContentView(document.createElement("div"));
    localizationController.languageView.autoresizingMask = PKViewAutoresizingFlexibleWidth | PKViewAutoresizingFlexibleHeight;
    localizationController.languageView.layer.style.backgroundColor = "white";
    localizationController.languageListView = new PKTableView();
    localizationController.languageListView.style = PKTableViewStylePlain;
    localizationController.languageListView.autoresizingMask = PKViewAutoresizingFlexibleWidth | PKViewAutoresizingFlexibleHeight;
    localizationController.languageListView.position = new PKPoint(0, 0);
    localizationController.languageView.addSubview(localizationController.languageListView);
    localizationController.languageListView.dataSource = localizationController;
    localizationController.languageListView.delegate = localizationController;
    localizationController.languageListView.reloadData();
    return localizationController.languageView;
};
localizationController.numberOfSectionsInTableView = function (a) {
    return 1;
};
localizationController.tableViewNumberOfRowsInSection = function (a, b) {
    return this.supportedLanguagesCount;
};
localizationController.tableViewCellForRowAtPath = function (b, c) {
    var a = new PKTableViewCell();
    var e = 0;
    for (var d in this.supportedLanguages) {
        if (e == c.row) {
            a.text = this.supportedLanguages[d];
            break;
        }
        e++;
    }
    return a;
};
localizationController.tableViewDidSelectRowAtPath = function (a, d) {
    var c = 0;
    for (var b in this.supportedLanguages) {
        if (c == d.row) {
            var e = b;
            break;
        }
        c++;
    }
    document.location = "?lang=" + e;
};

function localizationControllerInit() {
    setTimeout(function () {
        localizationController.init();
    },
    1);
    localizationController.uiElements = eval({
        bg: {
            Search: "Ð¢ÑŠÑ€ÑÐ¸",
            Cancel: "ÐžÑ‚ÐºÐ°Ð¶Ð¸",
            "Change Language": "ÐŸÑ€Ð¾Ð¼ÐµÐ½Ð¸ ÐµÐ·Ð¸Ðº",
            "Loading...": "Ð—Ð°Ñ€ÐµÐ¶Ð´Ð°Ð½Ðµ..."
        },
        cs: {
            Search: "Hledat",
            Cancel: "ZruÅ¡it",
            "Change Language": "ZmÄ›nit jazyk",
            "Loading...": "NaÄÃ­tÃ¡nÃ­â€¦"
        },
        da: {
            Search: "SÃ¸g",
            Cancel: "Annuller",
            "Change Language": "Skift sprog",
            "Loading...": "IndlÃ¦ser..."
        },
        de: {
            Search: "Suchen",
            Cancel: "Abbrechen",
            "Change Language": "Sprache wechseln",
            "Loading...": "Laden ..."
        },
        el: {
            Search: "Î‘Î½Î±Î¶Î®Ï„Î·ÏƒÎ·",
            Cancel: "Î‘ÎºÏÏÏ‰ÏƒÎ·",
            "Change Language": "Î‘Î»Î»Î±Î³Î® Î³Î»ÏŽÏƒÏƒÎ±Ï‚",
            "Loading...": "Î¦ÏŒÏÏ„Ï‰ÏƒÎ·..."
        },
        en: {
            Search: "Search",
            Cancel: "Cancel",
            "Change Language": "Change Language",
            "Loading...": "Loading..."
        },
        es: {
            Search: "Buscar",
            Cancel: "Cancelar",
            "Change Language": "Cambiar idioma",
            "Loading...": "Cargando..."
        },
        et: {
            Search: "Otsi",
            Cancel: "TÃ¼hista",
            "Change Language": "Muuda keelt",
            "Loading...": "Laadimine..."
        },
        fi: {
            Search: "Etsi",
            Cancel: "Kumoa",
            "Change Language": "Vaihda kieli",
            "Loading...": "Ladataan..."
        },
        fr: {
            Search: "Rechercher",
            Cancel: "Annuler",
            "Change Language": "Changer de langue",
            "Loading...": "Chargement..."
        },
        hr: {
            Search: "TraÅ¾i",
            Cancel: "PoniÅ¡ti",
            "Change Language": "Promijeni jezik",
            "Loading...": "UÄitavanje..."
        },
        hu: {
            Search: "Keresd",
            Cancel: "MÃ©gsem",
            "Change Language": "VÃ¡lts nyelvet",
            "Loading...": "BetÃ¶ltÃ©s..."
        },
        id: {
            Search: "Cari",
            Cancel: "Batalkan",
            "Change Language": "Ganti Bahasa",
            "Loading...": "Memuat..."
        },
        it: {
            Search: "Cerca",
            Cancel: "Annulla",
            "Change Language": "Cambia lingua",
            "Loading...": "Carico..."
        },
        ja: {
            Search: "æ¤œç´¢",
            Cancel: "ã‚­ãƒ£ãƒ³ã‚»ãƒ«",
            "Change Language": "è¨€èªžã‚’å¤‰æ›´",
            "Loading...": "èª­ã¿è¾¼ã¿ä¸­..."
        },
        ko: {
            Search: "ê²€ìƒ‰",
            Cancel: "ì·¨ì†Œ",
            "Change Language": "ì–¸ì–´ ë³€ê²½",
            "Loading...": "ë¡œë“œ ì¤‘..."
        },
        lt: {
            Search: "IeÅ¡koti",
            Cancel: "AtÅ¡aukti",
            "Change Language": "Pakeisti kalbÄ…",
            "Loading...": "Ä®keliama..."
        },
        lv: {
            Search: "MeklÄ“t",
            Cancel: "Atcelt",
            "Change Language": "MainÄ«t valodu",
            "Loading...": "Notiek ielÄde..."
        },
        me: {
            Search: "TraÅ¾i",
            Cancel: "Odustani",
            "Change Language": "Promjena jezika",
            "Loading...": "UÄitavanje..."
        },
        mk: {
            Search: "ÐŸÑ€ÐµÐ±Ð°Ñ€Ð°Ñ˜",
            Cancel: "ÐžÑ‚ÐºÐ°Ð¶Ð¸",
            "Change Language": "ÐŸÑ€Ð¾Ð¼ÐµÐ½Ð¸ Ñ˜Ð°Ð·Ð¸Ðº",
            "Loading...": "Ð’Ñ‡Ð¸Ñ‚ÑƒÐ²Ð°ÑšÐµ..."
        },
        my: {
            Search: "Cari",
            Cancel: "Batal",
            "Change Language": "Tukar Bahasa",
            "Loading...": "Memuat..."
        },
        nl: {
            Search: "Zoek",
            Cancel: "Annuleer",
            "Change Language": "Wijzig taal",
            "Loading...": "Laden..."
        },
        no: {
            Search: "SÃ¸k",
            Cancel: "Avbryt",
            "Change Language": "Endre sprÃ¥k",
            "Loading...": "Laster inn..."
        },
        pl: {
            Search: "Szukaj",
            Cancel: "Anuluj",
            "Change Language": "ZmieÅ„ jÄ™zyk",
            "Loading...": "WczytujÄ™..."
        },
        pt: {
            Search: "Pesquisar",
            Cancel: "Cancelar",
            "Change Language": "Alterar idioma",
            "Loading...": "A carregar..."
        },
        pt_BR: {
            Search: "Pesquisar",
            Cancel: "Cancelar",
            "Change Language": "Alterar idioma",
            "Loading...": "A carregar..."
        },
        ro: {
            Search: "CÄƒutare",
            Cancel: "Anulare",
            "Change Language": "Schimbare limbÄƒ",
            "Loading...": "ÃŽncÄƒrcare..."
        },
        ru: {
            Search: "Ð˜ÑÐºÐ°Ñ‚ÑŒ",
            Cancel: "ÐžÑ‚Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ",
            "Change Language": "Ð˜Ð·Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ ÑÐ·Ñ‹Ðº",
            "Loading...": "Ð—Ð°Ð³Ñ€ÑƒÐ·ÐºÐ°..."
        },
        sk: {
            Search: "VyhÄ¾adaÅ¥",
            Cancel: "ZruÅ¡iÅ¥",
            "Change Language": "ZmeniÅ¥ jazyk",
            "Loading...": "NaÄÃ­tava saâ€¦"
        },
        sv: {
            Search: "SÃ¶k",
            Cancel: "Avbryt",
            "Change Language": "Byt sprÃ¥k",
            "Loading...": "LÃ¤ser in..."
        },
        th: {
            Search: "à¸„à¹‰à¸™à¸«à¸²",
            Cancel: "à¸¢à¸à¹€à¸¥à¸´à¸",
            "Change Language": "à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¸ à¸²à¸©à¸²",
            "Loading...": "à¸à¸³à¸¥à¸±à¸‡à¹‚à¸«à¸¥à¸”..."
        },
        tr: {
            Search: "Ara",
            Cancel: "VazgeÃ§",
            "Change Language": "Dili DeÄŸiÅŸtir",
            "Loading...": "YÃ¼kleniyor..."
        },
        zh_CN: {
            Search: "æœç´¢",
            Cancel: "å–æ¶ˆ",
            "Change Language": "æ›´æ”¹è¯­è¨€",
            "Loading...": "æ­£åœ¨è½½å…¥â€¦"
        },
        zn_TW: {
            Search: "æœå°‹",
            Cancel: "å–æ¶ˆ",
            "Change Language": "æ›´æ”¹èªžè¨€",
            "Loading...": "æ­£åœ¨è¼‰å…¥â‹¯"
        }
    });
}
window.addEventListener("load", localizationControllerInit, false);
var searchController = {
    searchDelay: null
};
searchController.init = function () {
    this.searchResults = new Array();
};
searchController.getSearchView = function () {
    this.searchResults = new Array();
    this.searchView = new PKView();
    this.searchView.autoresizingMask = PKViewAutoresizingFlexibleWidth | PKViewAutoresizingFlexibleHeight;
    this.searchView.layer.style.backgroundColor = "white";
    this.searchBar = new PKSearchBar();
    this.searchBar.style = PKSearchBarStyleBlack;
    this.searchBar.showsCancelButton = true;
    this.searchBar.text = "";
    this.searchBar.placeholder = localizationController.localizedUIString("Search");
    this.searchBar.button.title = localizationController.localizedUIString("Cancel");
    this.searchBar.delegate = this;
    this.searchBar.autoresizingMask = PKViewAutoresizingFlexibleWidth;
    this.searchView.addSubview(this.searchBar);
    this.searchListView = new PKTableView();
    this.searchListView.style = PKTableViewStylePlain;
    this.searchListView.autoresizingMask = PKViewAutoresizingFlexibleWidth | PKViewAutoresizingFlexibleHeight;
    this.searchListView.position = new PKPoint(0, PKSearchBarHeight);
    this.searchListView.size = new PKSize(this.searchView.size.width, this.searchView.size.height - PKSearchBarHeight);
    this.searchView.addSubview(this.searchListView);
    this.searchListView.dataSource = this;
    this.searchListView.delegate = this;
    this.searchListView.reloadData();
    return this.searchView;
};
searchController.numberOfSectionsInTableView = function (a) {
    return 1;
};
searchController.tableViewNumberOfRowsInSection = function (a, b) {
    return this.searchResults.length;
};
searchController.tableViewCellForRowAtPath = function (b, c) {
    var e = this.searchResults[c.row];
    var d = dataController.getTitleForItemWithAPDID(e);
    var a = new PKTableViewCell(PKTableViewCellStyleSubtitle);
    a.text = d;
    a.detailedText = dataController.getBreadcrumbsForItemWithAPDID(e);
    a.accessoryType = PKTableViewCellAccessoryDisclosureIndicator;
    return a;
};
searchController.tableViewDidSelectAccessoryForRowAtPath = function (a, b) {
    searchController.tableViewDidSelectRowAtPath(a, b);
};
searchController.tableViewDidSelectRowAtPath = function (a, b) {
    var c = this.searchResults[b.row];
    if (!c) {
        return;
    }
    this.searchBar.editing = false;
    controller.navigateToElement(c);
};
searchController.searchBarTextDidChange = function (b, a) {
    clearTimeout(this.searchDelay);
    this.searchDelay = setTimeout(function () {
        dataController.performSearchWithQuery(a, searchController.didPerformSearch);
    },
    1000);
};
searchController.didPerformSearch = function (a) {
    searchController.searchResults = a;
    searchController.searchListView.reloadData();
    searchController.searchListView.setContentOffsetWithAnimation(new PKPoint(0, 0), false);
};
searchController.searchBarCancelButtonClicked = function (a) {
    controller.hideSearchView();
};
searchController.searchBarTextDidBeginEditing = function (a) {
    scrollTo(0, 0);
};

function searchControllerInit() {
    searchController.init();
}
window.addEventListener("load", searchControllerInit, false);

function updateOrientation() {
    if (null == document.body) {
        setTimeout(function () {
            updateOrientation();
        },
        1);
        return;
    }
    var a = window.innerHeight;
    if (a == 356 || a == 208) {
        a += 60;
    }
    switch (window.orientation) {
    case 0:
        document.body.setAttribute("class", "portrait");
        document.body.style.width = window.innerWidth + "px";
        document.body.style.height = a + "px";
        updateOrientationFixImageSizes(0);
        break;
    case 90:
    case -90:
        document.body.setAttribute("class", "landscape");
        document.body.style.width = window.innerWidth + "px";
        document.body.style.height = a + "px";
        updateOrientationFixImageSizes(0);
        break;
    }
    scrollTo(0, 0);
}
function updateOrientationFixImageSizes(f) {
    controller.fixNavigationSize();
    var c = document.getElementsByClassName("content");
    if (c.length == 0) {
        if (f) {
            setTimeout(function () {
                updateOrientationFixImageSizes(f);
            },
            1);
        }
        return;
    }
    var g = c[0].innerHTML;
    if (!g) {
        if (f) {
            setTimeout(function () {
                updateOrientationFixImageSizes(f);
            },
            1);
        }
        return;
    }
    var d = c[0].getElementsByTagName("img");
    for (var b = 0; b < d.length; b++) {
        var e = d[b];
        e.style.width = "";
        if (e.width == 0) {
            continue;
        }
        var a = e.width;
        if (window.orientation == 90 || window.orientation == -90) {
            e.style.width = (a * 1.5) + "px";
        } else {
            e.style.width = a + "px";
        }
    }
    controller.fixContentSize();
}
window.onorientationchange = updateOrientation;
updateOrientation();
var buildVersion = "2.0 (548)";
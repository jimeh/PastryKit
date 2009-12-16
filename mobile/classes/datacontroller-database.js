dataController.initDatabase = function () {
    try {
        if (!window.openDatabase) {
            alert("not supported");
        } else {
            var g = window.location.toString();
            var d = g.lastIndexOf("/");
            if (d != -1) {
                g = g.substring(0, d + 1);
            }
            var a = "User Guide - " + g;
            var c = "1.0";
            var b = "User Guide";
            var h = 65536;
            this.database = openDatabase(a, c, b, h);
        }
    } catch(f) {
        alert("Unknown error " + f + ".");
        return;
    }
    this.checkDatabaseVersion();
};
dataController.checkDatabaseVersion = function () {
    this.database.transaction(function (e) {
        var a = new XMLHttpRequest();
        var c = dataController.dataFolder + "version.txt";
        a.open("GET", c, false);
        try {
            a.send(null);
        } catch(b) {
            a = null;
        }
        if (!a || a.status != 200) {
            console.log("Error retrieving JSON Version file.");
            var d = "";
        } else {
            var d = a.responseText;
        }
        e.executeSql("SELECT * FROM " + localizationController.language + 'Config WHERE key="version"', [], function (h, f) {
            var g = f.rows.item(0).value;
            dataController.databaseVersion = g;
            if (g == d || d == "") {
                dataController.createDataStructure();
                dataController.createGraphicsDataStructure();
                return;
            }
            h.executeSql("DROP TABLE IF EXISTS " + localizationController.language + "Content;", [], null, dataController.errorHandler);
            h.executeSql("DROP TABLE IF EXISTS " + localizationController.language + "Config;", [], null, dataController.errorHandler);
            h.executeSql("DROP TABLE IF EXISTS " + localizationController.language + "Graphics;", [], null, dataController.errorHandler);
            dataController.updateDatabaseVersion(d);
        },


        function (g, f) {
            dataController.updateDatabaseVersion(d);
        });
    });
};
dataController.updateDatabaseVersion = function (a) {
    this.database.transaction(function (b) {
        dataController.databaseVersion = a;
        b.executeSql("CREATE TABLE " + localizationController.language + "Config (key TEXT NOT NULL, value TEXT NOT NULL);", [], null, dataController.errorHandler);
        b.executeSql("insert into " + localizationController.language + "Config (key, value) VALUES (?, ?);", ["version", a], null, dataController.errorHandler);
        dataController.createTable();
        dataController.createGraphicsTable();
    });
};
dataController.createTable = function () {
    this.database.transaction(function (transaction) {
        console.log("Loaded new JSON data into the Database.");
        var jsonRequest = new XMLHttpRequest();
        var jsonURL = dataController.dataFolder + "content.json";
        jsonRequest.open("GET", jsonURL, false);
        try {
            jsonRequest.send(null);
        } catch(err) {
            jsonRequest = null;
        }
        if (!jsonRequest || jsonRequest.status != 200) {
            console.log("Error retrieving JSON file.");
            return;
        }
        try {
            var jsonObject = jsonRequest.responseText;
            eval(jsonObject);
            dataController.graphicCacheFromJSON = graphicCache;
        } catch(err) {
            if (localizationController.language != "en") {
                document.location = "?lang=en";
            } else {
                alert("English content.json could not be parsed.");
            }
            return;
        }
        transaction.executeSql("CREATE TABLE " + localizationController.language + "Content (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, apdid TEXT NOT NULL, parentapdid TEXT NOT NULL, flatten TEXT NOT NULL, title TEXT NOT NULL, icon TEXT NOT NULL, content TEXT NOT NULL);", [], null, dataController.errorHandler);
        addItemsInArrayWithParentAPDID(jsonArray, "TOP_LEVEL_ITEM");

        function addItemsInArrayWithParentAPDID(array, parentAPDID) {
            for (var i in array) {
                var item = array[i];
                var flatten = 0;
                if (item.flatten && item.children && item.children.length != 0) {
                    flatten = 1;
                }
                var name = item.name;
                var icon = item.icon;
                var content = item.content;
                if (typeof(name) == "undefined") {
                    name = "";
                }
                if (typeof(icon) == "undefined") {
                    icon = "";
                }
                if (typeof(content) == "undefined") {
                    content = "";
                }
                addEntryToContentDatabase(item.apdid, parentAPDID, flatten, name, icon, content);
                if (item.children && item.children.length != 0) {
                    addItemsInArrayWithParentAPDID(item.children, item.apdid);
                }
            }
        }
        function addEntryToContentDatabase(apdid, parentapdid, flatten, title, icon, content) {
            transaction.executeSql("insert into " + localizationController.language + "Content (apdid, parentapdid, flatten, title, icon, content) VALUES (?, ?, ?, ?, ?, ?);", [apdid, parentapdid, flatten, title, icon, content], null, dataController.errorHandler);
        }
        for (var key in configurationSettings) {
            var value = configurationSettings[key];
            transaction.executeSql("insert into " + localizationController.language + "Config (key, value) VALUES (?, ?);", [key, value], null, dataController.errorHandler);
        }
        dataController.createDataStructure();
    });
};
dataController.createGraphicsTable = function () {
    this.database.transaction(function (d) {
        console.log("Loaded new Graphics data into the Database.");
        d.executeSql("CREATE TABLE " + localizationController.language + "Graphics (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, artPath TEXT NOT NULL, base64 TEXT NOT NULL);", [], null, dataController.errorHandler);
        var b = dataController.graphicCacheFromJSON;
        if (typeof(b) != "undefined") {
            for (var a in b) {
                var c = b[a];
                e(a, c);
            }
        }
        function e(g, f) {
            d.executeSql("insert into " + localizationController.language + "Graphics (artPath, base64) VALUES (?, ?);", [g, f], null, dataController.errorHandler);
        }
        dataController.createGraphicsDataStructure();
    });
};
dataController.createDataStructure = function () {
    this.database.transaction(function (a) {
        a.executeSql("select * from " + localizationController.language + "Content;", [], function (e, b) {
            for (var c = 0; c < b.rows.length; c++) {
                var d = b.rows.item(c);
                dataController.table.push(d);
                dataController.titleTable[d.apdid] = d.title;
                dataController.parentTable[d.apdid] = d.parentapdid;
                if (!dataController.childrenTable[d.parentapdid]) {
                    dataController.childrenTable[d.parentapdid] = new Array();
                }
                if (d.apdid != "COPYRIGHT_PAGE_CONTENT" && d.apdid != "COPYRIGHT_TOC_STRING") {
                    dataController.childrenTable[d.parentapdid].push(d.apdid);
                }
            }
            dataController.fixNestedSingularChildren();
            dataController.database.transaction(function (f) {
                f.executeSql("select * from " + localizationController.language + "Config;", [], function (k, g) {
                    for (var h = 0; h < g.rows.length; h++) {
                        var j = g.rows.item(h);
                        dataController.configurationSettings[j.key] = j.value;
                        if (j.key == "MenuStructure" && j.value == "Type=grouped,") {
                            dataController.shouldFlatten = 1;
                        }
                        if (j.key == "Search" && j.value == "disabled=true,") {
                            dataController.shouldHideSearchButton = 1;
                        }
                        if (j.key == "BackButtonURL" && j.value != "" && j.value != "BackButtonURL") {
                            dataController.mainTOCBackButtonURL = j.value;
                        }
                        if (j.key == "BackButtonTitle" && j.value != "" && j.value != "BackButtonTitle") {
                            dataController.mainTOCBackButtonTitle = j.value;
                        }
                        if (j.key == "BookTitle" && j.value != "") {
                            dataController.bookTitle = j.value;
                            document.title = dataController.bookTitle;
                        }
                        if (j.key == "ShowVersionNumber" && j.value == "1") {
                            dataController.showVersionNumber = 1;
                        }
                    }
                    dataController.isInitialized = 1;
                },
                dataController.errorHandler);
            });
        },
        dataController.errorHandler);
    });
};
dataController.createGraphicsDataStructure = function () {
    this.database.transaction(function (a) {
        a.executeSql("select * from " + localizationController.language + "Graphics;", [], function (d, b) {
            for (var c = 0; c < b.rows.length; c++) {
                dataController.graphics.push(b.rows.item(c));
            }
        },
        dataController.errorHandler);
    });
};
dataController.performSearchWithQuery = function (b, a) {
    if (b == "" || b.length < 2) {
        a(new Array());
        return;
    }
    b = b.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
    searchQueryArray = b.split(" ");
    searchQueryContentLikeClause = '( content LIKE "%' + searchQueryArray.join('%" AND content LIKE "%') + '%" )';
    searchQueryTitleLikeClause = '( title LIKE "%' + searchQueryArray.join('%" AND title LIKE "%') + '%" )';
    this.database.transaction(function (d) {
        var c = "SELECT * FROM " + localizationController.language + "Content WHERE " + searchQueryContentLikeClause + " OR " + searchQueryTitleLikeClause + " LIMIT 25";
        d.executeSql(c, [], function (j, e) {
            var h = new Array();
            for (var g = 0; g < e.rows.length; g++) {
                var f = e.rows.item(g).apdid;
                if (0 == dataController.getChildrenAPDIDsForItemWithAPDID(f).length) {
                    h.push(f);
                }
            }
            a(h);
        },
        dataController.errorHandler);
    });
};
dataController.errorHandler = function (b, a) {
    console.log("Error Handler: " + a.message + " (" + a.code + ")");
    if (-1 != a.message.indexOf("no such table")) {
        dataController.database.transaction(function (c) {
            c.executeSql("DROP TABLE IF EXISTS " + localizationController.language + "Content;", [], null, dataController.errorHandler);
            c.executeSql("DROP TABLE IF EXISTS " + localizationController.language + "Config;", [], null, dataController.errorHandler);
            c.executeSql("DROP TABLE IF EXISTS " + localizationController.language + "Graphics;", [], null, dataController.errorHandler);
            window.location.reload();
        });
    }
    return true;
};
dataController.initDatabase();
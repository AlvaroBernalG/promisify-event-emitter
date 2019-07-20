"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var index_1 = require("./index");
var log = console.log;
var assert = console.assert;
var wait = function (ms) { return new Promise(function (resolve, reject) { return setTimeout(resolve, ms); }); };
var events = new index_1["default"]();
var logWorks = function () {
    var works = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        works[_i] = arguments[_i];
    }
    return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, 'one'];
        });
    });
};
events.on('test', logWorks);
events.on('test', function (message) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, wait(300)];
            case 1:
                _a.sent();
                return [2 /*return*/, 'two'];
        }
    });
}); });
events.on('test', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, 'three'];
}); }); });
var evn = new index_1["default"]();
evn.on('double', function (m) { return __awaiter(_this, void 0, void 0, function () {
    var timeout;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                timeout = m.payload === 3 ? 1000 : 300;
                return [4 /*yield*/, wait(timeout)];
            case 1:
                _a.sent();
                return [2 /*return*/, m.payload * 2];
        }
    });
}); });
events.on('other', function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, wait(300)];
            case 1:
                _a.sent();
                return [2 /*return*/, 'other'];
        }
    });
}); });
events.on('other', function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, 'test'];
    });
}); });
(function start() {
    return __awaiter(this, void 0, void 0, function () {
        var res, doubleres;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    log('Starting Tests...');
                    return [4 /*yield*/, events.emit('test', { payload: 'yeap' })];
                case 1:
                    res = _a.sent();
                    assert(res.join(' ') === 'one two three', 'Result should have been one two three. Instead got [' + res.join(' ') + ']');
                    events.emit('other');
                    return [4 /*yield*/, evn.emit('double', { payload: 2 })];
                case 2:
                    doubleres = (_a.sent())[0];
                    assert(doubleres === 4, ' Result of double should have been 4. Instead got ', doubleres);
                    evn.emit('double', { payload: 3 }).then(function (e) { return log('The result of doublign 3 is ', e); });
                    evn.emit('double', { payload: 4 }).then(function (e) { return log('The result of doubling 4 is ', e); });
                    return [2 /*return*/];
            }
        });
    });
})();

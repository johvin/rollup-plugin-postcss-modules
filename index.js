"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("mz/fs");
const path = require("path");
const camelcase = require("camelcase");
const postcss = require("rollup-plugin-postcss");
const reserved = require("reserved-words");
function fixname(name) {
    const ccName = camelcase(name);
    return reserved.check(ccName) ? `$${ccName}$` : ccName;
}
const formatCSSDefinition = (name, classNames, manualInjectName) => `\
${classNames.filter(n => !/-/.test(n)).map(t => `export const ${t}: string`).join('\n')}
${manualInjectName ? `export const ${manualInjectName}: () => void\n` : ''}\
interface Namespace {
	${classNames.map(t => `${JSON.stringify(t)}: string,`).join('\n\t')}
}
declare const ${name}: Namespace
export default ${name}`;
function writeCSSDefinition(cssPath, classNames, manualInjectName) {
    return __awaiter(this, void 0, void 0, function* () {
        const name = fixname(path.basename(cssPath, '.css'));
        const definition = formatCSSDefinition(name, classNames, manualInjectName);
        const dPath = `${cssPath}.d.ts`;
        yield fs.writeFile(dPath, `${definition}\n`);
        return dPath;
    });
}
class CSSExports {
    constructor(writeDefinitions, manualInjectName = '') {
        this.definitionCB = (dPath) => __awaiter(this, void 0, void 0, function* () {
            if (typeof this.writeDefinitions === 'function') {
                yield Promise.resolve(this.writeDefinitions(dPath));
            }
            else {
                console.log(`${dPath} written`);
            }
        });
        this.getJSON = (id, exportTokens) => __awaiter(this, void 0, void 0, function* () {
            const ccTokens = {};
            for (const className of Object.keys(exportTokens)) {
                ccTokens[fixname(className)] = exportTokens[className];
                ccTokens[className] = exportTokens[className];
            }
            if (this.writeDefinitions) {
                const manualInjectName = (typeof this.manualInjectName === 'function' ? this.manualInjectName(id) : this.manualInjectName) || '';
                const dPath = yield writeCSSDefinition(id, Object.keys(ccTokens), manualInjectName);
                yield this.definitionCB(dPath);
            }
        });
        this.writeDefinitions = writeDefinitions;
        this.manualInjectName = manualInjectName;
    }
}
function eslintPluginPostCSSModules(options = {}) {
    const { plugins = [], writeDefinitions = false, modules = {}, namedExports = fixname, extract, manualInjectName = '' } = options, rest = __rest(options, ["plugins", "writeDefinitions", "modules", "namedExports", "extract", "manualInjectName"]);
    if (rest.getExport) {
        throw new Error("'getExport' is no longer supported.");
    }
    if (plugins.some(p => p.postcssPlugin === 'postcss-modules')) {
        throw new Error("'rollup-plugin-postcss-modules' provides a 'postcss-modules' plugin, you cannot specify your own. Use the `modules` config key for configuration.");
    }
    const modulesOptions = modules === true ? {} : modules;
    if (modulesOptions === false || modulesOptions.getJSON) {
        throw new Error("'rollup-plugin-postcss-modules' provides a 'postcss-modules' plugin and its `getJSON()`. You cannot specify `modules.getJSON`");
    }
    const { getJSON } = new CSSExports(writeDefinitions, !extract ? manualInjectName : '');
    return postcss(Object.assign({ plugins: [...plugins], modules: Object.assign({ getJSON }, modulesOptions), namedExports,
        extract,
        manualInjectName }, rest));
}
exports.default = eslintPluginPostCSSModules;
//# sourceMappingURL=index.js.map
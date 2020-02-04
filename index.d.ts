import * as postcss from 'rollup-plugin-postcss';
import { Plugin } from 'rollup';
export declare type DefinitionCB = (dPath: string) => void | PromiseLike<void>;
export interface Options extends postcss.Options {
    writeDefinitions?: boolean | DefinitionCB;
}
export default function eslintPluginPostCSSModules(options?: Options): Promise<Plugin>;

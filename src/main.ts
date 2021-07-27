import { readFileSync } from 'fs'
import { performance } from 'perf_hooks'
import replaceAsync from 'string-replace-async';
import {length} from 'stringz'

import * as _web from './web.js'
import * as _builtin from './builtin.js'

export const outputMode = (() => {
	let x = process.argv.find(i => i.startsWith('--mode='))
	return x ? x.split('=')[1] : fail('Mode not provided!') 
})()

const builtin = (() => {
	switch (outputMode) {
		case "web":
			return _web
		default:
			return _builtin
	}
})()

export const enum Importance {
	Anywhere = 0,
	ResolveChildren = 1,
	WillResolve = 2,
	RunAtEnd = 3
}

export interface Transformer {
	inline: boolean,
	importance: Importance;
	fn: (a:string, args?: string) => Promise<string>;
}

export function fail(msg:string, do_exit:boolean=true) {
	console.error('\u001b[1m\u001b[31m[ERROR]\u001b[0m '+msg)
	do_exit ? process.exit(1) : null
}

export function warn (msg: string) {
	console.error('\u001b[1m\u001b[33m[WARNING]\u001b[0m '+msg)
}

function filterObj(obj: Record<string, Transformer>, test_: (a: Transformer) => boolean) {
	return Object.fromEntries(Object.entries(obj).filter(([_, v]) => test_(v)))
}


async function useBlockTransformer(data: string, obj: TransformerList, append_args='') {
	if (Object.keys(obj).length <= 0) { return data }
	let regex=new RegExp(`[\t\ ]*#(${Object.keys(obj).map(x => x.toUpperCase().replace('_', '-')).join('|')})+([^\n]+)?([^]+?)#END \\1`, 'g')
	while(true) {
		data =  await replaceAsync(data, regex, async (match: string, tag: string, args: string, value: string) => {
			tag = tag.toLowerCase().replaceAll('-', '_')
			args = (args ?? '') + append_args
			try {
				return (obj[tag] ? obj[tag].fn(value, args) : value)
			} catch (err) {
				fail(`Transformer: ${tag} failed to transform: ${value} ~ ${err}`);
				return match
			}
		})
		if (!regex.test(data)) { break }
	}
	return data
}

type TransformerList = Record<string, Transformer>;
class Context {
	data: string;

	inlineTransformers: TransformerList;
	simpleBlockTransformers: TransformerList;
	complexBlockTransformers: TransformerList; 
	resolvedBlockTransformers: TransformerList;
	endBlockTransformers: TransformerList;

	constructor(file_path: string) {
		this.data = readFileSync(file_path, 'utf-8');
		this.inlineTransformers = filterObj(builtin,  (v) => v.inline && v.importance == 0)
		this.simpleBlockTransformers = filterObj(builtin, v => v.importance == 0 && !v.inline)
		this.complexBlockTransformers = filterObj(builtin, v => v.importance == 2)
		this.resolvedBlockTransformers =  filterObj(builtin, v => v.importance == 1)
		this.endBlockTransformers = filterObj(builtin, v => v.importance == 3)
	}
	
	preTransform() {
		if (outputMode == 'ascii') {
			warn("Using ascii only chars, in accordance with `--ascii`")
			this.data = this.data.replace(/[^\x00-\x7F]/g, "");
		}

		if (!(outputMode == 'ascii') && !process.argv.includes('--emoji-fix=no')) {
			warn("Stripping all emojis (they break boxes), to ignore use `--no-fix-emoji`")
			this.data = this.data.replace(/\p{Extended_Pictographic}/u, "")
		}

		this.data = this.data.replaceAll('\t', '        ') // Sorry tab gods
	}

	getLongest() {
		return this.data.split('\n').reduce((a, v) => length(v)>a?length(v):a, 0).toString()
	}

	async transform() {
		
		// Replace Emoji & Unicode (if --ascii)
		this.preTransform()

		// -- Inline Processing --
		const matchInline = /#(\w+) (.*)#/g 
		while (true) {
			this.data = await replaceAsync(this.data, matchInline, async (_, tag: string, value: string) => {
				tag = tag.toLowerCase()
				return (this.inlineTransformers[tag] ? this.inlineTransformers[tag].fn(value.trim()) : value)
			})
			if (!matchInline.test(this.data)) { break }
		}

		// -- Simple Processing --
		this.data = await useBlockTransformer(this.data, this.simpleBlockTransformers) 

		// -- Complex Processing -- 
		this.data = await useBlockTransformer(this.data, this.complexBlockTransformers) 

		// -- Relative Processing --
		this.data = await useBlockTransformer(this.data, this.resolvedBlockTransformers, this.getLongest()) 
		this.data = await useBlockTransformer(this.data, this.endBlockTransformers, this.getLongest())

	}
}

(async () => {
let instance = new Context(process.argv[2])

const start = performance.now()
await instance.transform()
const end = performance.now()

console.log(instance.data)
console.error(`Finished transforming in \u001b[1m${Math.floor(end-start)}\u001b[0mms`)
})()

import { promisify } from 'util'
import { exec as _exec } from 'child_process'
const exec = promisify(_exec)
import { writeFile, unlink } from 'fs/promises'
//@ts-ignore
import AsciiTable from 'ascii-table';
import { Transformer, fail, outputMode } from './main.js'
import { length, limit } from 'stringz';

const TAB =  '        '
const UNICODE = !(outputMode == 'ascii')

const BOX_CHARS = {
	v_fill: UNICODE ? '│' : '|',
	h_fill: UNICODE ? '─' : '-',
	h_top_corner_l: UNICODE ? '┌' : '+',
	h_top_corner_r: UNICODE ? '┐' : '+',
	h_bottom_corner_l: UNICODE ? '└' : '+',
	h_bottom_corner_r: UNICODE ? '┘' : '+',
	top_table_corner: '.',
	bottom_table_corner: '\''
}

export const sh_script: Transformer = {
	fn: async (input: string): Promise<string> => {
		let file_path = '/tmp/'+Number(new Date()) // TODO: Make better
		await writeFile(file_path, '#!/usr/bin/env bash\n'+input);
		let x;
		try {
			x = (await exec(`sh ${file_path}`)).stdout
		} catch(err) {
			fail('While executing embedded script: ' + err.stderr, false)
			x = input
		}
		unlink(file_path);
		return x
	},
	inline: false,
	importance: 0
}

export const code: Transformer = {
	fn: async (input: string, args:string = ""): Promise<string> => {
		const type = args.split(TAB)[0]
		return input.split('\n')/*.filter(x => x.trim().length > 0)*/.map((line, index) => {
			let block_indentation = ""
			if (args.includes("INDENT-PRE-INDEX")) {
				block_indentation = (line.match(/^\s*/) ?? ['']) [0]
				line = line.trim()
			}
			switch (type) {
				case 'long':
					return block_indentation + index + '│ ' + line
				default:
					return block_indentation + '> ' + line
			}
		}).join('\n')
	},
	inline: false,
	importance: 0
}

export const table: Transformer = {
	fn: async (input: string, args:string = ""): Promise<string> => {
		const columns = args.split(TAB)
		const table = new AsciiTable('')
		table.setHeading(...columns)
		table.setBorder(BOX_CHARS.v_fill, BOX_CHARS.h_fill, BOX_CHARS.top_table_corner, BOX_CHARS.bottom_table_corner)
		input.split('\n').forEach(row => table.addRow(...row.split(TAB)))
		return table.toString()
	},
	inline: false,
	importance: 0
}

export const list: Transformer = {
	fn: async (input: string, type:string = ""): Promise<string> => {
		switch (type) {
			case "number": {
				let i = 0
				return input.replace(/^-/gm, () => { i+=1; return i.toString() })
			}
			default:
				return input.replace(/^-/gm, length(type) > 0 ? type : '>')
		}
	},
	inline: false,
	importance: 0
}

// TOOD: merge center & preserve center
export const center: Transformer = {
	importance: 1,
	inline: false,
	fn: async (input: string, args: string = '') => {
		let longest_line = parseInt(args)
		return input.split('\n').map(line => limit(line, (longest_line+length(line))/2, ' ', 'left')).join('\n')
	}
}

export const preserve_center: Transformer = {
	importance: 3,
	inline: false,
	fn: async (input: string, args: string = '') => {
		const document_longest_line = parseInt(args.trim())
		const inputs = input.split('\n')
		const value_longest_line = inputs.reduce((a,v)=> a = length(v)>a?length(v):a, 0)
		return inputs.map(line => `${' '.repeat((document_longest_line+value_longest_line)/4)}${line}`).join('\n')
	}
}
export const box: Transformer = {
	fn: async (input: string, args: string= '') => {
		let lines = input.split('\n')
		
		let longest = lines.reduce((a,v)=>a=length(v)>a?length(v):a, 0)
		longest = 4 + longest + 4
		let end_line = BOX_CHARS.h_bottom_corner_l + BOX_CHARS.h_fill.repeat(longest+1) + BOX_CHARS.h_bottom_corner_r
		let start_line = BOX_CHARS.h_top_corner_l + limit(limit(args, (1+longest+length(args)) / 2, BOX_CHARS.h_fill, 'left'), longest+1, BOX_CHARS.h_fill, 'right') + BOX_CHARS.h_top_corner_r 
		
		lines = input.replace(/#RIGHT-ALIGN([^]+?)#END RIGHT-ALIGN/, (_, v:string) => {
			v=v.trim()
			return v.split('\n').map(l => limit(l, longest-4, ' ', 'left')).join('\n')
		}).split('\n')

		lines = lines.map(line => {
			return line.length>=longest ? line : BOX_CHARS.v_fill + '  ' + limit(line, longest-4, ' ', 'right') + '   ' + BOX_CHARS.v_fill
		})

		

		lines.unshift(start_line)
		lines.push(end_line)
		return lines.join('\n')
	},
	inline: false,
	importance: 2
}
//export { command, code, box, center }

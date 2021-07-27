import { table, sh_script, code, list } from './builtin.js'
import {  Transformer } from './main.js'
import { Importance } from './main'

// May remove later 
export const html_escape: Transformer = {
	inline: false,
	importance: Importance.ResolveChildren,
	fn: async (input: string): Promise<string> => {
		return input.replaceAll('<', '&lt;').replaceAll('>', '&gt;')
	}
}

export const center: Transformer = {
	importance: 1,
	inline: false,
	fn: async (input: string) => {
		return '<center>' + input + '</center>'
	}
}

export const preserve_center: Transformer = {
	importance: Importance.Anywhere,
	inline: false,
	fn: async (input: string) => {
			return '<div style=\'display:flex;justify-content:center;align-items:center;\'><div>' + input + '</div></div>'
	}
}

export const right_align: Transformer = {
	importance: Importance.Anywhere,
	inline: false,
	fn: async (input: string) => {
			return '<div style="text-align: right">' + input + '</div>'
	}
}

export const box: Transformer = {
	fn: async (input: string) => {
		return `<div style="border: 1px solid; padding: 8px 16px;">${input}</div>`
	},
	inline: false,
	importance: Importance.Anywhere 
}

export const auto_link: Transformer = {
	fn: async (input: string) => {
		return input.replace(/(?<!<a.*href=")(https?:\/\/[\w.\/]+)/g, (_, link: string) => {
			return `<a href="${link}">${link}</a>`
		})
	},inline:false, importance: Importance.Anywhere
}

export { table, code, sh_script, list }
